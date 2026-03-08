"use client";

import state from "@/data";

export default function CompanyHeader() {
  const { cycle, metrics, health } = state;
  const lastCycleCost = health.loopHealth.lastCycle?.cost ?? metrics.avgCostPerCycle;
  const status = health.loopHealth.lastCycle?.status ?? "completed";

  return (
    <div className="mb-6">
      {/* Status banner */}
      <div className="bg-slate-950 text-white px-4 lg:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono min-w-0">
          <span className="inline-flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">Loop running</span>
            <span className="sm:hidden">Live</span>
          </span>
          <span className="text-white/40">&middot;</span>
          <span className="flex-shrink-0">Cycle {cycle}</span>
          <span className="text-white/40 hidden sm:inline">&middot;</span>
          <span className="hidden sm:inline">${lastCycleCost.toFixed(2)} last cycle</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-wide ${
          status === "completed" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
        }`}>
          {status}
        </span>
      </div>

      {/* Company info */}
      <div className="px-4 lg:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Auto-Co Meta</h1>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">@auto-co-meta</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-green-50 text-green-600 uppercase flex-shrink-0">
            Active
          </span>
        </div>
        <a href="/" className="text-xs font-mono text-slate-400 hover:text-slate-600 transition-colors">
          &larr; Portfolio
        </a>
      </div>
    </div>
  );
}
