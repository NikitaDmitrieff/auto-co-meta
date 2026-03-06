'use client';

import { useState } from 'react';
import type { CycleLog } from '@/lib/types';

interface CycleTimelineProps {
  cycles: CycleLog[];
}

const PHASE_COLORS: Record<string, string> = {
  day0: '#FFE000',
  exploring: '#00D4FF',
  validating: '#FF0080',
  building: '#00FF41',
  launching: '#FF3333',
  growing: '#00FF88',
  pivoting: '#FFE000',
};

export default function CycleTimeline({ cycles }: CycleTimelineProps) {
  const [expandedCycle, setExpandedCycle] = useState<number | null>(null);

  if (cycles.length === 0) {
    return (
      <div className="border-3 border-white bg-surface p-6">
        <div className="text-xs text-fg opacity-50 tracking-widest mb-4">CYCLE TIMELINE</div>
        <div className="text-center py-12">
          <pre className="text-accent-blue text-xs mb-4">
{`  ___  ___  ___  ___  ___  ___  ___
 |   ||   ||   ||   ||   ||   ||   |
 | 0 || 0 || 0 || 0 || 0 || 0 || 0 |
 |___||___||___||___||___||___||___|`}
          </pre>
          <div className="text-sm text-fg opacity-40">No cycles recorded yet</div>
          <div className="text-xs text-fg opacity-25 mt-2">
            Timeline will populate as the AI company runs cycles
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {cycles.map((cycle, idx) => {
        const isExpanded = expandedCycle === cycle.cycleNumber;
        const phaseColor = PHASE_COLORS[cycle.phase] || '#555';
        const isLast = idx === cycles.length - 1;

        return (
          <div key={cycle.cycleNumber} className="relative">
            {/* Timeline connector */}
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: phaseColor + '40' }}>
              {!isLast && <div className="absolute bottom-0 left-0 w-full h-4" style={{ background: `linear-gradient(to bottom, ${phaseColor}40, transparent)` }} />}
            </div>

            {/* Timeline node */}
            <div
              className="flex items-start gap-4 border-3 border-white bg-surface p-4 cursor-pointer transition-colors duration-100 hover:bg-surface-hover relative"
              onClick={() => setExpandedCycle(isExpanded ? null : cycle.cycleNumber)}
              style={{ borderLeftColor: phaseColor, borderLeftWidth: '5px' }}
            >
              {/* Cycle number */}
              <div className="flex-shrink-0 w-12 text-center">
                <div className="text-lg font-extrabold" style={{ color: phaseColor }}>
                  #{String(cycle.cycleNumber).padStart(3, '0')}
                </div>
                <div className={`status-dot mx-auto mt-1 ${cycle.success ? 'status-active' : 'status-error'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 border uppercase"
                    style={{ borderColor: phaseColor, color: phaseColor }}
                  >
                    {cycle.phase}
                  </span>
                  <span className="text-xs opacity-30">
                    {new Date(cycle.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs ml-auto font-bold" style={{ color: cycle.success ? '#00FF41' : '#FF3333' }}>
                    {cycle.success ? 'OK' : 'FAIL'}
                  </span>
                </div>

                <div className="text-sm opacity-70 mb-2 truncate">
                  {cycle.summary}
                </div>

                {/* Agent tags */}
                {cycle.agents.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cycle.agents.map(agent => (
                      <span key={agent} className="text-xs bg-surface-hover px-1.5 py-0.5 text-accent-pink">
                        @{agent}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="text-xs text-fg opacity-50 tracking-widest mb-2">FULL OUTPUT</div>
                    <pre className="text-xs bg-bg p-4 border-2 border-white/10 overflow-x-auto max-h-96 overflow-y-auto text-accent-green whitespace-pre-wrap">
                      {cycle.output}
                    </pre>

                    {cycle.artifacts.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-fg opacity-50 tracking-widest mb-1">ARTIFACTS</div>
                        {cycle.artifacts.map((a, i) => (
                          <div key={i} className="text-xs text-accent-blue">
                            {'->'} {a}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expand indicator */}
              <div className="text-xs opacity-30 flex-shrink-0">
                {isExpanded ? '[-]' : '[+]'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
