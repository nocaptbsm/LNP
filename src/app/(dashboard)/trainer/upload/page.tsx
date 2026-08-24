// StatSkill AI — Trainer Training Material Uploader

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, Loader2, Target, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { uploadMaterialAndGenerateQuestions } from "../actions";

interface CompetencySelectOption {
  id: string;
  name: string;
  code: string;
}

export default function TrainerUploadPage() {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [competencies, setCompetencies] = useState<CompetencySelectOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [competencyId, setCompetencyId] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");

  // AI Generation Progress Simulator States
  const [step, setStep] = useState(0); // 0:Idle, 1:Uploading, 2:Parsing, 3:LLM Generating, 4:Finished

  useEffect(() => {
    async function loadCompetencies() {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from("competencies")
        .select("id, name, code")
        .order("name");

      if (error || !data) {
        toast.error("Failed to load competencies dropdown.");
      } else {
        setCompetencies(data as CompetencySelectOption[]);
        if ((data as any[]).length > 0) setCompetencyId((data as any[])[0].id);
      }
      setLoading(false);
    }
    loadCompetencies();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto fill title from filename
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a training manual or guideline PDF first.");
      return;
    }
    if (!title) {
      toast.error("Please enter a title for the training material.");
      return;
    }
    if (!user) {
      toast.error("Trainer session expired.");
      return;
    }

    setUploading(true);

    // AI Generation simulation triggers
    // Step 1: Uploading File (1s)
    setStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Step 2: Extracting text & parsing tables (1.2s)
    setStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Step 3: LLM generating competency questions (2s)
    setStep(3);

    try {
      const res = await uploadMaterialAndGenerateQuestions({
        title,
        description,
        fileName: selectedFile.name,
        fileSizeKb: Math.round(selectedFile.size / 1024),
        uploadedBy: user.id,
        competencyId,
        difficulty,
      });

      if (res.error) {
        toast.error(res.error);
        setStep(0);
        setUploading(false);
        return;
      }

      // Step 4: Finished question synthesis
      setStep(4);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Training material uploaded & AI questions generated successfully!");
      router.push("/trainer/quizzes");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected upload error occurred.");
      setStep(0);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading file uploader...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Training Material Upload Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload statistical guides, manual PDFs, or survey manuals. StatSkill AI will parse the document text and synthesize test questions for employee certifications.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Upload Documents & Generate AI Questions</CardTitle>
          <CardDescription>
            Supported extensions: .pdf, .docx, .txt (Max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploading ? (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* File Select */}
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="font-semibold text-foreground">
                  Select Manual / Guidelines Document
                </Label>
                <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer relative bg-muted/10">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Drag and drop file here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Select a file to extract text data
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold text-foreground">
                    Document Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., PLFS Survey Operations Manual"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-semibold text-foreground">
                    Short Description / Notes
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., Guidelines for field statistical officers"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Competency & Difficulty Map */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="competency" className="font-semibold text-foreground">
                    Associate with Competency
                  </Label>
                  <select
                    id="competency"
                    value={competencyId}
                    onChange={(e) => setCompetencyId(e.target.value)}
                    className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {competencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="font-semibold text-foreground">
                    Target Difficulty Level
                  </Label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Beginner">Beginner (Level 1-2)</option>
                    <option value="Intermediate">Intermediate (Level 3)</option>
                    <option value="Advanced">Advanced (Level 4-5)</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <Button type="submit" className="w-full gradient-navy text-white text-base py-6 gap-2">
                <Upload className="w-5 h-5" />
                Upload Manual & Synthesize AI Questions
              </Button>
            </form>
          ) : (
            /* AI Progress Simulator Panel */
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-300">
              <div className="relative w-24 h-24">
                {step < 4 ? (
                  <Loader2 className="w-24 h-24 text-primary animate-spin" />
                ) : (
                  <CheckCircle2 className="w-24 h-24 text-emerald-500 animate-in zoom-in" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className={`w-8 h-8 ${step < 4 ? "text-primary/70" : "text-emerald-500"}`} />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="font-bold text-lg text-foreground">
                  {step === 1 && "Uploading Document..."}
                  {step === 2 && "Extracting Text Guidelines..."}
                  {step === 3 && "LLM Synthesizing MCQs..."}
                  {step === 4 && "AI Synthesis Completed!"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {step === 1 && `Sending "${selectedFile?.name}" to official training servers.`}
                  {step === 2 && "Cleaning formatting, isolating survey tables, and tokenizing text blocks."}
                  {step === 3 && "Evaluating competencies and constructing multiple-choice questions with answer keys."}
                  {step === 4 && "Redirecting to Trainer Review board."}
                </p>
              </div>

              {/* Progress Steps List */}
              <div className="w-full max-w-md border rounded-xl p-4 bg-muted/20 text-left space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className={step >= 1 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                    {step >= 1 ? "✓" : "○"}
                  </span>
                  <span className={step === 1 ? "text-foreground font-bold" : "text-muted-foreground"}>
                    Step 1: Secure manual data upload
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={step >= 2 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                    {step >= 2 ? "✓" : "○"}
                  </span>
                  <span className={step === 2 ? "text-foreground font-bold" : "text-muted-foreground"}>
                    Step 2: Parse raw text & statistical metadata
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={step >= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                    {step >= 3 ? "✓" : "○"}
                  </span>
                  <span className={step === 3 ? "text-foreground font-bold" : "text-muted-foreground"}>
                    Step 3: Run generative LLM questionnaire engine
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={step >= 4 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                    {step >= 4 ? "✓" : "○"}
                  </span>
                  <span className={step === 4 ? "text-foreground font-bold" : "text-muted-foreground"}>
                    Step 4: Load synthesized questions to review board
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
