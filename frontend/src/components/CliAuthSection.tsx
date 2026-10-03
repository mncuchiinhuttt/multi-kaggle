import React, { useState } from "react";
import { Terminal, CheckCircle2, RefreshCw, LogIn, ExternalLink } from "lucide-react";

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
  const [launching, setLaunching] = useState(false);
  const [launchMsg, setLaunchMsg] = useState<string | null>(null);

  const handleLaunchLogin = async () => {
    setLaunching(true);
    setLaunchMsg(null);
    try {
      const res = await fetch("/api/accounts/cli-login", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLaunchMsg("Browser launched! Complete sign-in on Kaggle, then click 'Import'.");
        // Start polling for credentials
        const interval = setInterval(async () => {
          const statusRes = await fetch("/api/accounts/cli-status");
          const statusData = await statusRes.json();
          if (statusData.ok && statusData.data.hasLocalCredentials) {
            onRefreshStatus();
            clearInterval(interval);
          }
        }, 2000);
        setTimeout(() => clearInterval(interval), 60000);
      } else {
        setLaunchMsg(`Error: ${data.error || "Failed to start login"}`);
      }
    } catch {
      setLaunchMsg("Failed to connect to backend");
    } finally {
      setLaunching(false);
    }
  };

  if (!cliStatus?.cliInstalled) {
    return (
      <div className="p-4 border border-border bg-muted/20 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-muted-foreground font-bold">
          <Terminal className="h-4 w-4" />
          KAGGLE CLI NOT DETECTED
        </div>
        <p className="text-[11px] text-muted-foreground">
          Install official CLI (<code className="text-primary font-bold">pip install kaggle</code>) to enable 1-click OAuth login.
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
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground text-[11px]">
            Authenticate with official Kaggle OAuth via your browser:
          </p>

          <button
            type="button"
            onClick={handleLaunchLogin}
            disabled={launching}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" />
            {launching ? "Opening Browser..." : "Launch Kaggle OAuth in Browser"}
          </button>

          {launchMsg && (
            <p className="text-[11px] text-primary font-medium animate-pulse">
              {launchMsg}
            </p>
          )}

          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
            Clicking launches <code className="text-foreground font-semibold">kaggle auth login --force</code> in the background. App will auto-detect when sign-in finishes, import your account, and clear the session.
          </p>
        </div>
      )}
    </div>
  );
};
