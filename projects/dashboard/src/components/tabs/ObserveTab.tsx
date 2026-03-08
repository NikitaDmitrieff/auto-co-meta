"use client";

import { useState } from "react";
import {
  documents,
  consensusContent,
  cycleHistory,
  escalations,
  dashboardMetrics,
  costPerCycle,
  cumulativeCost,
  costByLayer,
  AGENT_COLORS,
  type DocFile,
} from "@/data/mock";

// ── Layer colors for cost breakdown ──────────────────────────────
const LAYER_COLORS: Record<string, string> = {
  Engineering: "#22c55e",
  Strategy: "#f97316",
  Business: "#8b5cf6",
  Product: "#3b82f6",
  Intelligence: "#0ea5e9",
};

// ── Section header ───────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 pb-2 mb-4">
      <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-500">
        {children}
      </h2>
    </div>
  );
}

// ── 1. Global Metrics ────────────────────────────────────────────
function MetricsGrid() {
  const metrics: { label: string; value: string }[] = [
    { label: "Cycle Count", value: String(dashboardMetrics.cycle) },
    { label: "Total Cost", value: `$${dashboardMetrics.totalCost.toFixed(2)}` },
    { label: "Avg Cost/Cycle", value: `$${dashboardMetrics.avgCostPerCycle.toFixed(2)}` },
    { label: "Projected Monthly", value: `$${dashboardMetrics.projectedMonthlyCost}` },
    { label: "GitHub Stars", value: String(dashboardMetrics.githubStars) },
    { label: "GitHub Forks", value: String(dashboardMetrics.githubForks) },
    { label: "GitHub Clones (14d)", value: String(dashboardMetrics.githubClones14d) },
    { label: "Waitlist Signups", value: String(dashboardMetrics.waitlistSignups) },
    { label: "Revenue", value: `$${dashboardMetrics.revenue}` },
    { label: "Open PRs", value: String(dashboardMetrics.openPRs) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
      {metrics.map((m) => (
        <div key={m.label} className="border border-slate-200 p-4">
          <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-1">
            {m.label}
          </div>
          <div className="text-2xl font-semibold text-slate-900">{m.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── 2. Document Browser ──────────────────────────────────────────
function DocumentBrowser() {
  const [selected, setSelected] = useState<DocFile | null>(null);

  return (
    <div className="flex flex-col md:flex-row border border-slate-200 min-h-[400px]">
      {/* File tree */}
      <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 overflow-x-auto md:overflow-x-visible">
        <div className="flex md:flex-col">
          {documents.map((doc) => {
            const isSelected = selected?.path === doc.path;
            const agentColor = AGENT_COLORS[doc.author] || "#64748b";

            return (
              <button
                key={doc.path}
                onClick={() => setSelected(doc)}
                className={`text-left px-3 py-3 border-b md:border-b border-slate-100 last:border-b-0 flex-shrink-0 w-48 md:w-full transition-colors ${
                  isSelected
                    ? "bg-slate-100 border-l-2 border-l-orange-500"
                    : "hover:bg-slate-50 border-l-2 border-l-transparent"
                }`}
              >
                <div className="text-sm text-slate-900 truncate">{doc.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: agentColor }}>
                    {doc.author}
                  </span>
                  <span className="text-xs text-slate-400">{doc.date}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{selected.title}</h3>
            <div className="flex items-center gap-3 mt-1 mb-4">
              <span
                className="text-xs font-mono"
                style={{ color: AGENT_COLORS[selected.author] || "#64748b" }}
              >
                {selected.author}
              </span>
              <span className="text-xs text-slate-400">{selected.date}</span>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {selected.content}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            Select a document to view
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Memory Section ────────────────────────────────────────────
function MemorySection() {
  return (
    <div className="space-y-6">
      {/* Consensus */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-2">
          consensus.md
        </div>
        <div className="border border-slate-200 p-4 bg-slate-50 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {consensusContent}
        </div>
      </div>

      {/* Cycle History Timeline */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
          Recent Cycles
        </div>
        <div className="space-y-4">
          {cycleHistory.slice(0, 5).map((entry) => (
            <div key={entry.cycle} className="border-l-2 border-orange-500 pl-4">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-bold text-slate-900">
                  Cycle {entry.cycle}
                </span>
                <span className="text-xs text-slate-400">{entry.date}</span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{entry.summary}</p>
              <ul className="mt-1 space-y-0.5">
                {entry.decisions.map((d, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-slate-300 mt-0.5">-</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation History */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
          Escalation History
        </div>
        <div className="space-y-3">
          {escalations.map((esc) => (
            <div key={esc.id} className="border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{esc.date}</span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: AGENT_COLORS[esc.from] || "#64748b" }}
                  >
                    {esc.from}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wide ${
                    esc.resolved
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {esc.resolved ? "Resolved" : "Pending"}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-1">{esc.question}</p>
              {esc.response && (
                <p className="text-xs text-slate-500 mt-1 pl-3 border-l-2 border-slate-200">
                  {esc.response}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 4. Cost Breakdown ────────────────────────────────────────────
function CostBreakdown() {
  const maxCost = Math.max(...costPerCycle.map((c) => c.cost));

  return (
    <div className="space-y-6">
      {/* Per-cycle cost bars */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
          Cost per Cycle
        </div>
        <div className="space-y-1.5">
          {costPerCycle.map((entry) => (
            <div key={entry.cycle} className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 w-8 text-right flex-shrink-0">
                {entry.cycle}
              </span>
              <div className="flex-1 h-4 bg-slate-100">
                <div
                  className="h-4 bg-orange-500"
                  style={{ width: `${(entry.cost / maxCost) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-600 w-12 text-right flex-shrink-0">
                ${entry.cost.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cumulative spend */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
          Cumulative Spend
        </div>
        <div className="border border-slate-200 p-4">
          <div className="space-y-1">
            {cumulativeCost.map((entry, i) => {
              const prev = i > 0 ? cumulativeCost[i - 1].total : 0;
              const delta = entry.total - prev;
              return (
                <div key={entry.cycle} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-slate-500">Cycle {entry.cycle}</span>
                  <div className="flex items-center gap-3">
                    {delta > 0 && (
                      <span className="text-xs text-slate-400">+${delta}</span>
                    )}
                    <span className="font-mono font-semibold text-slate-900">
                      ${entry.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost by layer */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
          Cost by Layer
        </div>
        <div className="space-y-2">
          {costByLayer.map((layer) => (
            <div key={layer.layer} className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-600 w-24 flex-shrink-0">
                {layer.layer}
              </span>
              <div className="flex-1 h-4 bg-slate-100">
                <div
                  className="h-4"
                  style={{
                    width: `${layer.pct}%`,
                    backgroundColor: LAYER_COLORS[layer.layer] || "#94a3b8",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-slate-500 w-16 text-right flex-shrink-0">
                ${layer.cost} ({layer.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Projected monthly */}
      <div className="border border-slate-200 p-4 bg-slate-50">
        <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
          Projected Monthly
        </span>
        <div className="text-xl font-semibold text-slate-900 mt-1">
          ${dashboardMetrics.projectedMonthlyCost}/mo{" "}
          <span className="text-sm font-normal text-slate-400">at current rate</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function ObserveTab() {
  return (
    <div className="overflow-y-auto h-[calc(100vh-8rem)]">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
        {/* 1. Global Metrics */}
        <section>
          <SectionHeader>Global Metrics</SectionHeader>
          <MetricsGrid />
        </section>

        {/* 2. Documents */}
        <section>
          <SectionHeader>Documents</SectionHeader>
          <DocumentBrowser />
        </section>

        {/* 3. Memory */}
        <section>
          <SectionHeader>Memory</SectionHeader>
          <MemorySection />
        </section>

        {/* 4. Cost Breakdown */}
        <section>
          <SectionHeader>Cost Breakdown</SectionHeader>
          <CostBreakdown />
        </section>
      </div>
    </div>
  );
}
