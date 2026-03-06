import CycleTimeline from '@/components/CycleTimeline';
import { StatCard, BlockProgress } from '@/components/MetricChart';
import { getAllCycles } from '@/lib/cycles';
import { getConsensus } from '@/lib/consensus';

export default async function CyclesPage() {
  const cycles = getAllCycles();
  const consensus = await getConsensus();

  const totalCycles = cycles.length > 0 ? cycles.length : consensus.cycleNumber;
  const successCount = cycles.filter(c => c.success).length;
  const failCount = totalCycles - successCount;

  // Calculate streak
  let currentStreak = 0;
  for (const cycle of cycles) {
    if (cycle.success) currentStreak++;
    else break;
  }

  // Phase distribution
  const phaseCounts: Record<string, number> = {};
  for (const cycle of cycles) {
    phaseCounts[cycle.phase] = (phaseCounts[cycle.phase] || 0) + 1;
  }

  // Unique agents across all cycles
  const allAgents = new Set<string>();
  for (const cycle of cycles) {
    for (const agent of cycle.agents) {
      allAgents.add(agent);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-3 border-white bg-surface p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-fg opacity-50 tracking-widest mb-1">CYCLE HISTORY</div>
          <div className="text-xl font-extrabold text-accent-green tracking-tight">
            EXECUTION LOG
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-50 mb-1">TOTAL CYCLES</div>
          <div className="text-3xl font-extrabold text-accent-green tabular-nums">
            {String(totalCycles).padStart(3, '0')}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {totalCycles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="SUCCESS" value={successCount} color="#00FF41" subtitle={`${((successCount/totalCycles)*100).toFixed(0)}% rate`} />
          <StatCard label="FAILED" value={failCount} color="#FF3333" subtitle={`${((failCount/totalCycles)*100).toFixed(0)}% rate`} />
          <StatCard label="STREAK" value={currentStreak} color="#00D4FF" subtitle="consecutive successes" />
          <StatCard label="AGENTS SEEN" value={allAgents.size} color="#FF0080" subtitle={`of 14 total`} />
        </div>
      )}

      {/* Phase Distribution */}
      {totalCycles > 0 && Object.keys(phaseCounts).length > 0 && (
        <div className="border-3 border-white bg-surface p-4">
          <div className="text-xs text-fg opacity-50 tracking-widest mb-3">PHASE DISTRIBUTION</div>
          <div className="flex gap-2">
            {Object.entries(phaseCounts).map(([phase, count]) => {
              const width = (count / totalCycles) * 100;
              const colors: Record<string, string> = {
                day0: '#FFE000',
                exploring: '#00D4FF',
                validating: '#FF0080',
                building: '#00FF41',
                launching: '#FF3333',
                growing: '#00FF88',
                pivoting: '#FFE000',
              };
              const color = colors[phase] || '#555';

              return (
                <div key={phase} className="flex-1" style={{ maxWidth: `${width}%`, minWidth: '60px' }}>
                  <div className="h-8 border border-white/20 flex items-center justify-center" style={{ background: color + '30' }}>
                    <span className="text-xs font-bold" style={{ color }}>{phase}</span>
                  </div>
                  <div className="text-xs text-center mt-1 opacity-50">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Convergence Tracker */}
      {totalCycles > 0 && (
        <div className="border-3 border-white bg-surface p-4">
          <div className="text-xs text-fg opacity-50 tracking-widest mb-3">
            CONVERGENCE TRACKER
            <span className="opacity-30 ml-2">// brainstorm {'>'} validate {'>'} build</span>
          </div>
          <div className="flex items-center gap-1">
            {cycles.slice().reverse().map((cycle, i) => {
              const colors: Record<string, string> = {
                day0: '#FFE000',
                exploring: '#00D4FF',
                validating: '#FF0080',
                building: '#00FF41',
                launching: '#FF3333',
                growing: '#00FF88',
                pivoting: '#FFE000',
              };
              const color = colors[cycle.phase] || '#555';
              return (
                <div
                  key={i}
                  className="h-6 flex-1 min-w-[4px] border border-white/5"
                  style={{ background: color + '60' }}
                  title={`Cycle ${cycle.cycleNumber}: ${cycle.phase}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs opacity-30 mt-1">
            <span>Cycle 1</span>
            <span>Cycle {totalCycles}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <div className="text-xs text-fg opacity-50 tracking-widest mb-2 flex items-center gap-2">
          <span className="text-accent-green">$</span>
          TIMELINE
          <div className="flex-1 h-px bg-white/10 ml-2" />
        </div>
        <CycleTimeline cycles={cycles} />
      </div>

      {/* Consensus-only state (cycles ran but no log files) */}
      {cycles.length === 0 && consensus.cycleNumber > 0 && (
        <div className="border-3 border-accent-green/30 bg-surface p-6">
          <div className="text-xs text-accent-green tracking-widest mb-3">
            CONSENSUS-DERIVED DATA // no log files found
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <StatCard label="CYCLES (CONSENSUS)" value={consensus.cycleNumber} color="#00FF41" />
            <StatCard label="PHASE" value={consensus.phase.toUpperCase()} color="#00D4FF" />
            <StatCard label="LOG FILES" value={0} color="#FF3333" subtitle="daemon not started" />
          </div>
          <div className="text-xs opacity-50 border-t border-white/10 pt-3 mt-3">
            {consensus.cycleNumber} cycles ran via direct claude -p (not via auto-loop.sh daemon).
            Start the daemon with <code className="text-accent-green">make start</code> to generate per-cycle log files.
          </div>
          {consensus.whatWeDid && (
            <div className="mt-4 border border-white/10 p-3">
              <div className="text-xs text-accent-yellow tracking-widest mb-2">RECENT ACTIVITY (from consensus)</div>
              <pre className="text-xs text-fg opacity-70 whitespace-pre-wrap">{consensus.whatWeDid}</pre>
            </div>
          )}
        </div>
      )}

      {/* Truly empty state */}
      {totalCycles === 0 && (
        <div className="border-3 border-white/20 bg-surface p-8 text-center">
          <pre className="text-accent-blue text-xs mb-4 leading-relaxed inline-block">
{`
 ___ __  __ ___ _______   __
| __|  \\/  | _ \\_   _\\ \\ / /
| _|| |\\/| |  _/ | |  \\ V /
|___|_|  |_|_|   |_|   |_|

 No cycles have been recorded yet.
 The timeline will populate as the
 autonomous company runs its cycles.
`}
          </pre>
          <div className="text-xs opacity-30 mt-4">
            Each cycle creates a log entry in the logs/ directory
          </div>
        </div>
      )}
    </div>
  );
}
