import { z } from "zod";

// We use simple Zod schemas since this app is designed to be static-first
// and relies on pre-aggregated JSON datasets instead of a traditional DB.

export const exploitSchema = z.object({
  id: z.string(),
  source: z.enum(['exploit-db', 'github', 'metasploit', 'trickest']),
  url: z.string(),
  name: z.string(),
});

export const cveSchema = z.object({
  id: z.string(), // e.g. CVE-2024-0001
  description: z.string(),
  cvss: z.number().nullable(),
  epss: z.number().nullable(), // probability score
  inKev: z.boolean(), // CISA KEV status
  exploits: z.array(exploitSchema),
  vulnerabilityClass: z.string().nullable(), // RCE, LFI, SSRF, SQLi, etc.
  affectedSoftware: z.array(z.string()),
  year: z.number(),
});

export type Exploit = z.infer<typeof exploitSchema>;
export type Cve = z.infer<typeof cveSchema>;
