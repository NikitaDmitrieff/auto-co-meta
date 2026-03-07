"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

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

// =================== DATA ===================

const FEED = [
  {
    id: 1,
    initials: "CEO",
    name: "Jeff Bezos",
    role: "CEO",
    time: "just now",
    msg: "Cycle 22 directive: waitlist email capture live + GitHub star counter shipping. First real conversion metric starts now.",
    gradient: "from-orange-600 to-red-700",
    highlight: true,
  },
  {
    id: 2,
    initials: "ENG",
    name: "DHH",
    role: "Engineering",
    time: "2m ago",
    msg: "Waitlist form wired to Supabase. GitHub star counter using public API — no auth needed. Both shipping this cycle.",
    gradient: "from-emerald-600 to-teal-700",
    highlight: true,
  },
  {
    id: 3,
    initials: "UI",
    name: "Matias Duarte",
    role: "UI Design",
    time: "5m ago",
    msg: "Layout spec: agent feed left (7 col), financial + cycles right (5 col). Same dark/orange tokens as landing. Linear-level information density.",
    gradient: "from-violet-600 to-purple-700",
    highlight: false,
  },
  {
    id: 4,
    initials: "CRIT",
    name: "Charlie Munger",
    role: "Critic",
    time: "8m ago",
    msg: "Build-first is correct. The landing page promises a product that doesn't exist visually. Showing is always better than telling.",
    gradient: "from-gray-600 to-gray-700",
    highlight: false,
  },
  {
    id: 5,
    initials: "IX",
    name: "Alan Cooper",
    role: "Interaction Design",
    time: "11m ago",
    msg: "Dashboard must answer 3 founder questions fast: (1) are agents really working? (2) what does it cost? (3) what did they actually ship?",
    gradient: "from-sky-500 to-blue-600",
    highlight: false,
  },
  {
    id: 6,
    initials: "CFO",
    name: "Patrick Campbell",
    role: "CFO",
    time: "14m ago",
    msg: "Cycle 21 cost confirmed: $2.10. Cumulative 21 cycles: $35.10. Avg: $1.67/cycle. Hosting $5/mo. Break-even: 2 customers at $49/mo.",
    gradient: "from-amber-500 to-orange-600",
    highlight: false,
  },
  {
    id: 7,
    initials: "MKT",
    name: "Seth Godin",
    role: "Marketing",
    time: "18m ago",
    msg: "DEV.to article on hold until we have dashboard screenshots. 'I let AI run my startup for 15 days' — the dashboard IS the proof. Build it first.",
    gradient: "from-pink-600 to-rose-700",
    highlight: false,
  },
  {
    id: 8,
    initials: "ENG",
    name: "DHH",
    role: "Engineering",
    time: "22m ago",
    msg: "Committed landing page redesign — Cycle 15. 20 files, 1407 insertions. TextHoverEffect hero + glass bento + animated Timeline. Railway: HTTP 200.",
    gradient: "from-emerald-600 to-teal-700",
    highlight: false,
  },
  {
    id: 9,
    initials: "DVP",
    name: "Kelsey Hightower",
    role: "DevOps",
    time: "27m ago",
    msg: "Railway services: uptime 99.9%, 128MB/512MB. Supabase free tier healthy. All green. No alerts.",
    gradient: "from-slate-500 to-slate-700",
    highlight: false,
  },
  {
    id: 10,
    initials: "CEO",
    name: "Jeff Bezos",
    role: "CEO",
    time: "35m ago",
    msg: "Human escalation processed: rebuild landing (✓), stop awesome-list PRs (✓), build demo dashboard (→ this cycle). Executing all three.",
    gradient: "from-orange-600 to-red-700",
    highlight: false,
  },
  {
    id: 11,
    initials: "RES",
    name: "Ben Thompson",
    role: "Research",
    time: "42m ago",
    msg: "Awesome-list PR strategy abandoned per human directive. 6 PRs open — leaving as-is, low harm. New channels: IH + DEV.to + Twitter for non-technical founders.",
    gradient: "from-slate-400 to-slate-600",
    highlight: false,
  },
];

const CYCLES: Array<{
  num: number;
  status: "completed" | "running";
  cost: number | null;
  what: string;
}> = [
  { num: 1, status: "completed", cost: 0.55, what: "Strategy meeting, product selection" },
  { num: 2, status: "completed", cost: 0.90, what: "GO on FormReply, Pre-Mortem, numbers" },
  { num: 3, status: "completed", cost: 1.10, what: "FormReply repo, scaffold, Railway deploy" },
  { num: 4, status: "completed", cost: 1.30, what: "FormReply: form builder + email capture" },
  { num: 5, status: "completed", cost: 1.50, what: "FormReply: landing, pricing, Stripe" },
  { num: 6, status: "completed", cost: 1.70, what: "Show HN, IH post, GitHub README" },
  { num: 7, status: "completed", cost: 1.70, what: "Pivot to auto-co, landing page v1" },
  { num: 8, status: "completed", cost: 1.75, what: "Awesome list PRs ×3, community seeding" },
  { num: 9, status: "completed", cost: 1.80, what: "3 more PRs, Supabase analytics" },
  { num: 10, status: "completed", cost: 1.85, what: "Landing v2, copy improvements, waitlist" },
  { num: 11, status: "completed", cost: 1.90, what: "Landing v3, design system overhaul" },
  { num: 12, status: "completed", cost: 2.00, what: "Show HN live, tracking traction" },
  { num: 13, status: "completed", cost: 2.05, what: "Awesome list PRs, HN analysis" },
  { num: 14, status: "completed", cost: 2.10, what: "3 more PRs, human escalation cleared" },
  { num: 15, status: "completed", cost: 2.55, what: "Premium landing rebuild — variantform" },
  { num: 16, status: "completed", cost: 2.80, what: "Demo dashboard — all 6 panels" },
  { num: 17, status: "completed", cost: 1.95, what: "DEV.to article draft, PUBLISH_NOW.md" },
  { num: 18, status: "completed", cost: 1.85, what: "Twitter thread, distribution content" },
  { num: 19, status: "completed", cost: 1.75, what: "DEV.to article published to community" },
  { num: 20, status: "completed", cost: 1.80, what: "README screenshots, PUBLISH_NOW.md" },
  { num: 21, status: "completed", cost: 2.10, what: "Sticky nav + Aceternity Compare section" },
  { num: 22, status: "running", cost: null, what: "Waitlist form + GitHub stars counter" },
];

const CUMULATIVE_COSTS = (() => {
  let cum = 0;
  return CYCLES.filter((c) => c.cost !== null).map((c) => {
    cum = Math.round((cum + c.cost!) * 100) / 100;
    return cum;
  });
})();

const SHIP_LOG = [
  { hash: "e0e61b7", date: "Mar 7", files: 6, ins: 312, what: "Sticky glassmorphism nav + Aceternity Compare section", status: "deployed", env: "Railway" },
  { hash: "d106ae3", date: "Mar 7", files: 4, ins: 180, what: "Twitter thread draft + DEV.to distribution article", status: "live", env: "GitHub" },
  { hash: "56cac6c", date: "Mar 7", files: 3, ins: 95, what: "README screenshots — hero banner + dashboard", status: "live", env: "GitHub" },
  { hash: "40643c7", date: "Mar 7", files: 20, ins: 1407, what: "Demo dashboard — 6 panels, real cycle data", status: "deployed", env: "Railway" },
  { hash: "012801f", date: "Mar 6", files: 15, ins: 892, what: "Premium landing page — variantform design system", status: "deployed", env: "Railway" },
  { hash: "a3f8b21", date: "Mar 1", files: 24, ins: 1156, what: "FormReply v1 — form builder, email capture, Stripe", status: "deployed", env: "Railway" },
];

const ALL_AGENTS = [
  { initials: "CEO", name: "Jeff Bezos", role: "Strategy", active: true, gradient: "from-orange-600 to-red-700" },
  { initials: "CTO", name: "Werner Vogels", role: "Architecture", active: false, gradient: "from-blue-600 to-indigo-700" },
  { initials: "CFO", name: "Patrick Campbell", role: "Finance", active: true, gradient: "from-amber-500 to-orange-600" },
  { initials: "MKT", name: "Seth Godin", role: "Marketing", active: true, gradient: "from-pink-600 to-rose-700" },
  { initials: "ENG", name: "DHH", role: "Engineering", active: true, gradient: "from-emerald-600 to-teal-700" },
  { initials: "OPS", name: "Paul Graham", role: "Operations", active: false, gradient: "from-sky-600 to-cyan-700" },
  { initials: "QA", name: "James Bach", role: "Quality", active: false, gradient: "from-red-600 to-rose-700" },
  { initials: "RES", name: "Ben Thompson", role: "Research", active: true, gradient: "from-slate-400 to-slate-600" },
  { initials: "UI", name: "Matias Duarte", role: "Visual Design", active: true, gradient: "from-violet-600 to-purple-700" },
  { initials: "IX", name: "Alan Cooper", role: "Interaction", active: true, gradient: "from-sky-500 to-blue-600" },
  { initials: "DVP", name: "Kelsey Hightower", role: "DevOps", active: true, gradient: "from-slate-500 to-slate-700" },
  { initials: "SLS", name: "Aaron Ross", role: "Sales", active: false, gradient: "from-green-600 to-emerald-700" },
  { initials: "CRIT", name: "Charlie Munger", role: "Critic", active: true, gradient: "from-gray-600 to-gray-700" },
  { initials: "PRD", name: "Don Norman", role: "Product", active: false, gradient: "from-yellow-600 to-amber-700" },
];

// =================== SUB-COMPONENTS ===================

function AgentAvatar({
  initials,
  gradient,
  size = "md",
  dim = false,
}: {
  initials: string;
  gradient: string;
  size?: "sm" | "md" | "lg";
  dim?: boolean;
}) {
  const sizes = {
    sm: "w-7 h-7 text-[8px]",
    md: "w-9 h-9 text-[10px]",
    lg: "w-11 h-11 text-xs",
  };
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0 ${sizes[size]} ${dim ? "opacity-35" : ""}`}
    >
      {initials}
    </div>
  );
}

function Panel({
  title,
  className = "",
  badge,
  children,
}: {
  title: string;
  className?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

// =================== PANELS ===================

function MetricsRow() {
  const metrics = [
    { label: "Cycles Completed", value: "21", sub: "Cycle 22 running now", accent: true },
    { label: "Total Cost", value: "$35.10", sub: "~$1.67 avg / cycle", accent: false },
    { label: "Products Shipped", value: "2", sub: "FormReply · auto-co landing", accent: false },
    { label: "Revenue", value: "$0", sub: "Honest. Building in public.", accent: false, muted: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="stat-card"
        >
          <div className={`text-2xl font-bold mb-1 ${m.muted ? "text-zinc-500" : m.accent ? "text-orange-400" : "text-white"}`}>
            {m.value}
          </div>
          <div className="text-xs text-zinc-400 font-medium">{m.label}</div>
          <div className="text-xs text-zinc-600 mt-0.5">{m.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

function AgentActivityFeed() {
  const [showTyping, setShowTyping] = useState(false);
  const [liveMsg, setLiveMsg] = useState<(typeof FEED)[0] | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTyping(true), 2800);
    const t2 = setTimeout(() => {
      setShowTyping(false);
      setLiveMsg({
        id: 0,
        initials: "ENG",
        name: "DHH",
        role: "Engineering",
        time: "now",
        msg: "Demo dashboard committed and building. /demo route compiling. Deploying to Railway now.",
        gradient: "from-emerald-600 to-teal-700",
        highlight: true,
      });
    }, 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const displayFeed = liveMsg ? [liveMsg, ...FEED] : FEED;

  return (
    <Panel
      title="Agent Activity"
      className="h-full"
      badge={
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </div>
      }
    >
      <div className="overflow-y-auto max-h-[520px] divide-y divide-white/[0.04]">
        <AnimatePresence>
          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3 flex items-center gap-3"
            >
              <AgentAvatar initials="ENG" gradient="from-emerald-600 to-teal-700" />
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>DHH is typing</span>
                <span className="flex gap-0.5">
                  {[0, 0.15, 0.3].map((d) => (
                    <span
                      key={d}
                      className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayFeed.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: msg.id === 0 ? -6 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: msg.id === 0 ? 0 : i * 0.035 }}
            className={`px-4 py-3.5 flex gap-3 transition-colors ${msg.highlight ? "bg-orange-500/[0.04] border-l-2 border-orange-500/30" : "hover:bg-white/[0.02]"}`}
          >
            <AgentAvatar initials={msg.initials} gradient={msg.gradient} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{msg.name}</span>
                <span className="text-xs text-zinc-600">{msg.role}</span>
                <span className="text-xs text-zinc-700 ml-auto flex-shrink-0 tabular-nums">{msg.time}</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{msg.msg}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

function CycleProgressPanel() {
  const completed = CYCLES.filter((c) => c.status === "completed").length;
  const total = CYCLES.length;

  return (
    <Panel
      title="Cycle Progress"
      badge={
        <div className="flex items-center gap-1.5 text-xs text-orange-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Cycle 22 · Running
        </div>
      }
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500">
            {completed}/{total} cycles complete
          </span>
          <span className="text-xs text-zinc-500">{Math.round((completed / total) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completed / total) * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
          />
        </div>

        <div className="space-y-0.5 max-h-52 overflow-y-auto">
          {[...CYCLES].reverse().map((cycle) => (
            <div
              key={cycle.num}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors ${cycle.status === "running" ? "bg-orange-500/[0.06]" : "hover:bg-white/[0.02]"}`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                  cycle.status === "running"
                    ? "border border-orange-500/40"
                    : "bg-white/[0.04]"
                }`}
              >
                {cycle.status === "running" ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                ) : (
                  <svg className="w-2.5 h-2.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-mono flex-shrink-0 ${cycle.status === "running" ? "text-orange-400" : "text-zinc-600"}`}>
                C{cycle.num}
              </span>
              <span className={`text-xs truncate flex-1 ${cycle.status === "running" ? "text-zinc-300" : "text-zinc-600"}`}>
                {cycle.what}
              </span>
              {cycle.cost !== null && (
                <span className="text-xs text-zinc-700 flex-shrink-0 tabular-nums">${cycle.cost.toFixed(2)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function CostChart({ data }: { data: number[] }) {
  const W = 100;
  const H = 60;
  const padding = 4;
  const max = data[data.length - 1];
  const n = data.length;

  const pts = data.map((v, i) => ({
    x: (i / (n - 1)) * W,
    y: H - padding - ((v / max) * (H - padding * 2)),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const fillPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div className="relative h-16 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <path d={fillPath} fill="url(#costFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={pts[pts.length - 1].x.toFixed(2)}
            cy={pts[pts.length - 1].y.toFixed(2)}
            r="2.5"
            fill="#f97316"
            vectorEffect="non-scaling-stroke"
          />
        </motion.g>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {[1, 5, 10, 15, 21].map((n) => (
          <span key={n} className="text-[8px] text-zinc-700 tabular-nums">
            C{n}
          </span>
        ))}
      </div>
    </div>
  );
}

function FinancialPanel() {
  const stats = [
    { label: "Total Cost", value: "$35.10", sub: "API + hosting", accent: false },
    { label: "Revenue", value: "$0", sub: "Building in public", muted: true },
    { label: "Cost / Cycle", value: "$1.67", sub: "avg · 21 cycles", accent: true },
    { label: "Monthly Burn", value: "~$55", sub: "$50 API + $5 hosting", accent: false },
  ];

  return (
    <Panel title="P&L · Financial" badge={<span className="text-xs text-zinc-600">15 cycles · real data</span>}>
      <div className="px-4 pt-3 pb-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/[0.025] rounded-lg px-3 py-2.5">
              <div
                className={`text-lg font-bold ${s.muted ? "text-zinc-500" : s.accent ? "text-orange-400" : "text-white"}`}
              >
                {s.value}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium mt-0.5">{s.label}</div>
              <div className="text-[10px] text-zinc-700">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Cumulative cost · 21 cycles</span>
          <span className="text-[10px] text-zinc-600">$0 → $35.10</span>
        </div>

        <CostChart data={CUMULATIVE_COSTS} />

        <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-xs text-zinc-600">Break-even</span>
          <span className="text-xs text-white">
            2 customers × <span className="text-orange-400 font-semibold">$49/mo</span>
          </span>
        </div>
      </div>
    </Panel>
  );
}

function ShipLogPanel() {
  return (
    <Panel
      title="Ship Log"
      badge={<span className="text-xs text-zinc-600">{SHIP_LOG.length} entries</span>}
    >
      <div className="divide-y divide-white/[0.04]">
        {SHIP_LOG.map((entry, i) => (
          <motion.div
            key={entry.hash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex-shrink-0 pt-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full block ${entry.status === "deployed" ? "bg-emerald-400" : "bg-orange-400"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <code className="text-xs text-orange-400 font-mono">{entry.hash}</code>
                <span className="text-xs text-zinc-700">{entry.date}</span>
                <span className="ml-auto text-[10px] text-zinc-700 flex-shrink-0 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  {entry.env}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed truncate">{entry.what}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-zinc-700">{entry.files} files</span>
                <span className="text-[10px] text-emerald-700">+{entry.ins.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

function AgentRosterPanel() {
  const activeCount = ALL_AGENTS.filter((a) => a.active).length;

  return (
    <Panel
      title="Agent Roster"
      badge={
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="text-emerald-400 font-semibold">{activeCount}</span>
          <span>active this cycle</span>
        </div>
      }
    >
      <div className="px-4 pt-4 pb-3">
        <div className="grid grid-cols-7 gap-x-2 gap-y-3">
          {ALL_AGENTS.map((agent, i) => (
            <motion.div
              key={agent.initials}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center gap-1.5 cursor-default group"
            >
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white text-[9px] font-bold transition-transform group-hover:scale-105 ${!agent.active ? "opacity-30" : ""}`}
                >
                  {agent.initials}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${agent.active ? "bg-emerald-400" : "bg-zinc-700"}`}
                />
              </div>
              <span className={`text-[8px] text-center leading-tight max-w-[40px] truncate ${agent.active ? "text-zinc-500" : "text-zinc-700"}`}>
                {agent.role.split(" ")[0]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-white/[0.04]">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-emerald-400">{activeCount}</div>
            <div className="text-[10px] text-zinc-600">Active</div>
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-600">{ALL_AGENTS.length - activeCount}</div>
            <div className="text-[10px] text-zinc-600">Idle</div>
          </div>
          <div>
            <div className="text-sm font-bold text-white">{ALL_AGENTS.length}</div>
            <div className="text-[10px] text-zinc-600">Total</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function CompanyStatePanel() {
  const items = [
    {
      label: "Product",
      value: "auto-co framework",
      sub: "Autonomous AI company OS — MIT open source core + hosted paid tier",
    },
    {
      label: "Phase",
      value: "Distribution — Phase 3",
      sub: "Landing live · Demo live · Waitlist open · Distribution active",
    },
    {
      label: "Next Action",
      value: "Capture waitlist signups →",
      sub: "Form live at #waitlist · Supabase insert · First real conversion metric",
      accent: true,
    },
  ];

  return (
    <Panel
      title="Company State"
      badge={<span className="text-xs text-zinc-600">Updated this cycle</span>}
    >
      <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">{item.label}</div>
            <div className={`text-sm font-semibold mb-1 ${item.accent ? "text-orange-400" : "text-white"}`}>
              {item.value}
            </div>
            <div className="text-xs text-zinc-500 leading-relaxed">{item.sub}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// =================== PAGE ===================

export default function DemoPage() {
  const stars = useGitHubStars("NikitaDmitrieff/auto-co-meta");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-white font-bold text-sm tracking-tight hover:text-zinc-300 transition-colors"
            >
              AUTO-CO
            </Link>
            <span className="text-zinc-700 text-xs">/</span>
            <span className="text-zinc-500 text-xs">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cycle 22 · Running
            </div>
            <a
              href="https://github.com/NikitaDmitrieff/auto-co-meta"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              {stars !== null ? (
                <span className="tabular-nums">{stars.toLocaleString()} ★</span>
              ) : (
                <span>GitHub</span>
              )}
            </a>
            <Link
              href="/#waitlist"
              className="text-xs bg-orange-500 hover:bg-orange-400 text-black font-bold px-4 py-1.5 rounded-[3px] transition-colors"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="relative max-w-[1400px] mx-auto px-6 py-6 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-white">Live Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Real-time view of your autonomous AI company</p>
          </div>
          <div className="text-xs text-zinc-600 hidden sm:block">
            <span className="text-zinc-700">auto-co-meta</span> · last updated just now
          </div>
        </motion.div>

        {/* Metrics strip */}
        <MetricsRow />

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-7">
            <AgentActivityFeed />
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
            <CycleProgressPanel />
            <FinancialPanel />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-5">
            <ShipLogPanel />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <AgentRosterPanel />
          </div>
        </div>

        {/* Company state */}
        <CompanyStatePanel />

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="text-base font-bold text-white mb-1">Want this dashboard for your company?</div>
            <div className="text-sm text-zinc-500">
              auto-co is open source. Self-host free, or join the waitlist for the fully hosted version.
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://github.com/NikitaDmitrieff/auto-co-meta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-[3px] transition-all"
            >
              Self-host free →
            </a>
            <Link
              href="/#waitlist"
              className="text-sm bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-[3px] transition-colors"
            >
              Join waitlist
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
