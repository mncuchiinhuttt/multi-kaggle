import { Database } from "bun:sqlite";
import { decryptApiKey, encryptApiKey } from "@/core/crypto";
import { KaggleApiClient } from "@/core/kaggle-client";
import type { AccountRecord } from "@/db/database";

export interface CreateAccountInput {
  label: string;
  username: string;
  apiKey: string;
  proxyUrl?: string | null;
}

export interface PublicAccount {
  id: string;
  label: string;
  username: string;
  proxyUrl: string | null;
  gpuHoursRemaining: number;
  tpuHoursRemaining: number;
  privateDatasetsUsedGb: number;
  privateDatasetsMaxGb: number;
  privateModelsMaxGb: number;
  status: "active" | "invalid" | "rate_limited";
  createdAt: number;
  updatedAt: number;
}

export class AccountService {
  constructor(
    private readonly db: Database,
    private readonly masterSecret: string
  ) {}

  getAll(): PublicAccount[] {
    const rows = this.db
      .query("SELECT * FROM accounts ORDER BY created_at DESC")
      .all() as AccountRecord[];

    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      username: r.username,
      proxyUrl: r.proxy_url,
      gpuHoursRemaining: r.gpu_hours_remaining ?? 30.0,
      tpuHoursRemaining: r.tpu_hours_remaining ?? 20.0,
      privateDatasetsUsedGb: r.private_datasets_used_gb ?? 0.0,
      privateDatasetsMaxGb: r.private_datasets_max_gb ?? 214.75,
      privateModelsMaxGb: r.private_models_max_gb ?? 214.75,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  getById(id: string): AccountRecord | null {
    return this.db.query("SELECT * FROM accounts WHERE id = ?").get(id) as AccountRecord | null;
  }

  create(input: CreateAccountInput): PublicAccount {
    const now = Date.now();
    const id = crypto.randomUUID();
    const { encrypted, iv } = encryptApiKey(input.apiKey, this.masterSecret);

    this.db.run(
      `INSERT INTO accounts (
        id, label, username, api_key_encrypted, api_key_iv, proxy_url, 
        gpu_hours_remaining, tpu_hours_remaining, private_datasets_used_gb, 
        private_datasets_max_gb, private_models_max_gb, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 30.0, 20.0, 0.0, 214.75, 214.75, 'active', ?, ?)`,
      [id, input.label, input.username.trim(), encrypted, iv, input.proxyUrl ?? null, now, now]
    );

    return {
      id,
      label: input.label,
      username: input.username.trim(),
      proxyUrl: input.proxyUrl ?? null,
      gpuHoursRemaining: 30.0,
      tpuHoursRemaining: 20.0,
      privateDatasetsUsedGb: 0.0,
      privateDatasetsMaxGb: 214.75,
      privateModelsMaxGb: 214.75,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
  }

  delete(id: string): boolean {
    const res = this.db.run("DELETE FROM accounts WHERE id = ?", [id]);
    return res.changes > 0;
  }

  getClientForAccount(id: string): KaggleApiClient {
    const account = this.getById(id);
    if (!account) throw new Error(`Account not found: ${id}`);
    const plainApiKey = decryptApiKey(
      account.api_key_encrypted,
      account.api_key_iv,
      this.masterSecret
    );
    return new KaggleApiClient(account.username, plainApiKey, account.proxy_url);
  }

  async testAccountConnection(id: string): Promise<{ ok: boolean; message: string }> {
    const client = this.getClientForAccount(id);
    const testResult = await client.testCredentials();
    const newStatus = testResult.ok ? "active" : "invalid";

    // Auto-sync used datasets size in GB
    try {
      const datasets = await client.listDatasets("");
      let totalBytes = 0;
      for (const d of datasets) {
        if (d.size) {
          const num = parseFloat(d.size);
          if (!isNaN(num)) totalBytes += num * 1024 * 1024;
        }
      }
      const usedGb = Math.round((totalBytes / (1024 * 1024 * 1024)) * 100) / 100;
      this.db.run("UPDATE accounts SET private_datasets_used_gb = ? WHERE id = ?", [usedGb, id]);
    } catch {}

    this.db.run("UPDATE accounts SET status = ?, updated_at = ? WHERE id = ?", [
      newStatus,
      Date.now(),
      id,
    ]);
    return testResult;
  }

  selectAccount(
    strategy: "manual" | "max_quota" | "round_robin",
    targetAccountId?: string,
    accelerator: "gpu" | "tpu" | "cpu" = "gpu"
  ): AccountRecord {
    if (strategy === "manual") {
      if (!targetAccountId) throw new Error("targetAccountId required for manual selection");
      const acc = this.getById(targetAccountId);
      if (!acc) throw new Error(`Account ${targetAccountId} not found`);
      return acc;
    }

    const orderBy = accelerator === "tpu" ? "tpu_hours_remaining DESC" : "gpu_hours_remaining DESC";
    const activeAccounts = this.db
      .query(`SELECT * FROM accounts WHERE status = 'active' ORDER BY ${orderBy}`)
      .all() as AccountRecord[];

    if (activeAccounts.length === 0) {
      throw new Error("No active Kaggle accounts found. Please add or verify an account.");
    }

    if (strategy === "max_quota") return activeAccounts[0];
    return activeAccounts[activeAccounts.length - 1];
  }

  updateQuota(accountId: string, elapsedSeconds: number, accelerator: "gpu" | "tpu" = "gpu"): void {
    const hoursElapsed = elapsedSeconds / 3600;
    const col = accelerator === "tpu" ? "tpu_hours_remaining" : "gpu_hours_remaining";
    this.db.run(
      `UPDATE accounts 
       SET ${col} = MAX(0.0, ${col} - ?), updated_at = ? 
       WHERE id = ?`,
      [hoursElapsed, Date.now(), accountId]
    );
  }
}
