import React from "react";
import type { DayActivity } from "@/components/UsageTab";

interface HeatmapGridProps {
  days: DayActivity[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""];

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ days }) => {
  const getColorLevel = (count: number) => {
    if (count === 0) return "bg-muted/40 border border-border/60 hover:border-border";
    if (count === 1) return "bg-primary/30 border border-primary/40";
    if (count <= 3) return "bg-primary/60 border border-primary/70";
    return "bg-primary border border-primary-hover shadow-sm";
  };

  // Group days into columns of 7 days (weeks)
  const weeks: DayActivity[][] = [];
  let curWeek: DayActivity[] = [];
  for (const d of days) {
    curWeek.push(d);
    if (curWeek.length === 7) {
      weeks.push(curWeek);
      curWeek = [];
    }
  }
  if (curWeek.length > 0) weeks.push(curWeek);

  // Calculate Month labels positions
  const monthLabels: { month: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wIdx) => {
    const firstDay = week[0];
    if (firstDay) {
      const monthNum = new Date(firstDay.date).getMonth();
      if (monthNum !== lastMonth) {
        monthLabels.push({ month: MONTHS[monthNum], weekIdx: wIdx });
        lastMonth = monthNum;
      }
    }
  });

  const getTooltipClass = (wIdx: number, dayIdx: number) => {
    const vPos = dayIdx <= 1 ? "top-full mt-2" : "bottom-full mb-2";
    let hPos = "left-1/2 -translate-x-1/2";
    if (wIdx >= weeks.length - 6) {
      hPos = "right-0";
    } else if (wIdx < 4) {
      hPos = "left-0";
    }
    return `absolute ${vPos} ${hPos} hidden group-hover:block z-50 whitespace-nowrap p-2.5 bg-popover text-popover-foreground border border-border font-mono text-[11px] shadow-2xl pointer-events-none select-none`;
  };

  return (
    <div className="border border-border bg-card p-6 space-y-5 w-full">
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Yearly Compute Activity Heatmap (Last 12 Months)
          </h3>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            52-week activity breakdown across all Kaggle accounts and accelerator environments
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground self-end sm:self-auto select-none">
          <span>Less</span>
          <div className="h-3 w-3 bg-muted/40 border border-border/60" />
          <div className="h-3 w-3 bg-primary/30 border border-primary/40" />
          <div className="h-3 w-3 bg-primary/60 border border-primary/70" />
          <div className="h-3 w-3 bg-primary border border-primary-hover" />
          <span>More</span>
        </div>
      </div>

      {/* Synchronized Grid Container */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="min-w-[800px] w-full">
          {/* Main Grid: Left labels (w-7) + Columns matching month headers */}
          <div className="flex gap-2">
            {/* Day of Week Labels */}
            <div className="w-7 shrink-0 flex flex-col justify-between text-[9px] font-mono text-muted-foreground select-none pt-6 pb-0.5">
              {DAYS_OF_WEEK.map((dayName, idx) => (
                <div key={idx} className="h-3.5 flex items-center justify-end pr-1 leading-none">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Weeks Container */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              {/* Month Headers aligned directly to week column index */}
              <div className="flex text-[10px] font-mono text-muted-foreground select-none h-4">
                {weeks.map((week, wIdx) => {
                  const m = monthLabels.find((lbl) => lbl.weekIdx === wIdx);
                  return (
                    <div key={wIdx} className="flex-1 overflow-visible relative">
                      {m && (
                        <span className="absolute left-0 top-0 whitespace-nowrap font-medium text-foreground">
                          {m.month}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 52-Week Columns */}
              <div className="flex gap-1.5 justify-between">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                    {week.map((day, dayIdx) => {
                      const hours = (day.totalSeconds / 3600).toFixed(1);
                      return (
                        <div
                          key={day.date}
                          className={`w-full aspect-square max-w-[16px] min-w-[8px] ${getColorLevel(day.count)} transition-all hover:scale-125 cursor-pointer relative group`}
                        >
                          <div className={getTooltipClass(wIdx, dayIdx)}>
                            <div className="font-bold border-b border-border pb-1 mb-1">{day.date}</div>
                            <div className="text-foreground">{day.count} {day.count === 1 ? "run" : "runs"} ({hours} hrs)</div>
                            {day.gpuSeconds > 0 && (
                              <div className="text-primary text-[10px] font-semibold">
                                GPU: {(day.gpuSeconds / 3600).toFixed(1)}h
                              </div>
                            )}
                            {day.tpuSeconds > 0 && (
                              <div className="text-amber-500 text-[10px] font-semibold">
                                TPU: {(day.tpuSeconds / 3600).toFixed(1)}h
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
