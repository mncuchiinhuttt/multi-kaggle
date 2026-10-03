import { spawn } from "node:child_process";
import { exec } from "node:child_process";

export interface KaggleCliVersionCheck {
  installed: boolean;
  currentVersion: string | null;
  latestVersion: string | null;
  hasUpdate: boolean;
  pipCommand: string;
}

/**
 * Checks installed Kaggle CLI version and compares it with latest release on PyPI.
 */
export async function checkKaggleCliVersion(): Promise<KaggleCliVersionCheck> {
  const { promise, resolve } = Promise.withResolvers<string | null>();

  const proc = spawn("kaggle", ["--version"]);
  let stdout = "";
  proc.stdout?.on("data", (chunk: Buffer) => {
    stdout += chunk.toString();
  });
  proc.on("error", () => resolve(null));
  proc.on("close", (code) => {
    if (code === 0 && stdout) {
      // Parses output like "Kaggle CLI 2.2.4"
      const match = stdout.match(/([0-9]+\.[0-9]+\.[0-9]+)/);
      resolve(match ? match[1] : null);
    } else {
      resolve(null);
    }
  });

  const currentVersion = await promise;

  if (!currentVersion) {
    return {
      installed: false,
      currentVersion: null,
      latestVersion: null,
      hasUpdate: false,
      pipCommand: "pip install kaggle",
    };
  }

  // Fetch latest version from PyPI
  let latestVersion: string | null = null;
  try {
    const res = await fetch("https://pypi.org/pypi/kaggle/json", {
      headers: { "User-Agent": "Multi-Kaggle-CLI-Checker" },
    });
    if (res.ok) {
      const data = (await res.json()) as { info?: { version?: string } };
      if (typeof data.info?.version === "string") {
        latestVersion = data.info.version;
      }
    }
  } catch {}

  const hasUpdate = Boolean(latestVersion && latestVersion !== currentVersion);

  return {
    installed: true,
    currentVersion,
    latestVersion: latestVersion || currentVersion,
    hasUpdate,
    pipCommand: "pip install --upgrade kaggle",
  };
}

/**
 * Executes 'pip install --upgrade kaggle' to update user's Kaggle CLI.
 */
export async function updateKaggleCli(): Promise<{ ok: boolean; message: string }> {
  const { promise, resolve } = Promise.withResolvers<{ ok: boolean; message: string }>();

  // Determine python/pip runner: pip3, pip, or python3 -m pip
  const updateCmd = process.platform === "win32" ? "pip install --upgrade kaggle" : "pip3 install --upgrade kaggle || pip install --upgrade kaggle || python3 -m pip install --upgrade kaggle";

  exec(updateCmd, (error, stdout, stderr) => {
    if (error) {
      resolve({
        ok: false,
        message: stderr || error.message || "Failed to update Kaggle CLI via pip",
      });
    } else {
      resolve({
        ok: true,
        message: stdout || "Kaggle CLI successfully updated to latest release",
      });
    }
  });

  return promise;
}
