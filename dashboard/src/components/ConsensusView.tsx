import type { ConsensusData } from '@/lib/types';

interface ConsensusViewProps {
  consensus: ConsensusData;
}

export default function ConsensusView({ consensus }: ConsensusViewProps) {
  const hasData = consensus.raw.length > 0;

  if (!hasData) {
    return (
      <div className="border-3 border-white bg-surface p-6">
        <div className="text-xs text-fg opacity-50 tracking-widest mb-4 flex items-center gap-2">
          <span>CONSENSUS</span>
          <span className="opacity-30">// memories/consensus.md</span>
        </div>
        <div className="text-center py-8">
          <pre className="text-accent-yellow text-xs mb-4 leading-relaxed">
{`  _  _  ___    ___   _ _____ _
 | \\| |/ _ \\  |   \\ /_\\_   _/_\\
 | .\` | (_) | | |) / _ \\| |/ _ \\
 |_|\\_|\\___/  |___/_/ \\_\\_|_/ \\_\\`}
          </pre>
          <div className="text-sm text-fg opacity-40">
            No consensus data found
          </div>
          <div className="text-xs text-fg opacity-25 mt-2">
            Awaiting first cycle execution...
          </div>
          <div className="text-accent-green text-xs mt-4 cursor">
            STANDBY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-3 border-white bg-surface">
      {/* Header */}
      <div className="border-b-3 border-white px-4 py-2 flex items-center justify-between">
        <div className="text-xs text-fg opacity-50 tracking-widest flex items-center gap-2">
          <span className="text-accent-green font-bold">$</span>
          <span>CONSENSUS</span>
          <span className="opacity-30">// memories/consensus.md</span>
        </div>
        {consensus.timestamp && (
          <div className="text-xs opacity-30">
            {new Date(consensus.timestamp).toLocaleString()}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* What We Did */}
        {consensus.whatWeDid && (
          <div>
            <div className="text-xs font-bold text-accent-blue tracking-widest mb-2 flex items-center gap-2">
              <span>{'>>>'}</span> WHAT WE DID
            </div>
            <div className="text-sm leading-relaxed pl-4 border-l-2 border-accent-blue/30">
              {consensus.whatWeDid.split('\n').map((line, i) => (
                <div key={i} className={line.startsWith('-') ? 'text-fg' : 'opacity-70'}>
                  {line.startsWith('-') ? (
                    <span>
                      <span className="text-accent-blue mr-1">{'>'}</span>
                      {line.slice(1).trim()}
                    </span>
                  ) : line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Action */}
        {consensus.nextAction && (
          <div>
            <div className="text-xs font-bold text-accent-green tracking-widest mb-2 flex items-center gap-2">
              <span>{'>>>'}</span> NEXT ACTION
            </div>
            <div className="text-sm leading-relaxed pl-4 border-l-2 border-accent-green/30 text-accent-green">
              {consensus.nextAction}
            </div>
          </div>
        )}

        {/* Active Agents */}
        {consensus.activeAgents.length > 0 && (
          <div>
            <div className="text-xs font-bold text-accent-pink tracking-widest mb-2 flex items-center gap-2">
              <span>{'>>>'}</span> ACTIVE AGENTS
            </div>
            <div className="flex flex-wrap gap-2">
              {consensus.activeAgents.map(agent => (
                <span
                  key={agent}
                  className="text-xs border border-accent-pink/50 text-accent-pink px-2 py-0.5 font-bold uppercase"
                >
                  {agent}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full rendered markdown */}
        {!consensus.whatWeDid && !consensus.nextAction && (
          <div
            className="markdown-content text-sm"
            dangerouslySetInnerHTML={{ __html: consensus.html }}
          />
        )}
      </div>
    </div>
  );
}
