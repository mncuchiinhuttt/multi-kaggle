import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Terminal, Download, ExternalLink, FileText, AlertCircle } from "lucide-react";
import type { Job } from "@/components/JobsTab";
import { JobSpecs } from "./JobSpecs";

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [outputs, setOutputs] = useState<Array<{ name: string; url: string; size?: number }>>([]);
  const [fullLog, setFullLog] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/jobs/${jobId}`).then((r) => r.json()),
      fetch(`/api/jobs/${jobId}/outputs`).then((r) => r.json()).catch(() => ({ ok: false })),
    ])
      .then(([jobRes, outputRes]) => {
        if (jobRes.ok && jobRes.data) {
          setJob(jobRes.data);
          setFullLog(jobRes.data.log_preview || "");
        } else {
          setError(jobRes.error || "Job not found");
        }
        if (outputRes.ok && outputRes.data) {
          if (outputRes.data.log) setFullLog(outputRes.data.log);
          if (outputRes.data.files) setOutputs(outputRes.data.files);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return <div className="p-12 text-center text-xs font-mono text-muted-foreground">Loading specs...</div>;
  }

  if (error || !job) {
    return (
      <div className="p-8 border border-destructive/30 bg-destructive/10 text-destructive font-mono text-xs space-y-3">
        <div className="font-bold uppercase flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error || "Job Not Found"}</div>
        <Link to="/jobs" className="text-primary hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link to="/jobs" className="p-1.5 border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors" title="Back to all jobs"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-foreground font-sans">{job.title}</h2>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 uppercase font-mono">{job.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{job.kernel_slug}</p>
          </div>
        </div>
        <a href={`https://www.kaggle.com/code/${job.kernel_slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs uppercase">
          Open on Kaggle <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <JobSpecs job={job} />

      <div className="border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-500" /> Generated Output Artifacts ({outputs.length} files)
          </h3>
        </div>
        {outputs.length === 0 ? (
          <div className="py-4 text-xs text-muted-foreground italic">No downloadable output files generated for this run.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outputs.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 border border-border text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-primary shrink-0" /><span className="truncate text-foreground font-semibold">{file.name}</span>
                </div>
                <a href={file.url} target="_blank" rel="noreferrer" download={file.name} className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-primary-foreground text-[10px] font-bold uppercase shrink-0 transition-colors">Download</a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" /> Full Kernel Output Stream & Stdout
          </h3>
          <span className="text-[10px] text-muted-foreground">UTF-8 Monospace Terminal</span>
        </div>
        <pre className="max-h-[500px] overflow-y-auto bg-black text-emerald-400 p-4 text-[11px] leading-relaxed whitespace-pre-wrap border border-border select-text">
          {fullLog || "No stdout or stderr stream logged for this session."}
        </pre>
      </div>
    </div>
  );
};
