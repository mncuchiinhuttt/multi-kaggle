import type { Context } from "grammy";
import type { AccountService } from "@/services/account-service";
import type { KernelService } from "@/services/kernel-service";

export async function handleStatusCmd(ctx: Context, accountService: AccountService): Promise<void> {
  const accounts = accountService.getAll();
  if (accounts.length === 0) {
    await ctx.reply("No Kaggle accounts registered yet.");
    return;
  }

  const lines = ["*Kaggle Accounts Status:*", ""];
  for (const acc of accounts) {
    const gpu = Math.round(acc.gpuHoursRemaining * 10) / 10;
    const tpu = Math.round((acc.tpuHoursRemaining ?? 20) * 10) / 10;
    lines.push(
      `*${acc.label}* (@${acc.username})\n` +
        `• Status: \`${acc.status.toUpperCase()}\`\n` +
        `• GPU Quota: \`${gpu}h / 30h\`\n` +
        `• TPU Quota: \`${tpu}h / 20h\`\n` +
        `• Storage: \`${acc.privateDatasetsUsedGb?.toFixed(1) ?? 0} GB / 214.75 GB\`\n` +
        (acc.proxyUrl ? `• Proxy: \`${acc.proxyUrl}\`\n` : "")
    );
  }
  await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
}

export async function handleJobsCmd(ctx: Context, kernelService: KernelService): Promise<void> {
  const jobs = kernelService.getAllJobs(10);
  if (jobs.length === 0) {
    await ctx.reply("No recorded jobs found.");
    return;
  }

  const lines = ["*Recent Jobs:*", ""];
  for (const j of jobs) {
    const duration = Math.round(j.duration_seconds / 60);
    const accel = j.is_tpu ? "TPU" : j.is_gpu ? "GPU" : "CPU";
    lines.push(
      `*${j.title}* (\`${j.kernel_slug}\`)\n` +
        `• ID: \`${j.id.slice(0, 8)}\`\n` +
        `• Status: \`${j.status.toUpperCase()}\` (${accel})\n` +
        `• Duration: ${duration}m\n`
    );
  }
  await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
}

export async function handleOutputsCmd(
  ctx: Context,
  kernelService: KernelService,
  accountService: AccountService
): Promise<void> {
  const text = ctx.message?.text?.trim() ?? "";
  const parts = text.split(/\s+/);
  if (parts.length < 2) {
    await ctx.reply("Usage: /outputs <job_id>");
    return;
  }

  const targetPrefix = parts[1];
  const jobs = kernelService.getAllJobs(50);
  const matched = jobs.find((j) => j.id.startsWith(targetPrefix));

  if (!matched) {
    await ctx.reply(`Job matching "${targetPrefix}" not found.`);
    return;
  }

  try {
    const client = accountService.getClientForAccount(matched.account_id);
    const output = await client.getKernelOutput(matched.kernel_slug);
    if (output.files.length === 0) {
      await ctx.reply(`No output files generated for ${matched.kernel_slug}`);
      return;
    }

    const lines = [`*Output Files for ${matched.kernel_slug}:*`, ""];
    for (const f of output.files) {
      lines.push(`• [${f.name}](${f.url})`);
    }
    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
  } catch {
    await ctx.reply("Failed to fetch output files.");
  }
}
