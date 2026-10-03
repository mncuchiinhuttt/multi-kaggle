import { readFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import type { KernelService } from "@/services/kernel-service";

export interface RunCommandOptions {
  filePath: string;
  title?: string;
  strategy?: "max_quota" | "round_robin" | "manual";
  account?: string;
  gpu?: boolean;
  tpu?: boolean;
  internet?: boolean;
  json?: boolean;
}

export async function handleRunCommand(
  kernelService: KernelService,
  options: RunCommandOptions
): Promise<void> {
  const fullPath = resolve(process.cwd(), options.filePath);
  if (!existsSync(fullPath)) {
    if (options.json) {
      console.log(JSON.stringify({ ok: false, error: `File not found: ${options.filePath}` }));
    } else {
      console.error(`Error: File not found at ${fullPath}`);
    }
    process.exit(1);
  }

  const content = readFileSync(fullPath, "utf-8");
  const fileName = basename(fullPath);
  const isScript = fileName.endsWith(".py");
  const title = options.title || fileName.replace(/\.[^/.]+$/, "");

  const result = await kernelService.dispatch({
    title,
    notebookContent: content,
    kernelType: isScript ? "script" : "notebook",
    strategy: options.strategy ?? "max_quota",
    targetAccountId: options.account,
    isGpu: options.tpu ? false : (options.gpu ?? true),
    isTpu: Boolean(options.tpu),
    enableInternet: options.internet ?? true,
  });

  if (options.json) {
    console.log(JSON.stringify(result));
    if (!result.ok) process.exit(1);
    return;
  }

  if (!result.ok || !result.job) {
    console.error(`Failed to dispatch: ${result.error}`);
    process.exit(1);
  }

  const accel = result.job.is_tpu ? "TPU v3-8" : result.job.is_gpu ? "GPU T4x2" : "CPU";
  console.log(`Successfully dispatched kernel!`);
  console.log(`• Job ID   : ${result.job.id}`);
  console.log(`• Slug     : ${result.job.kernel_slug}`);
  console.log(`• Status   : ${result.job.status.toUpperCase()}`);
  console.log(`• Hardware : ${accel}`);
  console.log(`• Track    : run 'multikaggle jobs' to inspect status`);
}
