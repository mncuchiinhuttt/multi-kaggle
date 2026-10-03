import React from "react";
import { Bot, Activity } from "lucide-react";

export const SettingsSidebar: React.FC = () => (
  <div className="space-y-4 font-mono text-xs">
    {/* Telegram Commands Card */}
    <div className="border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Telegram Commands
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 bg-secondary border border-border">
          Reference
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="p-2.5 bg-muted/40 border border-border flex items-center justify-between">
          <span className="font-bold text-foreground">/status</span>
          <span className="text-[11px] text-muted-foreground">30h quota summary</span>
        </div>
        <div className="p-2.5 bg-muted/40 border border-border flex items-center justify-between">
          <span className="font-bold text-foreground">/jobs</span>
          <span className="text-[11px] text-muted-foreground">Active kernel sessions</span>
        </div>
        <div className="p-2.5 bg-muted/40 border border-border flex items-center justify-between">
          <span className="font-bold text-foreground">/outputs &lt;id&gt;</span>
          <span className="text-[11px] text-muted-foreground">Get artifacts</span>
        </div>
        <div className="p-2.5 bg-muted/40 border border-border flex items-center justify-between">
          <span className="font-bold text-foreground">/cancel &lt;id&gt;</span>
          <span className="text-[11px] text-muted-foreground">Abort running job</span>
        </div>
      </div>
    </div>

    {/* Local Storage Security Card */}
    <div className="border border-border bg-card p-6 space-y-2">
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
