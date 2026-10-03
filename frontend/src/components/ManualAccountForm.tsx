import React from "react";
import { JsonDropzone } from "./JsonDropzone";

interface ManualAccountFormProps {
  label: string;
  setLabel: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  apiKey: string;
  setApiKey: (val: string) => void;
  proxyUrl: string;
  setProxyUrl: (val: string) => void;
  jsonLoaded: boolean;
  onJsonUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}

export const ManualAccountForm: React.FC<ManualAccountFormProps> = ({
  label,
  setLabel,
  username,
  setUsername,
  apiKey,
  setApiKey,
  proxyUrl,
  setProxyUrl,
  jsonLoaded,
  onJsonUpload,
  onSubmit,
  onCancel,
  submitting,
}) => (
  <div className="space-y-4">
    <JsonDropzone jsonLoaded={jsonLoaded} onUpload={onJsonUpload} />
    <form onSubmit={onSubmit} className="space-y-3 font-mono">
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

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
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
);
