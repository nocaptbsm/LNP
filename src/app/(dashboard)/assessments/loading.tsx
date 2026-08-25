// StatSkill AI — Assessments Section Loading State

import { Skeleton } from "@/components/ui/skeleton";

export default function AssessmentsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-5 w-80 rounded-lg" />
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    </div>
  );
}
