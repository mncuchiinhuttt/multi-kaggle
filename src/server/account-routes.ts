import { Hono } from "hono";
import { z } from "zod";
import type { AccountService } from "@/services/account-service";

const CreateAccountSchema = z.object({
  label: z.string().min(1, "Label is required"),
  username: z.string().min(1, "Username is required"),
  apiKey: z.string().min(1, "API Key is required"),
  proxyUrl: z.string().nullable().optional(),
});

export function registerAccountRoutes(app: Hono, accountService: AccountService): void {
  app.get("/api/accounts", (c) => {
    const accounts = accountService.getAll();
    return c.json({ ok: true, data: accounts });
  });

  app.post("/api/accounts", async (c) => {
    try {
      const body = await c.req.json();
      const parsed = CreateAccountSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ ok: false, error: parsed.error.issues[0]?.message }, 400);
      }
      const created = accountService.create(parsed.data);
      return c.json({ ok: true, data: created }, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      return c.json({ ok: false, error: msg }, 500);
    }
  });

  app.delete("/api/accounts/:id", (c) => {
    const id = c.req.param("id");
    const deleted = accountService.delete(id);
    if (!deleted) {
      return c.json({ ok: false, error: "Account not found" }, 404);
    }
    return c.json({ ok: true, message: "Account deleted" });
  });

  app.post("/api/accounts/:id/test", async (c) => {
    const id = c.req.param("id");
    try {
      const result = await accountService.testAccountConnection(id);
      return c.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error testing account";
      return c.json({ ok: false, message: msg }, 500);
    }
  });
}
