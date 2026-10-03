import React from "react";
import { Terminal, RefreshCw } from "lucide-react";

interface JobsHeaderProps {
  count: number;
  onRefresh: () => void;
}

export const JobsHeader: React.FC<JobsHeaderProps> = ({ count, onRefresh }) => (
  <div className="flex items-center justify-between border-b border-border pb-4">
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
        Execution Log & Monitoring
        <span className="text-xs px-2 py-0.5 font-mono bg-secondary text-muted-foreground border border-border">
          {count} jobs
        </span>
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        Real-time status tracking, duration telemetry & kernel stdout/stderr streams
      </p>
    </div>
    <button
      onClick={onRefresh}
      className="inline-flex items-center gap-1.5 border border-border bg-secondary hover:bg-secondary/80 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground transition-colors"
    >
      <RefreshCw className="h-3 w-3" />
      REFRESH
    </button>
  </div>
);
