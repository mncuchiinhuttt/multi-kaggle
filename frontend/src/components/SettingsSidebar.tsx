import React from "react";
import { Bot, Terminal } from "lucide-react";

export const SettingsSidebar: React.FC = () => (
  <div className="border border-border bg-card p-6 space-y-3 font-mono text-xs">
    <div className="flex items-center justify-between border-b border-border pb-2.5">
      <h3 className="font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        Bot Commands
      </h3>
      <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.2 bg-secondary border border-border">
        Quick Ref
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <div className="p-2 bg-muted/30 border border-border">
        <div className="font-bold text-foreground">/status</div>
        <div className="text-[10px] text-muted-foreground">30h quota summary</div>
      </div>
      <div className="p-2 bg-muted/30 border border-border">
        <div className="font-bold text-foreground">/jobs</div>
        <div className="text-[10px] text-muted-foreground">Active kernel sessions</div>
      </div>
      <div className="p-2 bg-muted/30 border border-border">
        <div className="font-bold text-foreground">/outputs &lt;id&gt;</div>
        <div className="text-[10px] text-muted-foreground">Get artifacts</div>
      </div>
      <div className="p-2 bg-muted/30 border border-border">
        <div className="font-bold text-foreground">/cancel &lt;id&gt;</div>
        <div className="text-[10px] text-muted-foreground">Abort running job</div>
      </div>
    </div>
  </div>
);
