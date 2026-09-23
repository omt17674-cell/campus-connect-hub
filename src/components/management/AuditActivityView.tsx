import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { ManagementAuditLog } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AuditActivityView() {
  const [logs, setLogs] = useState<ManagementAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    const res = await apiClient.getManagementAuditLogs({
      action: actionFilter !== "all" ? actionFilter : undefined,
    });
    if (res?.success && res.logs) {
      setLogs(res.logs);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.action || "").toLowerCase().includes(q) ||
      (l.actorName || "").toLowerCase().includes(q) ||
      (l.actorId || "").toLowerCase().includes(q) ||
      (l.targetType || "").toLowerCase().includes(q) ||
      (l.details || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
              <ShieldCheck className="size-3" /> Immutable Governance Logs
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Audit-Ready & Timestamped
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-foreground mt-1">
            System Activity & Management Audit Trail
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Verifiable record of administrative role modifications, mentor allocations, permission grants, and institutional transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="rounded-xl text-xs font-bold gap-1.5 h-8.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh Audit Trail
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search action, actor, target ID, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Audit Actions</option>
            <option value="ASSIGN_FACULTY_MENTOR">Assign Faculty Mentor</option>
            <option value="ROLE_CHANGE">Role Change</option>
            <option value="PERMISSION_GRANT">Permission Grant</option>
            <option value="PERMISSION_REVOKE">Permission Revoke</option>
            <option value="INTERNSHIP_APPROVE">Internship Approve</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-3 py-3">Administrative Action</th>
                <th className="px-3 py-3">Actor / Admin</th>
                <th className="px-3 py-3">Target Entity</th>
                <th className="px-3 py-3">Old Value → New Value</th>
                <th className="px-4 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <span>Loading audit logs from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-mono text-xs text-foreground font-bold">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-foreground">{log.actorName}</p>
                      <span className="font-mono text-[9px] text-muted-foreground">ID: {log.actorId}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-foreground capitalize">{log.targetType}</p>
                      <span className="font-mono text-[9px] text-brand font-semibold">{log.targetId}</span>
                    </td>
                    <td className="px-3 py-3">
                      {log.oldValue || log.newValue ? (
                        <div className="text-[11px] flex items-center gap-1">
                          <span className="text-muted-foreground line-through">{log.oldValue || "none"}</span>
                          <span>→</span>
                          <strong className="text-emerald-600">{log.newValue || "updated"}</strong>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground max-w-xs truncate" title={log.details}>
                        {log.details || "Administrative state updated"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
