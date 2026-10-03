import React from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Trash2, Cpu, Globe, ShieldCheck, Zap, HardDrive } from "lucide-react";
import type { Account } from "./AccountsTab";

interface AccountCardProps {
  acc: Account;
  isTesting: boolean;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  acc,
  isTesting,
  onTest,
  onDelete,
}) => {
  const gpuPercent = Math.min(100, Math.max(0, ((acc.gpuHoursRemaining ?? 30) / 30) * 100));
  const tpuPercent = Math.min(100, Math.max(0, ((acc.tpuHoursRemaining ?? 20) / 20) * 100));

  return (
    <div className="border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-foreground text-sm truncate">{acc.label}</h3>
            <p className="text-xs font-mono text-muted-foreground truncate">@{acc.username}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border ${
              acc.status === "active"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-destructive/10 text-destructive border-destructive/30"
            }`}
          >
            {acc.status === "active" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {acc.status}
          </span>
        </div>

        {/* GPU & TPU Quota Multi-Metric Bars */}
        <div className="space-y-2.5 pt-1">
          {/* GPU Metric */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Cpu className="h-3 w-3 text-primary" /> GPU QUOTA
              </span>
              <span className="text-foreground font-medium text-[11px]">
                {(acc.gpuHoursRemaining ?? 30.0).toFixed(1)}h / 30.0h
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  gpuPercent < 20 ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${gpuPercent}%` }}
              />
            </div>
          </div>

          {/* TPU Metric */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Zap className="h-3 w-3 text-amber-500" /> TPU v3-8 QUOTA
              </span>
              <span className="text-foreground font-medium text-[11px]">
                {(acc.tpuHoursRemaining ?? 20.0).toFixed(1)}h / 20.0h
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  tpuPercent < 20 ? "bg-destructive" : "bg-amber-500"
                }`}
                style={{ width: `${tpuPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meta details */}
      <div className="px-4 py-3 bg-secondary/30 space-y-1.5 text-xs font-mono text-muted-foreground border-b border-border">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <HardDrive className="h-3 w-3 text-muted-foreground" /> STORAGE DISK
          </span>
          <span className="text-foreground font-semibold">
            {acc.diskQuotaGb ?? 100} GB FREE
          </span>
        </div>
        <div className="flex items-center gap-2 truncate text-[11px]">
          <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="truncate">{acc.proxyUrl || "Direct IP (No Proxy)"}</span>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-card flex items-center justify-between">
        <button
          onClick={() => onTest(acc.id)}
          disabled={isTesting}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isTesting ? "animate-spin text-primary" : ""}`} />
          TEST AUTH
        </button>
        <button
          onClick={() => onDelete(acc.id)}
          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
          title="Delete account"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
