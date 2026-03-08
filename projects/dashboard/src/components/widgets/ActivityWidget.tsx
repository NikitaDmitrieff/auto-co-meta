"use client";

import { useState } from "react";
import state from "@/data";

type LogEntry = {
  time: string;
  tag: "INFO" | "OK" | "WARN" | "ERROR" | "AGENT";
  agent?: string;
  message: string;
};

function buildActivityLog(): LogEntry[] {
  const entries: LogEntry[] = [];

  // Build log entries from cycle history, decisions, artifacts
  for (const cycle of state.cycleHistory.slice(-10)) {
    const ts = new Date(cycle.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    entries.push({
      time: ts,
      tag: cycle.status === "completed" ? "OK" : cycle.status === "failed" ? "ERROR" : "INFO",
      message: `Cycle ${cycle.cycle} ${cycle.status} — $${cycle.cost.toFixed(2)} — ${Math.round(cycle.duration / 60)}m`,
    });
  }

  for (const d of state.decisions.slice(-8)) {
    const ts = new Date(d.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    entries.push({
      time: ts,
      tag: "AGENT",
      agent: d.agent,
      message: d.decision,
    });
  }

  for (const a of state.artifacts.slice(-6)) {
    entries.push({
      time: "--:--",
      tag: "INFO",
      message: `[${a.type}] ${a.path || a.ref} by ${a.createdBy}`,
    });
  }

  // Sort reverse chronological
  return entries.reverse();
}

const TAG_COLORS: Record<string, string> = {
  INFO: "text-blue-400",
  OK: "text-green-400",
  WARN: "text-amber-400",
  ERROR: "text-red-400",
  AGENT: "text-accent",
};

export default function ActivityWidget() {
  const [expanded, setExpanded] = useState(false);
  const log = buildActivityLog();
  const visible = expanded ? log : log.slice(0, 15);

  return (
    <div className="border border-slate-200">
      <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
          Activity
        </h3>
        <span className="text-[10px] font-mono text-slate-400">{log.length} entries</span>
      </div>
      <div className="bg-zinc-950 p-4 font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto">
        {visible.map((entry, i) => (
          <div key={i} className="flex gap-2 py-0.5">
            <span className="text-zinc-600 flex-shrink-0 w-12 hidden sm:block">{entry.time}</span>
            <span className={`flex-shrink-0 w-14 ${TAG_COLORS[entry.tag] || "text-slate-500"}`}>
              [{entry.tag}]
            </span>
            {entry.agent && (
              <span className="text-accent flex-shrink-0">
                {entry.agent.split("-").pop()}:
              </span>
            )}
            <span className="text-zinc-300 break-words">{entry.message}</span>
          </div>
        ))}
        {log.length === 0 && (
          <div className="text-zinc-600">No activity yet.</div>
        )}
      </div>
      {log.length > 15 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-[10px] font-mono text-slate-400 hover:text-slate-600 bg-zinc-950 border-t border-zinc-800 text-left"
        >
          {expanded ? "Show less" : `+ ${log.length - 15} more entries`}
        </button>
      )}
    </div>
  );
}
