import type { Agent } from '@/lib/types';
import { AGENT_ROSTER, LAYER_COLORS } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

export default function AgentCard({ agent, compact = false }: AgentCardProps) {
  const meta = AGENT_ROSTER[agent.id];
  const layerColor = LAYER_COLORS[agent.layer];
  const agentColor = meta?.color || '#ffffff';

  const statusConfig = {
    'active': { dot: 'status-active', label: 'ACTIVE', color: '#00FF41' },
    'idle': { dot: 'status-idle', label: 'IDLE', color: '#555' },
    'never-activated': { dot: 'status-idle', label: 'STANDBY', color: '#333' },
  };

  const status = statusConfig[agent.status];

  if (compact) {
    return (
      <div
        className="border-3 border-white bg-surface p-3 transition-colors duration-100 hover:bg-surface-hover group"
        style={{ borderLeftColor: agentColor, borderLeftWidth: '5px' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: agentColor }}>
            {agent.role}
          </span>
          <span className={`status-dot ${status.dot} ${agent.status === 'active' ? 'blink' : ''}`} />
        </div>
        <div className="text-xs opacity-50">{agent.expert}</div>
      </div>
    );
  }

  return (
    <div
      className="border-3 border-white bg-surface transition-colors duration-100 hover:bg-surface-hover group relative overflow-hidden"
      style={{ borderColor: agent.status === 'active' ? agentColor : undefined }}
    >
      {/* Layer indicator bar */}
      <div className="h-1" style={{ background: layerColor }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm font-extrabold uppercase tracking-wider" style={{ color: agentColor }}>
              {agent.role}
            </div>
            <div className="text-xs opacity-60 mt-0.5">{agent.expert}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-dot ${status.dot} ${agent.status === 'active' ? 'blink' : ''}`} />
            <span className="text-xs font-bold" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Layer badge */}
        <div className="mb-3">
          <span
            className="text-xs px-2 py-0.5 border font-bold uppercase tracking-wider"
            style={{ borderColor: layerColor, color: layerColor }}
          >
            {agent.layer}
          </span>
          {agent.hasPersona && (
            <span className="text-xs px-2 py-0.5 border border-accent-green text-accent-green font-bold uppercase tracking-wider ml-2">
              PERSONA
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="border border-white/10 p-2">
            <div className="opacity-50 mb-0.5">OUTPUTS</div>
            <div className="font-bold text-lg" style={{ color: agent.outputCount > 0 ? agentColor : '#555' }}>
              {String(agent.outputCount).padStart(2, '0')}
            </div>
          </div>
          <div className="border border-white/10 p-2">
            <div className="opacity-50 mb-0.5">LAST CYCLE</div>
            <div className="font-bold text-lg" style={{ color: agent.lastActiveCycle ? agentColor : '#555' }}>
              {agent.lastActiveCycle ? `#${String(agent.lastActiveCycle).padStart(3, '0')}` : '---'}
            </div>
          </div>
        </div>

        {/* Description preview */}
        <div className="mt-3 text-xs opacity-40 line-clamp-2 leading-relaxed">
          {agent.description.length > 120 ? agent.description.slice(0, 120) + '...' : agent.description}
        </div>
      </div>

      {/* Active glow effect */}
      {agent.status === 'active' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{ background: `radial-gradient(circle at center, ${agentColor}, transparent 70%)` }}
        />
      )}
    </div>
  );
}
