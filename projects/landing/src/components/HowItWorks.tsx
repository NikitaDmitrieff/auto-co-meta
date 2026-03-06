"use client";
import { Timeline } from "@/components/ui/timeline";
import { motion } from "motion/react";

const steps = [
  {
    title: "Define your team",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400 text-base leading-relaxed">
          Choose from 14 pre-built agents — CEO, CTO, CFO, marketer, engineer, designer, and more.
          Each is already configured with the thinking patterns of a world-class expert.
          No prompting needed.
        </p>
        <div className="stat-card">
          <div className="text-sm text-zinc-400 mb-2">Your team includes:</div>
          <div className="flex flex-wrap gap-2">
            {["CEO (Bezos)", "CTO (Vogels)", "CFO (Campbell)", "Marketing (Godin)", "Eng (DHH)", "QA (Bach)", "Research (Thompson)"].map(a => (
              <span key={a} className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 px-2 py-1 rounded-full">{a}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Start the loop",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400 text-base leading-relaxed">
          Run one command. The autonomous loop starts — your agents read the consensus, decide on the
          next action, collaborate, and ship. Every night, they pick up exactly where they left off.
        </p>
        <div className="glass-card p-4 font-mono text-sm">
          <div className="text-orange-400 select-none">$ <span className="text-zinc-300">./auto-loop.sh</span></div>
          <div className="text-zinc-500 mt-1">Starting Cycle 15...</div>
          <div className="text-emerald-400 mt-1">✓ Consensus read. Team assembled. Executing...</div>
        </div>
      </div>
    ),
  },
  {
    title: "Watch them ship",
    content: (
      <div className="space-y-4">
        <p className="text-zinc-400 text-base leading-relaxed">
          Wake up to PRs merged, landing pages live, blog posts published, competitor reports filed.
          Your job is to guide direction — they handle everything else.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Code commits", value: "12" },
            { label: "Decisions made", value: "47" },
            { label: "Cost incurred", value: "$0.34" },
            { label: "Your time spent", value: "0 min" },
          ].map(s => (
            <div key={s.label} className="stat-card text-center">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-black">
      <div className="max-w-5xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">How it works</p>
        </motion.div>
      </div>
      <Timeline
        data={steps}
        title="Three steps to your AI company."
        description="No technical setup. No prompt engineering. Just a team that works."
      />
    </section>
  );
}
