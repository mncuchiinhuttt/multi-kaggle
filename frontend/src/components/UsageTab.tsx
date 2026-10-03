import React, { useState, useEffect } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { HeatmapGrid } from "./HeatmapGrid";
import { UsageSummaryCards } from "./UsageSummaryCards";

export interface DayActivity {
  date: string;
  count: number;
  totalSeconds: number;
  gpuSeconds: number;
  tpuSeconds: number;
}

export interface AnalyticsSummary {
  totalJobs: number;
  totalHours: number;
  gpuHours: number;
  tpuHours: number;
  cpuHours: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
  dailyHeatmap: DayActivity[];
}

export const UsageTab: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics?days=154"); // 22 weeks of 7 days
      const json = await res.json();
      if (json.ok) setData(json.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!data) {
    return (
      <div className="p-8 text-center text-xs font-mono text-muted-foreground">
        Loading compute analytics...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Compute & Usage Analytics
            </h2>
            <span className="text-xs px-2 py-0.5 font-mono bg-primary/10 text-primary border border-primary/30 uppercase">
              Telemetry
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Long-term GPU/TPU hours tracking, GitHub-style commit heatmap, and daily streak metrics
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 border border-border bg-secondary hover:bg-secondary/80 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-primary" : ""}`} />
          REFRESH
        </button>
      </div>

      <UsageSummaryCards summary={data} />
      <HeatmapGrid days={data.dailyHeatmap} />
    </div>
  );
};
