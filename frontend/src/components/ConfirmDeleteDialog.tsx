import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  accountLabel?: string;
  username?: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title = "Delete Kaggle Account",
  accountLabel,
  username,
  onConfirm,
  onClose,
  deleting = false,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-150 font-mono select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-destructive/10 border border-destructive/30 text-destructive shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              {username ? (
                <span className="font-bold text-foreground">@{username}</span>
              ) : (
                "this account"
              )}
              {accountLabel ? ` (${accountLabel})` : ""}?
            </p>
          </div>
        </div>

        <div className="p-3 bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
          This will wipe the local encrypted credentials from SQLite. Any running jobs on Kaggle will not be automatically canceled.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-destructive hover:bg-destructive/80 text-destructive-foreground transition-colors disabled:opacity-50 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};
