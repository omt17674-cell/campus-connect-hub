import { useState } from "react";
import { Check, Download, Filter, Search, UserCheck, Users, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampusEvent, Registration } from "@/lib/types";
import { CampusState, campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface AttendeesManagerModalProps {
  event: CampusEvent;
  state: CampusState;
  onClose: () => void;
}

export function AttendeesManagerModal({
  event,
  state,
  onClose,
}: AttendeesManagerModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const eventRegistrations = state.registrations.filter((r) => r.eventId === event.id);

  const filteredRegistrations = eventRegistrations.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userRollNo.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    const rows = [
      ["Enrolment ID", "Student Name", "Department", "Registration Status", "Team Name", "Registered Timestamp"],
      ...eventRegistrations.map((r) => [
        r.userRollNo,
        r.userName,
        r.department,
        r.status,
        r.teamName || "Solo",
        r.registeredAt,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendees_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setStatus = (regId: string, status: Registration["status"]) => {
    campusStore.updateRegistrationStatus(regId, status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                Attendee Management
              </span>
              <span className="text-xs text-muted-foreground">
                {eventRegistrations.length} Total Registrations
              </span>
            </div>
            <h3 className="mt-1 font-display text-xl font-black text-foreground">
              {event.title}
            </h3>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-bold"
          >
            <Download className="size-3.5" />
            Export Attendees CSV
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by student name, roll number, team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-xl pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-1">
            {["all", "confirmed", "pending_approval", "waitlisted", "attended"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-colors",
                  statusFilter === st
                    ? "bg-[#1A3C6E] text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="border-b border-border/70 bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 font-bold">Student</th>
                  <th className="p-3 font-bold">Department</th>
                  <th className="p-3 font-bold">Registration / Team</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No student registrations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-muted/20">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{reg.userName}</div>
                        <div className="text-[10px] text-muted-foreground">{reg.userRollNo}</div>
                      </td>

                      <td className="p-3 text-muted-foreground">
                        {reg.department}
                      </td>

                      <td className="p-3">
                        {reg.isTeam ? (
                          <div>
                            <span className="font-bold text-brand">{reg.teamName}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {reg.teamMembers?.length || 3} Members
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Individual</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
                            reg.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : reg.status === "attended"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold"
                              : reg.status === "pending_approval"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : reg.status === "waitlisted"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              : "bg-rose-500/15 text-rose-600"
                          )}
                        >
                          {reg.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {reg.status === "pending_approval" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setStatus(reg.id, "confirmed")}
                                className="size-7 rounded-lg text-emerald-600 hover:bg-emerald-500/10"
                                title="Approve Registration"
                              >
                                <Check className="size-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setStatus(reg.id, "rejected")}
                                className="size-7 rounded-lg text-rose-600 hover:bg-rose-500/10"
                                title="Reject Registration"
                              >
                                <XCircle className="size-3.5" />
                              </Button>
                            </>
                          )}
                          {reg.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus(reg.id, "attended")}
                              className="h-7 text-[11px] font-bold text-emerald-600 hover:bg-emerald-500/10"
                            >
                              Mark Attended
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
