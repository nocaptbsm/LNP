// StatSkill AI — Learning Section Loading State

import { Skeleton } from "@/components/ui/skeleton";

export default function LearningLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
