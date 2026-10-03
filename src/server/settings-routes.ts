import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { z } from "zod";
import { checkAppUpdate } from "@/services/version-service";

const SettingsSchema = z.object({
  telegram_bot_token: z.string().optional(),
  telegram_chat_id: z.string().optional(),
  polling_interval_seconds: z.string().optional(),
});

export function registerSettingsRoutes(app: Hono, db: Database): void {
  app.get("/api/settings", (c) => {
    const rows = db.query("SELECT * FROM settings").all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return c.json({ ok: true, data: settings });
  });

  app.get("/api/version", async (c) => {
    const updateInfo = await checkAppUpdate();
    return c.json({ ok: true, data: updateInfo });
  });

  app.post("/api/settings", async (c) => {
    try {
      const body = await c.req.json();
      const parsed = SettingsSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ ok: false, error: parsed.error.issues[0]?.message }, 400);
      }

      for (const [key, value] of Object.entries(parsed.data)) {
        if (value !== undefined) {
          db.run(
            `INSERT INTO settings (key, value) VALUES (?, ?) 
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [key, value]
          );
        }
      }

      return c.json({ ok: true, message: "Settings saved" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      return c.json({ ok: false, error: msg }, 500);
    }
  });
}
