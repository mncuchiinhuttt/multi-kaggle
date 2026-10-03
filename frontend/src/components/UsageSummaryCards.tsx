import React from "react";
import { Clock, Cpu, Zap, Flame, Award, CheckCircle2 } from "lucide-react";

interface UsageSummaryCardsProps {
  summary: {
    totalJobs: number;
    totalHours: number;
    gpuHours: number;
    tpuHours: number;
    cpuHours: number;
    currentStreak: number;
    longestStreak: number;
    successRate: number;
  };
}

export const UsageSummaryCards: React.FC<UsageSummaryCardsProps> = ({ summary }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Total Runtime */}
    <div className="border border-border bg-card p-4 space-y-1 font-mono">
      <div className="text-[11px] text-muted-foreground uppercase flex items-center justify-between">
        <span>TOTAL RUNTIME</span>
        <Clock className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="text-2xl font-bold text-foreground">
        {summary.totalHours.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">hrs</span>
      </div>
      <div className="text-[10px] text-muted-foreground flex items-center gap-2 pt-1 border-t border-border">
        <span>GPU: {summary.gpuHours}h</span>
        <span>TPU: {summary.tpuHours}h</span>
      </div>
    </div>

    {/* Jobs & Success Rate */}
    <div className="border border-border bg-card p-4 space-y-1 font-mono">
      <div className="text-[11px] text-muted-foreground uppercase flex items-center justify-between">
        <span>TOTAL DISPATCHES</span>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="text-2xl font-bold text-foreground">
        {summary.totalJobs} <span className="text-xs text-muted-foreground font-normal">jobs</span>
      </div>
      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border">
        <span>Success Rate:</span>
        <span className="text-emerald-500 font-bold">{summary.successRate}%</span>
      </div>
    </div>

    {/* Current Streak */}
    <div className="border border-border bg-card p-4 space-y-1 font-mono">
      <div className="text-[11px] text-muted-foreground uppercase flex items-center justify-between">
        <span>CURRENT STREAK</span>
        <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
      </div>
      <div className="text-2xl font-bold text-foreground flex items-center gap-2">
        {summary.currentStreak} <span className="text-xs text-muted-foreground font-normal">days</span>
      </div>
      <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
        {summary.currentStreak > 0 ? "Active compute streak!" : "No jobs run today yet"}
      </div>
    </div>

    {/* Longest Streak */}
    <div className="border border-border bg-card p-4 space-y-1 font-mono">
      <div className="text-[11px] text-muted-foreground uppercase flex items-center justify-between">
        <span>RECORD STREAK</span>
        <Award className="h-3.5 w-3.5 text-indigo-400" />
      </div>
      <div className="text-2xl font-bold text-foreground">
        {summary.longestStreak} <span className="text-xs text-muted-foreground font-normal">days</span>
      </div>
      <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
        Highest consecutive active days
      </div>
    </div>
  </div>
);
