import { Database } from "bun:sqlite";

export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
  totalSeconds: number;
  gpuSeconds: number;
  tpuSeconds: number;
}

export interface AnalyticsSummary {
  totalJobs: number;
  totalHours: number;
  gpuHours: number;
  tpuHours: number;
  cpuHours: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
  dailyHeatmap: DayActivity[];
}

export class AnalyticsService {
  constructor(private readonly db: Database) {}

  getAnalytics(daysCount = 180): AnalyticsSummary {
    const jobs = this.db
      .query(
        "SELECT start_time, duration_seconds, is_gpu, is_tpu, status FROM jobs ORDER BY start_time ASC"
      )
      .all() as Array<{
      start_time: number;
      duration_seconds: number;
      is_gpu: number;
      is_tpu: number;
      status: string;
    }>;

    let totalDurationSeconds = 0;
    let gpuSeconds = 0;
    let tpuSeconds = 0;
    let cpuSeconds = 0;
    let completeCount = 0;

    const activityByDate: Record<string, { count: number; totalSeconds: number; gpuSeconds: number; tpuSeconds: number }> = {};

    for (const job of jobs) {
      const dur = job.duration_seconds || 0;
      totalDurationSeconds += dur;
      if (job.is_tpu) tpuSeconds += dur;
      else if (job.is_gpu) gpuSeconds += dur;
      else cpuSeconds += dur;

      if (job.status === "complete") completeCount++;

      const dateStr = new Date(job.start_time).toISOString().slice(0, 10);
      if (!activityByDate[dateStr]) {
        activityByDate[dateStr] = { count: 0, totalSeconds: 0, gpuSeconds: 0, tpuSeconds: 0 };
      }
      activityByDate[dateStr].count += 1;
      activityByDate[dateStr].totalSeconds += dur;
      if (job.is_tpu) activityByDate[dateStr].tpuSeconds += dur;
      else if (job.is_gpu) activityByDate[dateStr].gpuSeconds += dur;
    }

    // Build timeline for the last `daysCount` days
    const heatmap: DayActivity[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const act = activityByDate[key] || { count: 0, totalSeconds: 0, gpuSeconds: 0, tpuSeconds: 0 };
      heatmap.push({
        date: key,
        count: act.count,
        totalSeconds: act.totalSeconds,
        gpuSeconds: act.gpuSeconds,
        tpuSeconds: act.tpuSeconds,
      });
    }

    // Compute streak
    const { currentStreak, longestStreak } = this.calculateStreaks(activityByDate);

    const successRate = jobs.length > 0 ? Math.round((completeCount / jobs.length) * 100) : 100;

    return {
      totalJobs: jobs.length,
      totalHours: Math.round((totalDurationSeconds / 3600) * 10) / 10,
      gpuHours: Math.round((gpuSeconds / 3600) * 10) / 10,
      tpuHours: Math.round((tpuSeconds / 3600) * 10) / 10,
      cpuHours: Math.round((cpuSeconds / 3600) * 10) / 10,
      currentStreak,
      longestStreak,
      successRate,
      dailyHeatmap: heatmap,
    };
  }

  private calculateStreaks(
    activity: Record<string, { count: number }>
  ): { currentStreak: number; longestStreak: number } {
    const dates = Object.keys(activity).filter((d) => activity[d].count > 0).sort();
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let longest = 0;
    let tempStreak = 0;
    let prevTime: number | null = null;

    for (const d of dates) {
      const time = new Date(d).getTime();
      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((time - prevTime) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevTime = time;
      if (tempStreak > longest) longest = tempStreak;
    }

    // Check current streak from today or yesterday
    let current = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let checkDate = (activity[today]?.count ?? 0) > 0 ? today : (activity[yesterday]?.count ?? 0) > 0 ? yesterday : null;

    if (checkDate) {
      let curTime = new Date(checkDate).getTime();
      while (true) {
        const k = new Date(curTime).toISOString().slice(0, 10);
        if ((activity[k]?.count ?? 0) > 0) {
          current++;
          curTime -= 86400000;
        } else {
          break;
        }
      }
    }

    return { currentStreak: current, longestStreak: Math.max(longest, current) };
  }
}
