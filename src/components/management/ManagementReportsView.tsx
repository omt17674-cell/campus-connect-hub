import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Filter,
  RefreshCw,
  Search,
  Table,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const REPORT_TYPES = [
  { id: "students", title: "Student Roster & Mentorship Status", category: "Students" },
  { id: "faculty", title: "Faculty & Mentor Workload Roster", category: "Faculty" },
  { id: "mentor_assignments", title: "Faculty Mentor Allocations", category: "Mentorship" },
  { id: "mentorship_tasks", title: "Mentorship Task Control & Submissions", category: "Mentorship" },
];

export function ManagementReportsView() {
  const [selectedReportType, setSelectedReportType] = useState("students");
  const [reportData, setReportData] = useState<{ title: string; columns: string[]; rows: any[]; totalCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReport();
  }, [selectedReportType]);

  const loadReport = async () => {
    setLoading(true);
    const res = await apiClient.getManagementReports(selectedReportType);
    if (res?.success && res.report) {
      setReportData(res.report);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      toast.error("No report data available to export.");
      return;
    }

    const headers = reportData.columns.join(",");
    const rows = reportData.rows.map((row) =>
      reportData.columns
        .map((col) => {
          const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : "";
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Management_${selectedReportType}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Institutional report exported as CSV successfully.");
  };

  const filteredRows = (reportData?.rows || []).filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(r).some((val) => String(val || "").toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      {/* Report Selection Bar */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
              <FileSpreadsheet className="size-3" /> Institutional Reporting
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Direct Database Export
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-foreground mt-1">
            GSFC University Executive Management Reports
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Generate verifiable institutional reports, track faculty allocations, and export audit-ready CSV rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadReport}
            className="rounded-xl text-xs font-bold gap-1.5 h-8.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl text-xs font-bold gap-1.5 h-8.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm hover:brightness-110"
          >
            <Download className="size-3.5" /> Export CSV Roster
          </Button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {REPORT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedReportType(t.id)}
            className={cn(
              "rounded-xl px-3.5 py-2 font-bold transition-colors whitespace-nowrap text-xs",
              selectedReportType === t.id
                ? "bg-[#1A3C6E] text-white shadow-xs"
                : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search within report records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          Showing {filteredRows.length} Records
        </span>
      </div>

      {/* Report Data Table */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
              <tr>
                {(reportData?.columns || []).map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={reportData?.columns.length || 5} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <span>Generating report query from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={reportData?.columns.length || 5} className="px-4 py-12 text-center text-muted-foreground">
                    No report records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                    {(reportData?.columns || []).map((col, colIdx) => {
                      const val = row[col];
                      return (
                        <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
                          {col.includes("Date") || col.includes("Timestamp") ? (
                            <span className="font-mono text-muted-foreground">{String(val || "—")}</span>
                          ) : col.includes("Status") ? (
                            <span className={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-bold",
                              val === "active" || val === "Active" || val === "Assigned" || val === "Completed" ? "bg-emerald-500/15 text-emerald-600" :
                              val === "Unassigned" ? "bg-amber-500/15 text-amber-600" :
                              "bg-slate-200 dark:bg-slate-800 text-foreground"
                            )}>
                              {String(val || "—")}
                            </span>
                          ) : (
                            <span className="text-foreground">{String(val ?? "—")}</span>
                          )}
                        </td>
                      );
                    })}
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
