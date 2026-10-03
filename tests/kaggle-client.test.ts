import { describe, expect, it } from "bun:test";
import { KaggleApiClient } from "@/core/kaggle-client";

describe("KaggleApiClient", () => {
  it("initializes credentials and authorization headers correctly", () => {
    const client = new KaggleApiClient("testuser", "mytoken123", "http://proxy.local:8080");
    expect(client.username).toBe("testuser");
  });

  it("handles push payload formatting and watermark insertion for JSON notebooks", async () => {
    const originalFetch = globalThis.fetch;
    let capturedBody = "";
    let capturedAuth = "";

    // Mock fetch
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedAuth = (init?.headers as Record<string, string>)?.Authorization ?? "";
      capturedBody = init?.body as string;
      return new Response(JSON.stringify({ url: "https://www.kaggle.com/code/testuser/my-kernel" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    try {
      const client = new KaggleApiClient("testuser", "secrettoken");
      const sampleNotebook = JSON.stringify({
        cells: [{ cell_type: "code", source: ["print('hello world')"] }],
      });

      const res = await client.pushKernel({
        slug: "my-kernel",
        notebookContent: sampleNotebook,
      });

      expect(res.ok).toBe(true);
      expect(res.url).toBe("https://www.kaggle.com/code/testuser/my-kernel");
      expect(capturedAuth).toBe(`Basic ${Buffer.from("testuser:secrettoken").toString("base64")}`);

      const bodyObj = JSON.parse(capturedBody);
      expect(bodyObj.id).toBe("testuser/my-kernel");
      expect(bodyObj.text).toContain("Run-ID");
      expect(bodyObj.text).toContain("print('hello world')");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("parses kernel status accurately", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ status: "running" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    try {
      const client = new KaggleApiClient("testuser", "token");
      const statusRes = await client.getKernelStatus("test-slug");
      expect(statusRes.status).toBe("running");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
