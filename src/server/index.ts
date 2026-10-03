import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { TelegramNotifier } from "@/bot/notifier";
import { createTelegramBot } from "@/bot/telegram-bot";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";
import { AnalyticsService } from "@/services/analytics-service";
import { KernelService } from "@/services/kernel-service";
import { PollerService } from "@/services/poller-service";
import { registerAccountRoutes } from "./account-routes";
import { registerAnalyticsRoutes } from "./analytics-routes";
import { registerDatasetRoutes } from "./dataset-routes";
import { registerJobRoutes } from "./job-routes";
import { registerSettingsRoutes } from "./settings-routes";

export function createApp(dbPath = "data/multi-kaggle.db") {
  const db = initDatabase(dbPath);
  const masterSecret = process.env.MASTER_SECRET_KEY || "multi-kaggle-default-secret-key-32b";

  const accountService = new AccountService(db, masterSecret);
  const kernelService = new KernelService(db, accountService);
  const analyticsService = new AnalyticsService(db);

  // Settings
  const tgTokenRow = db
    .query("SELECT value FROM settings WHERE key = 'telegram_bot_token'")
    .get() as { value: string } | null;
  const tgChatRow = db
    .query("SELECT value FROM settings WHERE key = 'telegram_chat_id'")
    .get() as { value: string } | null;

  const botToken = process.env.TELEGRAM_BOT_TOKEN || tgTokenRow?.value;
  const chatId = process.env.TELEGRAM_CHAT_ID || tgChatRow?.value;

  const notifier = new TelegramNotifier(botToken, chatId);
  const poller = new PollerService(db, accountService, notifier, 60000);
  poller.start();

  // Telegram Bot initiation if token provided
  if (botToken) {
    try {
      const bot = createTelegramBot({ token: botToken, allowedChatId: chatId }, accountService, kernelService);
      bot.start({
        onStart: (botInfo) => {
          console.log(`Telegram Bot @${botInfo.username} started in long-polling mode`);
        },
      }).catch((err) => {
        console.error("Failed to start Telegram Bot:", err);
      });
    } catch (err) {
      console.error("Error creating Telegram Bot:", err);
    }
  }

  const app = new Hono();
  app.use("*", logger());
  app.use("*", cors());

  // Health check
  app.get("/api/health", (c) => c.json({ status: "ok", version: "1.0.0" }));

  // Register domain APIs
  registerAccountRoutes(app, accountService);
  registerJobRoutes(app, kernelService, accountService);
  registerDatasetRoutes(app, accountService);
  registerAnalyticsRoutes(app, analyticsService);
  registerSettingsRoutes(app, db);

  // Serve static frontend build if present
  const frontendDist = join(process.cwd(), "frontend", "dist");
  app.get("*", async (c) => {
    const urlPath = c.req.path === "/" ? "index.html" : c.req.path.slice(1);
    const filePath = join(frontendDist, urlPath);

    if (existsSync(filePath)) {
      const ext = filePath.split(".").pop() ?? "";
      let contentType = "text/plain";
      if (ext === "html") contentType = "text/html";
      else if (ext === "js") contentType = "application/javascript";
      else if (ext === "css") contentType = "text/css";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "json") contentType = "application/json";

      const fileContent = readFileSync(filePath);
      return new Response(fileContent, {
        headers: { "Content-Type": contentType },
      });
    }

    // SPA fallback
    const indexPath = join(frontendDist, "index.html");
    if (existsSync(indexPath)) {
      const indexContent = readFileSync(indexPath);
      return new Response(indexContent, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return c.text("Multi-Kaggle Backend Running. Frontend dist not found.", 200);
  });

  return { app, db, poller, accountService, kernelService, analyticsService };
}
