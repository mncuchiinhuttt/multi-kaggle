import React, { useState } from "react";
import { AccountCard } from "./AccountCard";
import { AccountsHeader } from "./AccountsHeader";
import { AddAccountModal } from "./AddAccountModal";

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
  const [testingId, setTestingId] = useState<string | null>(null);

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
        <AddAccountModal
          onClose={() => setShowModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
