export default function LivePage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Live Feed</h2>
        <p className="text-sm text-slate-400 mt-0.5">Real-time log output from the auto-loop</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 mb-4 border border-slate-200 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">Connected</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">Cycle #104</span>
        <span className="text-xs text-slate-400 font-mono">PID 48291</span>
        <div className="flex-1" />
        <span className="text-xs text-slate-400">Auto-scroll enabled</span>
      </div>

      {/* Log feed */}
      <div className="border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 h-[calc(100vh-220px)] overflow-y-auto">
        {LOG_LINES.map((line, i) => (
          <div key={i} className="flex gap-3 hover:bg-white/[0.03]">
            <span className="text-slate-600 flex-shrink-0 select-none w-16">{line.ts}</span>
            <span className={`flex-shrink-0 w-12 ${levelColor(line.level)}`}>{line.level}</span>
            <span className={`${line.highlight ? "text-orange-400" : "text-slate-300"}`}>{line.msg}</span>
          </div>
        ))}
        <div className="flex gap-3 mt-1">
          <span className="text-slate-600 flex-shrink-0 w-16">11:42:18</span>
          <span className="text-green-400 flex-shrink-0 w-12">INFO</span>
          <span className="text-slate-300">Waiting for next cycle...</span>
          <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1" />
        </div>
      </div>
    </div>
  );
}

function levelColor(level: string): string {
  switch (level) {
    case "START": return "text-orange-400";
    case "END": return "text-orange-400";
    case "INFO": return "text-green-400";
    case "AGENT": return "text-blue-400";
    case "TOOL": return "text-purple-400";
    case "WARN": return "text-amber-400";
    case "ERROR": return "text-red-400";
    case "COST": return "text-emerald-400";
    default: return "text-slate-400";
  }
}

const LOG_LINES = [
  { ts: "11:38:01", level: "START", msg: "=== Cycle #104 ===", highlight: true },
  { ts: "11:38:01", level: "INFO", msg: "Reading consensus.md..." },
  { ts: "11:38:02", level: "INFO", msg: "Phase: Product Improvement -- onboarding UX" },
  { ts: "11:38:02", level: "INFO", msg: "Next action: Improve README first-impression" },
  { ts: "11:38:03", level: "AGENT", msg: "[ceo-bezos] Reviewing cycle priorities" },
  { ts: "11:38:05", level: "AGENT", msg: "[fullstack-dhh] Reading README.md" },
  { ts: "11:38:08", level: "TOOL", msg: "Read /README.md (148 lines)" },
  { ts: "11:38:10", level: "AGENT", msg: "[fullstack-dhh] Analyzing first-impression clarity" },
  { ts: "11:38:15", level: "TOOL", msg: "Read /auto-loop.sh (89 lines)" },
  { ts: "11:38:18", level: "AGENT", msg: "[fullstack-dhh] Reviewing --doctor output format" },
  { ts: "11:38:22", level: "AGENT", msg: "[qa-bach] Checking startup banner rendering" },
  { ts: "11:38:25", level: "TOOL", msg: "Bash: ./auto-loop.sh --doctor" },
  { ts: "11:38:28", level: "INFO", msg: "--doctor output: all checks passing" },
  { ts: "11:38:30", level: "AGENT", msg: "[product-norman] Evaluating onboarding UX flow" },
  { ts: "11:38:35", level: "TOOL", msg: "Edit /README.md (lines 22-27)" },
  { ts: "11:38:38", level: "INFO", msg: "README value prop tightened" },
  { ts: "11:38:40", level: "TOOL", msg: "Edit /auto-loop.sh (lines 45-52)" },
  { ts: "11:38:42", level: "INFO", msg: "--doctor output now shows colored status indicators" },
  { ts: "11:38:44", level: "AGENT", msg: "[ceo-bezos] Updating consensus with cycle results" },
  { ts: "11:38:46", level: "TOOL", msg: "Write /memories/consensus.md" },
  { ts: "11:38:48", level: "COST", msg: "Cycle cost: $1.90 | Running total: $197.10" },
  { ts: "11:38:48", level: "END", msg: "=== Cycle #104 complete (47s) ===", highlight: true },
  { ts: "11:38:48", level: "INFO", msg: "Sleeping 600s until next cycle..." },
];
