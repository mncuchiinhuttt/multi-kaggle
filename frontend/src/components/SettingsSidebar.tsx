import React from "react";
import { Bot, Activity, HelpCircle } from "lucide-react";

interface SettingsSidebarProps {
  onOpenGuide: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ onOpenGuide }) => (
  <div className="space-y-4">
    {/* Unified Telegram Bot & Commands Card with Setup Guide integrated */}
    <div className="border border-border bg-card p-6 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Telegram Bot & Commands
        </h3>
        <button
          type="button"
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold transition-colors"
          title="Open step-by-step setup guide"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Setup Guide
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="p-2.5 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/status</span> - 30h quota summary
        </div>
        <div className="p-2.5 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/jobs</span> - Active kernel sessions
        </div>
        <div className="p-2.5 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/outputs &lt;id&gt;</span> - Get artifacts
        </div>
        <div className="p-2.5 bg-muted/40 border border-border">
          <span className="font-bold text-foreground">/cancel &lt;id&gt;</span> - Abort running job
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenGuide}
        className="w-full py-2 px-3 text-xs font-bold uppercase bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/40 tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Open Bot Setup Guide
      </button>
    </div>

    {/* Local Storage Security Card */}
    <div className="border border-border bg-card p-6 space-y-2 font-mono">
      <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Activity className="h-4 w-4 text-amber-500" />
        Local Storage Security
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Bot token and all account secrets are persisted in the local SQLite engine with PBKDF2 + AES-256-GCM.
      </p>
    </div>
  </div>
);
