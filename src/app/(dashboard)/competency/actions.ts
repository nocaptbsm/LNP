// StatSkill AI — Competency Actions & Analytics Service

"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  DomainOverview,
  SkillGapItem,
  CompetencyWithDomain,
} from "@/types";

export interface CompetencyProfileData {
  userDesignation: string;
  overallScorePercentage: number;
  totalCompetenciesAssessed: number;
  criticalGapsCount: number;
  domainOverviews: DomainOverview[];
  skillGaps: SkillGapItem[];
  topSkillGaps: SkillGapItem[];
  allCompetencies: (CompetencyWithDomain & {
    required_level: number;
    current_level: number;
  })[];
}

/**
 * Main analytics function to calculate user skill gaps and domain overviews
 */
export async function getCompetencyProfileData(
  userId: string
): Promise<CompetencyProfileData> {
  const supabase = await createClient();

  // 1. Get user profile designation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("designation")
    .eq("id", userId)
    .single();

  const userDesignation = profile?.designation || "Junior Statistical Officer";

  // 2. Fetch all domains
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: domains } = await (supabase as any)
    .from("domains")
    .select("*")
    .order("name");

  // 3. Fetch all competencies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: competencies } = await (supabase as any)
    .from("competencies")
    .select("*, domain:domains(*)");

  // 4. Fetch target role requirements for user's designation (fallback to 'Default')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: roleRequirements } = await (supabase as any)
    .from("role_competencies")
    .select("*")
    .eq("designation", userDesignation);

  if (!roleRequirements || roleRequirements.length === 0) {
    // Fallback to Default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: defaultReqs } = await (supabase as any)
      .from("role_competencies")
      .select("*")
      .eq("designation", "Default");
    roleRequirements = defaultReqs || [];
  }

  const reqMap = new Map<string, number>();
  roleRequirements?.forEach((r: { competency_id: string; required_level: number }) => {
    reqMap.set(r.competency_id, r.required_level);
  });

  // 5. Fetch user's current assessed competency levels
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userLevels } = await (supabase as any)
    .from("user_competencies")
    .select("*")
    .eq("user_id", userId);

  const currentLevelMap = new Map<string, number>();
  userLevels?.forEach((ul: { competency_id: string; current_level: number }) => {
    currentLevelMap.set(ul.competency_id, ul.current_level);
  });

  // 6. Build skill gap list & domain metrics
  const skillGaps: SkillGapItem[] = [];
  const domainStatsMap = new Map<
    string,
    { currentSum: number; reqSum: number; count: number; name: string; code: string; icon: string }
  >();

  // Initialize domain stats
  domains?.forEach((d: { id: string; name: string; code: string; icon_name: string }) => {
    domainStatsMap.set(d.id, {
      currentSum: 0,
      reqSum: 0,
      count: 0,
      name: d.name,
      code: d.code,
      icon: d.icon_name || "Award",
    });
  });

  let totalCurrentPoints = 0;
  let totalRequiredPoints = 0;
  let criticalGapsCount = 0;
  let totalCompetenciesAssessed = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allCompetenciesList: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  competencies?.forEach((comp: any) => {
    const requiredLevel = reqMap.get(comp.id) || 3; // default to 3 if unmapped
    const currentLevel = currentLevelMap.get(comp.id) || 0; // 0 if unassessed
    const gap = requiredLevel - currentLevel;

    if (currentLevel > 0) totalCompetenciesAssessed++;

    totalCurrentPoints += currentLevel;
    totalRequiredPoints += requiredLevel;

    let status: SkillGapItem["status"] = "met";
    if (gap >= 2) {
      status = "critical_gap";
      criticalGapsCount++;
    } else if (gap === 1) {
      status = "moderate_gap";
    } else if (gap < 0) {
      status = "exceeded";
    }

    skillGaps.push({
      competency_id: comp.id,
      competency_name: comp.name,
      competency_code: comp.code,
      domain_name: comp.domain?.name || "General",
      domain_code: comp.domain?.code || "general",
      current_level: currentLevel,
      required_level: requiredLevel,
      gap: Math.max(0, gap),
      status,
    });

    allCompetenciesList.push({
      ...comp,
      required_level: requiredLevel,
      current_level: currentLevel,
    });

    // Accumulate domain stats
    const domainStat = domainStatsMap.get(comp.domain_id);
    if (domainStat) {
      domainStat.currentSum += currentLevel;
      domainStat.reqSum += requiredLevel;
      domainStat.count += 1;
    }
  });

  // Calculate domain overviews
  const domainOverviews: DomainOverview[] = [];
  domainStatsMap.forEach((stat, domainId) => {
    domainOverviews.push({
      domain_id: domainId,
      domain_name: stat.name,
      domain_code: stat.code,
      icon_name: stat.icon,
      current_avg: stat.count > 0 ? Number((stat.currentSum / stat.count).toFixed(1)) : 0,
      required_avg: stat.count > 0 ? Number((stat.reqSum / stat.count).toFixed(1)) : 0,
      total_competencies: stat.count,
    });
  });

  // Sort skill gaps by gap descending
  skillGaps.sort((a, b) => b.gap - a.gap);
  const topSkillGaps = skillGaps.filter((item) => item.gap > 0).slice(0, 5);

  const overallScorePercentage =
    totalRequiredPoints > 0
      ? Math.min(100, Math.round((totalCurrentPoints / totalRequiredPoints) * 100))
      : 0;

  return {
    userDesignation,
    overallScorePercentage,
    totalCompetenciesAssessed,
    criticalGapsCount,
    domainOverviews,
    skillGaps,
    topSkillGaps,
    allCompetencies: allCompetenciesList,
  };
}
