export default function GitHubPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">GitHub</h2>
        <p className="text-sm text-slate-400 mt-0.5">Repository activity and deployment status</p>
      </div>

      {/* Repo stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Stars" value="10" />
        <StatCard label="Forks" value="1" />
        <StatCard label="Cloners" value="74" />
        <StatCard label="Open PRs" value="4" />
        <StatCard label="Open Issues" value="0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent commits */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Recent Commits</h3>
          <div className="space-y-3">
            {COMMITS.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 mt-1.5 ${i === 0 ? "bg-accent" : "bg-slate-300"}`} />
                  {i < COMMITS.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-3 min-w-0">
                  <div className="text-sm text-slate-700 truncate">{c.msg}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-400">{c.hash}</span>
                    <span className="text-[10px] text-slate-400">{c.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deploy status */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Deployments</h3>
          <div className="space-y-3">
            {DEPLOYS.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className={`w-2 h-2 flex-shrink-0 ${
                  d.status === "live" ? "bg-green-500" : d.status === "building" ? "bg-amber-400 animate-pulse" : "bg-slate-300"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-700">{d.service}</div>
                  <div className="text-[10px] text-slate-400">{d.url}</div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 ${
                  d.status === "live" ? "bg-green-50 text-green-600" : d.status === "building" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open PRs */}
      <div className="border border-slate-200 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Open Pull Requests</h3>
        <div className="space-y-2">
          {PRS.map((pr, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
              <span className={`w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold ${
                pr.status === "open" ? "bg-accent/10 text-accent" : "bg-green-50 text-green-600"
              }`}>
                {pr.status === "open" ? "PR" : "OK"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-700 truncate">{pr.title}</div>
                <div className="text-[10px] text-slate-400">{pr.repo} #{pr.number}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] text-slate-400">{pr.reviews} reviews</div>
                <div className="text-[10px] text-slate-400">{pr.comments} comments</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 flex-shrink-0 ${
                pr.status === "open" ? "bg-accent/10 text-accent" : "bg-green-50 text-green-600"
              }`}>
                {pr.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 p-4 text-center">
      <div className="text-xl font-bold font-mono text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}

const COMMITS = [
  { msg: "cycle 103: visual startup banner + publish npm v1.1.1", hash: "d87b8f3", time: "2h ago" },
  { msg: "cycle 103: update consensus -- npm v1.1.1 published", hash: "3fd87e4", time: "2h ago" },
  { msg: "cycle 102: improve create-auto-co onboarding UX", hash: "dac7972", time: "5h ago" },
  { msg: "cycle 101: draft awesome-claude-code issue form", hash: "a441095", time: "8h ago" },
  { msg: "cycle 100: sharpen README differentiation", hash: "4134cf2", time: "12h ago" },
  { msg: "cycle 99: add admin panel with waitlist viewer", hash: "b2e1a03", time: "1d ago" },
];

const DEPLOYS = [
  { service: "Landing Page", url: "runautoco.com", status: "live" },
  { service: "Demo Dashboard", url: "runautoco.com/demo", status: "live" },
  { service: "Blog", url: "runautoco.com/blog", status: "live" },
  { service: "Pricing", url: "runautoco.com/pricing", status: "live" },
  { service: "Admin", url: "runautoco.com/admin", status: "live" },
  { service: "npm Package", url: "npmjs.com/package/create-auto-co", status: "live" },
];

const PRS = [
  { title: "Add auto-co to awesome-claude-skills", repo: "ComposioHQ/awesome-claude-skills", number: 335, status: "open", reviews: 0, comments: 0 },
  { title: "Add auto-co to awesome-ai-agents", repo: "e2b-dev/awesome-ai-agents", number: 395, status: "open", reviews: 0, comments: 0 },
  { title: "Add auto-co to awesome-ai-tools", repo: "mahseema/awesome-ai-tools", number: 732, status: "open", reviews: 0, comments: 0 },
  { title: "Add auto-co to awesome-llm-agents", repo: "kaushikb11/awesome-llm-agents", number: 88, status: "open", reviews: 0, comments: 0 },
];
