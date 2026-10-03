import { spawn } from "node:child_process";
import { createApp } from "@/server/index";

export interface ServeOptions {
  port?: number;
  open?: boolean;
}

export async function handleServeCommand(options: ServeOptions): Promise<void> {
  const port = options.port || Number(process.env.PORT || 7890);
  const { app } = createApp();

  const url = `http://localhost:${port}`;
  console.log(`\n  Multi-Kaggle Server running at: ${url}`);
  console.log(`  Press Ctrl+C to terminate the daemon\n`);

  Bun.serve({
    port,
    fetch: app.fetch,
  });

  if (options.open !== false) {
    try {
      const openCmd =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
          ? "start"
          : "xdg-open";
      spawn(openCmd, [url], { detached: true, stdio: "ignore" }).unref();
    } catch {
      // ignore auto open failures
    }
  }
}
