import React, { useState } from "react";
import { Terminal, CheckCircle2, RefreshCw, LogIn, ExternalLink, Globe, Copy, Check, ArrowUpCircle } from "lucide-react";

interface CliAuthSectionProps {
  cliStatus: {
    cliInstalled: boolean;
    cliVersion?: string | null;
    latestCliVersion?: string | null;
    hasCliUpdate?: boolean;
    pipCommand?: string;
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
  const [copied, setCopied] = useState(false);
  const [updatingCli, setUpdatingCli] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const directLink = `${window.location.origin}/auth`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgradeCli = async () => {
    setUpdatingCli(true);
    setUpdateMsg(null);
    try {
      const res = await fetch("/api/accounts/cli-upgrade", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUpdateMsg("Kaggle CLI updated successfully!");
        onRefreshStatus();
      } else {
        setUpdateMsg(`Update failed: ${data.message || "Check terminal permissions"}`);
      }
    } catch {
      setUpdateMsg("Network error connecting to backend updater");
    } finally {
      setUpdatingCli(false);
    }
  };

  const handleOpenDirect = async () => {
    try {
      const res = await fetch("/api/oauth/url");
      const data = await res.json();
      if (data.ok && data.data?.authUrl) {
        window.open(data.data.authUrl, "_blank");
      } else {
        window.open("/auth", "_blank");
      }
    } catch {
      window.open("/auth", "_blank");
    }
  };

  return (
    <div className="p-4 border border-border bg-card space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
          <Globe className="h-3.5 w-3.5 text-primary" />
          Browser OAuth Flow
        </span>
        <button
          type="button"
          onClick={onRefreshStatus}
          className="text-[10px] uppercase text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Check Session
        </button>
      </div>

      {/* CLI Version & Outdated Alert Banner */}
      {cliStatus?.cliInstalled && (
        <div className="p-2.5 bg-secondary/40 border border-border text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              Kaggle CLI: <span className="font-bold text-foreground">v{cliStatus.cliVersion || "Unknown"}</span>
            </span>
            {cliStatus.hasCliUpdate ? (
              <span className="text-amber-500 font-bold flex items-center gap-1 text-[10px]">
                <ArrowUpCircle className="h-3 w-3" /> Update to v{cliStatus.latestCliVersion}
              </span>
            ) : (
              <span className="text-emerald-500 text-[10px]">Up to date</span>
            )}
          </div>

          {cliStatus.hasCliUpdate && (
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-[10px] text-muted-foreground font-sans">
                Outdated Kaggle CLI can cause OAuth browser handshake issues.
              </span>
              <button
                type="button"
                onClick={handleUpgradeCli}
                disabled={updatingCli}
                className="px-2.5 py-0.5 bg-primary hover:bg-primary-hover text-primary-foreground text-[10px] uppercase font-bold transition-colors disabled:opacity-50"
              >
                {updatingCli ? "Updating..." : "Update via Pip"}
              </button>
            </div>
          )}

          {updateMsg && (
            <div className="text-[10px] text-primary pt-0.5 font-bold">
              {updateMsg}
            </div>
          )}
        </div>
      )}

      {cliStatus?.hasLocalCredentials ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Active Session: @{cliStatus.detectedUsername}
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
            {importing ? "Importing..." : "Import & Reset"}
          </button>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground text-[11px]">
            Login via browser (opens Kaggle OAuth and redirects back to app):
          </p>

          <button
            type="button"
            onClick={handleOpenDirect}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open Kaggle Login in Browser
          </button>

          <div className="pt-2 border-t border-border space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Open in another browser / incognito window:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied Link!" : "Copy Link"}
              </button>
            </div>
            <div className="p-2 bg-muted/30 border border-border text-[11px] text-foreground select-all break-all">
              {directLink}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
