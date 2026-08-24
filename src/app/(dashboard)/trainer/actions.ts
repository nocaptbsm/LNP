// StatSkill AI — Trainer Services & Server Actions

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TrainingMaterial, GeneratedQuestion, Quiz, QuestionStatus } from "@/types";

// Static Question Bank for simulated LLM generation based on competency
const SIMULATED_QUESTIONS_DATABASE: Record<
  string,
  Omit<GeneratedQuestion, "id" | "material_id" | "created_at" | "status">[]
> = {
  // Survey Sampling (c101)
  "c1010000-0000-0000-0000-000000000000": [
    {
      competency_id: "c1010000-0000-0000-0000-000000000000",
      question_text: "What is the primary benefit of stratified random sampling compared to simple random sampling?",
      option_a: "It is always cheaper to conduct",
      option_b: "It ensures representative representation of key sub-populations (strata) and reduces variance",
      option_c: "It requires no knowledge of the population structure beforehand",
      option_d: "It eliminates sample selection bias entirely",
      correct_option: "B",
      explanation: "Stratification ensures that subsets of the population are represented proportionally, improving precision and reducing sampling error.",
      difficulty: "Intermediate",
    },
    {
      competency_id: "c1010000-0000-0000-0000-000000000000",
      question_text: "Which sampling design is most appropriate when a complete sampling frame of individuals is unavailable, but clusters (like villages or blocks) are identifiable?",
      option_a: "Simple Random Sampling",
      option_b: "Systematic Sampling",
      option_c: "Cluster Sampling",
      option_d: "Quota Sampling",
      correct_option: "C",
      explanation: "Cluster sampling divides the population into naturally occurring groups when individual sampling frames are hard to construct.",
      difficulty: "Beginner",
    },
    {
      competency_id: "c1010000-0000-0000-0000-000000000000",
      question_text: "In multi-stage sampling, what is the design effect (Deff) used for?",
      option_a: "To measure the speed of data collection",
      option_b: "To quantify the inflation of variance due to clustering compared to simple random sampling",
      option_c: "To calculate field interviewer travel costs",
      option_d: "To check the formatting of digital survey sheets",
      correct_option: "B",
      explanation: "The design effect compares the variance of the estimator under complex design vs simple random sampling to determine effective sample size.",
      difficulty: "Advanced",
    },
  ],
  // Python (c201)
  "c2010000-0000-0000-0000-000000000000": [
    {
      competency_id: "c2010000-0000-0000-0000-000000000000",
      question_text: "Which Pandas function is used to handle and fill missing (NaN) values in a DataFrame?",
      option_a: "df.dropna()",
      option_b: "df.fillna()",
      option_c: "df.replace()",
      option_d: "df.impute()",
      correct_option: "B",
      explanation: "df.fillna() replaces missing NaN values with specific scalars or interpolated values.",
      difficulty: "Beginner",
    },
    {
      competency_id: "c2010000-0000-0000-0000-000000000000",
      question_text: "In Python, which visualization library serves as the core foundation that Seaborn is built upon?",
      option_a: "Plotly",
      option_b: "Matplotlib",
      option_c: "Bokeh",
      option_d: "ggplot",
      correct_option: "B",
      explanation: "Seaborn is a high-level statistical plotting wrapper built on top of Matplotlib's layout engine.",
      difficulty: "Beginner",
    },
    {
      competency_id: "c2010000-0000-0000-0000-000000000000",
      question_text: "Which method in Pandas allows applying a custom statistical function to each group after a groupby() operation?",
      option_a: "transform()",
      option_b: "apply()",
      option_c: "map()",
      option_d: "filter()",
      correct_option: "B",
      explanation: "df.groupby(...).apply(func) executes a custom user function on each grouped sub-dataframe.",
      difficulty: "Intermediate",
    },
  ],
  // Time Series (c103)
  "c1030000-0000-0000-0000-000000000000": [
    {
      competency_id: "c1030000-0000-0000-0000-000000000000",
      question_text: "What does the 'I' represent in the ARIMA model for time-series forecasting?",
      option_a: "Inference",
      option_b: "Integrated (differencing order to achieve stationarity)",
      option_c: "Interpolation",
      option_d: "Intervals",
      correct_option: "B",
      explanation: "Integrated represents the differencing steps (d) required to stabilize the mean and remove non-stationary trends.",
      difficulty: "Intermediate",
    },
  ],
  // NIF (c301)
  "c3010000-0000-0000-0000-000000000000": [
    {
      competency_id: "c3010000-0000-0000-0000-000000000000",
      question_text: "Which division of MoSPI is primarily responsible for compiling and tracking indicators under the National Indicator Framework (NIF)?",
      option_a: "DIID (Data Informatics & Innovation Division)",
      option_b: "SSD (Social Statistics Division)",
      option_c: "NAD (National Accounts Division)",
      option_d: "FOD (Field Operations Division)",
      correct_option: "B",
      explanation: "The Social Statistics Division (SSD) acts as the nodal agency within MoSPI for monitoring the National Indicator Framework and SDG indicators.",
      difficulty: "Intermediate",
    },
  ],
};

/**
 * Registers an uploaded material and generates 3-5 competency questions (simulates AI parsing)
 */
export async function uploadMaterialAndGenerateQuestions(data: {
  title: string;
  description: string;
  fileName: string;
  fileSizeKb: number;
  uploadedBy: string;
  competencyId: string;
  difficulty: string;
}) {
  const supabase = await createClient();

  // 1. Insert Material Record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: material, error: matError } = await (supabase as any)
    .from("training_materials")
    .insert({
      title: data.title,
      description: data.description,
      file_name: data.fileName,
      file_size_kb: data.fileSizeKb,
      uploaded_by: data.uploadedBy,
      competency_id: data.competencyId,
      status: "processed",
    })
    .select()
    .single();

  if (matError || !material) {
    console.error("Error inserting material:", matError);
    return { error: "Failed to upload training material record." };
  }

  // 2. Fetch templates matching competency, or fallback to R package templates
  const templateQuestions =
    SIMULATED_QUESTIONS_DATABASE[data.competencyId] ||
    SIMULATED_QUESTIONS_DATABASE["c2010000-0000-0000-0000-000000000000"]; // fallback to Python questions

  // Create custom AI-like prompts questions based on the uploaded file info
  const questionsToInsert = templateQuestions.map((q) => ({
    material_id: material.id,
    competency_id: data.competencyId,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    explanation: `Generated from manual: "${data.title}". ${q.explanation}`,
    difficulty: data.difficulty,
    status: "pending_review",
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: qError } = await (supabase as any)
    .from("generated_questions")
    .insert(questionsToInsert);

  if (qError) {
    console.error("Error creating generated questions:", qError);
    return { error: "Failed to generate assessment questions from material." };
  }

  revalidatePath("/trainer/quizzes");
  return { success: true, materialId: material.id };
}

/**
 * Updates status and text content of a generated question (trainer approval flow)
 */
export async function reviewGeneratedQuestion(
  questionId: string,
  status: QuestionStatus,
  fields: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "A" | "B" | "C" | "D";
    explanation: string;
  }
) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("generated_questions")
    .update({
      status,
      question_text: fields.question_text,
      option_a: fields.option_a,
      option_b: fields.option_b,
      option_c: fields.option_c,
      option_d: fields.option_d,
      correct_option: fields.correct_option,
      explanation: fields.explanation,
    })
    .eq("id", questionId);

  if (error) {
    console.error("Error reviewing question:", error);
    return { error: "Failed to save question review." };
  }

  revalidatePath("/trainer/quizzes");
  return { success: true };
}

/**
 * Bundles approved questions into a published quiz
 */
export async function createQuizFromApprovedQuestions(data: {
  title: string;
  description: string;
  competencyId: string;
  targetLevel: number;
  passingScore: number;
  questionIds: string[];
  userId: string;
}) {
  const supabase = await createClient();

  // 1. Create Quiz Header
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: quiz, error: quizError } = await (supabase as any)
    .from("quizzes")
    .insert({
      title: data.title,
      description: data.description,
      competency_id: data.competencyId,
      target_level: data.targetLevel,
      passing_score: data.passingScore,
      created_by: data.userId,
      is_published: true,
    })
    .select()
    .single();

  if (quizError || !quiz) {
    console.error("Error creating quiz:", quizError);
    return { error: "Failed to initialize quiz record." };
  }

  // 2. Fetch original questions to copy details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sourceQuestions } = await (supabase as any)
    .from("generated_questions")
    .select("*")
    .in("id", data.questionIds);

  if (!sourceQuestions || sourceQuestions.length === 0) {
    return { error: "No valid questions were selected." };
  }

  // 3. Insert Quiz Questions
  const quizQuestions = sourceQuestions.map((q: any, idx: number) => ({
    quiz_id: quiz.id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    explanation: q.explanation,
    sequence_order: idx + 1,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: mappingError } = await (supabase as any)
    .from("quiz_questions")
    .insert(quizQuestions);

  if (mappingError) {
    console.error("Error mapping quiz questions:", mappingError);
    return { error: "Failed to attach questions to quiz." };
  }

  // 4. Update status of original questions to mark them as approved and processed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("generated_questions")
    .update({ status: "approved" })
    .in("id", data.questionIds);

  revalidatePath("/trainer/quizzes");
  revalidatePath("/assessments");
  return { success: true, quizId: quiz.id };
}

/**
 * Fetch Trainer Dashboard Summary Data
 */
export async function getTrainerDashboardData(userId: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: materials } = await (supabase as any)
    .from("training_materials")
    .select("*, competency:competencies(*)")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });

  // Fetch pending review questions count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: pendingQuestionsCount } = await (supabase as any)
    .from("generated_questions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_review");

  // Fetch published quizzes count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: publishedQuizzesCount } = await (supabase as any)
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)
    .eq("is_published", true);

  // Fetch all pending questions with materials/competency info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pendingQuestions } = await (supabase as any)
    .from("generated_questions")
    .select("*, competency:competencies(*), material:training_materials(*)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  // Fetch published quizzes detail
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: quizzes } = await (supabase as any)
    .from("quizzes")
    .select("*, competency:competencies(*), questions:quiz_questions(*)")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  return {
    materials: materials || [],
    pendingQuestionsCount: pendingQuestionsCount || 0,
    publishedQuizzesCount: publishedQuizzesCount || 0,
    pendingQuestions: (pendingQuestions || []) as (GeneratedQuestion & {
      competency: { name: string };
      material: { title: string };
    })[],
    quizzes: (quizzes || []) as (Quiz & {
      competency: { name: string };
      questions: any[];
    })[],
  };
}
