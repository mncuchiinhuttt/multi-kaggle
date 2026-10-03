import { Hono } from "hono";
import { z } from "zod";
import type { KernelService } from "@/services/kernel-service";

const DispatchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  notebookContent: z.string().min(1, "Notebook or code content is required"),
  kernelType: z.enum(["notebook", "script"]).optional(),
  strategy: z.enum(["manual", "max_quota", "round_robin"]).optional(),
  targetAccountId: z.string().optional(),
  isGpu: z.boolean().optional(),
  enableInternet: z.boolean().optional(),
});

export function registerJobRoutes(app: Hono, kernelService: KernelService): void {
  app.get("/api/jobs", (c) => {
    const accountId = c.req.query("accountId") ?? undefined;
    const limit = Number(c.req.query("limit") || "50");
    const jobs = kernelService.getAllJobs(limit, accountId);
    return c.json({ ok: true, data: jobs });
  });

  app.get("/api/jobs/:id", (c) => {
    const id = c.req.param("id");
    const job = kernelService.getJobById(id);
    if (!job) {
      return c.json({ ok: false, error: "Job not found" }, 404);
    }
    return c.json({ ok: true, data: job });
  });

  app.post("/api/jobs/dispatch", async (c) => {
    try {
      const body = await c.req.json();
      const parsed = DispatchSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ ok: false, error: parsed.error.issues[0]?.message }, 400);
      }

      const result = await kernelService.dispatch(parsed.data);
      if (!result.ok) {
        return c.json({ ok: false, error: result.error }, 400);
      }
      return c.json({ ok: true, data: result.job }, 201);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Dispatch failed";
      return c.json({ ok: false, error: msg }, 500);
    }
  });

  app.post("/api/jobs/:id/cancel", (c) => {
    const id = c.req.param("id");
    const success = kernelService.cancelJob(id);
    if (!success) {
      return c.json({ ok: false, error: "Job not found or could not be cancelled" }, 404);
    }
    return c.json({ ok: true, message: "Job cancelled" });
  });
}
