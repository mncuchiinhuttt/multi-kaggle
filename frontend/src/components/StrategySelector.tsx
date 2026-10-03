import React from "react";
import { Check } from "lucide-react";

interface StrategySelectorProps {
  strategy: "max_quota" | "round_robin" | "manual";
  onSelect: (strategy: "max_quota" | "round_robin" | "manual") => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  strategy,
  onSelect,
}) => (
  <div className="space-y-3">
    <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
      Account Routing Strategy
    </label>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div
        onClick={() => onSelect("max_quota")}
        className={`p-4 border cursor-pointer transition-all ${
          strategy === "max_quota"
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border bg-background hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-foreground">MAX_QUOTA</span>
          {strategy === "max_quota" && <Check className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Dispatches to the account with the highest remaining GPU hours.
        </p>
      </div>

      <div
        onClick={() => onSelect("round_robin")}
        className={`p-4 border cursor-pointer transition-all ${
          strategy === "round_robin"
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border bg-background hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-foreground">ROUND_ROBIN</span>
          {strategy === "round_robin" && <Check className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Equally balances runs in a cyclical round-robin across all healthy accounts.
        </p>
      </div>

      <div
        onClick={() => onSelect("manual")}
        className={`p-4 border cursor-pointer transition-all ${
          strategy === "manual"
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border bg-background hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-foreground">MANUAL</span>
          {strategy === "manual" && <Check className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Select an exact Kaggle credential to run this notebook on.
        </p>
      </div>
    </div>
  </div>
);
