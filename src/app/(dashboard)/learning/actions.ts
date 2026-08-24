// StatSkill AI — Personalized Learning Recommendation Engine & Server Actions

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCompetencyProfileData } from "../competency/actions";
import type {
  CourseWithCompetencies,
  LearningPathDetails,
  LearningPathCourseItem,
  CourseProgressStatus,
  RecommendationPriority,
} from "@/types";

/**
 * Generates or retrieves the personalized learning path for a user based on competency gaps
 */
export async function generateOrGetLearningPath(
  userId: string,
  forceRegenerate: boolean = false
): Promise<LearningPathDetails> {
  const supabase = await createClient();

  // 1. Check if an active learning path already exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingPath } = await (supabase as any)
    .from("learning_paths")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPath && !forceRegenerate) {
    return await getLearningPathWithDetails(userId, existingPath.id);
  }

  // 2. Compute competency profile & skill gaps
  const compProfile = await getCompetencyProfileData(userId);

  // 3. Create or reset active learning path
  let pathId = existingPath?.id;
  if (!pathId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newPath, error: pathError } = await (supabase as any)
      .from("learning_paths")
      .insert({
        user_id: userId,
        title: `${compProfile.userDesignation} Capacity Building Roadmap`,
        status: "active",
      })
      .select()
      .single();

    if (pathError || !newPath) {
      console.error("Error creating learning path:", pathError);
      return {
        path: null,
        items: [],
        totalHours: 0,
        completedHours: 0,
        criticalGapsCovered: 0,
      };
    }
    pathId = newPath.id;
  } else {
    // Clear old items for regeneration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("learning_path_courses")
      .delete()
      .eq("learning_path_id", pathId);
  }

  // 4. Fetch all available course-competency mappings and courses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: courseMappings } = await (supabase as any)
    .from("course_competencies")
    .select("*, course:courses(*), competency:competencies(*)");

  // 5. Match courses to user's skill gaps
  const recommendedItems: {
    learning_path_id: string;
    course_id: string;
    competency_id: string;
    priority: RecommendationPriority;
    sequence_order: number;
    recommendation_reason: string;
  }[] = [];

  const addedCourseIds = new Set<string>();
  let sequence = 1;

  // First pass: Match Critical Gaps (Gap >= 2) -> High Priority
  const criticalGaps = compProfile.skillGaps.filter((g) => g.gap >= 2);
  criticalGaps.forEach((gap) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchingCourses = courseMappings?.filter(
      (m: any) => m.competency_id === gap.competency_id && !addedCourseIds.has(m.course_id)
    );

    matchingCourses?.forEach((match: any) => {
      addedCourseIds.add(match.course_id);
      recommendedItems.push({
        learning_path_id: pathId!,
        course_id: match.course_id,
        competency_id: gap.competency_id,
        priority: "high",
        sequence_order: sequence++,
        recommendation_reason: `Addresses critical ${gap.gap}-level gap in ${gap.competency_name} for ${compProfile.userDesignation} (Current: L${gap.current_level}, Target: L${gap.required_level})`,
      });
    });
  });

  // Second pass: Match Moderate Gaps (Gap == 1) -> Medium Priority
  const moderateGaps = compProfile.skillGaps.filter((g) => g.gap === 1);
  moderateGaps.forEach((gap) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchingCourses = courseMappings?.filter(
      (m: any) => m.competency_id === gap.competency_id && !addedCourseIds.has(m.course_id)
    );

    matchingCourses?.forEach((match: any) => {
      addedCourseIds.add(match.course_id);
      recommendedItems.push({
        learning_path_id: pathId!,
        course_id: match.course_id,
        competency_id: gap.competency_id,
        priority: "medium",
        sequence_order: sequence++,
        recommendation_reason: `Strengthens ${gap.competency_name} to achieve target Level ${gap.required_level}`,
      });
    });
  });

  // Fallback: If no gaps or new user with zero gaps, recommend foundational courses
  if (recommendedItems.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallbackCourses = courseMappings?.slice(0, 4);
    fallbackCourses?.forEach((match: any) => {
      if (!addedCourseIds.has(match.course_id)) {
        addedCourseIds.add(match.course_id);
        recommendedItems.push({
          learning_path_id: pathId!,
          course_id: match.course_id,
          competency_id: match.competency_id,
          priority: "low",
          sequence_order: sequence++,
          recommendation_reason: `Foundational capacity building module for official statistical workflows`,
        });
      }
    });
  }

  // 6. Insert recommended courses into learning_path_courses
  if (recommendedItems.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("learning_path_courses")
      .insert(recommendedItems);

    // Update total courses count on learning_path
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("learning_paths")
      .update({
        total_courses: recommendedItems.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pathId);
  }

  return await getLearningPathWithDetails(userId, pathId);
}

/**
 * Retrieves learning path with associated course items, progress, and hours
 */
export async function getLearningPathWithDetails(
  userId: string,
  pathId?: string
): Promise<LearningPathDetails> {
  const supabase = await createClient();

  // 1. Fetch path
  let query = (supabase as any).from("learning_paths").select("*").eq("user_id", userId);
  if (pathId) {
    query = query.eq("id", pathId);
  } else {
    query = query.eq("status", "active").order("created_at", { ascending: false }).limit(1);
  }

  const { data: path } = await query.maybeSingle();

  if (!path) {
    return {
      path: null,
      items: [],
      totalHours: 0,
      completedHours: 0,
      criticalGapsCovered: 0,
    };
  }

  // 2. Fetch path courses with course and competency details
  const { data: pathCourses } = await (supabase as any)
    .from("learning_path_courses")
    .select("*, course:courses(*), competency:competencies(*)")
    .eq("learning_path_id", path.id)
    .order("sequence_order");

  // 3. Fetch user progress for these courses
  const { data: progressRecords } = await (supabase as any)
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId);

  const progressMap = new Map<string, any>();
  progressRecords?.forEach((pr: any) => {
    progressMap.set(pr.course_id, pr);
  });

  let totalHours = 0;
  let completedHours = 0;
  let criticalGapsCovered = 0;
  let completedCount = 0;

  const items: LearningPathCourseItem[] = (pathCourses || []).map((item: any) => {
    const userProgress = progressMap.get(item.course_id) || null;
    const duration = Number(item.course?.duration_hours || 0);
    totalHours += duration;

    if (item.priority === "high") {
      criticalGapsCovered++;
    }

    if (userProgress?.status === "completed") {
      completedHours += duration;
      completedCount++;
    }

    return {
      id: item.id,
      priority: item.priority as RecommendationPriority,
      sequence_order: item.sequence_order,
      recommendation_reason: item.recommendation_reason,
      status: userProgress ? userProgress.status : item.status,
      course: item.course,
      competency: item.competency,
      user_progress: userProgress,
    };
  });

  // Update completed_courses count if changed
  if (path.completed_courses !== completedCount) {
    await (supabase as any)
      .from("learning_paths")
      .update({ completed_courses: completedCount, updated_at: new Date().toISOString() })
      .eq("id", path.id);
  }

  return {
    path: { ...path, completed_courses: completedCount },
    items,
    totalHours: Number(totalHours.toFixed(1)),
    completedHours: Number(completedHours.toFixed(1)),
    criticalGapsCovered,
  };
}

/**
 * Fetch all catalogue courses with optional search and provider/domain filters
 */
export async function getCatalogueCourses(
  userId?: string,
  searchQuery?: string,
  providerFilter?: string,
  levelFilter?: string
): Promise<CourseWithCompetencies[]> {
  const supabase = await createClient();

  let query = (supabase as any)
    .from("courses")
    .select("*, competencies:course_competencies(*, competency:competencies(*))")
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (providerFilter && providerFilter !== "all") {
    query = query.eq("provider", providerFilter);
  }

  if (levelFilter && levelFilter !== "all") {
    query = query.eq("level", levelFilter);
  }

  const { data: courses, error } = await query;
  if (error || !courses) return [];

  // Fetch progress if userId provided
  let progressMap = new Map<string, any>();
  if (userId) {
    const { data: progress } = await (supabase as any)
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId);
    progress?.forEach((p: any) => progressMap.set(p.course_id, p));
  }

  let result = courses.map((course: any) => ({
    ...course,
    user_progress: progressMap.get(course.id) || null,
  }));

  if (searchQuery && searchQuery.trim() !== "") {
    const term = searchQuery.toLowerCase();
    result = result.filter(
      (c: any) =>
        c.title.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.provider.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term)
    );
  }

  return result;
}

/**
 * Enroll user in a course or update progress status
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  status: CourseProgressStatus,
  progressPercentage: number = 0
) {
  const supabase = await createClient();

  // Fetch course duration to compute hours spent
  const { data: course } = await (supabase as any)
    .from("courses")
    .select("duration_hours")
    .eq("id", courseId)
    .single();

  const totalDuration = Number(course?.duration_hours || 4.0);
  const hoursSpent = Number(((progressPercentage / 100) * totalDuration).toFixed(1));
  const completedAt = status === "completed" ? new Date().toISOString() : null;

  const { error } = await (supabase as any)
    .from("user_course_progress")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        status,
        progress_percentage: progressPercentage,
        hours_spent: hoursSpent,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" }
    );

  if (error) {
    console.error("Error updating course progress:", error);
    return { error: "Failed to update course enrollment progress." };
  }

  revalidatePath("/learning");
  revalidatePath("/learning/catalogue");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Fetches user learning metrics summary (hours spent, courses completed, active courses)
 */
export async function getUserLearningSummary(userId: string) {
  const supabase = await createClient();

  const { data: progress } = await (supabase as any)
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId);

  let totalHoursSpent = 0;
  let completedCoursesCount = 0;
  let inProgressCount = 0;

  progress?.forEach((p: any) => {
    totalHoursSpent += Number(p.hours_spent || 0);
    if (p.status === "completed") completedCoursesCount++;
    if (p.status === "in_progress" || p.status === "enrolled") inProgressCount++;
  });

  return {
    totalHoursSpent: Number(totalHoursSpent.toFixed(1)),
    completedCoursesCount,
    inProgressCount,
    totalEnrolled: progress?.length || 0,
  };
}
