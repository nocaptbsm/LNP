// StatSkill AI — Self-Assessment Interactive Wizard

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Award,
  Sparkles,
  BarChart3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { submitSelfAssessment } from "../actions";

interface CompetencyItem {
  id: string;
  name: string;
  code: string;
  description: string;
  level_1_desc: string;
  level_2_desc: string;
  level_3_desc: string;
  level_4_desc: string;
  level_5_desc: string;
  domain: {
    name: string;
    code: string;
  };
  required_level?: number;
}

export default function TakeAssessmentPage() {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [competencies, setCompetencies] = useState<CompetencyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCompetencies() {
      const supabase = createClient();

      // Fetch competencies with domain info
      const { data, error } = await supabase
        .from("competencies")
        .select("*, domain:domains(*)")
        .order("code");

      if (error || !data) {
        toast.error("Failed to load assessment competencies");
        setLoading(false);
        return;
      }

      setCompetencies(data as unknown as CompetencyItem[]);

      // Initialize default ratings to 3 for all competencies
      const initialRatings: Record<string, number> = {};
      (data as any[]).forEach((c) => {
        initialRatings[c.id] = 3;
      });
      setRatings(initialRatings);
      setLoading(false);
    }

    loadCompetencies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading assessment competencies...</p>
      </div>
    );
  }

  if (competencies.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">No competencies found in framework.</p>
        <Button onClick={() => router.push("/competency")}>Back to Competencies</Button>
      </div>
    );
  }

  const currentComp = competencies[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / competencies.length) * 100);

  const handleRatingChange = (val: string) => {
    setRatings((prev) => ({
      ...prev,
      [currentComp.id]: parseInt(val, 10),
    }));
  };

  const handleNext = () => {
    if (currentIndex < competencies.length - 1) {
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
      toast.error("User session expired. Please sign in.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitSelfAssessment(user.id, ratings);
      if (res.error) {
        toast.error(res.error);
        setSubmitting(false);
      } else {
        toast.success("Self-Assessment submitted! Your competency profile has been updated.");
        router.push("/competency");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit assessment");
      setSubmitting(false);
    }
  };

  const levelOptions = [
    { level: 1, title: "Level 1 — Awareness", desc: currentComp.level_1_desc },
    { level: 2, title: "Level 2 — Novice", desc: currentComp.level_2_desc },
    { level: 3, title: "Level 3 — Intermediate", desc: currentComp.level_3_desc },
    { level: 4, title: "Level 4 — Advanced", desc: currentComp.level_4_desc },
    { level: 5, title: "Level 5 — Expert / Master", desc: currentComp.level_5_desc },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Wizard Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>
            Question {currentIndex + 1} of {competencies.length}
          </span>
          <span>{progressPercent}% Completed</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Main Questionnaire Card */}
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
              Domain: {currentComp.domain?.name}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {currentComp.code}
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {currentComp.name}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground mt-1">
            {currentComp.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Select the option that best describes your current proficiency level:
            </div>

            <RadioGroup
              value={ratings[currentComp.id]?.toString() || "3"}
              onValueChange={handleRatingChange}
              className="space-y-3"
            >
              {levelOptions.map((opt) => {
                const isSelected = ratings[currentComp.id] === opt.level;
                return (
                  <div
                    key={opt.level}
                    className={`
                      flex items-start space-x-3 p-4 rounded-xl border transition-all cursor-pointer
                      ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500/50"
                          : "border-border hover:bg-muted/50"
                      }
                    `}
                    onClick={() => handleRatingChange(opt.level.toString())}
                  >
                    <RadioGroupItem
                      value={opt.level.toString()}
                      id={`level-${opt.level}`}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-0.5">
                      <Label
                        htmlFor={`level-${opt.level}`}
                        className="text-sm font-semibold text-foreground cursor-pointer flex items-center gap-2"
                      >
                        {opt.title}
                        {opt.level === 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Standard Target
                          </Badge>
                        )}
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {opt.desc}
                      </p>
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
            {currentIndex === competencies.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete & Submit Assessment
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
