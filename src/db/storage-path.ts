import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

/**
 * Returns the centralized, permanent user data directory.
 * macOS / Linux: ~/.multi-kaggle/data/multi-kaggle.db
 * Windows: %LOCALAPPDATA%\MultiKaggle\data\multi-kaggle.db or ~/.multi-kaggle/data/...
 */
export function getDefaultDbPath(): string {
  // If user explicitly specifies custom DB path via env var, honor it
  if (process.env.MULTI_KAGGLE_DB) {
    return process.env.MULTI_KAGGLE_DB;
  }

  const globalDir =
    process.platform === "win32" && process.env.LOCALAPPDATA
      ? join(process.env.LOCALAPPDATA, "MultiKaggle", "data")
      : join(homedir(), ".multi-kaggle", "data");

  const globalDbPath = join(globalDir, "multi-kaggle.db");

  // Migration: If user previously had data in ./data/multi-kaggle.db (project relative)
  // and global DB does not exist yet, safely copy it over!
  const localProjectDb = join(process.cwd(), "data", "multi-kaggle.db");
  if (!existsSync(globalDbPath) && existsSync(localProjectDb)) {
    try {
      mkdirSync(dirname(globalDbPath), { recursive: true });
      copyFileSync(localProjectDb, globalDbPath);
      // Also copy WAL / SHM files if present
      if (existsSync(`${localProjectDb}-wal`)) {
        copyFileSync(`${localProjectDb}-wal`, `${globalDbPath}-wal`);
      }
      if (existsSync(`${localProjectDb}-shm`)) {
        copyFileSync(`${localProjectDb}-shm`, `${globalDbPath}-shm`);
      }
    } catch {
      // If copy fails, fallback to local
      return localProjectDb;
    }
  }

  return globalDbPath;
}
