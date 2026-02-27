import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import fetch from "node-fetch";

// Helper to transform Shodan CVE data to our internal format
const transformShodanCve = (cve: any) => ({
  id: cve.cve_id,
  description: cve.summary,
  cvss: cve.cvss,
  epss: cve.epss,
  inKev: cve.kev,
  vulnerabilityClass: null, // Shodan API does not provide this
  affectedSoftware: cve.cpes || [],
  year: new Date(cve.published_time).getFullYear(),
  exploits: [], // Shodan API does not provide this
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.cves.list.path, async (req, res) => {
    try {
      const response = await fetch("https://cvedb.shodan.io/cves");
      if (response.ok) {
        const data = await response.json();
        const transformedData = data.map(transformShodanCve);
        res.json(transformedData);
      } else {
        res.status(response.status).json({ message: "Failed to fetch CVEs" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.cves.search.path, async (req, res) => {
    const cveId = req.params.id;
    try {
      const response = await fetch(`https://cvedb.shodan.io/cve/${cveId}`);
      if (response.ok) {
        const data = await response.json();
        const transformedData = transformShodanCve(data);
        res.json(transformedData);
      } else {
        res.status(response.status).json({ message: "CVE not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
