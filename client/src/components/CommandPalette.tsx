import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, ShieldAlert, Terminal, Zap, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
}

export function CommandPalette({ onSearch, onFilterChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-primary/20 bg-card shadow-2xl shadow-primary/10"
          >
            <Command className="w-full">
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="mr-2 h-5 w-5 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex h-14 w-full bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground text-foreground font-mono"
                  onValueChange={(val) => {
                    if (!val.startsWith(">")) {
                      onSearch(val);
                    }
                  }}
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground font-mono">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Quick Filters" className="text-muted-foreground font-mono text-xs px-2 py-1.5">
                  <Command.Item
                    onSelect={() => {
                      onFilterChange("kev");
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center rounded-md px-2 py-3 text-sm aria-selected:bg-primary/20 aria-selected:text-primary transition-colors"
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Show KEV (Known Exploited)</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      onFilterChange("exploit");
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center rounded-md px-2 py-3 text-sm aria-selected:bg-primary/20 aria-selected:text-primary transition-colors"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Show Exploitable Only</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      onFilterChange("critical");
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center rounded-md px-2 py-3 text-sm aria-selected:bg-primary/20 aria-selected:text-primary transition-colors"
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    <span>Show Critical (CVSS 9+)</span>
                  </Command.Item>
                  <Command.Item
                     onSelect={() => {
                       onFilterChange("clear");
                       setOpen(false);
                     }}
                     className="flex cursor-pointer items-center rounded-md px-2 py-3 text-sm aria-selected:bg-primary/20 aria-selected:text-primary transition-colors"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Clear All Filters</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
