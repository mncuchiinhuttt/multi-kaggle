import React from "react";
import { Cpu, Zap } from "lucide-react";

interface AcceleratorSelectorProps {
  accelerator: "gpu" | "tpu" | "cpu";
  onSelect: (val: "gpu" | "tpu" | "cpu") => void;
}

export const AcceleratorSelector: React.FC<AcceleratorSelectorProps> = ({
  accelerator,
  onSelect,
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
      Hardware Compute Accelerator
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        onClick={() => onSelect("gpu")}
        className={`p-3 border cursor-pointer font-mono text-xs transition-colors flex items-center justify-between ${
          accelerator === "gpu"
            ? "border-primary bg-primary/10 text-foreground font-bold"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" /> GPU T4 x 2
        </span>
        <span>30h / wk</span>
      </div>
      <div
        onClick={() => onSelect("tpu")}
        className={`p-3 border cursor-pointer font-mono text-xs transition-colors flex items-center justify-between ${
          accelerator === "tpu"
            ? "border-amber-500 bg-amber-500/10 text-foreground font-bold"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" /> TPU v3-8 (128GB)
        </span>
        <span>20h / wk</span>
      </div>
      <div
        onClick={() => onSelect("cpu")}
        className={`p-3 border cursor-pointer font-mono text-xs transition-colors flex items-center justify-between ${
          accelerator === "cpu"
            ? "border-border bg-secondary text-foreground font-bold"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <span>CPU Only</span>
        <span>Unlimited</span>
      </div>
    </div>
  </div>
);
