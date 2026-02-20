import { useState, useEffect } from "react";
import { Search, AlertTriangle, Shield, ChevronDown, Zap, Target } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-gradient-to-b from-slate-900 to-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Vulnerability Hub
              </h1>
              <p className="text-sm text-slate-400 mt-1">Search and explore CVE vulnerabilities</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
            <div className="relative flex gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 focus-within:border-red-500/50 transition">
              <Search className="w-5 h-5 text-slate-400 self-center flex-shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search CVEs, software, descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-slate-400 mt-4">Loading CVEs...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Results
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Found <span className="font-bold text-red-400">{filtered.length}</span> of <span className="font-bold text-slate-300">{cves.length}</span> CVEs
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {filtered.length > 0 ? (
                filtered.map((cve) => (
                  <CVECard key={cve.id} cve={cve} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No CVEs found matching your search.</p>
                </div>
              )}
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
  
  const getSeverityColor = () => {
    if (severity >= 9.0) return { bg: "from-red-900/30 to-red-800/20", border: "border-red-700/50", text: "text-red-400", icon: "text-red-500" };
    if (severity >= 7.0) return { bg: "from-orange-900/30 to-orange-800/20", border: "border-orange-700/50", text: "text-orange-400", icon: "text-orange-500" };
    if (severity >= 4.0) return { bg: "from-yellow-900/30 to-yellow-800/20", border: "border-yellow-700/50", text: "text-yellow-400", icon: "text-yellow-500" };
    return { bg: "from-green-900/30 to-green-800/20", border: "border-green-700/50", text: "text-green-400", icon: "text-green-500" };
  };
  
  const colors = getSeverityColor();

  return (
    <div
      className={`group bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg p-6 cursor-pointer transition-all duration-300 hover:border-slate-600/50 hover:shadow-lg hover:shadow-red-900/10`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* CVE Header */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h2 className={`text-lg font-mono font-bold ${colors.text} group-hover:text-white transition`}>
              {cve.id}
            </h2>
            
            {/* KEV Badge */}
            {cve.inKev && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-900/40 border border-red-700/50 rounded-full text-xs font-bold text-red-300">
                <Shield className="w-3 h-3" />
                KEV
              </span>
            )}
            
            {/* CVSS Badge */}
            {cve.cvss && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.text} bg-slate-800/50 border ${colors.border} rounded-full text-xs font-mono font-bold`}>
                <Zap className="w-3 h-3" />
                {cve.cvss.toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Vulnerability Class & Software */}
          <div className="mb-3">
            <p className="text-sm text-slate-300">
              {cve.vulnerabilityClass && <span className="inline-block bg-slate-700/50 px-2 py-1 rounded text-xs mr-2 mb-2">{cve.vulnerabilityClass}</span>}
              <span className="text-slate-400">{cve.affectedSoftware.join(", ")}</span>
            </p>
          </div>
          
          {/* Description */}
          <p className="text-sm text-slate-400 line-clamp-2 group-hover:line-clamp-none transition">
            {cve.description}
          </p>
        </div>
        
        {/* Year & Expand Button */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500 font-semibold">{cve.year}</span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Full Description */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Description
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">{cve.description}</p>
          </div>

          {/* Affected Software */}
          {cve.affectedSoftware.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-3">Affected Software</h4>
              <div className="flex flex-wrap gap-2">
                {cve.affectedSoftware.map((sw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-full text-xs text-slate-300 transition"
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Exploits */}
          {cve.exploits.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Available Exploits
              </h4>
              <div className="space-y-2">
                {cve.exploits.map((exploit) => (
                  <a
                    key={exploit.id}
                    href={exploit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-orange-600/50 rounded-lg text-sm text-slate-300 hover:text-orange-300 transition group/link"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{exploit.name}</span>
                      <span className="text-xs text-slate-500 group-hover/link:text-orange-400 transition">{exploit.source}</span>
                    </div>
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
