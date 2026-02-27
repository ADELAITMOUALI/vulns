import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import fetch from "node-fetch";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.cves.list.path, async (req, res) => {
    const cves = await storage.getCves();
    res.json(cves);
  });

  app.get(api.cves.search.path, async (req, res) => {
    const cveId = req.params.id;
    try {
      const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`);
      if (response.ok) {
        const data = await response.json();
        res.json(data);
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