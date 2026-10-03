import React from "react";
import { Terminal } from "lucide-react";
import { BaseDialog } from "./BaseDialog";

interface LogViewerModalProps {
  log: string;
  onClose: () => void;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({ log, onClose }) => (
  <BaseDialog open={true} onClose={onClose} maxWidth="max-w-3xl">
    <div className="flex items-center justify-between border-b border-border pb-2">
      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
        <Terminal className="h-3.5 w-3.5 text-primary" />
        EXECUTION OUTPUT STREAM
      </h3>
      <button
        onClick={onClose}
        className="text-xs font-mono uppercase px-2 py-0.5 bg-secondary border border-border text-muted-foreground hover:text-foreground"
      >
        CLOSE [ESC]
      </button>
    </div>
    <pre className="max-h-[60vh] overflow-y-auto bg-black text-emerald-400 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-border">
      {log}
    </pre>
  </BaseDialog>
);
