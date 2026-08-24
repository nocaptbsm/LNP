// StatSkill AI — Personalized Learning Path Dashboard

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Library,
  Target,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { generateOrGetLearningPath } from "./actions";
import { CourseCard } from "@/components/learning/course-card";
import { LearningPathHeader } from "./learning-path-header";

export const metadata = {
  title: "Learning Path — StatSkill AI",
};

export default async function LearningPathPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch or generate personalized roadmap based on competency gaps
  const learningDetails = await generateOrGetLearningPath(user.id);

  const highPriorityItems = learningDetails.items.filter((i) => i.priority === "high");
  const mediumPriorityItems = learningDetails.items.filter((i) => i.priority === "medium");
  const completedItems = learningDetails.items.filter((i) => i.status === "completed");

  const progressPercent =
    learningDetails.items.length > 0
      ? Math.round((completedItems.length / learningDetails.items.length) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Dynamic Header with Regeneration Server Action */}
      <LearningPathHeader
        userId={user.id}
        title={learningDetails.path?.title || "Personalized Capacity Building Path"}
        totalCourses={learningDetails.items.length}
        completedCourses={completedItems.length}
        totalHours={learningDetails.totalHours}
        completedHours={learningDetails.completedHours}
        criticalGapsCount={learningDetails.criticalGapsCovered}
        progressPercent={progressPercent}
      />

      {/* Quick Navigation / Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2">
          <Badge className="bg-saffron text-navy font-bold">iGOT & NSSTA Integrated</Badge>
          <span className="text-xs text-muted-foreground">
            Courses automatically matched to your evaluated competency gaps
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/learning/catalogue" />}
            className="gap-1.5 text-xs h-9"
          >
            <Library className="w-3.5 h-3.5 text-primary" />
            Explore Full Catalogue
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/competency" />}
            className="gap-1.5 text-xs h-9"
          >
            <Target className="w-3.5 h-3.5 text-amber-500" />
            View Competency Matrix
          </Button>
        </div>
      </div>

      {/* Main Course Feed Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">
              All Courses ({learningDetails.items.length})
            </TabsTrigger>
            <TabsTrigger value="critical" className="gap-1">
              Critical Priority
              {highPriorityItems.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                  {highPriorityItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="medium">
              Medium Priority ({mediumPriorityItems.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedItems.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: All Courses */}
        <TabsContent value="all" className="space-y-6">
          {learningDetails.items.length === 0 ? (
            <div className="py-16 text-center border rounded-xl bg-card">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No Learning Path Generated Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                Take your baseline competency assessment so the AI recommendation engine can generate a tailored learning roadmap.
              </p>
              <Button nativeButton={false} render={<Link href="/assessments/take" />}>
                Start Competency Assessment
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningDetails.items.map((item) => (
                <CourseCard key={item.id} item={item} userId={user.id} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: High Priority / Critical Gaps */}
        <TabsContent value="critical">
          {highPriorityItems.length === 0 ? (
            <div className="py-12 text-center border rounded-xl bg-card text-muted-foreground text-sm space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-medium text-foreground">No Critical Skill Gaps Found!</p>
              <p className="text-xs">Your assessed competencies are within 1 level of target requirements.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highPriorityItems.map((item) => (
                <CourseCard key={item.id} item={item} userId={user.id} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Medium Priority */}
        <TabsContent value="medium">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediumPriorityItems.map((item) => (
              <CourseCard key={item.id} item={item} userId={user.id} />
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Completed Modules */}
        <TabsContent value="completed">
          {completedItems.length === 0 ? (
            <div className="py-12 text-center border rounded-xl bg-card text-muted-foreground text-sm">
              <p className="font-medium text-foreground">No completed courses yet.</p>
              <p className="text-xs mt-1">Enroll in modules and mark them complete to earn certifications.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedItems.map((item) => (
                <CourseCard key={item.id} item={item} userId={user.id} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
