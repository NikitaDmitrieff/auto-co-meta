import state from "@/data";

export default function FinancePage() {
  const { cycle, metrics, cycleHistory, metricsHistory } = state;
  const totalCost = metrics.totalCost;
  const avgCost = metrics.avgCostPerCycle;

  // Use ALL cycle costs (no more capping at 40)
  const cycleCosts = cycleHistory.map((c) => c.cost);
  const maxCost = Math.max(...cycleCosts, 1);

  // Cumulative points for SVG from real data
  const cumulativePoints = (() => {
    if (cycleHistory.length === 0) return "0,120 400,120";
    const maxTotal = cycleHistory[cycleHistory.length - 1].totalCost || totalCost;
    const pts: string[] = [];
    cycleHistory.forEach((c, i) => {
      const x = (i / (cycleHistory.length - 1 || 1)) * 400;
      const y = 120 - ((c.totalCost || 0) / (maxTotal * 1.1)) * 120;
      pts.push(`${x},${y}`);
    });
    return pts.join(" ") + " 400,120 0,120";
  })();

  // Model breakdown
  const modelCounts: Record<string, { count: number; cost: number }> = {};
  cycleHistory.forEach((c) => {
    const m = c.model || "unknown";
    if (!modelCounts[m]) modelCounts[m] = { count: 0, cost: 0 };
    modelCounts[m].count++;
    modelCounts[m].cost += c.cost;
  });

  const cyclesPerMonth = 4 * 30;
  const projectedCycles = avgCost * cyclesPerMonth;
  const infraCost = 7;
  const projectedTotal = projectedCycles + infraCost;

  const successRate = cycleHistory.length
    ? Math.round((cycleHistory.filter((c) => c.status === "ok").length / cycleHistory.length) * 100)
    : 0;

  // Daily cost aggregates from cycle history
  const dailyCosts: Record<string, { cycles: number; cost: number; date: string }> = {};
  cycleHistory.forEach((c) => {
    const day = c.timestamp.slice(0, 10);
    if (!dailyCosts[day]) dailyCosts[day] = { cycles: 0, cost: 0, date: day };
    dailyCosts[day].cycles++;
    dailyCosts[day].cost += c.cost;
  });
  const dailyRows = Object.values(dailyCosts).sort((a, b) => b.date.localeCompare(a.date));

  // Metrics over time from metrics.jsonl
  const hasMetrics = metricsHistory.length > 0;
  const latestMetrics = hasMetrics ? metricsHistory[metricsHistory.length - 1] : null;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Finance</h2>
        <p className="text-sm text-slate-400 mt-0.5">Cost tracking, metrics, and financial overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Spend</div>
          <div className="text-2xl font-bold font-mono text-slate-900">${totalCost.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{cycleHistory.length} cycles tracked</div>
        </div>
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avg / Cycle</div>
          <div className="text-2xl font-bold font-mono text-slate-900">${avgCost.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{successRate}% success rate</div>
        </div>
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Infra / Month</div>
          <div className="text-2xl font-bold font-mono text-slate-900">${infraCost.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Railway hosting (2 services)</div>
        </div>
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Revenue</div>
          <div className="text-2xl font-bold font-mono text-accent">{metrics.revenue}</div>
          <div className="text-[10px] text-slate-400 mt-1">Pre-revenue</div>
        </div>
      </div>

      {/* Cost per cycle chart — ALL cycles */}
      <div className="border border-slate-200 p-5 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Cost Per Cycle ({cycleHistory.length} total)
        </h3>
        {cycleHistory.length > 0 ? (
          <>
            <div className="flex items-end gap-[2px] h-40">
              {cycleCosts.map((cost, i) => (
                <div
                  key={cycleHistory[i].cycle}
                  className={`flex-1 min-w-[2px] transition-colors relative group ${
                    cycleHistory[i].status === "ok"
                      ? "bg-accent/20 hover:bg-accent/40"
                      : "bg-red-200 hover:bg-red-300"
                  }`}
                  style={{ height: `${(cost / maxCost) * 100}%` }}
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    C{cycleHistory[i].cycle} ${cost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
              <span>C{cycleHistory[0].cycle}</span>
              <span>C{cycleHistory[Math.floor(cycleHistory.length / 2)]?.cycle}</span>
              <span>C{cycleHistory[cycleHistory.length - 1].cycle}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-400 text-center py-10">No cycle history data available</div>
        )}
      </div>

      {/* Cumulative spend */}
      <div className="border border-slate-200 p-5 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Cumulative Spend</h3>
        <div className="relative h-32">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              points={cumulativePoints}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={cumulativePoints}
              fill="url(#grad)"
              stroke="none"
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>$0</span>
            <span>${Math.round(totalCost * 0.25)}</span>
            <span>${Math.round(totalCost * 0.5)}</span>
            <span>${Math.round(totalCost * 0.75)}</span>
            <span>${Math.round(totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Two-column: Model breakdown + Monthly projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Model breakdown */}
        {Object.keys(modelCounts).length > 0 && (
          <div className="border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Cost by Model</h3>
            <div className="space-y-3">
              {Object.entries(modelCounts)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([model, data]) => {
                  const pct = totalCost > 0 ? (data.cost / totalCost) * 100 : 0;
                  return (
                    <div key={model}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono font-semibold text-slate-900">{model}</span>
                        <span className="text-xs font-mono text-slate-500">
                          ${data.cost.toFixed(2)} ({data.count} cycles)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2">
                        <div className="bg-accent/40 h-2" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ${(data.cost / data.count).toFixed(2)}/cycle avg
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Projected monthly */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Monthly Projection</h3>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-slate-400 mb-1">Claude Code cycles (4/day)</div>
              <div className="text-lg font-bold font-mono text-slate-900">${Math.round(projectedCycles)}/mo</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 mb-1">Infrastructure</div>
              <div className="text-lg font-bold font-mono text-slate-900">${infraCost}/mo</div>
              <div className="text-[10px] text-slate-400">Railway (2 services)</div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 mb-1">Total projected</div>
              <div className="text-lg font-bold font-mono text-accent">${Math.round(projectedTotal)}/mo</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 mb-1">Break-even</div>
              <div className="text-sm font-mono text-slate-600">
                {Math.ceil(projectedTotal / 24.5)} starter plans or {Math.ceil(projectedTotal / 49)} pro plans
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics over time */}
      {hasMetrics && (
        <div className="border border-slate-200 p-5 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Metrics Snapshots ({metricsHistory.length} entries)
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-slate-400">Stars</div>
              <div className="text-lg font-bold font-mono text-slate-900">{latestMetrics?.githubStars ?? 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Signups</div>
              <div className="text-lg font-bold font-mono text-slate-900">{latestMetrics?.signups ?? 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Revenue</div>
              <div className="text-lg font-bold font-mono text-accent">${latestMetrics?.revenue ?? 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Total Cost</div>
              <div className="text-lg font-bold font-mono text-slate-900">${latestMetrics?.costTotal ?? 0}</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Date</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Cycle</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Stars</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Signups</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Revenue</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Cost</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...metricsHistory].reverse().map((m, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-1.5 px-2 font-mono text-slate-600">{m.date}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-right">#{m.cycle}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-right">{m.githubStars}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-right">{m.signups}</td>
                    <td className="py-1.5 px-2 font-mono text-accent text-right">${m.revenue}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-right">${m.costCycle.toFixed(2)}</td>
                    <td className="py-1.5 px-2 font-mono text-slate-600 text-right">${m.costTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily cost breakdown */}
      {dailyRows.length > 0 && (
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Daily Cost Breakdown ({dailyRows.length} days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Date</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Cycles</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Cost</th>
                  <th className="text-right py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold">Avg/Cycle</th>
                  <th className="text-left py-2 px-2 text-[10px] text-slate-400 uppercase font-semibold w-40">Bar</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row) => {
                  const maxDailyCost = Math.max(...dailyRows.map((r) => r.cost), 1);
                  const pct = (row.cost / maxDailyCost) * 100;
                  return (
                    <tr key={row.date} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono text-slate-600">{row.date}</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600 text-right">{row.cycles}</td>
                      <td className="py-1.5 px-2 font-mono text-slate-900 font-semibold text-right">
                        ${row.cost.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-slate-500 text-right">
                        ${(row.cost / row.cycles).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="w-full bg-slate-100 h-2">
                          <div className="bg-accent/30 h-2" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
