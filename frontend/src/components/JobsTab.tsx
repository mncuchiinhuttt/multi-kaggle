import React, { useState } from "react";
import { Terminal, StopCircle, RefreshCw, Download } from "lucide-react";
import { OutputsModal } from "./OutputsModal";

export interface Job {
  id: string;
  account_id: string;
  kernel_slug: string;
  title: string;
  is_gpu: number;
  is_tpu?: number;
  status: "queued" | "running" | "complete" | "error" | "cancelled";
  start_time: number;
  duration_seconds: number;
  error_message: string | null;
  log_preview: string | null;
  output_urls: string | null;
}

interface JobsTabProps {
  jobs: Job[];
  onRefresh: () => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({ jobs, onRefresh }) => {
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [selectedOutputs, setSelectedOutputs] = useState<Array<{ name: string; url: string; size?: number }> | null>(null);
  const [loadingOutputs, setLoadingOutputs] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (confirm("Cancel this running kernel on Kaggle?")) {
      await fetch(`/api/jobs/${id}/cancel`, { method: "POST" });
      onRefresh();
    }
  };

  const handleFetchOutputs = async (job: Job) => {
    setLoadingOutputs(job.id);
    try {
      const res = await fetch(`/api/jobs/${job.id}/outputs`);
      const data = await res.json();
      if (data.ok && data.data?.files && data.data.files.length > 0) {
        setSelectedOutputs(data.data.files);
      } else {
        alert("No generated output files found for this run.");
      }
    } catch {
      alert("Failed to fetch output files.");
    } finally {
      setLoadingOutputs(null);
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            Execution Log & Monitoring
            <span className="text-xs px-2 py-0.5 font-mono bg-secondary text-muted-foreground border border-border">
              {jobs.length} jobs
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
                    <div className="font-sans font-medium text-foreground text-xs">{job.title}</div>
                    <div className="text-[11px] text-muted-foreground">{job.kernel_slug}</div>
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
                    {job.log_preview && (
                      <button
                        onClick={() => setSelectedLog(job.log_preview)}
                        className="inline-flex items-center gap-1 text-primary hover:underline uppercase text-[11px] font-medium"
                      >
                        <Terminal className="h-3 w-3" />
                        LOGS
                      </button>
                    )}
                    {job.status === "complete" && (
                      <button
                        onClick={() => handleFetchOutputs(job)}
                        disabled={loadingOutputs === job.id}
                        className="inline-flex items-center gap-1 text-emerald-500 hover:underline uppercase text-[11px] font-medium"
                      >
                        <Download className="h-3 w-3" />
                        {loadingOutputs === job.id ? "PULLING..." : "OUTPUTS"}
                      </button>
                    )}
                    {(job.status === "running" || job.status === "queued") && (
                      <button
                        onClick={() => handleCancel(job.id)}
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

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-3xl border border-border bg-card p-4 space-y-3 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                EXECUTION OUTPUT STREAM
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs font-mono uppercase px-2 py-0.5 bg-secondary border border-border text-muted-foreground hover:text-foreground"
              >
                CLOSE [ESC]
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto bg-black text-emerald-400 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-border">
              {selectedLog}
            </pre>
          </div>
        </div>
      )}

      {selectedOutputs && (
        <OutputsModal outputs={selectedOutputs} onClose={() => setSelectedOutputs(null)} />
      )}
    </div>
  );
};
