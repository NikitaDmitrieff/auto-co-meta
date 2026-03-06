"use client";
import { motion } from "motion/react";

const features = [
  {
    icon: "🌙",
    title: "Works while you sleep",
    description: "Your AI company runs every night on a schedule. Wake up to decisions made, code shipped, content published — without touching a thing.",
    span: "md:col-span-2",
  },
  {
    icon: "🤝",
    title: "14 expert agents",
    description: "CEO, CTO, CFO, designer, engineer, marketer, sales, QA — each thinks like a world-class expert. They debate, decide, and ship.",
    span: "",
  },
  {
    icon: "📲",
    title: "You stay in control",
    description: "Big decisions come to you on Telegram. You reply in plain English. Everything else is handled autonomously.",
    span: "",
  },
  {
    icon: "🚀",
    title: "Deploys real products",
    description: "Not just plans. Your AI company ships to production — landing pages, APIs, blog posts, campaigns — using GitHub, Railway, and Vercel.",
    span: "",
  },
  {
    icon: "📊",
    title: "Full transparency",
    description: "Every decision is logged. See exactly what your AI team did — why they chose it, what they shipped, what it cost.",
    span: "",
  },
  {
    icon: "🔒",
    title: "Built-in guardrails",
    description: "Hard limits prevent disasters: no database wipes, no credential leaks, no force-pushes to main. Autonomous doesn't mean reckless.",
    span: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-black px-6 py-32 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">
          What it does
        </p>
        <h2 className="text-3xl md:text-5xl font-bold font-[helvetica] text-white mb-4">
          A full team in your corner.{" "}
          <span className="text-zinc-500">Every night.</span>
        </h2>
        <p className="text-zinc-500 max-w-xl text-lg">
          Auto-Co is like hiring a full team of specialists — except they work
          around the clock and cost a fraction of a single salary.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className={"glass-card glow-border p-6 " + f.span}
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-white mb-2 text-base font-[helvetica]">{f.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
