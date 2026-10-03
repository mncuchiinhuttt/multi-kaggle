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
      gpuHoursRemaining: r.gpu_hours_remaining,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  getById(id: string): AccountRecord | null {
    const row = this.db
      .query("SELECT * FROM accounts WHERE id = ?")
      .get(id) as AccountRecord | null;
    return row;
  }

  create(input: CreateAccountInput): PublicAccount {
    const now = Date.now();
    const id = crypto.randomUUID();
    const { encrypted, iv } = encryptApiKey(input.apiKey, this.masterSecret);

    this.db.run(
      `INSERT INTO accounts (id, label, username, api_key_encrypted, api_key_iv, proxy_url, gpu_hours_remaining, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 30.0, 'active', ?, ?)`,
      [id, input.label, input.username.trim(), encrypted, iv, input.proxyUrl ?? null, now, now]
    );

    return {
      id,
      label: input.label,
      username: input.username.trim(),
      proxyUrl: input.proxyUrl ?? null,
      gpuHoursRemaining: 30.0,
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
    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

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
    this.db.run("UPDATE accounts SET status = ?, updated_at = ? WHERE id = ?", [
      newStatus,
      Date.now(),
      id,
    ]);

    return testResult;
  }

  selectAccount(strategy: "manual" | "max_quota" | "round_robin", targetAccountId?: string): AccountRecord {
    if (strategy === "manual") {
      if (!targetAccountId) throw new Error("targetAccountId required for manual selection");
      const acc = this.getById(targetAccountId);
      if (!acc) throw new Error(`Account ${targetAccountId} not found`);
      return acc;
    }

    const activeAccounts = this.db
      .query("SELECT * FROM accounts WHERE status = 'active' ORDER BY gpu_hours_remaining DESC")
      .all() as AccountRecord[];

    if (activeAccounts.length === 0) {
      throw new Error("No active Kaggle accounts found. Please add or verify an account.");
    }

    if (strategy === "max_quota") {
      return activeAccounts[0];
    }

    // round_robin: pick the active account with oldest updated_at or least active jobs
    const picked = activeAccounts[activeAccounts.length - 1];
    return picked;
  }

  updateQuota(accountId: string, elapsedSeconds: number): void {
    const hoursElapsed = elapsedSeconds / 3600;
    this.db.run(
      `UPDATE accounts 
       SET gpu_hours_remaining = MAX(0.0, gpu_hours_remaining - ?), updated_at = ? 
       WHERE id = ?`,
      [hoursElapsed, Date.now(), accountId]
    );
  }
}
