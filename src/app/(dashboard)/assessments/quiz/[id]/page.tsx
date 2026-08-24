// StatSkill AI — Interactive Quiz Examination Portal

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Target,
  ArrowLeft,
  Loader2,
  Award,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { getQuizDetails, submitQuizAttempt } from "../../quiz-actions";
import type { QuizWithQuestions } from "@/types";
import { createClient } from "@/lib/supabase/client";
import CertificateModal from "@/components/learning/certificate-modal";

export default function QuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useUser();
  const resolvedParams = use(params);
  const quizId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Exam Progress State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> 'A' | 'B' | 'C' | 'D'

  // Exam Result Screen State
  const [quizResult, setQuizResult] = useState<{
    scorePercentage: number;
    status: "passed" | "failed";
    correctCount: number;
    totalQuestions: number;
    passingScore: number;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const details = await getQuizDetails(quizId);
        if (!details) {
          toast.error("Quiz not found or not published.");
          router.push("/assessments");
          return;
        }
        setQuiz(details);
        if (user) {
          const supabase = createClient();
          const { data: prof } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          setProfile(prof);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quiz questions.");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading examination panel...</p>
      </div>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleOptionSelect = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Session expired.");
      return;
    }

    // Check if all questions are answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(user.id, quiz.id, answers);
      if (res.error) {
        toast.error(res.error);
        setSubmitting(false);
      } else {
        setQuizResult({
          scorePercentage: res.scorePercentage!,
          status: res.status as "passed" | "failed",
          correctCount: res.correctCount!,
          totalQuestions: res.totalQuestions!,
          passingScore: res.passingScore!,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to evaluate quiz.");
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setQuizResult(null);
    setSubmitting(false);
  };

  // 1. Render Results Screen
  if (quizResult) {
    const passed = quizResult.status === "passed";
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
        <Card className={`border-2 ${passed ? "border-emerald-500/40" : "border-destructive/30"}`}>
          <CardHeader className="text-center pb-4 border-b">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-muted/20">
              {passed ? (
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {passed ? "Certification Passed!" : "Certification Failed"}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {passed
                ? `Congratulations! You scored ${quizResult.scorePercentage}% and met the required baseline.`
                : `You scored ${quizResult.scorePercentage}%, which is below the passing limit of ${quizResult.passingScore}%.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Score Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-xl bg-muted/10">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Your Score</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${passed ? "text-emerald-600" : "text-destructive"}`}>
                  {quizResult.scorePercentage}%
                </p>
              </div>
              <div className="p-3 border rounded-xl bg-muted/10">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Correct Responses</p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {quizResult.correctCount} / {quizResult.totalQuestions}
                </p>
              </div>
              <div className="p-3 border rounded-xl bg-muted/10">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Passing Limit</p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {quizResult.passingScore}%
                </p>
              </div>
            </div>

            {passed && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>Skill Promotion Active:</strong> Your competency profile radar chart has been upgraded to <strong>Level {quiz.target_level}</strong> for {quiz.competency?.name}!
                  </span>
                </div>
                <Button
                  onClick={() => setShowCertificate(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 font-semibold flex-shrink-0 gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  View Certificate
                </Button>
              </div>
            )}

            {/* Answer Explanations Review */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground border-b pb-2">Question-by-Question Review</h3>
              {questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correct_option;

                return (
                  <div key={q.id} className="p-4 rounded-xl border space-y-3 bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold text-sm">
                        Q{idx + 1}: {q.question_text}
                      </p>
                      <Badge variant={isCorrect ? "secondary" : "destructive"} className="text-[10px]">
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-xs font-mono">
                      <div className={`p-2 border rounded-lg ${q.correct_option === "A" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : userAns === "A" ? "border-destructive/30" : ""}`}>
                        A: {q.option_a}
                      </div>
                      <div className={`p-2 border rounded-lg ${q.correct_option === "B" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : userAns === "B" ? "border-destructive/30" : ""}`}>
                        B: {q.option_b}
                      </div>
                      <div className={`p-2 border rounded-lg ${q.correct_option === "C" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : userAns === "C" ? "border-destructive/30" : ""}`}>
                        C: {q.option_c}
                      </div>
                      <div className={`p-2 border rounded-lg ${q.correct_option === "D" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : userAns === "D" ? "border-destructive/30" : ""}`}>
                        D: {q.option_d}
                      </div>
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                        <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-primary" />
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t justify-end">
              <Button variant="outline" onClick={() => router.push("/assessments")} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back to Assessments
              </Button>
              <Button onClick={resetQuiz} className="bg-primary text-primary-foreground">
                Retake Exam
              </Button>
            </div>

            {profile && (
              <CertificateModal
                open={showCertificate}
                onOpenChange={setShowCertificate}
                employeeName={profile.full_name}
                designation={profile.designation || "Statistical Officer"}
                competencyName={quiz.competency?.name || "Survey Sampling"}
                competencyCode={quiz.competency?.code || "COMP"}
                levelEarned={quiz.target_level}
                dateEarned={new Date().toISOString()}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Render Interactive Quiz Taking Interface
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Quiz Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{progressPercent}% Complete</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
              Competency: {quiz.competency?.name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Target Level: {quiz.target_level}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {quiz.title}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
            {quiz.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <p className="font-semibold text-base text-foreground leading-relaxed">
              {currentQuestion.question_text}
            </p>

            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleOptionSelect}
              className="space-y-3"
            >
              {[
                { key: "A", val: currentQuestion.option_a },
                { key: "B", val: currentQuestion.option_b },
                { key: "C", val: currentQuestion.option_c },
                { key: "D", val: currentQuestion.option_d },
              ].map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleOptionSelect(opt.key)}
                    className={`
                      flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer
                      ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500/50"
                          : "border-border hover:bg-muted/50"
                      }
                    `}
                  >
                    <RadioGroupItem value={opt.key} id={`opt-${opt.key}`} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={`opt-${opt.key}`} className="text-sm font-medium cursor-pointer leading-snug">
                        <span className="font-bold mr-1.5">{opt.key}:</span>
                        {opt.val}
                      </Label>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </CardContent>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-6 border-t bg-muted/20 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0 || submitting}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-4 h-4" />
                    Submit Exam
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={submitting} className="gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
