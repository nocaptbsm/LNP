// StatSkill AI — MoSPI Workforce Analytics Dashboard

"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Award,
  Users,
  AlertTriangle,
  History,
  Sparkles,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { getWorkforceAnalyticsSummary, getCompetencyDeficitIndex, getRecentActivities } from "../actions";

export default function AdminAnalyticsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  // Stats States
  const [summary, setSummary] = useState({
    employeeCount: 0,
    totalHours: 0,
    quizPassRate: 0,
    complianceRate: 72,
  });
  const [deficits, setDeficits] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const summaryData = await getWorkforceAnalyticsSummary();
      setSummary(summaryData);

      const deficitData = await getCompetencyDeficitIndex();
      setDeficits(deficitData);

      const recentActs = await getRecentActivities(12);
      setActivities(recentActs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load official analytical reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading capacity analytics...</p>
      </div>
    );
  }

  // Domain aggregates for Radar Chart
  const domainAggregates = [
    { domain: "Official Stats", current: 2.8, required: 3.5 },
    { domain: "Data Science", current: 2.1, required: 3.4 },
    { domain: "Professional", current: 3.1, required: 3.6 },
    { domain: "Management", current: 2.9, required: 3.2 },
  ];

  // Top Deficit Lists (Gaps larger than 0)
  const topCriticalDeficits = deficits.filter((d) => d.deficit > 0).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Workforce Analytics Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Aggregated statistics comparing current employee competency levels to target designation profiles across all departments.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance */}
        <Card className="stat-card">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Target Compliance
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {summary.complianceRate}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Meet designation goals</p>
            </div>
          </CardContent>
        </Card>

        {/* Employees */}
        <Card className="stat-card">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Workforce
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {summary.employeeCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Registered officers</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card className="stat-card">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Training Hours
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {summary.totalHours} hrs
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Logged on courses</p>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Pass Rate */}
        <Card className="stat-card">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#0b1a30]/10 flex items-center justify-center flex-shrink-0 text-[#0b1a30]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Exam Pass Rate
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1">
                {summary.quizPassRate}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">On certified AI quizzes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytical Visualizers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deficits Deficit Bar Chart (2 columns) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Critical Competency Deficits
            </CardTitle>
            <CardDescription className="text-xs">
              Visualizes the average gap (Required minus Current) by competency across the workforce.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deficits.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 4]} />
                  <YAxis dataKey="competency_code" type="category" width={50} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px" }}
                    formatter={(val: any) => [`Gap: ${val} levels`, "Deficit"]}
                  />
                  <Bar dataKey="deficit" fill="#F4A261" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Domain Radar (1 column) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Domain Performance Radar</CardTitle>
            <CardDescription className="text-xs">
              Workforce capabilities compared to designation goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <div className="h-[280px] w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={75} data={domainAggregates}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" style={{ fontSize: "10px", fontWeight: "bold" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar
                    name="Current Avg"
                    dataKey="current"
                    stroke="#0b1a30"
                    fill="#0b1a30"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Required Avg"
                    dataKey="required"
                    stroke="#F4A261"
                    fill="#F4A261"
                    fillOpacity={0.1}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Tables: Deficits & Activity Logs */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Critical Gaps Table List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-1.5">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Top Deficit Areas
            </CardTitle>
            <CardDescription className="text-xs">
              Highest capacity gap metrics requiring intervention
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            {topCriticalDeficits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">All competency criteria met!</p>
            ) : (
              <div className="divide-y text-xs">
                {topCriticalDeficits.map((d, idx) => (
                  <div key={d.competency_id} className="px-4 py-3 hover:bg-muted/10 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">{d.competency_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({d.competency_code})</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{d.domain_name}</p>
                    </div>

                    <div className="text-right space-y-0.5 flex-shrink-0">
                      <Badge variant="destructive" className="text-[10px] py-0 px-1 font-mono">
                        Gap: -{d.deficit}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Avg: {d.average_current} / Req: {d.average_required}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Activity Logs (2 Columns) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-1.5">
              <History className="w-5 h-5 text-primary" />
              Unified Capacity Activity Feed
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time audit log of training enrollments, completions, and certifications across MoSPI
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No capacity building logs recorded yet.</p>
            ) : (
              <div className="divide-y max-h-[350px] overflow-y-auto text-xs">
                {activities.map((act) => (
                  <div key={act.id} className="px-4 py-3 hover:bg-muted/10 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {act.profile?.full_name}
                        </span>
                        <span>•</span>
                        <span>{act.profile?.designation || "Officer"}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1 flex-shrink-0">
                      <Badge variant="secondary" className="text-[9px] uppercase font-mono py-0 px-1">
                        {act.activity_type.replace("_", " ")}
                      </Badge>
                      <p className="text-[9px] text-muted-foreground font-mono">
                        {new Date(act.created_at).toLocaleDateString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
