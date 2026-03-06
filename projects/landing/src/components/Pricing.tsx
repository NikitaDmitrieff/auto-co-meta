const plans = [
  {
    name: "Open Source",
    price: "Free",
    period: "forever",
    description: "For developers who want to self-host and customize everything.",
    cta: "View on GitHub",
    ctaHref: "https://github.com/NikitaDmitrieff/auto-co-meta",
    ctaExternal: true,
    highlight: false,
    features: [
      "Full source code — MIT license",
      "14 AI agents included",
      "Run on your own server",
      "Docker + Compose ready",
      "Community support",
    ],
  },
  {
    name: "Hosted",
    price: "$49",
    period: "per month",
    description: "Managed, no-code version. Set it up in minutes, not hours.",
    cta: "Join the waitlist",
    ctaHref: "#waitlist",
    ctaExternal: false,
    highlight: true,
    features: [
      "No server setup required",
      "Dashboard included",
      "Telegram notifications built in",
      "Automatic updates",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    period: "per month",
    description: "Multiple projects, custom agents, and advanced integrations.",
    cta: "Join the waitlist",
    ctaHref: "#waitlist",
    ctaExternal: false,
    highlight: false,
    features: [
      "Everything in Hosted",
      "Up to 5 AI companies",
      "Custom agent personas",
      "Webhook integrations",
      "Dedicated support",
    ],
  },
];

export default function Pricing() {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">
        Simple pricing.
        <br />
        <span className="text-slate-400">Less than one hour of a consultant&apos;s time.</span>
      </h2>
      <p className="text-slate-500 mb-16 max-w-xl">
        Start free with the open-source core. Upgrade to the hosted version when
        you want zero maintenance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col transition-shadow ${
              plan.highlight
                ? "border-2 border-violet-600 bg-white shadow-lg shadow-violet-100"
                : "border border-slate-100 bg-white shadow-sm hover:shadow-md"
            }`}
          >
            {plan.highlight && (
              <div className="text-xs text-violet-600 font-semibold mb-3 bg-violet-50 px-2 py-0.5 rounded-full w-fit">
                Most popular
              </div>
            )}
            <div className="mb-4">
              <div className="text-slate-500 text-xs font-medium mb-1">
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-slate-400 text-sm">/{plan.period}</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {plan.description}
            </p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-violet-500 mt-0.5 font-medium">✓</span>
                  <span className="text-slate-600">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={plan.ctaHref}
              target={plan.ctaExternal ? "_blank" : undefined}
              rel={plan.ctaExternal ? "noopener noreferrer" : undefined}
              className={`text-center text-sm font-semibold py-3 rounded-xl transition-colors ${
                plan.highlight
                  ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
