import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import type { KernelService } from "@/services/kernel-service";
import type { AccountService } from "@/services/account-service";

export async function handleOutputsCommand(
  kernelService: KernelService,
  accountService: AccountService,
  jobId: string,
  downloadDir?: string,
  json = false
): Promise<void> {
  const jobs = kernelService.getAllJobs(100);
  const matched = jobs.find((j) => j.id.startsWith(jobId));

  if (!matched) {
    if (json) {
      console.log(JSON.stringify({ ok: false, error: `Job matching "${jobId}" not found.` }));
    } else {
      console.error(`Error: Job matching "${jobId}" not found.`);
    }
    process.exit(1);
  }

  const client = accountService.getClientForAccount(matched.account_id);
  const output = await client.getKernelOutput(matched.kernel_slug);

  if (json) {
    console.log(JSON.stringify({ ok: true, job: matched, output }));
    return;
  }

  console.log(`Kernel Outputs for [${matched.title}] (${matched.kernel_slug}):\n`);
  if (output.files.length === 0) {
    console.log("No downloadable output files generated for this run.");
  } else {
    console.log(`Artifact Files (${output.files.length}):`);
    for (const f of output.files) {
      console.log(`  • ${f.name} -> ${f.url}`);
    }
  }

  if (downloadDir && output.files.length > 0) {
    const targetPath = resolve(process.cwd(), downloadDir);
    mkdirSync(targetPath, { recursive: true });
    console.log(`\nDownloading files to ${targetPath}...`);

    for (const f of output.files) {
      try {
        const res = await fetch(f.url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          writeFileSync(join(targetPath, f.name), buffer);
          console.log(`  ✓ Downloaded ${f.name}`);
        }
      } catch (err: unknown) {
        console.error(`  ✗ Failed to download ${f.name}`);
      }
    }
  }

  if (output.log) {
    console.log(`\nLog Tail:\n----------------------------------------`);
    console.log(output.log.slice(-500));
    console.log(`----------------------------------------`);
  }
}
