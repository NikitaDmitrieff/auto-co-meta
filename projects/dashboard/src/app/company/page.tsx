"use client";

import { useState } from "react";
import StatusBanner from "@/components/StatusBanner";
import LiveTab from "@/components/tabs/LiveTab";
import ObserveTab from "@/components/tabs/ObserveTab";
import ActTab from "@/components/tabs/ActTab";

type Tab = "LIVE" | "OBSERVE" | "ACT";

const TABS: Tab[] = ["LIVE", "OBSERVE", "ACT"];

export default function CompanyDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("LIVE");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Status banner — always visible */}
      <StatusBanner />

      {/* Tab navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-mono uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? "text-orange-500 border-b-2 border-orange-500 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "LIVE" && <LiveTab />}
      {activeTab === "OBSERVE" && <ObserveTab />}
      {activeTab === "ACT" && <ActTab />}
    </div>
  );
}
