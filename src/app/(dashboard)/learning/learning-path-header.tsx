// StatSkill AI — Learning Path Header Client Component

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Clock, CheckCircle2, RefreshCw, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateOrGetLearningPath } from "./actions";

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

          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="bg-saffron hover:bg-saffron/90 text-navy font-semibold border-0 shadow-lg gap-2 h-auto py-3 px-5"
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
        </div>
      </div>
    </div>
  );
}
