import { Database } from "bun:sqlite";
import type { JobRecord } from "@/db/database";
import type { TelegramNotifier } from "@/bot/notifier";
import type { AccountService } from "./account-service";

export class PollerService {
  private timer: Timer | null = null;
  private isPolling = false;

  constructor(
    private readonly db: Database,
    private readonly accountService: AccountService,
    private readonly notifier: TelegramNotifier,
    private readonly intervalMs = 60000
  ) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.pollOnce().catch(() => {});
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async pollOnce(): Promise<void> {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const activeJobs = this.db
        .query("SELECT * FROM jobs WHERE status IN ('queued', 'running')")
        .all() as JobRecord[];

      for (const job of activeJobs) {
        await this.checkJobStatus(job);
      }
    } finally {
      this.isPolling = false;
    }
  }

  private async checkJobStatus(job: JobRecord): Promise<void> {
    try {
      const client = this.accountService.getClientForAccount(job.account_id);
      const account = this.accountService.getById(job.account_id);
      if (!account) return;

      const statusRes = await client.getKernelStatus(job.kernel_slug);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - job.start_time) / 1000);

      if (statusRes.status === "running" && job.status === "queued") {
        this.db.run(
          "UPDATE jobs SET status = 'running', duration_seconds = ? WHERE id = ?",
          [elapsedSeconds, job.id]
        );
      } else if (job.status === "running") {
        this.db.run("UPDATE jobs SET duration_seconds = ? WHERE id = ?", [
          elapsedSeconds,
          job.id,
        ]);

        const deltaSeconds = elapsedSeconds - job.duration_seconds;
        if (deltaSeconds > 0) {
          if (job.is_tpu === 1) {
            this.accountService.updateQuota(job.account_id, deltaSeconds, "tpu");
          } else if (job.is_gpu === 1) {
            this.accountService.updateQuota(job.account_id, deltaSeconds, "gpu");
          }
        }
      }

      if (
        statusRes.status === "complete" ||
        statusRes.status === "error" ||
        statusRes.status === "cancelled"
      ) {
        let logPreview: string | null = null;
        let outputUrlsJson: string | null = null;

        try {
          const outputRes = await client.getKernelOutput(job.kernel_slug);
          logPreview = outputRes.log || null;
          if (outputRes.files && outputRes.files.length > 0) {
            outputUrlsJson = JSON.stringify(outputRes.files);
          }
        } catch {}

        this.db.run(
          `UPDATE jobs 
           SET status = ?, end_time = ?, duration_seconds = ?, error_message = ?, log_preview = ?, output_urls = ? 
           WHERE id = ?`,
          [
            statusRes.status,
            now,
            elapsedSeconds,
            statusRes.failureMessage || null,
            logPreview,
            outputUrlsJson,
            job.id,
          ]
        );

        await this.notifier.sendNotification({
          status: statusRes.status,
          accountLabel: account.label,
          username: account.username,
          kernelSlug: job.kernel_slug,
          title: job.title,
          durationSeconds: elapsedSeconds,
          errorMessage: statusRes.failureMessage,
          logPreview,
        });
      }
    } catch {}
  }
}
