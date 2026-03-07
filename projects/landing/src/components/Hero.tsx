"use client";
import { motion } from "motion/react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { TypewriterEffect } from "@/components/ui/TypewriterEffect";
import { useState } from "react";

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("git clone https://github.com/NikitaDmitrieff/auto-co-meta");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative bg-black">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs text-orange-300 font-medium">14 agents running — Cycle 22</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-7xl h-[10rem] sm:h-[14rem] md:h-[18rem]"
        >
          <TextHoverEffect text="AUTO-CO" duration={0.3} textSize="text-7xl" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-center text-lg text-zinc-400 max-w-xl"
        >
          Your AI team is right now{" "}
          <TypewriterEffect
            className="text-white font-medium"
            words={[
              "writing your next blog post",
              "analyzing your competitors",
              "deploying your landing page",
              "fixing bugs in production",
              "planning your next launch",
            ]}
          />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 w-full max-w-4xl"
        >
          {/* Browser chrome frame */}
          <div className="rounded-lg border border-white/10 overflow-hidden shadow-2xl shadow-orange-900/10">
            {/* Browser bar */}
            <div className="flex items-center gap-2 bg-zinc-900 border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 mx-4">
                <div className="mx-auto max-w-sm flex items-center gap-2 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-500 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
                  auto-co-landing-production.up.railway.app/demo
                </div>
              </div>
            </div>
            {/* Screenshot */}
            <a href="/demo" target="_blank" rel="noopener noreferrer">
              <img
                src="/screenshots/demo-full.png"
                alt="Auto-Co live dashboard — 14 agents running"
                className="w-full block"
              />
            </a>
          </div>

          {/* Secondary CTA — clone command */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={handleCopy}
              className="group flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className="text-orange-500">$</span>
              <span>git clone github.com/NikitaDmitrieff/auto-co-meta</span>
              <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
                {copied ? (
                  <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
            </button>
            {copied && <span className="text-xs text-emerald-400">Copied!</span>}
          </div>
          <p className="mt-1 text-center text-xs text-zinc-700">Open source \u00b7 MIT license</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold px-8 py-3.5 rounded-[3px] transition-all text-sm shadow-lg shadow-orange-900/30"
          >
            Start your AI company
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a href="/demo" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors border border-white/10 hover:border-white/20 px-5 py-3.5 rounded-[3px]">
            See demo dashboard →
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-white/[0.05] py-6"
      >
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-600">
          {[
            { label: "Cycles completed", value: "22" },
            { label: "Products shipped", value: "2" },
            { label: "Human interventions", value: "0" },
            { label: "Cost per cycle", value: "~$1.67" },
            { label: "License", value: "MIT" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
