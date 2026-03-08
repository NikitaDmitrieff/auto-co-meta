import state from "@/data";

const ARTIFACT_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  file:   { bg: "bg-slate-100", text: "text-slate-600" },
  commit: { bg: "bg-blue-50",   text: "text-blue-600" },
  deploy: { bg: "bg-green-50",  text: "text-green-600" },
  pr:     { bg: "bg-purple-50", text: "text-purple-600" },
};

function agentShortName(createdBy: string): string {
  const parts = createdBy.split("-");
  return (parts.length > 1 ? parts.slice(1).join("-") : createdBy).toUpperCase();
}

export default function GitHubPage() {
  const { metrics, git, deployments, distribution, artifacts, traffic } = state;

  const artifactsByType = artifacts.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  const sortedArtifacts = [...artifacts].sort((a, b) => b.cycle - a.cycle);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">GitHub</h2>
        <p className="text-sm text-slate-400 mt-0.5">Repository activity and deployment status</p>
      </div>

      {/* Repo stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Stars" value={String(metrics.stars)} />
        <StatCard label="Forks" value={String(metrics.forks)} />
        <StatCard label="Cloners" value={String(metrics.cloners)} />
        <StatCard label="Open PRs" value={String(git.openPRs.length)} />
        <StatCard label="Open Issues" value={String(metrics.openIssues)} />
      </div>

      {/* Traffic */}
      {traffic && (traffic.views.total > 0 || traffic.clones.total > 0) && (
        <div className="border border-slate-200 p-5 mb-8">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Traffic (last 14 days)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">{traffic.views.total}</div>
              <div className="text-[10px] text-slate-400">Views</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">{traffic.views.unique}</div>
              <div className="text-[10px] text-slate-400">Unique visitors</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">{traffic.clones.total}</div>
              <div className="text-[10px] text-slate-400">Clones</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">{traffic.clones.unique}</div>
              <div className="text-[10px] text-slate-400">Unique cloners</div>
            </div>
          </div>
          {traffic.daily.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-400 mb-2">Daily breakdown</div>
              <div className="space-y-1">
                {traffic.daily.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-400 w-20">{d.date.slice(5)}</span>
                    <span className="text-slate-600 w-24">{d.views} views ({d.uniqueViews})</span>
                    <span className="text-slate-600 w-28">{d.clones} clones ({d.uniqueClones})</span>
                    <div className="flex-1 flex gap-1 items-center">
                      <div className="bg-blue-300 h-2" style={{ width: `${Math.min(d.views * 2, 100)}%` }} />
                      <div className="bg-emerald-300 h-2" style={{ width: `${Math.min(d.clones, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent commits */}
        <div className="border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Recent Commits</h3>
          <div className="space-y-3">
            {git.commits.slice(0, 10).map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 mt-1.5 ${i === 0 ? "bg-accent" : "bg-slate-300"}`} />
                  {i < Math.min(git.commits.length, 10) - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-3 min-w-0">
                  <div className="text-sm text-slate-700 truncate">{c.msg}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-400">{c.hash}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(c.date)}</span>
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
            {deployments.map((d, i) => (
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

      {/* Artifacts */}
      {artifacts.length > 0 && (
        <div className="border border-slate-200 p-5 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Artifacts</h3>

          {/* Summary stats */}
          <div className="flex gap-4 mb-4 pb-4 border-b border-slate-100">
            {["file", "commit", "deploy", "pr"].map((type) => {
              const count = artifactsByType[type] || 0;
              if (count === 0) return null;
              const style = ARTIFACT_TYPE_STYLES[type] || ARTIFACT_TYPE_STYLES.file;
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 ${style.bg} ${style.text}`}>
                    {type.toUpperCase()}
                  </span>
                  <span className="text-sm font-mono font-semibold text-slate-700">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Artifact list */}
          <div className="space-y-2">
            {sortedArtifacts.map((a, i) => {
              const style = ARTIFACT_TYPE_STYLES[a.type] || ARTIFACT_TYPE_STYLES.file;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 flex-shrink-0 ${style.bg} ${style.text}`}>
                    {a.type.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-700 truncate">{a.path || a.ref}</div>
                    {a.ref && a.path && a.ref !== a.path && (
                      <div className="text-[10px] text-slate-400 font-mono truncate">{a.ref}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{agentShortName(a.createdBy)}</span>
                  <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">C{a.cycle}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open PRs / Distribution */}
      <div className="border border-slate-200 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          {git.openPRs.length > 0 ? "Open Pull Requests" : "Distribution PRs"}
        </h3>
        <div className="space-y-2">
          {git.openPRs.length > 0 ? (
            git.openPRs.map((pr, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <span className="w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold bg-accent/10 text-accent">
                  PR
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 truncate">{pr.title}</div>
                  <div className="text-[10px] text-slate-400">#{pr.number}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-accent/10 text-accent">
                  {pr.status}
                </span>
              </div>
            ))
          ) : (
            distribution.filter(d => d.status.includes("PR")).map((d, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <span className="w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold bg-accent/10 text-accent">
                  PR
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 truncate">{d.channel}</div>
                  <div className="text-[10px] text-slate-400">{d.url}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 text-amber-600">
                  {d.status}
                </span>
              </div>
            ))
          )}
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

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}
