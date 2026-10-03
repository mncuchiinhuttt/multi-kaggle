import { Bot } from "grammy";
import type { AccountService } from "@/services/account-service";
import type { KernelService } from "@/services/kernel-service";
import { handleStatusCmd, handleJobsCmd, handleOutputsCmd } from "./telegram-commands";

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
      "/status - Show accounts & GPU/TPU quota summary",
      "/jobs - List active and recent jobs",
      "/outputs <job_id> - Get downloadable outputs of a finished run",
      "/datasets [search] - List datasets across accounts",
      "/models [search] - List Kaggle models across accounts",
      "/cancel <job_id> - Cancel a running kernel",
      "/help - Show this guide",
    ].join("\n");
    await ctx.reply(welcome, { parse_mode: "Markdown" });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Commands: /status, /jobs, /outputs <job_id>, /datasets [search], /models [search], /cancel <job_id>"
    );
  });

  bot.command("status", (ctx) => handleStatusCmd(ctx, accountService));
  bot.command("jobs", (ctx) => handleJobsCmd(ctx, kernelService));
  bot.command("outputs", (ctx) => handleOutputsCmd(ctx, kernelService, accountService));

  bot.command("datasets", async (ctx) => {
    const text = ctx.message?.text?.trim() ?? "";
    const search = text.split(/\s+/).slice(1).join(" ");
    const accounts = accountService.getAll();
    if (accounts.length === 0) return void (await ctx.reply("No Kaggle accounts configured."));

    const results = [];
    for (const acc of accounts) {
      try {
        const client = accountService.getClientForAccount(acc.id);
        const list = await client.listDatasets(search);
        for (const d of list.slice(0, 3)) results.push(`• *${d.title}* (\`${d.ref}\`) - ${d.size}`);
      } catch {}
    }

    if (results.length === 0) return void (await ctx.reply(`No datasets found${search ? ` for "${search}"` : ""}.`));
    await ctx.reply([`*Kaggle Datasets:*`, "", ...results].join("\n"), { parse_mode: "Markdown" });
  });

  bot.command("models", async (ctx) => {
    const text = ctx.message?.text?.trim() ?? "";
    const search = text.split(/\s+/).slice(1).join(" ");
    const accounts = accountService.getAll();
    if (accounts.length === 0) return void (await ctx.reply("No Kaggle accounts configured."));

    const results = [];
    for (const acc of accounts) {
      try {
        const client = accountService.getClientForAccount(acc.id);
        const list = await client.listModels(search);
        for (const m of list.slice(0, 3)) results.push(`• *${m.title}* (\`${m.ref}\`)`);
      } catch {}
    }

    if (results.length === 0) return void (await ctx.reply(`No models found${search ? ` for "${search}"` : ""}.`));
    await ctx.reply([`*Kaggle Models:*`, "", ...results].join("\n"), { parse_mode: "Markdown" });
  });

  bot.command("cancel", async (ctx) => {
    const text = ctx.message?.text?.trim() ?? "";
    const parts = text.split(/\s+/);
    if (parts.length < 2) return void (await ctx.reply("Usage: /cancel <job_id>"));

    const targetPrefix = parts[1];
    const jobs = kernelService.getAllJobs(50);
    const matched = jobs.find(
      (j) => j.id.startsWith(targetPrefix) && (j.status === "running" || j.status === "queued")
    );

    if (!matched) return void (await ctx.reply(`Active job matching "${targetPrefix}" not found.`));

    const cancelled = kernelService.cancelJob(matched.id);
    await ctx.reply(cancelled ? `Job \`${matched.kernel_slug}\` cancelled.` : "Failed to cancel job.");
  });

  return bot;
}
