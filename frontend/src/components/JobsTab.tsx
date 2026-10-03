import React, { useState } from "react";
import { OutputsModal } from "./OutputsModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { AlertDialog } from "./AlertDialog";
import { JobsHeader } from "./JobsHeader";
import { LogViewerModal } from "./LogViewerModal";
import { JobsTable } from "./JobsTable";

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

  return (
    <div className="space-y-6">
      <JobsHeader count={jobs.length} onRefresh={onRefresh} />

      <JobsTable
        jobs={jobs}
        loadingOutputs={loadingOutputs}
        onFetchOutputs={handleFetchOutputs}
        onOpenLog={setSelectedLog}
        onCancelJob={setCancelingJob}
      />

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
