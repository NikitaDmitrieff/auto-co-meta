import { getAllArtifacts, getArtifactsByAgent, getArtifactStats } from '@/lib/artifacts';
import { AGENT_ROSTER } from '@/lib/types';
import { StatCard } from '@/components/MetricChart';

export default function ArtifactsPage() {
  const artifacts = getAllArtifacts();
  const byAgent = getArtifactsByAgent();
  const stats = getArtifactStats();

  const agentDirs = Object.keys(AGENT_ROSTER);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-3 border-white bg-surface p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-fg opacity-50 tracking-widest mb-1">ARTIFACT BROWSER</div>
          <div className="text-xl font-extrabold text-accent-pink tracking-tight">
            FILE TREE
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-xs opacity-50">TOTAL FILES</div>
            <div className="text-2xl font-extrabold text-accent-green">{stats.total}</div>
          </div>
          <div>
            <div className="text-xs opacity-50">ROLES W/ OUTPUT</div>
            <div className="text-2xl font-extrabold text-accent-blue">{Object.keys(stats.byAgent).length}</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <StatCard
              key={type}
              label={type.toUpperCase()}
              value={count}
              color={type === 'md' ? '#00D4FF' : type === 'ts' ? '#00FF41' : '#FF0080'}
            />
          ))}
        </div>
      )}

      {/* File Tree */}
      <div className="border-3 border-white bg-surface">
        <div className="border-b-3 border-white px-4 py-2 flex items-center gap-2">
          <span className="text-accent-green text-xs font-bold">$</span>
          <span className="text-xs opacity-50 tracking-widest">DIRECTORY TREE</span>
          <span className="text-xs opacity-20 ml-2">// docs/ + projects/</span>
        </div>

        <div className="p-4">
          {artifacts.length === 0 ? (
            <div className="text-center py-12">
              <pre className="text-accent-pink text-xs mb-4 leading-relaxed inline-block">
{`
 docs/
 +-- ceo/          (empty)
 +-- cfo/          (empty)
 +-- critic/       (empty)
 +-- cto/          (empty)
 +-- devops/       (empty)
 +-- fullstack/    (empty)
 +-- interaction/  (empty)
 +-- marketing/    (empty)
 +-- operations/   (empty)
 +-- product/      (empty)
 +-- qa/           (empty)
 +-- research/     (empty)
 +-- sales/        (empty)
 +-- ui/           (empty)

 projects/         (empty)
`}
              </pre>
              <div className="text-xs opacity-30 mt-4">
                Artifacts will appear as agents produce documents
              </div>
              <div className="text-xs opacity-20 mt-1">
                Each agent stores outputs in docs/{'<role>'}/
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {/* docs/ tree */}
              <div className="text-sm font-bold text-accent-blue mb-2">
                <span className="opacity-50 mr-2">{'\u250C'}</span>
                docs/
              </div>

              {agentDirs.map((dir, dirIdx) => {
                const dirArtifacts = byAgent[dir] || [];
                const isLast = dirIdx === agentDirs.length - 1 && !byAgent['project'];
                const connector = isLast ? '\u2514' : '\u251C';
                const childConnector = isLast ? ' ' : '\u2502';
                const meta = AGENT_ROSTER[dir];

                return (
                  <div key={dir}>
                    <div className="flex items-center gap-2 text-xs hover:bg-surface-hover px-2 py-0.5">
                      <span className="opacity-30 w-4">{connector}</span>
                      <span className="opacity-30">{'\u2500\u2500'}</span>
                      <span className="font-bold" style={{ color: meta?.color || '#fff' }}>
                        {dir}/
                      </span>
                      <span className="opacity-30">
                        ({dirArtifacts.length} {dirArtifacts.length === 1 ? 'file' : 'files'})
                      </span>
                    </div>

                    {dirArtifacts.map((artifact, i) => {
                      const fileConnector = i === dirArtifacts.length - 1 ? '\u2514' : '\u251C';
                      const typeColors: Record<string, string> = {
                        md: '#00D4FF',
                        ts: '#00FF41',
                        tsx: '#00FF88',
                        json: '#FFE000',
                        yaml: '#FF0080',
                        other: '#888',
                      };

                      return (
                        <div
                          key={artifact.path}
                          className="flex items-center gap-2 text-xs hover:bg-surface-hover px-2 py-0.5 group"
                        >
                          <span className="opacity-30 w-4">{childConnector}</span>
                          <span className="opacity-20 w-4">{fileConnector}</span>
                          <span className="opacity-30">{'\u2500\u2500'}</span>
                          <span style={{ color: typeColors[artifact.type] || '#888' }}>
                            {artifact.name}
                          </span>
                          <span className="opacity-20 ml-auto flex items-center gap-4">
                            <span>{formatSize(artifact.size)}</span>
                            <span>{new Date(artifact.modifiedAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* projects/ tree */}
              {byAgent['project'] && byAgent['project'].length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-bold text-accent-green mb-2">
                    <span className="opacity-50 mr-2">{'\u250C'}</span>
                    projects/
                  </div>
                  {byAgent['project'].map((artifact, i) => {
                    const connector = i === byAgent['project'].length - 1 ? '\u2514' : '\u251C';
                    return (
                      <div
                        key={artifact.path}
                        className="flex items-center gap-2 text-xs hover:bg-surface-hover px-2 py-0.5"
                      >
                        <span className="opacity-30 w-4">{connector}</span>
                        <span className="opacity-30">{'\u2500\u2500'}</span>
                        <span className="text-accent-green">{artifact.relativePath}</span>
                        <span className="opacity-20 ml-auto">{formatSize(artifact.size)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Artifact Preview (for markdown files) */}
      {artifacts.filter(a => a.type === 'md').length > 0 && (
        <div className="border-3 border-white bg-surface p-4">
          <div className="text-xs text-fg opacity-50 tracking-widest mb-3">
            DOCUMENT PREVIEWS
            <span className="opacity-30 ml-2">// markdown files</span>
          </div>
          <div className="space-y-2">
            {artifacts.filter(a => a.type === 'md').map(artifact => (
              <details key={artifact.path} className="border border-white/20">
                <summary className="px-4 py-2 cursor-pointer hover:bg-surface-hover flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="text-accent-blue font-bold">{artifact.agent}/</span>
                    <span>{artifact.name}</span>
                  </span>
                  <span className="opacity-30">{formatSize(artifact.size)}</span>
                </summary>
                <div className="border-t border-white/10 p-4">
                  <MarkdownPreview path={artifact.path} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownPreview({ path }: { path: string }) {
  // Read file content server-side
  const fs = require('fs');
  try {
    const content = fs.readFileSync(path, 'utf-8');
    return (
      <pre className="text-xs text-accent-green whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
        {content}
      </pre>
    );
  } catch {
    return <div className="text-xs opacity-30">Unable to read file</div>;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}
