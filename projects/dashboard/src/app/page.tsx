export default function DashboardPage() {
  return (
    <div className="max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Overview of your autonomous AI company</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard label="Current Cycle" value="#104" accent />
        <StatusCard label="Phase" value="Building" />
        <StatusCard label="Agents Active" value="4 / 14" />
        <StatusCard label="Uptime" value="72h 14m" />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Cost" value="$195.20" sub="+$1.80 last cycle" />
        <MetricCard label="Avg Cost/Cycle" value="$1.88" sub="104 cycles" />
        <MetricCard label="GitHub Stars" value="10" sub="+2 this week" />
        <MetricCard label="Cloners" value="74" sub="unique" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Recent Agent Activity</h3>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                  a.active ? "bg-accent/10 text-accent" : "bg-slate-100 text-slate-400"
                }`}>
                  {a.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-slate-700 truncate">{a.action}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current state */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Current State</h3>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Next Action</div>
              <div className="text-sm text-slate-700">Improve README first-impression + polish --doctor output</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Last Cycle Output</div>
              <div className="text-sm text-slate-600">Visual startup banner added, npm v1.1.1 published</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Human Escalation</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400" />
                <span className="text-sm text-slate-600">3 pending items</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Active Services</div>
              <div className="flex gap-2 flex-wrap">
                {["Railway", "npm", "GitHub", "Supabase"].map((s) => (
                  <span key={s} className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost mini-chart */}
      <div className="mt-6 border border-slate-200 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Cost Per Cycle (Last 20)</h3>
        <div className="flex items-end gap-1 h-24">
          {COST_DATA.map((cost, i) => (
            <div
              key={i}
              className="flex-1 bg-accent/20 hover:bg-accent/40 transition-colors relative group"
              style={{ height: `${(cost / 3.5) * 100}%` }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100">
                ${cost.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-400 font-mono">C85</span>
          <span className="text-[10px] text-slate-400 font-mono">C104</span>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-slate-200 p-4">
      <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono ${accent ? "text-accent" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-slate-200 p-4">
      <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-900 font-mono">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

const RECENT_ACTIVITY = [
  { initials: "CEO", action: "Set cycle 104 priority: README improvement", time: "2m ago", active: true },
  { initials: "DHH", action: "Published npm v1.1.1 with CLI improvements", time: "18m ago", active: true },
  { initials: "QA", action: "Verified startup banner renders correctly", time: "22m ago", active: true },
  { initials: "DOps", action: "Railway deployment healthy, all routes 200", time: "25m ago", active: false },
  { initials: "MKT", action: "Reddit post content drafted for r/ClaudeAI", time: "1h ago", active: false },
  { initials: "CFO", action: "Updated cost tracking: $195.20 total spend", time: "1h ago", active: false },
];

const COST_DATA = [
  1.92, 2.10, 1.75, 1.60, 2.30, 1.85, 1.70, 2.15, 1.90, 1.55,
  2.05, 1.80, 1.95, 2.20, 1.65, 1.88, 2.00, 1.72, 1.80, 1.90,
];
