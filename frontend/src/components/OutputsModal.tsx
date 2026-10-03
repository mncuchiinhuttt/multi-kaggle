import React from "react";
import { Download, FileText, ExternalLink } from "lucide-react";

interface OutputsModalProps {
  outputs: Array<{ name: string; url: string; size?: number }>;
  onClose: () => void;
}

export const OutputsModal: React.FC<OutputsModalProps> = ({ outputs, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4">
    <div className="w-full max-w-lg border border-border bg-card p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Download className="h-3.5 w-3.5 text-emerald-500" />
          ARTIFACT OUTPUT FILES
        </h3>
        <button
          onClick={onClose}
          className="text-xs font-mono uppercase px-2 py-0.5 bg-secondary border border-border text-muted-foreground hover:text-foreground"
        >
          CLOSE [ESC]
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
        {outputs.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 bg-secondary/40 border border-border">
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate text-foreground font-medium">{file.name}</span>
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              download={file.name}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary-hover text-primary-foreground text-[11px] uppercase font-bold transition-colors"
            >
              DOWNLOAD <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
);
