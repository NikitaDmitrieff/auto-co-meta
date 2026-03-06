'use client';

interface EscalationBannerProps {
  message: string;
}

export default function EscalationBanner({ message }: EscalationBannerProps) {
  return (
    <div className="border-3 border-accent-red bg-bg relative overflow-hidden">
      {/* Flashing red bar */}
      <div className="bg-accent-red text-bg px-4 py-1 flex items-center gap-2 blink">
        <span className="font-extrabold text-xs tracking-widest">
          !! HUMAN ESCALATION REQUIRED !!
        </span>
      </div>

      <div className="p-4 flex items-start gap-4">
        <div className="text-accent-red font-bold text-2xl blink leading-none mt-1">
          {'>>>'}
        </div>
        <div>
          <div className="text-accent-red font-bold text-sm mb-1">
            PENDING HUMAN DECISION
          </div>
          <div className="text-fg text-sm leading-relaxed">
            {message}
          </div>
          <div className="mt-3 text-xs text-accent-red opacity-70">
            Respond in memories/human-request.md to continue operations
          </div>
        </div>
      </div>

      {/* Bottom danger stripe */}
      <div className="h-1" style={{
        background: 'repeating-linear-gradient(90deg, #FF3333 0px, #FF3333 10px, transparent 10px, transparent 20px)',
      }} />
    </div>
  );
}
