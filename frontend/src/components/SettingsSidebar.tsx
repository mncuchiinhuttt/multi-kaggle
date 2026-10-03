import React from "react";
import { Bot, Activity } from "lucide-react";

export const SettingsSidebar: React.FC = () => (
  <div className="space-y-4">
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
