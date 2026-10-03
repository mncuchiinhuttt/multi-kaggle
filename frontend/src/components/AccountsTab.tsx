import React, { useState } from "react";
import { AccountCard } from "./AccountCard";
import { AccountsHeader } from "./AccountsHeader";
import { AddAccountModal } from "./AddAccountModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

export interface Account {
  id: string;
  label: string;
  username: string;
  proxyUrl: string | null;
  gpuHoursRemaining: number;
  tpuHoursRemaining?: number;
  privateDatasetsUsedGb?: number;
  privateDatasetsMaxGb?: number;
  privateModelsMaxGb?: number;
  status: "active" | "invalid" | "rate_limited";
}

interface AccountsTabProps {
  accounts: Account[];
  onRefresh: () => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ accounts, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await fetch(`/api/accounts/${id}/test`, { method: "POST" });
      onRefresh();
    } finally {
      setTestingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/accounts/${deletingAccount.id}`, { method: "DELETE" });
      setDeletingAccount(null);
      onRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AccountsHeader count={accounts.length} onAdd={() => setShowModal(true)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => (
          <AccountCard
            key={acc.id}
            acc={acc}
            isTesting={testingId === acc.id}
            onTest={handleTest}
            onDelete={() => setDeletingAccount(acc)}
          />
        ))}
      </div>

      {showModal && (
        <AddAccountModal
          onClose={() => setShowModal(false)}
          onSuccess={onRefresh}
        />
      )}

      <ConfirmDeleteDialog
        open={Boolean(deletingAccount)}
        username={deletingAccount?.username}
        accountLabel={deletingAccount?.label}
        deleting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingAccount(null)}
      />
    </div>
  );
};
