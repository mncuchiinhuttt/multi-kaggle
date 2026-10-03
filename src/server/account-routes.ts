import { Hono } from "hono";
import { z } from "zod";
import type { AccountService } from "@/services/account-service";
import {
  clearLocalKaggleCredentials,
  isKaggleCliInstalled,
  readLocalKaggleCredentials,
  startKaggleCliLogin,
} from "@/services/cli-auth-service";
import {
  buildKaggleOAuthUrl,
  handleKaggleOAuthCallback,
} from "@/services/native-oauth-service";

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

  // Direct Browser OAuth Link generator (e.g. for any browser or private window)
  app.get("/api/oauth/url", (c) => {
    const host = c.req.header("host") || "localhost:7890";
    const info = buildKaggleOAuthUrl(host);
    return c.json({ ok: true, data: info });
  });

  // Direct OAuth redirect endpoint (e.g. user visits localhost:7890/auth)
  app.get("/auth", (c) => {
    const host = c.req.header("host") || "localhost:7890";
    const info = buildKaggleOAuthUrl(host);
    return c.redirect(info.authUrl);
  });

  // OAuth Callback endpoint where Kaggle redirects back with code & state
  app.get("/api/oauth/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (!code || !state) {
      return c.html(`
        <html><body style="font-family:sans-serif;padding:40px;background:#09090b;color:#fff;text-align:center;">
          <h2 style="color:#ef4444;">Authentication Failed</h2>
          <p>Missing code or state parameters from Kaggle.</p>
          <a href="/" style="color:#f6821f;">Return to Dashboard</a>
        </body></html>
      `, 400);
    }

    const result = await handleKaggleOAuthCallback(code, state, accountService);
    if (!result.ok) {
      return c.html(`
        <html><body style="font-family:sans-serif;padding:40px;background:#09090b;color:#fff;text-align:center;">
          <h2 style="color:#ef4444;">Authentication Error</h2>
          <p>${result.error}</p>
          <a href="/" style="color:#f6821f;">Return to Dashboard</a>
        </body></html>
      `, 500);
    }

    return c.html(`
      <html><body style="font-family:sans-serif;padding:40px;background:#09090b;color:#fff;text-align:center;">
        <h2 style="color:#10b981;">Authentication Successful!</h2>
        <p>Account <strong>@${result.username}</strong> has been added to Multi-Kaggle.</p>
        <p>You can close this tab and return to the dashboard.</p>
        <script>
          setTimeout(() => { window.location.href = '/'; }, 2000);
        </script>
      </body></html>
    `);
  });

  app.get("/api/accounts/cli-status", async (c) => {
    const installed = await isKaggleCliInstalled();
    const creds = readLocalKaggleCredentials();
    return c.json({
      ok: true,
      data: {
        cliInstalled: installed,
        hasLocalCredentials: Boolean(creds),
        detectedUsername: creds?.username || null,
        credentialSource: creds?.source || null,
      },
    });
  });

  app.post("/api/accounts/cli-login", async (c) => {
    const installed = await isKaggleCliInstalled();
    if (!installed) {
      return c.json({ ok: false, error: "Kaggle CLI is not installed on the system." }, 400);
    }
    const result = startKaggleCliLogin();
    return c.json(result);
  });

  app.post("/api/accounts/cli-import", async (c) => {
    const creds = readLocalKaggleCredentials();
    if (!creds) {
      return c.json(
        { ok: false, error: "No ~/.kaggle credentials detected. Run 'kaggle auth login' first." },
        400
      );
    }

    try {
      const body = (await c.req.json().catch(() => ({}))) as {
        label?: string;
        proxyUrl?: string;
      };

      const account = accountService.create({
        label: body.label || `${creds.username}-cli`,
        username: creds.username,
        apiKey: creds.token,
        proxyUrl: body.proxyUrl || null,
      });

      clearLocalKaggleCredentials();

      return c.json({
        ok: true,
        data: account,
        message: "Account imported from Kaggle CLI and local session reset.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import account";
      return c.json({ ok: false, error: msg }, 500);
    }
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

  app.post("/api/accounts/:id/storage", async (c) => {
    const id = c.req.param("id");
    try {
      const body = (await c.req.json()) as { usedGb?: number };
      const used = Number(body.usedGb ?? 0);
      accountService["db"].run("UPDATE accounts SET private_datasets_used_gb = ? WHERE id = ?", [used, id]);
      return c.json({ ok: true, usedGb: used });
    } catch (err: unknown) {
      return c.json({ ok: false, error: "Failed to update storage" }, 500);
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
