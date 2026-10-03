import { spawn } from "node:child_process";
import * as readline from "node:readline";
import type { Server } from "bun";
import { createApp } from "@/server/index";

export interface ServeOptions {
  port?: number;
  open?: boolean;
}

function openBrowser(url: string) {
  try {
    const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
  } catch {}
}

export async function runInteractiveTui(helpText: string, defaultPort = 7890): Promise<void> {
  let serverInstance: Server | null = null;
  const port = defaultPort;
  const url = `http://localhost:${port}`;

  const startServer = () => {
    if (!serverInstance) {
      const { app } = createApp();
      serverInstance = Bun.serve({
        port,
        fetch: app.fetch,
      });
    }
  };

  startServer();

  console.clear();
  console.log(`
┌────────────────────────────────────────────────────────┐
│  MULTI-KAGGLE ORCHESTRATOR & FARM DAEMON (v1.0.0)      │
│  Daemon status: ONLINE at ${url.padEnd(28)} │
└────────────────────────────────────────────────────────┘

  [1] Open Web UI Dashboard in Browser
  [2] Print CLI Help & Command Manual
  [3] Detach & Run in Background
  [4] Shutdown & Exit

`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptChoice = () => {
    rl.question("  Select an action [1-4]: ", (ans) => {
      const choice = ans.trim();
      if (choice === "1") {
        console.log(`\n  --> Opening ${url} in your default browser...`);
        openBrowser(url);
        setTimeout(promptChoice, 1000);
      } else if (choice === "2") {
        console.log(helpText);
        promptChoice();
      } else if (choice === "3") {
        console.log(`\n  --> Multi-Kaggle daemon running in background.`);
        console.log(`  --> Access Dashboard at ${url}`);
        console.log(`  --> Shutdown anytime via Web UI or kill port ${port}.\n`);
        rl.close();
        process.exit(0);
      } else if (choice === "4") {
        console.log(`\n  --> Stopping Multi-Kaggle daemon... Goodbye!\n`);
        rl.close();
        if (serverInstance) serverInstance.stop();
        process.exit(0);
      } else {
        console.log("  Invalid option. Please enter 1, 2, 3, or 4.");
        promptChoice();
      }
    });
  };

  promptChoice();
}

export async function handleServeCommand(options: ServeOptions): Promise<void> {
  const port = options.port || Number(process.env.PORT || 7890);
  const { app } = createApp();
  const url = `http://localhost:${port}`;

  Bun.serve({
    port,
    fetch: app.fetch,
  });

  if (options.open !== false) {
    openBrowser(url);
  }
}
