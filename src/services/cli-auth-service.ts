import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface KaggleCliAuthCredentials {
  username: string;
  token: string;
  source: "credentials.json" | "kaggle.json" | "access_token";
}

/**
 * Checks if kaggle CLI is installed on the host machine.
 */
export async function isKaggleCliInstalled(): Promise<boolean> {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  const proc = spawn("kaggle", ["--version"]);
  proc.on("error", () => resolve(false));
  proc.on("close", (code) => resolve(code === 0));
  return promise;
}

/**
 * Reads ~/.kaggle credentials if present.
 */
export function readLocalKaggleCredentials(): KaggleCliAuthCredentials | null {
  const kaggleDir = join(homedir(), ".kaggle");

  // Check credentials.json (OAuth format from kaggle auth login)
  const credsPath = join(kaggleDir, "credentials.json");
  if (existsSync(credsPath)) {
    try {
      const data = JSON.parse(readFileSync(credsPath, "utf-8"));
      if (data.username && (data.refresh_token || data.access_token)) {
        return {
          username: data.username,
          token: data.refresh_token || data.access_token,
          source: "credentials.json",
        };
      }
    } catch {
      // ignore
    }
  }

  // Check kaggle.json (API key token format)
  const jsonPath = join(kaggleDir, "kaggle.json");
  if (existsSync(jsonPath)) {
    try {
      const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
      if (data.username && data.key) {
        return {
          username: data.username,
          token: data.key,
          source: "kaggle.json",
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Clears ~/.kaggle credentials after successful import to prepare for next account login.
 */
export function clearLocalKaggleCredentials(): boolean {
  const kaggleDir = join(homedir(), ".kaggle");
  let cleared = false;

  const targets = ["credentials.json", "access_token", "kaggle.json"];
  for (const t of targets) {
    const p = join(kaggleDir, t);
    if (existsSync(p)) {
      try {
        rmSync(p);
        cleared = true;
      } catch {
        // ignore
      }
    }
  }

  return cleared;
}
