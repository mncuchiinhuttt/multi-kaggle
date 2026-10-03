import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";
import { KernelService } from "@/services/kernel-service";
import { handleOutputsCommand } from "@/cli/commands/outputs";
import { handleDatasetsCommand } from "@/cli/commands/datasets";

describe("CLI Outputs and Datasets Commands", () => {
  it("executes outputs and datasets commands without crashing in JSON mode", async () => {
    const db = initDatabase(":memory:");
    const accountService = new AccountService(db, "secret-key-123");
    const kernelService = new KernelService(db, accountService);

    // Mock dataset search
    let captured = "";
    const originalLog = console.log;
    console.log = (msg: string) => {
      captured += msg;
    };

    try {
      await handleDatasetsCommand(accountService, "titanic", undefined, true);
      const parsed = JSON.parse(captured);
      expect(parsed.ok).toBe(true);
      expect(Array.isArray(parsed.data)).toBe(true);
    } finally {
      console.log = originalLog;
      db.close();
    }
  });
});
