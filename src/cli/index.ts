#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";
import { KernelService } from "@/services/kernel-service";
import { handleRunCommand } from "./commands/run";
import { handleAccountsCommand, handleAddAccountCommand } from "./commands/accounts";
import { handleJobsCommand, handleCancelCommand } from "./commands/jobs";
import { handleServeCommand } from "./commands/serve";

const HELP_TEXT = `
Multi-Kaggle CLI - Lightweight Kaggle multi-account manager & dispatcher

Usage:
  multikaggle [serve] [--port 3000] [--no-open]   Launch Web UI Dashboard & API daemon
  multikaggle run <file.ipynb|file.py> [options]  Dispatch notebook to Kaggle
  multikaggle accounts [list]                     List configured accounts & quotas
  multikaggle accounts add [options]              Add new Kaggle account credentials
  multikaggle jobs [list]                         List recent/running jobs
  multikaggle cancel <job_id>                     Cancel a running kernel session

Options for 'run':
  --title <string>       Title of the kernel
  --strategy <strategy>  max_quota (default) | round_robin | manual
  --account <account_id> Target account ID (required for manual strategy)
  --no-gpu               Disable GPU accelerator (use CPU)
  --no-internet          Disable internet access
  --json                 Output machine-readable JSON (ideal for AI agents)
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Default behavior when typing bare 'multikaggle' or 'multikaggle serve' -> Launch Web UI
  if (!command || command === "serve" || command === "ui" || command === "web") {
    const { values } = parseArgs({
      args: command ? args.slice(1) : args,
      options: {
        port: { type: "string" },
        "no-open": { type: "boolean" },
      },
      strict: false,
    });

    await handleServeCommand({
      port: values.port ? Number(values.port) : undefined,
      open: !values["no-open"],
    });
    return;
  }

  if (command === "--help" || command === "-h" || command === "help") {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const dbPath = process.env.MULTI_KAGGLE_DB || "data/multi-kaggle.db";
  const db = initDatabase(dbPath);
  const masterSecret = process.env.MASTER_SECRET_KEY || "multi-kaggle-default-secret-key-32b";
  const accountService = new AccountService(db, masterSecret);
  const kernelService = new KernelService(db, accountService);

  try {
    if (command === "run") {
      const filePath = args[1];
      if (!filePath || filePath.startsWith("-")) {
        console.error("Error: Please provide a path to a notebook or script.");
        process.exit(1);
      }

      const { values } = parseArgs({
        args: args.slice(2),
        options: {
          title: { type: "string" },
          strategy: { type: "string" },
          account: { type: "string" },
          "no-gpu": { type: "boolean" },
          "no-internet": { type: "boolean" },
          json: { type: "boolean" },
        },
        strict: false,
      });

      await handleRunCommand(kernelService, {
        filePath,
        title: values.title as string | undefined,
        strategy: values.strategy as any,
        account: values.account as string | undefined,
        gpu: !values["no-gpu"],
        internet: !values["no-internet"],
        json: Boolean(values.json),
      });
    } else if (command === "accounts") {
      const sub = args[1];
      if (sub === "add") {
        const { values } = parseArgs({
          args: args.slice(2),
          options: {
            label: { type: "string" },
            username: { type: "string" },
            key: { type: "string" },
            proxy: { type: "string" },
          },
          strict: false,
        });

        if (!values.label || !values.username || !values.key) {
          console.error("Error: --label, --username, and --key are required.");
          process.exit(1);
        }

        await handleAddAccountCommand(accountService, {
          label: values.label as string,
          username: values.username as string,
          apiKey: values.key as string,
          proxyUrl: values.proxy as string | undefined,
        });
      } else {
        const isJson = args.includes("--json");
        await handleAccountsCommand(accountService, isJson);
      }
    } else if (command === "jobs") {
      const isJson = args.includes("--json");
      await handleJobsCommand(kernelService, isJson);
    } else if (command === "cancel") {
      const jobId = args[1];
      if (!jobId) {
        console.error("Error: Please specify job ID to cancel.");
        process.exit(1);
      }
      const isJson = args.includes("--json");
      await handleCancelCommand(kernelService, jobId, isJson);
    } else {
      console.error(`Unknown command: ${command}`);
      console.log(HELP_TEXT);
      process.exit(1);
    }
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
