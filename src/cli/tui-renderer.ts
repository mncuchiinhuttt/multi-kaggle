import { c } from "./tui-colors";
import type { VersionCheckResult } from "@/services/version-service";

export interface TuiMenuItem {
  key: string;
  title: string;
  desc: string;
}

export const TUI_ITEMS: TuiMenuItem[] = [
  {
    key: "web",
    title: "Open Web UI Dashboard",
    desc: "Launch browser & manage accounts, farm compute & logs",
  },
  {
    key: "help",
    title: "Print CLI Manual & Commands",
    desc: "Inspect available CLI dispatch, datasets & account options",
  },
  {
    key: "background",
    title: "Detach & Run in Background",
    desc: "Keep daemon active while freeing current terminal window",
  },
  {
    key: "exit",
    title: "Shutdown Server & Exit",
    desc: "Gracefully stop daemon and close database connections",
  },
];

export function renderTuiScreen(
  selectedIndex: number,
  url: string,
  versionInfo?: VersionCheckResult | null
): void {
  process.stdout.write("\x1b[H\x1b[2J\x1b[3J"); // Clear screen & scrollback

  console.log(`
${c.orange}${c.bold}┌────────────────────────────────────────────────────────┐
│  MULTI-KAGGLE ORCHESTRATOR & FARM DAEMON (v1.0.0)      │
│  Daemon status: ${c.emerald}ONLINE${c.orange} at ${c.white}${url.padEnd(28)}${c.orange}│
└────────────────────────────────────────────────────────┘${c.reset}`);

  // Release Update Alert if available
  if (versionInfo?.hasUpdate) {
    console.log(` ${c.amber}${c.bold}▲ UPDATE AVAILABLE:${c.reset} v${versionInfo.latestVersion} (Current: v${versionInfo.currentVersion})`);
    console.log(`   ${c.dim}Run 'curl -fsSL .../install.sh | bash' or visit: ${versionInfo.releaseUrl}${c.reset}\n`);
  } else {
    console.log(` ${c.dim}● Version v1.0.0 · Latest Release · Standalone Runtime${c.reset}\n`);
  }

  console.log(` ${c.gray}Use ${c.bold}↑/↓ (or j/k)${c.reset}${c.gray} to navigate, ${c.bold}Enter${c.reset}${c.gray} to select:${c.reset}\n`);

  TUI_ITEMS.forEach((item, idx) => {
    const isSelected = idx === selectedIndex;
    if (isSelected) {
      console.log(`  ${c.orange}${c.bold}❯ ${item.title}${c.reset}`);
      console.log(`    ${c.orange}${item.desc}${c.reset}\n`);
    } else {
      console.log(`    ${c.white}${item.title}${c.reset}`);
      console.log(`    ${c.gray}${item.desc}${c.reset}\n`);
    }
  });

  console.log(`${c.dim}──────────────────────────────────────────────────────────${c.reset}`);
}
