import React, { useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Trash2, Cpu, Globe, Zap, Database, Box, Edit3 } from "lucide-react";
import type { Account } from "./AccountsTab";

interface AccountCardProps {
  acc: Account;
  isTesting: boolean;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateUsedStorage?: (id: string, usedGb: number) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  acc,
  isTesting,
  onTest,
  onDelete,
}) => {
  const [editingStorage, setEditingStorage] = useState(false);
  const [customUsed, setCustomUsed] = useState((acc.privateDatasetsUsedGb ?? 0).toFixed(2));

  const gpuPercent = Math.min(100, Math.max(0, ((acc.gpuHoursRemaining ?? 30) / 30) * 100));
  const tpuPercent = Math.min(100, Math.max(0, ((acc.tpuHoursRemaining ?? 20) / 20) * 100));
  const usedGb = acc.privateDatasetsUsedGb ?? 0;
  const maxGb = acc.privateDatasetsMaxGb ?? 214.75;
  const datasetPercent = Math.min(100, Math.max(0, (usedGb / maxGb) * 100));

  const handleSaveStorage = async () => {
    const parsed = parseFloat(customUsed);
    if (!isNaN(parsed) && parsed >= 0) {
      await fetch(`/api/accounts/${acc.id}/storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usedGb: parsed }),
      });
      setEditingStorage(false);
      onTest(acc.id);
    }
  };

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

        {/* 4 Quota Telemetry Bars matching Kaggle Official Dashboard */}
        <div className="space-y-2.5 pt-1">
          {/* Private Datasets */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono items-center">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Database className="h-3 w-3 text-cyan-500" /> Private Datasets
              </span>
              <div className="flex items-center gap-1">
                {editingStorage ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={customUsed}
                      onChange={(e) => setCustomUsed(e.target.value)}
                      className="w-16 px-1 py-0.2 text-[11px] border border-border bg-background text-foreground font-mono"
                    />
                    <button
                      onClick={handleSaveStorage}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      SAVE
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => setEditingStorage(true)}
                    className="text-foreground font-medium text-[11px] cursor-pointer hover:text-primary transition-colors flex items-center gap-1"
                    title="Click to adjust used storage"
                  >
                    {usedGb.toFixed(2)} GB / {maxGb} GB
                    <Edit3 className="h-2.5 w-2.5 opacity-50" />
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${Math.max(usedGb > 0 ? 2 : 0, datasetPercent)}%` }}
              />
            </div>
          </div>

          {/* Private Models */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Box className="h-3 w-3 text-indigo-400" /> Private Models
              </span>
              <span className="text-foreground font-medium text-[11px]">
                0 B / {acc.privateModelsMaxGb ?? 214.75} GB
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: "0%" }} />
            </div>
          </div>

          {/* GPU Quota */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Cpu className="h-3 w-3 text-primary" /> Kaggle GPU
              </span>
              <span className="text-foreground font-medium text-[11px]">
                {(acc.gpuHoursRemaining ?? 30.0).toFixed(1)}h / 30.0 hrs
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${gpuPercent < 20 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${gpuPercent}%` }}
              />
            </div>
          </div>

          {/* TPU Quota */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Zap className="h-3 w-3 text-amber-500" /> Kaggle TPU
              </span>
              <span className="text-foreground font-medium text-[11px]">
                {(acc.tpuHoursRemaining ?? 20.0).toFixed(1)}h / 20.0 hrs
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${tpuPercent < 20 ? "bg-destructive" : "bg-amber-500"}`}
                style={{ width: `${tpuPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="px-4 py-2.5 bg-secondary/30 flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border text-[11px]">
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="truncate">{acc.proxyUrl || "Direct Connection"}</span>
        </div>
        <span className="text-emerald-500 font-bold uppercase">Encrypted</span>
      </div>

      <div className="px-4 py-2.5 bg-card flex items-center justify-between">
        <button
          onClick={() => onTest(acc.id)}
          disabled={isTesting}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isTesting ? "animate-spin text-primary" : ""}`} />
          SYNC & TEST
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
