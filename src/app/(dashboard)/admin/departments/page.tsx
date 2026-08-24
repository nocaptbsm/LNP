// StatSkill AI — MoSPI Departmental Overviews Board

"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Loader2,
  UserCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { getDepartmentalGapAnalysis, getDepartmentEmployees } from "../actions";

interface DepartmentOverviewItem {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
  averageCompliance: number;
  totalHours: number;
}

export default function AdminDepartmentsPage() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentOverviewItem[]>([]);
  
  // Selected Department Details Drawer State
  const [selectedDept, setSelectedDept] = useState<DepartmentOverviewItem | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadDepartmentsOverview = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Fetch all departments
      const { data: deptList } = await (supabase as any).from("departments").select("*");
      if (!deptList) return;

      // 2. Fetch profiles count and group
      const { data: profiles } = await (supabase as any).from("profiles").select("id, department_id, role");
      const employeesList = (profiles as any[])?.filter((p: any) => p.role === "employee") || [];

      // 3. Fetch hours group
      const { data: progress } = await (supabase as any).from("user_course_progress").select("hours_spent, user_id");

      // 4. Load gap analysis to calculate average current vs required for compliance
      const gapStats = await getDepartmentalGapAnalysis();

      // Compile department objects
      const compiled = (deptList as any[]).map((d: any) => {
        const deptEmployees = employeesList.filter((p: any) => p.department_id === d.id);
        const employeeCount = deptEmployees.length;

        // Sum hours for employees in this department
        const empIds = new Set(deptEmployees.map((e: any) => e.id));
        const totalHours = (progress as any[])
          ?.filter((p: any) => empIds.has(p.user_id))
          .reduce((acc: number, curr: any) => acc + (curr.hours_spent || 0), 0) || 0;

        // Compliance aggregation
        const deptGaps = gapStats.filter((g: any) => g.department_id === d.id);
        let matchCount = 0;
        let checkedCount = 0;

        deptGaps.forEach((g: any) => {
          checkedCount++;
          if (Number(g.average_current_level) >= Number(g.average_required_level)) {
            matchCount++;
          }
        });

        const averageCompliance = checkedCount > 0 
          ? Math.round((matchCount / checkedCount) * 100) 
          : 75; // default fallback if empty

        return {
          id: d.id,
          name: d.name,
          code: d.code,
          employeeCount,
          averageCompliance,
          totalHours,
        };
      });

      setDepartments(compiled);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load department capacities list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartmentsOverview();
  }, []);

  const handleOpenDepartmentDetails = async (dept: DepartmentOverviewItem) => {
    setSelectedDept(dept);
    setLoadingEmployees(true);
    try {
      const roster = await getDepartmentEmployees(dept.id);
      
      // Calculate a match score for each employee
      const compiledRoster = roster.map((emp: any) => {
        // Simple mock calculations based on competency counts
        const competencyCount = emp.competencies?.length || 0;
        const metCount = emp.competencies?.filter((c: any) => c.current_level >= 3).length || 0;
        const matchPercent = competencyCount > 0 ? Math.round((metCount / competencyCount) * 100) : 60;

        return {
          ...emp,
          matchPercent,
        };
      });

      setEmployees(compiledRoster);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee details.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading MoSPI departments list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Departmental Overviews Board
        </h1>
        <p className="text-sm text-muted-foreground">
          Organizational map of divisions inside MoSPI. Audit capacity indices, training statistics, and staff qualifications by department.
        </p>
      </div>

      {/* Departments Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-md transition-all border border-border">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs font-semibold bg-primary/5 text-primary border-primary/20">
                  {dept.code}
                </Badge>
                <Badge className="bg-[#0b1a30] text-white text-[10px] font-mono">
                  Compliance: {dept.averageCompliance}%
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-2">{dept.name}</CardTitle>
              <CardDescription className="text-xs">
                Official Ministry Division
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Roster Size</p>
                    <p className="text-sm font-bold font-mono mt-0.5">{dept.employeeCount} officers</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Study Hours</p>
                    <p className="text-sm font-bold font-mono mt-0.5">{dept.totalHours} hrs completed</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleOpenDepartmentDetails(dept)}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs text-muted-foreground"
                >
                  Inspect Staff Roster
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roster details slide-over dialog */}
      <Dialog open={selectedDept !== null} onOpenChange={(open) => !open && setSelectedDept(null)}>
        <DialogContent className="max-w-4xl p-6 overflow-y-auto max-h-[85vh]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {selectedDept?.name} ({selectedDept?.code}) Staff Roster
            </DialogTitle>
            <DialogDescription className="text-xs">
              Audit profiles, target compliance indexes, and capacity building statistics for department officers
            </DialogDescription>
          </DialogHeader>

          {/* Search bar inside Roster */}
          <div className="flex items-center gap-2 py-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, email, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Badge variant="outline" className="text-xs">
              Count: {filteredEmployees.length}
            </Badge>
          </div>

          {loadingEmployees ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-mono">Loading staff profiles...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-medium bg-muted/20 rounded-xl border border-dashed">
              No matching employees registered in this department.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border mt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase border-b">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3 text-center">Compliance score</th>
                    <th className="p-3 text-center">Self assessed competencies</th>
                    <th className="p-3 text-right">Email ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-700 dark:text-slate-300">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {emp.full_name}
                      </td>
                      <td className="p-3">{emp.designation || "N/A"}</td>
                      <td className="p-3 text-center font-bold font-mono text-[#0b1a30]">
                        {emp.matchPercent}%
                      </td>
                      <td className="p-3 text-center font-mono">{emp.competencies?.length || 0} / 14</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{emp.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
