import { describe, expect, it } from "bun:test";
import { initDatabase } from "@/db/database";
import { AnalyticsService } from "@/services/analytics-service";

describe("AnalyticsService Heatmap & Streaks", () => {
  it("calculates total runtime, daily heatmap and streaks accurately", () => {
    const db = initDatabase(":memory:");
    const now = Date.now();

    // Insert 2 jobs on today
    db.run(
      `INSERT INTO accounts (id, label, username, api_key_encrypted, api_key_iv, created_at, updated_at)
       VALUES ('acc1', 'Acc 1', 'user1', 'enc', 'iv', ?, ?)`,
      [now, now]
    );

    db.run(
      `INSERT INTO jobs (id, account_id, kernel_slug, title, is_gpu, is_tpu, status, start_time, duration_seconds, created_at)
       VALUES ('job1', 'acc1', 'slug-1', 'Title 1', 1, 0, 'complete', ?, 3600, ?)`,
      [now, now]
    );

    db.run(
      `INSERT INTO jobs (id, account_id, kernel_slug, title, is_gpu, is_tpu, status, start_time, duration_seconds, created_at)
       VALUES ('job2', 'acc1', 'slug-2', 'Title 2', 0, 1, 'complete', ?, 7200, ?)`,
      [now, now]
    );

    const service = new AnalyticsService(db);
    const analytics = service.getAnalytics(30);

    expect(analytics.totalJobs).toBe(2);
    expect(analytics.totalHours).toBe(3.0); // 3600 + 7200 = 10800s = 3.0h
    expect(analytics.gpuHours).toBe(1.0);
    expect(analytics.tpuHours).toBe(2.0);
    expect(analytics.currentStreak).toBe(1);
    expect(analytics.successRate).toBe(100);
    expect(analytics.dailyHeatmap.length).toBe(30);

    db.close();
  });
});
