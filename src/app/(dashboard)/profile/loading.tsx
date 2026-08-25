// StatSkill AI — Profile Section Loading State

import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-5 w-80 rounded-lg" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
