// Mock data for the Three Spaces dashboard
// Frontend shell only — no backend yet

// ── Agent definitions ──────────────────────────────────────────────

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

// ── Terminal entries ───────────────────────────────────────────────

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

export const terminalEntries: TerminalEntry[] = [
  {
    id: "t-001",
    timestamp: "2026-03-07T14:00:02Z",
    agent: "ceo-bezos",
    type: "thought",
    content: "Reading consensus... Cycle 126 objective: rebuild dashboard with Three Spaces architecture per human directive.",
  },
  {
    id: "t-002",
    timestamp: "2026-03-07T14:00:08Z",
    agent: "ceo-bezos",
    type: "decision",
    content: "Human directive received: complete dashboard redesign into LIVE | OBSERVE | ACT tabs. This replaces all previous widget layouts. Assembling engineering + product team.",
  },
  {
    id: "t-003",
    timestamp: "2026-03-07T14:00:15Z",
    agent: "ceo-bezos",
    type: "action",
    content: "Forming team: fullstack-dhh (lead), cto-vogels (architecture review), qa-bach (quality gate), critic-munger (pre-mortem), devops-hightower (deploy).",
  },
  {
    id: "t-004",
    timestamp: "2026-03-07T14:00:30Z",
    agent: "critic-munger",
    type: "debate",
    content: "Before we rebuild — what's the risk? We're throwing away working code. The old dashboard was functional. Are we sure the Three Spaces model is better, or is this scope creep?",
    context: {
      type: "conversation",
      title: "Pre-mortem: Dashboard Rebuild",
      content: "critic-munger: The old dashboard had 8 widgets and worked. Now we're building a terminal emulator, a file browser, AND a control panel. That's 3x the surface area.\n\nceo-bezos: The human directive is clear. This isn't our call. The old layout was a prototype. Three Spaces is the product vision.\n\ncritic-munger: Agreed on execution. My concern is scope — can we ship this in one cycle? Suggest: LIVE tab first (the wow factor), then OBSERVE and ACT as fast follows.\n\nceo-bezos: Noted. But we ship all three. Frontend shell only, mock data. No backend complexity.",
    },
  },
  {
    id: "t-005",
    timestamp: "2026-03-07T14:01:00Z",
    agent: "cto-vogels",
    type: "thought",
    content: "Architecture assessment: Three tabs with client-side state. No routing changes needed — useState for active tab. Keep existing data pipeline (consensus.md → state.json). Add mock.ts for terminal/docs/chat data.",
  },
  {
    id: "t-006",
    timestamp: "2026-03-07T14:01:15Z",
    agent: "fullstack-dhh",
    type: "action",
    content: "Starting implementation. Creating component structure: StatusBanner, TabNavigation, LiveTab, ObserveTab, ActTab. Removing old widget files.",
  },
  {
    id: "t-007",
    timestamp: "2026-03-07T14:02:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Writing mock data: agent definitions, terminal entries, documents, escalation history, chat messages. 14 agents, 25 terminal entries, 8 documents.",
    context: {
      type: "file",
      title: "src/data/mock.ts",
      content: `export const AGENT_COLORS: Record<string, string> = {
  "ceo-bezos": "#f97316",
  "cto-vogels": "#3b82f6",
  "critic-munger": "#ef4444",
  "fullstack-dhh": "#22c55e",
  // ... 14 agents total
};

export const terminalEntries: TerminalEntry[] = [
  { id: "t-001", agent: "ceo-bezos", type: "thought",
    content: "Reading consensus..." },
  // ... 25 entries showing full cycle
];`,
    },
  },
  {
    id: "t-008",
    timestamp: "2026-03-07T14:03:30Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Building LIVE tab — split view layout. Left: terminal feed with dark background, agent color badges, filter tabs. Right: context panel showing details for selected entry.",
    context: {
      type: "file",
      title: "src/components/tabs/LiveTab.tsx",
      content: `<div className="flex h-[calc(100vh-8rem)]">
  {/* Terminal — 60% */}
  <div className="w-[60%] bg-zinc-950 flex flex-col">
    <FilterTabs />
    <TerminalFeed entries={filtered} />
  </div>
  {/* Context — 40% */}
  <div className="w-[40%] border-l">
    <ContextPanel entry={selected} />
  </div>
</div>`,
    },
  },
  {
    id: "t-009",
    timestamp: "2026-03-07T14:05:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Terminal feed rendering: each entry shows timestamp, agent badge with color, action icon, and content text. Auto-scrolls to bottom. Click to select and show context.",
  },
  {
    id: "t-010",
    timestamp: "2026-03-07T14:06:30Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Building OBSERVE tab — four sections stacked vertically: global metrics, document browser, memory viewer, cost breakdown.",
    context: {
      type: "file",
      title: "src/components/tabs/ObserveTab.tsx",
      content: `<div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
  <MetricsGrid />
  <DocumentBrowser />
  <MemorySection />
  <CostBreakdown />
</div>`,
    },
  },
  {
    id: "t-011",
    timestamp: "2026-03-07T14:08:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Document browser: file tree on left (clickable), rendered content on right. Shows author agent and date for each doc. 8 mock documents from docs/ directory.",
  },
  {
    id: "t-012",
    timestamp: "2026-03-07T14:10:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Building ACT tab — split view: action center (50%) with escalation inbox, cycle controls, agent toggles. Chat interface (50%) — 'Talk to your CEO'.",
    context: {
      type: "file",
      title: "src/components/tabs/ActTab.tsx",
      content: `<div className="flex h-[calc(100vh-8rem)]">
  {/* Action Center — 50% */}
  <div className="w-1/2 overflow-y-auto p-6 space-y-6">
    <EscalationInbox />
    <CycleControls />
    <AgentControls />
  </div>
  {/* Chat — 50% */}
  <div className="w-1/2 border-l flex flex-col">
    <ChatInterface />
  </div>
</div>`,
    },
  },
  {
    id: "t-013",
    timestamp: "2026-03-07T14:12:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Cycle controls: frequency selector (PAUSED | SLOW | NORMAL | FAST | SURGE), RUN CYCLE button (orange), KILL SWITCH button (red). Visual state management with useState.",
  },
  {
    id: "t-014",
    timestamp: "2026-03-07T14:14:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Agent controls: compact grid showing all 14 agents. Each shows name, role, expert, enabled/disabled toggle. Color-coded by layer. Last active cycle shown.",
  },
  {
    id: "t-015",
    timestamp: "2026-03-07T14:16:00Z",
    agent: "fullstack-dhh",
    type: "code",
    content: "Chat interface: message history with agent/human distinction. Input field at bottom. Previous exchanges from escalation history displayed as conversation.",
  },
  {
    id: "t-016",
    timestamp: "2026-03-07T14:18:00Z",
    agent: "fullstack-dhh",
    type: "action",
    content: "Wiring up company/page.tsx: StatusBanner (always visible) + tab navigation + conditional tab rendering. Default tab: LIVE.",
  },
  {
    id: "t-017",
    timestamp: "2026-03-07T14:19:00Z",
    agent: "fullstack-dhh",
    type: "action",
    content: "Removing old widget files: ActivityWidget, ChatWidget, CycleStatusWidget, TeamWidget, FinanceWidget, GitHubWidget, DocumentsWidget, TasksWidget, CompanyHeader.",
  },
  {
    id: "t-018",
    timestamp: "2026-03-07T14:20:00Z",
    agent: "qa-bach",
    type: "action",
    content: "Running build verification: `npm run build`. Checking for TypeScript errors, missing imports, and static generation.",
  },
  {
    id: "t-019",
    timestamp: "2026-03-07T14:20:30Z",
    agent: "qa-bach",
    type: "thought",
    content: "Build passed. 6/6 static pages generated. No TypeScript errors. All imports resolve correctly.",
  },
  {
    id: "t-020",
    timestamp: "2026-03-07T14:21:00Z",
    agent: "devops-hightower",
    type: "deploy",
    content: "Pushing to main for Railway auto-deploy. Dashboard at app.runautoco.com will update within 2 minutes.",
    context: {
      type: "deploy-log",
      title: "Railway Deploy — auto-co-dashboard",
      content: `[deploy] Triggered by push to main (abc1234)
[deploy] Building Next.js application...
[build]  ✓ Compiled successfully
[build]  ✓ Linting passed
[build]  ✓ Generating static pages (6/6)
[deploy] Image built: 247MB
[deploy] Health check: GET /api/health → 200 OK
[deploy] ✅ Live at https://app.runautoco.com`,
    },
  },
  {
    id: "t-021",
    timestamp: "2026-03-07T14:22:00Z",
    agent: "devops-hightower",
    type: "action",
    content: "Deploy complete. app.runautoco.com returning 200. Three Spaces dashboard is live.",
  },
  {
    id: "t-022",
    timestamp: "2026-03-07T14:23:00Z",
    agent: "marketing-godin",
    type: "thought",
    content: "The LIVE tab is the marketing moment. 'Watch your AI company think.' That's the hook. Terminal output IS the product demo. No screenshots needed — just a URL.",
  },
  {
    id: "t-023",
    timestamp: "2026-03-07T14:24:00Z",
    agent: "cfo-campbell",
    type: "thought",
    content: "Cycle 126 cost estimate: ~$1.94 (avg). Running total: ~$244. Dashboard rebuild is a one-time investment — no incremental infra cost since we're reusing the same Railway service.",
  },
  {
    id: "t-024",
    timestamp: "2026-03-07T14:25:00Z",
    agent: "ceo-bezos",
    type: "action",
    content: "Updating consensus. Cycle 126 complete: Three Spaces dashboard shipped. LIVE | OBSERVE | ACT. All old widgets removed. Frontend shell with mock data. Next: real-time data integration.",
  },
  {
    id: "t-025",
    timestamp: "2026-03-07T14:25:30Z",
    agent: "ceo-bezos",
    type: "commit",
    content: "git commit: 'cycle 126: Dashboard Three Spaces — LIVE | OBSERVE | ACT'",
    context: {
      type: "diff",
      title: "cycle 126: Dashboard Three Spaces",
      content: `+++ src/components/tabs/LiveTab.tsx     (new)
+++ src/components/tabs/ObserveTab.tsx   (new)
+++ src/components/tabs/ActTab.tsx       (new)
+++ src/components/StatusBanner.tsx      (new)
+++ src/data/mock.ts                    (new)
 M  src/app/company/page.tsx            (rewritten)
--- src/components/CompanyHeader.tsx     (deleted)
--- src/components/widgets/*.tsx         (8 files deleted)`,
    },
  },
];

// ── Documents ──────────────────────────────────────────────────────

export interface DocFile {
  path: string;
  title: string;
  author: string;
  date: string;
  preview: string;
  content: string;
}

export const documents: DocFile[] = [
  {
    path: "docs/ceo/strategic-memo-three-spaces.md",
    title: "Strategic Memo: Three Spaces Dashboard",
    author: "ceo-bezos",
    date: "2026-03-07",
    preview: "Dashboard redesign from widgets to three distinct spaces...",
    content: "# Strategic Memo: Three Spaces Dashboard\n\n## Context\nThe human directive calls for a complete dashboard redesign. The old 8-widget layout is replaced by three purpose-built spaces.\n\n## Decision\nExecute immediately. No discussion needed — the directive is specific enough to implement directly.\n\n## Architecture\n- **LIVE**: Terminal feed + context panel. The \"holy shit\" moment.\n- **OBSERVE**: Metrics, documents, memory, costs. Full transparency.\n- **ACT**: Escalations, controls, chat. The steering wheel.\n\n## Risk Assessment\ncritic-munger raised scope concerns. Mitigated by: frontend shell only, mock data, no backend complexity this cycle.",
  },
  {
    path: "docs/research/market-analysis-ai-agents.md",
    title: "Market Analysis: AI Agent Frameworks 2026",
    author: "research-thompson",
    date: "2026-03-05",
    preview: "Competitive landscape of autonomous AI agent platforms...",
    content: "# Market Analysis: AI Agent Frameworks 2026\n\n## Market Size\nThe AI agent framework market is estimated at $2.1B in 2026, growing 340% YoY.\n\n## Key Players\n- **CrewAI**: Multi-agent orchestration. $18M funding. Focus on enterprise.\n- **AutoGPT**: Consumer-facing autonomous agent. Large community, limited reliability.\n- **LangGraph**: Workflow-based agent framework by LangChain. Developer-focused.\n- **Auto-Co**: Only framework shipping as a complete autonomous company. Differentiation: not just agents, but an org chart.\n\n## Our Position\nAuto-Co occupies a unique niche: the 'AI company in a box.' No competitor offers CEO + CTO + CFO + Marketing as coordinated agents with shared memory.",
  },
  {
    path: "docs/cto/adr-001-dashboard-architecture.md",
    title: "ADR-001: Dashboard Architecture Decision",
    author: "cto-vogels",
    date: "2026-03-04",
    preview: "Architecture decision record for the dashboard technology choices...",
    content: "# ADR-001: Dashboard Architecture\n\n## Status\nAccepted\n\n## Context\nWe need a dashboard to visualize Auto-Co operations. Must be deployable on Railway, fast to build, and maintainable.\n\n## Decision\nNext.js 14 (App Router) + Tailwind CSS. Static generation with client-side interactivity. No component libraries — hand-built for full control.\n\n## Consequences\n- Fast builds, small bundle\n- Full design control (no fighting shadcn defaults)\n- More upfront CSS work, but cleaner output\n- Data pipeline: consensus.md → generate-data.mjs → state.json → components",
  },
  {
    path: "docs/marketing/positioning-v2.md",
    title: "Product Positioning v2",
    author: "marketing-godin",
    date: "2026-03-06",
    preview: "Updated positioning for auto-co as an AI company framework...",
    content: "# Product Positioning v2\n\n## One-liner\n\"Your AI company, running 24/7.\"\n\n## For whom\nDevelopers and founders who want to automate company operations — not just tasks, but entire business functions.\n\n## Key differentiator\nAuto-Co isn't an agent framework. It's a company framework. 14 specialized agents with an org chart, shared memory, and autonomous decision-making.\n\n## Proof points\n- 125+ cycles running autonomously\n- Real deployments (Railway, npm, Vercel)\n- Real code output (dashboard, landing page, CLI tool)\n- $242 total cost for a complete company operation",
  },
  {
    path: "docs/cfo/unit-economics-q1-2026.md",
    title: "Unit Economics Q1 2026",
    author: "cfo-campbell",
    date: "2026-03-06",
    preview: "Cost analysis and financial projections for auto-co...",
    content: "# Unit Economics Q1 2026\n\n## Current Costs\n- Average cost per cycle: $1.94\n- Total spent (125 cycles): $242\n- Infrastructure: ~$7/month (Railway)\n- Projected monthly (at 4 cycles/day): ~$233/month\n\n## Revenue Model\n- Open-source core (MIT): $0\n- Hosted tier pricing: $24.50 / $49 / $99 per month\n- Break-even: 10 customers on mid-tier ($49)\n\n## Path to Profitability\n1. Get 5 paying customers → $245/mo revenue\n2. Cover infra + cycle costs → need ~$240/mo\n3. Break-even at ~5 customers on $49 plan",
  },
  {
    path: "docs/critic/premortem-product-launch.md",
    title: "Pre-Mortem: Product Launch Risks",
    author: "critic-munger",
    date: "2026-03-05",
    preview: "Analysis of failure modes for the auto-co product launch...",
    content: "# Pre-Mortem: Product Launch\n\n## Scenario\nIt's June 2026. Auto-co has failed to gain traction. What went wrong?\n\n## Failure Modes\n1. **No real users** — We built for ourselves, not customers. The dashboard is impressive but nobody needs it.\n2. **Cost too high** — $1.94/cycle × 4/day = $233/mo just to run. Customers won't pay $49/mo for something that costs us $233/mo to operate.\n3. **Reliability** — Cycles fail, agents hallucinate, consensus gets corrupted. Customers lose trust.\n4. **Competition** — CrewAI ships a dashboard. Our differentiator evaporates.\n\n## Mitigations\n- Focus on use cases where autonomous operation provides clear ROI\n- Optimize cycle costs (use Haiku for routine tasks, Opus for decisions)\n- Build reliability metrics and alerting before launching paid tier",
  },
  {
    path: "docs/qa/test-strategy-dashboard.md",
    title: "Test Strategy: Dashboard",
    author: "qa-bach",
    date: "2026-03-04",
    preview: "Quality assurance approach for the dashboard project...",
    content: "# Test Strategy: Dashboard\n\n## Approach\nGiven the rapid iteration cycle, we focus on:\n1. **Build verification** — TypeScript compilation + Next.js build must pass\n2. **Visual inspection** — Manual review of responsive layouts\n3. **Health checks** — /api/health endpoint returns 200\n\n## Current Coverage\n- Build: automated (npm run build in CI)\n- Visual: manual per cycle\n- Health: automated (Railway health check)\n\n## Future\n- Playwright E2E tests for critical paths\n- Lighthouse performance budgets\n- Accessibility audit (WCAG 2.1 AA)",
  },
  {
    path: "docs/fullstack/technical-proposal-three-spaces.md",
    title: "Technical Proposal: Three Spaces Implementation",
    author: "fullstack-dhh",
    date: "2026-03-07",
    preview: "Implementation plan for the LIVE | OBSERVE | ACT dashboard...",
    content: "# Technical Proposal: Three Spaces\n\n## Architecture\n- Client-side tab state (useState) — no URL routing for tabs\n- StatusBanner always visible above tabs\n- Each tab is a self-contained component\n- Mock data in src/data/mock.ts\n\n## Components\n- StatusBanner: company name, ACTIVE badge, cycle #, cost ticker\n- LiveTab: terminal (60%) + context panel (40%) + status bar\n- ObserveTab: metrics → documents → memory → costs (scrollable)\n- ActTab: action center (50%) + chat (50%)\n\n## Design Tokens\n- White bg, orange accents, square corners (unchanged)\n- Dark bg (zinc-950) ONLY for terminal feed\n- Monospace: JetBrains Mono for data\n- Sans: Inter for labels\n\n## Data\n- Existing state.json for metrics/cycle data\n- New mock.ts for terminal entries, documents, chat, agents",
  },
];

// ── Memory / Consensus ────────────────────────────────────────────

export const consensusContent = `# Auto Company Consensus

## Last Updated
2026-03-07T14:25:00Z

## Current Phase
Building — Dashboard Three Spaces

## What We Did This Cycle
- Rebuilt dashboard from widgets to Three Spaces (LIVE | OBSERVE | ACT)
- LIVE: Terminal feed with agent color badges + context panel
- OBSERVE: Metrics, document browser, memory viewer, cost breakdown
- ACT: Escalation inbox, cycle controls, agent toggles, CEO chat
- Removed all old widget components
- Deployed to Railway at app.runautoco.com

## Next Action
Cycle 127: Real-time data integration (SWR polling for terminal + metrics)`;

export interface CycleHistoryEntry {
  cycle: number;
  date: string;
  summary: string;
  decisions: string[];
}

export const cycleHistory: CycleHistoryEntry[] = [
  {
    cycle: 126,
    date: "2026-03-07",
    summary: "Dashboard Three Spaces — complete rebuild into LIVE | OBSERVE | ACT tabs",
    decisions: ["Executed human directive for Three Spaces architecture", "Removed all old widget code", "Frontend shell with mock data"],
  },
  {
    cycle: 125,
    date: "2026-03-08",
    summary: "Dashboard Round 2 — widget reorder, persistent chat, cost transparency",
    decisions: ["Activity as full-width hero", "Chat as persistent side panel", "Documents/Tasks collapsed by default"],
  },
  {
    cycle: 124,
    date: "2026-03-07",
    summary: "Dashboard redesign v1 — new widget-based layout with 8 components",
    decisions: ["White/orange/square design system", "Railway deployment", "Static data from consensus.md"],
  },
  {
    cycle: 123,
    date: "2026-03-06",
    summary: "npm package v1.1.1 + awesome-list PR submissions",
    decisions: ["Submitted to 6 awesome-lists", "Updated CLI templates", "Blog post #4"],
  },
  {
    cycle: 122,
    date: "2026-03-06",
    summary: "Landing page launch + pricing page + waitlist",
    decisions: ["$24.50/$49/$99 pricing tiers", "Waitlist with Supabase", "Deploy to runautoco.com"],
  },
];

// ── Escalations ───────────────────────────────────────────────────

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

export const escalations: Escalation[] = [
  {
    id: "esc-003",
    date: "2026-03-08",
    from: "marketing-godin",
    context: "Blog cross-posting to dev.to. Article ready at docs/marketing/devto-120-cycles.md.",
    question: "Can you provide a dev.to API key so we can auto-publish?",
    defaultAction: "Skip dev.to and focus on other distribution channels.",
    resolved: false,
  },
  {
    id: "esc-002",
    date: "2026-03-08",
    from: "ceo-bezos",
    context: "Dashboard layout direction needed after Round 1 completion.",
    question: "What changes do you want for Dashboard Round 2?",
    defaultAction: "Continue with current widget layout.",
    response: "Complete redesign: Three Spaces — LIVE | OBSERVE | ACT. See full directive.",
    resolved: true,
  },
  {
    id: "esc-001",
    date: "2026-03-04",
    from: "cfo-campbell",
    context: "Pricing strategy finalized. Need human approval before publishing.",
    question: "Are you comfortable with $24.50/$49/$99 monthly pricing tiers?",
    defaultAction: "Publish pricing as proposed.",
    response: "Approved. Go with those tiers.",
    resolved: true,
  },
];

// ── Chat messages ─────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  timestamp: string;
  from: "agent" | "human";
  agent?: string;
  content: string;
}

export const chatMessages: ChatMessage[] = [
  {
    id: "msg-001",
    timestamp: "2026-03-04T10:00:00Z",
    from: "agent",
    agent: "cfo-campbell",
    content: "We've finalized three pricing tiers: $24.50/mo (Starter), $49/mo (Pro), $99/mo (Team). Break-even at 5 Pro customers. Want to proceed?",
  },
  {
    id: "msg-002",
    timestamp: "2026-03-04T12:30:00Z",
    from: "human",
    content: "Approved. Go with those tiers.",
  },
  {
    id: "msg-003",
    timestamp: "2026-03-06T08:00:00Z",
    from: "agent",
    agent: "ceo-bezos",
    content: "Dashboard v1 is live at app.runautoco.com. 8 widgets showing cycle data, team activity, costs, and GitHub stats. What do you think?",
  },
  {
    id: "msg-004",
    timestamp: "2026-03-06T15:00:00Z",
    from: "human",
    content: "Good start. Let's do a Round 2 — reorder widgets, make activity the hero, add persistent chat panel, show honest metrics.",
  },
  {
    id: "msg-005",
    timestamp: "2026-03-07T06:00:00Z",
    from: "agent",
    agent: "ceo-bezos",
    content: "Round 2 complete. Activity is now the hero, chat is a persistent sidebar, documents collapsed by default. Deployed to app.runautoco.com.",
  },
  {
    id: "msg-006",
    timestamp: "2026-03-08T09:00:00Z",
    from: "human",
    content: "Drop the widget approach entirely. Three spaces: LIVE (terminal feed), OBSERVE (transparency layer), ACT (controls + chat). LIVE is the default — first thing users see.",
  },
  {
    id: "msg-007",
    timestamp: "2026-03-08T09:05:00Z",
    from: "agent",
    agent: "ceo-bezos",
    content: "Understood. Assembling engineering team for complete rebuild. Three Spaces: LIVE | OBSERVE | ACT. Shipping this cycle.",
  },
  {
    id: "msg-008",
    timestamp: "2026-03-08T14:25:00Z",
    from: "agent",
    agent: "ceo-bezos",
    content: "Three Spaces dashboard is live. Terminal feed in LIVE tab, full transparency in OBSERVE, controls + chat in ACT. All old widgets removed. app.runautoco.com updated.",
  },
];

// ── Dashboard metrics (from state.json) ───────────────────────────

export const dashboardMetrics = {
  cycle: 126,
  phase: "Building",
  totalCost: 244,
  avgCostPerCycle: 1.94,
  projectedMonthlyCost: 233,
  revenue: 0,
  users: 1,
  waitlistSignups: 2,
  githubStars: 13,
  githubForks: 1,
  githubClones14d: 74,
  githubViews14d: 40,
  githubViewsUnique14d: 26,
  openPRs: 5,
  recentCommits: 12,
  deployedServices: ["app.runautoco.com", "runautoco.com"],
  infraCostMonth: 7,
};

export const costPerCycle = [
  { cycle: 115, cost: 1.82 },
  { cycle: 116, cost: 2.01 },
  { cycle: 117, cost: 1.75 },
  { cycle: 118, cost: 1.88 },
  { cycle: 119, cost: 2.15 },
  { cycle: 120, cost: 1.92 },
  { cycle: 121, cost: 1.68 },
  { cycle: 122, cost: 2.34 },
  { cycle: 123, cost: 1.55 },
  { cycle: 124, cost: 2.08 },
  { cycle: 125, cost: 1.94 },
  { cycle: 126, cost: 1.94 },
];

export const cumulativeCost = [
  { cycle: 100, total: 194 },
  { cycle: 105, total: 204 },
  { cycle: 110, total: 214 },
  { cycle: 115, total: 223 },
  { cycle: 120, total: 233 },
  { cycle: 125, total: 242 },
  { cycle: 126, total: 244 },
];

export const costByLayer = [
  { layer: "Engineering", cost: 98, pct: 40 },
  { layer: "Strategy", cost: 61, pct: 25 },
  { layer: "Business", cost: 49, pct: 20 },
  { layer: "Product", cost: 24, pct: 10 },
  { layer: "Intelligence", cost: 12, pct: 5 },
];
