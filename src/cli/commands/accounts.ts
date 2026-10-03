import type { AccountService } from "@/services/account-service";

export async function handleAccountsCommand(
  accountService: AccountService,
  json = false
): Promise<void> {
  const accounts = accountService.getAll();

  if (json) {
    console.log(JSON.stringify({ ok: true, data: accounts }));
    return;
  }

  if (accounts.length === 0) {
    console.log("No Kaggle accounts configured yet.");
    console.log("Add one using: multikaggle accounts add --label <name> --username <user> --key <key>");
    return;
  }

  console.log("Kaggle Accounts Status:\n");
  for (const acc of accounts) {
    const quota = Math.round(acc.gpuHoursRemaining * 10) / 10;
    console.log(`• [${acc.status.toUpperCase()}] ${acc.label} (@${acc.username})`);
    console.log(`  ID: ${acc.id}`);
    console.log(`  Quota: ${quota}h / 30.0h`);
    if (acc.proxyUrl) console.log(`  Proxy: ${acc.proxyUrl}`);
    console.log("");
  }
}

export async function handleAddAccountCommand(
  accountService: AccountService,
  args: { label: string; username: string; apiKey: string; proxyUrl?: string }
): Promise<void> {
  try {
    const created = accountService.create({
      label: args.label,
      username: args.username,
      apiKey: args.apiKey,
      proxyUrl: args.proxyUrl,
    });
    console.log(`Account created successfully! ID: ${created.id}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating account";
    console.error(`Failed to add account: ${msg}`);
    process.exit(1);
  }
}
