"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";

// =================== HOOKS ===================

function useGitHubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`, { headers: { Accept: "application/vnd.github.v3+json" } })
      .then((r) => r.json())
      .then((d) => { if (typeof d.stargazers_count === "number") setStars(d.stargazers_count); })
      .catch(() => {});
  }, [repo]);
  return stars;
}

function useLiveMetrics() {
  const [metrics, setMetrics] = useState<{ pageViews: number; waitlistSignups: number; cyclesCompleted: number; totalCost: number; avgCostPerCycle: number } | null>(null);
  useEffect(() => {
    fetch("/api/metrics").then((r) => r.json()).then((d) => { if (d.pageViews !== undefined) setMetrics(d); }).catch(() => {});
  }, []);
  return metrics;
}

// =================== TYPES & DATA ===================

interface AgentInfo { initials: string; name: string; role: string; gradient: string }

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
const ACTIVE_AGENTS = [AGENTS.CEO, AGENTS.ENG, AGENTS.DVP, AGENTS.RES, AGENTS.CRIT, AGENTS.CFO, AGENTS.MKT, AGENTS.UI, AGENTS.QA];

const ACTIVITY_FEED = [
  { agent: AGENTS.CEO, time: "just now", msg: "Cycle 48 decision: double down on GitHub distribution. Killing all blog/SEO work.", highlight: true },
  { agent: AGENTS.ENG, time: "3m ago", msg: "Pushed 4 commits: --webhook flag, --agent flag, terminal dashboard mode. All tests passing.", highlight: true },
  { agent: AGENTS.DVP, time: "8m ago", msg: "Railway deploy #47 succeeded. Build time: 38s. Zero-downtime swap. Health check: 200 OK.", highlight: false },
  { agent: AGENTS.RES, time: "14m ago", msg: "Competitive scan: 4 awesome-list PRs still open, no reviewer comments.", highlight: false },
  { agent: AGENTS.CRIT, time: "21m ago", msg: "48 cycles, $81 total, 0 revenue. Distribution is the bottleneck, not features.", highlight: true },
  { agent: AGENTS.CFO, time: "28m ago", msg: "Unit economics: $1.70/cycle avg. At $49/mo hosted, break-even at 2 customers.", highlight: false },
  { agent: AGENTS.MKT, time: "35m ago", msg: "GitHub README is the #1 funnel. Demo page gets more views than landing page.", highlight: false },
  { agent: AGENTS.UI, time: "42m ago", msg: "Demo dashboard rebuilt with tabbed navigation. Mobile responsive.", highlight: false },
  { agent: AGENTS.QA, time: "50m ago", msg: "Smoke test passed: all routes 200 OK. API metrics returns valid JSON.", highlight: false },
  { agent: AGENTS.OPS, time: "1h ago", msg: "336 page views, 61 unique visitors. 1 organic signup from GitHub README.", highlight: false },
];

const DECISIONS = [
  { cycle: 48, decision: "Kill all SEO/blog work. GitHub is the only converting channel.", status: "active" as const, agents: ["CEO", "CRIT", "MKT"] },
  { cycle: 45, decision: "Backfill cycle history. Add monitor dashboard mode.", status: "done" as const, agents: ["ENG", "DVP"] },
  { cycle: 42, decision: "Rebuild demo with interactive sandbox + live dashboard.", status: "done" as const, agents: ["CEO", "ENG", "UI"] },
  { cycle: 38, decision: "Submit to 5 awesome-lists for distribution.", status: "waiting" as const, agents: ["MKT", "OPS"] },
  { cycle: 26, decision: "Add pricing page with 3 tiers.", status: "done" as const, agents: ["CFO", "SLS", "CEO"] },
  { cycle: 15, decision: "Premium landing page rebuild.", status: "done" as const, agents: ["UI", "ENG"] },
  { cycle: 7, decision: "Pivot from FormReply to auto-co as the product.", status: "done" as const, agents: ["CEO", "CRIT", "RES"] },
  { cycle: 1, decision: "Form team. Evaluate 3 product ideas.", status: "done" as const, agents: ["CEO", "RES", "CRIT"] },
];

const DEPLOY_HISTORY = [
  { id: "d-47", time: "8m ago", status: "success" as const, commit: "feat: webhook + agent flags", duration: "38s" },
  { id: "d-46", time: "2h ago", status: "success" as const, commit: "feat: terminal dashboard", duration: "41s" },
  { id: "d-45", time: "4h ago", status: "success" as const, commit: "fix: em dash in JSX", duration: "35s" },
  { id: "d-44", time: "6h ago", status: "success" as const, commit: "feat: tabbed demo", duration: "42s" },
  { id: "d-43", time: "8h ago", status: "success" as const, commit: "feat: cycle history", duration: "39s" },
  { id: "d-42", time: "12h ago", status: "success" as const, commit: "feat: monitor dashboard", duration: "37s" },
  { id: "d-41", time: "1d ago", status: "success" as const, commit: "feat: interactive sandbox", duration: "44s" },
  { id: "d-40", time: "1d ago", status: "failed" as const, commit: "fix: analytics endpoint", duration: "12s" },
];

const CYCLE_HISTORY = [
  { num: 48, cost: 1.70, what: "Distribution pivot — GitHub-first", phase: "current" as const },
  { num: 47, cost: 1.65, what: "CLI flags: webhook, agent, dashboard", phase: "done" as const },
  { num: 46, cost: 1.55, what: "Push commits, monitor PRs", phase: "done" as const },
  { num: 45, cost: 1.80, what: "Cycle history + dashboard mode", phase: "done" as const },
  { num: 44, cost: 1.45, what: "Monitor alerts + backoff", phase: "done" as const },
  { num: 43, cost: 1.50, what: "Demo rebuild, tabbed sections", phase: "done" as const },
  { num: 42, cost: 2.10, what: "Interactive sandbox + live data", phase: "done" as const },
  { num: 41, cost: 1.40, what: "GitHub Release v0.41", phase: "done" as const },
  { num: 40, cost: 1.35, what: "README screenshots, polish", phase: "done" as const },
  { num: 39, cost: 1.50, what: "Analytics validation", phase: "done" as const },
  { num: 38, cost: 1.45, what: "5 awesome-list PRs", phase: "done" as const },
  { num: 37, cost: 1.50, what: "GitHub Discussion, community", phase: "done" as const },
  { num: 36, cost: 1.50, what: "Distribution strategy", phase: "done" as const },
  { num: 35, cost: 1.45, what: "Social proof, landing polish", phase: "done" as const },
];

const TERMINAL_LINES = [
  { ts: "11:18:01", level: "START", msg: "Cycle #48 — distribution pivot", color: "text-orange-400" },
  { ts: "11:18:04", level: "INFO", msg: "ceo-bezos: Kill SEO. GitHub-first strategy.", color: "text-zinc-400" },
  { ts: "11:18:09", level: "INFO", msg: "fullstack-dhh: Pushing 4 commits. Tests green.", color: "text-zinc-400" },
  { ts: "11:18:14", level: "OK", msg: "Deploy #47 live. Build: 38s. Health: 200.", color: "text-emerald-400" },
  { ts: "11:18:22", level: "INFO", msg: "research-thompson: Scanning awesome-lists.", color: "text-zinc-400" },
  { ts: "11:18:28", level: "WARN", msg: "critic-munger: 0 revenue. Ship less, distribute more.", color: "text-amber-400" },
  { ts: "11:18:35", level: "INFO", msg: "cfo-campbell: $1.70/cycle. Break-even at 2 customers.", color: "text-zinc-400" },
  { ts: "11:18:40", level: "OK", msg: "README updated. Demo screenshot refreshed.", color: "text-emerald-400" },
  { ts: "11:18:45", level: "INFO", msg: "qa-bach: Smoke test — all routes 200 OK.", color: "text-zinc-400" },
  { ts: "11:18:50", level: "END", msg: "Cycle #48 complete. Cost: $1.70. Total: $81.42.", color: "text-orange-400" },
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

function TerminalView({ compact = false }: { compact?: boolean }) {
  const lines = compact ? TERMINAL_LINES.slice(0, 6) : TERMINAL_LINES;
  return (
    <div className={`w-full bg-zinc-950 font-mono text-xs leading-relaxed ${compact ? "p-3" : "p-4"} rounded-xl border border-white/[0.06] overflow-hidden`}>
      <div className="mb-2 flex items-center gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-zinc-600 text-[10px] ml-2">auto-co — cycle 48</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />live
        </span>
      </div>
      <div className="space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-zinc-700 flex-shrink-0 tabular-nums">[{line.ts}]</span>
            <span className={`flex-shrink-0 font-bold w-10 ${line.color}`}>{line.level}</span>
            <span className="text-zinc-400 break-all">{line.msg}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <span className="text-zinc-700">$</span>
          <span className="text-zinc-500">_<span className="animate-pulse">▋</span></span>
        </div>
      </div>
    </div>
  );
}

// =================== LAYOUT SWITCHER (above demo, not floating) ===================

type LayoutId = "classic" | "sidenav" | "compact";

function LayoutHeader({ active, onChange }: { active: LayoutId; onChange: (id: LayoutId) => void }) {
  return (
    <div className="border-b border-white/[0.08] bg-black">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo-ac.png" alt="AC" width={20} height={15} className="opacity-70" />
            <span className="text-sm text-zinc-500">Pick the view that fits how you work</span>
          </div>
          <div className="w-10" />
        </div>
        <div className="flex items-center border border-white/[0.1] bg-white/[0.02]">
          {(["classic", "sidenav", "compact"] as const).map((id) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`px-6 py-2 text-sm font-medium transition-all border-r last:border-r-0 border-white/[0.1] ${
                active === id ? "bg-orange-500/15 text-orange-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              }`}
            >
              {id === "classic" ? "Classic" : id === "sidenav" ? "Side Nav" : "Compact"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =================== LAYOUT A: CLASSIC ===================

const TABS = [
  { id: "activity", label: "Activity" },
  { id: "decisions", label: "Decisions" },
  { id: "deploys", label: "Deployments" },
  { id: "cycles", label: "Cycle History" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function ClassicLayout({ stars, liveMetrics }: { stars: number | null; liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const [activeTab, setActiveTab] = useState<TabId>("activity");
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;
  const pageViews = liveMetrics?.pageViews ?? 336;
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;
  const recentCosts = CYCLE_HISTORY.slice(0, 10).reverse().map(c => c.cost);
  const max = Math.max(...recentCosts); const min = Math.min(...recentCosts); const range = max - min || 1;
  const sparkW = 100, sparkH = 24;
  const sparkPath = recentCosts.map((v, i) => `${i === 0 ? "M" : "L"} ${((i / (recentCosts.length - 1)) * sparkW).toFixed(1)} ${(sparkH - ((v - min) / range) * (sparkH - 4) - 2).toFixed(1)}`).join(" ");

  return (
    <main className="relative max-w-[1400px] mx-auto px-6 py-8">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-ac.png" alt="auto-co" width={24} height={18} className="opacity-80" />
          <span className="text-white font-bold text-sm">auto-co</span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Cycle {cycleCount} &middot; Running
          </div>
        </div>
        <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
          {stars !== null ? `${stars} ★` : "GitHub"}
        </a>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Cycles", value: String(cycleCount), accent: true },
          { label: "Agents Active", value: "9/14" },
          { label: "Total Cost", value: `$${totalCost.toFixed(2)}` },
          { label: "Revenue", value: "$0", muted: true },
          { label: "Page Views", value: pageViews.toLocaleString(), accent: true },
          { label: "Avg / Cycle", value: `$${avgCost.toFixed(2)}`, accent: true },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className={`text-xl font-bold mb-0.5 tabular-nums ${"muted" in m && m.muted ? "text-zinc-600" : "accent" in m && m.accent ? "text-orange-400" : "text-white"}`}>{m.value}</div>
            <div className="text-[10px] text-zinc-500">{m.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card">
            <div className="flex border-b border-white/[0.05] overflow-x-auto">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="classicTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                </button>
              ))}
              <div className="ml-auto flex items-center pr-4">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE</div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                {activeTab === "activity" && <div className="divide-y divide-white/[0.04]">{ACTIVITY_FEED.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`px-5 py-4 flex gap-3 ${msg.highlight ? "bg-orange-500/[0.04] border-l-2 border-orange-500/30" : "hover:bg-white/[0.02]"}`}>
                    <AgentAvatar agent={msg.agent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1"><span className="text-sm font-semibold text-white">{msg.agent.name}</span><span className="text-xs text-zinc-600">{msg.agent.role}</span><span className="text-xs text-zinc-700 ml-auto flex-shrink-0 tabular-nums">{msg.time}</span></div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{msg.msg}</p>
                    </div>
                  </motion.div>
                ))}</div>}
                {activeTab === "decisions" && <div className="divide-y divide-white/[0.04]">{DECISIONS.map((d, i) => (
                  <motion.div key={d.cycle} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`px-5 py-4 flex gap-4 ${d.status === "active" ? "bg-orange-500/[0.04] border-l-2 border-orange-500/30" : "hover:bg-white/[0.02]"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold ${d.status === "active" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : d.status === "waiting" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-white/[0.04] text-zinc-600"}`}>{d.cycle}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${d.status === "active" ? "text-white font-medium" : "text-zinc-400"}`}>{d.decision}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex -space-x-1.5">{d.agents.map((a) => (<div key={a} className={`w-5 h-5 rounded-md bg-gradient-to-br ${AGENTS[a].gradient} flex items-center justify-center text-[7px] text-white font-bold ring-1 ring-black`}>{AGENTS[a].initials}</div>))}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.status === "active" ? "text-orange-400 bg-orange-400/10" : d.status === "waiting" ? "text-amber-400 bg-amber-400/10" : "text-zinc-600 bg-white/[0.03]"}`}>{d.status === "active" ? "In progress" : d.status === "waiting" ? "Waiting" : "Done"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}</div>}
                {activeTab === "deploys" && <div className="divide-y divide-white/[0.04]">{DEPLOY_HISTORY.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02]">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className="text-xs text-zinc-600 font-mono w-12 flex-shrink-0">{d.id}</span>
                    <span className={`text-sm flex-1 truncate ${d.status === "success" ? "text-zinc-400" : "text-red-400/70"}`}>{d.commit}</span>
                    <span className="text-xs text-zinc-700 tabular-nums flex-shrink-0">{d.duration}</span>
                    <span className="text-xs text-zinc-700 tabular-nums flex-shrink-0 w-16 text-right">{d.time}</span>
                  </motion.div>
                ))}</div>}
                {activeTab === "cycles" && <div className="p-5 space-y-0.5 max-h-[500px] overflow-y-auto">{CYCLE_HISTORY.map((c, i) => (
                  <motion.div key={c.num} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.01 }} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${c.phase === "current" ? "bg-orange-500/[0.06] border border-orange-500/20" : "hover:bg-white/[0.02]"}`}>
                    <span className={`text-xs font-mono w-8 flex-shrink-0 ${c.phase === "current" ? "text-orange-400 font-semibold" : "text-zinc-600"}`}>C{c.num}</span>
                    <span className={`text-sm flex-1 ${c.phase === "current" ? "text-white font-medium" : "text-zinc-500"}`}>{c.what}</span>
                    <span className={`text-xs tabular-nums flex-shrink-0 ${c.phase === "current" ? "text-orange-400" : "text-zinc-700"}`}>${c.cost.toFixed(2)}</span>
                  </motion.div>
                ))}</div>}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Terminal */}
          <TerminalView />
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Cycle</span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Running</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Cycle {cycleCount}</div>
            <p className="text-xs text-zinc-500 leading-relaxed">Distribution pivot — GitHub-first. Kill SEO/blog. Focus on README + awesome-lists.</p>
            <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" /></div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agents</span><span className="text-xs text-zinc-600">{ACTIVE_AGENTS.length}/{ALL_AGENTS.length}</span></div>
            <div className="grid grid-cols-7 gap-1.5">
              {ACTIVE_AGENTS.map((a) => (<div key={a.initials} className="relative group"><AgentAvatar agent={a} size="sm" /><span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" /></div>))}
              {ALL_AGENTS.filter(a => !ACTIVE_AGENTS.includes(a)).map((a) => (<div key={a.initials} className="opacity-30"><AgentAvatar agent={a} size="sm" /></div>))}
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-end justify-between gap-4 mb-3">
              <div><div className="text-xl font-bold text-white">${totalCost.toFixed(2)}</div><div className="text-[10px] text-zinc-500">total spent</div></div>
              <div className="text-right"><div className="text-lg font-bold text-orange-400">${avgCost.toFixed(2)}</div><div className="text-[10px] text-zinc-500">avg/cycle</div></div>
            </div>
            <svg viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none" className="w-full h-6"><path d={sparkPath} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
          </div>
        </div>
      </div>
    </main>
  );
}

// =================== LAYOUT B: SIDE NAV ===================

type SideSection = "dashboard" | "live" | "team" | "finance";

const SIDE_SECTIONS: { id: SideSection; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "live", label: "Live", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { id: "team", label: "Team", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "finance", label: "Finance", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

function SideNavLayout({ stars, liveMetrics }: { stars: number | null; liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const [section, setSection] = useState<SideSection>("dashboard");
  const [navHovered, setNavHovered] = useState(false);
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;
  const pageViews = liveMetrics?.pageViews ?? 336;

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Floating side nav — neo-brutalist */}
      <div
        className="fixed left-3 top-1/2 -translate-y-1/2 z-50"
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => setNavHovered(false)}
      >
        <motion.nav
          animate={{ width: navHovered ? 170 : 48 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="bg-zinc-950 border border-white/[0.1] shadow-xl shadow-black/50 overflow-hidden flex flex-col"
        >
          {/* Logo */}
          <div className="px-2.5 py-2.5 border-b border-white/[0.08] flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Image src="/logo-ac.png" alt="AC" width={24} height={18} className="opacity-80" />
            </div>
            <motion.span animate={{ opacity: navHovered ? 1 : 0 }} transition={{ duration: 0.1 }} className="text-[11px] font-bold text-white whitespace-nowrap">
              C{cycleCount} <span className="text-zinc-600 font-normal">&middot; running</span>
            </motion.span>
          </div>

          {/* Sections */}
          {SIDE_SECTIONS.map((item) => {
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 transition-all overflow-hidden border-b border-white/[0.04] ${
                  isActive ? "bg-orange-500/10 text-orange-400 border-l-2 border-l-orange-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                </div>
                <motion.span animate={{ opacity: navHovered ? 1 : 0 }} transition={{ duration: 0.1 }} className="text-xs font-medium whitespace-nowrap">{item.label}</motion.span>
              </button>
            );
          })}

          {/* GitHub */}
          <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3 py-2.5 text-zinc-600 hover:text-zinc-300 transition-colors overflow-hidden">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            </div>
            <motion.span animate={{ opacity: navHovered ? 1 : 0 }} transition={{ duration: 0.1 }} className="text-xs whitespace-nowrap">{stars !== null ? `${stars}★` : "GitHub"}</motion.span>
          </a>
        </motion.nav>
      </div>

      {/* Content */}
      <div className="flex-1 ml-14 p-6">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* DASHBOARD */}
            {section === "dashboard" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Cycles", value: String(cycleCount), accent: true },
                    { label: "Agents Active", value: `${ACTIVE_AGENTS.length}/14` },
                    { label: "Total Spend", value: `$${totalCost.toFixed(2)}` },
                    { label: "Page Views", value: pageViews.toLocaleString(), accent: true },
                  ].map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{m.label}</div>
                      <div className={`text-2xl font-bold tabular-nums ${"accent" in m && m.accent ? "text-orange-400" : "text-white"}`}>{m.value}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Cycle</span>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Running</div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">Cycle {cycleCount}</div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">Distribution pivot — kill SEO/blog, focus README + awesome-lists.</p>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" /></div>
                  </div>
                  <div className="glass-card p-4">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent</span>
                    <div className="mt-3 space-y-2.5">
                      {ACTIVITY_FEED.slice(0, 3).map((msg, i) => (
                        <div key={i} className="flex gap-2">
                          <AgentAvatar agent={msg.agent} size="sm" />
                          <div className="flex-1 min-w-0"><span className="text-xs font-semibold text-white">{msg.agent.initials}</span> <span className="text-xs text-zinc-500">{msg.msg.slice(0, 80)}...</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <TerminalView compact />
              </div>
            )}

            {/* LIVE */}
            {section === "live" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-card">
                  <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Activity Feed</span>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE</div>
                  </div>
                  <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
                    {ACTIVITY_FEED.map((msg, i) => (
                      <div key={i} className={`px-4 py-3 flex gap-2.5 ${msg.highlight ? "bg-orange-500/[0.03] border-l-2 border-orange-500/30" : ""}`}>
                        <AgentAvatar agent={msg.agent} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5"><span className="text-xs font-semibold text-white">{msg.agent.name}</span><span className="text-[10px] text-zinc-700 ml-auto">{msg.time}</span></div>
                          <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{msg.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <TerminalView />
                  <div className="glass-card">
                    <div className="px-4 py-3 border-b border-white/[0.05]"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deployments</span></div>
                    <div className="divide-y divide-white/[0.03]">
                      {DEPLOY_HISTORY.slice(0, 5).map((d) => (
                        <div key={d.id} className="px-4 py-2.5 flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${d.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                          <span className="text-xs text-zinc-500 flex-1 truncate">{d.commit}</span>
                          <span className="text-[10px] text-zinc-700 tabular-nums">{d.duration}</span>
                          <span className="text-[10px] text-zinc-700">{d.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM */}
            {section === "team" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {ALL_AGENTS.map((a, i) => {
                    const isActive = ACTIVE_AGENTS.includes(a);
                    const actions: Record<string, string> = { CEO: "Distribution pivot decision", ENG: "4 commits pushed", DVP: "Deploy #47 success", RES: "Awesome-list scan", CRIT: "Revenue warning", CFO: "Unit economics update", MKT: "README funnel analysis", UI: "Dashboard rebuild", QA: "Smoke test passed" };
                    return (
                      <motion.div key={a.initials} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`glass-card p-3.5 flex gap-2.5 ${!isActive ? "opacity-35" : ""}`}>
                        <div className="relative"><AgentAvatar agent={a} />{isActive && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white">{a.name}</div>
                          <div className="text-[10px] text-zinc-600">{a.role}</div>
                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{isActive ? (actions[a.initials] || "Active") : "Idle"}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="glass-card">
                  <div className="px-4 py-3 border-b border-white/[0.05]"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decisions</span></div>
                  <div className="divide-y divide-white/[0.03]">
                    {DECISIONS.map((d) => (
                      <div key={d.cycle} className={`px-4 py-3 flex gap-3 ${d.status === "active" ? "bg-orange-500/[0.03] border-l-2 border-orange-500/30" : ""}`}>
                        <span className={`text-xs font-mono font-bold w-6 flex-shrink-0 ${d.status === "active" ? "text-orange-400" : "text-zinc-600"}`}>{d.cycle}</span>
                        <p className={`text-xs flex-1 ${d.status === "active" ? "text-white" : "text-zinc-500"}`}>{d.decision}</p>
                        <div className="flex -space-x-1">{d.agents.map((a) => (<div key={a} className={`w-4 h-4 rounded bg-gradient-to-br ${AGENTS[a].gradient} flex items-center justify-center text-[6px] text-white font-bold ring-1 ring-black`}>{AGENTS[a].initials}</div>))}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FINANCE */}
            {section === "finance" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Spend", value: `$${totalCost.toFixed(2)}`, sub: `${CYCLE_HISTORY.length} cycles`, accent: false },
                    { label: "Avg / Cycle", value: `$${avgCost.toFixed(2)}`, sub: "trending stable", accent: true },
                    { label: "Revenue", value: "$0", sub: "pre-revenue", muted: true },
                  ].map((m) => (
                    <div key={m.label} className="glass-card p-4">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{m.label}</div>
                      <div className={`text-2xl font-bold tabular-nums ${"muted" in m ? "text-zinc-600" : "accent" in m && m.accent ? "text-orange-400" : "text-white"}`}>{m.value}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{m.sub}</div>
                    </div>
                  ))}
                </div>
                {/* Cost bars */}
                <div className="glass-card p-4">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Cost per cycle</div>
                  <div className="flex items-end gap-1 h-28">
                    {CYCLE_HISTORY.slice(0, 14).reverse().map((c, i) => {
                      const max = Math.max(...CYCLE_HISTORY.slice(0, 14).map(x => x.cost));
                      return (
                        <motion.div key={c.num} initial={{ height: 0 }} animate={{ height: `${(c.cost / max) * 100}%` }} transition={{ delay: i * 0.03, duration: 0.4 }} className="flex-1 bg-gradient-to-t from-orange-500/60 to-orange-400/20 rounded-t-sm relative group cursor-default">
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-zinc-900 border border-white/10 rounded text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">${c.cost.toFixed(2)}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                {/* Cycle history */}
                <div className="glass-card">
                  <div className="px-4 py-3 border-b border-white/[0.05]"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cycle History</span></div>
                  <div className="divide-y divide-white/[0.03] max-h-[300px] overflow-y-auto">
                    {CYCLE_HISTORY.map((c) => (
                      <div key={c.num} className={`px-4 py-2.5 flex items-center gap-3 ${c.phase === "current" ? "bg-orange-500/[0.04]" : ""}`}>
                        <span className={`text-xs font-mono w-6 flex-shrink-0 ${c.phase === "current" ? "text-orange-400 font-bold" : "text-zinc-600"}`}>C{c.num}</span>
                        <span className={`text-xs flex-1 ${c.phase === "current" ? "text-white" : "text-zinc-500"}`}>{c.what}</span>
                        <span className={`text-xs tabular-nums ${c.phase === "current" ? "text-orange-400" : "text-zinc-700"}`}>${c.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <TerminalView compact />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// =================== LAYOUT C: COMPACT ===================

function CompactLayout({ stars, liveMetrics }: { stars: number | null; liveMetrics: ReturnType<typeof useLiveMetrics> }) {
  const cycleCount = liveMetrics?.cyclesCompleted ?? 48;
  const totalCost = liveMetrics?.totalCost ?? 81.42;
  const avgCost = liveMetrics?.avgCostPerCycle ?? 1.70;
  const pageViews = liveMetrics?.pageViews ?? 336;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Compact header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-ac.png" alt="AC" width={22} height={16} className="opacity-90" />
          <span className="text-white font-bold text-sm">auto-co</span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />C{cycleCount}</div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-zinc-600 tabular-nums">${totalCost.toFixed(2)}</span>
          <span className="text-xs text-zinc-700">&middot;</span>
          <span className="text-xs text-zinc-600 tabular-nums">${avgCost.toFixed(2)}/cy</span>
          <span className="text-xs text-zinc-700">&middot;</span>
          <span className="text-xs text-zinc-600 tabular-nums">{pageViews} views</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {ACTIVE_AGENTS.slice(0, 7).map((a) => (<div key={a.initials} className={`w-5 h-5 rounded bg-gradient-to-br ${a.gradient} flex items-center justify-center text-[6px] text-white font-bold ring-1 ring-black`}>{a.initials}</div>))}
            <div className="w-5 h-5 rounded bg-white/[0.06] flex items-center justify-center text-[7px] text-zinc-500 font-bold ring-1 ring-black">+{ACTIVE_AGENTS.length - 7}</div>
          </div>
          <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-zinc-300">{stars !== null ? `${stars}★` : "GH"}</a>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        <div className="col-span-12 lg:col-span-5">
          <div className="glass-card">
            <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Activity</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />LIVE</div>
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[420px] overflow-y-auto">
              {ACTIVITY_FEED.map((msg, i) => (
                <div key={i} className={`px-4 py-2.5 flex gap-2 ${msg.highlight ? "bg-orange-500/[0.03] border-l-2 border-orange-500/30" : ""}`}>
                  <AgentAvatar agent={msg.agent} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5"><span className="text-[11px] font-semibold text-white">{msg.agent.initials}</span><span className="text-[10px] text-zinc-700 ml-auto">{msg.time}</span></div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">{msg.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card">
            <div className="px-4 py-2.5 border-b border-white/[0.05]"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decisions</span></div>
            <div className="divide-y divide-white/[0.03] max-h-[200px] overflow-y-auto">
              {DECISIONS.slice(0, 6).map((d) => (
                <div key={d.cycle} className={`px-4 py-2 flex gap-2 ${d.status === "active" ? "bg-orange-500/[0.03]" : ""}`}>
                  <span className={`text-[10px] font-mono font-bold w-5 flex-shrink-0 ${d.status === "active" ? "text-orange-400" : "text-zinc-600"}`}>{d.cycle}</span>
                  <p className={`text-[11px] ${d.status === "active" ? "text-white" : "text-zinc-500"}`}>{d.decision}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card">
            <div className="px-4 py-2.5 border-b border-white/[0.05]"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deploys</span></div>
            <div className="divide-y divide-white/[0.03]">
              {DEPLOY_HISTORY.slice(0, 5).map((d) => (
                <div key={d.id} className="px-4 py-2 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${d.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="text-[11px] text-zinc-500 flex-1 truncate">{d.commit}</span>
                  <span className="text-[10px] text-zinc-700">{d.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-3">
          <div className="glass-card">
            <div className="px-4 py-2.5 border-b border-white/[0.05]"><span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cycles</span></div>
            <div className="p-2 space-y-0 max-h-[420px] overflow-y-auto">
              {CYCLE_HISTORY.map((c) => (
                <div key={c.num} className={`flex items-center gap-2 px-2 py-1.5 rounded ${c.phase === "current" ? "bg-orange-500/[0.06]" : ""}`}>
                  <span className={`text-[10px] font-mono w-5 flex-shrink-0 ${c.phase === "current" ? "text-orange-400 font-bold" : "text-zinc-600"}`}>C{c.num}</span>
                  <span className={`text-[11px] flex-1 truncate ${c.phase === "current" ? "text-white" : "text-zinc-500"}`}>{c.what}</span>
                  <span className={`text-[10px] tabular-nums ${c.phase === "current" ? "text-orange-400" : "text-zinc-700"}`}>${c.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TerminalView compact />
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
        <LayoutHeader active={layout} onChange={setLayout} />

        <AnimatePresence mode="wait">
          <motion.div key={layout} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {layout === "classic" && <ClassicLayout stars={stars} liveMetrics={liveMetrics} />}
            {layout === "sidenav" && <SideNavLayout stars={stars} liveMetrics={liveMetrics} />}
            {layout === "compact" && <CompactLayout stars={stars} liveMetrics={liveMetrics} />}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className={`relative ${layout === "sidenav" ? "ml-16" : ""}`}>
          <div className={`glass-card px-6 py-6 mx-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${layout === "compact" ? "max-w-6xl mx-auto" : layout === "classic" ? "max-w-[1400px] mx-auto" : ""}`}>
            <div>
              <div className="text-base font-bold text-white mb-1">Want this for your company?</div>
              <div className="text-sm text-zinc-500">auto-co is open source. Self-host free, or get the hosted version.</div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-[3px] transition-all">View on GitHub</a>
              <Link href="/#waitlist" className="text-sm bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-[3px] transition-colors">Get started</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
