import React, { useState } from "react";
import { JsonDropzone } from "./JsonDropzone";

interface AddAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose, onSuccess }) => {
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [jsonLoaded, setJsonLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = (event.target?.result as string) || "";
        const parsed = JSON.parse(text) as { username?: string; key?: string };
        if (parsed.username && parsed.key) {
          setUsername(parsed.username);
          setApiKey(parsed.key);
          if (!label) setLabel(`${parsed.username}-primary`);
          setJsonLoaded(true);
          setErrorMsg(null);
        } else {
          setErrorMsg("File does not contain valid 'username' and 'key' fields.");
        }
      } catch {
        setErrorMsg("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          username,
          apiKey,
          proxyUrl: proxyUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to create account");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-lg border border-border bg-card p-6 space-y-5 shadow-2xl">
        <div className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground tracking-tight">Add Kaggle Credentials</h3>
            <span className="text-[11px] font-mono text-muted-foreground uppercase px-2 py-0.5 bg-secondary border border-border">
              AES-256-GCM
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Import downloaded <span className="font-mono text-primary font-semibold">kaggle.json</span> or enter manually
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs font-mono bg-destructive/10 text-destructive border border-destructive/30">
            {errorMsg}
          </div>
        )}

        <JsonDropzone jsonLoaded={jsonLoaded} onUpload={handleJsonUpload} />

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
              Account Label
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kaggle Farm Primary"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. dev_analyst_01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
                API Key (Token)
              </label>
              <input
                type="password"
                required
                placeholder="Kaggle API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
              Proxy URL (Optional - For Isolated IP Farming)
            </label>
            <input
              type="text"
              placeholder="http://username:password@ip:port"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border bg-secondary/50 font-mono uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary-hover font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
