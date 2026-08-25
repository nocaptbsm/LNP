// StatSkill AI — Competency Section Loading State

import { Skeleton } from "@/components/ui/skeleton";

export default function CompetencyLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-10 w-72 rounded-lg" />
      <Skeleton className="h-6 w-96 rounded-lg" />
      <div className="grid lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
