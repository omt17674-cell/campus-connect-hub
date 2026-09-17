import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  LogOut,
  MapPin,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { VisitorRecord, VehicleRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VisitorVehicleSecurityViewerProps {
  state: CampusState;
  onOpenGateModal?: () => void;
}

export function VisitorVehicleSecurityViewer({
  state,
  onOpenGateModal,
}: VisitorVehicleSecurityViewerProps) {
  const [activeTab, setActiveTab] = useState<"visitors" | "vehicles">("visitors");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "exited">("all");
  const [selectedVisitorPass, setSelectedVisitorPass] = useState<VisitorRecord | null>(null);

  // Compute metrics
  const activeVisitors = state.visitorRecords.filter((v) => v.status === "active");
  const parkedVehicles = state.vehicleRecords.filter((v) => v.status === "parked");
  const evVehicles = state.vehicleRecords.filter((v) => v.vehicleType === "ev");

  // Filtered Visitors
  const filteredVisitors = state.visitorRecords.filter((v) => {
    const matchesSearch =
      v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mobile.includes(searchQuery) ||
      (v.vehicleNumber && v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === "active") return v.status === "active";
    if (statusFilter === "exited") return v.status === "exited";
    return true;
  });

  // Filtered Vehicles
  const filteredVehicles = state.vehicleRecords.filter((veh) => {
    const matchesSearch =
      veh.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.ownerRollOrVisitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      veh.parkingBay.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "active") return veh.status === "parked";
    if (statusFilter === "exited") return veh.status === "exited";
    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    const isVis = activeTab === "visitors";
    const headers = isVis
      ? ["Visitor ID", "Full Name", "Mobile", "Organization", "Purpose", "Host Person", "ID Proof", "Entry Time", "Exit Time", "Status", "Vehicle No"]
      : ["Vehicle ID", "Plate Number", "Type", "Owner Name", "Owner Type", "Owner ID", "Parking Bay", "Entry Time", "Exit Time", "Status"];

    const rows = isVis
      ? state.visitorRecords.map((v) => [
          v.id,
          v.fullName,
          v.mobile,
          v.organization,
          v.purpose,
          v.personToMeet,
          v.idProofType,
          v.entryTime,
          v.exitTime || "Active",
          v.status,
          v.vehicleNumber || "None",
        ])
      : state.vehicleRecords.map((veh) => [
          veh.id,
          veh.vehicleNumber,
          veh.vehicleType,
          veh.ownerName,
          veh.ownerType,
          veh.ownerRollOrVisitorId,
          veh.parkingBay,
          veh.entryTime,
          veh.exitTime || "Parked",
          veh.status,
        ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Gate_Security_${isVis ? "Visitors" : "Vehicles"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xl space-y-5">
      {/* Header & Global Trigger */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
              Campus Security & Access Control
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
              OTP & Geo-Verified Gates
            </span>
          </div>
          <h2 className="font-display text-lg font-black text-foreground sm:text-xl">
            Visitor Management & Vehicle Parking Registry
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenGateModal && (
            <Button
              size="sm"
              onClick={onOpenGateModal}
              className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-md hover:opacity-95"
            >
              <Plus className="size-3.5 text-[#F2A93B]" />
              New Check-In / Gate Pass
            </Button>
          )}

          <Button
            onClick={handleExportCsv}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-bold"
          >
            <FileSpreadsheet className="size-3.5 text-brand" />
            Export Gate CSV
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Visitors on Campus</span>
          <p className="font-display text-2xl font-black text-foreground mt-0.5">
            {activeVisitors.length}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600">100% OTP & Geo-Verified</span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Vehicles Parked</span>
          <p className="font-display text-2xl font-black text-foreground mt-0.5">
            {parkedVehicles.length}
          </p>
          <span className="text-[10px] font-semibold text-muted-foreground">All Gates Monitored</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">EV & Green Vehicles</span>
          <p className="font-display text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
            {evVehicles.length}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600">Charging Bays Active</span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Security Compliance</span>
          <p className="font-display text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
            100%
          </p>
          <span className="text-[10px] font-semibold text-amber-600">Zero Unidentified Entries</span>
        </div>
      </div>

      {/* Sub-Tab Switcher (Visitors vs Vehicles) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-1 rounded-2xl bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("visitors")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black transition-all",
              activeTab === "visitors"
                ? "bg-[#1A3C6E] text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="size-3.5" />
            <span>External Visitors ({state.visitorRecords.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vehicles")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-black transition-all",
              activeTab === "vehicles"
                ? "bg-[#1A3C6E] text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Car className="size-3.5" />
            <span>Vehicles & Parking ({state.vehicleRecords.length})</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "all"
                ? "bg-[#1A3C6E] text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === "visitors" ? `Active on Campus (${activeVisitors.length})` : `Currently Parked (${parkedVehicles.length})`}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("exited")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "exited"
                ? "bg-slate-700 text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            Exited
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === "visitors"
              ? "Search by visitor name, mobile, organization, ID, or vehicle number..."
              : "Search by vehicle plate number, owner name, student roll no, or parking bay..."
          }
          className="h-9 w-full rounded-xl border border-border/80 bg-background pl-8 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-[#1A3C6E] focus:outline-none"
        />
      </div>

      {/* Table: External Visitors */}
      {activeTab === "visitors" && (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-card/60 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Visitor ID & Name</th>
                <th className="px-3 py-3">Organization & Purpose</th>
                <th className="px-3 py-3">Host & Department</th>
                <th className="px-3 py-3">Contact & ID Proof</th>
                <th className="px-3 py-3">Vehicle & Bay</th>
                <th className="px-3 py-3">Entry Time</th>
                <th className="px-3 py-3 text-right">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No visitor records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-card/40 transition-colors">
                    {/* Visitor ID & Name */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{vis.fullName}</div>
                      <div className="font-mono text-[10px] text-brand font-bold">{vis.id}</div>
                    </td>

                    {/* Organization & Purpose */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground">{vis.organization}</div>
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold text-brand">
                        {vis.purpose}
                      </span>
                    </td>

                    {/* Host & Department */}
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">{vis.personToMeet}</div>
                      <div className="text-[10px] text-muted-foreground">{vis.departmentToMeet}</div>
                    </td>

                    {/* Contact & ID Proof */}
                    <td className="px-3 py-3">
                      <div className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                        <Smartphone className="size-3 text-emerald-600" />
                        {vis.mobile}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {vis.idProofType} ({vis.idProofNumber || "Verified"})
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-3 py-3">
                      {vis.hasVehicle && vis.vehicleNumber ? (
                        <div>
                          <span className="font-mono font-bold text-foreground flex items-center gap-1">
                            <Car className="size-3 text-brand" /> {vis.vehicleNumber}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {vis.vehicleType === "ev" ? "⚡ EV Bay" : "Zone A Bay"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono text-[11px]">— No Vehicle —</span>
                      )}
                    </td>

                    {/* Entry Time */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="size-3 text-brand" />
                        {vis.entryTime.slice(11, 16)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{vis.entryTime.slice(0, 10)}</div>
                    </td>

                    {/* Status & Action */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVisitorPass(vis)}
                          className="h-7 rounded-lg text-[10px] font-bold"
                        >
                          <QrCode className="mr-1 size-3" /> Pass
                        </Button>

                        {vis.status === "active" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              campusStore.markVisitorExit(vis.id);
                              alert(`👋 Visitor ${vis.fullName} marked as exited.`);
                            }}
                            className="h-7 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                          >
                            <LogOut className="mr-1 size-3" /> Mark Exit
                          </Button>
                        ) : (
                          <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            Exited {vis.exitTime ? vis.exitTime.slice(11, 16) : ""}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table: Vehicles */}
      {activeTab === "vehicles" && (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-card/60 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Vehicle Plate & ID</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Owner / Driver</th>
                <th className="px-3 py-3">Owner Category & Roll/Pass</th>
                <th className="px-3 py-3">Assigned Parking Bay</th>
                <th className="px-3 py-3">Entry Time</th>
                <th className="px-3 py-3 text-right">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No vehicle records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((veh) => (
                  <tr key={veh.id} className="hover:bg-card/40 transition-colors">
                    {/* Vehicle Plate & ID */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-black text-foreground flex items-center gap-1.5">
                        <Car className="size-3.5 text-brand" />
                        {veh.vehicleNumber}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">{veh.id}</div>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                          veh.vehicleType === "ev"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : veh.vehicleType === "2_wheeler"
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        {veh.vehicleType === "ev"
                          ? "⚡ Electric EV"
                          : veh.vehicleType === "2_wheeler"
                          ? "2-Wheeler (Bike)"
                          : "4-Wheeler (Car)"}
                      </span>
                    </td>

                    {/* Owner Name */}
                    <td className="px-3 py-3">
                      <div className="font-bold text-foreground">{veh.ownerName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{veh.ownerContact}</div>
                    </td>

                    {/* Owner Category */}
                    <td className="px-3 py-3">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-foreground">
                        {veh.ownerType}
                      </span>
                      <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {veh.ownerRollOrVisitorId}
                      </div>
                    </td>

                    {/* Parking Bay */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin className="size-3 text-[#F2A93B]" />
                        {veh.parkingBay}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Authorized Bay</div>
                    </td>

                    {/* Entry Time */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground">{veh.entryTime.slice(11, 16)}</div>
                      <div className="text-[10px] text-muted-foreground">{veh.entryTime.slice(0, 10)}</div>
                    </td>

                    {/* Status & Action */}
                    <td className="px-3 py-3 text-right">
                      {veh.status === "parked" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            campusStore.markVehicleExit(veh.id);
                            alert(`🚗 Vehicle ${veh.vehicleNumber} marked as exited.`);
                          }}
                          className="h-7 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                        >
                          <LogOut className="mr-1 size-3" /> Release Exit
                        </Button>
                      ) : (
                        <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          Exited {veh.exitTime ? veh.exitTime.slice(11, 16) : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Visitor Digital Pass Modal */}
      {selectedVisitorPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-[#1A3C6E]/40 bg-card p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setSelectedVisitorPass(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="text-center border-b border-border/70 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F2A93B]">
                Official Digital Gate Pass
              </span>
              <h3 className="font-display text-xl font-black text-foreground">
                GSFC University Vadodara
              </h3>
              <p className="font-mono text-xs font-bold text-brand">{selectedVisitorPass.id}</p>
            </div>

            <div className="rounded-2xl bg-muted/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Visitor:</span>
                <span className="font-bold text-foreground">{selectedVisitorPass.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Organization:</span>
                <span className="font-semibold text-foreground">{selectedVisitorPass.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Purpose:</span>
                <span className="font-semibold text-foreground">{selectedVisitorPass.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Meeting Host:</span>
                <span className="font-semibold text-foreground">{selectedVisitorPass.personToMeet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Vehicle:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedVisitorPass.vehicleNumber || "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Entry Time:</span>
                <span className="font-semibold text-foreground">{selectedVisitorPass.entryTime}</span>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border/80 bg-background/80 p-3 text-center font-mono text-[11px] font-bold text-muted-foreground">
              Pass Hash: {selectedVisitorPass.qrPassCode}
            </div>

            <Button
              onClick={() => setSelectedVisitorPass(null)}
              className="w-full rounded-xl bg-[#1A3C6E] text-white text-xs font-bold"
            >
              Close Pass
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
