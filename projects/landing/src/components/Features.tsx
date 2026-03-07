"use client";
import { useState } from "react";
import { motion } from "motion/react";

const features = [
  { num: "01", title: "Runs while you sleep", desc: "Nightly cycles. Wake up to decisions made and code shipped.", accent: "border-l-orange-500", numColor: "text-orange-500/10", hoverNum: "group-hover:text-orange-500/25" },
  { num: "02", title: "14 expert agents", desc: "CEO to QA — each modeled on a legendary mind.", accent: "border-l-blue-500", numColor: "text-blue-500/10", hoverNum: "group-hover:text-blue-500/25" },
  { num: "03", title: "You stay in control", desc: "Big decisions come to Telegram. Reply in plain English.", accent: "border-l-emerald-500", numColor: "text-emerald-500/10", hoverNum: "group-hover:text-emerald-500/25" },
  { num: "04", title: "Ships real products", desc: "Deploys to GitHub, Railway, Vercel — not just plans.", accent: "border-l-violet-500", numColor: "text-violet-500/10", hoverNum: "group-hover:text-violet-500/25" },
  { num: "05", title: "Full transparency", desc: "Every decision logged — what, why, and what it cost.", accent: "border-l-amber-500", numColor: "text-amber-500/10", hoverNum: "group-hover:text-amber-500/25" },
  { num: "06", title: "Built-in guardrails", desc: "No DB wipes, no leaks, no force-pushes. Safety-first.", accent: "border-l-red-500", numColor: "text-red-500/10", hoverNum: "group-hover:text-red-500/25" },
];

export default function Features() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="features" className="bg-black px-6 py-24 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">
          What it does
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          A full team in your corner.{" "}
          <span className="text-zinc-500">Every night.</span>
        </h2>
        <p className="text-zinc-500 max-w-xl text-lg">
          Auto-Co is like hiring a full team of specialists — except they work
          around the clock and cost a fraction of a single salary.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`group relative bg-black border-l-2 ${f.accent} overflow-hidden cursor-default transition-all duration-200 ${
              hovered !== null && hovered !== i ? "opacity-50" : ""
            }`}
          >
            {/* Large background number */}
            <div className={`absolute -right-2 -top-3 text-[80px] font-black leading-none select-none pointer-events-none transition-colors duration-300 ${f.numColor} ${f.hoverNum}`}>
              {f.num}
            </div>

            <div className="relative z-10 px-5 py-5">
              <h3 className="text-sm font-bold text-white mb-1.5 tracking-tight">{f.title}</h3>
              <motion.p
                animate={{ opacity: hovered === i ? 1 : 0.5, y: hovered === i ? 0 : 2 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-zinc-500 leading-relaxed"
              >
                {f.desc}
              </motion.p>
            </div>

            {/* Hover highlight bar */}
            <motion.div
              animate={{ scaleX: hovered === i ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-0 left-0 right-0 h-px ${f.accent.replace("border-l-", "bg-")} origin-left`}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
