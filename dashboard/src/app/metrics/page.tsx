import { getMetrics } from '@/lib/cycles';
import { getAllAgents } from '@/lib/agents';
import { getArtifactStats } from '@/lib/artifacts';
import { getConsensus } from '@/lib/consensus';
import { BarChart, StatCard, BlockProgress, Sparkline } from '@/components/MetricChart';
import { AGENT_ROSTER, LAYER_COLORS } from '@/lib/types';
import type { AgentLayer } from '@/lib/types';

export default async function MetricsPage() {
  const metrics = getMetrics();
  const agents = getAllAgents();
  const artifactStats = getArtifactStats();
  const consensus = await getConsensus();

  const hasData = metrics.totalCycles > 0 || consensus.cycleNumber > 0;

  // Prepare agent activation data for chart
  const agentActivationData = Object.entries(AGENT_ROSTER).map(([id, meta]) => ({
    label: id.toUpperCase(),
    value: metrics.agentActivationCounts[id] || 0,
    color: meta.color,
  })).sort((a, b) => b.value - a.value);

  // Output by agent
  const outputByAgent = Object.entries(AGENT_ROSTER).map(([id, meta]) => ({
    label: id.toUpperCase(),
    value: artifactStats.byAgent[id] || 0,
    color: meta.color,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Layer distribution
  const layers: AgentLayer[] = ['Strategy', 'Product', 'Engineering', 'Business', 'Intelligence'];
  const layerActivation = layers.map(layer => {
    const layerAgents = Object.entries(AGENT_ROSTER).filter(([, meta]) => meta.layer === layer);
    const total = layerAgents.reduce((sum, [id]) => sum + (metrics.agentActivationCounts[id] || 0), 0);
    return {
      label: layer,
      value: total,
      color: LAYER_COLORS[layer],
    };
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-3 border-white bg-surface p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-fg opacity-50 tracking-widest mb-1">ANALYTICS</div>
          <div className="text-xl font-extrabold text-accent-yellow tracking-tight">
            METRICS DASHBOARD
          </div>
        </div>
        <div className="text-xs opacity-30">
          {hasData ? `${metrics.totalCycles} cycles analyzed` : 'awaiting data'}
        </div>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="border-3 border-white/20 bg-surface p-8 text-center">
          <pre className="text-accent-yellow text-xs mb-6 leading-relaxed inline-block">
{`
  __  __ ___ _____ ___ ___ ___ ___
 |  \\/  | __|_   _| _ \\_ _/ __/ __|
 | |\\/| | _|  | | |   /| | (__\\__ \\
 |_|  |_|___| |_| |_|_\\___|___|___/

 =====================================
  AWAITING OPERATIONAL DATA
 =====================================

 [i] No cycles have been executed yet
 [i] Metrics will auto-populate from:
     - logs/     (cycle execution data)
     - docs/     (artifact production)
     - memories/ (consensus state)

 [i] Charts available after first cycle:
     > Cycle success rate
     > Agent activation frequency
     > Output velocity
     > Phase transitions
     > Stall detection
`}
          </pre>

          {/* Preview of what metrics will look like */}
          <div className="max-w-2xl mx-auto mt-8 space-y-4">
            <div className="text-xs text-fg opacity-50 tracking-widest mb-2">
              PREVIEW // sample metrics layout
            </div>

            <div className="grid grid-cols-4 gap-4">
              <StatCard label="CYCLES" value="---" color="#555" />
              <StatCard label="SUCCESS %" value="---" color="#555" />
              <StatCard label="STREAK" value="---" color="#555" />
              <StatCard label="OUTPUTS" value="---" color="#555" />
            </div>

            <BarChart
              title="AGENT ACTIVATION FREQUENCY // preview"
              data={Object.entries(AGENT_ROSTER).map(([id, meta]) => ({
                label: id.toUpperCase(),
                value: 0,
                color: meta.color + '40',
              }))}
            />
          </div>
        </div>
      ) : (
        /* Populated State */
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="TOTAL CYCLES"
              value={String(metrics.totalCycles || consensus.cycleNumber).padStart(3, '0')}
              color="#00FF41"
              large
            />
            <StatCard
              label="PHASE"
              value={(consensus.phase || 'day0').toUpperCase()}
              color={consensus.phase === 'building' ? '#00FF41' : consensus.phase === 'launching' ? '#FF3333' : '#FFE000'}
              large
            />
            <StatCard
              label="ARTIFACTS"
              value={String(artifactStats.total).padStart(3, '0')}
              color="#FF0080"
              large
            />
            <StatCard
              label="AGENTS LOADED"
              value={`${agents.filter(a => a.hasPersona).length}/14`}
              color="#00D4FF"
              large
            />
            <StatCard
              label="DATA SOURCE"
              value={metrics.totalCycles > consensus.cycleNumber ? 'LOGS' : 'CONSENSUS'}
              color="#888888"
              large
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agent Activation */}
            <BarChart
              title="AGENT ACTIVATION FREQUENCY"
              data={agentActivationData}
            />

            {/* Layer Distribution */}
            <BarChart
              title="LAYER ACTIVITY DISTRIBUTION"
              data={layerActivation}
            />

            {/* Output by Agent */}
            {outputByAgent.length > 0 && (
              <BarChart
                title="ARTIFACTS BY AGENT"
                data={outputByAgent}
              />
            )}

            {/* Output Velocity */}
            {metrics.outputVelocity.length > 0 && (
              <div className="border-3 border-white bg-surface p-4">
                <div className="text-xs text-fg opacity-50 tracking-widest mb-4">
                  OUTPUT VELOCITY
                  <span className="opacity-30 ml-2">// artifacts per cycle</span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {metrics.outputVelocity.map((point, i) => {
                    const maxCount = Math.max(...metrics.outputVelocity.map(p => p.count), 1);
                    const height = (point.count / maxCount) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[4px] border border-accent-green/30"
                        style={{
                          height: `${Math.max(height, 2)}%`,
                          background: `linear-gradient(to top, #00FF4160, #00FF4110)`,
                        }}
                        title={`Cycle ${point.cycle}: ${point.count} artifacts`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs opacity-20 mt-1">
                  <span>Oldest</span>
                  <span>Latest</span>
                </div>
              </div>
            )}
          </div>

          {/* Phase Transitions */}
          {metrics.phaseTransitions.length > 0 && (
            <div className="border-3 border-white bg-surface p-4">
              <div className="text-xs text-fg opacity-50 tracking-widest mb-3">
                PHASE TRANSITIONS
              </div>
              <div className="space-y-2">
                {metrics.phaseTransitions.map((t, i) => {
                  const colors: Record<string, string> = {
                    day0: '#FFE000', exploring: '#00D4FF', validating: '#FF0080',
                    building: '#00FF41', launching: '#FF3333', growing: '#00FF88', pivoting: '#FFE000',
                  };
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs p-2 border border-white/10">
                      <span className="w-12 text-accent-green font-bold">#{String(t.cycle).padStart(3, '0')}</span>
                      <span className="font-bold" style={{ color: colors[t.from] }}>{t.from.toUpperCase()}</span>
                      <span className="opacity-30">{'-->'}</span>
                      <span className="font-bold" style={{ color: colors[t.to] }}>{t.to.toUpperCase()}</span>
                      <span className="opacity-30 ml-auto">{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stall Detections */}
          {metrics.stallDetections.length > 0 && (
            <div className="border-3 border-accent-yellow bg-surface p-4">
              <div className="text-xs text-accent-yellow tracking-widest mb-3 flex items-center gap-2">
                <span className="blink">!!</span>
                STALL DETECTIONS
              </div>
              <div className="space-y-2">
                {metrics.stallDetections.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs p-2 border border-accent-yellow/30">
                    <span className="w-12 text-accent-yellow font-bold">#{String(s.cycle).padStart(3, '0')}</span>
                    <span className="opacity-70">&quot;{s.repeatedAction}&quot;</span>
                    <span className="text-accent-yellow font-bold ml-auto">x{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Readout */}
          <div className="border-3 border-white bg-surface p-4">
            <div className="text-xs text-fg opacity-50 tracking-widest mb-3">
              SYSTEM READOUT
            </div>
            <pre className="text-xs text-accent-green leading-relaxed">
{`> TOTAL_CYCLES:     ${String(metrics.totalCycles || consensus.cycleNumber).padStart(6)}
> CURRENT_PHASE:    ${(consensus.phase || 'day0').toUpperCase().padStart(6)}
> AGENTS_LOADED:    ${String(agents.filter(a => a.hasPersona).length).padStart(6)}/14
> TOTAL_ARTIFACTS:  ${String(artifactStats.total).padStart(6)}
> LOG_FILES:        ${String(metrics.totalCycles > consensus.cycleNumber ? metrics.totalCycles : 0).padStart(6)}
> DATA_SOURCE:      ${(metrics.totalCycles > consensus.cycleNumber ? 'LOGS' : 'CONSENSUS').padStart(6)}
> SYSTEM_STATUS:    NOMINAL`}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
