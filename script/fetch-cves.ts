/**
 * CVE Data Fetcher
 * Fetches real CVE data from NVD API and CISA KEV Catalog
 * Run with: npx tsx script/fetch-cves.ts
 * Uses curl for API requests
 */

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { execSync } from "child_process";

// Configuration
const CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";

// Output path
const OUTPUT_DIR = "client/public/api";
const OUTPUT_FILE = `${OUTPUT_DIR}/cves.json`;

interface KEVEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  shortDescription: string;
  knownRansomwareCampaignUse: string;
}

interface KEVResponse {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: KEVEntry[];
}

interface NVDCVE {
  cve: {
    id: string;
    descriptions: Array<{
      lang: string;
      value: string;
    }>;
    metrics?: {
      cvssMetricV31?: Array<{
        cvssData: {
          baseScore: number;
          baseSeverity: string;
        };
      }>;
      cvssMetricV30?: Array<{
        cvssData: {
          baseScore: number;
          baseSeverity: string;
        };
      }>;
      cvssMetricV2?: Array<{
        cvssData: {
          baseScore: number;
          baseSeverity: string;
        };
      }>;
    };
    weaknesses?: Array<{
      description: Array<{
        value: string;
      }>;
    }>;
    configurations?: Array<{
      nodes: Array<{
        cpeMatch?: Array<{
          criteria: string;
        }>;
      }>;
    }>;
    published: string;
    lastModified: string;
  };
}

interface NVDResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  vulnerabilities: NVDCVE[];
}

interface Exploit {
  id: string;
  source: string;
  name: string;
  url: string;
}

interface CVE {
  id: string;
  description: string;
  cvss: number | null;
  epss: number | null;
  inKev: boolean;
  vulnerabilityClass: string | null;
  affectedSoftware: string[];
  year: number;
  exploits: Exploit[];
}

function fetchWithCurl(url: string): any {
  try {
    const result = execSync(`curl -s "${url}"`, { 
      encoding: "utf-8",
      timeout: 30000,
      maxBuffer: 50 * 1024 * 1024
    });
    return JSON.parse(result);
  } catch (err: any) {
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
}

async function fetchCISAKEV(): Promise<Set<string>> {
  console.log("Fetching CISA KEV Catalog...");
  const data = fetchWithCurl(CISA_KEV_URL) as KEVResponse | null;
  
  if (!data) {
    console.log("  Failed to fetch KEV, using empty set");
    return new Set<string>();
  }
  
  const kevSet = new Set<string>();
  for (const vuln of data.vulnerabilities) {
    kevSet.add(vuln.cveID);
  }
  
  console.log(`  Found ${kevSet.size} CVEs in KEV catalog`);
  return kevSet;
}

async function fetchNVD(startIndex = 0, resultsPerPage = 100): Promise<{ cves: NVDCVE[]; totalResults: number }> {
  const url = `${NVD_API_URL}?startIndex=${startIndex}&resultsPerPage=${resultsPerPage}`;
  
  console.log(`Fetching NVD CVEs (startIndex: ${startIndex}, perPage: ${resultsPerPage})...`);
  
  try {
    const data = fetchWithCurl(url) as NVDResponse | null;
    
    if (!data) {
      return { cves: [], totalResults: 0 };
    }
    
    return {
      cves: data.vulnerabilities || [],
      totalResults: data.totalResults || 0,
    };
  } catch (err) {
    console.error(`  Error fetching from NVD: ${err}`);
    return { cves: [], totalResults: 0 };
  }
}

async function fetchAllNVDCVE(): Promise<NVDCVE[]> {
  let allCVE: NVDCVE[] = [];
  const perPage = 100;
  let totalResults = 0;
  
  // First request to get total count
  const firstBatch = await fetchNVD(0, perPage);
  totalResults = firstBatch.totalResults;
  allCVE = [...firstBatch.cves];
  
  console.log(`  Total CVEs in NVD: ${totalResults}`);
  
  // Limit to reasonable number to avoid long fetch times
  const maxCVEs = Math.min(totalResults, 500);
  const remaining = maxCVEs - perPage;
  
  if (remaining > 0) {
    const batches = Math.ceil(remaining / perPage);
    for (let i = 1; i <= batches; i++) {
      const startIndex = i * perPage;
      try {
        const batch = await fetchNVD(startIndex, perPage);
        allCVE = [...allCVE, ...batch.cves];
        console.log(`  Fetched ${allCVE.length}/${maxCVEs}`);
      } catch (err) {
        console.error(`Error fetching batch ${i}:`, err);
        break;
      }
    }
  }
  
  return allCVE;
}

function mapWeaknessToClass(weaknesses?: NVDCVE["cve"]["weaknesses"]): string | null {
  if (!weaknesses) return null;
  
  for (const weakness of weaknesses) {
    for (const desc of weakness.description) {
      const value = desc.value;
      if (value.includes("CWE-")) {
        const cweMap: Record<string, string> = {
          "CWE-94": "Code Injection",
          "CWE-77": "Command Injection",
          "CWE-78": "OS Command Injection",
          "CWE-79": "XSS",
          "CWE-89": "SQL Injection",
          "CWE-22": "Path Traversal",
          "CWE-287": "Authentication Bypass",
          "CWE-306": "Missing Authentication",
          "CWE-502": "Deserialization",
          "CWE-917": "Expression Injection",
          "CWE-352": "CSRF",
          "CWE-200": "Information Disclosure",
          "CWE-639": "Insecure Direct Object Reference",
          "CWE-918": "SSRF",
          "CWE-611": "XXE",
          "CWE-434": "Unrestricted Upload",
          "CWE-416": "Use After Free",
          "CWE-119": "Buffer Overflow",
          "CWE-787": "Buffer Overflow",
        };
        
        const cweId = value.split("-")[1];
        return cweMap[`CWE-${cweId}`] || value;
      }
    }
  }
  
  return null;
}

function extractAffectedSoftware(configs?: NVDCVE["cve"]["configurations"]): string[] {
  const softwareSet = new Set<string>();
  
  if (!configs) return [];
  
  for (const config of configs) {
    for (const node of config.nodes || []) {
      for (const cpe of node.cpeMatch || []) {
        const parts = cpe.criteria.split(":");
        if (parts.length >= 4) {
          const vendor = parts[3];
          const product = parts[4];
          if (vendor && product && vendor !== "*" && product !== "*") {
            softwareSet.add(`${vendor}:${product}`);
          }
        }
      }
    }
  }
  
  return Array.from(softwareSet).slice(0, 10);
}

function transformToAppFormat(nvdCVE: NVDCVE, inKEV: boolean): CVE {
  const cve = nvdCVE.cve;
  
  const desc = cve.descriptions.find(d => d.lang === "en")?.value || 
               cve.descriptions[0]?.value || 
               "No description available";
  
  let cvss: number | null = null;
  if (cve.metrics?.cvssMetricV31?.[0]) {
    cvss = cve.metrics.cvssMetricV31[0].cvssData.baseScore;
  } else if (cve.metrics?.cvssMetricV30?.[0]) {
    cvss = cve.metrics.cvssMetricV30[0].cvssData.baseScore;
  } else if (cve.metrics?.cvssMetricV2?.[0]) {
    cvss = cve.metrics.cvssMetricV2[0].cvssData.baseScore;
  }
  
  const yearMatch = cve.id.match(/CVE-(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date(cve.published).getFullYear();
  
  const affectedSoftware = extractAffectedSoftware(cve.configurations);
  const vulnerabilityClass = mapWeaknessToClass(cve.weaknesses);
  
  return {
    id: cve.id,
    description: desc.substring(0, 1000),
    cvss,
    epss: null,
    inKev: inKEV,
    vulnerabilityClass,
    affectedSoftware,
    year,
    exploits: [],
  };
}

async function main() {
  console.log("=== CVE Data Fetcher ===\n");
  
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
  
  // Fetch KEV catalog
  const kevSet = await fetchCISAKEV();
  
  // Fetch NVD CVEs
  console.log("\nFetching NVD CVEs...");
  const nvdCVE = await fetchAllNVDCVE();
  console.log(`  Fetched ${nvdCVE.length} CVEs from NVD`);
  
  // Transform and combine
  console.log("\nTransforming data...");
  const cves: CVE[] = [];
  
  for (const nvdItem of nvdCVE) {
    const cveId = nvdItem.cve.id;
    const inKEV = kevSet.has(cveId);
    const transformed = transformToAppFormat(nvdItem, inKEV);
    cves.push(transformed);
  }
  
  // Sort by CVSS score (highest first), then by year
  cves.sort((a, b) => {
    if (b.cvss !== null && a.cvss !== null) {
      return b.cvss - a.cvss;
    }
    return b.year - a.year;
  });
  
  // Limit to top 500 CVEs
  const finalCVE = cves.slice(0, 500);
  
  console.log(`\nTotal CVEs after filtering: ${finalCVE.length}`);
  console.log(`  - In KEV: ${finalCVE.filter(c => c.inKev).length}`);
  console.log(`  - With CVSS 9+: ${finalCVE.filter(c => (c.cvss || 0) >= 9).length}`);
  
  await writeFile(OUTPUT_FILE, JSON.stringify(finalCVE, null, 2));
  console.log(`\n✅ Data written to ${OUTPUT_FILE}`);
}

main().catch(console.error);
