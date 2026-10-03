import React from "react";
import type { DayActivity } from "@/components/UsageTab";

interface HeatmapGridProps {
  days: DayActivity[];
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ days }) => {
  const getColorLevel = (count: number) => {
    if (count === 0) return "bg-muted/30 border border-border/40";
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

  return (
    <div className="border border-border bg-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Compute Activity Heatmap (Last 6 Months)
          </h3>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Daily kernel dispatches, training duration & hardware utilization
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground self-end sm:self-auto">
          <span>Less</span>
          <div className="h-3 w-3 bg-muted/30 border border-border/40" />
          <div className="h-3 w-3 bg-primary/30 border border-primary/40" />
          <div className="h-3 w-3 bg-primary/60 border border-primary/70" />
          <div className="h-3 w-3 bg-primary border border-primary-hover" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 min-w-full">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const hours = (day.totalSeconds / 3600).toFixed(1);
                return (
                  <div
                    key={day.date}
                    className={`h-3.5 w-3.5 ${getColorLevel(day.count)} transition-all hover:scale-125 cursor-pointer relative group`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap p-2 bg-popover text-popover-foreground border border-border font-mono text-[11px] shadow-xl pointer-events-none">
                      <div className="font-bold">{day.date}</div>
                      <div>{day.count} runs ({hours} hrs)</div>
                      {day.gpuSeconds > 0 && <div className="text-primary text-[10px]">GPU: {(day.gpuSeconds / 3600).toFixed(1)}h</div>}
                      {day.tpuSeconds > 0 && <div className="text-amber-500 text-[10px]">TPU: {(day.tpuSeconds / 3600).toFixed(1)}h</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
