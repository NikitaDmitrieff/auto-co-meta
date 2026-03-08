import state from "@/data";

export default function LivePage() {
  const { cycle, phase, generatedAt, cycleHistory, decisions, tasks, artifacts } = state;

  // Show most recent cycles first
  const entries = [...cycleHistory].reverse();

  // Group decisions by cycle for inline display
  const decisionsByCycle: Record<number, typeof decisions> = {};
  for (const d of decisions) {
    if (!decisionsByCycle[d.cycle]) decisionsByCycle[d.cycle] = [];
    decisionsByCycle[d.cycle].push(d);
  }

  // Group tasks by cycle
  const tasksByCycle: Record<number, typeof tasks> = {};
  for (const t of tasks) {
    if (!tasksByCycle[t.cycle]) tasksByCycle[t.cycle] = [];
    tasksByCycle[t.cycle].push(t);
  }

  // Group artifacts by cycle
  const artifactsByCycle: Record<number, typeof artifacts> = {};
  for (const a of artifacts) {
    if (!artifactsByCycle[a.cycle]) artifactsByCycle[a.cycle] = [];
    artifactsByCycle[a.cycle].push(a);
  }

  // All cycles that have any data (from cycleHistory or JSONL files)
  const allCycles = new Set([
    ...entries.map((e) => e.cycle),
    ...decisions.map((d) => d.cycle),
    ...tasks.map((t) => t.cycle),
    ...artifacts.map((a) => a.cycle),
  ]);
  const sortedCycles = Array.from(allCycles).sort((a, b) => b - a);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Live Activity</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Cycle history, decisions, tasks, and artifacts — {sortedCycles.length} cycles tracked
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Cycles" value={entries.length.toString()} />
        <StatCard
          label="Decisions"
          value={decisions.length.toString()}
        />
        <StatCard
          label="Tasks Done"
          value={tasks.filter((t) => t.status === "done").length.toString()}
        />
        <StatCard
          label="Artifacts"
          value={artifacts.length.toString()}
        />
      </div>

      {/* Timeline — grouped by cycle */}
      <div className="border border-slate-200">
        {sortedCycles.map((c) => {
          const cycleEntry = entries.find((e) => e.cycle === c);
          const cycleDecs = decisionsByCycle[c] || [];
          const cycleTasks = tasksByCycle[c] || [];
          const cycleArts = artifactsByCycle[c] || [];

          return (
            <div key={c} className="border-b border-slate-100 last:border-b-0">
              {/* Cycle header row */}
              <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    cycleEntry
                      ? cycleEntry.status === "success" ? "bg-green-500" : "bg-red-500"
                      : "bg-slate-300"
                  }`}
                />
                <span className="text-sm font-mono font-medium text-slate-700 w-16 flex-shrink-0">
                  #{c}
                </span>

                {cycleEntry && (
                  <>
                    <span className="text-xs text-slate-400 font-mono w-40 flex-shrink-0">
                      {formatTimestamp(cycleEntry.timestamp)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                        cycleEntry.model?.includes("opus")
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {cycleEntry.model || "unknown"}
                    </span>
                  </>
                )}

                {/* Inline counts */}
                <div className="flex items-center gap-3 flex-1">
                  {cycleDecs.length > 0 && (
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                      {cycleDecs.length} decision{cycleDecs.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {cycleTasks.length > 0 && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {cycleTasks.length} task{cycleTasks.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {cycleArts.length > 0 && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {cycleArts.length} artifact{cycleArts.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {cycleEntry && (
                  <>
                    <span className="text-xs text-slate-500 font-mono w-14 text-right flex-shrink-0">
                      {formatDuration(cycleEntry.duration)}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-700 w-16 text-right flex-shrink-0">
                      ${cycleEntry.cost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono w-20 text-right flex-shrink-0">
                      &Sigma; ${cycleEntry.totalCost.toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Expanded detail: decisions, tasks, artifacts */}
              {(cycleDecs.length > 0 || cycleTasks.length > 0 || cycleArts.length > 0) && (
                <div className="px-4 pb-3 pl-12 space-y-2">
                  {cycleDecs.map((d, i) => (
                    <div key={`d-${i}`} className="flex items-start gap-2">
                      <span className="text-[10px] text-orange-500 font-mono mt-0.5 w-6 flex-shrink-0">DEC</span>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-700">{d.decision}</div>
                        <div className="text-[10px] text-slate-400">
                          {d.agent} &middot; {Math.round(d.confidence * 100)}% confidence &middot;{" "}
                          <span className={d.outcome === "success" ? "text-green-600" : d.outcome === "pending" ? "text-amber-600" : "text-red-600"}>
                            {d.outcome}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cycleTasks.map((t, i) => (
                    <div key={`t-${i}`} className="flex items-start gap-2">
                      <span className="text-[10px] text-blue-500 font-mono mt-0.5 w-6 flex-shrink-0">TSK</span>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-700">{t.description}</div>
                        <div className="text-[10px] text-slate-400">
                          {t.owner} &middot;{" "}
                          <span className={t.status === "done" ? "text-green-600" : t.status === "doing" ? "text-blue-600" : "text-slate-500"}>
                            {t.status}
                          </span>
                          {" "}&middot; {t.priority}
                        </div>
                      </div>
                    </div>
                  ))}

                  {cycleArts.map((a, i) => (
                    <div key={`a-${i}`} className="flex items-start gap-2">
                      <span className="text-[10px] text-emerald-500 font-mono mt-0.5 w-6 flex-shrink-0">ART</span>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-700 font-mono truncate">{a.path}</div>
                        <div className="text-[10px] text-slate-400">
                          {a.createdBy} &middot; {a.type}
                          {a.ref ? ` · ${a.ref}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {sortedCycles.length === 0 && (
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
  if (!seconds) return "\u2014";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
