import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import type { Cve } from "@shared/schema";

// API Hook
export function useCves() {
  return useQuery({
    queryKey: [api.cves.list.path],
    queryFn: async () => {
      const res = await fetch(api.cves.list.path);
      if (!res.ok) throw new Error("Failed to fetch CVEs");
      return api.cves.list.responses[200].parse(await res.json());
    },
    staleTime: Infinity, // Static data, fetch once
  });
}

// Search Hook
export function useCveSearch(cves: Cve[] = []) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    hasExploit: false,
    inKev: false,
    minYear: 0,
    criticalOnly: false,
  });

  const fuse = useMemo(() => {
    return new Fuse(cves, {
      keys: [
        "id",
        "description",
        "vulnerabilityClass",
        "affectedSoftware",
        "exploits.name",
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [cves]);

  const results = useMemo(() => {
    let filtered = cves;

    // 1. Apply Search
    if (query.trim()) {
      filtered = fuse.search(query).map((result) => result.item);
    }

    // 2. Apply Filters
    return filtered.filter((cve) => {
      if (filters.hasExploit && cve.exploits.length === 0) return false;
      if (filters.inKev && !cve.inKev) return false;
      if (filters.minYear > 0 && cve.year < filters.minYear) return false;
      if (filters.criticalOnly) {
        // Assume critical is CVSS >= 9.0 or EPSS >= 0.5
        const isCritical = (cve.cvss || 0) >= 9.0 || (cve.epss || 0) >= 0.5;
        if (!isCritical) return false;
      }
      return true;
    });
  }, [cves, query, filters, fuse]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    totalCount: cves.length,
    filteredCount: results.length,
  };
}
