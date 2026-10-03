import { Hono } from "hono";
import type { AnalyticsService } from "@/services/analytics-service";

export function registerAnalyticsRoutes(app: Hono, analyticsService: AnalyticsService): void {
  app.get("/api/analytics", (c) => {
    const days = Number(c.req.query("days") || "180");
    const summary = analyticsService.getAnalytics(days);
    return c.json({ ok: true, data: summary });
  });
}
