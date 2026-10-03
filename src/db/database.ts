import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export interface AccountRecord {
  id: string;
  label: string;
  username: string;
  api_key_encrypted: string;
  api_key_iv: string;
  proxy_url: string | null;
  gpu_hours_remaining: number;
  tpu_hours_remaining: number;
  disk_quota_gb: number;
  status: "active" | "invalid" | "rate_limited";
  created_at: number;
  updated_at: number;
}

export interface JobRecord {
  id: string;
  account_id: string;
  kernel_slug: string;
  title: string;
  language: string;
  kernel_type: "notebook" | "script";
  is_gpu: number;
  is_tpu: number;
  enable_internet: number;
  status: "queued" | "running" | "complete" | "error" | "cancelled";
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  error_message: string | null;
  log_preview: string | null;
  output_urls: string | null;
  created_at: number;
}

export interface SettingRecord {
  key: string;
  value: string;
}

export function initDatabase(dbPath = "data/multi-kaggle.db"): Database {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      api_key_encrypted TEXT NOT NULL,
      api_key_iv TEXT NOT NULL,
      proxy_url TEXT,
      gpu_hours_remaining REAL DEFAULT 30.0,
      tpu_hours_remaining REAL DEFAULT 20.0,
      disk_quota_gb REAL DEFAULT 100.0,
      status TEXT CHECK(status IN ('active', 'invalid', 'rate_limited')) DEFAULT 'active',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Migrate accounts table if columns are missing
  try {
    db.run("ALTER TABLE accounts ADD COLUMN tpu_hours_remaining REAL DEFAULT 20.0;");
  } catch {}
  try {
    db.run("ALTER TABLE accounts ADD COLUMN disk_quota_gb REAL DEFAULT 100.0;");
  } catch {}

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      kernel_slug TEXT NOT NULL,
      title TEXT NOT NULL,
      language TEXT DEFAULT 'python',
      kernel_type TEXT CHECK(kernel_type IN ('notebook', 'script')) DEFAULT 'notebook',
      is_gpu INTEGER DEFAULT 1,
      is_tpu INTEGER DEFAULT 0,
      enable_internet INTEGER DEFAULT 1,
      status TEXT CHECK(status IN ('queued', 'running', 'complete', 'error', 'cancelled')) DEFAULT 'queued',
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration_seconds INTEGER DEFAULT 0,
      error_message TEXT,
      log_preview TEXT,
      output_urls TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  try {
    db.run("ALTER TABLE jobs ADD COLUMN is_tpu INTEGER DEFAULT 0;");
  } catch {}

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  return db;
}
