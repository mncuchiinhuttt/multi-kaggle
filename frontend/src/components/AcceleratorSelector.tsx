import React from "react";
import { Cpu, Zap } from "lucide-react";

export type DetailedAccelerator = "nvidia-t4" | "nvidia-p100" | "tpu-v3-8" | "cpu";

interface AcceleratorSelectorProps {
  accelerator: DetailedAccelerator;
  onSelect: (val: DetailedAccelerator) => void;
}

export const AcceleratorSelector: React.FC<AcceleratorSelectorProps> = ({
  accelerator,
  onSelect,
}) => (
  <div className="space-y-2 font-mono">
    <div className="flex items-center justify-between">
      <label className="block text-xs font-medium text-foreground uppercase tracking-wider">
        Hardware Compute Accelerator & Environment Specs
      </label>
      <span className="text-[10px] text-muted-foreground">Kaggle Official Runtime</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 2x Nvidia T4 */}
      <div
        onClick={() => onSelect("nvidia-t4")}
        className={`p-3.5 border cursor-pointer text-xs transition-all ${
          accelerator === "nvidia-t4"
            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <Cpu className="h-4 w-4 text-primary" /> GPU 2x T4
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-primary/20 text-primary font-bold">30h/wk</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-0.5 leading-tight">
          <div>32 GB GDDR6 (16GB x 2)</div>
          <div>4 vCPUs · 30 GB RAM</div>
        </div>
      </div>

      {/* Nvidia P100 */}
      <div
        onClick={() => onSelect("nvidia-p100")}
        className={`p-3.5 border cursor-pointer text-xs transition-all ${
          accelerator === "nvidia-p100"
            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <Cpu className="h-4 w-4 text-primary" /> GPU P100
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-primary/20 text-primary font-bold">30h/wk</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-0.5 leading-tight">
          <div>16 GB HBM2 High-Bandwidth</div>
          <div>4 vCPUs · 30 GB RAM</div>
        </div>
      </div>

      {/* TPU v3-8 */}
      <div
        onClick={() => onSelect("tpu-v3-8")}
        className={`p-3.5 border cursor-pointer text-xs transition-all ${
          accelerator === "tpu-v3-8"
            ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <Zap className="h-4 w-4 text-amber-500" /> TPU v3-8
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-500 font-bold">20h/wk</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-0.5 leading-tight">
          <div>128 GB HBM (8 TPU Cores)</div>
          <div>TensorFlow & JAX XLA Native</div>
        </div>
      </div>

      {/* CPU Only */}
      <div
        onClick={() => onSelect("cpu")}
        className={`p-3.5 border cursor-pointer text-xs transition-all ${
          accelerator === "cpu"
            ? "border-foreground bg-secondary text-foreground ring-1 ring-foreground"
            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-foreground">Standard CPU</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-secondary text-foreground font-bold">Unlimited</span>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-0.5 leading-tight">
          <div>4 vCPUs · 30 GB RAM</div>
          <div>Zero GPU quota deduction</div>
        </div>
      </div>
    </div>
  </div>
);
