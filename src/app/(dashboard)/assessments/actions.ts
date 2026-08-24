// StatSkill AI — Assessment Server Actions

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AssessmentHistoryItem {
  id: string;
  title: string;
  type: string;
  status: string;
  completed_questions: number;
  total_questions: number;
  score_percentage: number;
  created_at: string;
  completed_at: string | null;
}

/**
 * Fetch past assessments for a user
 */
export async function getAssessmentHistory(userId: string): Promise<AssessmentHistoryItem[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessments, error } = await (supabase as any)
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !assessments) return [];
  return assessments as AssessmentHistoryItem[];
}

/**
 * Submit a baseline self-assessment survey.
 * Saves results and marks assessment as completed, triggering auto-sync to user_competencies.
 */
export async function submitSelfAssessment(
  userId: string,
  scores: Record<string, number> // competency_id -> rating (1-5)
) {
  const supabase = await createClient();

  const competencyIds = Object.keys(scores);
  const totalQuestions = competencyIds.length;

  if (totalQuestions === 0) {
    return { error: "No ratings were submitted." };
  }

  // Calculate overall average score percentage
  let sumScores = 0;
  competencyIds.forEach((id) => {
    sumScores += scores[id];
  });
  const avgLevel = sumScores / totalQuestions;
  const scorePercentage = Math.round((avgLevel / 5) * 100);

  // 1. Create Assessment Record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assessment, error: assessmentError } = await (supabase as any)
    .from("assessments")
    .insert({
      user_id: userId,
      title: "Baseline Competency Self-Assessment",
      type: "self_assessment",
      status: "in_progress", // start as in_progress then complete to fire trigger
      total_questions: totalQuestions,
      completed_questions: totalQuestions,
      score_percentage: scorePercentage,
    })
    .select()
    .single();

  if (assessmentError || !assessment) {
    console.error("Error creating assessment:", assessmentError);
    return { error: "Failed to initialize assessment record." };
  }

  // 2. Insert Assessment Results
  const resultsToInsert = competencyIds.map((competencyId) => ({
    assessment_id: assessment.id,
    competency_id: competencyId,
    score_level: scores[competencyId],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: resultsError } = await (supabase as any)
    .from("assessment_results")
    .insert(resultsToInsert);

  if (resultsError) {
    console.error("Error inserting assessment results:", resultsError);
    return { error: "Failed to save assessment scores." };
  }

  // 3. Mark Assessment as Completed (Fires DB trigger to sync user_competencies)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("assessments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", assessment.id);

  if (updateError) {
    console.error("Error completing assessment:", updateError);
    return { error: "Failed to finalize assessment." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/competency");
  revalidatePath("/assessments");

  return { success: true, assessmentId: assessment.id };
}
