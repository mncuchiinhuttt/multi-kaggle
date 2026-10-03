import React, { useState } from "react";
import { Terminal, StopCircle, Download } from "lucide-react";
import { OutputsModal } from "./OutputsModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { AlertDialog } from "./AlertDialog";
import { JobsHeader } from "./JobsHeader";
import { LogViewerModal } from "./LogViewerModal";

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
  const [cancelingJob, setCancelingJob] = useState<Job | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; variant?: "info" | "error" } | null>(null);

  const confirmCancel = async () => {
    if (!cancelingJob) return;
    setIsCanceling(true);
    try {
      await fetch(`/api/jobs/${cancelingJob.id}/cancel`, { method: "POST" });
      setCancelingJob(null);
      onRefresh();
    } finally {
      setIsCanceling(false);
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
        setAlertInfo({
          title: "No Outputs Generated",
          message: `The kernel execution "${job.title}" finished without producing any downloadable output artifacts. Check the stdout log stream for details.`,
          variant: "info",
        });
      }
    } catch {
      setAlertInfo({
        title: "Connection Error",
        message: "Failed to communicate with the Kaggle outputs telemetry bridge. Please check network connection or proxy settings.",
        variant: "error",
      });
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
      <JobsHeader count={jobs.length} onRefresh={onRefresh} />

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
                        onClick={() => setCancelingJob(job)}
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
        <LogViewerModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      {selectedOutputs && (
        <OutputsModal outputs={selectedOutputs} onClose={() => setSelectedOutputs(null)} />
      )}

      <ConfirmDeleteDialog
        open={Boolean(cancelingJob)}
        title="Abort Kernel Execution"
        username={cancelingJob?.kernel_slug}
        accountLabel={cancelingJob?.title}
        deleting={isCanceling}
        onConfirm={confirmCancel}
        onClose={() => setCancelingJob(null)}
      />

      <AlertDialog
        open={Boolean(alertInfo)}
        title={alertInfo?.title}
        message={alertInfo?.message || ""}
        variant={alertInfo?.variant}
        onClose={() => setAlertInfo(null)}
      />
    </div>
  );
};
