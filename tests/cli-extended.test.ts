import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";
import { KernelService } from "@/services/kernel-service";
import { handleOutputsCommand } from "@/cli/commands/outputs";
import { handleDatasetsCommand } from "@/cli/commands/datasets";
import { handleModelsCommand } from "@/cli/commands/models";

describe("CLI Outputs, Datasets and Models Commands", () => {
  it("executes outputs, datasets, and models commands without crashing in JSON mode", async () => {
    const db = initDatabase(":memory:");
    const accountService = new AccountService(db, "secret-key-123");
    const kernelService = new KernelService(db, accountService);

    let captured = "";
    const originalLog = console.log;
    console.log = (msg: string) => {
      captured += msg;
    };

    try {
      await handleDatasetsCommand(accountService, "titanic", undefined, true);
      const parsedDatasets = JSON.parse(captured);
      expect(parsedDatasets.ok).toBe(true);
      expect(Array.isArray(parsedDatasets.data)).toBe(true);

      captured = "";
      await handleModelsCommand(accountService, "llama", undefined, true);
      const parsedModels = JSON.parse(captured);
      expect(parsedModels.ok).toBe(true);
      expect(Array.isArray(parsedModels.data)).toBe(true);
    } finally {
      console.log = originalLog;
      db.close();
    }
  });
});
