import React from "react";
import { Plus } from "lucide-react";

interface AccountsHeaderProps {
  count: number;
  onAdd: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ count, onAdd }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
        Kaggle Accounts
        <span className="text-xs px-2 py-0.5 font-mono bg-secondary text-muted-foreground border border-border">
          {count} total
        </span>
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        Credential pooling, proxy tunneling & weekly 30h quota orchestrator
      </p>
    </div>
    <button
      onClick={onAdd}
      className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
    >
      <Plus className="h-3.5 w-3.5" />
      Add Account
    </button>
  </div>
);
