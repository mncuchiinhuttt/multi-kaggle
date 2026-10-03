import { Hono } from "hono";
import { z } from "zod";
import type { AccountService } from "@/services/account-service";

const CreateDatasetSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  files: z.array(
    z.object({
      name: z.string(),
      contentBase64: z.string(),
    })
  ).min(1, "At least one file is required"),
  isPrivate: z.boolean().optional(),
});

export function registerDatasetRoutes(app: Hono, accountService: AccountService): void {
  // List datasets belonging to an account
  app.get("/api/datasets", async (c) => {
    const accountId = c.req.query("accountId");
    const search = c.req.query("search") || "";

    if (!accountId) {
      // Return datasets across all active accounts
      const accounts = accountService.getAll();
      const allDatasets = [];
      for (const acc of accounts) {
        try {
          const client = accountService.getClientForAccount(acc.id);
          const list = await client.listDatasets(search);
          for (const d of list) {
            allDatasets.push({ ...d, accountId: acc.id, accountLabel: acc.label });
          }
        } catch {}
      }
      return c.json({ ok: true, data: allDatasets });
    }

    try {
      const client = accountService.getClientForAccount(accountId);
      const list = await client.listDatasets(search);
      return c.json({ ok: true, data: list });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch datasets";
      return c.json({ ok: false, error: msg }, 500);
    }
  });
}
