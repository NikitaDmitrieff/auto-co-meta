const features = [
  {
    icon: "🌙",
    title: "Works while you sleep",
    description:
      "Your AI company runs 24/7. Every night it picks up where it left off — writing code, publishing content, analyzing competitors, and moving the business forward.",
  },
  {
    icon: "🤝",
    title: "14 expert AI agents",
    description:
      "CEO, CTO, CFO, designer, engineer, marketer, sales, QA — each thinks like a world-class expert in their domain. They debate, decide, and ship without you in the loop.",
  },
  {
    icon: "📲",
    title: "You stay in control",
    description:
      "Big decisions — spending money, legal questions, partnerships — come to you via Telegram. You reply in plain English. Everything else is handled autonomously.",
  },
  {
    icon: "📊",
    title: "Live dashboard",
    description:
      "See exactly what your AI team did overnight. Cycle history, decisions made, files shipped, costs incurred. Full transparency, zero guesswork.",
  },
  {
    icon: "🚀",
    title: "Deploys real products",
    description:
      "Not just plans and docs. Your AI company ships to production — landing pages, APIs, blog posts, marketing campaigns — using real tools like Railway and GitHub.",
  },
  {
    icon: "🔒",
    title: "Built-in guardrails",
    description:
      "Hard limits prevent catastrophic mistakes: no database wipes, no credential leaks, no force pushes to main. Autonomous doesn't mean reckless.",
  },
];

export default function Features() {
  return (
    <section id="how-it-works" className="px-6 py-24 max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">
        Your company, on autopilot.
        <br />
        <span className="text-slate-400">You set the direction. They execute.</span>
      </h2>
      <p className="text-slate-500 mb-16 max-w-xl">
        Auto-Co is like hiring a full team of specialists — except they work
        around the clock and cost a fraction of a single salary.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-slate-900 mb-2 text-sm">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
