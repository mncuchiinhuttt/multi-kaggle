import React, { useEffect, useRef } from "react";

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-xl", "max-w-2xl", "max-w-3xl"
}

export const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onClose,
  children,
  maxWidth = "max-w-xl",
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[3px] select-none font-mono animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} border border-border bg-card text-card-foreground shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200`}
      >
        {children}
      </div>
    </div>
  );
};
