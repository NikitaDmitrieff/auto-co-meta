export default function TeamPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Team</h2>
        <p className="text-sm text-slate-400 mt-0.5">14 AI agents modeled on world-class experts</p>
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 mb-6">
        <div className="border border-slate-200 px-4 py-3 flex-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Total Agents</div>
          <div className="text-xl font-bold font-mono text-slate-900">14</div>
        </div>
        <div className="border border-slate-200 px-4 py-3 flex-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Active This Cycle</div>
          <div className="text-xl font-bold font-mono text-accent">4</div>
        </div>
        <div className="border border-slate-200 px-4 py-3 flex-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Layers</div>
          <div className="text-xl font-bold font-mono text-slate-900">5</div>
        </div>
      </div>

      {/* Agent groups */}
      {LAYERS.map((layer) => (
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
      { id: "ceo-bezos", role: "CEO", expert: "Jeff Bezos", description: "Priorities, decisions, direction", lastRan: "Cycle #104", active: true },
      { id: "cto-vogels", role: "CTO", expert: "Werner Vogels", description: "Architecture, tech choices", lastRan: "Cycle #101", active: false },
      { id: "critic-munger", role: "Critic", expert: "Charlie Munger", description: "Veto bad ideas, pre-mortem", lastRan: "Cycle #99", active: false },
    ],
  },
  {
    name: "Product",
    color: "bg-blue-500",
    agents: [
      { id: "product-norman", role: "Product", expert: "Don Norman", description: "UX, features, usability", lastRan: "Cycle #104", active: true },
      { id: "ui-duarte", role: "Design", expert: "Matias Duarte", description: "Visual design, design system", lastRan: "Cycle #98", active: false },
      { id: "interaction-cooper", role: "Interaction", expert: "Alan Cooper", description: "User flows, personas", lastRan: "Cycle #95", active: false },
    ],
  },
  {
    name: "Engineering",
    color: "bg-emerald-500",
    agents: [
      { id: "fullstack-dhh", role: "Engineering", expert: "DHH", description: "Write code, ship features", lastRan: "Cycle #104", active: true },
      { id: "qa-bach", role: "QA", expert: "James Bach", description: "Test strategy, quality gates", lastRan: "Cycle #104", active: true },
      { id: "devops-hightower", role: "DevOps", expert: "Kelsey Hightower", description: "Deploy, CI/CD, infra", lastRan: "Cycle #103", active: false },
    ],
  },
  {
    name: "Business",
    color: "bg-amber-500",
    agents: [
      { id: "marketing-godin", role: "Marketing", expert: "Seth Godin", description: "Positioning, distribution", lastRan: "Cycle #102", active: false },
      { id: "operations-pg", role: "Operations", expert: "Paul Graham", description: "User acquisition, retention", lastRan: "Cycle #100", active: false },
      { id: "sales-ross", role: "Sales", expert: "Aaron Ross", description: "Pricing, conversion", lastRan: "Cycle #97", active: false },
      { id: "cfo-campbell", role: "CFO", expert: "Patrick Campbell", description: "Financial model, unit economics", lastRan: "Cycle #101", active: false },
    ],
  },
  {
    name: "Intelligence",
    color: "bg-rose-500",
    agents: [
      { id: "research-thompson", role: "Research", expert: "Ben Thompson", description: "Market research, competitive analysis", lastRan: "Cycle #96", active: false },
    ],
  },
];
