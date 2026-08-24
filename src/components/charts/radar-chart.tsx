// StatSkill AI — Competency Radar Chart Component

"use client";

import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts";
import type { DomainOverview } from "@/types";

interface CompetencyRadarChartProps {
  domains: DomainOverview[];
}

export function CompetencyRadarChart({ domains }: CompetencyRadarChartProps) {
  // Format data for Recharts Radar
  const chartData = domains.map((domain) => ({
    domainName: domain.domain_name.split(" ")[0], // Truncated label for axis
    fullDomainName: domain.domain_name,
    "Current Level": domain.current_avg,
    "Target Level": domain.required_avg,
  }));

  if (domains.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No domain data available.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="currentColor" className="text-border" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="domainName"
            tick={{ fill: "currentColor", fontSize: 12, fontWeight: 500 }}
            className="text-foreground"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tickCount={6}
            tick={{ fill: "currentColor", fontSize: 10 }}
            className="text-muted-foreground"
          />
          <Radar
            name="Current Level"
            dataKey="Current Level"
            stroke="#f59e0b" // Saffron / Amber
            fill="#f59e0b"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Radar
            name="Target Level"
            dataKey="Target Level"
            stroke="#1e3a8a" // Navy
            fill="#1e3a8a"
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              borderRadius: "0.5rem",
              color: "var(--card-foreground)",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
