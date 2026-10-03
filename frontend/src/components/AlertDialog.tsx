import React from "react";
import { Info, AlertCircle } from "lucide-react";
import { BaseDialog } from "./BaseDialog";

interface AlertDialogProps {
  open: boolean;
  title?: string;
  message: string;
  variant?: "info" | "error";
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title = "Notice",
  message,
  variant = "info",
  onClose,
}) => (
  <BaseDialog open={open} onClose={onClose} maxWidth="max-w-md">
    <div className="flex items-start gap-3">
      <div
        className={`p-2 border shrink-0 ${
          variant === "error"
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : "bg-primary/10 border-primary/30 text-primary"
        }`}
      >
        {variant === "error" ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <Info className="w-5 h-5" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-sans">
          {message}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-end pt-3 border-t border-border">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-primary hover:bg-primary-hover text-primary-foreground transition-colors shadow-sm"
      >
        Acknowledge
      </button>
    </div>
  </BaseDialog>
);
