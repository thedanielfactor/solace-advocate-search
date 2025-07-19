import React, { memo, useMemo } from "react";
import type { Advocate } from "@/types";

interface AdvocateStatsProps {
  advocates: Advocate[];
  filteredCount: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard = memo(function StatCard({ title, value, icon, color }: StatCardProps): JSX.Element {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        padding: "1rem",
        textAlign: "center",
        flex: 1,
        minWidth: "120px"
      }}
    >
      <div 
        style={{
          fontSize: "1.5rem",
          marginBottom: "0.5rem"
        }}
      >
        {icon}
      </div>
      <div 
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color,
          marginBottom: "0.25rem"
        }}
      >
        {value}
      </div>
      <div 
        style={{
          fontSize: "0.875rem",
          color: "#6c757d",
          fontWeight: "500"
        }}
      >
        {title}
      </div>
    </div>
  );
});

export const AdvocateStats = memo(function AdvocateStats({ 
  advocates, 
  filteredCount 
}: AdvocateStatsProps): JSX.Element | null {
  const stats = useMemo(() => {
    const totalAdvocates = advocates.length;
    const averageExperience = totalAdvocates > 0 
      ? Math.round(advocates.reduce((sum, a) => sum + a.yearsOfExperience, 0) / totalAdvocates)
      : 0;
    
    const uniqueCities = new Set(advocates.map(a => a.city)).size;
    const uniqueDegrees = new Set(advocates.map(a => a.degree)).size;

    return {
      total: totalAdvocates,
      filtered: filteredCount,
      averageExperience,
      uniqueCities,
      uniqueDegrees
    };
  }, [advocates, filteredCount]);

  if (advocates.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1.1rem",
          fontWeight: "600",
          color: "#343a40"
        }}
      >
        Advocate Statistics
      </h3>
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem"
        }}
      >
        <StatCard
          title="Total Advocates"
          value={stats.total}
          icon="👥"
          color="#007bff"
        />
        <StatCard
          title="Showing"
          value={stats.filtered}
          icon="👁️"
          color="#28a745"
        />
        <StatCard
          title="Avg. Experience"
          value={`${stats.averageExperience} years`}
          icon="📈"
          color="#ffc107"
        />
        <StatCard
          title="Cities"
          value={stats.uniqueCities}
          icon="🌍"
          color="#17a2b8"
        />
        <StatCard
          title="Degrees"
          value={stats.uniqueDegrees}
          icon="🎓"
          color="#6f42c1"
        />
      </div>
    </div>
  );
}); 