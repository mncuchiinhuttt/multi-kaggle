import React, { useState } from "react";
import { Play, Wifi } from "lucide-react";
import type { Account } from "./AccountsTab";
import { AcceleratorSelector } from "./AcceleratorSelector";
import { CustomSelect } from "./CustomSelect";
import { DispatchDropzone } from "./DispatchDropzone";
import { StrategySelector } from "./StrategySelector";

interface DispatchTabProps {
  accounts: Account[];
  onDispatched: () => void;
}

export const DispatchTab: React.FC<DispatchTabProps> = ({ accounts, onDispatched }) => {
  const [title, setTitle] = useState("");
  const [strategy, setStrategy] = useState<"max_quota" | "round_robin" | "manual">("max_quota");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [accelerator, setAccelerator] = useState<"gpu" | "tpu" | "cpu">("gpu");
  const [enableInternet, setEnableInternet] = useState(true);
  const [notebookContent, setNotebookContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => setNotebookContent((event.target?.result as string) || "");
    reader.readAsText(file);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notebookContent) {
      setStatusMsg({ ok: false, text: "Please upload a notebook (.ipynb) or Python script (.py)." });
      return;
    }
    if (strategy === "manual" && !targetAccountId) {
      setStatusMsg({ ok: false, text: "Please select a target account for manual routing." });
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/jobs/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notebookContent,
          kernelType: fileName.endsWith(".py") ? "script" : "notebook",
          strategy,
          targetAccountId: strategy === "manual" ? targetAccountId : undefined,
          isGpu: accelerator === "gpu",
          isTpu: accelerator === "tpu",
          enableInternet,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatusMsg({ ok: true, text: `Dispatched successfully! Job ID: ${data.data.id.slice(0, 8)}` });
        setTitle("");
        setNotebookContent("");
        setFileName("");
        onDispatched();
      } else {
        setStatusMsg({ ok: false, text: data.error || "Failed to dispatch kernel" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setStatusMsg({ ok: false, text: msg });
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.label} (@${a.username})`,
    sublabel: `${(a.gpuHoursRemaining ?? 30).toFixed(1)}h GPU, ${(a.tpuHoursRemaining ?? 20).toFixed(1)}h TPU`,
  }));

  return (
    <div className="w-full space-y-6">
      <div className="border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Dispatch Kernel Execution</h2>
            <span className="text-xs px-2 py-0.5 font-mono bg-primary/10 text-primary border border-primary/30 uppercase">
              Auto Pipeline
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Direct Kaggle REST API dispatch with session rotation, hardware allocation & anti-collision
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-6">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Accounts Available</div>
            <div className="text-sm font-semibold text-foreground font-mono">{accounts.length} Total</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Concurrency Quota</div>
            <div className="text-sm font-semibold text-emerald-500 font-mono">Max 2 / Acc</div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 text-xs font-mono border ${statusMsg.ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleDeploy} className="border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
            Kernel Title & Execution Slug
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Distributed LLM Fine-Tuning Stage 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
          />
        </div>

        <DispatchDropzone fileName={fileName} onFileSelect={handleFileUpload} />
        <StrategySelector strategy={strategy} onSelect={setStrategy} />

        {strategy === "manual" && (
          <div className="space-y-1.5 p-4 bg-muted/20 border border-border">
            <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
              Select Target Account
            </label>
            <CustomSelect
              options={accountOptions}
              value={targetAccountId}
              onChange={setTargetAccountId}
              placeholder="Select target account from pool..."
            />
          </div>
        )}

        <AcceleratorSelector accelerator={accelerator} onSelect={setAccelerator} />

        <div className="flex items-center justify-between p-3.5 border border-border bg-background select-none font-mono text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={enableInternet} onChange={(e) => setEnableInternet(e.target.checked)} className="accent-primary h-4 w-4" />
            <Wifi className="h-4 w-4 text-primary" />
            <span>ENABLE INTERNET ACCESS (Pip install & Web APIs)</span>
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground py-3 px-6 text-xs font-mono font-medium uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm"
          >
            <Play className="h-4 w-4 fill-current" />
            {loading ? "DISPATCHING KERNEL TO KAGGLE DAEMON..." : "DEPLOY KERNEL NOW"}
          </button>
        </div>
      </form>
    </div>
  );
};
