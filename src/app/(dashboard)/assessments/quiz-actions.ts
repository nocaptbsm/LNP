// StatSkill AI — Quiz Evaluation & Assessment Actions

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { QuizWithQuestions, QuizAttempt } from "@/types";

/**
 * Returns all published certification quizzes
 */
export async function getPublishedQuizzes(userId?: string): Promise<QuizWithQuestions[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: quizzes, error } = await (supabase as any)
    .from("quizzes")
    .select("*, competency:competencies(*), questions:quiz_questions(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !quizzes) return [];

  // If userId provided, fetch their previous attempts for these quizzes
  if (userId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attempts } = await (supabase as any)
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId);

    const attemptsMap = new Map<string, any[]>();
    attempts?.forEach((a: any) => {
      const list = attemptsMap.get(a.quiz_id) || [];
      list.push(a);
      attemptsMap.set(a.quiz_id, list);
    });

    return quizzes.map((q: any) => ({
      ...q,
      user_attempts: attemptsMap.get(q.id) || [],
    }));
  }

  return quizzes as QuizWithQuestions[];
}

/**
 * Fetch a specific quiz with questions
 */
export async function getQuizDetails(quizId: string): Promise<QuizWithQuestions | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: quiz, error } = await (supabase as any)
    .from("quizzes")
    .select("*, competency:competencies(*), questions:quiz_questions(*)")
    .eq("id", quizId)
    .single();

  if (error || !quiz) return null;

  // Sort questions by sequence order
  if (quiz.questions) {
    quiz.questions.sort((a: any, b: any) => a.sequence_order - b.sequence_order);
  }

  return quiz as QuizWithQuestions;
}

/**
 * Grades a quiz attempt and automatically updates user competency level if passed
 */
export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  answers: Record<string, string> // question_id -> selected option ('A', 'B', 'C', 'D')
) {
  const supabase = await createClient();

  // 1. Fetch Quiz & Questions details
  const quiz = await getQuizDetails(quizId);
  if (!quiz) {
    return { error: "Quiz not found." };
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return { error: "Quiz has no questions to evaluate." };
  }

  // 2. Evaluate answers
  let correctCount = 0;
  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    if (userAnswer === q.correct_option) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const status = scorePercentage >= quiz.passing_score ? "passed" : "failed";

  // 3. Log Quiz Attempt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attempt, error: attemptError } = await (supabase as any)
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score_percentage: scorePercentage,
      status,
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    console.error("Error creating quiz attempt:", attemptError);
    return { error: "Failed to record quiz attempt." };
  }

  // 4. Closed-Loop Trigger: If passed, promote user competency level
  if (status === "passed") {
    // Check if the user already has a level for this competency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentCompetency } = await (supabase as any)
      .from("user_competencies")
      .select("*")
      .eq("user_id", userId)
      .eq("competency_id", quiz.competency_id)
      .maybeSingle();

    const currentLevel = currentCompetency?.current_level || 0;

    // Promote only if target level of quiz is higher than current user level
    if (quiz.target_level > currentLevel) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: promoError } = await (supabase as any)
        .from("user_competencies")
        .upsert(
          {
            user_id: userId,
            competency_id: quiz.competency_id,
            current_level: quiz.target_level,
            last_assessed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,competency_id" }
        );

      if (promoError) {
        console.error("Error promoting competency level:", promoError);
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/competency");
  revalidatePath("/assessments");

  return {
    success: true,
    scorePercentage,
    status,
    correctCount,
    totalQuestions,
    passingScore: quiz.passing_score,
  };
}

/**
 * Fetch past quiz attempts logs for history table
 */
export async function getQuizAttemptsHistory(userId: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("quiz_attempts")
    .select("*, quiz:quizzes(*, competency:competencies(*))")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
