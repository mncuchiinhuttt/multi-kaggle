import React from "react";
import { Bot, Activity, HelpCircle } from "lucide-react";

interface SettingsSidebarProps {
  onOpenGuide: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ onOpenGuide }) => (
  <div className="space-y-4">
    {/* Setup Guide Button Card */}
    <div className="border border-primary/30 bg-primary/5 p-4 space-y-2.5 font-mono text-xs">
      <div className="flex items-center gap-2 font-bold text-foreground">
        <HelpCircle className="w-4 h-4 text-primary" />
        <span>Need Help with Setup?</span>
      </div>
      <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
        Don&apos;t have a Telegram Bot or don&apos;t know how to get your personal Chat ID? Read our 3-step walkthrough.
      </p>
      <button
        type="button"
        onClick={onOpenGuide}
        className="w-full py-2 px-3 text-xs font-bold uppercase bg-primary hover:bg-primary-hover text-primary-foreground tracking-wider transition-colors shadow-sm"
      >
        Open Bot Setup Guide
      </button>
    </div>

    <div className="border border-border bg-card p-6 space-y-4">
      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        Telegram Commands
      </h3>
      <div className="space-y-2 text-xs font-mono">
        <div className="p-2 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/status</span> - 30h quota summary
        </div>
        <div className="p-2 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/jobs</span> - Active kernel sessions
        </div>
        <div className="p-2 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/cancel &lt;id&gt;</span> - Abort running job
        </div>
      </div>
    </div>

    <div className="border border-border bg-card p-6 space-y-2">
      <div className="text-xs font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Activity className="h-4 w-4 text-amber-500" />
        Local Storage Security
      </div>
      <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
        Bot token and all account secrets are persisted in the local SQLite engine with PBKDF2 + AES-256-GCM.
      </p>
    </div>
  </div>
);
