import type { AccountService } from "@/services/account-service";

export async function handleModelsCommand(
  accountService: AccountService,
  search = "",
  accountId?: string,
  json = false
): Promise<void> {
  const accounts = accountId
    ? [accountService.getById(accountId)].filter((a): a is NonNullable<typeof a> => a !== null)
    : accountService.getAll();

  if (accounts.length === 0) {
    if (json) {
      console.log(JSON.stringify({ ok: true, data: [] }));
    } else {
      console.log("No configured Kaggle accounts found.");
    }
    return;
  }

  const allModels: Array<{ ref: string; title: string; account: string; username: string }> = [];

  for (const acc of accounts) {
    try {
      const client = accountService.getClientForAccount(acc.id);
      const list = await client.listModels(search);
      for (const m of list) {
        allModels.push({
          ref: m.ref,
          title: m.title,
          account: acc.label,
          username: acc.username,
        });
      }
    } catch {}
  }

  if (json) {
    console.log(JSON.stringify({ ok: true, data: allModels }));
    return;
  }

  if (allModels.length === 0) {
    console.log(`No models found${search ? ` matching "${search}"` : ""}.`);
    return;
  }

  console.log(`Kaggle Models (${allModels.length} found):\n`);
  for (const m of allModels) {
    console.log(`• ${m.title} (${m.ref})`);
    console.log(`  Account: ${m.account} (@${m.username})`);
    console.log("");
  }
}
