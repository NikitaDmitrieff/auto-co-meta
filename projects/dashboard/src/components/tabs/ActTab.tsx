"use client";

import { useState } from "react";
import {
  escalations,
  chatMessages,
  AGENTS,
  AGENT_COLORS,
  type Escalation,
  type ChatMessage,
  type AgentDef,
} from "@/data/mock";

// ── Types ────────────────────────────────────────────────────────

type Frequency = "PAUSED" | "SLOW" | "NORMAL" | "FAST" | "SURGE";

const FREQUENCIES: Frequency[] = ["PAUSED", "SLOW", "NORMAL", "FAST", "SURGE"];

// ── Helpers ──────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ── Section header ───────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-4">
      {children}
    </h3>
  );
}

// ── Escalation card ──────────────────────────────────────────────

function EscalationCard({
  esc,
  resolved,
}: {
  esc: Escalation;
  resolved?: boolean;
}) {
  const color = AGENT_COLORS[esc.from] || "#64748b";

  if (resolved) {
    return (
      <div className="border border-slate-100 p-3 opacity-60">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
          <span>{esc.date}</span>
          <span>from</span>
          <span style={{ color }}>{esc.from}</span>
          <span className="ml-auto text-green-500 font-semibold">RESOLVED</span>
        </div>
        <p className="text-sm text-slate-500">{esc.question}</p>
        {esc.response && (
          <p className="text-xs text-slate-400 mt-1 italic">
            Response: {esc.response}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-orange-200 bg-orange-50/30 p-4">
      <div className="flex items-center gap-2 text-xs font-mono mb-2">
        <span className="text-slate-500">{esc.date}</span>
        <span className="text-slate-400">from</span>
        <span className="font-medium" style={{ color }}>
          {esc.from}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-2">{esc.context}</p>
      <p className="text-sm font-semibold text-slate-900 mb-2">
        {esc.question}
      </p>
      <p className="text-xs text-slate-500 italic mb-3">
        Default action: {esc.defaultAction}
      </p>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider border border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors">
          Respond
        </button>
        <button className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ── Pending escalations ──────────────────────────────────────────

function PendingEscalations() {
  const pending = escalations.filter((e) => !e.resolved);
  const resolved = escalations.filter((e) => e.resolved);

  return (
    <div>
      <SectionHeader>Pending Escalations</SectionHeader>

      {pending.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M5 13l4 4L19 7"
            />
          </svg>
          No pending escalations
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((esc) => (
            <EscalationCard key={esc.id} esc={esc} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Resolved ({resolved.length})
          </p>
          {resolved.map((esc) => (
            <EscalationCard key={esc.id} esc={esc} resolved />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Cycle controls ───────────────────────────────────────────────

function CycleControls() {
  const [frequency, setFrequency] = useState<Frequency>("NORMAL");

  return (
    <div>
      <SectionHeader>Cycle Controls</SectionHeader>

      {/* Frequency selector */}
      <div className="flex gap-0 mb-4">
        {FREQUENCIES.map((freq) => (
          <button
            key={freq}
            onClick={() => setFrequency(freq)}
            className={`flex-1 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-colors ${
              frequency === freq
                ? "bg-orange-500 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {freq}
          </button>
        ))}
      </div>

      {/* Run cycle */}
      <button className="w-full bg-orange-500 text-white font-semibold py-3 text-sm font-mono uppercase tracking-wider hover:bg-orange-600 transition-colors">
        Run Cycle
      </button>

      {/* Kill switch */}
      <button className="w-full bg-red-600 text-white font-semibold py-3 text-sm font-mono uppercase tracking-wider mt-2 hover:bg-red-700 transition-colors">
        Emergency Stop
      </button>
    </div>
  );
}

// ── Agent toggle ─────────────────────────────────────────────────

function AgentToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-8 h-4 relative shrink-0 transition-colors ${
        enabled ? "bg-orange-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 bg-white transition-all ${
          enabled ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

// ── Agent card ───────────────────────────────────────────────────

function AgentCard({
  agent,
  enabled,
  onToggle,
}: {
  agent: AgentDef;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border border-slate-200 p-3 transition-opacity ${
        enabled ? "opacity-100" : "opacity-50"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 shrink-0"
            style={{ backgroundColor: agent.color }}
          />
          <span className="font-mono text-sm text-slate-900 truncate">
            {agent.name}
          </span>
        </div>
        <AgentToggle enabled={enabled} onToggle={onToggle} />
      </div>
      <div className="ml-4">
        <span className="text-xs text-slate-500 block">{agent.role}</span>
        <span className="text-xs text-slate-400 italic block">
          {agent.expert}
        </span>
        <span className="text-xs text-slate-400 font-mono mt-1 block">
          {enabled ? "Cycle 125" : "Idle"}
        </span>
      </div>
    </div>
  );
}

// ── Agent controls ───────────────────────────────────────────────

function AgentControls() {
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.name, a.enabled]))
  );

  const toggleAgent = (name: string) => {
    setAgentStates((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const enableAll = () => {
    setAgentStates(Object.fromEntries(AGENTS.map((a) => [a.name, true])));
  };

  const disableAll = () => {
    setAgentStates(Object.fromEntries(AGENTS.map((a) => [a.name, false])));
  };

  return (
    <div>
      <SectionHeader>Agent Controls</SectionHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.name}
            agent={agent}
            enabled={agentStates[agent.name]}
            onToggle={() => toggleAgent(agent.name)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={enableAll}
          className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
        >
          Enable All
        </button>
        <button
          onClick={disableAll}
          className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
        >
          Disable All
        </button>
      </div>
    </div>
  );
}

// ── Chat message bubble ──────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.from === "human") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-orange-50 border border-orange-200 px-3 py-2">
            <p className="text-sm text-slate-800">{msg.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">
            {formatTime(msg.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  const color = msg.agent ? AGENT_COLORS[msg.agent] || "#64748b" : "#64748b";

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        {msg.agent && (
          <span
            className="inline-block text-xs font-mono font-medium px-1.5 py-0.5 mb-1"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {msg.agent}
          </span>
        )}
        <div className="border border-slate-200 px-3 py-2">
          <p className="text-sm font-mono text-slate-700">{msg.content}</p>
        </div>
        <p className="text-xs text-slate-400 mt-1">{formatTime(msg.timestamp)}</p>
      </div>
    </div>
  );
}

// ── Chat interface ───────────────────────────────────────────────

function ChatInterface() {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Talk to Your CEO
          </h3>
          <span className="w-2 h-2 bg-orange-500 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {chatMessages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to your AI CEO..."
            rows={2}
            className="flex-1 border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors font-mono placeholder:text-slate-400"
          />
          <button className="self-end px-4 py-2 bg-orange-500 text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-orange-600 transition-colors shrink-0">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ActTab ───────────────────────────────────────────────────────

export default function ActTab() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-7.5rem)]">
      {/* Left: Action center — 50% */}
      <div className="w-full lg:w-1/2 overflow-y-auto p-6 space-y-6">
        <PendingEscalations />
        <CycleControls />
        <AgentControls />
      </div>

      {/* Right: Chat — 50% */}
      <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col min-h-[300px] lg:min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
