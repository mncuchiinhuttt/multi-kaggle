import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";
import { KernelService } from "@/services/kernel-service";
import { handleAccountsCommand, handleAddAccountCommand } from "@/cli/commands/accounts";
import { handleJobsCommand } from "@/cli/commands/jobs";

describe("CLI Commands Programmatic Test", () => {
  it("creates account and lists accounts/jobs in json mode without crashing", async () => {
    const db = initDatabase(":memory:");
    const accountService = new AccountService(db, "secret-key-123");
    const kernelService = new KernelService(db, accountService);

    // Test add account
    await handleAddAccountCommand(accountService, {
      label: "CLI Acc",
      username: "cliuser",
      apiKey: "clitoken",
    });

    const accounts = accountService.getAll();
    expect(accounts.length).toBe(1);
    expect(accounts[0].username).toBe("cliuser");

    // Test accounts list json
    let logged = "";
    const originalLog = console.log;
    console.log = (msg: string) => {
      logged += msg;
    };

    try {
      await handleAccountsCommand(accountService, true);
      const parsed = JSON.parse(logged);
      expect(parsed.ok).toBe(true);
      expect(parsed.data[0].username).toBe("cliuser");

      logged = "";
      await handleJobsCommand(kernelService, true);
      const parsedJobs = JSON.parse(logged);
      expect(parsedJobs.ok).toBe(true);
      expect(Array.isArray(parsedJobs.data)).toBe(true);
    } finally {
      console.log = originalLog;
      db.close();
    }
  });
});
