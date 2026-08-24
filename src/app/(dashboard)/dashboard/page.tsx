// StatSkill AI — Employee Dashboard Home

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  GraduationCap,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/constants";
import type { ProfileWithDepartment } from "@/types";
import { getCompetencyProfileData } from "../competency/actions";
import { CompetencyRadarChart } from "@/components/charts/radar-chart";

export const metadata = {
  title: "Dashboard — StatSkill AI",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .eq("id", user.id)
    .single();

  const p = profile as unknown as ProfileWithDepartment | null;

  // Fetch real competency profile analytics for this user
  const compData = await getCompetencyProfileData(user.id);

  // Current time greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl gradient-navy p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">{greeting}</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {p?.full_name || "Welcome"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
              {p?.role && (
                <Badge
                  variant="secondary"
                  className="bg-white/15 text-white border-0 hover:bg-white/20"
                >
                  {ROLE_LABELS[p.role]}
                </Badge>
              )}
              {p?.designation && <span>{p.designation}</span>}
              {p?.department && (
                <>
                  <span>·</span>
                  <span>{p.department.name}</span>
                </>
              )}
            </div>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/assessments/take" />}
            className="bg-saffron hover:bg-saffron/90 text-navy font-semibold border-0 shadow-md gap-2 flex-shrink-0"
          >
            <Target className="w-4 h-4" />
            {compData.totalCompetenciesAssessed === 0
              ? "Start Self-Assessment"
              : "Retake Assessment"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Competency Target
                </p>
                <p className="text-3xl font-bold font-mono mt-1 text-primary">
                  {compData.totalCompetenciesAssessed === 0 ? "—" : `${compData.overallScorePercentage}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {compData.totalCompetenciesAssessed === 0
                    ? "Assessment required"
                    : `${compData.totalCompetenciesAssessed} skills evaluated`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Critical Gaps
                </p>
                <p className="text-3xl font-bold font-mono mt-1 text-destructive">
                  {compData.criticalGapsCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Skills -2 levels below target
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Learning Hours
                </p>
                <p className="text-3xl font-bold font-mono mt-1">0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This quarter
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Courses Completed
                </p>
                <p className="text-3xl font-bold font-mono mt-1">0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  iGOT & NSSTA
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Competency Overview — 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Competency Profile Overview
                </CardTitle>
                <CardDescription>
                  Current skills vs target levels required for {compData.userDesignation}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/competency" />}
                className="gap-1 text-xs"
              >
                View Matrix
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {compData.totalCompetenciesAssessed === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Baseline Assessment Required
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Complete your baseline self-assessment to render your interactive radar chart and view your competency gap analysis.
                </p>
                <Button
                  nativeButton={false}
                  render={<Link href="/assessments/take" />}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Start Assessment
                </Button>
              </div>
            ) : (
              <CompetencyRadarChart domains={compData.domainOverviews} />
            )}
          </CardContent>
        </Card>

        {/* Skill Gaps — 1 column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Top Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compData.topSkillGaps.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {compData.totalCompetenciesAssessed === 0
                  ? "Take an assessment to identify skill gaps."
                  : "All target competency levels met!"}
              </div>
            ) : (
              <div className="space-y-4">
                {compData.topSkillGaps.map((gap) => (
                  <div key={gap.competency_id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium truncate max-w-[170px]">
                        {gap.competency_name}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        L{gap.current_level} / L{gap.required_level}
                      </span>
                    </div>
                    <Progress
                      value={(gap.current_level / gap.required_level) * 100}
                      className="h-2"
                    />
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                      Gap: -{gap.gap} {gap.gap === 1 ? "level" : "levels"}
                    </p>
                  </div>
                ))}

                <Separator />
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/competency" />}
                  className="w-full text-xs gap-1"
                >
                  View All Skill Gaps
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Learning & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recommended Courses (Phase 3 preview) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-saffron" />
                AI Learning Recommendations
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Phase 3
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: "Python for Statistical Analysis",
                  provider: "iGOT Karmayogi",
                  skill: "Python",
                  priority: "High",
                },
                {
                  title: "Applied Machine Learning",
                  provider: "NSSTA",
                  skill: "AI/ML",
                  priority: "High",
                },
                {
                  title: "Advanced Sampling Methods",
                  provider: "NSSTA",
                  skill: "Sampling",
                  priority: "Medium",
                },
              ].map((course) => (
                <div
                  key={course.title}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-saffron/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-saffron" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.provider} · {course.skill}
                    </p>
                  </div>
                  <Badge
                    variant={
                      course.priority === "High" ? "destructive" : "secondary"
                    }
                    className="text-[10px] flex-shrink-0"
                  >
                    {course.priority}
                  </Badge>
                </div>
              ))}

              <Separator />
              <p className="text-xs text-muted-foreground italic text-center">
                Preview — AI recommendations engine unlocks in Phase 3
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your learning activities, assessment results, and course
                completions will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="border-saffron/20 bg-saffron/5">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-saffron" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Competency Intelligence Active</h3>
              <p className="text-sm text-muted-foreground">
                Take your baseline self-assessment to map your current proficiency across statistical and technical domains.
              </p>
            </div>
            <Button
              variant="outline"
              className="flex-shrink-0 gap-2"
              nativeButton={false}
              render={<Link href="/assessments/take" />}
            >
              Take Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
