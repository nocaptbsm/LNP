// StatSkill AI — Assessments Hub Page

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getAssessmentHistory } from "./actions";
import { getPublishedQuizzes, getQuizAttemptsHistory } from "./quiz-actions";

export const metadata = {
  title: "Assessments — StatSkill AI",
};

export default async function AssessmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch baseline self assessments
  const selfHistory = await getAssessmentHistory(user.id);

  // Fetch published quizzes mapped to competencies
  const publishedQuizzes = await getPublishedQuizzes(user.id);

  // Fetch past quiz attempts
  const quizHistory = await getQuizAttemptsHistory(user.id);

  // Combine histories for unified log
  const combinedHistory = [
    ...selfHistory.map((item) => ({
      id: item.id,
      title: item.title,
      type: "Self-Assessment Survey",
      score: `${item.score_percentage}%`,
      status: item.status === "completed" ? "passed" : "in_progress",
      completed_at: item.completed_at,
    })),
    ...quizHistory.map((item: any) => ({
      id: item.id,
      title: item.quiz?.title || "AI MCQ Quiz",
      type: `AI Practice Quiz (${item.quiz?.competency?.name})`,
      score: `${item.score_percentage}%`,
      status: item.status, // 'passed' | 'failed'
      completed_at: item.completed_at,
    })),
  ];

  // Sort history by date completed descending
  combinedHistory.sort((a, b) => {
    const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
    const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-xl gradient-navy p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Competency Evaluation Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Skill Assessments & Evaluation
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Assess your statistical, technical, and leadership capabilities. Complete self-assessments or AI-generated MCQs to certify competency upgrades.
            </p>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/assessments/take" />}
            className="bg-saffron hover:bg-saffron/90 text-navy font-semibold border-0 shadow-lg gap-2 h-auto py-3 px-6 flex-shrink-0"
          >
            <Target className="w-4 h-4" />
            Start Baseline Survey
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Baseline Self Assessment Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-amber-500/30 bg-amber-500/5 relative overflow-hidden lg:col-span-1 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <Badge className="bg-amber-500 text-white hover:bg-amber-600">Step 1 Baseline</Badge>
            </div>
            <CardTitle className="text-xl mt-3">Baseline Self-Assessment Survey</CardTitle>
            <CardDescription className="text-xs">
              Evaluate your proficiency across 14 statistical, technical, and governance competencies on a 5-point scale to construct your baseline radar chart.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="text-xs text-muted-foreground space-y-1.5 font-medium border-t pt-3">
              <p>✓ Instant radar chart generation</p>
              <p>✓ Takes ~3-5 minutes to complete</p>
              <p>✓ Maps core designation expectations</p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/assessments/take" />}
              className="w-full gap-2 gradient-navy text-white text-xs py-5"
            >
              Start Baseline Evaluation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* AI-Generated Material Quizzes Grid (Phase 4 integration) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Certified AI Quizzes
            </h2>
            <Badge variant="outline" className="text-[10px]">
              Pass updates Competency Radar
            </Badge>
          </div>

          {publishedQuizzes.length === 0 ? (
            <div className="py-12 text-center border rounded-xl bg-card text-muted-foreground text-sm flex flex-col items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary mb-2 animate-pulse" />
              <p className="font-semibold text-foreground">No Published AI Quizzes Yet</p>
              <p className="text-xs max-w-xs mt-1">
                Trainers have not compiled quizzes from uploaded manual documents yet. Try the Baseline Survey.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {publishedQuizzes.map((quiz) => {
                const attempts = quiz.user_attempts || [];
                const hasPassed = attempts.some((a) => a.status === "passed");

                return (
                  <Card
                    key={quiz.id}
                    className={`flex flex-col justify-between ${
                      hasPassed ? "border-emerald-500/30 bg-emerald-500/5" : ""
                    }`}
                  >
                    <CardHeader className="pb-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          Level {quiz.target_level} Target
                        </Badge>
                        {hasPassed && (
                          <Badge className="bg-emerald-600 text-white text-[9px] py-0 px-1.5 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Passed
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm font-bold line-clamp-1">{quiz.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground border-t pt-2.5">
                        <span>{quiz.questions?.length || 3} Questions</span>
                        <span>Pass score: {quiz.passing_score}%</span>
                      </div>
                      <Button
                        nativeButton={false}
                        render={<Link href={`/assessments/quiz/${quiz.id}`} />}
                        className="w-full text-xs h-9 gradient-navy text-white"
                      >
                        {hasPassed ? "Retake Quiz" : "Start Quiz"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assessment History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Evaluation History Logs
          </CardTitle>
          <CardDescription>
            History of baseline self-surveys and AI practice quizzes logged for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {combinedHistory.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <p className="font-medium text-foreground">No assessments recorded yet.</p>
              <p className="mt-1">Submit your first self-assessment or quiz to populate logs.</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                  <tr>
                    <th className="p-3.5">Assessment Module</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 text-center">Score</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {combinedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-medium">{item.title}</td>
                      <td className="p-3.5 text-xs text-muted-foreground font-mono">
                        {item.type}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.score}
                      </td>
                      <td className="p-3.5 text-center">
                        {item.status === "passed" ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Passed / Met
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right text-xs text-muted-foreground font-mono">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "In Progress"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
