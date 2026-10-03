import { describe, expect, it } from "bun:test";
import { getDefaultDbPath } from "@/db/storage-path";
import { homedir } from "node:os";

describe("Storage Path Resolver", () => {
  it("resolves permanent data directory in user home/localappdata", () => {
    delete process.env.MULTI_KAGGLE_DB;
    const path = getDefaultDbPath();
    expect(path).toBeDefined();
    expect(path).toContain("multi-kaggle.db");
    if (process.platform !== "win32") {
      expect(path).toContain(".multi-kaggle");
    }
  });

  it("respects MULTI_KAGGLE_DB override when provided", () => {
    process.env.MULTI_KAGGLE_DB = "/tmp/custom-test-path.db";
    const path = getDefaultDbPath();
    expect(path).toBe("/tmp/custom-test-path.db");
    delete process.env.MULTI_KAGGLE_DB;
  });
});
