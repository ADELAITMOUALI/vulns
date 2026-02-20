import { useState, useEffect } from "react";
import { Search, AlertTriangle, Shield } from "lucide-react";

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

export default function App() {
  const [cves, setCves] = useState<CVE[]>([]);
  const [filtered, setFiltered] = useState<CVE[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCves = async () => {
      try {
        const response = await fetch("./api/cves.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setCves(data);
        setFiltered(data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load CVEs: ${err}`);
        setLoading(false);
      }
    };
    loadCves();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(cves);
    } else {
      const term = search.toLowerCase();
      setFiltered(
        cves.filter(
          (cve) =>
            cve.id.toLowerCase().includes(term) ||
            cve.description.toLowerCase().includes(term) ||
            cve.affectedSoftware.some((sw) => sw.toLowerCase().includes(term))
        )
      );
    }
  }, [search, cves]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Vulnerability Search
          </h1>
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-slate-400 self-center" />
            <input
              type="text"
              placeholder="Search CVEs, software, descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading && <p className="text-slate-400">Loading CVEs...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <>
            <p className="text-slate-400 mb-4">
              Found {filtered.length} of {cves.length} CVEs
            </p>
            <div className="grid gap-4">
              {filtered.map((cve) => (
                <CVECard key={cve.id} cve={cve} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function CVECard({ cve }: { cve: CVE }) {
  const [expanded, setExpanded] = useState(false);
  const severity = cve.cvss || 0;
  const severityColor =
    severity >= 9.0
      ? "bg-red-900/50 border-red-700"
      : severity >= 7.0
        ? "bg-orange-900/50 border-orange-700"
        : severity >= 4.0
          ? "bg-yellow-900/50 border-yellow-700"
          : "bg-green-900/50 border-green-700";

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition ${severityColor}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-mono font-bold">{cve.id}</h2>
            {cve.inKev && (
              <span className="px-2 py-1 bg-red-900 border border-red-700 rounded text-xs font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> KEV
              </span>
            )}
            {cve.cvss && (
              <span className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono">
                CVSS: {cve.cvss.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 mb-2">
            {cve.vulnerabilityClass && `[${cve.vulnerabilityClass}] `}
            {cve.affectedSoftware.join(", ")}
          </p>
          <p className="text-sm text-slate-400 line-clamp-2">{cve.description}</p>
        </div>
        <span className="text-xs text-slate-500 ml-4">{cve.year}</span>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-sm text-slate-300 mb-3">{cve.description}</p>

          {cve.affectedSoftware.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">
                Affected Software
              </h4>
              <div className="flex flex-wrap gap-2">
                {cve.affectedSoftware.map((sw, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs"
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cve.exploits.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">
                Available Exploits
              </h4>
              <div className="space-y-2">
                {cve.exploits.map((exploit) => (
                  <a
                    key={exploit.id}
                    href={exploit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 hover:text-slate-100 transition"
                  >
                    {exploit.name} ({exploit.source})
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
