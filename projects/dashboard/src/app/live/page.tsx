import state from "@/data";

export default function LivePage() {
  const { cycle, phase, generatedAt, cycleHistory } = state;

  // Show most recent cycles first
  const entries = [...cycleHistory].reverse();

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Live Activity</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Real cycle history from auto-loop — {entries.length} cycles recorded
        </p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 mb-6 border border-slate-200 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">Current</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">Cycle #{cycle}</span>
        <span className="text-xs text-slate-400 font-mono">{phase}</span>
        <div className="flex-1" />
        <span className="text-xs text-slate-400">
          Updated {new Date(generatedAt).toLocaleString()}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Cycles"
          value={entries.length.toString()}
        />
        <StatCard
          label="Success Rate"
          value={`${entries.length > 0 ? Math.round((entries.filter(e => e.status === "success").length / entries.length) * 100) : 0}%`}
        />
        <StatCard
          label="Avg Duration"
          value={`${entries.length > 0 ? Math.round(entries.reduce((s, e) => s + e.duration, 0) / entries.length / 60) : 0}m`}
        />
        <StatCard
          label="Avg Cost"
          value={`$${entries.length > 0 ? (entries.reduce((s, e) => s + e.cost, 0) / entries.length).toFixed(2) : "0"}`}
        />
      </div>

      {/* Timeline */}
      <div className="border border-slate-200 divide-y divide-slate-100">
        {entries.map((entry) => (
          <div key={entry.cycle} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
            {/* Status indicator */}
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                entry.status === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />

            {/* Cycle number */}
            <span className="text-sm font-mono font-medium text-slate-700 w-16 flex-shrink-0">
              #{entry.cycle}
            </span>

            {/* Timestamp */}
            <span className="text-xs text-slate-400 font-mono w-40 flex-shrink-0">
              {formatTimestamp(entry.timestamp)}
            </span>

            {/* Model badge */}
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                entry.model?.includes("opus")
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {entry.model || "unknown"}
            </span>

            <div className="flex-1" />

            {/* Duration */}
            <span className="text-xs text-slate-500 font-mono w-14 text-right flex-shrink-0">
              {formatDuration(entry.duration)}
            </span>

            {/* Cost */}
            <span className="text-xs font-mono font-medium text-slate-700 w-16 text-right flex-shrink-0">
              ${entry.cost.toFixed(2)}
            </span>

            {/* Running total */}
            <span className="text-[10px] text-slate-400 font-mono w-20 text-right flex-shrink-0">
              Σ ${entry.totalCost.toFixed(2)}
            </span>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No cycle history data yet. Run auto-loop to generate entries.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 px-4 py-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return ts;
  }
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
