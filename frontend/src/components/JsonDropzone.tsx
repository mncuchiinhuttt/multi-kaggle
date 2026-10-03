import React from "react";
import { FileJson, CheckCircle2 } from "lucide-react";

interface JsonDropzoneProps {
  jsonLoaded: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const JsonDropzone: React.FC<JsonDropzoneProps> = ({ jsonLoaded, onUpload }) => (
  <div className="relative border-2 border-dashed border-border hover:border-primary/80 bg-muted/20 hover:bg-muted/40 p-4 text-center transition-colors cursor-pointer group">
    <input
      type="file"
      accept=".json"
      onChange={onUpload}
      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
    />
    <div className="flex items-center justify-center gap-3">
      <div className="p-2 bg-secondary border border-border group-hover:border-primary/50 transition-colors">
        {jsonLoaded ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <FileJson className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
      <div className="text-left">
        <p className="text-xs font-medium text-foreground">
          {jsonLoaded ? (
            <span className="text-emerald-500 font-mono font-bold">kaggle.json parsed & auto-filled!</span>
          ) : (
            <span>
              Drop <span className="font-mono text-primary font-semibold">kaggle.json</span> here or click to browse
            </span>
          )}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground">
          Automatically extracts username & secret API token
        </p>
      </div>
    </div>
  </div>
);
