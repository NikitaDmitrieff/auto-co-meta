'use client';

import { AGENT_ROSTER, LAYER_COLORS } from '@/lib/types';
import type { AgentInteraction, AgentLayer } from '@/lib/types';

interface InteractionMapProps {
  interactions: AgentInteraction[];
}

const LAYERS: AgentLayer[] = ['Strategy', 'Product', 'Engineering', 'Business', 'Intelligence'];

// Pentagon layout — each layer at a vertex, agents stacked vertically within
const AGENT_POSITIONS: Record<string, { x: number; y: number }> = (() => {
  const positions: Record<string, { x: number; y: number }> = {};
  const agentsByLayer: Record<string, string[]> = {};

  for (const [id, meta] of Object.entries(AGENT_ROSTER)) {
    if (!agentsByLayer[meta.layer]) agentsByLayer[meta.layer] = [];
    agentsByLayer[meta.layer].push(id);
  }

  // Pentagon vertices — top center, then clockwise
  const cx = 350, cy = 240, r = 175;
  const vertices: Record<string, { x: number; y: number }> = {};
  LAYERS.forEach((layer, i) => {
    const angle = (i / LAYERS.length) * 2 * Math.PI - Math.PI / 2;
    vertices[layer] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  for (const layer of LAYERS) {
    const agents = agentsByLayer[layer] || [];
    const v = vertices[layer];
    const lineHeight = 26;
    const startY = v.y - ((agents.length - 1) * lineHeight) / 2;
    agents.forEach((id, i) => {
      positions[id] = { x: v.x, y: startY + i * lineHeight };
    });
  }

  return positions;
})();

// Get center of a layer's agents for curve control
function getLayerCenter(layer: AgentLayer): { x: number; y: number } {
  const agents = Object.entries(AGENT_ROSTER).filter(([, m]) => m.layer === layer).map(([id]) => id);
  const xs = agents.map(a => AGENT_POSITIONS[a]?.x || 0);
  const ys = agents.map(a => AGENT_POSITIONS[a]?.y || 0);
  return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length };
}

export default function InteractionMap({ interactions }: InteractionMapProps) {
  const maxCount = Math.max(...interactions.map(i => i.count), 1);
  const cx = 350, cy = 240;

  // Count activations per agent
  const activeCounts: Record<string, number> = {};
  for (const i of interactions) {
    activeCounts[i.agent1] = (activeCounts[i.agent1] || 0) + i.count;
    activeCounts[i.agent2] = (activeCounts[i.agent2] || 0) + i.count;
  }

  return (
    <div className="border-3 border-white bg-surface p-4">
      <div className="text-xs text-fg opacity-50 tracking-widest mb-4 flex items-center justify-between">
        <span>AGENT INTERACTION MAP</span>
        <span className="opacity-30">// collaboration frequency</span>
      </div>

      <div className="flex flex-col items-center">
        <svg width="700" height="480" viewBox="0 0 700 480" className="w-full max-w-3xl">
          {/* Subtle grid */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2="700" y2={i * 20} stroke="#ffffff05" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="480" stroke="#ffffff05" strokeWidth="0.5" />
          ))}

          {/* Interaction edges — curved through center */}
          {interactions.map((interaction, idx) => {
            const pos1 = AGENT_POSITIONS[interaction.agent1];
            const pos2 = AGENT_POSITIONS[interaction.agent2];
            if (!pos1 || !pos2) return null;

            const thickness = 0.5 + (interaction.count / maxCount) * 2.5;
            const opacity = 0.1 + (interaction.count / maxCount) * 0.4;

            // Curve toward center for cross-cluster connections
            const mx = (pos1.x + pos2.x) / 2;
            const my = (pos1.y + pos2.y) / 2;
            const dx = mx - cx, dy = my - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const pull = Math.min(dist * 0.4, 60);
            const ctrlX = mx - (dx / dist) * pull;
            const ctrlY = my - (dy / dist) * pull;

            // Color by first agent's layer
            const meta1 = AGENT_ROSTER[interaction.agent1];
            const color = meta1 ? LAYER_COLORS[meta1.layer] : '#00FF41';

            return (
              <path
                key={idx}
                d={`M ${pos1.x} ${pos1.y} Q ${ctrlX} ${ctrlY} ${pos2.x} ${pos2.y}`}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
                opacity={opacity}
              />
            );
          })}

          {/* Layer labels */}
          {LAYERS.map(layer => {
            const center = getLayerCenter(layer);
            const agents = Object.entries(AGENT_ROSTER).filter(([, m]) => m.layer === layer);
            const topY = Math.min(...agents.map(([id]) => AGENT_POSITIONS[id]?.y || 0));
            return (
              <text
                key={layer}
                x={center.x}
                y={topY - 18}
                textAnchor="middle"
                fill={LAYER_COLORS[layer]}
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                opacity="0.35"
                letterSpacing="3"
              >
                {layer.toUpperCase()}
              </text>
            );
          })}

          {/* Agent nodes */}
          {Object.entries(AGENT_POSITIONS).map(([agentId, pos]) => {
            const meta = AGENT_ROSTER[agentId];
            const layerColor = LAYER_COLORS[meta.layer];
            const count = activeCounts[agentId] || 0;
            const isActive = count > 0;
            const hasData = interactions.length > 0;

            return (
              <g key={agentId} opacity={hasData && !isActive ? 0.25 : 1}>
                {/* Active glow */}
                {isActive && (
                  <rect
                    x={pos.x - 38}
                    y={pos.y - 11}
                    width="76"
                    height="22"
                    fill={layerColor}
                    opacity="0.06"
                    rx="2"
                  />
                )}
                {/* Box */}
                <rect
                  x={pos.x - 35}
                  y={pos.y - 10}
                  width="70"
                  height="20"
                  fill="#1a1a1a"
                  stroke={layerColor}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  rx="1"
                />
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill={layerColor}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  {agentId.toUpperCase()}
                </text>
                {/* Activation count badge */}
                {isActive && (
                  <>
                    <circle cx={pos.x + 38} cy={pos.y - 6} r="7" fill={layerColor} opacity="0.8" />
                    <text
                      x={pos.x + 38}
                      y={pos.y - 3}
                      textAnchor="middle"
                      fill="#0a0a0a"
                      fontSize="8"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {count}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* No data */}
          {interactions.length === 0 && (
            <text x="350" y="460" textAnchor="middle" fill="#ffffff20" fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="2">
              AWAITING INTERACTION DATA
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="flex gap-4 mt-1">
          {LAYERS.map(layer => (
            <div key={layer} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: LAYER_COLORS[layer] + '80' }} />
              <span className="text-[10px] opacity-35">{layer}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
