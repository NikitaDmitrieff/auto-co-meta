"use client";
import { motion } from "motion/react";

const plans = [
  {
    name: "Open Source",
    price: "Free",
    period: "forever",
    description: "Full source code, MIT license. Self-host on any server.",
    cta: "View on GitHub",
    ctaHref: "https://github.com/NikitaDmitrieff/auto-co-meta",
    ctaExternal: true,
    highlight: false,
    features: ["Full source code — MIT license", "All 14 AI agents included", "Run on your own server", "Docker + Compose ready", "Community support"],
  },
  {
    name: "Hosted",
    price: "$49",
    period: "/ month",
    description: "Zero setup. We run it for you. Your AI company, live in minutes.",
    cta: "Join the waitlist",
    ctaHref: "#waitlist",
    ctaExternal: false,
    highlight: true,
    badge: "Most popular",
    features: ["No server setup required", "Telegram notifications built in", "Dashboard + cycle history", "Automatic updates", "Priority support"],
  },
  {
    name: "Pro",
    price: "$99",
    period: "/ month",
    description: "Run multiple AI companies with custom agents and integrations.",
    cta: "Join the waitlist",
    ctaHref: "#waitlist",
    ctaExternal: false,
    highlight: false,
    features: ["Everything in Hosted", "Up to 5 AI companies", "Custom agent personas", "Webhook integrations", "Dedicated support"],
  },
];

export default function Pricing() {
  return (
    <section className="bg-black px-6 py-32 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-3xl md:text-5xl font-bold font-[helvetica] text-white mb-4">
          Less than one hour{" "}
          <span className="text-zinc-500">of a consultant&apos;s time.</span>
        </h2>
        <p className="text-zinc-500 max-w-xl text-lg">
          Start free with open source. Upgrade to hosted when you want zero maintenance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={"relative flex flex-col " + (plan.highlight ? "glass-card border-orange-500/30 shadow-xl shadow-orange-900/10" : "glass-card")}
            style={{ padding: "1.5rem" }}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs text-black font-bold bg-orange-500 px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className="text-zinc-600 text-xs font-medium mb-2">{plan.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white font-[helvetica]">{plan.price}</span>
                <span className="text-zinc-600 text-sm">{plan.period}</span>
              </div>
            </div>

            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{plan.description}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-zinc-400">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.ctaHref}
              target={plan.ctaExternal ? "_blank" : undefined}
              rel={plan.ctaExternal ? "noopener noreferrer" : undefined}
              className={"text-center text-sm font-semibold py-3 rounded-[3px] transition-all " + (plan.highlight ? "bg-orange-500 hover:bg-orange-400 text-black shadow-lg shadow-orange-900/20" : "border border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.03]")}
            >
              {plan.cta}
            </a>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-zinc-700 mt-8">
        Prices in USD. Cancel anytime. No lock-in.
      </p>
    </section>
  );
}
