import { describe, expect, it } from "bun:test";
import { createApp } from "@/server/index";

describe("E2E Integration & Dispatch Pipeline", () => {
  it("delivers full lifecycle: creates account, dispatches kernel, verifies job tracking", async () => {
    const { app, db, poller, accountService } = createApp(":memory:");

    // Mock fetch for Kaggle API
    const originalFetch = globalThis.fetch;
    let pushPayloadReceived: any = null;

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/v1/kernels/push")) {
        pushPayloadReceived = JSON.parse(init?.body as string);
        return new Response(JSON.stringify({ url: "https://kaggle.com/code/user/job-slug" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    try {
      // 1. Add account
      const acc = accountService.create({
        label: "GPU Farm 1",
        username: "gpufarmer",
        apiKey: "kaggle_token_secret",
      });
      expect(acc.id).toBeDefined();

      // 2. Dispatch notebook via API
      const sampleNotebook = JSON.stringify({
        cells: [{ cell_type: "code", source: ["import torch", "print(torch.cuda.is_available())"] }],
      });

      const dispatchRes = await app.request("/api/jobs/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "PyTorch GPU Test",
          notebookContent: sampleNotebook,
          strategy: "max_quota",
          isGpu: true,
          enableInternet: true,
        }),
      });

      expect(dispatchRes.status).toBe(201);
      const dispatchJson = (await dispatchRes.json()) as { ok: boolean; data: { id: string; status: string } };
      expect(dispatchJson.ok).toBe(true);
      expect(dispatchJson.data.status).toBe("queued");

      // Verify Kaggle payload had watermark and correct parameters
      expect(pushPayloadReceived).toBeDefined();
      expect(pushPayloadReceived.slug).toBe("pytorch-gpu-test");
      expect(pushPayloadReceived.enableGpu).toBe(true);
      expect(pushPayloadReceived.text).toContain("Run-ID");

      // 3. Query jobs endpoint
      const jobsRes = await app.request("/api/jobs");
      const jobsJson = (await jobsRes.json()) as { ok: boolean; data: Array<{ title: string }> };
      expect(jobsJson.ok).toBe(true);
      expect(jobsJson.data.length).toBe(1);
      expect(jobsJson.data[0].title).toBe("PyTorch GPU Test");

      // 4. Test SPA static fallback route
      const spaRes = await app.request("/");
      expect(spaRes.status).toBe(200);
      const spaHtml = await spaRes.text();
      expect(spaHtml).toContain("Multi-Kaggle");
    } finally {
      globalThis.fetch = originalFetch;
      poller.stop();
      db.close();
    }
  });
});
