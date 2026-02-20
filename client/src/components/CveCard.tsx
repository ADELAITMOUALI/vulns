import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  Terminal, 
  Github, 
  Database, 
  Globe 
} from "lucide-react";
import type { Cve, Exploit } from "@shared/schema";
import clsx from "clsx";

interface CveCardProps {
  cve: Cve;
}

export function CveCard({ cve }: CveCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine severity color
  const severityColor = (score: number | null) => {
    if (!score) return "text-gray-500 border-gray-500/20 bg-gray-500/10";
    if (score >= 9.0) return "text-red-500 border-red-500/20 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
    if (score >= 7.0) return "text-orange-500 border-orange-500/20 bg-orange-500/10";
    if (score >= 4.0) return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
    return "text-green-500 border-green-500/20 bg-green-500/10";
  };

  const hasExploits = cve.exploits.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "group relative overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/40",
        expanded ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      )}
    >
      {/* KEV Indicator Ribbon */}
      {cve.inKev && (
        <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
        </div>
      )}

      {/* Main Header Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between p-4"
      >
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            className="text-muted-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h3 className="font-mono text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {cve.id}
              </h3>
              
              {/* Badges */}
              <div className={clsx("px-2 py-0.5 rounded text-xs font-mono font-bold border", severityColor(cve.cvss))}>
                CVSS: {cve.cvss?.toFixed(1) || "N/A"}
              </div>
              
              {cve.epss && cve.epss > 0.1 && (
                <div className="hidden sm:block px-2 py-0.5 rounded text-xs font-mono border border-purple-500/30 text-purple-400 bg-purple-500/10">
                  EPSS: {(cve.epss * 100).toFixed(1)}%
                </div>
              )}

              {cve.inKev && (
                <div className="px-2 py-0.5 rounded text-xs font-mono border border-red-500/50 text-red-400 bg-red-500/10 flex items-center gap-1 animate-pulse">
                  <Shield className="w-3 h-3" /> KEV
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground line-clamp-1 font-mono opacity-80">
               {cve.vulnerabilityClass ? `[${cve.vulnerabilityClass}] ` : ''} {cve.affectedSoftware[0] || "Unknown Software"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {hasExploits && (
             <div className="flex items-center gap-1.5 text-xs font-mono text-green-400">
               <Terminal className="w-4 h-4" />
               <span className="hidden sm:inline">{cve.exploits.length} Exploits</span>
             </div>
           )}
           <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{cve.year}</span>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-black/20"
          >
            <div className="p-4 space-y-4">
              <div className="prose prose-invert max-w-none text-sm text-muted-foreground font-sans leading-relaxed border-l-2 border-primary/20 pl-4">
                {cve.description}
              </div>

              {cve.affectedSoftware.length > 0 && (
                <div className="space-y-2">
                   <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider font-mono">Affected Software</h4>
                   <div className="flex flex-wrap gap-2">
                     {cve.affectedSoftware.map((sw, i) => (
                       <span key={i} className="px-2 py-1 rounded bg-secondary/50 text-secondary-foreground text-xs font-mono border border-white/5">
                         {sw}
                       </span>
                     ))}
                   </div>
                </div>
              )}

              {hasExploits && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-500" /> 
                    Available Exploits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cve.exploits.map((exploit) => (
                      <ExploitItem key={exploit.id} exploit={exploit} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ExploitItem({ exploit }: { exploit: Exploit }) {
  const getIcon = (source: string) => {
    switch(source) {
      case 'github': return <Github className="w-3.5 h-3.5" />;
      case 'exploit-db': return <Database className="w-3.5 h-3.5" />;
      case 'metasploit': return <Terminal className="w-3.5 h-3.5" />;
      default: return <Globe className="w-3.5 h-3.5" />;
    }
  };

  return (
    <a 
      href={exploit.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-2 rounded border border-border bg-background/50 hover:bg-white/5 hover:border-primary/50 transition-all group no-underline"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-muted-foreground group-hover:text-primary transition-colors">
          {getIcon(exploit.source)}
        </span>
        <span className="text-xs font-mono text-muted-foreground truncate group-hover:text-foreground transition-colors">
          {exploit.name || exploit.id}
        </span>
      </div>
      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
