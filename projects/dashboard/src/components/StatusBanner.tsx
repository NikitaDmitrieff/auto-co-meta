"use client";

import useSWR from "swr";
import { dashboardMetrics } from "@/data/dashboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StatusBanner() {
  const { data, error } = useSWR("/api/health", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const isLive = data && !error;

  return (
    <div className="bg-zinc-900 text-white px-4 lg:px-6 py-2 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sm tracking-tight">auto-co meta</span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 bg-amber-400" />
            OFFLINE
          </span>
        )}
      </div>
      <div className="flex items-center gap-6 text-slate-400">
        <span>
          Cycle <span className="text-white font-semibold">{data?.cycle ?? dashboardMetrics.cycle}</span>
        </span>
        <span>
          Last: <span className="text-white">${dashboardMetrics.avgCostPerCycle.toFixed(2)}</span>
        </span>
        <span>
          Total: <span className="text-white">${dashboardMetrics.totalCost.toFixed(2)}</span>
        </span>
        {data?.generatedAt && (
          <span className="hidden lg:inline">
            Data:{" "}
            <span className="text-white">
              {new Date(data.generatedAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
