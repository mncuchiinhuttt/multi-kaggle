#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { initDatabase } from "@/db/database";
import type { ComputeAccelerator } from "@/core/kaggle-types";
import { AccountService } from "@/services/account-service";
import { KernelService } from "@/services/kernel-service";
import { handleRunCommand } from "./commands/run";
import { handleAccountsCommand, handleAddAccountCommand } from "./commands/accounts";
import { handleJobsCommand, handleCancelCommand } from "./commands/jobs";
import { handleOutputsCommand } from "./commands/outputs";
import { handleDatasetsCommand } from "./commands/datasets";
import { handleServeCommand, runInteractiveTui } from "./commands/serve";

const HELP_TEXT = `
Multi-Kaggle CLI - Lightweight Kaggle multi-account manager & dispatcher

Usage:
  multikaggle                                     Launch Interactive TUI Menu
  multikaggle serve [--port 6767] [--no-open]     Launch Web UI Server directly
  multikaggle run <file.ipynb|file.py> [options]  Dispatch notebook to Kaggle
  multikaggle outputs <job_id> [--download <dir>] Inspect or download outputs from a run
  multikaggle datasets [list] [--search <term>]   List or search datasets across accounts
  multikaggle accounts [list]                     List configured accounts & quotas
  multikaggle accounts add [options]              Add new Kaggle account credentials
  multikaggle jobs [list]                         List recent/running jobs
  multikaggle cancel <job_id>                     Cancel a running kernel session

Options for 'run':
  --title <string>       Title of the kernel
  --strategy <strategy>  max_quota (default) | round_robin | manual
  --account <account_id> Target account ID (required for manual strategy)
  --accelerator <type>   nvidia-t4 (default) | nvidia-p100 | tpu-v3-8 | cpu
  --p100                 Shortcut for --accelerator nvidia-p100 (16GB HBM2)
  --tpu                  Shortcut for --accelerator tpu-v3-8 (128GB HBM)
  --cpu                  Shortcut for --accelerator cpu (Zero quota deduction)
  --no-gpu               Disable GPU accelerator (use CPU)
  --no-internet          Disable internet access
  --json                 Output machine-readable JSON (ideal for AI agents)
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Default: When user runs bare 'multikaggle', show interactive TUI menu
  if (!command) {
    await runInteractiveTui(HELP_TEXT, 6767);
    return;
  }

  // Explicit 'serve', 'ui', or 'web' runs server without interactive menu
  if (command === "serve" || command === "ui" || command === "web") {
    const { values } = parseArgs({
      args: args.slice(1),
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
          accelerator: { type: "string" },
          p100: { type: "boolean" },
          tpu: { type: "boolean" },
          cpu: { type: "boolean" },
          "no-gpu": { type: "boolean" },
          "no-internet": { type: "boolean" },
          json: { type: "boolean" },
        },
        strict: false,
      });

      let accel: ComputeAccelerator | undefined = undefined;
      const rawAccel = values.accelerator;
      if (rawAccel === "nvidia-p100" || rawAccel === "nvidia-t4" || rawAccel === "tpu-v3-8" || rawAccel === "cpu") {
        accel = rawAccel;
      }
      if (values.p100) accel = "nvidia-p100";
      else if (values.tpu) accel = "tpu-v3-8";
      else if (values.cpu || values["no-gpu"]) accel = "cpu";

      const validStrategy =
        values.strategy === "manual" || values.strategy === "round_robin" || values.strategy === "max_quota"
          ? values.strategy
          : undefined;

      await handleRunCommand(kernelService, {
        filePath,
        title: typeof values.title === "string" ? values.title : undefined,
        strategy: validStrategy,
        account: typeof values.account === "string" ? values.account : undefined,
        accelerator: accel,
        internet: !values["no-internet"],
        json: Boolean(values.json),
      });
    } else if (command === "outputs") {
      const jobId = args[1];
      if (!jobId) {
        console.error("Error: Please specify job ID to fetch outputs.");
        process.exit(1);
      }
      const { values } = parseArgs({
        args: args.slice(2),
        options: {
          download: { type: "string" },
          json: { type: "boolean" },
        },
        strict: false,
      });
      await handleOutputsCommand(kernelService, accountService, jobId, values.download as string | undefined, Boolean(values.json));
    } else if (command === "datasets") {
      const { values } = parseArgs({
        args: args.slice(1),
        options: {
          search: { type: "string" },
          account: { type: "string" },
          json: { type: "boolean" },
        },
        strict: false,
      });
      await handleDatasetsCommand(accountService, values.search as string | undefined, values.account as string | undefined, Boolean(values.json));
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
