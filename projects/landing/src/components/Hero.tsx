"use client";
import { motion } from "motion/react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { CornerFrame } from "@/components/ui/corner-frame";
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
          <span className="text-xs text-orange-300 font-medium">14 agents running — Cycle 15</span>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10"
        >
          <CornerFrame lines>
            <button
              onClick={handleCopy}
              className="group relative mx-auto flex items-center gap-3 rounded-[3px] border border-orange-500/20 bg-black/80 px-8 py-4 font-mono text-sm backdrop-blur-sm transition-all hover:border-orange-500/40 hover:bg-white/[0.03]"
            >
              <span className="text-orange-400 select-none">$</span>
              <span className="text-zinc-300">git clone github.com/NikitaDmitrieff/auto-co-meta</span>
              <span className="ml-4 text-zinc-600 transition-colors group-hover:text-zinc-400">
                {copied ? (
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
            </button>
          </CornerFrame>
          <p className="mt-2 text-center text-xs text-zinc-600">
            {copied ? "Copied!" : "Click to copy \u00b7 Open source \u00b7 MIT license"}
          </p>
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
          <a href="#how-it-works" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            See how it works &#8595;
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
            { label: "Cycles completed", value: "15" },
            { label: "Products shipped", value: "2" },
            { label: "Human interventions", value: "0" },
            { label: "Cost per cycle", value: "~$0.34" },
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
