"use client";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";

const agents = [
  { initials: "CEO", name: "Jeff Bezos", role: "Strategy", desc: "Direction, final calls, resource allocation", gradient: "from-orange-600 to-red-700" },
  { initials: "CTO", name: "Werner Vogels", role: "Architecture", desc: "Tech selection, system design, reliability", gradient: "from-blue-600 to-indigo-700" },
  { initials: "CRIT", name: "Charlie Munger", role: "Critic", desc: "Challenges every plan, prevents groupthink", gradient: "from-gray-600 to-gray-700" },
  { initials: "CFO", name: "Patrick Campbell", role: "Finance", desc: "Unit economics, pricing, revenue metrics", gradient: "from-amber-500 to-orange-600" },
  { initials: "ENG", name: "DHH", role: "Engineering", desc: "Ships code, reviews PRs, clean architecture", gradient: "from-emerald-600 to-teal-700" },
  { initials: "DVP", name: "Kelsey Hightower", role: "DevOps", desc: "Deploys, CI/CD, infra, incident response", gradient: "from-slate-500 to-slate-700" },
  { initials: "RES", name: "Ben Thompson", role: "Research", desc: "Market research, competitive analysis", gradient: "from-slate-400 to-slate-600" },
  { initials: "PRD", name: "Don Norman", role: "Product", desc: "Features, usability, user experience", gradient: "from-yellow-600 to-amber-700" },
  { initials: "UI", name: "Matias Duarte", role: "Design", desc: "Visual style, design system, motion", gradient: "from-violet-600 to-purple-700" },
  { initials: "IX", name: "Alan Cooper", role: "Interaction", desc: "User flows, personas, navigation", gradient: "from-sky-500 to-blue-600" },
  { initials: "MKT", name: "Seth Godin", role: "Marketing", desc: "Positioning, distribution, brand", gradient: "from-pink-600 to-rose-700" },
  { initials: "OPS", name: "Paul Graham", role: "Operations", desc: "Growth, retention, community", gradient: "from-sky-600 to-cyan-700" },
  { initials: "SLS", name: "Aaron Ross", role: "Sales", desc: "Pricing, conversion, acquisition", gradient: "from-green-600 to-emerald-700" },
  { initials: "QA", name: "James Bach", role: "Quality", desc: "Test strategy, quality gates, bug triage", gradient: "from-red-600 to-rose-700" },
];

const LAYERS = [
  { label: "Strategy", color: "text-orange-400", indices: [0, 1, 2] },
  { label: "Product", color: "text-violet-400", indices: [7, 8, 9] },
  { label: "Engineering", color: "text-emerald-400", indices: [4, 5, 13] },
  { label: "Business", color: "text-pink-400", indices: [3, 10, 11, 12] },
  { label: "Intelligence", color: "text-slate-400", indices: [6] },
];

function AgentPill({ agent, index, hovered, setHovered }: { agent: typeof agents[0]; index: number; hovered: number | null; setHovered: (i: number | null) => void }) {
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered === index && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ x: springX }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 shadow-xl shadow-black/40 text-center whitespace-nowrap">
              <div className="text-sm font-bold text-white">{agent.name}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{agent.desc}</div>
            </div>
            {/* Arrow */}
            <div className="w-3 h-3 bg-zinc-900/95 border-r border-b border-white/10 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar */}
      <motion.div
        animate={{
          scale: hovered === index ? 1.15 : hovered !== null ? 0.95 : 1,
          opacity: hovered !== null && hovered !== index ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white text-[10px] font-bold cursor-pointer ring-2 ring-black shadow-lg shadow-black/30`}
      >
        {agent.initials}
      </motion.div>
      {/* Role label under avatar */}
      <motion.div
        animate={{ opacity: hovered === index ? 1 : 0.4 }}
        className="text-[9px] text-zinc-500 text-center mt-1.5 font-medium"
      >
        {agent.role}
      </motion.div>
    </div>
  );
}

export default function Agents() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="bg-black px-6 py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Meet your team</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            14 world-class minds.{" "}
            <span className="text-zinc-500">One subscription.</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg">
            Each agent is modeled on a legendary expert. They collaborate,
            challenge each other, and ship — no meetings, no salary.
          </p>
        </motion.div>

        {/* Agent layers — grouped by function */}
        <div className="space-y-8">
          {LAYERS.map((layer, layerIdx) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: layerIdx * 0.08 }}
              className="flex items-center gap-6"
            >
              {/* Layer label */}
              <div className="w-24 flex-shrink-0 text-right">
                <span className={`text-xs font-semibold uppercase tracking-wider ${layer.color}`}>{layer.label}</span>
              </div>

              {/* Connecting line */}
              <div className="w-8 h-px bg-white/[0.08] flex-shrink-0" />

              {/* Agent avatars */}
              <div className="flex items-center gap-4">
                {layer.indices.map((agentIdx) => (
                  <AgentPill
                    key={agents[agentIdx].initials}
                    agent={agents[agentIdx]}
                    index={agentIdx}
                    hovered={hovered}
                    setHovered={setHovered}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary stat */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-6 text-xs text-zinc-600"
        >
          <span>14 agents</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>5 layers</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>24/7 autonomous</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>~$1.40 per cycle</span>
        </motion.div>
      </div>
    </section>
  );
}
