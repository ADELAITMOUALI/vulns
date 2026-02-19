import { useCves, useCveSearch } from "@/hooks/use-cves";
import { CommandPalette } from "@/components/CommandPalette";
import { CveCard } from "@/components/CveCard";
import { Loader2, ShieldAlert, Terminal, Activity, Crosshair } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: cves = [], isLoading, isError } = useCves();
  const { 
    query, 
    setQuery, 
    filters, 
    setFilters, 
    results, 
    totalCount, 
    filteredCount 
  } = useCveSearch(cves);

  // Stats for the header
  const kevCount = cves.filter(c => c.inKev).length;
  const criticalCount = cves.filter(c => (c.cvss || 0) >= 9).length;
  const exploitCount = cves.reduce((acc, curr) => acc + curr.exploits.length, 0);

  const handleFilterChange = (filter: string) => {
    switch(filter) {
      case 'kev': 
        setFilters(prev => ({ ...prev, inKev: !prev.inKev }));
        break;
      case 'exploit': 
        setFilters(prev => ({ ...prev, hasExploit: !prev.hasExploit }));
        break;
      case 'critical': 
        setFilters(prev => ({ ...prev, criticalOnly: !prev.criticalOnly }));
        break;
      case 'clear':
        setFilters({
          hasExploit: false,
          inKev: false,
          minYear: 0,
          criticalOnly: false,
        });
        setQuery("");
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-primary font-mono space-y-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <div className="text-sm tracking-widest uppercase animate-pulse">Initializing System...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-destructive font-mono">
        <div className="text-center space-y-2">
          <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold">System Connection Failed</h2>
          <p className="text-muted-foreground text-sm">Could not retrieve vulnerability database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="scanline" />
      <CommandPalette onSearch={setQuery} onFilterChange={handleFilterChange} />

      {/* Header / HUD */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-display font-bold text-lg leading-none tracking-tight">RED_TEAM_OS</h1>
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Vulnerability Index v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Total Indexed</span>
               <span className="text-foreground font-bold">{totalCount}</span>
             </div>
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-red-500/80 uppercase text-[10px] tracking-wider">Active KEV</span>
               <span className="text-red-400 font-bold">{kevCount}</span>
             </div>
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-green-500/80 uppercase text-[10px] tracking-wider">Exploits</span>
               <span className="text-green-400 font-bold">{exploitCount}</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8">
        
        {/* Search Bar Visual Placeholder (Real logic in CommandPalette) */}
        <div className="mb-8 relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Terminal className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            readOnly
            value={query}
            placeholder="Press Cmd+K to initialize search protocol..."
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-md leading-5 bg-card/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm font-mono cursor-pointer hover:bg-card/80 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
             <span className="text-xs text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.hasExploit || filters.inKev || filters.criticalOnly) && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {filters.hasExploit && (
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Exploit Available
              </span>
            )}
            {filters.inKev && (
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                CISA KEV
              </span>
            )}
            {filters.criticalOnly && (
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono rounded flex items-center gap-2">
                 <Activity className="w-3 h-3" />
                 Critical Only
              </span>
            )}
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Displaying {filteredCount} Records
          </span>
          <span className="text-xs font-mono text-primary animate-pulse">
            • SYSTEM ONLINE
          </span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
              <p className="text-muted-foreground font-mono">No vulnerabilities matching search criteria.</p>
              <button 
                onClick={() => handleFilterChange('clear')}
                className="mt-4 text-primary text-sm hover:underline font-mono"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            results.slice(0, 50).map((cve) => (
              <CveCard key={cve.id} cve={cve} />
            ))
          )}
          {results.length > 50 && (
             <div className="text-center py-8 text-xs text-muted-foreground font-mono opacity-50">
               ... {results.length - 50} more records hidden for performance ...
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
