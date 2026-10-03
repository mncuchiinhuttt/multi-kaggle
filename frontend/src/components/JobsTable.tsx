import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Download, StopCircle } from "lucide-react";
import type { Job } from "./JobsTab";

interface JobsTableProps {
  jobs: Job[];
  loadingOutputs: string | null;
  onFetchOutputs: (job: Job) => void;
  onOpenLog: (log: string) => void;
  onCancelJob: (job: Job) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  loadingOutputs,
  onFetchOutputs,
  onOpenLog,
  onCancelJob,
}) => {
  const getStatusBadge = (status: Job["status"]) => {
    switch (status) {
      case "running":
        return <span className="px-1.5 py-0.5 text-[11px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30">RUNNING</span>;
      case "complete":
        return <span className="px-1.5 py-0.5 text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">COMPLETE</span>;
      case "error":
        return <span className="px-1.5 py-0.5 text-[11px] font-mono uppercase bg-destructive/10 text-destructive border-destructive/30">ERROR</span>;
      case "cancelled":
        return <span className="px-1.5 py-0.5 text-[11px] font-mono uppercase bg-secondary text-muted-foreground border border-border">CANCELLED</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[11px] font-mono uppercase bg-blue-500/10 text-blue-500 border border-blue-500/30">QUEUED</span>;
    }
  };

  return (
    <div className="border border-border bg-card overflow-x-auto">
      <table className="w-full text-left text-xs text-muted-foreground">
        <thead className="bg-secondary/50 font-mono text-[11px] uppercase text-muted-foreground border-b border-border select-none">
          <tr>
            <th className="px-4 py-3 font-semibold">Kernel Title & Slug</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Hardware</th>
            <th className="px-4 py-3 font-semibold">Duration</th>
            <th className="px-4 py-3 font-semibold">Timestamp</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border font-mono text-xs">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                No execution jobs recorded yet. Dispatch a notebook to view telemetry.
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="group block"
                    title="Click to view detailed specs & full output logs"
                  >
                    <div className="font-sans font-medium text-foreground text-xs group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {job.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono group-hover:text-foreground">
                      {job.kernel_slug}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] px-1.5 py-0.5 bg-secondary text-foreground border border-border">
                    {job.is_tpu ? "TPU v3-8" : job.is_gpu ? "GPU T4/P100" : "CPU"}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {Math.round(job.duration_seconds / 60)}m ({job.duration_seconds}s)
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(job.start_time).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline uppercase text-[11px] font-medium"
                  >
                    <Terminal className="h-3 w-3" />
                    DETAILS
                  </Link>
                  {job.status === "complete" && (
                    <button
                      onClick={() => onFetchOutputs(job)}
                      disabled={loadingOutputs === job.id}
                      className="inline-flex items-center gap-1 text-emerald-500 hover:underline uppercase text-[11px] font-medium"
                    >
                      <Download className="h-3 w-3" />
                      {loadingOutputs === job.id ? "PULLING..." : "OUTPUTS"}
                    </button>
                  )}
                  {(job.status === "running" || job.status === "queued") && (
                    <button
                      onClick={() => onCancelJob(job)}
                      className="inline-flex items-center gap-1 text-destructive hover:underline uppercase text-[11px] font-medium"
                    >
                      <StopCircle className="h-3 w-3" />
                      ABORT
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
