"use client";

import { useState } from "react";
import state from "@/data";

const FREQUENCIES = ["PAUSED", "SLOW", "NORMAL", "FAST", "SURGE"] as const;

export default function CycleStatusWidget() {
  const [frequency, setFrequency] = useState<string>("NORMAL");
  const { cycle, health, metrics } = state;
  const lastCycle = health.loopHealth.lastCycle;
  const lastCost = lastCycle?.cost ?? metrics.avgCostPerCycle;
  const lastStatus = lastCycle?.status ?? "completed";

  return (
    <div className="border border-slate-200">
      <div className="px-4 py-2.5 border-b border-slate-200">
        <h3 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
          Cycle Status
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Current cycle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">#{cycle}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">current cycle</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-slate-900">${lastCost.toFixed(2)}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">last cycle cost</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 ${lastStatus === "completed" ? "bg-green-500" : lastStatus === "failed" ? "bg-red-500" : "bg-amber-500"}`} />
          <span className="text-sm text-slate-600">{lastStatus}</span>
          {lastCycle && (
            <span className="text-[10px] font-mono text-slate-400 ml-auto">
              {Math.round((lastCycle.duration || 0) / 60)}m duration
            </span>
          )}
        </div>

        {/* Frequency control */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-2">
            Cycle Frequency
          </div>
          <div className="flex flex-wrap sm:flex-nowrap border border-slate-200">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={`flex-1 min-w-[56px] py-1.5 text-[10px] font-mono font-bold uppercase tracking-wide transition-colors ${
                  frequency === f
                    ? "bg-accent text-white"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Run cycle button */}
        <button className="w-full py-2.5 bg-accent text-white text-sm font-bold font-mono uppercase tracking-wide hover:bg-accent-dark transition-colors">
          Run Cycle
        </button>
      </div>
    </div>
  );
}
