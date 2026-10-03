import type { AccountService } from "@/services/account-service";

export async function handleDatasetsCommand(
  accountService: AccountService,
  search = "",
  accountId?: string,
  json = false
): Promise<void> {
  const accounts = accountId ? [accountService.getById(accountId)].filter((a): a is NonNullable<typeof a> => a !== null) : accountService.getAll();

  if (accounts.length === 0) {
    if (json) {
      console.log(JSON.stringify({ ok: true, data: [] }));
    } else {
      console.log("No configured Kaggle accounts found.");
    }
    return;
  }

  const allDatasets = [];
  for (const acc of accounts) {
    try {
      const client = accountService.getClientForAccount(acc.id);
      const list = await client.listDatasets(search);
      for (const d of list) {
        allDatasets.push({ ...d, account: acc.label, username: acc.username });
      }
    } catch {}
  }

  if (json) {
    console.log(JSON.stringify({ ok: true, data: allDatasets }));
    return;
  }

  if (allDatasets.length === 0) {
    console.log(`No datasets found${search ? ` matching "${search}"` : ""}.`);
    return;
  }

  console.log(`Kaggle Datasets (${allDatasets.length} found):\n`);
  for (const d of allDatasets) {
    console.log(`• ${d.title} (${d.ref})`);
    console.log(`  Size   : ${d.size}`);
    console.log(`  Account: ${d.account} (@${d.username})`);
    console.log("");
  }
}
