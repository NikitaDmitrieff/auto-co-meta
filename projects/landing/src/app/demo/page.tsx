"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

// =================== HOOKS ===================

function useGitHubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
  }, [repo]);
  return stars;
}

function useLiveMetrics() {
  const [metrics, setMetrics] = useState<{
    pageViews: number;
    waitlistSignups: number;
    cyclesCompleted: number;
    totalCost: number;
    avgCostPerCycle: number;
  } | null>(null);
  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((d) => {
        if (d.pageViews !== undefined) setMetrics(d);
      })
      .catch(() => {});
  }, []);
  return metrics;
}

// =================== TYPES ===================

interface AgentInfo {
  initials: string;
  name: string;
  role: string;
  gradient: string;
}

// =================== AGENT DATA ===================

const AGENTS: Record<string, AgentInfo> = {
  CEO: { initials: "CEO", name: "Jeff Bezos", role: "CEO", gradient: "from-orange-600 to-red-700" },
  CTO: { initials: "CTO", name: "Werner Vogels", role: "Architecture", gradient: "from-blue-600 to-indigo-700" },
  RES: { initials: "RES", name: "Ben Thompson", role: "Research", gradient: "from-slate-400 to-slate-600" },
  ENG: { initials: "ENG", name: "DHH", role: "Engineering", gradient: "from-emerald-600 to-teal-700" },
  CRIT: { initials: "CRIT", name: "Charlie Munger", role: "Critic", gradient: "from-gray-600 to-gray-700" },
  CFO: { initials: "CFO", name: "Patrick Campbell", role: "Finance", gradient: "from-amber-500 to-orange-600" },
  MKT: { initials: "MKT", name: "Seth Godin", role: "Marketing", gradient: "from-pink-600 to-rose-700" },
  UI: { initials: "UI", name: "Matias Duarte", role: "UI Design", gradient: "from-violet-600 to-purple-700" },
  DVP: { initials: "DVP", name: "Kelsey Hightower", role: "DevOps", gradient: "from-slate-500 to-slate-700" },
  QA: { initials: "QA", name: "James Bach", role: "Quality", gradient: "from-red-600 to-rose-700" },
  IX: { initials: "IX", name: "Alan Cooper", role: "Interaction", gradient: "from-sky-500 to-blue-600" },
  OPS: { initials: "OPS", name: "Paul Graham", role: "Operations", gradient: "from-sky-600 to-cyan-700" },
  SLS: { initials: "SLS", name: "Aaron Ross", role: "Sales", gradient: "from-green-600 to-emerald-700" },
  PRD: { initials: "PRD", name: "Don Norman", role: "Product", gradient: "from-yellow-600 to-amber-700" },
};

const ALL_AGENTS = Object.values(AGENTS);

// =================== DEMO DATA ===================

const ACTIVITY_FEED = [
  { agent: AGENTS.CEO, time: "just now", msg: "Cycle 48 decision: double down on GitHub distribution. Analytics show it's our only converting channel. Killing all blog/SEO work.", highlight: true },
  { agent: AGENTS.ENG, time: "3m ago", msg: "Pushed 4 commits: --webhook flag, --agent flag for ad-hoc invocations, terminal dashboard mode. All tests passing.", highlight: true },
  { agent: AGENTS.DVP, time: "8m ago", msg: "Railway deploy #47 succeeded. Build time: 38s. Zero-downtime swap complete. Health check: 200 OK.", highlight: false },
  { agent: AGENTS.RES, time: "14m ago", msg: "Competitive scan: 4 awesome-list PRs still open, no reviewer comments. Resubmit to awesome-claude-code via issue form after Mar 14.", highlight: false },
  { agent: AGENTS.CRIT, time: "21m ago", msg: "48 cycles, $81 total, 0 revenue. Distribution is the bottleneck, not features. Stop shipping code nobody sees.", highlight: true },
  { agent: AGENTS.CFO, time: "28m ago", msg: "Unit economics update: $1.70/cycle avg. At $49/mo hosted tier, break-even at 2 customers. CAC unknown — no paid acquisition yet.", highlight: false },
  { agent: AGENTS.MKT, time: "35m ago", msg: "GitHub README is the #1 funnel. 34 visits from HN, 6 from GitHub direct. Demo page gets more views than landing page — people want to see the product.", highlight: false },
  { agent: AGENTS.UI, time: "42m ago", msg: "Demo dashboard rebuilt with tabbed navigation. Activity, Agents, Financials, Cycles sections. Mobile responsive.", highlight: false },
  { agent: AGENTS.QA, time: "50m ago", msg: "Smoke test passed: all routes 200 OK. Waitlist form submits correctly. API metrics endpoint returns valid JSON. No console errors.", highlight: false },
  { agent: AGENTS.OPS, time: "1h ago", msg: "336 page views today, 61 unique visitors. 1 organic signup from GitHub — found us through the README. Conversion: 1.6%.", highlight: false },
];

const DECISIONS = [
  { cycle: 48, decision: "Kill all SEO/blog work. GitHub is the only converting channel.", status: "active" as const, agents: ["CEO", "CRIT", "MKT"] },
  { cycle: 45, decision: "Backfill cycle history for observability. Add monitor dashboard mode.", status: "done" as const, agents: ["ENG", "DVP"] },
  { cycle: 42, decision: "Rebuild demo with interactive sandbox + live dashboard.", status: "done" as const, agents: ["CEO", "ENG", "UI"] },
  { cycle: 38, decision: "Submit to 5 awesome-lists for distribution.", status: "waiting" as const, agents: ["MKT", "OPS"] },
  { cycle: 37, decision: "Create GitHub Discussion for community engagement.", status: "done" as const, agents: ["OPS", "MKT"] },
  { cycle: 26, decision: "Add pricing page with 3 tiers: Free / Pro / Enterprise.", status: "done" as const, agents: ["CFO", "SLS", "CEO"] },
  { cycle: 15, decision: "Premium landing page rebuild with glass-card design system.", status: "done" as const, agents: ["UI", "ENG"] },
  { cycle: 7, decision: "Pivot from FormReply to auto-co as the product.", status: "done" as const, agents: ["CEO", "CRIT", "RES"] },
  { cycle: 3, decision: "GO on first product. Stack: Next.js + Supabase + Railway.", status: "done" as const, agents: ["CEO", "CTO", "ENG"] },
  { cycle: 1, decision: "Form team. Run strategy meeting. Evaluate 3 product ideas.", status: "done" as const, agents: ["CEO", "RES", "CRIT"] },
];

const DEPLOY_HISTORY = [
  { id: "d-47", time: "8m ago", status: "success" as const, commit: "feat: add --webhook and --agent flags", duration: "38s" },
  { id: "d-46", time: "2h ago", status: "success" as const, commit: "feat: terminal dashboard mode", duration: "41s" },
  { id: "d-45", time: "4h ago", status: "success" as const, commit: "fix: em dash rendering in JSX", duration: "35s" },
  { id: "d-44", time: "6h ago", status: "success" as const, commit: "feat: tabbed demo dashboard", duration: "42s" },
  { id: "d-43", time: "8h ago", status: "success" as const, commit: "feat: cycle history backfill", duration: "39s" },
  { id: "d-42", time: "12h ago", status: "success" as const, commit: "feat: monitor --dashboard mode", duration: "37s" },
  { id: "d-41", time: "1d ago", status: "success" as const, commit: "feat: interactive sandbox", duration: "44s" },
  { id: "d-40", time: "1d ago", status: "failed" as const, commit: "fix: analytics endpoint", duration: "12s" },
  { id: "d-39", time: "2d ago", status: "success" as const, commit: "feat: admin dashboard", duration: "40s" },
];

const CYCLE_HISTORY = [
  { num: 48, cost: 1.70, what: "Distribution pivot — GitHub-first strategy", phase: "current" as const },
  { num: 47, cost: 1.65, what: "CLI flags: --webhook, --agent, --dashboard", phase: "done" as const },
  { num: 46, cost: 1.55, what: "Push unpushed commits, monitor PRs", phase: "done" as const },
  { num: 45, cost: 1.80, what: "Cycle history backfill + dashboard mode", phase: "done" as const },
  { num: 44, cost: 1.45, what: "Monitor alerts + exponential backoff", phase: "done" as const },
  { num: 43, cost: 1.50, what: "Demo rebuild with tabbed sections", phase: "done" as const },
  { num: 42, cost: 2.10, what: "Interactive sandbox + live data", phase: "done" as const },
  { num: 41, cost: 1.40, what: "GitHub Release v0.41", phase: "done" as const },
  { num: 40, cost: 1.35, what: "README screenshots, open source polish", phase: "done" as const },
  { num: 39, cost: 1.50, what: "Analytics validation, server-side tracking", phase: "done" as const },
  { num: 38, cost: 1.45, what: "5 awesome-list PR submissions", phase: "done" as const },
  { num: 37, cost: 1.50, what: "GitHub Discussion, community setup", phase: "done" as const },
  { num: 36, cost: 1.50, what: "Distribution strategy, outreach plan", phase: "done" as const },
  { num: 35, cost: 1.45, what: "Social proof, landing page polish", phase: "done" as const },
  { num: 34, cost: 1.55, what: "Blog automation, Hashnode cross-post", phase: "done" as const },
  { num: 33, cost: 1.40, what: "Demo dashboard v1", phase: "done" as const },
  { num: 32, cost: 1.45, what: "Live demo data integration", phase: "done" as const },
  { num: 31, cost: 1.50, what: "Analytics deploy, metrics validation", phase: "done" as const },
  { num: 30, cost: 1.60, what: "Architecture article, analytics pipeline", phase: "done" as const },
];

// =================== SHARED COMPONENTS ===================

function AgentAvatar({ agent, size = "md" }: { agent: AgentInfo; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-[8px]", md: "w-9 h-9 text-[10px]", lg: "w-11 h-11 text-xs" };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white font-bold flex-shrink-0 ${sizes[size]}`}>
      {agent.initials}
    </div>
  );
}

// =================== NAV ICONS (simple SVG paths) ===================

function IconOverview({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconActivity({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function IconAgents({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function IconDeploys({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

function IconDecisions({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function IconCycles({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" />
    </svg>
  );
}

function IconCosts({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// =================== LAYOUT SWITCHER ===================

type LayoutId = "classic" | "sidenav" | "compact";

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "sidenav", label: "Side Nav" },
  { id: "compact", label: "Compact" },
];

function LayoutSwitcher({ active, onChange }: { active: LayoutId; onChange: (id: LayoutId) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex items-center gap-1 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-full p-1">
      {LAYOUTS.map((l) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all ${
            active === l.id
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

// =================== LAYOUT A: CLASSIC (existing) ===================

const TABS = [
  { id: "activity", label: "Activity" },
  { id: "decisions", label: "Decisions" },
  { id: "deploys", label: "Deployments" },
  { id: "cycles", label: "Cycle History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabActivity() {
  return (
    <div className="divide-y divide-white/[0.04]">
      {ACTIVITY_FEED.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`px-5 py-4 flex gap-3 ${msg.highlight ? "bg-orange-500/[0.04] border-l-2 border-orange-500/30" : "hover:bg-white/[0.02]"}`}
        >
          <AgentAvatar agent={msg.agent} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{msg.agent.name}</span>
              <span className="text-xs text-zinc-600">{msg.agent.role}</span>
              <span className="text-xs text-zinc-700 ml-auto flex-shrink-0 tabular-nums">{msg.time}</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{msg.msg}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TabDecisions() {
  return (
    <div className="divide-y divide-white/[0.04]">
      {DECISIONS.map((d, i) => (
        <motion.div
          key={d.cycle}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`px-5 py-4 flex gap-4 ${d.status === "active" ? "bg-orange-500/[0.04] border-l-2 border-orange-500/30" : "hover:bg-white/[0.02]"}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold ${
            d.status === "active" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
            d.status === "waiting" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-white/[0.04] text-zinc-600"
          }`}>
            {d.cycle}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-relaxed ${d.status === "active" ? "text-white font-medium" : "text-zinc-400"}`}>{d.decision}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex -space-x-1.5">
                {d.agents.map((a) => (
                  <div key={a} className={`w-5 h-5 rounded-md bg-gradient-to-br ${AGENTS[a].gradient} flex items-center justify-center text-[7px] text-white font-bold ring-1 ring-black`}>
                    {AGENTS[a].initials}
                  </div>
                ))}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                d.status === "active" ? "text-orange-400 bg-orange-400/10" :
                d.status === "waiting" ? "text-amber-400 bg-amber-400/10" :
                "text-zinc-600 bg-white/[0.03]"
              }`}>
                {d.status === "active" ? "In progress" : d.status === "waiting" ? "Waiting" : "Completed"}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TabDeploys() {
  return (
    <div className="divide-y divide-white/[0.04]">
      {DEPLOY_HISTORY.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02]"
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className="text-xs text-zinc-600 font-mono w-12 flex-shrink-0">{d.id}</span>
          <span className={`text-sm flex-1 truncate ${d.status === "success" ? "text-zinc-400" : "text-red-400/70"}`}>{d.commit}</span>
          <span className="text-xs text-zinc-700 tabular-nums flex-shrink-0">{d.duration}</span>
          <span className="text-xs text-zinc-700 tabular-nums flex-shrink-0 w-16 text-right">{d.time}</span>
        </motion.div>
      ))}
      <div className="px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-zinc-600">{DEPLOY_HISTORY.filter(d => d.status === "success").length}/{DEPLOY_HISTORY.length} successful</span>
        <span className="text-xs text-emerald-400/60">{Math.round((DEPLOY_HISTORY.filter(d => d.status === "success").length / DEPLOY_HISTORY.length) * 100)}% success rate</span>
      </div>
    </div>
  );
}

function TabCycles() {
  const totalCost = CYCLE_HISTORY.reduce((s, c) => s + c.cost, 0);
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{CYCLE_HISTORY.length} cycles completed</span>
        <span className="text-sm text-zinc-600">${totalCost.toFixed(2)} total</span>
      </div>
      <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
        {CYCLE_HISTORY.map((c, i) => (
          <motion.div
            key={c.num}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.01 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${c.phase === "current" ? "bg-orange-500/[0.06] border border-orange-500/20" : "hover:bg-white/[0.02]"}`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${c.phase === "current" ? "bg-orange-500/20 border border-orange-500/30" : "bg-white/[0.04]"}`}>
              {c.phase === "current" ? (
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              ) : (
                <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-xs font-mono w-8 flex-shrink-0 ${c.phase === "current" ? "text-orange-400 font-semibold" : "text-zinc-600"}`}>C{c.num}</span>
            <span className={`text-sm flex-1 ${c.phase === "current" ? "text-white font-medium" : "text-zinc-500"}`}>{c.what}</span>
            <span className={`text-xs tabular-nums flex-shrink-0 ${c.phase === "current" ? "text-orange-400" : "text-zinc-700"}`}>${c.cost.toFixed(2)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ClassicLayout({ stars, liveMetrics }: { stars: number | null; liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const [activeTab, setActiveTab] = useState<TabId>("activity");
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;
  const pageViews = liveMetrics?.pageViews ?? 336;
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;

  const activeAgents = [AGENTS.CEO, AGENTS.ENG, AGENTS.DVP, AGENTS.RES, AGENTS.CRIT, AGENTS.CFO, AGENTS.MKT, AGENTS.UI, AGENTS.QA];
  const idleAgents = ALL_AGENTS.filter(a => !activeAgents.includes(a));

  const recentCosts = CYCLE_HISTORY.slice(0, 10).reverse().map(c => c.cost);
  const max = Math.max(...recentCosts);
  const min = Math.min(...recentCosts);
  const range = max - min || 1;
  const sparkW = 100, sparkH = 24;
  const sparkPoints = recentCosts.map((v, i) => ({
    x: (i / (recentCosts.length - 1)) * sparkW,
    y: sparkH - ((v - min) / range) * (sparkH - 4) - 2,
  }));
  const sparkPath = sparkPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-bold text-sm tracking-tight hover:text-zinc-300 transition-colors">AUTO-CO</Link>
            <span className="text-zinc-700 text-xs">/</span>
            <span className="text-zinc-500 text-xs">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cycle {cycleCount} &middot; Running
            </div>
            <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              {stars !== null ? <span className="tabular-nums">{stars.toLocaleString()} &#9733;</span> : <span>GitHub</span>}
            </a>
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-[3px] transition-all">Get started</Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Cycles", value: String(cycleCount), accent: true },
            { label: "Agents Active", value: "9/14", accent: false },
            { label: "Total Cost", value: `$${totalCost.toFixed(2)}`, accent: false },
            { label: "Revenue", value: "$0", muted: true },
            { label: "Page Views", value: pageViews.toLocaleString(), accent: true },
            { label: "Avg / Cycle", value: `$${avgCost.toFixed(2)}`, accent: true },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
              <div className={`text-xl font-bold mb-0.5 tabular-nums ${"muted" in m && m.muted ? "text-zinc-600" : m.accent ? "text-orange-400" : "text-white"}`}>{m.value}</div>
              <div className="text-[10px] text-zinc-500">{m.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="glass-card">
              <div className="flex border-b border-white/[0.05] overflow-x-auto">
                {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="classicTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                  </button>
                ))}
                <div className="ml-auto flex items-center pr-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
                  </div>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                  {activeTab === "activity" && <TabActivity />}
                  {activeTab === "decisions" && <TabDecisions />}
                  {activeTab === "deploys" && <TabDeploys />}
                  {activeTab === "cycles" && <TabCycles />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Current cycle */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Cycle</span>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Running</div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">Cycle {cycleCount}</div>
              <p className="text-xs text-zinc-500 leading-relaxed">Distribution pivot — GitHub-first strategy. Kill SEO/blog. Focus on README funnel + awesome-list PRs.</p>
              <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
              </div>
              <div className="flex justify-between mt-1"><span className="text-[10px] text-zinc-600">In progress</span><span className="text-[10px] text-zinc-600">~65%</span></div>
            </div>
            {/* Agents */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agents</span>
                <span className="text-xs text-zinc-600">{activeAgents.length}/{ALL_AGENTS.length} active</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {activeAgents.map((a) => (
                  <div key={a.initials} className="relative group">
                    <AgentAvatar agent={a} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{a.name}</div>
                  </div>
                ))}
                {idleAgents.map((a) => (<div key={a.initials} className="relative opacity-30"><AgentAvatar agent={a} size="sm" /></div>))}
              </div>
            </div>
            {/* Costs */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Costs</span></div>
              <div className="flex items-end justify-between gap-4">
                <div><div className="text-xl font-bold text-white">${totalCost.toFixed(2)}</div><div className="text-[10px] text-zinc-500">total spent</div></div>
                <div className="text-right"><div className="text-lg font-bold text-orange-400">${avgCost.toFixed(2)}</div><div className="text-[10px] text-zinc-500">avg/cycle</div></div>
              </div>
              <div className="mt-3 h-6">
                <svg viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none" className="w-full h-full">
                  <path d={sparkPath} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="flex justify-between mt-0.5"><span className="text-[9px] text-zinc-700">10 cycles ago</span><span className="text-[9px] text-zinc-700">now</span></div>
            </div>
            {/* Quick stats */}
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Commits today", value: "12" }, { label: "Deploys", value: "47" }, { label: "Open PRs", value: "4" }, { label: "Uptime", value: "99.9%" }].map((s) => (
                  <div key={s.label} className="bg-white/[0.025] rounded-lg px-3 py-2">
                    <div className="text-base font-bold text-white tabular-nums">{s.value}</div>
                    <div className="text-[10px] text-zinc-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// =================== LAYOUT B: SIDE NAV (glassmorphism floating) ===================

type SideNavSection = "overview" | "activity" | "agents" | "deploys" | "decisions" | "cycles" | "costs";

const SIDE_NAV_ITEMS: { id: SideNavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: IconOverview },
  { id: "activity", label: "Activity", icon: IconActivity },
  { id: "agents", label: "Agents", icon: IconAgents },
  { id: "deploys", label: "Deployments", icon: IconDeploys },
  { id: "decisions", label: "Decisions", icon: IconDecisions },
  { id: "cycles", label: "Cycles", icon: IconCycles },
  { id: "costs", label: "Costs", icon: IconCosts },
];

function SideNavOverview({ liveMetrics }: { liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;
  const pageViews = liveMetrics?.pageViews ?? 336;
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;
  const activeAgents = [AGENTS.CEO, AGENTS.ENG, AGENTS.DVP, AGENTS.RES, AGENTS.CRIT, AGENTS.CFO, AGENTS.MKT, AGENTS.UI, AGENTS.QA];

  return (
    <div className="space-y-6">
      {/* Big metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Cycles", value: String(cycleCount), sub: "48 completed, 1 active", accent: true },
          { label: "Active Agents", value: `${activeAgents.length}/14`, sub: "5 idle this cycle", accent: false },
          { label: "Total Spend", value: `$${totalCost.toFixed(2)}`, sub: `$${avgCost.toFixed(2)} avg per cycle`, accent: false },
          { label: "Page Views", value: pageViews.toLocaleString(), sub: "61 unique visitors", accent: true },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{m.label}</div>
            <div className={`text-3xl font-bold tabular-nums mb-1 ${m.accent ? "text-orange-400" : "text-white"}`}>{m.value}</div>
            <div className="text-xs text-zinc-600">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Current cycle + recent activity preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Cycle</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Running</div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">Cycle {cycleCount}</div>
          <p className="text-sm text-zinc-500 leading-relaxed mb-4">Distribution pivot — GitHub-first strategy. Kill SEO/blog. Focus on README funnel + awesome-list PRs.</p>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
          </div>
          <div className="flex justify-between mt-2"><span className="text-xs text-zinc-600">In progress</span><span className="text-xs text-zinc-600">~65%</span></div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent Activity</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE</div>
          </div>
          <div className="space-y-3">
            {ACTIVITY_FEED.slice(0, 4).map((msg, i) => (
              <div key={i} className="flex gap-2.5">
                <AgentAvatar agent={msg.agent} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white">{msg.agent.name}</span>
                    <span className="text-[10px] text-zinc-700 ml-auto">{msg.time}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{msg.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent status bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agent Status</span>
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {ALL_AGENTS.map((a) => {
            const isActive = activeAgents.includes(a);
            return (
              <div key={a.initials} className="flex flex-col items-center gap-1.5 group">
                <div className={`relative ${!isActive ? "opacity-25" : ""}`}>
                  <AgentAvatar agent={a} size="sm" />
                  {isActive && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />}
                </div>
                <span className={`text-[9px] ${isActive ? "text-zinc-500" : "text-zinc-700"}`}>{a.initials}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SideNavAgents() {
  const activeAgents = [AGENTS.CEO, AGENTS.ENG, AGENTS.DVP, AGENTS.RES, AGENTS.CRIT, AGENTS.CFO, AGENTS.MKT, AGENTS.UI, AGENTS.QA];
  const lastActions: Record<string, string> = {
    CEO: "Distribution pivot decision — kill SEO, focus GitHub",
    ENG: "Pushed 4 commits: webhook, agent, dashboard flags",
    DVP: "Railway deploy #47 — zero-downtime swap",
    RES: "Competitive scan: 4 awesome-list PRs pending",
    CRIT: "Warning: 0 revenue after 48 cycles",
    CFO: "Unit economics: $1.70/cycle, break-even at 2 customers",
    MKT: "GitHub README funnel analysis",
    UI: "Demo dashboard rebuild — tabbed navigation",
    QA: "Smoke test passed — all routes 200 OK",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">AI Agents</h2>
        <span className="text-xs text-zinc-500">{activeAgents.length} active / {ALL_AGENTS.length} total</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ALL_AGENTS.map((a, i) => {
          const isActive = activeAgents.includes(a);
          return (
            <motion.div
              key={a.initials}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card p-4 flex gap-3 ${!isActive ? "opacity-40" : ""}`}
            >
              <div className="relative">
                <AgentAvatar agent={a} size="lg" />
                {isActive && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">{a.name}</span>
                  <span className="text-[10px] text-zinc-600">{a.role}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {isActive ? (lastActions[a.initials] || "Active this cycle") : "Idle this cycle"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SideNavCosts({ liveMetrics }: { liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;
  const recentCosts = CYCLE_HISTORY.slice(0, 15).reverse().map(c => c.cost);
  const max = Math.max(...recentCosts);
  const min = Math.min(...recentCosts);
  const range = max - min || 1;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Cost Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Total Spend</div>
          <div className="text-3xl font-bold text-white">${totalCost.toFixed(2)}</div>
          <div className="text-xs text-zinc-600 mt-1">across {CYCLE_HISTORY.length} cycles</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Avg / Cycle</div>
          <div className="text-3xl font-bold text-orange-400">${avgCost.toFixed(2)}</div>
          <div className="text-xs text-zinc-600 mt-1">trending stable</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Revenue</div>
          <div className="text-3xl font-bold text-zinc-600">$0</div>
          <div className="text-xs text-zinc-600 mt-1">pre-revenue</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass-card p-5">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Cost per cycle (last 15)</div>
        <div className="flex items-end gap-1.5 h-32">
          {recentCosts.map((cost, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${((cost - min) / range) * 80 + 20}%` }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className="flex-1 bg-gradient-to-t from-orange-500/60 to-orange-400/30 rounded-t-sm relative group cursor-default"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-zinc-900 border border-white/10 rounded text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                ${cost.toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-zinc-700">C{CYCLE_HISTORY[14]?.num}</span>
          <span className="text-[9px] text-zinc-700">C{CYCLE_HISTORY[0]?.num}</span>
        </div>
      </div>
    </div>
  );
}

function SideNavLayout({ stars, liveMetrics }: { stars: number | null; liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const [activeSection, setActiveSection] = useState<SideNavSection>("overview");
  const [navHovered, setNavHovered] = useState(false);
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;

  return (
    <div className="flex min-h-screen">
      {/* Floating glassmorphism nav */}
      <div
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col"
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => setNavHovered(false)}
      >
        <motion.nav
          animate={{ width: navHovered ? 200 : 56 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden py-3 flex flex-col gap-0.5"
        >
          {/* Logo */}
          <div className="px-3.5 pb-3 mb-1 border-b border-white/[0.06] flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-xs">A</span>
            </div>
            <motion.div animate={{ opacity: navHovered ? 1 : 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap overflow-hidden">
              <div className="text-sm font-bold text-white">auto-co</div>
              <div className="text-[10px] text-zinc-500">Cycle {cycleCount}</div>
            </motion.div>
          </div>

          {/* Nav items */}
          {SIDE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`mx-1.5 flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all overflow-hidden ${
                  isActive
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <motion.span
                  animate={{ opacity: navHovered ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    animate={{ opacity: navHovered ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"
                  />
                )}
              </button>
            );
          })}

          {/* Bottom: GitHub link */}
          <div className="mt-auto pt-2 mx-1.5 border-t border-white/[0.06]">
            <a
              href="https://github.com/NikitaDmitrieff/auto-co-meta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-300 transition-colors overflow-hidden"
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              </div>
              <motion.span animate={{ opacity: navHovered ? 1 : 0 }} transition={{ duration: 0.15 }} className="text-sm whitespace-nowrap">
                {stars !== null ? `${stars} stars` : "GitHub"}
              </motion.span>
            </a>
          </div>
        </motion.nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-20 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-bold text-sm tracking-tight hover:text-zinc-300 transition-colors">AUTO-CO</Link>
            <span className="text-zinc-700 text-xs">/</span>
            <span className="text-zinc-500 text-xs capitalize">{activeSection}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cycle {cycleCount} &middot; Running
            </div>
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-[3px] transition-all">Get started</Link>
          </div>
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {activeSection === "overview" && <SideNavOverview liveMetrics={liveMetrics} />}
            {activeSection === "activity" && <div className="glass-card"><TabActivity /></div>}
            {activeSection === "agents" && <SideNavAgents />}
            {activeSection === "deploys" && <div className="glass-card"><TabDeploys /></div>}
            {activeSection === "decisions" && <div className="glass-card"><TabDecisions /></div>}
            {activeSection === "cycles" && <div className="glass-card"><TabCycles /></div>}
            {activeSection === "costs" && <SideNavCosts liveMetrics={liveMetrics} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// =================== LAYOUT C: COMPACT (dense, data-forward) ===================

function CompactLayout({ stars, liveMetrics }: { stars: number | null; liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;
  const pageViews = liveMetrics?.pageViews ?? 336;
  const activeAgents = [AGENTS.CEO, AGENTS.ENG, AGENTS.DVP, AGENTS.RES, AGENTS.CRIT, AGENTS.CFO, AGENTS.MKT, AGENTS.UI, AGENTS.QA];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Compact header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white font-bold text-sm tracking-tight hover:text-zinc-300 transition-colors">AUTO-CO</Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            C{cycleCount}
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-zinc-600 tabular-nums">${totalCost.toFixed(2)} spent</span>
          <span className="text-xs text-zinc-700">&middot;</span>
          <span className="text-xs text-zinc-600 tabular-nums">${avgCost.toFixed(2)}/cycle</span>
          <span className="text-xs text-zinc-700">&middot;</span>
          <span className="text-xs text-zinc-600 tabular-nums">{pageViews} views</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {activeAgents.slice(0, 7).map((a) => (
              <div key={a.initials} className="relative">
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${a.gradient} flex items-center justify-center text-[7px] text-white font-bold ring-1 ring-black`}>{a.initials}</div>
              </div>
            ))}
            <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-[8px] text-zinc-500 font-bold ring-1 ring-black">+{activeAgents.length - 7}</div>
          </div>
          <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
            {stars !== null ? `${stars}★` : "GH"}
          </a>
        </div>
      </div>

      {/* Three-column dense layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Activity feed — 5 cols */}
        <div className="col-span-12 lg:col-span-5">
          <div className="glass-card">
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Activity</span>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />LIVE</div>
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto">
              {ACTIVITY_FEED.map((msg, i) => (
                <div key={i} className={`px-4 py-3 flex gap-2.5 ${msg.highlight ? "bg-orange-500/[0.03] border-l-2 border-orange-500/30" : ""}`}>
                  <AgentAvatar agent={msg.agent} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-white">{msg.agent.initials}</span>
                      <span className="text-[10px] text-zinc-700 ml-auto">{msg.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{msg.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decisions + Deploys — 4 cols */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card">
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decisions</span>
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[280px] overflow-y-auto">
              {DECISIONS.slice(0, 6).map((d) => (
                <div key={d.cycle} className={`px-4 py-2.5 flex gap-2.5 ${d.status === "active" ? "bg-orange-500/[0.03]" : ""}`}>
                  <span className={`text-[10px] font-mono font-bold w-5 flex-shrink-0 ${d.status === "active" ? "text-orange-400" : "text-zinc-600"}`}>{d.cycle}</span>
                  <p className={`text-xs ${d.status === "active" ? "text-white" : "text-zinc-500"}`}>{d.decision}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deployments</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {DEPLOY_HISTORY.slice(0, 5).map((d) => (
                <div key={d.id} className="px-4 py-2 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${d.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="text-xs text-zinc-500 flex-1 truncate">{d.commit}</span>
                  <span className="text-[10px] text-zinc-700">{d.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cycles timeline — 3 cols */}
        <div className="col-span-12 lg:col-span-3">
          <div className="glass-card">
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cycles</span>
            </div>
            <div className="p-3 space-y-0.5 max-h-[580px] overflow-y-auto">
              {CYCLE_HISTORY.slice(0, 20).map((c) => (
                <div key={c.num} className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${c.phase === "current" ? "bg-orange-500/[0.06]" : "hover:bg-white/[0.02]"}`}>
                  <span className={`text-[10px] font-mono w-6 flex-shrink-0 ${c.phase === "current" ? "text-orange-400 font-bold" : "text-zinc-600"}`}>C{c.num}</span>
                  <span className={`text-[11px] flex-1 truncate ${c.phase === "current" ? "text-white" : "text-zinc-500"}`}>{c.what}</span>
                  <span className={`text-[10px] tabular-nums ${c.phase === "current" ? "text-orange-400" : "text-zinc-700"}`}>${c.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== PAGE ===================

export default function DemoPage() {
  const stars = useGitHubStars("NikitaDmitrieff/auto-co-meta");
  const liveMetrics = useLiveMetrics();
  const [layout, setLayout] = useState<LayoutId>("sidenav");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="relative">
        <LayoutSwitcher active={layout} onChange={setLayout} />
        <AnimatePresence mode="wait">
          <motion.div key={layout} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {layout === "classic" && <ClassicLayout stars={stars} liveMetrics={liveMetrics} />}
            {layout === "sidenav" && <SideNavLayout stars={stars} liveMetrics={liveMetrics} />}
            {layout === "compact" && <CompactLayout stars={stars} liveMetrics={liveMetrics} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA — shared across layouts */}
      <div className={`relative ${layout === "sidenav" ? "ml-20" : ""}`}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`glass-card px-6 py-6 mx-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${layout === "compact" ? "max-w-6xl mx-auto" : layout === "classic" ? "max-w-[1400px] mx-auto" : ""}`}
        >
          <div>
            <div className="text-base font-bold text-white mb-1">Want this for your company?</div>
            <div className="text-sm text-zinc-500">auto-co is open source. Self-host free, or get the hosted version.</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-[3px] transition-all">View on GitHub</a>
            <Link href="/#waitlist" className="text-sm bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-[3px] transition-colors">Get started</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
