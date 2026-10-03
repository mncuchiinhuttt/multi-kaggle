import React from "react";
import { Cpu, Users, PlaySquare, ListOrdered, Settings, Sun, Moon } from "lucide-react";

interface AppNavbarProps {
  activeTab: "accounts" | "dispatch" | "jobs" | "settings";
  setActiveTab: (tab: "accounts" | "dispatch" | "jobs" | "settings") => void;
  accountsCount: number;
  runningJobsCount: number;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeTab,
  setActiveTab,
  accountsCount,
  runningJobsCount,
  isDark,
  setIsDark,
}) => (
  <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
    <div className="w-full px-4 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 bg-primary flex items-center justify-center font-bold text-primary-foreground select-none">
          <Cpu className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-foreground font-mono">
            MULTI-KAGGLE
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-secondary text-muted-foreground border border-border">
            v1.0.0
          </span>
        </div>
      </div>

      <nav className="flex items-center space-x-1">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
            activeTab === "accounts"
              ? "bg-secondary text-foreground border-border font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <Users className="h-3.5 w-3.5 text-primary" />
          Accounts ({accountsCount})
        </button>
        <button
          onClick={() => setActiveTab("dispatch")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
            activeTab === "dispatch"
              ? "bg-secondary text-foreground border-border font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <PlaySquare className="h-3.5 w-3.5 text-primary" />
          Dispatch
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
            activeTab === "jobs"
              ? "bg-secondary text-foreground border-border font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <ListOrdered className="h-3.5 w-3.5 text-primary" />
          Jobs{" "}
          {runningJobsCount > 0 && (
            <span className="text-[10px] px-1 bg-amber-500/20 text-amber-500 font-bold">
              {runningJobsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
            activeTab === "settings"
              ? "bg-secondary text-foreground border-border font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <Settings className="h-3.5 w-3.5 text-primary" />
          Settings
        </button>
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-1.5 border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-700" />
          )}
        </button>
      </div>
    </div>
  </header>
);
