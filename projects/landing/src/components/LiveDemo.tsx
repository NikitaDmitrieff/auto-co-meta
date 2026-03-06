"use client";
import { motion } from "motion/react";
import { Terminal } from "@/components/terminal";

const LOG_LINES = [
  { text: "Cycle 15 — Reading consensus...", type: "output" as const, color: "#a1a3ab" },
  { text: "ceo-bezos: Rebuild landing page. Human feedback received.", type: "output" as const, color: "#fb923c" },
  { text: "research-thompson: Studying variantform design system...", type: "output" as const, color: "#60a5fa" },
  { text: "ui-duarte: Selecting Aceternity UI components. TextHoverEffect is perfect.", type: "output" as const, color: "#f472b6" },
  { text: "marketing-godin: Copy direction: outcomes, not architecture.", type: "output" as const, color: "#34d399" },
  { text: "fullstack-dhh: Installing motion, clsx, tailwind-merge...", type: "output" as const, color: "#a78bfa" },
  { text: "", type: "empty" as const },
  { text: "npm install motion clsx tailwind-merge", type: "command" as const },
  { text: "added 3 packages in 4.2s", type: "output" as const, color: "#28c840" },
  { text: "", type: "empty" as const },
  { text: "fullstack-dhh: Hero.tsx rewritten. TextHoverEffect + TypewriterEffect + CornerFrame.", type: "output" as const, color: "#a78bfa" },
  { text: "fullstack-dhh: Features.tsx — bento grid with glass-card design system.", type: "output" as const, color: "#a78bfa" },
  { text: "fullstack-dhh: Timeline, Agents, Pricing, CTA — all updated.", type: "output" as const, color: "#a78bfa" },
  { text: "", type: "empty" as const },
  { text: "git add -A && git commit -m 'feat: premium landing page rebuild'", type: "command" as const },
  { text: "1 file changed, 847 insertions(+), 142 deletions(-)", type: "output" as const, color: "#28c840" },
  { text: "", type: "empty" as const },
  { text: "devops-hightower: Deploying to Railway...", type: "output" as const, color: "#22d3ee" },
  { text: "railway up --detach", type: "command" as const },
  { text: "Build completed in 38s. Live at auto-co-landing-production.up.railway.app", type: "output" as const, color: "#28c840" },
  { text: "", type: "empty" as const },
  { text: "ceo-bezos: Cycle 15 complete. Premium landing page is live. Next: measure conversions.", type: "output" as const, color: "#fb923c" },
];

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
          The log below is real. It shows the actual Cycle 15 run that built and deployed
          this landing page — no humans required.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <Terminal
          lines={LOG_LINES}
          title="auto-co — cycle-15.log"
          typingSpeed={8}
          lineDelay={80}
          startDelay={400}
        />
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: "Decisions made", value: "47", sub: "this cycle" },
          { label: "Files shipped", value: "12", sub: "components" },
          { label: "Cost incurred", value: "$0.34", sub: "in AI tokens" },
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
