// StatSkill AI — Trainer Quiz & Question Review Portal

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  CheckCircle,
  XCircle,
  Edit2,
  Trash,
  Plus,
  Target,
  Sparkles,
  ClipboardCheck,
  Save,
  Loader2,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { getTrainerDashboardData, reviewGeneratedQuestion, createQuizFromApprovedQuestions } from "../actions";
import type { GeneratedQuestion, Quiz } from "@/types";

export default function TrainerQuizzesPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<{
    materials: any[];
    pendingQuestions: any[];
    quizzes: any[];
    pendingQuestionsCount: number;
    publishedQuizzesCount: number;
  }>({
    materials: [],
    pendingQuestions: [],
    quizzes: [],
    pendingQuestionsCount: 0,
    publishedQuizzesCount: 0,
  });

  // State for Create Quiz Form
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizCompetencyId, setQuizCompetencyId] = useState("");
  const [quizTargetLevel, setQuizTargetLevel] = useState(3);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);

  // State for Editing/Reviewing Questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editOptionA, setEditOptionA] = useState("");
  const [editOptionB, setEditOptionB] = useState("");
  const [editOptionC, setEditOptionC] = useState("");
  const [editOptionD, setEditOptionD] = useState("");
  const [editCorrectOption, setEditCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [editExplanation, setEditExplanation] = useState("");

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dbData = await getTrainerDashboardData(user.id);
      setData(dbData);

      const supabase = createClient();
      const { data: compList } = await (supabase as any).from("competencies").select("id, name, code");
      setCompetencies(compList || []);
      if (compList && (compList as any[]).length > 0) setQuizCompetencyId((compList as any[])[0].id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load trainer dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Handle inline review edits
  const startEditQuestion = (q: GeneratedQuestion) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.question_text);
    setEditOptionA(q.option_a);
    setEditOptionB(q.option_b);
    setEditOptionC(q.option_c);
    setEditOptionD(q.option_d);
    setEditCorrectOption(q.correct_option);
    setEditExplanation(q.explanation || "");
  };

  const cancelEdit = () => {
    setEditingQuestionId(null);
  };

  const handleSaveQuestion = async (qId: string, status: "approved" | "rejected") => {
    setSubmitting(true);
    try {
      const res = await reviewGeneratedQuestion(qId, status, {
        question_text: editQuestionText,
        option_a: editOptionA,
        option_b: editOptionB,
        option_c: editOptionC,
        option_d: editOptionD,
        correct_option: editCorrectOption,
        explanation: editExplanation,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(status === "approved" ? "Question approved!" : "Question rejected.");
        setEditingQuestionId(null);
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update question status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimpleApprove = async (q: GeneratedQuestion) => {
    setSubmitting(true);
    try {
      const res = await reviewGeneratedQuestion(q.id, "approved", {
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation || "",
      });

      if (res.error) toast.error(res.error);
      else {
        toast.success("Question approved successfully!");
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimpleReject = async (qId: string) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await (supabase as any).from("generated_questions").update({ status: "rejected" }).eq("id", qId);
      if (error) toast.error("Failed to reject question.");
      else {
        toast.success("Question rejected.");
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Checkbox select questions for quiz
  const toggleSelectQuestion = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedQuestionIds.length === 0) {
      toast.error("Please select at least one question to include in the quiz.");
      return;
    }
    if (!quizTitle) {
      toast.error("Please enter a quiz title.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createQuizFromApprovedQuestions({
        title: quizTitle,
        description: quizDescription,
        competencyId: quizCompetencyId,
        targetLevel: quizTargetLevel,
        passingScore: quizPassingScore,
        questionIds: selectedQuestionIds,
        userId: user.id,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("New quiz successfully compiled and published!");
        setQuizDialogOpen(false);
        // Clear forms
        setQuizTitle("");
        setQuizDescription("");
        setSelectedQuestionIds([]);
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading trainer dashboards...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Quiz & Question Review Board
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit AI-generated multiple-choice questions (MCQs), edit options, and compile them into certified quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button nativeButton={false} render={<Link href="/trainer/upload" />} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" />
            Upload Materials
          </Button>

          <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
            <DialogTrigger render={<Button variant="outline" className="gap-1.5 text-xs" />}>
              <Plus className="w-4 h-4 text-emerald-500" />
              Compile New Quiz
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateQuiz}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    Compile Certified Quiz
                  </DialogTitle>
                  <DialogDescription>
                    Bundle approved questions into a published evaluation to assess employees.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-title" className="font-semibold text-foreground">
                        Quiz Title
                      </Label>
                      <Input
                        id="quiz-title"
                        placeholder="e.g. Stratified Sampling Intermediate Assessment"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz-competency" className="font-semibold text-foreground">
                        Associate Competency
                      </Label>
                      <select
                        id="quiz-competency"
                        value={quizCompetencyId}
                        onChange={(e) => setQuizCompetencyId(e.target.value)}
                        className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {competencies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quiz-desc" className="font-semibold text-foreground">
                      Quiz Description
                    </Label>
                    <Textarea
                      id="quiz-desc"
                      placeholder="e.g. Evaluates survey weight computations and simple clustering estimation."
                      value={quizDescription}
                      onChange={(e: any) => setQuizDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-level" className="font-semibold text-foreground">
                        Target Level Promotion
                      </Label>
                      <select
                        id="quiz-level"
                        value={quizTargetLevel}
                        onChange={(e: any) => setQuizTargetLevel(parseInt(e.target.value, 10))}
                        className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                      >
                        <option value="1">Level 1 (Awareness)</option>
                        <option value="2">Level 2 (Novice)</option>
                        <option value="3">Level 3 (Intermediate)</option>
                        <option value="4">Level 4 (Advanced)</option>
                        <option value="5">Level 5 (Expert)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz-passing" className="font-semibold text-foreground">
                        Passing Score Percentage
                      </Label>
                      <Input
                        id="quiz-passing"
                        type="number"
                        min="10"
                        max="100"
                        value={quizPassingScore}
                        onChange={(e: any) => setQuizPassingScore(parseInt(e.target.value, 10))}
                      />
                    </div>
                  </div>

                  {/* Question Checklist Info */}
                  <div className="p-3.5 border rounded-xl bg-muted/20 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">
                      Selected Questions ({selectedQuestionIds.length})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Close this dialog and use the checkboxes in the "Question Review Board" tab to select which approved questions to bundle into this quiz.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setQuizDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || selectedQuestionIds.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    Compile & Publish Quiz
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending AI Questions
            </p>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
              {data.pendingQuestionsCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Published Quizzes
            </p>
            <p className="text-2xl font-bold font-mono mt-1">{data.publishedQuizzesCount}</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Source Manuals
            </p>
            <p className="text-2xl font-bold font-mono mt-1">{data.materials.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="review">
        <TabsList className="mb-4">
          <TabsTrigger value="review">Question Review Board ({data.pendingQuestions.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Published Quizzes ({data.quizzes.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Question Review Board */}
        <TabsContent value="review">
          {data.pendingQuestions.length === 0 ? (
            <div className="py-16 text-center border rounded-xl bg-card text-muted-foreground text-sm space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-semibold text-foreground text-base">No Questions Pending Review</p>
              <p className="text-xs max-w-xs mx-auto">
                All generated questions are reviewed, or you haven't uploaded training manuals yet.
              </p>
              <Button nativeButton={false} render={<Link href="/trainer/upload" />} className="mt-2 text-xs">
                Upload Training Manual
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.pendingQuestions.map((q) => {
                const isEditing = editingQuestionId === q.id;
                const isSelected = selectedQuestionIds.includes(q.id);

                return (
                  <Card key={q.id} className={`border-2 ${isSelected ? "border-emerald-500" : "border-border"}`}>
                    <CardHeader className="pb-3 border-b flex flex-row items-start justify-between gap-4 bg-muted/10">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            Competency: {q.competency?.name}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                            Source: {q.material?.title}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Select checkbox to bundle in quiz */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <input
                            type="checkbox"
                            id={`select-${q.id}`}
                            checked={isSelected}
                            onChange={() => toggleSelectQuestion(q.id)}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                          <Label htmlFor={`select-${q.id}`} className="cursor-pointer">
                            Select for Quiz
                          </Label>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-5 space-y-4 text-sm">
                      {isEditing ? (
                        /* Editing Questionnaire Fields */
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="font-semibold text-xs">Question text</Label>
                            <Textarea value={editQuestionText} onChange={(e: any) => setEditQuestionText(e.target.value)} />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Option A</Label>
                              <Input value={editOptionA} onChange={(e) => setEditOptionA(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Option B</Label>
                              <Input value={editOptionB} onChange={(e) => setEditOptionB(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Option C</Label>
                              <Input value={editOptionC} onChange={(e) => setEditOptionC(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Option D</Label>
                              <Input value={editOptionD} onChange={(e) => setEditOptionD(e.target.value)} />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Correct Option</Label>
                              <select
                                value={editCorrectOption}
                                onChange={(e) => setEditCorrectOption(e.target.value as any)}
                                className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                              >
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Answer Explanation</Label>
                              <Input value={editExplanation} onChange={(e) => setEditExplanation(e.target.value)} />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" size="sm" onClick={cancelEdit}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSaveQuestion(q.id, "approved")}
                              disabled={submitting}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8"
                            >
                              <Save className="w-3.5 h-3.5" /> Save & Approve
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Read Only Generated Question Details */
                        <div className="space-y-3">
                          <p className="font-semibold text-foreground text-base">
                            {q.question_text}
                          </p>

                          <div className="grid md:grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
                            <div className={`p-2 border rounded-lg ${q.correct_option === "A" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : ""}`}>
                              A: {q.option_a}
                            </div>
                            <div className={`p-2 border rounded-lg ${q.correct_option === "B" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : ""}`}>
                              B: {q.option_b}
                            </div>
                            <div className={`p-2 border rounded-lg ${q.correct_option === "C" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : ""}`}>
                              C: {q.option_c}
                            </div>
                            <div className={`p-2 border rounded-lg ${q.correct_option === "D" ? "border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold" : ""}`}>
                              D: {q.option_d}
                            </div>
                          </div>

                          {q.explanation && (
                            <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg leading-relaxed">
                              <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-primary" />
                              <span className="font-semibold">Explanation:</span> {q.explanation}
                            </p>
                          )}

                          <div className="flex justify-end gap-2 border-t pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditQuestion(q)}
                              className="gap-1 h-8 text-xs text-muted-foreground"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit Question
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSimpleReject(q.id)}
                              className="gap-1 border-destructive/20 text-destructive hover:bg-destructive/10 h-8 text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSimpleApprove(q)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8 text-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Published Quizzes */}
        <TabsContent value="quizzes">
          {data.quizzes.length === 0 ? (
            <div className="py-12 text-center border rounded-xl bg-card text-muted-foreground text-sm">
              <p className="font-medium text-foreground">No quizzes published yet.</p>
              <p className="text-xs">Review approved questions and bundle them to publish your first evaluation.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {data.quizzes.map((quiz) => (
                <Card key={quiz.id} className="stat-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                        Competency: {quiz.competency?.name}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        Target: Level {quiz.target_level}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{quiz.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2 text-xs">
                    <div className="flex justify-between font-mono text-muted-foreground">
                      <span>Questions count: {quiz.questions?.length}</span>
                      <span>Passing limit: {quiz.passing_score}%</span>
                    </div>

                    <div className="flex justify-end border-t pt-3">
                      <Badge className="bg-emerald-600 text-white">Active / Published</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
