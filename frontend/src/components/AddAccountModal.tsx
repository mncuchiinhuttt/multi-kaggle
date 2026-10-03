import React, { useState, useEffect } from "react";
import { CliAuthSection } from "./CliAuthSection";
import { ManualAccountForm } from "./ManualAccountForm";

interface AddAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState<"cli" | "file">("cli");
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [jsonLoaded, setJsonLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importingCli, setImportingCli] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cliStatus, setCliStatus] = useState<any>(null);

  const fetchCliStatus = () => {
    fetch("/api/accounts/cli-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setCliStatus(data.data);
      });
  };

  useEffect(() => {
    fetchCliStatus();
  }, []);

  const handleCliImport = async () => {
    setImportingCli(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/accounts/cli-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || undefined, proxyUrl: proxyUrl || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to import from CLI");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMsg(msg);
    } finally {
      setImportingCli(false);
    }
  };

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
        body: JSON.stringify({ label, username, apiKey, proxyUrl: proxyUrl.trim() || null }),
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
      <div className="w-full max-w-xl border border-border bg-card p-6 space-y-4 shadow-2xl">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">Add Kaggle Credentials</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authenticate via CLI OAuth flow or drag-and-drop kaggle.json
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground uppercase px-2 py-0.5 bg-secondary border border-border">
            AES-256-GCM
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs font-mono bg-destructive/10 text-destructive border border-destructive/30">
            {errorMsg}
          </div>
        )}

        <div className="flex border border-border bg-secondary/50 p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setTab("cli")}
            className={`flex-1 py-1.5 transition-colors uppercase font-medium ${
              tab === "cli" ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Kaggle CLI OAuth
          </button>
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`flex-1 py-1.5 transition-colors uppercase font-medium ${
              tab === "file" ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload kaggle.json / Manual
          </button>
        </div>

        {tab === "cli" ? (
          <div className="space-y-4">
            <CliAuthSection
              cliStatus={cliStatus}
              importing={importingCli}
              onImport={handleCliImport}
              onRefreshStatus={fetchCliStatus}
            />
            <div className="space-y-1 font-mono">
              <label className="block text-xs font-medium text-foreground uppercase tracking-wider">
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
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border bg-secondary/50 font-mono uppercase"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <ManualAccountForm
            label={label}
            setLabel={setLabel}
            username={username}
            setUsername={setUsername}
            apiKey={apiKey}
            setApiKey={setApiKey}
            proxyUrl={proxyUrl}
            setProxyUrl={setProxyUrl}
            jsonLoaded={jsonLoaded}
            onJsonUpload={handleJsonUpload}
            onSubmit={handleCreate}
            onCancel={onClose}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};
