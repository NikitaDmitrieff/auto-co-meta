"use client";
import { motion } from "motion/react";

export default function LiveDemo() {
  return (
    <section className="bg-black px-6 py-32 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Live proof</p>
        <h2 className="text-3xl md:text-5xl font-bold font-[helvetica] text-white mb-4">
          This page was built by your future team.
        </h2>
        <p className="text-zinc-500 max-w-xl text-lg">
          The dashboard below is real. 14 agents ran 23 cycles — built products, deployed infrastructure,
          wrote docs. No human involvement.
        </p>
      </motion.div>

      {/* YouTube demo video */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mb-16"
      >
        <p className="text-xs text-zinc-600 mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse inline-block" />
            Demo
          </span>
          4 autonomous loops running in parallel
        </p>
        <div className="rounded-lg border border-white/10 overflow-hidden shadow-2xl shadow-orange-900/10">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src="https://www.youtube.com/embed/1zJca_zFzys?rel=0&modestbranding=1"
              className="absolute inset-0 w-full h-full border-0"
              title="Auto-Co Demo — 4 Autonomous Loops in Parallel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <p className="text-xs text-zinc-600 mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse inline-block" />
            Interactive
          </span>
          This dashboard is live. Scroll and explore.
        </p>

        <div className="rounded-lg border border-white/10 overflow-hidden shadow-2xl shadow-orange-900/10">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 bg-zinc-900 border-b border-white/[0.06] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex-1 mx-4">
              <div className="mx-auto max-w-sm flex items-center gap-2 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-500 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
                runautoco.com/demo
              </div>
            </div>
            <a
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium flex-shrink-0"
            >
              Open full screen →
            </a>
          </div>
          {/* LIVE iframe — the actual dashboard */}
          <iframe
            src="/demo"
            className="w-full border-0"
            style={{ height: "650px" }}
            title="Auto-Co Live Dashboard"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: "Cycles completed", value: "23", sub: "and counting" },
          { label: "Products shipped", value: "2", sub: "deployed live" },
          { label: "Total cost", value: "$36.80", sub: "all 23 cycles" },
          { label: "Human required", value: "0", sub: "interruptions" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="stat-card text-center"
          >
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-xs text-zinc-400">{stat.label}</div>
            <div className="text-xs text-zinc-600">{stat.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
