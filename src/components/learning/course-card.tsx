// StatSkill AI — Reusable Course Card Component

"use client";

import { useState } from "react";
import {
  BookOpen,
  Clock,
  ExternalLink,
  Star,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CourseWithCompetencies, LearningPathCourseItem } from "@/types";
import { updateCourseProgress } from "@/app/(dashboard)/learning/actions";

interface CourseCardProps {
  item?: LearningPathCourseItem;
  course?: CourseWithCompetencies;
  userId: string;
  onStatusChange?: () => void;
}

export function CourseCard({ item, course: propCourse, userId, onStatusChange }: CourseCardProps) {
  const course = item ? item.course : propCourse;
  const progress = item?.user_progress || propCourse?.user_progress;
  const recommendationReason = item?.recommendation_reason;
  const priority = item?.priority;

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(progress?.progress_percentage || 0);

  if (!course) return null;

  const isEnrolled = !!progress;
  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in_progress";

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "iGOT Karmayogi":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "NSSTA":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "TPAC":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await updateCourseProgress(userId, course.id, "in_progress", 25);
      toast.success(`Enrolled in "${course.title}". Added to active learning modules!`);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error(err);
      toast.error("Failed to enroll in course.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateCourseProgress(userId, course.id, "completed", 100);
      toast.success(`Congratulations! "${course.title}" marked as completed.`);
      setModalOpen(false);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update course progress.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlider = async (val: number) => {
    setProgressVal(val);
    const status = val >= 100 ? "completed" : val > 0 ? "in_progress" : "enrolled";
    await updateCourseProgress(userId, course.id, status, val);
    if (onStatusChange) onStatusChange();
  };

  return (
    <>
      <Card
        className={`
          relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-md
          ${
            priority === "high"
              ? "border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent"
              : isCompleted
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border"
          }
        `}
      >
        <div>
          {/* Card Header Info */}
          <CardHeader className="pb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="outline" className={`text-[11px] font-medium ${getProviderBadge(course.provider)}`}>
                {course.provider}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-amber-500 font-mono font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {course.rating.toFixed(1)}
              </div>
            </div>

            <CardTitle className="text-base font-bold leading-snug line-clamp-2">
              {course.title}
            </CardTitle>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration_hours}h
              </span>
              <span>•</span>
              <span>{course.level}</span>
              <span>•</span>
              <span>ID: {course.code}</span>
            </div>
          </CardHeader>

          {/* Card Content & Explainability */}
          <CardContent className="pb-4 space-y-3">
            <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </CardDescription>

            {/* AI Recommendation Reason Tag */}
            {recommendationReason && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{recommendationReason}</span>
              </div>
            )}

            {/* Progress Bar if enrolled */}
            {isEnrolled && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    {isCompleted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-primary flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" /> In Progress
                      </span>
                    )}
                  </span>
                  <span>{progress?.progress_percentage || 0}%</span>
                </div>
                <Progress
                  value={progress?.progress_percentage || 0}
                  className={`h-1.5 ${isCompleted ? "[&>div]:bg-emerald-500" : ""}`}
                />
              </div>
            )}
          </CardContent>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 pt-0 border-t bg-muted/10 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground h-8"
          >
            Details & Syllabus
          </Button>

          <div className="flex items-center gap-2">
            {!isEnrolled ? (
              <Button
                size="sm"
                onClick={handleEnroll}
                disabled={loading}
                className="gradient-navy text-white text-xs h-8 gap-1.5"
              >
                Enroll
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : isCompleted ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="text-xs h-8 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Certificate
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Resume ({progress?.progress_percentage}%)
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Course Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`text-xs ${getProviderBadge(course.provider)}`}>
                {course.provider}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {course.level} Level
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold">{course.title}</DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              Module Code: {course.code} · Estimated Duration: {course.duration_hours} Hours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-semibold mb-1">Course Overview</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>

            {recommendationReason && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold block mb-0.5">Recommendation Justification:</span>
                {recommendationReason}
              </div>
            )}

            {/* Progress Simulator Slider */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Your Training Progress</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {progressVal}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={progressVal}
                onChange={(e) => handleUpdateSlider(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>0% (Not Started)</span>
                <span>50% (In Progress)</span>
                <span>100% (Completed)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified curriculum certified for MoSPI / Official Statistical System
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (course.external_url) {
                  window.open(course.external_url, "_blank");
                }
              }}
              className="gap-1.5 text-xs w-full sm:w-auto"
            >
              Open on {course.provider} Portal
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isCompleted ? (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs w-full sm:w-auto gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as 100% Complete
                </Button>
              ) : (
                <Badge className="bg-emerald-600 text-white py-1 px-3">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
