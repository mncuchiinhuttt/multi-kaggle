import { describe, expect, it } from "bun:test";
import { createApp } from "@/server/index";

describe("Hono Server & Routes", () => {
  it("responds to /api/health", async () => {
    const { app, db, poller } = createApp(":memory:");
    try {
      const res = await app.request("/api/health");
      expect(res.status).toBe(200);
      const json = (await res.json()) as { status: string };
      expect(json.status).toBe("ok");
    } finally {
      poller.stop();
      db.close();
    }
  });

  it("handles account creation and retrieval via REST", async () => {
    const { app, db, poller } = createApp(":memory:");
    try {
      // 1. Create account
      const createRes = await app.request("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "Test Acc",
          username: "testkaggleuser",
          apiKey: "fake_token_123",
          proxyUrl: "http://127.0.0.1:8080",
        }),
      });

      expect(createRes.status).toBe(201);
      const createJson = (await createRes.json()) as { ok: boolean; data: { id: string; username: string } };
      expect(createJson.ok).toBe(true);
      expect(createJson.data.username).toBe("testkaggleuser");

      // 2. Fetch list
      const listRes = await app.request("/api/accounts");
      const listJson = (await listRes.json()) as { ok: boolean; data: Array<{ username: string }> };
      expect(listJson.ok).toBe(true);
      expect(listJson.data.length).toBe(1);
    } finally {
      poller.stop();
      db.close();
    }
  });
});
