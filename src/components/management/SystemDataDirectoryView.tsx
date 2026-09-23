import { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  Search,
  ShieldCheck,
  Table,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { SystemDataDomain } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SystemDataDirectoryView() {
  const [domains, setDomains] = useState<SystemDataDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    setLoading(true);
    const res = await apiClient.getSystemDataDirectory();
    if (res?.success && res.directory) {
      setDomains(res.directory);
    }
    setLoading(false);
  };

  const filteredDomains = domains.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.domain.toLowerCase().includes(q) ||
      d.databaseTable.toLowerCase().includes(q) ||
      d.purpose.toLowerCase().includes(q) ||
      d.accessScope.toLowerCase().includes(q)
    );
  });

  const totalRecords = domains.reduce((sum, d) => sum + (d.recordCount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card to-muted/40 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
                <Database className="size-3" /> System Architecture & Storage Map
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                100% Supabase Postgres Live
              </span>
            </div>
            <h3 className="font-display text-xl font-black text-foreground">
              Institutional Data Directory ("Where is My Data?")
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Complete logical breakdown of institutional records, corresponding database tables, live record counts, access policies, and storage schemas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-border/80 bg-card px-3.5 py-2 text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Database Records</p>
              <p className="font-display text-lg font-black text-brand">{totalRecords.toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDirectory}
              className="rounded-2xl h-10 gap-1.5 font-bold text-xs"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Sync DB Counts
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search domain, table name, purpose, or access scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          Showing {filteredDomains.length} Data Domains
        </span>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredDomains.map((d, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-border/80 bg-card p-4 hover:border-brand/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Table className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-black text-foreground leading-tight">{d.domain}</h4>
                    <p className="font-mono text-[10px] text-brand font-bold">{d.databaseTable}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-black text-foreground shrink-0">
                  {d.recordCount} rows
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {d.purpose}
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Lock className="size-3 text-amber-500" />
                <span className="truncate max-w-[170px]" title={d.accessScope}>Scope: {d.accessScope}</span>
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="size-2.5" /> Live
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
