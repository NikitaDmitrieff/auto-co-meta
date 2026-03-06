"use client";
import { motion } from "motion/react";

const agents = [
  { initials: "CEO", name: "Jeff Bezos", role: "Chief Executive", description: "Sets direction, makes final calls on strategy and resource allocation.", gradient: "from-orange-600 to-red-700" },
  { initials: "CTO", name: "Werner Vogels", role: "Chief Technology", description: "Architecture, tech selection, system design, and reliability.", gradient: "from-blue-600 to-indigo-700" },
  { initials: "CFO", name: "Patrick Campbell", role: "Chief Financial", description: "Unit economics, pricing models, revenue metrics, and cost control.", gradient: "from-amber-500 to-orange-600" },
  { initials: "MKT", name: "Seth Godin", role: "Marketing", description: "Positioning, brand differentiation, content strategy, and distribution.", gradient: "from-pink-600 to-rose-700" },
  { initials: "ENG", name: "DHH", role: "Engineering", description: "Writes and ships code, reviews PRs, maintains clean architecture.", gradient: "from-emerald-600 to-teal-700" },
  { initials: "OPS", name: "Paul Graham", role: "Operations", description: "Early growth, user acquisition, retention, and operational metrics.", gradient: "from-sky-600 to-cyan-700" },
  { initials: "QA", name: "James Bach", role: "Quality Assurance", description: "Test strategy, pre-release quality gates, bug triage, and quality risk.", gradient: "from-red-600 to-rose-700" },
  { initials: "RES", name: "Ben Thompson", role: "Research", description: "Market research, competitive analysis, business model deconstruction.", gradient: "from-slate-500 to-slate-700" },
];

export default function Agents() {
  return (
    <section className="bg-black px-6 py-32 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Meet your team</p>
        <h2 className="text-3xl md:text-5xl font-bold font-[helvetica] text-white mb-4">
          14 world-class minds.{" "}
          <span className="text-zinc-500">One subscription.</span>
        </h2>
        <p className="text-zinc-500 max-w-xl text-lg">
          Each agent is modeled on a legendary expert in their field. They collaborate,
          challenge each other, and ship — no meetings, no sick days, no salary.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.initials}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="glass-card glow-border p-5 cursor-default"
          >
            <div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + agent.gradient + " flex items-center justify-center text-white text-xs font-bold mb-3"}>
              {agent.initials}
            </div>
            <div className="text-xs text-zinc-600 mb-0.5">{agent.role}</div>
            <div className="text-sm font-semibold text-white mb-2 font-[helvetica]">{agent.name}</div>
            <p className="text-xs text-zinc-500 leading-relaxed">{agent.description}</p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-card border-dashed p-5 flex flex-col items-center justify-center text-center"
        >
          <div className="text-2xl font-bold text-zinc-700 mb-1">+6</div>
          <div className="text-xs text-zinc-600">more agents</div>
          <div className="text-xs text-zinc-700 mt-2">Designer, DevOps, Sales, Critic & more</div>
        </motion.div>
      </div>
    </section>
  );
}
