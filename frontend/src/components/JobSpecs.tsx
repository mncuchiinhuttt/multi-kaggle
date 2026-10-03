import React from "react";
import { Cpu, Clock, Globe, HardDrive } from "lucide-react";
import type { Job } from "@/components/JobsTab";

interface JobSpecsProps {
  job: Job;
}

export const JobSpecs: React.FC<JobSpecsProps> = ({ job }) => {
  const durationMin = Math.round(job.duration_seconds / 60);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="border border-border bg-card p-4 space-y-1">
        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
          <Cpu className="h-3 w-3 text-primary" /> Hardware Specs
        </span>
        <div className="text-sm font-bold text-foreground">
          {job.is_tpu ? "TPU v3-8 (128GB HBM)" : job.is_gpu ? "GPU 2x Nvidia T4" : "Standard CPU"}
        </div>
      </div>

      <div className="border border-border bg-card p-4 space-y-1">
        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
          <Clock className="h-3 w-3 text-amber-500" /> Runtime Duration
        </span>
        <div className="text-sm font-bold text-foreground">
          {durationMin}m ({job.duration_seconds}s)
        </div>
      </div>

      <div className="border border-border bg-card p-4 space-y-1">
        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
          <Globe className="h-3 w-3 text-emerald-500" /> Network & Internet
        </span>
        <div className="text-sm font-bold text-foreground">
          {job.enable_internet ? "Internet Enabled" : "Offline Sandbox"}
        </div>
      </div>

      <div className="border border-border bg-card p-4 space-y-1">
        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
          <HardDrive className="h-3 w-3 text-cyan-500" /> Job Identifier
        </span>
        <div className="text-sm font-bold text-foreground truncate" title={job.id}>
          {job.id.slice(0, 12)}...
        </div>
      </div>
    </div>
  );
};
