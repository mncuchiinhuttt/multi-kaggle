import type { KernelService } from "@/services/kernel-service";

export async function handleJobsCommand(
  kernelService: KernelService,
  json = false,
  limit = 20
): Promise<void> {
  const jobs = kernelService.getAllJobs(limit);

  if (json) {
    console.log(JSON.stringify({ ok: true, data: jobs }));
    return;
  }

  if (jobs.length === 0) {
    console.log("No jobs recorded yet. Run: multikaggle run <path/to/notebook.ipynb>");
    return;
  }

  console.log(`Recent Kernel Jobs (showing ${jobs.length}):\n`);
  for (const job of jobs) {
    const duration = Math.round(job.duration_seconds / 60);
    console.log(`• [${job.status.toUpperCase()}] ${job.title} (${job.kernel_slug})`);
    console.log(`  ID: ${job.id}`);
    console.log(`  Duration: ${duration}m (${job.duration_seconds}s)`);
    if (job.error_message) {
      console.log(`  Error: ${job.error_message}`);
    }
    console.log("");
  }
}

export async function handleCancelCommand(
  kernelService: KernelService,
  jobId: string,
  json = false
): Promise<void> {
  const jobs = kernelService.getAllJobs(50);
  const matched = jobs.find((j) => j.id.startsWith(jobId));

  if (!matched) {
    if (json) {
      console.log(JSON.stringify({ ok: false, error: `Job matching "${jobId}" not found.` }));
    } else {
      console.error(`Error: Job matching "${jobId}" not found.`);
    }
    process.exit(1);
  }

  const cancelled = kernelService.cancelJob(matched.id);
  if (json) {
    console.log(JSON.stringify({ ok: cancelled, jobId: matched.id }));
    return;
  }

  if (cancelled) {
    console.log(`Job ${matched.id} (${matched.kernel_slug}) cancelled.`);
  } else {
    console.error(`Failed to cancel job ${matched.id}.`);
    process.exit(1);
  }
}
