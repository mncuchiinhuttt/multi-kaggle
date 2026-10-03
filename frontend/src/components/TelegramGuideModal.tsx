import React from "react";
import { Bot, HelpCircle, ExternalLink, Key, UserCheck, Send, Check } from "lucide-react";
import { BaseDialog } from "./BaseDialog";

interface TelegramGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export const TelegramGuideModal: React.FC<TelegramGuideModalProps> = ({ open, onClose }) => {
  return (
    <BaseDialog open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 border border-primary/30 text-primary">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Telegram Bot Setup Guide
            </h3>
            <p className="text-[11px] text-muted-foreground font-sans">
              Step-by-step instructions to create your bot and obtain authentication tokens
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs font-mono">
        {/* Step 1 */}
        <div className="p-3.5 border border-border bg-secondary/20 space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[11px]">1</span>
            <span>Create Bot via @BotFather</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed text-[11px]">
            Open Telegram and start a chat with the official BotFather:
          </p>
          <div className="space-y-1.5 pl-2 border-l-2 border-border text-[11px]">
            <div>1. Open <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-2.5 h-2.5" /></a></div>
            <div>2. Send command: <code className="text-foreground bg-muted px-1.5 py-0.5 font-bold">/newbot</code></div>
            <div>3. Choose a friendly name (e.g. <span className="text-primary font-semibold">My Kaggle Farm</span>)</div>
            <div>4. Choose a unique username ending in <code className="text-foreground bg-muted px-1 font-bold">bot</code> (e.g. <span className="text-primary font-semibold">my_kaggle_farm_bot</span>)</div>
            <div>5. Copy the generated <span className="text-primary font-bold">HTTP API Token</span>.</div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-3.5 border border-border bg-secondary/20 space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[11px]">2</span>
            <span>Retrieve Your Personal Chat ID</span>
          </div>
          <p className="text-muted-foreground font-sans leading-relaxed text-[11px]">
            To prevent unauthorized access, Multi-Kaggle only accepts commands from your Chat ID:
          </p>
          <div className="space-y-1.5 pl-2 border-l-2 border-border text-[11px]">
            <div>1. Open <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-0.5">@userinfobot <ExternalLink className="w-2.5 h-2.5" /></a> (or @RawDataBot)</div>
            <div>2. Click <code className="text-foreground bg-muted px-1.5 py-0.5 font-bold">START</code></div>
            <div>3. It will reply with your profile info. Copy the numeric <span className="text-primary font-bold">Id</span> (e.g. <code className="text-foreground font-bold">987654321</code>).</div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-3.5 border border-border bg-secondary/20 space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[11px]">3</span>
            <span>Save & Test Commands</span>
          </div>
          <div className="space-y-1.5 pl-2 border-l-2 border-border text-[11px] font-sans text-muted-foreground leading-relaxed">
            <div>• Paste the <span className="text-foreground font-mono font-bold">Token</span> and <span className="text-foreground font-mono font-bold">Chat ID</span> into the settings form on the left.</div>
            <div>• Click <span className="text-primary font-bold uppercase">Save Configuration</span>. The daemon auto-initializes in long-polling mode (no webhook needed).</div>
            <div>• Open your newly created bot on Telegram, send <code className="text-foreground bg-muted px-1.5 py-0.5 font-mono font-bold">/start</code> and <code className="text-foreground bg-muted px-1.5 py-0.5 font-mono font-bold">/status</code> to verify!</div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
        >
          Close Guide
        </button>
      </div>
    </BaseDialog>
  );
};
