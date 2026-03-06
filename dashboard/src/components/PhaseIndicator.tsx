import type { CompanyPhase } from '@/lib/types';

interface PhaseIndicatorProps {
  phase: CompanyPhase;
  cycleNumber: number;
}

const PHASE_CONFIG: Record<CompanyPhase, { label: string; color: string; ascii: string }> = {
  day0: {
    label: 'DAY 0',
    color: '#FFE000',
    ascii: `
 ____    ___   _  _    ___
|  _ \\  / _ \\ | || |  / _ \\
| | | || |_| || || |_| | | |
| |_| ||  _  ||__   _| |_| |
|____/ |_| |_|   |_|  \\___/ `,
  },
  exploring: {
    label: 'EXPLORING',
    color: '#00D4FF',
    ascii: `
 _____ _  _ ___  _    ___  ___ ___ _  _  ___
| __\\ \\/ /| _ \\| |  / _ \\| _ \\_ _| \\| |/ __|
| _| >  < |  _/| |_| (_) |   /| || .  | (_ |
|___/_/\\_\\|_|  |____\\___/|_|_\\___|_|\\_|\\___|`,
  },
  validating: {
    label: 'VALIDATING',
    color: '#FF0080',
    ascii: `
__   __  _   _    ___ ___   _ _____ ___ _  _  ___
\\ \\ / / /_\\ | |  |_ _|   \\ /_\\_   _|_ _| \\| |/ __|
 \\ V / / _ \\| |__ | || |) / _ \\| |  | || .  | (_ |
  \\_/ /_/ \\_\\____|___|___/_/ \\_\\_| |___|_|\\_|\\___|`,
  },
  building: {
    label: 'BUILDING',
    color: '#00FF41',
    ascii: `
 ___ _   _ ___ _    ___ ___ _  _  ___
| _ ) | | |_ _| |  |   \\_ _| \\| |/ __|
| _ \\ |_| || || |__| |) | || .  | (_ |
|___/\\___/|___|____|___/___|_|\\_|\\___|`,
  },
  launching: {
    label: 'LAUNCHING',
    color: '#FF3333',
    ascii: `
 _      _   _   _ _  _  ___ _  _ ___ _  _  ___
| |    /_\\ | | | | \\| |/ __| || |_ _| \\| |/ __|
| |__ / _ \\| |_| | .  | (__| __ || || .  | (_ |
|____/_/ \\_\\\\___/|_|\\_|\\___|_||_|___|_|\\_|\\___|`,
  },
  growing: {
    label: 'GROWING',
    color: '#00FF88',
    ascii: `
  ___ ___  _____      _____ _  _  ___
 / __| _ \\/ _ \\ \\    / /_ _| \\| |/ __|
| (_ |   / (_) \\ \\/\\/ / | || .  | (_ |
 \\___|_|_\\\\___/ \\_/\\_/ |___|_|\\_|\\___|`,
  },
  pivoting: {
    label: 'PIVOTING',
    color: '#FFE000',
    ascii: `
 ___ _____   _____  _____ ___ _  _  ___
| _ \\_ _\\ \\ / / _ \\|_   _|_ _| \\| |/ __|
|  _/| | \\ V /| (_) | | |  | || .  | (_ |
|_| |___| \\_/  \\___/  |_| |___|_|\\_|\\___|`,
  },
};

export default function PhaseIndicator({ phase, cycleNumber }: PhaseIndicatorProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <div className="border-3 border-white bg-surface p-6 relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{
             background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${config.color}08 2px, ${config.color}08 4px)`,
           }} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-xs text-fg opacity-50 mb-1 tracking-widest">COMPANY PHASE</div>
          <pre
            className="text-xs leading-tight font-bold whitespace-pre"
            style={{ color: config.color }}
          >
            {config.ascii}
          </pre>
        </div>

        <div className="text-right">
          <div className="text-xs text-fg opacity-50 tracking-widest mb-2">CYCLE</div>
          <div
            className="text-5xl font-extrabold tabular-nums tracking-tighter"
            style={{ color: config.color }}
          >
            {String(cycleNumber).padStart(3, '0')}
          </div>
          <div className="text-xs opacity-50 mt-1">
            <span className="cursor">RUNNING</span>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="mt-4 pt-3 flex items-center gap-4 text-xs"
        style={{ borderTop: `2px solid ${config.color}33` }}
      >
        <span className="opacity-50">STATUS:</span>
        <span className="status-dot status-active" style={{ background: config.color, boxShadow: `0 0 8px ${config.color}` }} />
        <span style={{ color: config.color }} className="font-bold">{config.label}</span>
        <span className="opacity-30 ml-auto">
          {'['}{'#'.repeat(Math.min(cycleNumber, 30))}{'.'.repeat(Math.max(0, 30 - cycleNumber))}{']'}
        </span>
      </div>
    </div>
  );
}
