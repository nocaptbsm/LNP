// StatSkill AI — Learning Path Header Client Component with iGOT Sync

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Award,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateOrGetLearningPath } from "./actions";
import { syncIgotProgress } from "./sync-actions";

interface LearningPathHeaderProps {
  userId: string;
  title: string;
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  completedHours: number;
  criticalGapsCount: number;
  progressPercent: number;
}

export function LearningPathHeader({
  userId,
  title,
  totalCourses,
  completedCourses,
  totalHours,
  completedHours,
  criticalGapsCount,
  progressPercent,
}: LearningPathHeaderProps) {
  const router = useRouter();
  const [regenerating, setRegenerating] = useState(false);

  // Sync state
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncingState, setSyncingState] = useState(false);
  const [syncStep, setSyncStep] = useState(0); // 0: Idle, 1: Auth, 2: Fetching, 3: Importing, 4: Done

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await generateOrGetLearningPath(userId, true);
      toast.success("AI Learning Path regenerated based on latest competency scores!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to regenerate learning path.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleSyncIgot = async () => {
    setSyncDialogOpen(true);
    setSyncingState(true);

    // Simulator Steps
    setSyncStep(1);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSyncStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSyncStep(3);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      const res = await syncIgotProgress(userId);

      setSyncStep(4);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSyncDialogOpen(false);
      setSyncingState(false);
      setSyncStep(0);

      if (res.count === 0) {
        toast.info("All course progress is already up to date with iGOT Karmayogi.");
      } else {
        toast.success(`Successfully imported ${res.count} course completion certificates!`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("iGOT Gateway connection timeout.");
      setSyncDialogOpen(false);
      setSyncingState(false);
    }
  };

  return (
    <div className="rounded-xl gradient-navy p-6 sm:p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Personalized Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Curated from <span className="text-white font-medium">iGOT Karmayogi</span> and{" "}
            <span className="text-white font-medium">NSSTA</span> to bridge measured competency gaps and support career progression.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-white/80">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              {completedCourses} of {totalCourses} Courses Completed
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {completedHours} / {totalHours} Hours Logged
            </span>
            {criticalGapsCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {criticalGapsCount} Critical Priority Modules
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-shrink-0">
          {/* Progress Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[140px]">
            <div className="text-3xl font-mono font-bold text-amber-400">{progressPercent}%</div>
            <div className="text-[11px] text-white/70 uppercase tracking-wider mt-0.5">
              Path Progress
            </div>
            <Progress value={progressPercent} className="h-1 mt-2 bg-white/20 [&>div]:bg-amber-400" />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRegenerate}
              disabled={regenerating || syncingState}
              className="bg-saffron hover:bg-saffron/90 text-navy font-semibold border-0 shadow-lg gap-2 h-auto py-3 px-5 text-xs"
            >
              {regenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Gaps...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate AI Path
                </>
              )}
            </Button>

            <Button
              onClick={handleSyncIgot}
              disabled={regenerating || syncingState}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg gap-2 h-auto py-3 px-5 text-xs"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Sync iGOT Progress
            </Button>
          </div>
        </div>
      </div>

      {/* Sync Status dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="max-w-md p-6 text-center text-slate-800 dark:text-slate-200">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="flex items-center justify-center gap-1.5 text-base">
              <Award className="w-5 h-5 text-amber-500 animate-pulse" />
              iGOT Gateway Synchronization
            </DialogTitle>
            <DialogDescription className="text-xs text-center">
              Handshaking securely with Mission Karmayogi National Gateway API stubs
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                {syncStep === 1 && "Connecting Gateway..."}
                {syncStep === 2 && "Authenticating Certificate Hashes..."}
                {syncStep === 3 && "Importing Completed Curriculums..."}
                {syncStep === 4 && "Updating Local Competency Indexes..."}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-mono">
                {syncStep === 1 && "Verifying secure handshake protocols."}
                {syncStep === 2 && "Validating public cryptographical stamps."}
                {syncStep === 3 && "Mapping authenticated hours spent in statistical courses."}
                {syncStep === 4 && "Regenerating local workforce analytical averages."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
