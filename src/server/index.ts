import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { TelegramNotifier } from "@/bot/notifier";
import { createTelegramBot } from "@/bot/telegram-bot";
import { initDatabase } from "@/db/database";
import { AccountService } from "@/services/account-service";
import { AnalyticsService } from "@/services/analytics-service";
import { KernelService } from "@/services/kernel-service";
import { PollerService } from "@/services/poller-service";
import { handleKaggleOAuthCallback } from "@/services/native-oauth-service";
import { getEmbeddedFile } from "./embedded-assets";
import { registerAccountRoutes } from "./account-routes";
import { registerAnalyticsRoutes } from "./analytics-routes";
import { registerDatasetRoutes } from "./dataset-routes";
import { registerJobRoutes } from "./job-routes";
import { registerSettingsRoutes } from "./settings-routes";

export function createApp(dbPath?: string) {
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
  app.use("*", cors());

  // Health check
  app.get("/api/health", (c) => c.json({ status: "ok", version: "1.0.0" }));

  // Graceful shutdown endpoint
  app.post("/api/shutdown", (c) => {
    setTimeout(() => {
      poller.stop();
      db.close();
      process.exit(0);
    }, 400);
    return c.json({ ok: true, message: "Multi-Kaggle daemon shutting down gracefully." });
  });

  // Intercept root GET when Kaggle redirects back with ?code=...&state=...
  app.get("/", async (c, next) => {
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (code && state) {
      const result = await handleKaggleOAuthCallback(code, state, accountService);
      if (!result.ok) {
        return c.html(`
          <html><body style="font-family:sans-serif;padding:40px;background:#09090b;color:#fff;text-align:center;">
            <h2 style="color:#ef4444;">Authentication Error</h2>
            <p>${result.error}</p>
            <a href="/" style="color:#f6821f;">Return to Dashboard</a>
          </body></html>
        `, 500);
      }

      return c.html(`
        <html><body style="font-family:sans-serif;padding:40px;background:#09090b;color:#fff;text-align:center;">
          <h2 style="color:#10b981;">Authentication Successful!</h2>
          <p>Account <strong>@${result.username}</strong> has been added to Multi-Kaggle.</p>
          <p>Redirecting to dashboard...</p>
          <script>
            setTimeout(() => { window.location.href = '/'; }, 1500);
          </script>
        </body></html>
      `);
    }

    await next();
  });

  // Register domain APIs
  registerAccountRoutes(app, accountService);
  registerJobRoutes(app, kernelService, accountService);
  registerDatasetRoutes(app, accountService);
  registerAnalyticsRoutes(app, analyticsService);
  registerSettingsRoutes(app, db);

  // Serve static assets: 1st checks filesystem, 2nd checks embedded in-binary assets, 3rd SPA fallback
  const frontendDist = join(process.cwd(), "frontend", "dist");
  app.get("*", async (c) => {
    const urlPath = c.req.path === "/" ? "index.html" : c.req.path.slice(1);
    const filePath = join(frontendDist, urlPath);

    // 1. Filesystem check
    if (existsSync(filePath)) {
      const ext = filePath.split(".").pop() ?? "";
      let contentType = "text/plain";
      if (ext === "html") contentType = "text/html";
      else if (ext === "js") contentType = "application/javascript";
      else if (ext === "css") contentType = "text/css";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "json") contentType = "application/json";

      return new Response(readFileSync(filePath), {
        headers: { "Content-Type": contentType },
      });
    }

    // 2. Embedded asset check (works inside compiled standalone binary anywhere!)
    const embedded = getEmbeddedFile(urlPath);
    if (embedded) {
      return new Response(embedded.data, {
        headers: { "Content-Type": embedded.contentType },
      });
    }

    // 3. SPA Fallback: from filesystem
    const indexPath = join(frontendDist, "index.html");
    if (existsSync(indexPath)) {
      return new Response(readFileSync(indexPath), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 4. SPA Fallback: from embedded binary
    const embeddedIndex = getEmbeddedFile("index.html");
    if (embeddedIndex) {
      return new Response(embeddedIndex.data, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return c.text("Multi-Kaggle Backend Running. No frontend assets available.", 200);
  });

  return { app, db, poller, accountService, kernelService, analyticsService };
}
