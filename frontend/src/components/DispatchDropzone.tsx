import React from "react";
import { UploadCloud } from "lucide-react";

interface DispatchDropzoneProps {
  fileName: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DispatchDropzone: React.FC<DispatchDropzoneProps> = ({
  fileName,
  onFileSelect,
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-mono font-medium text-foreground uppercase tracking-wider">
      Notebook Artifact (.ipynb / .py)
    </label>
    <div className="relative border-2 border-dashed border-border hover:border-primary/80 bg-muted/20 hover:bg-muted/40 p-8 text-center transition-all cursor-pointer group">
      <input
        type="file"
        accept=".ipynb,.py"
        onChange={onFileSelect}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
      />
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="p-3 bg-secondary/80 border border-border group-hover:border-primary/50 transition-colors">
          <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">
            {fileName ? (
              <span className="font-mono text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 border border-primary/30">
                {fileName}
              </span>
            ) : (
              <span>
                <span className="font-mono text-primary underline underline-offset-4">Click to browse</span> or drag and drop notebook file
              </span>
            )}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            Automated hash collision bypass watermark injected on submission
          </p>
        </div>
      </div>
    </div>
  </div>
);
