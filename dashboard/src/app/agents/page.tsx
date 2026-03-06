import AgentCard from '@/components/AgentCard';
import InteractionMap from '@/components/InteractionMap';
import { getAllAgents, getAgentPersonaContent } from '@/lib/agents';
import { getAgentInteractions } from '@/lib/cycles';
import { AGENT_ROSTER, LAYER_COLORS } from '@/lib/types';
import type { AgentLayer } from '@/lib/types';

export default function AgentsPage() {
  const agents = getAllAgents();
  const interactions = getAgentInteractions();

  // Group agents by layer
  const layers: AgentLayer[] = ['Strategy', 'Product', 'Engineering', 'Business', 'Intelligence'];
  const agentsByLayer = layers.reduce((acc, layer) => {
    acc[layer] = agents.filter(a => a.layer === layer);
    return acc;
  }, {} as Record<AgentLayer, typeof agents>);

  const totalPersonas = agents.filter(a => a.hasPersona).length;
  const totalOutputs = agents.reduce((sum, a) => sum + a.outputCount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-3 border-white bg-surface p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-fg opacity-50 tracking-widest mb-1">AGENT GRID</div>
          <div className="text-xl font-extrabold text-accent-blue tracking-tight">
            14 AGENT SLOTS
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-xs opacity-50">LOADED</div>
            <div className="text-2xl font-extrabold text-accent-green">{totalPersonas}</div>
          </div>
          <div>
            <div className="text-xs opacity-50">OUTPUTS</div>
            <div className="text-2xl font-extrabold text-accent-pink">{totalOutputs}</div>
          </div>
          <div>
            <div className="text-xs opacity-50">LAYERS</div>
            <div className="text-2xl font-extrabold text-accent-yellow">5</div>
          </div>
        </div>
      </div>

      {/* Layer legend */}
      <div className="flex flex-wrap gap-3">
        {layers.map(layer => (
          <div
            key={layer}
            className="border-3 px-3 py-1.5 text-xs font-bold tracking-wider flex items-center gap-2"
            style={{ borderColor: LAYER_COLORS[layer], color: LAYER_COLORS[layer] }}
          >
            <div
              className="w-2 h-2"
              style={{ background: LAYER_COLORS[layer] }}
            />
            {layer.toUpperCase()}
            <span className="opacity-50">({agentsByLayer[layer].length})</span>
          </div>
        ))}
      </div>

      {/* Agent Grid by Layer */}
      {layers.map(layer => (
        <div key={layer}>
          <div
            className="text-xs font-bold tracking-widest mb-2 flex items-center gap-2"
            style={{ color: LAYER_COLORS[layer] }}
          >
            <span className="opacity-50">{'///'}</span>
            {layer.toUpperCase()} LAYER
            <div className="flex-1 h-px ml-2" style={{ background: LAYER_COLORS[layer] + '30' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {agentsByLayer[layer].map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      ))}

      {/* Agent Persona Details */}
      <div className="border-3 border-white bg-surface p-4">
        <div className="text-xs text-fg opacity-50 tracking-widest mb-4">
          LOADED PERSONA FILES
          <span className="opacity-30 ml-2">// .claude/agents/*.md</span>
        </div>

        {agents.filter(a => a.hasPersona).length === 0 ? (
          <div className="text-center py-8 text-xs opacity-30">
            No persona files detected in .claude/agents/
          </div>
        ) : (
          <div className="space-y-3">
            {agents.filter(a => a.hasPersona).map(agent => {
              const content = getAgentPersonaContent(agent.id);
              const meta = AGENT_ROSTER[agent.id];
              return (
                <details key={agent.id} className="border border-white/20 group">
                  <summary className="px-4 py-2 cursor-pointer hover:bg-surface-hover flex items-center justify-between text-sm">
                    <span className="flex items-center gap-3">
                      <span className="font-bold" style={{ color: meta.color }}>
                        {agent.role}
                      </span>
                      <span className="opacity-50">{agent.expert}</span>
                    </span>
                    <span className="text-xs opacity-30 group-open:rotate-90 transition-transform">
                      {'>'}
                    </span>
                  </summary>
                  <div className="border-t border-white/10 p-4">
                    <pre className="text-xs text-accent-green whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {content || 'Unable to load persona file'}
                    </pre>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>

      {/* Interaction Map */}
      <InteractionMap interactions={interactions} />
    </div>
  );
}
