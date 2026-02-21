import { useState, useEffect } from "react";
import { Search, Command, AlertTriangle, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showCommand, setShowCommand] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  useEffect(() => {
    const loadCves = async () => {
      try {
        const response = await fetch("./api/cves.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        // keep only CVEs from 2024 through 2026
        const recent = data.filter((c: CVE) => c.year >= 2024 && c.year <= 2026);
        setCves(recent);
        setFiltered(recent);
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

  // reset to first page when the filtered results change (fixes search showing counts but empty page)
  useEffect(() => {
    setPage(0);
  }, [filtered]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommand(!showCommand);
      }
      if (e.key === "Escape") {
        setShowCommand(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCommand]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = page * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const paginated = filtered.slice(start, end);

  return (
    <div className="min-h-screen bg-color-bg overflow-hidden relative">
      <div className="circuit-grid" />
      <div className="scanlines" />

      <motion.header className="relative z-10 border-b border-slate-700/30 glass-panel mx-4 mt-4 rounded-lg" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div className="mono font-bold text-2xl text-glow-green" whileHover={{ scale: 1.05 }}>
                VULNS
              </motion.div>
              <div className="text-sm text-slate-400">CVE Intelligence</div>
            </div>
            <motion.button
              onClick={() => setShowCommand(true)}
              className="flex items-center gap-2 px-3 py-2 rounded border border-slate-700/30 text-slate-400 hover:text-slate-200 text-sm transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Command className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-2 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-500">⌘K</kbd>
            </motion.button>
          </div>

          <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter CVEs, software, descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 mono bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </motion.div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="inline-block" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <AlertTriangle className="w-8 h-8 text-green-500" />
            </motion.div>
            <p className="text-slate-400 mt-4 mono">LOADING INTELLIGENCE...</p>
          </motion.div>
        )}

        {error && (
          <motion.div className="p-4 rounded border border-glow-red severity-critical bg-red-900/10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-red-400 mono">{error}</p>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-slate-400 text-sm mono">
                SHOWING <span className="text-glow-green font-bold">{filtered.length > 0 ? `${start + 1}-${end}` : 0}</span> of <span className="font-bold">{filtered.length}</span> (total {cves.length})
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page <= 0}
                  className="px-3 py-1 rounded bg-slate-800/50 text-slate-200 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  className="px-3 py-1 rounded bg-slate-800/50 text-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {paginated.length > 0 ? (
                  paginated.map((cve, idx) => (
                    <CVECard
                      key={cve.id}
                      cve={cve}
                      isExpanded={expandedId === cve.id}
                      onToggle={() => setExpandedId(expandedId === cve.id ? null : cve.id)}
                      index={start + idx}
                    />
                  ))
                ) : (
                  <motion.div className="text-center py-12 text-slate-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mono">NO MATCHES FOUND</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* pagination info for small screens */}
              {filtered.length > 0 && (
                <div className="mt-4 text-sm text-slate-400 mono">
                  Page {page + 1} / {pageCount}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showCommand && <CommandPalette close={() => setShowCommand(false)} />}
      </AnimatePresence>
    </div>
  );
}

function CVECard({
  cve,
  isExpanded,
  onToggle,
  index,
}: {
  cve: CVE;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const severity = cve.cvss || 0;
  const getSeverityClass = () => {
    if (severity >= 9.0) return "severity-critical";
    if (severity >= 7.0) return "severity-high";
    if (severity >= 4.0) return "severity-medium";
    return "severity-low";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      onClick={onToggle}
      className={`glass-panel p-6 border rounded-lg cursor-pointer transition-all ${getSeverityClass()} overflow-hidden`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <motion.h2 className="mono font-bold text-xl text-glow-green" whileHover={{ scale: 1.05 }}>
              {cve.id}
            </motion.h2>
            {cve.inKev && (
              <motion.span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-900/20 border border-glow-red rounded-full text-xs font-bold text-red-400" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <AlertTriangle className="w-3 h-3" /> KEV
              </motion.span>
            )}
            {cve.cvss && (
              <motion.span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-900/20 border border-glow-purple rounded-full mono text-xs font-bold text-purple-300" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                CVSS {cve.cvss.toFixed(1)}
              </motion.span>
            )}
          </div>

          <p className="text-sm text-slate-300 mb-2">
            {cve.affectedSoftware.slice(0, 3).join(" • ")}
            {cve.affectedSoftware.length > 3 && ` +${cve.affectedSoftware.length - 3}`}
          </p>
          <p className="text-sm text-slate-400 line-clamp-2">{cve.description}</p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="mono text-xs text-slate-500">{cve.year}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Zap className="w-5 h-5 text-purple-500" />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
            <div>
              <h3 className="text-xs uppercase font-bold text-glow-green mb-2 mono">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{cve.description}</p>
            </div>

            {cve.affectedSoftware.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-bold text-glow-purple mb-3 mono">Affected Software</h3>
                <div className="flex flex-wrap gap-2">
                  {cve.affectedSoftware.map((sw, i) => (
                    <motion.span key={i} className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-xs text-slate-300 mono" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}>
                      {sw}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {cve.exploits.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-bold text-red-400 mb-3 mono flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Exploits Available
                </h3>
                <div className="space-y-2">
                  {cve.exploits.map((exploit) => (
                    <motion.a
                      key={exploit.id}
                      href={exploit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-800/30 border border-slate-700/50 rounded hover:border-glow-purple transition"
                      whileHover={{ scale: 1.02, x: 4 }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-200 mono text-sm">{exploit.name}</span>
                        <span className="text-xs text-slate-500 mono">{exploit.source}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommandPalette({ close }: { close: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <motion.div className="absolute inset-0 backdrop-blur-sm" onClick={close} />
      <motion.div className="relative w-full max-w-2xl glass-panel border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <div className="p-4 border-b border-slate-700/30 flex items-center gap-3">
          <Command className="w-5 h-5 text-cyan-500" />
          <input type="text" placeholder="Filter CVEs (e.g., 'high severity', 'KEV only')..." className="flex-1 bg-transparent outline-none text-slate-100 mono text-sm placeholder-slate-500" autoFocus />
          <button onClick={close} className="text-slate-500 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          <motion.div className="p-3 rounded border border-slate-700/30 cursor-pointer hover:border-cyan-500/50 transition" whileHover={{ x: 4 }}>
            <p className="text-sm text-slate-200 font-semibold">High Severity (CVSS ≥ 7.0)</p>
            <p className="text-xs text-slate-500 mono">Show only critical vulnerabilities</p>
          </motion.div>
          <motion.div className="p-3 rounded border border-slate-700/30 cursor-pointer hover:border-cyan-500/50 transition" whileHover={{ x: 4 }}>
            <p className="text-sm text-slate-200 font-semibold">KEV Exploited</p>
            <p className="text-xs text-slate-500 mono">Show CISA KEV catalog items only</p>
          </motion.div>
          <motion.div className="p-3 rounded border border-slate-700/30 cursor-pointer hover:border-cyan-500/50 transition" whileHover={{ x: 4 }}>
            <p className="text-sm text-slate-200 font-semibold">With Exploits</p>
            <p className="text-xs text-slate-500 mono">Show CVEs with available exploits</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
