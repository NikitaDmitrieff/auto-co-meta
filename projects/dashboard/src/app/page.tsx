import state from "@/data";

export default function DashboardPage() {
  const { cycle, phase, metrics, nextAction, whatWeDid, pendingEscalation, deployments, decisions, artifacts, traffic, cycleHistory } = state;
  const avgCost = metrics.avgCostPerCycle;

  // Build cost sparkline points from cycle history
  const sparklinePoints = (() => {
    if (cycleHistory.length < 2) return null;
    const costs = cycleHistory.map((c) => c.cost);
    const max = Math.max(...costs, 0.1);
    const w = 80;
    const h = 24;
    return costs
      .map((cost, i) => {
        const x = (i / (costs.length - 1)) * w;
        const y = h - (cost / (max * 1.1)) * h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  })();

  return (
    <div className="max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Overview of your autonomous AI company</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard label="Current Cycle" value={`#${cycle}`} accent />
        <StatusCard label="Phase" value={phase} />
        <StatusCard label="Deployed Services" value={String(deployments.length)} />
        <StatusCard label="Open PRs" value={String(state.git.openPRs.length)} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Total Cost</div>
          <div className="flex items-end gap-3">
            <div className="text-lg font-bold text-slate-900 font-mono">${metrics.totalCost.toFixed(2)}</div>
            {sparklinePoints && (
              <svg width="80" height="24" className="flex-shrink-0 mb-0.5">
                <polyline
                  points={sparklinePoints}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{cycle} cycles</div>
        </div>
        <MetricCard label="Avg Cost/Cycle" value={`$${avgCost.toFixed(2)}`} sub={`across ${cycle} cycles`} />
        <MetricCard label="GitHub Stars" value={String(metrics.stars)} sub={`${metrics.forks} forks`} />
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Traffic (14d)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">{traffic.views.total}</span>
            <span className="text-[10px] text-slate-400">views</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-slate-500 font-mono">{traffic.clones.unique} cloners</span>
            <span className="text-[10px] text-slate-400">&middot;</span>
            <span className="text-[10px] text-slate-500 font-mono">{traffic.views.unique} unique</span>
          </div>
        </div>
      </div>

      {/* Next Action banner */}
      <div className="border-l-2 border-l-orange-500 bg-orange-500/5 p-4 mb-6">
        <div className="text-[10px] text-orange-600 uppercase tracking-wide font-semibold mb-1">Next Action</div>
        <div className="text-sm text-slate-700">{nextAction}</div>
      </div>

      {/* Traffic sparkline row (if we have daily data) */}
      {traffic.daily.length > 1 && (
        <div className="border border-slate-200 p-5 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Daily Traffic</h3>
          <TrafficChart daily={traffic.daily} />
        </div>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Activity */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">GitHub Activity</h3>

          {/* Open PRs */}
          {state.git.openPRs.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Open Pull Requests</div>
              <div className="space-y-2 mb-4">
                {state.git.openPRs.map((pr, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                    <span className="w-6 h-6 flex items-center justify-center text-[9px] font-mono font-bold bg-accent/10 text-accent flex-shrink-0">
                      #{pr.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-700 truncate">{pr.title}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-accent/10 text-accent flex-shrink-0">
                      {pr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Commits */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Recent Commits</div>
            <div className="space-y-3">
              {state.git.commits.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                    i === 0 ? "bg-accent/10 text-accent" : "bg-slate-100 text-slate-400"
                  }`}>
                    {c.hash.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-700 truncate">{c.msg}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.hash} &middot; {formatDate(c.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current state */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Current State</h3>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Last Cycle Output</div>
              <div className="space-y-1">
                {whatWeDid.map((item, i) => (
                  <div key={i} className="text-sm text-slate-600 truncate">&bull; {item}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Human Escalation</div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${pendingEscalation ? "bg-amber-400" : "bg-green-500"}`} />
                <span className="text-sm text-slate-600">
                  {pendingEscalation ? "Pending request" : "No pending requests"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Active Services</div>
              <div className="flex gap-2 flex-wrap">
                {deployments.filter(d => d.status === "live").map((d) => (
                  <span key={d.service} className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5">{d.service}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Decisions */}
        {decisions.length > 0 && (
          <div className="border border-slate-200 p-5 lg:col-span-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Recent Decisions</h3>
            <div className="space-y-3">
              {decisions.slice(-3).reverse().map((d, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="w-7 h-7 flex items-center justify-center text-[10px] font-bold font-mono bg-accent/10 text-accent flex-shrink-0 uppercase">
                    {agentShortName(d.agent)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-700 line-clamp-2">{d.decision}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">cycle {d.cycle}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500">
                      {Math.round(d.confidence * 100)}%
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 ${
                      d.outcome === "success" ? "bg-green-50 text-green-600" :
                      d.outcome === "failed" ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {d.outcome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Artifacts */}
      {artifacts.length > 0 && (
        <div className="mt-6 border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Recent Artifacts</h3>
          <div className="space-y-2">
            {artifacts.slice(-5).reverse().map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 uppercase flex-shrink-0 ${
                  a.type === "commit" ? "bg-accent/10 text-accent" :
                  a.type === "deploy" ? "bg-green-50 text-green-600" :
                  a.type === "pr" ? "bg-purple-50 text-purple-600" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {a.type}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-700 truncate font-mono">{a.path || a.ref}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 uppercase">
                  {agentShortName(a.createdBy)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                  c{a.cycle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution tracker */}
      {state.distribution.length > 0 && (
        <div className="mt-6 border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Distribution Channels</h3>
          <div className="space-y-2">
            {state.distribution.map((d, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                <span className={`w-2 h-2 flex-shrink-0 ${d.status.includes("LIVE") ? "bg-green-500" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700">{d.channel}</div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 ${
                  d.status.includes("LIVE") ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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

function TrafficChart({ daily }: { daily: Array<{ date: string; views: number; clones: number }> }) {
  const maxVal = Math.max(...daily.map((d) => Math.max(d.views, d.clones)), 1);
  const w = 400;
  const h = 60;

  const viewPoints = daily
    .map((d, i) => {
      const x = (i / (daily.length - 1 || 1)) * w;
      const y = h - (d.views / (maxVal * 1.1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const clonePoints = daily
    .map((d, i) => {
      const x = (i / (daily.length - 1 || 1)) * w;
      const y = h - (d.clones / (maxVal * 1.1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
        <polyline points={viewPoints} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={clonePoints} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 3" />
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-orange-500" />
          <span className="text-[10px] text-slate-500">Views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-400" style={{ borderTop: "2px dashed" }} />
          <span className="text-[10px] text-slate-500">Clones</span>
        </div>
        <div className="ml-auto text-[10px] text-slate-400 font-mono">
          {daily[0]?.date} — {daily[daily.length - 1]?.date}
        </div>
      </div>
    </div>
  );
}

function agentShortName(agent: string): string {
  const parts = agent.split("-");
  return parts.length > 1 ? parts.slice(1).join("-").toUpperCase() : agent.toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}
