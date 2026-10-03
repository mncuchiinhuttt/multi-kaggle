import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, MessageSquare, Timer, Lock, HelpCircle } from "lucide-react";
import { AppInfoSection } from "./AppInfoSection";
import { SettingsSidebar } from "./SettingsSidebar";
import { TelegramGuideModal } from "./TelegramGuideModal";

export const SettingsTab: React.FC = () => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [pollingInterval, setPollingInterval] = useState("60");
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [versionInfo, setVersionInfo] = useState<any>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          if (data.data.telegram_bot_token) setBotToken(data.data.telegram_bot_token);
          if (data.data.telegram_chat_id) setChatId(data.data.telegram_chat_id);
          if (data.data.polling_interval_seconds) setPollingInterval(data.data.polling_interval_seconds);
        }
      });

    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setVersionInfo(data.data);
      });
  }, []);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const res = await fetch("/api/version");
      const data = await res.json();
      if (data.ok) setVersionInfo(data.data);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_bot_token: botToken,
        telegram_chat_id: chatId,
        polling_interval_seconds: pollingInterval,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Daemon & Bridge Settings</h2>
            <span className="text-xs px-2 py-0.5 font-mono bg-primary/10 text-primary border border-primary/30 uppercase">System Configuration</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Manage Telegram remote daemon, authenticated access guard & background telemetry loop</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-6">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Bot Transport</div>
            <div className="text-sm font-semibold text-foreground font-mono">Long-Polling</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Version</div>
            <div className="text-sm font-semibold text-emerald-500 font-mono">v{versionInfo?.currentVersion || "1.0.0"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form + Bot Guide Integration */}
        <form onSubmit={handleSave} className="lg:col-span-2 border border-border bg-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-primary" /> Telegram Bot API Token</span>
              <button type="button" onClick={() => setShowGuide(true)} className="text-[11px] text-primary hover:underline font-mono inline-flex items-center gap-1 lowercase">
                <HelpCircle className="w-3 h-3" /> how to get token?
              </button>
            </label>
            <input type="password" placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" value={botToken} onChange={(e) => setBotToken(e.target.value)} className="w-full border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
            <p className="text-[11px] font-mono text-muted-foreground">Obtain from @BotFather. Daemon runs in direct long-polling mode without requiring webhooks or open ports.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Authorized Telegram Chat ID</span>
              <button type="button" onClick={() => setShowGuide(true)} className="text-[11px] text-primary hover:underline font-mono inline-flex items-center gap-1 lowercase">
                <HelpCircle className="w-3 h-3" /> how to find chat id?
              </button>
            </label>
            <input type="text" placeholder="e.g. 987654321" value={chatId} onChange={(e) => setChatId(e.target.value)} className="w-full border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
            <p className="text-[11px] font-mono text-muted-foreground">Enforces chat ID authorization. Any non-matching Telegram users will be rejected immediately.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-primary" /> Telemetry Poller Interval (Seconds)
            </label>
            <input type="number" min="10" max="600" value={pollingInterval} onChange={(e) => setPollingInterval(e.target.value)} className="w-full border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold uppercase text-primary hover:text-primary-hover border border-primary/30 hover:border-primary/60 bg-primary/5 transition-colors self-start sm:self-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Open Bot Setup Guide
            </button>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  <CheckCircle2 className="h-4 w-4" /> SAVED
                </span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 text-xs font-mono font-medium uppercase tracking-wider transition-colors shadow-sm"
              >
                <Send className="h-3.5 w-3.5" /> Save Configuration
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: System Info + Telegram Commands Reference */}
        <div className="space-y-4">
          <AppInfoSection versionInfo={versionInfo} checkingUpdate={checkingUpdate} onCheckUpdate={handleCheckUpdate} />
          <SettingsSidebar />
        </div>
      </div>

      <TelegramGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};
