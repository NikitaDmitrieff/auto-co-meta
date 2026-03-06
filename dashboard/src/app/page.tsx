import PhaseIndicator from '@/components/PhaseIndicator';
import EscalationBanner from '@/components/EscalationBanner';
import AgentCard from '@/components/AgentCard';
import ConsensusView from '@/components/ConsensusView';
import { StatCard, BlockProgress } from '@/components/MetricChart';
import { getConsensus } from '@/lib/consensus';
import { getAllAgents } from '@/lib/agents';
import { getAllCycles, getLiveCycleStatus } from '@/lib/cycles';
import { getAllArtifacts } from '@/lib/artifacts';
import LiveCycle from '@/components/LiveCycle';

export default async function CommandCenter() {
  const consensus = await getConsensus();
  const agents = getAllAgents();
  const cycles = getAllCycles();
  const artifacts = getAllArtifacts();
  const liveCycle = getLiveCycleStatus();

  const activatedAgents = agents.filter(a => a.hasPersona).length;
  const totalOutputs = agents.reduce((sum, a) => sum + a.outputCount, 0);
  const effectiveCycleCount = cycles.length > 0 ? cycles.length : consensus.cycleNumber;

  // Calculate streak
  let streak = 0;
  for (const cycle of cycles) {
    if (cycle.success) streak++;
    else break;
  }

  return (
    <div className="space-y-4">
      {/* Human Escalation Banner */}
      {consensus.humanEscalation && (
        <EscalationBanner message={consensus.humanEscalation} />
      )}

      {/* Phase + Cycle Counter */}
      <PhaseIndicator phase={consensus.phase} cycleNumber={consensus.cycleNumber} />

      {/* Live Cycle Monitor */}
      <LiveCycle status={liveCycle} />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL CYCLES"
          value={String(effectiveCycleCount).padStart(3, '0')}
          subtitle={streak > 0 ? `${streak} cycle streak` : (effectiveCycleCount > 0 ? 'from consensus' : 'no streak')}
          color="#00FF41"
        />
        <StatCard
          label="ACTIVE AGENTS"
          value={`${activatedAgents}/14`}
          subtitle={`${agents.filter(a => a.status === 'active').length} running now`}
          color="#00D4FF"
        />
        <StatCard
          label="ARTIFACTS"
          value={String(totalOutputs).padStart(3, '0')}
          subtitle={`across ${Object.keys(agents.reduce((acc, a) => a.outputCount > 0 ? { ...acc, [a.id]: true } : acc, {} as Record<string, boolean>)).length} roles`}
          color="#FF0080"
        />
        <StatCard
          label="PHASE"
          value={consensus.phase.toUpperCase()}
          subtitle={consensus.timestamp ? `updated ${timeSince(consensus.timestamp)}` : 'no data'}
          color={getPhaseColor(consensus.phase)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Consensus - 2 cols */}
        <div className="lg:col-span-2">
          <ConsensusView consensus={consensus} />
        </div>

        {/* Agent Overview - 1 col */}
        <div className="space-y-4">
          <div className="border-3 border-white bg-surface p-4">
            <div className="text-xs text-fg opacity-50 tracking-widest mb-3 flex items-center justify-between">
              <span>AGENT ROSTER</span>
              <span className="opacity-30">{activatedAgents}/14 loaded</span>
            </div>

            <BlockProgress
              label="PERSONA FILES"
              current={activatedAgents}
              total={14}
              color="#00FF41"
            />

            <div className="mt-4 space-y-2">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} compact />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cycles */}
      {cycles.length > 0 && (
        <div className="border-3 border-white bg-surface p-4">
          <div className="text-xs text-fg opacity-50 tracking-widest mb-3">RECENT CYCLES</div>
          <div className="space-y-2">
            {cycles.slice(0, 5).map(cycle => (
              <div
                key={cycle.cycleNumber}
                className="flex items-center gap-4 p-2 border border-white/10 hover:bg-surface-hover transition-colors"
              >
                <span className="text-sm font-bold text-accent-green w-12">
                  #{String(cycle.cycleNumber).padStart(3, '0')}
                </span>
                <span className="text-xs opacity-50 w-32">
                  {new Date(cycle.timestamp).toLocaleString()}
                </span>
                <span className="text-xs flex-1 truncate opacity-70">
                  {cycle.summary}
                </span>
                <span className={`text-xs font-bold ${cycle.success ? 'text-accent-green' : 'text-accent-red'}`}>
                  {cycle.success ? 'OK' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boot screen when truly empty (no cycles from logs AND no cycles from consensus) */}
      {effectiveCycleCount === 0 && totalOutputs === 0 && (
        <div className="border-3 border-accent-green/30 bg-surface p-8 text-center">
          <pre className="text-accent-green text-xs mb-6 leading-relaxed inline-block text-left">
{`
    _   _   _ _____ ___     ___ ___
   /_\\ | | | |_   _/ _ \\   / __/ _ \\
  / _ \\| |_| | | || (_) | | (_| (_) |
 /_/ \\_\\\\___/  |_| \\___/   \\___\\___/

 ========================================
  AUTONOMOUS AI COMPANY - MISSION CONTROL
 ========================================

 [BOOT] System initialized
 [BOOT] 14 agent slots configured
 [BOOT] ${activatedAgents} persona files loaded
 [BOOT] Monitoring: memories/ logs/ docs/
 [BOOT] Awaiting first cycle...

 > STATUS: STANDBY
 > PHASE:  DAY 0
 > CYCLES: 000
`}
          </pre>
          <div className="text-xs text-fg opacity-40 mt-4">
            Run your first auto-co cycle to see data populate this dashboard
          </div>
          <div className="text-accent-green text-sm mt-2 cursor font-bold">
            READY
          </div>
        </div>
      )}
    </div>
  );
}

function timeSince(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    day0: '#FFE000',
    exploring: '#00D4FF',
    validating: '#FF0080',
    building: '#00FF41',
    launching: '#FF3333',
    growing: '#00FF88',
    pivoting: '#FFE000',
  };
  return colors[phase] || '#ffffff';
}
