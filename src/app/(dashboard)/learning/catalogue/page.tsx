// StatSkill AI — Course Catalogue Explorer Page

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Library,
  Search,
  Filter,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCatalogueCourses } from "../actions";
import { CourseCard } from "@/components/learning/course-card";
import { CatalogueFilterView } from "./catalogue-filter-view";

export const metadata = {
  title: "Course Catalogue — StatSkill AI",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provider?: string; level?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const provider = resolvedParams.provider || "all";
  const level = resolvedParams.level || "all";

  const courses = await getCatalogueCourses(user.id, q, provider, level);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-xl gradient-navy p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300">
              <Library className="w-3.5 h-3.5" />
              Integrated National Training Repository
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Official Statistical Learning Catalogue
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Explore certified modules from <span className="text-white font-medium">iGOT Karmayogi</span>,{" "}
              <span className="text-white font-medium">NSSTA</span>, and MoSPI divisions designed for statistical capacity building.
            </p>
          </div>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/learning" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 h-auto py-3 px-5 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Learning Path
          </Button>
        </div>
      </div>

      {/* Interactive Filter and Search View */}
      <CatalogueFilterView
        initialCourses={courses}
        userId={user.id}
        initialQuery={q}
        initialProvider={provider}
        initialLevel={level}
      />
    </div>
  );
}
