"use client";

import { useState, useRef, useEffect } from "react";
import {
  terminalEntries,
  AGENT_COLORS,
  FILTER_AGENTS,
  type FilterLayer,
  type TerminalEntry,
  dashboardMetrics,
} from "@/data/mock";

// ── Type icons ────────────────────────────────────────────────────

const TYPE_ICONS: Record<TerminalEntry["type"], string> = {
  action: "\u2192",
  decision: "\u25C6",
  code: "\u27E8/\u27E9",
  deploy: "\u2191",
  commit: "\u25CF",
  thought: "\u26A1",
  debate: "\u2194",
  search: "\uD83D\uDD0D",
};

// ── Filter tabs ───────────────────────────────────────────────────

const FILTER_LABELS: FilterLayer[] = ["ALL", "CEO", "ENGINEERING", "MARKETING", "CRITIC"];

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterLayer;
  onChange: (f: FilterLayer) => void;
}) {
  return (
    <div className="flex items-center gap-0 border-b border-zinc-800 bg-zinc-950 shrink-0">
      {FILTER_LABELS.map((label) => (
        <button
          key={label}
          onClick={() => onChange(label)}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
            active === label
              ? "text-orange-500 border-b-2 border-orange-500 bg-zinc-900"
              : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Format timestamp ──────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ── Terminal entry row ────────────────────────────────────────────

function EntryRow({
  entry,
  isSelected,
  onClick,
}: {
  entry: TerminalEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 flex items-start gap-2 font-mono text-sm transition-colors cursor-pointer border-l-2 ${
        isSelected
          ? "bg-zinc-800 border-orange-500"
          : "border-transparent hover:bg-zinc-900"
      }`}
    >
      {/* Timestamp */}
      <span className="text-slate-500 shrink-0 select-none">
        [{formatTime(entry.timestamp)}]
      </span>

      {/* Agent name */}
      <span
        className="shrink-0 font-medium min-w-[140px]"
        style={{ color: AGENT_COLORS[entry.agent] || "#94a3b8" }}
      >
        {entry.agent}
      </span>

      {/* Type icon */}
      <span className="text-slate-400 shrink-0 w-5 text-center select-none">
        {TYPE_ICONS[entry.type]}
      </span>

      {/* Content */}
      <span className="text-slate-200 break-words min-w-0">{entry.content}</span>
    </button>
  );
}

// ── Terminal feed ─────────────────────────────────────────────────

function TerminalFeed({
  entries,
  selectedId,
  onSelect,
}: {
  entries: TerminalEntry[];
  selectedId: string | null;
  onSelect: (entry: TerminalEntry) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
      {entries.map((entry) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          isSelected={selectedId === entry.id}
          onClick={() => onSelect(entry)}
        />
      ))}
    </div>
  );
}

// ── Context renderers ─────────────────────────────────────────────

function FileContext({ content }: { content: string }) {
  return (
    <pre className="bg-slate-50 border border-slate-200 p-4 font-mono text-sm text-slate-800 overflow-x-auto whitespace-pre-wrap">
      {content}
    </pre>
  );
}

function DiffContext({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <pre className="bg-slate-50 border border-slate-200 p-4 font-mono text-sm overflow-x-auto">
      {lines.map((line, i) => {
        let color = "text-slate-700";
        if (line.startsWith("+++") || line.startsWith("+")) color = "text-green-700";
        if (line.startsWith("---") || line.startsWith("-")) color = "text-red-600";
        if (line.startsWith(" M")) color = "text-amber-600";
        return (
          <div key={i} className={color}>
            {line}
          </div>
        );
      })}
    </pre>
  );
}

function ConversationContext({ content }: { content: string }) {
  const lines = content.split("\n\n");
  return (
    <div className="space-y-3">
      {lines.map((block, i) => {
        const colonIdx = block.indexOf(":");
        if (colonIdx === -1) return <p key={i} className="text-sm text-slate-600">{block}</p>;

        const agent = block.slice(0, colonIdx).trim();
        const message = block.slice(colonIdx + 1).trim();
        const color = AGENT_COLORS[agent] || "#64748b";

        return (
          <div key={i} className="flex gap-3 items-start">
            <span
              className="shrink-0 font-mono text-xs font-medium mt-0.5"
              style={{ color }}
            >
              {agent}
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
          </div>
        );
      })}
    </div>
  );
}

function DeployLogContext({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <pre className="bg-slate-50 border border-slate-200 p-4 font-mono text-sm overflow-x-auto">
      {lines.map((line, i) => {
        let color = "text-slate-600";
        if (line.includes("\u2713") || line.includes("\u2705")) color = "text-green-700";
        if (line.includes("error") || line.includes("fail")) color = "text-red-600";
        if (line.includes("[deploy]")) color = "text-cyan-700";
        if (line.includes("[build]")) color = "text-blue-700";
        return (
          <div key={i} className={color}>
            {line}
          </div>
        );
      })}
    </pre>
  );
}

// ── Context panel ─────────────────────────────────────────────────

function ContextPanel({ entry }: { entry: TerminalEntry | null }) {
  if (!entry || !entry.context) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-mono px-6 text-center">
        Click a terminal entry to view details
      </div>
    );
  }

  const { context } = entry;

  return (
    <div className="p-5 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 shrink-0"
            style={{ backgroundColor: AGENT_COLORS[entry.agent] || "#94a3b8" }}
          />
          <span
            className="font-mono text-xs font-medium"
            style={{ color: AGENT_COLORS[entry.agent] || "#64748b" }}
          >
            {entry.agent}
          </span>
          <span className="text-slate-400 text-xs font-mono">
            {formatTime(entry.timestamp)}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{context.title}</h3>
        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
          {context.type}
        </span>
      </div>

      {/* Content by type */}
      {context.type === "file" && <FileContext content={context.content} />}
      {context.type === "diff" && <DiffContext content={context.content} />}
      {context.type === "conversation" && <ConversationContext content={context.content} />}
      {context.type === "deploy-log" && <DeployLogContext content={context.content} />}
    </div>
  );
}

// ── Status bar ────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-slate-500 shrink-0">
      <div className="flex items-center gap-6">
        <span>
          Cycle{" "}
          <span className="text-slate-300">#{dashboardMetrics.cycle}</span>
        </span>
        <span>
          Duration: <span className="text-slate-300">25m 30s</span>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span>
          Cost: <span className="text-slate-300">${dashboardMetrics.avgCostPerCycle.toFixed(2)}</span>
        </span>
        <span>
          Active agents: <span className="text-slate-300">8/14</span>
        </span>
      </div>
    </div>
  );
}

// ── LiveTab ───────────────────────────────────────────────────────

export default function LiveTab() {
  const [activeFilter, setActiveFilter] = useState<FilterLayer>("ALL");
  const [selectedEntry, setSelectedEntry] = useState<TerminalEntry | null>(null);

  // Filter entries by active layer
  const allowedAgents = FILTER_AGENTS[activeFilter];
  const filteredEntries = terminalEntries.filter((e) =>
    allowedAgents.includes(e.agent)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Main split */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left: Terminal feed — 60% */}
        <div className="w-full lg:w-[60%] bg-zinc-950 flex flex-col min-h-0 lg:min-h-full order-1">
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
          <TerminalFeed
            entries={filteredEntries}
            selectedId={selectedEntry?.id ?? null}
            onSelect={setSelectedEntry}
          />
        </div>

        {/* Right: Context panel — 40% */}
        <div className="w-full lg:w-[40%] border-t lg:border-t-0 lg:border-l border-slate-200 bg-white min-h-[200px] lg:min-h-0 order-2 overflow-hidden">
          <ContextPanel entry={selectedEntry} />
        </div>
      </div>

      {/* Bottom: Status bar */}
      <StatusBar />
    </div>
  );
}
