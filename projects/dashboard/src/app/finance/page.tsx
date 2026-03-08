export default function FinancePage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Finance</h2>
        <p className="text-sm text-slate-400 mt-0.5">Cost tracking and financial overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Spend</div>
          <div className="text-2xl font-bold font-mono text-slate-900">$195.20</div>
          <div className="text-[10px] text-slate-400 mt-1">104 cycles</div>
        </div>
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Avg / Cycle</div>
          <div className="text-2xl font-bold font-mono text-slate-900">$1.88</div>
          <div className="text-[10px] text-slate-400 mt-1">-$0.04 vs last 10</div>
        </div>
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Infra / Month</div>
          <div className="text-2xl font-bold font-mono text-slate-900">$5.00</div>
          <div className="text-[10px] text-slate-400 mt-1">Railway hosting</div>
        </div>
        <div className="border border-slate-200 p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Revenue</div>
          <div className="text-2xl font-bold font-mono text-accent">$0</div>
          <div className="text-[10px] text-slate-400 mt-1">Pre-revenue</div>
        </div>
      </div>

      {/* Cost per cycle chart */}
      <div className="border border-slate-200 p-5 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Cost Per Cycle</h3>
        <div className="flex items-end gap-[3px] h-40">
          {CYCLE_COSTS.map((cost, i) => (
            <div
              key={i}
              className="flex-1 bg-accent/20 hover:bg-accent/40 transition-colors relative group"
              style={{ height: `${(cost / 3.5) * 100}%` }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                ${cost.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
          <span>C65</span>
          <span>C75</span>
          <span>C85</span>
          <span>C95</span>
          <span>C104</span>
        </div>
      </div>

      {/* Cumulative spend */}
      <div className="border border-slate-200 p-5 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Cumulative Spend</h3>
        <div className="relative h-32">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              points={CUMULATIVE_POINTS}
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={CUMULATIVE_POINTS}
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
            <span>$50</span>
            <span>$100</span>
            <span>$150</span>
            <span>$195</span>
          </div>
        </div>
      </div>

      {/* Projected monthly */}
      <div className="border border-slate-200 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Monthly Projection</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-[10px] text-slate-400 mb-1">At current rate (4 cycles/day)</div>
            <div className="text-lg font-bold font-mono text-slate-900">$225/mo</div>
            <div className="text-[10px] text-slate-400">Claude Code cycles</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Infrastructure</div>
            <div className="text-lg font-bold font-mono text-slate-900">$5/mo</div>
            <div className="text-[10px] text-slate-400">Railway hosting</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">Total projected</div>
            <div className="text-lg font-bold font-mono text-accent">$230/mo</div>
            <div className="text-[10px] text-slate-400">All-in operating cost</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CYCLE_COSTS = [
  1.65, 2.10, 1.80, 1.92, 2.30, 1.55, 1.70, 2.15, 1.88, 1.60,
  2.05, 1.75, 1.90, 2.20, 1.85, 1.68, 2.00, 1.72, 1.95, 1.80,
  2.10, 1.55, 1.85, 2.25, 1.70, 1.90, 2.05, 1.65, 1.88, 1.75,
  2.15, 1.80, 1.92, 1.60, 2.00, 1.85, 1.70, 2.10, 1.90, 1.80,
];

// Generate cumulative spend points for the SVG
const CUMULATIVE_POINTS = (() => {
  let sum = 80; // starting from cycle 65
  const pts: string[] = [];
  CYCLE_COSTS.forEach((c, i) => {
    sum += c;
    const x = (i / (CYCLE_COSTS.length - 1)) * 400;
    const y = 120 - (sum / 200) * 120;
    pts.push(`${x},${y}`);
  });
  // Close the area fill
  return pts.join(" ") + ` 400,120 0,120`;
})();
