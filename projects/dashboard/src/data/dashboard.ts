// Real data layer — imports state.json (generated at build time) and
// re-exports typed data for all dashboard components.
//
// Static config (agent colors, filter groups, agent definitions) stays here.
// All metrics, terminal entries, costs, and history come from state.json.

import stateData from "./state.json";

// ── Agent config (static) ────────────────────────────────────────────

export const AGENT_COLORS: Record<string, string> = {
  "ceo-bezos": "#f97316",
  "cto-vogels": "#3b82f6",
  "critic-munger": "#ef4444",
  "product-norman": "#8b5cf6",
  "ui-duarte": "#ec4899",
  "interaction-cooper": "#6366f1",
  "fullstack-dhh": "#22c55e",
  "qa-bach": "#f59e0b",
  "devops-hightower": "#06b6d4",
  "marketing-godin": "#7c3aed",
  "operations-pg": "#14b8a6",
  "sales-ross": "#84cc16",
  "cfo-campbell": "#10b981",
  "research-thompson": "#0ea5e9",
};

export type FilterLayer = "ALL" | "CEO" | "ENGINEERING" | "MARKETING" | "CRITIC";

export const FILTER_AGENTS: Record<FilterLayer, string[]> = {
  ALL: Object.keys(AGENT_COLORS),
  CEO: ["ceo-bezos"],
  ENGINEERING: ["cto-vogels", "fullstack-dhh", "qa-bach", "devops-hightower"],
  MARKETING: ["marketing-godin", "operations-pg", "sales-ross"],
  CRITIC: ["critic-munger"],
};

export interface AgentDef {
  name: string;
  role: string;
  expert: string;
  layer: string;
  color: string;
  enabled: boolean;
}

export const AGENTS: AgentDef[] = [
  { name: "ceo-bezos", role: "CEO", expert: "Jeff Bezos", layer: "Strategy", color: "#f97316", enabled: true },
  { name: "cto-vogels", role: "CTO", expert: "Werner Vogels", layer: "Strategy", color: "#3b82f6", enabled: true },
  { name: "critic-munger", role: "Critic", expert: "Charlie Munger", layer: "Strategy", color: "#ef4444", enabled: true },
  { name: "product-norman", role: "Product", expert: "Don Norman", layer: "Product", color: "#8b5cf6", enabled: true },
  { name: "ui-duarte", role: "UI Design", expert: "Matias Duarte", layer: "Product", color: "#ec4899", enabled: false },
  { name: "interaction-cooper", role: "Interaction", expert: "Alan Cooper", layer: "Product", color: "#6366f1", enabled: false },
  { name: "fullstack-dhh", role: "Full-Stack", expert: "DHH", layer: "Engineering", color: "#22c55e", enabled: true },
  { name: "qa-bach", role: "QA", expert: "James Bach", layer: "Engineering", color: "#f59e0b", enabled: true },
  { name: "devops-hightower", role: "DevOps", expert: "Kelsey Hightower", layer: "Engineering", color: "#06b6d4", enabled: true },
  { name: "marketing-godin", role: "Marketing", expert: "Seth Godin", layer: "Business", color: "#7c3aed", enabled: true },
  { name: "operations-pg", role: "Operations", expert: "Paul Graham", layer: "Business", color: "#14b8a6", enabled: false },
  { name: "sales-ross", role: "Sales", expert: "Aaron Ross", layer: "Business", color: "#84cc16", enabled: false },
  { name: "cfo-campbell", role: "CFO", expert: "Patrick Campbell", layer: "Business", color: "#10b981", enabled: true },
  { name: "research-thompson", role: "Research", expert: "Ben Thompson", layer: "Intelligence", color: "#0ea5e9", enabled: true },
];

// ── Types ────────────────────────────────────────────────────────────

export interface TerminalEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: "thought" | "decision" | "code" | "deploy" | "commit" | "debate" | "action" | "search";
  content: string;
  context?: {
    type: "file" | "diff" | "conversation" | "deploy-log";
    title: string;
    content: string;
  };
}

export interface DocFile {
  path: string;
  title: string;
  author: string;
  date: string;
  preview: string;
  content: string;
}

export interface Escalation {
  id: string;
  date: string;
  from: string;
  context: string;
  question: string;
  defaultAction: string;
  response?: string;
  resolved: boolean;
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  from: "agent" | "human";
  agent?: string;
  content: string;
}

export interface CycleHistoryEntry {
  cycle: number;
  date: string;
  summary: string;
  decisions: string[];
}

// ── Real data from state.json ────────────────────────────────────────

const data = stateData as Record<string, unknown>;

// Dashboard metrics (from consensus + GitHub API)
export const dashboardMetrics = {
  cycle: (data.cycle as number) || 0,
  phase: (data.phase as string) || "Unknown",
  totalCost: ((data.metrics as Record<string, unknown>)?.totalCost as number) || 0,
  avgCostPerCycle: ((data.metrics as Record<string, unknown>)?.avgCostPerCycle as number) || 0,
  projectedMonthlyCost: Math.round(
    (((data.metrics as Record<string, unknown>)?.avgCostPerCycle as number) || 0) * 4 * 30
  ),
  revenue: 0,
  users: 1,
  waitlistSignups: 2,
  githubStars: ((data.metrics as Record<string, unknown>)?.stars as number) || 0,
  githubForks: ((data.metrics as Record<string, unknown>)?.forks as number) || 0,
  githubClones14d: ((data.traffic as Record<string, unknown>)?.clones as Record<string, number>)?.unique || 0,
  githubViews14d: ((data.traffic as Record<string, unknown>)?.views as Record<string, number>)?.total || 0,
  githubViewsUnique14d: ((data.traffic as Record<string, unknown>)?.views as Record<string, number>)?.unique || 0,
  openPRs: ((data.git as Record<string, unknown>)?.openPRs as unknown[])?.length || 0,
};

// Terminal entries (synthesized from decisions + commits + artifacts)
export const terminalEntries: TerminalEntry[] = (
  (data.terminalEntries as TerminalEntry[]) || []
).map((e) => ({
  ...e,
  type: e.type || "action",
}));

// Consensus text (raw markdown)
export const consensusContent: string = (data.consensusText as string) || "";

// Cycle history (from cycle-history.jsonl — real per-cycle data)
function buildCycleHistory(): CycleHistoryEntry[] {
  const raw = (data.cycleHistory as Array<Record<string, unknown>>) || [];
  // Group by cycle, take last 10 unique cycles
  const seen = new Map<number, Record<string, unknown>>();
  for (const entry of raw) {
    const cycle = entry.cycle as number;
    seen.set(cycle, entry);
  }
  const sorted = Array.from(seen.values())
    .sort((a, b) => (b.cycle as number) - (a.cycle as number))
    .slice(0, 10);

  // Enrich with decisions for each cycle
  const decisions = (data.decisions as Array<Record<string, unknown>>) || [];

  return sorted.map((entry) => {
    const cycle = entry.cycle as number;
    const cycleDecisions = decisions
      .filter((d) => d.cycle === cycle)
      .map((d) => (d.decision as string) || "")
      .filter(Boolean)
      .slice(0, 3);

    return {
      cycle,
      date: entry.timestamp
        ? new Date(entry.timestamp as string).toISOString().split("T")[0]
        : "",
      summary: `Cycle ${cycle} — ${entry.status === "ok" || entry.status === "success" ? "completed" : (entry.status as string)} (${((entry.duration as number) / 60).toFixed(0)}m, $${((entry.cost as number) || 0).toFixed(2)})`,
      decisions: cycleDecisions.length > 0
        ? cycleDecisions
        : [`Cost: $${((entry.cost as number) || 0).toFixed(2)}`, `Duration: ${((entry.duration as number) / 60).toFixed(0)}m`],
    };
  });
}

export const cycleHistory: CycleHistoryEntry[] = buildCycleHistory();

// Escalations (from memories/)
export const escalations: Escalation[] = (
  (data.escalations as Escalation[]) || []
);

// Chat messages — keep recent escalation exchanges as chat history
export const chatMessages: ChatMessage[] = (() => {
  const msgs: ChatMessage[] = [];
  const escs = (data.escalations as Escalation[]) || [];
  let id = 1;
  for (const esc of escs) {
    msgs.push({
      id: `msg-${String(id++).padStart(3, "0")}`,
      timestamp: new Date(esc.date).toISOString(),
      from: "agent",
      agent: esc.from,
      content: esc.question,
    });
    if (esc.resolved && esc.response) {
      msgs.push({
        id: `msg-${String(id++).padStart(3, "0")}`,
        timestamp: new Date(esc.date).toISOString(),
        from: "human",
        content: esc.response,
      });
    }
  }
  return msgs;
})();

// Cost per cycle (from cycleHistory — last 15 cycles)
export const costPerCycle: Array<{ cycle: number; cost: number }> = (() => {
  const raw = (data.cycleHistory as Array<Record<string, unknown>>) || [];
  const seen = new Map<number, number>();
  for (const entry of raw) {
    const cycle = entry.cycle as number;
    const cost = entry.cost as number;
    if (cost > 0) seen.set(cycle, cost);
  }
  return Array.from(seen.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(-15)
    .map(([cycle, cost]) => ({ cycle, cost }));
})();

// Cumulative cost (from cycleHistory)
export const cumulativeCost: Array<{ cycle: number; total: number }> = (() => {
  const raw = (data.cycleHistory as Array<Record<string, unknown>>) || [];
  const seen = new Map<number, number>();
  for (const entry of raw) {
    const cycle = entry.cycle as number;
    const totalCost = entry.totalCost as number;
    if (totalCost > 0) seen.set(cycle, Math.round(totalCost));
  }
  const sorted = Array.from(seen.entries()).sort((a, b) => a[0] - b[0]);
  // Sample evenly — every 10 cycles + last entry
  const sampled: Array<{ cycle: number; total: number }> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i % 10 === 0 || i === sorted.length - 1) {
      sampled.push({ cycle: sorted[i][0], total: sorted[i][1] });
    }
  }
  return sampled;
})();

// Cost by layer (derived from agent activity in decisions)
export const costByLayer: Array<{ layer: string; cost: number; pct: number }> = (() => {
  const layerMap: Record<string, string> = {};
  for (const agent of AGENTS) {
    layerMap[agent.name] = agent.layer;
  }

  const layerCounts: Record<string, number> = {};
  const decisions = (data.decisions as Array<Record<string, unknown>>) || [];
  for (const d of decisions) {
    const agent = d.agent as string;
    const layer = layerMap[agent] || "Other";
    layerCounts[layer] = (layerCounts[layer] || 0) + 1;
  }

  const total = Object.values(layerCounts).reduce((a, b) => a + b, 0) || 1;
  const totalCost = dashboardMetrics.totalCost;

  return Object.entries(layerCounts)
    .map(([layer, count]) => {
      const pct = Math.round((count / total) * 100);
      return { layer, cost: Math.round((pct / 100) * totalCost), pct };
    })
    .sort((a, b) => b.pct - a.pct);
})();

// Documents (from real doc files read at build time)
export const documents: DocFile[] = (() => {
  const docFiles = (data.docFiles as DocFile[]) || [];
  if (docFiles.length > 0) return docFiles;

  // Fallback: consensus as a document
  return [{
    path: "memories/consensus.md",
    title: "Current Consensus",
    author: "ceo-bezos",
    date: new Date().toISOString().split("T")[0],
    preview: "Cross-cycle relay baton",
    content: (data.consensusText as string) || "No consensus data available.",
  }];
})();
