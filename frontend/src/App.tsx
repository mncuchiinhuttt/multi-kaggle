import React, { useEffect, useState } from "react";
import { AccountsTab, type Account } from "@/components/AccountsTab";
import { AppNavbar } from "@/components/AppNavbar";
import { DispatchTab } from "@/components/DispatchTab";
import { DonateModal } from "@/components/DonateModal";
import { JobsTab, type Job } from "@/components/JobsTab";
import { KpiStrip } from "@/components/KpiStrip";
import { SettingsTab } from "@/components/SettingsTab";
import { UsageTab } from "@/components/UsageTab";

export function App() {
  const [activeTab, setActiveTab] = useState<"accounts" | "dispatch" | "jobs" | "usage" | "settings">("accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showDonate, setShowDonate] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "light" ? false : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.ok) setAccounts(data.data);
    } catch {}
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.ok) setJobs(data.data);
    } catch {}
  };

  useEffect(() => {
    fetchAccounts();
    fetchJobs();
    const interval = setInterval(() => {
      fetchJobs();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const runningJobsCount = jobs.filter((j) => j.status === "running").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-150">
      <AppNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accountsCount={accounts.length}
        runningJobsCount={runningJobsCount}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenDonate={() => setShowDonate(true)}
      />

      <KpiStrip accounts={accounts} runningJobsCount={runningJobsCount} />

      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6">
        {activeTab === "accounts" && <AccountsTab accounts={accounts} onRefresh={fetchAccounts} />}
        {activeTab === "dispatch" && (
          <DispatchTab
            accounts={accounts}
            onDispatched={() => {
              fetchJobs();
              setActiveTab("jobs");
            }}
          />
        )}
        {activeTab === "jobs" && <JobsTab jobs={jobs} onRefresh={fetchJobs} />}
        {activeTab === "usage" && <UsageTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>

      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />
    </div>
  );
}

export default App;
