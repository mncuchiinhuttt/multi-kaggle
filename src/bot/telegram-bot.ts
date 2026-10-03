import { Bot } from "grammy";
import type { AccountService } from "@/services/account-service";
import type { KernelService } from "@/services/kernel-service";

export interface BotConfig {
  token: string;
  allowedChatId?: string;
}

export function createTelegramBot(
  config: BotConfig,
  accountService: AccountService,
  kernelService: KernelService
): Bot {
  const bot = new Bot(config.token);

  // Authentication middleware
  bot.use(async (ctx, next) => {
    if (config.allowedChatId && String(ctx.chat?.id) !== String(config.allowedChatId)) {
      await ctx.reply("Unauthorized access. This bot is private.");
      return;
    }
    await next();
  });

  bot.command("start", async (ctx) => {
    const welcome = [
      "*Multi-Kaggle Remote Control*",
      "",
      "Available commands:",
      "/status - Show accounts & GPU quota summary",
      "/jobs - List active and recent jobs",
      "/cancel <job_id> - Cancel a running kernel",
      "/help - Show this guide",
    ].join("\n");
    await ctx.reply(welcome, { parse_mode: "Markdown" });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Use /status to inspect accounts, /jobs to monitor runs, or /cancel <id> to abort."
    );
  });

  bot.command("status", async (ctx) => {
    const accounts = accountService.getAll();
    if (accounts.length === 0) {
      await ctx.reply("No Kaggle accounts registered yet.");
      return;
    }

    const lines = ["*Kaggle Accounts Status:*", ""];
    for (const acc of accounts) {
      const quota = Math.round(acc.gpuHoursRemaining * 10) / 10;
      lines.push(
        `*${acc.label}* (@${acc.username})\n` +
          `• Status: \`${acc.status.toUpperCase()}\`\n` +
          `• Remaining GPU: \`${quota}h / 30h\`\n` +
          (acc.proxyUrl ? `• Proxy: \`${acc.proxyUrl}\`\n` : "")
      );
    }
    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
  });

  bot.command("jobs", async (ctx) => {
    const jobs = kernelService.getAllJobs(10);
    if (jobs.length === 0) {
      await ctx.reply("No recorded jobs found.");
      return;
    }

    const lines = ["*Recent Jobs:*", ""];
    for (const j of jobs) {
      const duration = Math.round(j.duration_seconds / 60);
      lines.push(
        `*${j.title}* (\`${j.kernel_slug}\`)\n` +
          `• ID: \`${j.id.slice(0, 8)}\`\n` +
          `• Status: \`${j.status.toUpperCase()}\`\n` +
          `• Duration: ${duration}m\n`
      );
    }
    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
  });

  bot.command("cancel", async (ctx) => {
    const text = ctx.message?.text?.trim() ?? "";
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      await ctx.reply("Usage: /cancel <job_id>");
      return;
    }

    const targetPrefix = parts[1];
    const jobs = kernelService.getAllJobs(50);
    const matched = jobs.find(
      (j) => j.id.startsWith(targetPrefix) && (j.status === "running" || j.status === "queued")
    );

    if (!matched) {
      await ctx.reply(`Active job matching "${targetPrefix}" not found.`);
      return;
    }

    const cancelled = kernelService.cancelJob(matched.id);
    if (cancelled) {
      await ctx.reply(`Job \`${matched.kernel_slug}\` (${matched.id.slice(0, 8)}) cancelled.`);
    } else {
      await ctx.reply(`Failed to cancel job.`);
    }
  });

  return bot;
}
