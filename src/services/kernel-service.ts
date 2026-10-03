import { Database } from "bun:sqlite";
import type { JobRecord } from "@/db/database";
import type { AccountService } from "./account-service";

export interface DispatchKernelInput {
  title: string;
  slug?: string;
  notebookContent: string;
  kernelType?: "notebook" | "script";
  strategy?: "manual" | "max_quota" | "round_robin";
  targetAccountId?: string;
  isGpu?: boolean;
  enableInternet?: boolean;
}

export class KernelService {
  constructor(
    private readonly db: Database,
    private readonly accountService: AccountService
  ) {}

  getAllJobs(limit = 50, accountId?: string): JobRecord[] {
    if (accountId) {
      return this.db
        .query("SELECT * FROM jobs WHERE account_id = ? ORDER BY start_time DESC LIMIT ?")
        .all(accountId, limit) as JobRecord[];
    }
    return this.db
      .query("SELECT * FROM jobs ORDER BY start_time DESC LIMIT ?")
      .all(limit) as JobRecord[];
  }

  getJobById(id: string): JobRecord | null {
    return this.db.query("SELECT * FROM jobs WHERE id = ?").get(id) as JobRecord | null;
  }

  async dispatch(input: DispatchKernelInput): Promise<{ ok: boolean; job?: JobRecord; error?: string }> {
    try {
      const strategy = input.strategy ?? "max_quota";
      const account = this.accountService.selectAccount(strategy, input.targetAccountId);

      // Check concurrency limit: max 2 active sessions per Kaggle account
      const activeCount = this.db
        .query(
          "SELECT COUNT(*) as count FROM jobs WHERE account_id = ? AND status IN ('queued', 'running')"
        )
        .get(account.id) as { count: number };

      if (activeCount.count >= 2) {
        return {
          ok: false,
          error: `Account ${account.username} already has 2 active sessions running (Kaggle concurrency limit).`,
        };
      }

      const rawSlug = input.slug || input.title;
      const cleanSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);

      const client = this.accountService.getClientForAccount(account.id);
      const pushRes = await client.pushKernel({
        slug: cleanSlug,
        notebookContent: input.notebookContent,
        kernelType: input.kernelType ?? "notebook",
        enableGpu: input.isGpu ?? true,
        enableInternet: input.enableInternet ?? true,
        isPrivate: true,
      });

      if (!pushRes.ok) {
        return { ok: false, error: pushRes.error };
      }

      const now = Date.now();
      const jobId = crypto.randomUUID();
      const job: JobRecord = {
        id: jobId,
        account_id: account.id,
        kernel_slug: cleanSlug,
        title: input.title,
        language: "python",
        kernel_type: input.kernelType ?? "notebook",
        is_gpu: input.isGpu ?? true ? 1 : 0,
        enable_internet: input.enableInternet ?? true ? 1 : 0,
        status: "queued",
        start_time: now,
        end_time: null,
        duration_seconds: 0,
        error_message: null,
        log_preview: null,
        output_urls: null,
        created_at: now,
      };

      this.db.run(
        `INSERT INTO jobs (id, account_id, kernel_slug, title, language, kernel_type, is_gpu, enable_internet, status, start_time, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.id,
          job.account_id,
          job.kernel_slug,
          job.title,
          job.language,
          job.kernel_type,
          job.is_gpu,
          job.enable_internet,
          job.status,
          job.start_time,
          job.created_at,
        ]
      );

      return { ok: true, job };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch kernel";
      return { ok: false, error: msg };
    }
  }

  cancelJob(id: string): boolean {
    const job = this.getJobById(id);
    if (!job) return false;

    this.db.run("UPDATE jobs SET status = 'cancelled', end_time = ? WHERE id = ?", [
      Date.now(),
      id,
    ]);
    return true;
  }
}
