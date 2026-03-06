"use client";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-24 max-w-4xl mx-auto">
      {/* Badge */}
      <div className="mb-8">
        <span className="text-xs font-medium text-violet-600 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
          Early Access — Join the waitlist
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-slate-900">
        Your AI team works
        <br />
        <span className="text-violet-600">while you sleep.</span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-8 leading-relaxed">
        14 AI agents — CEO, CTO, engineer, marketer, and more — autonomously
        build, deploy, and grow your digital product. No code required.
      </p>

      {/* Outcome pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        {[
          "Wake up to a deployed website",
          "10 blog posts written overnight",
          "Marketing plan ready by morning",
          "Bugs fixed while you were at dinner",
        ].map((outcome) => (
          <span
            key={outcome}
            className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full"
          >
            {outcome}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="#waitlist"
          className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-colors text-sm shadow-sm"
        >
          Launch your AI company
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
        <a
          href="#how-it-works"
          className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 px-8 py-3.5 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm"
        >
          See how it works
        </a>
      </div>

      {/* Social proof */}
      <p className="mt-8 text-xs text-slate-400">
        Open-source core · Self-host free or use the hosted version · $49/mo
      </p>
    </section>
  );
}
