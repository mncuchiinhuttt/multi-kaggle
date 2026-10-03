import React from "react";
import { Terminal, CheckCircle2, RefreshCw, LogIn, AlertCircle } from "lucide-react";

interface CliAuthSectionProps {
  cliStatus: {
    cliInstalled: boolean;
    hasLocalCredentials: boolean;
    detectedUsername: string | null;
    credentialSource: string | null;
  } | null;
  importing: boolean;
  onImport: () => void;
  onRefreshStatus: () => void;
}

export const CliAuthSection: React.FC<CliAuthSectionProps> = ({
  cliStatus,
  importing,
  onImport,
  onRefreshStatus,
}) => {
  if (!cliStatus?.cliInstalled) {
    return (
      <div className="p-4 border border-border bg-muted/20 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-muted-foreground font-bold">
          <Terminal className="h-4 w-4" />
          KAGGLE CLI NOT DETECTED
        </div>
        <p className="text-[11px] text-muted-foreground">
          Install official CLI (<code className="text-primary font-bold">pip install kaggle</code>) to enable 1-click OAuth terminal login.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border bg-card space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          Kaggle CLI OAuth Bridge
        </span>
        <button
          type="button"
          onClick={onRefreshStatus}
          className="text-[10px] uppercase text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Check CLI
        </button>
      </div>

      {cliStatus.hasLocalCredentials ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Active Session Detected: @{cliStatus.detectedUsername}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Source: <span className="font-semibold text-foreground">{cliStatus.credentialSource}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onImport}
            disabled={importing}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            <LogIn className="h-3.5 w-3.5" />
            {importing ? "Importing..." : "Import & Reset CLI"}
          </button>
        </div>
      ) : (
        <div className="space-y-2 text-xs">
          <p className="text-muted-foreground text-[11px]">
            To authenticate an account with official Kaggle OAuth:
          </p>
          <div className="p-2.5 bg-black text-emerald-400 border border-border text-[11px] select-all">
            $ kaggle auth login
          </div>
          <p className="text-[10px] text-muted-foreground">
            Complete the browser sign-in, then click <span className="text-primary font-bold">Check CLI</span> to import credentials. App will auto-wipe local cache so you can log in to your next account.
          </p>
        </div>
      )}
    </div>
  );
};
