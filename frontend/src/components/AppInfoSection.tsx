import React, { useState } from "react";
import { Info, RefreshCw, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

interface AppInfoSectionProps {
  versionInfo: {
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    releaseUrl?: string;
    releaseNotes?: string;
  } | null;
  checkingUpdate: boolean;
  onCheckUpdate: () => void;
}

export const AppInfoSection: React.FC<AppInfoSectionProps> = ({
  versionInfo,
  checkingUpdate,
  onCheckUpdate,
}) => (
  <div className="border border-border bg-card p-6 space-y-4">
    <div className="flex items-center justify-between border-b border-border pb-3">
      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        System & Release Information
      </h3>
      <button
        type="button"
        onClick={onCheckUpdate}
        disabled={checkingUpdate}
        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase px-2.5 py-1 bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${checkingUpdate ? "animate-spin text-primary" : ""}`} />
        Check Updates
      </button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
      <div className="p-3 bg-muted/30 border border-border">
        <div className="text-[10px] text-muted-foreground uppercase">Installed Version</div>
        <div className="font-bold text-foreground mt-0.5">
          v{versionInfo?.currentVersion || "1.0.0"}
        </div>
      </div>

      <div className="p-3 bg-muted/30 border border-border">
        <div className="text-[10px] text-muted-foreground uppercase">Latest Release</div>
        <div className="font-bold text-foreground mt-0.5">
          v{versionInfo?.latestVersion || "1.0.0"}
        </div>
      </div>

      <div className="p-3 bg-muted/30 border border-border col-span-2 sm:col-span-1">
        <div className="text-[10px] text-muted-foreground uppercase">Update Channel</div>
        <div className="flex items-center gap-1.5 mt-0.5 font-bold">
          {versionInfo?.hasUpdate ? (
            <span className="text-amber-500 flex items-center gap-1 text-[11px]">
              <AlertCircle className="h-3.5 w-3.5" /> UPDATE AVAILABLE
            </span>
          ) : (
            <span className="text-emerald-500 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" /> UP TO DATE
            </span>
          )}
        </div>
      </div>
    </div>

    {versionInfo?.hasUpdate && versionInfo.releaseUrl && (
      <div className="p-3 bg-primary/10 border border-primary/30 flex items-center justify-between text-xs font-mono">
        <span className="text-primary font-medium">
          New version v{versionInfo.latestVersion} released!
        </span>
        <a
          href={versionInfo.releaseUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
        >
          View Release <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    )}
  </div>
);
