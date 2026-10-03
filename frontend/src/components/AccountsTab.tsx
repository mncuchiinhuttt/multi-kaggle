import React, { useState } from "react";
import { AccountCard } from "./AccountCard";
import { AccountsHeader } from "./AccountsHeader";

export interface Account {
  id: string;
  label: string;
  username: string;
  proxyUrl: string | null;
  gpuHoursRemaining: number;
  status: "active" | "invalid" | "rate_limited";
}

interface AccountsTabProps {
  accounts: Account[];
  onRefresh: () => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ accounts, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (res.ok) {
      setShowModal(false);
      setLabel("");
      setUsername("");
      setApiKey("");
      setProxyUrl("");
      onRefresh();
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await fetch(`/api/accounts/${id}/test`, { method: "POST" });
      onRefresh();
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this Kaggle account?")) {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <AccountsHeader count={accounts.length} onAdd={() => setShowModal(true)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <AccountCard
            key={acc.id}
            acc={acc}
            isTesting={testingId === acc.id}
            onTest={handleTest}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Add Kaggle Credentials</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                API Token is encrypted locally with AES-256-GCM
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                  Account Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaggle Farm Primary"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground uppercase tracking-wider font-mono">
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
                <label className="block text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                  API Key (Token)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Kaggle API key from kaggle.json"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                  Proxy URL (Optional)
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border bg-secondary/50 font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary-hover font-mono uppercase"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
