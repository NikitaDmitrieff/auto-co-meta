"use client";

import { dashboardMetrics } from "@/data/mock";

export default function StatusBanner() {
  return (
    <div className="bg-zinc-900 text-white px-4 lg:px-6 py-2 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sm tracking-tight">auto-co meta</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30">
          <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
          ACTIVE
        </span>
      </div>
      <div className="flex items-center gap-6 text-slate-400">
        <span>
          Cycle <span className="text-white font-semibold">{dashboardMetrics.cycle}</span>
        </span>
        <span>
          Last: <span className="text-white">${dashboardMetrics.avgCostPerCycle.toFixed(2)}</span>
        </span>
        <span>
          Total: <span className="text-white">${dashboardMetrics.totalCost.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}
