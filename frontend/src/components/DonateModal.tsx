import React, { useState } from "react";
import { Coffee, Copy, Check, Heart, X, QrCode } from "lucide-react";

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

const BANK_INFO = {
  accountName: "VO MINH LONG",
  accountNumber: "1038897250",
  bankName: "Vietcombank (Ben Tre Branch)",
  shortBank: "Vietcombank",
};

export const DonateModal: React.FC<DonateModalProps> = ({ open, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!open) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedField((cur) => (cur === label ? null : cur));
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-150 font-mono select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 border border-primary/30 text-primary">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Support Multi-Kaggle Project
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Buy a cup of coffee to fuel open-source compute & automation tools
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
          {/* Left QR Code */}
          <div className="sm:col-span-5 border border-border bg-secondary/30 p-4 flex flex-col items-center justify-between space-y-3">
            <div className="bg-white p-2 border border-border shadow-sm w-full flex items-center justify-center aspect-square">
              <img
                src="/bank_qr.webp"
                alt="VietQR Donate"
                className="w-full h-full max-w-[200px] aspect-square object-contain block"
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center leading-snug">
              Scan with any mobile banking app supporting VietQR & Napas247
            </p>
          </div>

          {/* Right Info */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                <span>Developer Fuel & Compute Cloud</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
                Multi-Kaggle is built as free, lightweight developer tooling. Every donation directly supports maintaining infrastructure, test environments, and new features. Thank you!
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {/* Account Number */}
              <div className="p-2.5 bg-background border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Account Number
                  </span>
                  <span className="font-bold text-sm text-foreground tracking-wider">
                    {BANK_INFO.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_INFO.accountNumber, "Account Number")}
                  className="px-2.5 py-1 text-[11px] font-bold uppercase border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors flex items-center gap-1"
                >
                  {copiedField === "Account Number" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Account Holder */}
              <div className="p-2.5 bg-background border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                    Account Holder
                  </span>
                  <span className="font-bold text-xs text-foreground uppercase">
                    {BANK_INFO.accountName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BANK_INFO.accountName, "Account Holder")}
                  className="px-2.5 py-1 text-[11px] font-bold uppercase border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors flex items-center gap-1"
                >
                  {copiedField === "Account Holder" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              {/* Bank Name */}
              <div className="p-2.5 bg-background border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                  Bank
                </span>
                <span className="font-bold text-xs text-foreground">
                  {BANK_INFO.bankName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Thank you for fueling open-source research!</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs uppercase bg-secondary hover:bg-secondary/80 text-foreground border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
