import React from "react";
import {
  Cpu,
  Users,
  PlaySquare,
  ListOrdered,
  Settings,
  Sun,
  Moon,
  BarChart3,
  Coffee,
} from "lucide-react";

interface AppNavbarProps {
  activeTab: "accounts" | "dispatch" | "jobs" | "usage" | "settings";
  setActiveTab: (tab: "accounts" | "dispatch" | "jobs" | "usage" | "settings") => void;
  accountsCount: number;
  runningJobsCount: number;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenDonate: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeTab,
  setActiveTab,
  accountsCount,
  runningJobsCount,
  isDark,
  setIsDark,
  onOpenDonate,
}) => (
  <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-40">
    <div className="w-full px-4 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
      {/* Brand logo */}
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

      {/* Nav Tabs */}
      <nav className="flex items-center space-x-1">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
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
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
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
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
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
          onClick={() => setActiveTab("usage")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
            activeTab === "usage"
              ? "bg-secondary text-foreground border-border font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          Usage
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wide uppercase transition-colors border ${
            activeTab === "settings"
              ? "bg-secondary text-foreground border-border font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <Settings className="h-3.5 w-3.5 text-primary" />
          Settings
        </button>
      </nav>

      {/* Right Action Icons: GitHub Repo, Donate, Theme Switcher */}
      <div className="flex items-center gap-2">
        {/* GitHub Link */}
        <a
          href="https://github.com/mncuchiinhuttt/multi-kaggle"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors inline-flex items-center justify-center"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>

        {/* Donate Button */}
        <button
          type="button"
          onClick={onOpenDonate}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono font-bold uppercase transition-colors"
          title="Donate / Buy me a coffee"
        >
          <Coffee className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Donate</span>
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
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
