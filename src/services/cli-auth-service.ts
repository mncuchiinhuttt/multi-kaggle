import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface KaggleCliAuthCredentials {
  username: string;
  token: string;
  source: "credentials.json" | "kaggle.json" | "access_token";
}

let activeLoginProcess: ChildProcess | null = null;

export async function isKaggleCliInstalled(): Promise<boolean> {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  const proc = spawn("kaggle", ["--version"]);
  proc.on("error", () => resolve(false));
  proc.on("close", (code) => resolve(code === 0));
  return promise;
}

export function readLocalKaggleCredentials(): KaggleCliAuthCredentials | null {
  const kaggleDir = join(homedir(), ".kaggle");

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

/**
 * Triggers 'kaggle auth login --force' directly from backend, launching the default browser.
 */
export function startKaggleCliLogin(): { ok: boolean; message: string } {
  if (activeLoginProcess && !activeLoginProcess.killed) {
    return { ok: true, message: "Kaggle login process is already running in browser" };
  }

  try {
    const proc = spawn("kaggle", ["auth", "login", "--force"], {
      detached: true,
      stdio: "ignore",
    });

    activeLoginProcess = proc;
    proc.on("close", () => {
      activeLoginProcess = null;
    });
    proc.unref();

    return { ok: true, message: "Browser opened for Kaggle OAuth login" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to spawn kaggle auth login";
    return { ok: false, message: msg };
  }
}
