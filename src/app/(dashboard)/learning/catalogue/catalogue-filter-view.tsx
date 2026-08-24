// StatSkill AI — Catalogue Filter View Client Component

"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, BookOpen, Layers } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/learning/course-card";
import type { CourseWithCompetencies } from "@/types";

interface CatalogueFilterViewProps {
  initialCourses: CourseWithCompetencies[];
  userId: string;
  initialQuery: string;
  initialProvider: string;
  initialLevel: string;
}

export function CatalogueFilterView({
  initialCourses,
  userId,
  initialQuery,
  initialProvider,
  initialLevel,
}: CatalogueFilterViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialQuery);
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);

  const applyFilters = (queryVal: string, providerVal: string, levelVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (queryVal) params.set("q", queryVal);
    else params.delete("q");

    if (providerVal && providerVal !== "all") params.set("provider", providerVal);
    else params.delete("provider");

    if (levelVal && levelVal !== "all") params.set("level", levelVal);
    else params.delete("level");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, selectedProvider, selectedLevel);
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    applyFilters(search, provider, selectedLevel);
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    applyFilters(search, selectedProvider, level);
  };

  const providers = ["all", "iGOT Karmayogi", "NSSTA", "TPAC", "MoSPI DIID"];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl border bg-card space-y-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by topic, skill, tool (e.g. Python, Sampling, NIF, SQL)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="gradient-navy text-white px-6">
            Search
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t text-xs">
          {/* Provider Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Provider:
            </span>
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => handleProviderSelect(p)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-all
                  ${
                    selectedProvider === p
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }
                `}
              >
                {p === "all" ? "All Providers" : p}
              </button>
            ))}
          </div>

          {/* Level Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Level:
            </span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelSelect(lvl)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-all
                  ${
                    selectedLevel === lvl
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }
                `}
              >
                {lvl === "all" ? "All Levels" : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{initialCourses.length}</span> certified courses
          </p>
        </div>

        {initialCourses.length === 0 ? (
          <div className="py-16 text-center border rounded-xl bg-card">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No Matching Courses Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              Try adjusting your search keywords or clearing your provider/level filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setSelectedProvider("all");
                setSelectedLevel("all");
                applyFilters("", "all", "all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialCourses.map((course) => (
              <CourseCard key={course.id} course={course} userId={userId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
