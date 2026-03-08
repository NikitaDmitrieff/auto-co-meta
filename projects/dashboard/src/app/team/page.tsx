import state from "@/data";

export default function TeamPage() {
  const { cycle, agentActivity, decisions, tasks } = state;

  const layers = LAYERS.map((layer) => ({
    ...layer,
    agents: layer.agents.map((agent) => {
      const activity = agentActivity[agent.id];
      const lastCycle = activity?.lastCycle || 0;
      const active = lastCycle >= cycle - 1; // active if participated in current or previous cycle
      return {
        ...agent,
        lastRan: lastCycle > 0 ? `Cycle #${lastCycle}` : "Never",
        active,
        decisionCount: activity?.decisions || 0,
        taskCount: activity?.tasks || 0,
      };
    }),
  }));

  const activeCount = layers.reduce(
    (sum, l) => sum + l.agents.filter((a) => a.active).length,
    0
  );

  const totalDecisions = decisions.length;
  const totalTasks = tasks.length;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Team</h2>
        <p className="text-sm text-slate-400 mt-0.5">14 AI agents modeled on world-class experts</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-slate-200 px-4 py-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Agents</div>
          <div className="text-xl font-bold font-mono text-slate-900">14</div>
        </div>
        <div className="border border-slate-200 px-4 py-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Recently Active</div>
          <div className="text-xl font-bold font-mono text-accent">{activeCount}</div>
        </div>
        <div className="border border-slate-200 px-4 py-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Decisions</div>
          <div className="text-xl font-bold font-mono text-slate-900">{totalDecisions}</div>
        </div>
        <div className="border border-slate-200 px-4 py-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Tasks</div>
          <div className="text-xl font-bold font-mono text-slate-900">{totalTasks}</div>
        </div>
      </div>

      {layers.map((layer) => (
        <div key={layer.name} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 ${layer.color}`} />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{layer.name}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {layer.agents.map((agent) => (
              <div
                key={agent.id}
                className={`border p-4 transition-colors ${
                  agent.active
                    ? "border-accent bg-accent/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{agent.role}</div>
                    <div className="text-xs text-slate-400">{agent.expert}</div>
                  </div>
                  {agent.active && <span className="w-2 h-2 bg-accent mt-1" />}
                </div>
                <div className="text-[10px] text-slate-400 mb-2">{agent.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{agent.id}</span>
                  <span className="text-[10px] text-slate-400">{agent.lastRan}</span>
                </div>
                {(agent.decisionCount > 0 || agent.taskCount > 0) && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                    {agent.decisionCount > 0 && (
                      <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        {agent.decisionCount} dec
                      </span>
                    )}
                    {agent.taskCount > 0 && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {agent.taskCount} task{agent.taskCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const LAYERS = [
  {
    name: "Strategy",
    color: "bg-violet-500",
    agents: [
      { id: "ceo-bezos", role: "CEO", expert: "Jeff Bezos", description: "Priorities, decisions, direction" },
      { id: "cto-vogels", role: "CTO", expert: "Werner Vogels", description: "Architecture, tech choices" },
      { id: "critic-munger", role: "Critic", expert: "Charlie Munger", description: "Veto bad ideas, pre-mortem" },
    ],
  },
  {
    name: "Product",
    color: "bg-blue-500",
    agents: [
      { id: "product-norman", role: "Product", expert: "Don Norman", description: "UX, features, usability" },
      { id: "ui-duarte", role: "Design", expert: "Matias Duarte", description: "Visual design, design system" },
      { id: "interaction-cooper", role: "Interaction", expert: "Alan Cooper", description: "User flows, personas" },
    ],
  },
  {
    name: "Engineering",
    color: "bg-emerald-500",
    agents: [
      { id: "fullstack-dhh", role: "Engineering", expert: "DHH", description: "Write code, ship features" },
      { id: "qa-bach", role: "QA", expert: "James Bach", description: "Test strategy, quality gates" },
      { id: "devops-hightower", role: "DevOps", expert: "Kelsey Hightower", description: "Deploy, CI/CD, infra" },
    ],
  },
  {
    name: "Business",
    color: "bg-amber-500",
    agents: [
      { id: "marketing-godin", role: "Marketing", expert: "Seth Godin", description: "Positioning, distribution" },
      { id: "operations-pg", role: "Operations", expert: "Paul Graham", description: "User acquisition, retention" },
      { id: "sales-ross", role: "Sales", expert: "Aaron Ross", description: "Pricing, conversion" },
      { id: "cfo-campbell", role: "CFO", expert: "Patrick Campbell", description: "Financial model, unit economics" },
    ],
  },
  {
    name: "Intelligence",
    color: "bg-rose-500",
    agents: [
      { id: "research-thompson", role: "Research", expert: "Ben Thompson", description: "Market research, competitive analysis" },
    ],
  },
];
