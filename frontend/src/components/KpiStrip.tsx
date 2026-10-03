import React from "react";
import { Cpu, Activity, Terminal, Zap } from "lucide-react";
import type { Account } from "./AccountsTab";

interface KpiStripProps {
  accounts: Account[];
  runningJobsCount: number;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ accounts, runningJobsCount }) => {
  const totalGpuRemaining = accounts.reduce((acc, a) => acc + (a.gpuHoursRemaining ?? 30), 0);
  const totalTpuRemaining = accounts.reduce((acc, a) => acc + (a.tpuHoursRemaining ?? 20), 0);

  return (
    <section className="border-b border-border bg-secondary/30 w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">ACTIVE POOL:</span>
          <span className="font-semibold text-foreground">
            {accounts.filter((a) => a.status === "active").length} / {accounts.length} ACCS
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">GPU POOL:</span>
          <span className="font-semibold text-foreground">
            {totalGpuRemaining.toFixed(1)}h
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-muted-foreground">TPU POOL:</span>
          <span className="font-semibold text-foreground">
            {totalTpuRemaining.toFixed(1)}h
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-muted-foreground">ACTIVE JOBS:</span>
          <span className="font-semibold text-foreground">{runningJobsCount} SESSIONS</span>
        </div>
      </div>
    </section>
  );
};
