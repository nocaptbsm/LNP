// StatSkill AI — iGOT Karmayogi Progress Synchronizer Actions

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Simulates importing progress and completions from iGOT Karmayogi API
 */
export async function syncIgotProgress(userId: string) {
  const supabase = await createClient();

  // 1. Fetch active course progress entries for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeProgress } = await (supabase as any)
    .from("user_course_progress")
    .select("*, course:courses(*)")
    .eq("user_id", userId)
    .neq("status", "completed");

  if (!activeProgress || activeProgress.length === 0) {
    return { success: true, count: 0 };
  }

  // 2. Mark active progress items as completed
  for (const prog of activeProgress) {
    const duration = prog.course?.duration_hours || 10;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_course_progress")
      .update({
        status: "completed",
        progress_percentage: 100,
        hours_spent: duration,
        completed_at: new Date().toISOString(),
      })
      .eq("id", prog.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/learning");

  return { success: true, count: activeProgress.length };
}
