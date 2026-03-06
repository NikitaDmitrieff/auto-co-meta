'use client';

import { useState, useEffect } from 'react';
import { AGENT_ROSTER, LAYER_COLORS } from '@/lib/types';
import type { LiveCycleStatus } from '@/lib/cycles';

interface LiveCycleProps {
  status: LiveCycleStatus;
}

export default function LiveCycle({ status }: LiveCycleProps) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    if (status.lastActivity) {
      setFormattedTime(new Date(status.lastActivity).toLocaleTimeString());
    }
  }, [status.lastActivity]);

  if (!status.isRunning) return null;

  return (
    <div className="border-3 border-accent-green bg-surface p-4 relative overflow-hidden">
      {/* Animated pulse border effect */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-green animate-pulse" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs tracking-widest text-accent-green font-bold">LIVE CYCLE</span>
        </div>
        <div className="flex items-center gap-4 text-xs opacity-40">
          <span>{status.eventCount} events</span>
          {formattedTime && (
            <span>updated {formattedTime}</span>
          )}
        </div>
      </div>

      {/* Active Agents */}
      <div className="mb-3">
        <div className="text-[10px] tracking-widest opacity-30 mb-2">ACTIVE AGENTS</div>
        <div className="flex flex-wrap gap-2">
          {status.activeAgents.map(agentId => {
            const meta = AGENT_ROSTER[agentId];
            if (!meta) return null;
            const color = LAYER_COLORS[meta.layer];
            return (
              <div
                key={agentId}
                className="flex items-center gap-1.5 px-2 py-1 border"
                style={{ borderColor: color + '80', background: color + '10' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: color }}
                />
                <span className="text-xs font-bold" style={{ color }}>
                  {agentId.toUpperCase()}
                </span>
                <span className="text-[10px] opacity-40">{meta.role}</span>
              </div>
            );
          })}
          {status.activeAgents.length === 0 && (
            <span className="text-xs opacity-30">Initializing...</span>
          )}
        </div>
      </div>

      {/* Latest Status */}
      {status.statusText && (
        <div className="text-xs opacity-60 border-t border-white/10 pt-2 mt-2 font-mono truncate">
          <span className="text-accent-green mr-2">{'>'}</span>
          {status.statusText}
        </div>
      )}

      {/* Recent Tools */}
      {status.tools.length > 0 && (
        <div className="flex gap-2 mt-2">
          {status.tools.map((tool, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/5 opacity-30">
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
