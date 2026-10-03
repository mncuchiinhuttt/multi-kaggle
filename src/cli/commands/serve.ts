import { spawn } from "node:child_process";
import * as tty from "node:tty";
import * as readline from "node:readline";
import type { Server } from "bun";
import { createApp } from "@/server/index";
import { checkAppUpdate } from "@/services/version-service";
import { handleUpdateCommand } from "./update";
import { c } from "../tui-colors";
import { renderTuiScreen, TUI_ITEMS } from "../tui-renderer";

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

export async function runInteractiveTui(helpText: string, defaultPort = 6767): Promise<void> {
  const port = defaultPort;
  const url = `http://localhost:${port}`;
  let serverInstance: Server | null = null;

  const { app } = createApp();
  serverInstance = Bun.serve({
    port,
    fetch: app.fetch,
  });

  // Check version in background
  const versionInfo = await checkAppUpdate().catch(() => null);

  let selectedIndex = 0;
  const render = () => renderTuiScreen(selectedIndex, url, versionInfo);
  render();

  // Create TTY raw mode stream for Arrow Keys
  let stdinStream: tty.ReadStream;
  try {
    stdinStream = new tty.ReadStream(0);
    stdinStream.setRawMode(true);
  } catch {
    // Fallback if not interactive TTY
    console.log(`\nServer listening at ${url}`);
    return;
  }

  readline.emitKeypressEvents(stdinStream);
  stdinStream.resume();

  const cleanup = () => {
    try {
      stdinStream.setRawMode(false);
      stdinStream.pause();
    } catch {}
  };

  stdinStream.on("keypress", (_str, key) => {
    if (!key) return;

    if (key.ctrl && key.name === "c") {
      cleanup();
      console.log(`\n  ${c.gray}Multi-Kaggle daemon stopped.${c.reset}\n`);
      if (serverInstance) serverInstance.stop();
      process.exit(0);
    }

    if (key.name === "up" || key.name === "k") {
      selectedIndex = (selectedIndex - 1 + TUI_ITEMS.length) % TUI_ITEMS.length;
      render();
    } else if (key.name === "down" || key.name === "j") {
      selectedIndex = (selectedIndex + 1) % TUI_ITEMS.length;
      render();
    } else if (key.name === "return" || key.name === "enter") {
      const selected = TUI_ITEMS[selectedIndex];

      if (selected.key === "web") {
        console.log(`\n  ${c.orange}--> Opening ${url} in default browser...${c.reset}`);
        openBrowser(url);
        setTimeout(render, 1500);
      } else if (selected.key === "help") {
        cleanup();
        console.clear();
        console.log(helpText);
        console.log(`\n  ${c.gray}Press any key to return to menu...${c.reset}`);
        stdinStream.setRawMode(true);
        stdinStream.once("keypress", () => {
          render();
        });
      } else if (selected.key === "update") {
        cleanup();
        if (serverInstance) serverInstance.stop();
        handleUpdateCommand().then(() => process.exit(0));
        return;
      } else if (selected.key === "background") {
        console.log(`\n  ${c.emerald}${c.bold}✓ Multi-Kaggle daemon running in background.${c.reset}`);
        console.log(`  ${c.white}Access Web Dashboard:${c.reset} ${c.orange}${url}${c.reset}`);
        console.log(`  ${c.dim}Stop anytime via Web UI or kill port ${port}.${c.reset}\n`);
        process.exit(0);
      } else if (selected.key === "exit") {
        cleanup();
        console.log(`\n  ${c.gray}Multi-Kaggle daemon stopped. Goodbye!${c.reset}\n`);
        if (serverInstance) serverInstance.stop();
        process.exit(0);
      }
    }
  });
}

export async function handleServeCommand(options: ServeOptions): Promise<void> {
  const port = options.port || Number(process.env.PORT || 6767);
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
