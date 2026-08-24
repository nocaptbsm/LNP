// StatSkill AI — Competency Profile & Skill Intelligence Page

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { getCompetencyProfileData } from "./actions";
import { CompetencyRadarChart } from "@/components/charts/radar-chart";

export const metadata = {
  title: "Competency Profile — StatSkill AI",
};

export default async function CompetencyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getCompetencyProfileData(user.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Summary */}
      <div className="rounded-xl gradient-navy p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5" />
              Official Statistics Competency Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Skill Intelligence & Competency Profile
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Target requirements mapped for:{" "}
              <span className="font-semibold text-white">{data.userDesignation}</span>.
              Assessments update your gap score in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-shrink-0">
            {/* Score Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[140px]">
              <div className="text-3xl font-mono font-bold text-amber-400">
                {data.overallScorePercentage}%
              </div>
              <div className="text-[11px] text-white/70 uppercase tracking-wider mt-0.5">
                Target Met
              </div>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/assessments/take" />}
              className="bg-saffron hover:bg-saffron/90 text-navy font-semibold border-0 shadow-lg gap-2 h-auto py-3 px-5"
            >
              <Target className="w-4 h-4" />
              {data.totalCompetenciesAssessed === 0
                ? "Take Self-Assessment"
                : "Retake Assessment"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Target Match
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {data.overallScorePercentage}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Progress value={data.overallScorePercentage} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Skills Assessed
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {data.totalCompetenciesAssessed} / {data.allCompetencies.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              {data.totalCompetenciesAssessed === 0
                ? "Pending baseline self-assessment"
                : "Assessed via self-assessment"}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Critical Gaps
                </p>
                <p className="text-2xl font-bold font-mono mt-1 text-destructive">
                  {data.criticalGapsCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Gap of 2+ levels from target
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Active Domains
                </p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {data.domainOverviews.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Statistical, Technical, Gov, Leadership
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Radar Chart & Top Gaps */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Radar Chart Card (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Competency Radar Analysis
                </CardTitle>
                <CardDescription>
                  Comparison of your current proficiency vs target level required for {data.userDesignation}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                5-Point Scale
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.totalCompetenciesAssessed === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Competency Data</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Complete your baseline self-assessment to render your interactive radar chart and identify key development areas.
                </p>
                <Button
                  nativeButton={false}
                  render={<Link href="/assessments/take" />}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Start Self-Assessment
                </Button>
              </div>
            ) : (
              <CompetencyRadarChart domains={data.domainOverviews} />
            )}
          </CardContent>
        </Card>

        {/* Top Skill Gaps (1 col) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Priority Skill Gaps
            </CardTitle>
            <CardDescription>
              Skills requiring maximum development to meet role expectations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topSkillGaps.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {data.totalCompetenciesAssessed === 0 ? (
                  "Take an assessment to identify your skill gaps."
                ) : (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-medium text-foreground">All Targets Met!</p>
                    <p className="text-xs">Your current skills meet or exceed all role requirements.</p>
                  </div>
                )}
              </div>
            ) : (
              data.topSkillGaps.map((item) => (
                <div key={item.competency_id} className="p-3 rounded-lg border bg-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.competency_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.domain_name}
                      </p>
                    </div>
                    <Badge
                      variant={item.status === "critical_gap" ? "destructive" : "secondary"}
                      className="text-[10px] px-1.5 py-0 flex-shrink-0"
                    >
                      {item.status === "critical_gap" ? "Critical Gap" : "Moderate Gap"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Current: Level {item.current_level}</span>
                      <span>Target: Level {item.required_level}</span>
                    </div>
                    <Progress
                      value={(item.current_level / item.required_level) * 100}
                      className="h-2"
                    />
                  </div>

                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Gap: -{item.gap} {item.gap === 1 ? "level" : "levels"} below target
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Competency Framework Matrix */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Complete MoSPI Competency Framework Matrix
              </CardTitle>
              <CardDescription>
                Detailed breakdown of competencies, domain alignment, and target proficiency levels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Skills ({data.allCompetencies.length})</TabsTrigger>
              {data.domainOverviews.map((d) => (
                <TabsTrigger key={d.domain_id} value={d.domain_code}>
                  {d.domain_name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <CompetencyTable items={data.allCompetencies} />
            </TabsContent>

            {data.domainOverviews.map((d) => (
              <TabsContent key={d.domain_id} value={d.domain_code}>
                <CompetencyTable
                  items={data.allCompetencies.filter((c) => c.domain_id === d.domain_id)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to render table of competencies
function CompetencyTable({
  items,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
            <tr>
              <th className="p-3.5">Competency</th>
              <th className="p-3.5">Domain</th>
              <th className="p-3.5 text-center">Current Level</th>
              <th className="p-3.5 text-center">Target Level</th>
              <th className="p-3.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => {
              const gap = item.required_level - item.current_level;
              let statusBadge = (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Met
                </Badge>
              );
              if (item.current_level === 0) {
                statusBadge = <Badge variant="secondary">Unassessed</Badge>;
              } else if (gap >= 2) {
                statusBadge = (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" /> Gap -{gap}
                  </Badge>
                );
              } else if (gap === 1) {
                statusBadge = (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                    Gap -1
                  </Badge>
                );
              } else if (gap < 0) {
                statusBadge = (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
                    Exceeded (+{Math.abs(gap)})
                  </Badge>
                );
              }

              return (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-medium">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {item.description}
                    </div>
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">
                    {item.domain?.name}
                  </td>
                  <td className="p-3.5 text-center font-mono font-medium">
                    {item.current_level === 0 ? "—" : `L${item.current_level}`}
                  </td>
                  <td className="p-3.5 text-center font-mono font-semibold text-primary">
                    L{item.required_level}
                  </td>
                  <td className="p-3.5 text-center">{statusBadge}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
