import { execSync, spawn } from "node:child_process";
import { checkAppUpdate, APP_VERSION } from "@/services/version-service";
import { c } from "../tui-colors";

export async function handleUpdateCommand(): Promise<void> {
  console.log(`\n${c.orange}${c.bold}==> Multi-Kaggle Self-Updater${c.reset}`);
  console.log(`  Current installed version: ${c.white}v${APP_VERSION}${c.reset}`);
  console.log(`  ${c.dim}Checking GitHub release manifest...${c.reset}`);

  const update = await checkAppUpdate().catch(() => null);

  if (!update) {
    console.error(`  ${c.red}✗ Error checking for updates. Please check network connection.${c.reset}\n`);
    process.exit(1);
  }

  if (!update.hasUpdate) {
    console.log(`  ${c.emerald}${c.bold}✓ Multi-Kaggle is already at the latest release (v${update.latestVersion}).${c.reset}\n`);
    return;
  }

  console.log(`  ${c.amber}${c.bold}▲ New version available: v${update.latestVersion}${c.reset}`);
  if (update.releaseNotes) {
    const summaryLine = update.releaseNotes.split("\n").find((l) => l.trim().length > 0) || "";
    console.log(`  ${c.dim}Notes: ${summaryLine.slice(0, 80)}${c.reset}`);
  }

  console.log(`\n  ${c.cyan}Downloading and installing update...${c.reset}`);

  try {
    if (process.platform === "win32") {
      const psCmd = `irm https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.ps1 | iex`;
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`, {
        stdio: "inherit",
      });
    } else {
      const shCmd = `curl -fsSL https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.sh | bash`;
      execSync(shCmd, {
        stdio: "inherit",
      });
    }

    console.log(`\n  ${c.emerald}${c.bold}✓ Successfully updated Multi-Kaggle to v${update.latestVersion}!${c.reset}`);
    console.log(`  ${c.gray}Your accounts, GPU/TPU hours, and job history were safely preserved.${c.reset}`);
    console.log(`  Run ${c.orange}multikaggle${c.reset} to start the updated app.\n`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run update script";
    console.error(`\n  ${c.red}✗ Update installation failed: ${msg}${c.reset}`);
    console.log(`  Try running manually:`);
    console.log(`  curl -fsSL https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.sh | bash\n`);
    process.exit(1);
  }
}
