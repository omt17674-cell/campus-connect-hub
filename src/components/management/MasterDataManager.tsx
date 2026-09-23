import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Database,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  AcademicYearMaster,
  BranchMaster,
  CompanyMaster,
  CourseMaster,
  DepartmentMaster,
  FieldMaster,
  SemesterMaster,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MasterDataManager() {
  const [activeTab, setActiveTab] = useState<"years" | "departments" | "courses" | "branches" | "semesters" | "fields" | "companies">("departments");

  const [academicYears, setAcademicYears] = useState<AcademicYearMaster[]>([]);
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [courses, setCourses] = useState<CourseMaster[]>([]);
  const [branches, setBranches] = useState<BranchMaster[]>([]);
  const [semesters, setSemesters] = useState<SemesterMaster[]>([]);
  const [fields, setFields] = useState<FieldMaster[]>([]);
  const [companies, setCompanies] = useState<CompanyMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    setLoading(true);
    const res = await apiClient.getMasterData();
    if (res?.success && res.data) {
      setAcademicYears(res.data.academicYears || []);
      setDepartments(res.data.departments || []);
      setCourses(res.data.courses || []);
      setBranches(res.data.branches || []);
      setSemesters(res.data.semesters || []);
      setFields(res.data.fields || []);
      setCompanies(res.data.companies || []);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h3 className="font-display text-lg font-black text-foreground flex items-center gap-2">
            <Database className="size-5 text-brand" /> University Institutional Master Data
          </h3>
          <p className="text-xs text-muted-foreground">
            All dropdown options, academic years, branches, and fields are backed directly by the live Supabase database
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadMasterData}
          className="rounded-xl text-xs gap-1.5 h-8.5 font-bold"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh Master Tables
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/50 pb-2 overflow-x-auto text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("departments")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "departments" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <Building2 className="mr-1.5 size-3.5" /> Departments ({departments.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("years")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "years" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <Calendar className="mr-1.5 size-3.5" /> Academic Years ({academicYears.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("courses")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "courses" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <GraduationCap className="mr-1.5 size-3.5" /> Courses ({courses.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("branches")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "branches" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <Layers className="mr-1.5 size-3.5" /> Branches ({branches.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("semesters")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "semesters" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <Sparkles className="mr-1.5 size-3.5" /> Semesters ({semesters.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("fields")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "fields" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <ShieldCheck className="mr-1.5 size-3.5" /> Specialization Fields ({fields.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("companies")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "companies" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
          )}
        >
          <Building2 className="mr-1.5 size-3.5" /> Partner Companies ({companies.length})
        </Button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 1. Departments */}
          {activeTab === "departments" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold">
                    <th className="pb-3 pl-2">Department Code</th>
                    <th className="pb-3">Department Name</th>
                    <th className="pb-3">Affiliated Faculty / School</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {departments.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-brand">{d.code}</td>
                      <td className="py-3 font-semibold text-foreground">{d.name}</td>
                      <td className="py-3 text-muted-foreground">{d.school}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          Active Master
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Academic Years */}
          {activeTab === "years" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold">
                    <th className="pb-3 pl-2">Academic Year</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {academicYears.map((ay) => (
                    <tr key={ay.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pl-2 font-bold text-foreground">{ay.yearName}</td>
                      <td className="py-3">
                        <span className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                          ay.isCurrent ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"
                        )}>
                          {ay.isCurrent ? "Current Active Year" : "Archived Year"}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {ay.startDate ? `${ay.startDate} to ${ay.endDate}` : "Full Academic Calendar"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Fields */}
          {activeTab === "fields" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {fields.map((f) => (
                <div key={f.id} className="rounded-2xl border border-border/60 bg-card/50 p-3.5 space-y-1">
                  <p className="font-bold text-foreground text-xs">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">Department: {f.departmentId || "SOT / GSFC"}</p>
                </div>
              ))}
            </div>
          )}

          {/* 4. Companies */}
          {activeTab === "companies" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold">
                    <th className="pb-3 pl-2">Company Name</th>
                    <th className="pb-3">Industry</th>
                    <th className="pb-3">Contact Person & Email</th>
                    <th className="pb-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pl-2 font-bold text-foreground">{c.name}</td>
                      <td className="py-3 text-muted-foreground">{c.industry}</td>
                      <td className="py-3">
                        <p className="font-semibold text-foreground">{c.contactPerson || "HR Coordinator"}</p>
                        <p className="text-[10px] text-muted-foreground">{c.contactEmail || "official@partner.com"}</p>
                      </td>
                      <td className="py-3 text-muted-foreground">{c.location || "Vadodara, Gujarat"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
