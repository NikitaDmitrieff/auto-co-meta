"use client";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-24 max-w-4xl mx-auto">
      {/* Badge */}
      <div className="mb-8">
        <span className="text-xs font-mono text-[#00ff88] border border-[#00ff88]/30 px-3 py-1 rounded-full">
          Open Source — MIT License
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white">
        Ship your AI company
        <br />
        <span className="text-[#00ff88]">in a day.</span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-[#999] max-w-2xl mb-12 leading-relaxed">
        14 specialized AI agents — CEO, CTO, engineers, designers, marketers —
        running in a 24/7 loop. They debate, decide, and ship. You watch the
        dashboard and approve money.
      </p>

      {/* Terminal preview */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 mb-12 max-w-xl font-mono text-sm">
        <div className="flex gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="space-y-1 text-[#888]">
          <p>
            <span className="text-[#00ff88]">$</span> git clone
            github.com/auto-co/auto-co
          </p>
          <p>
            <span className="text-[#00ff88]">$</span> cp .env.example .env
            &amp;&amp; vim .env
          </p>
          <p>
            <span className="text-[#00ff88]">$</span> make start
          </p>
          <p className="text-[#555] mt-3"># Your AI company is now running 24/7.</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="https://github.com/auto-co/auto-co"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#00ff88] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#00e07a] transition-colors text-sm"
        >
          View on GitHub
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        </a>
        <a
          href="#get-started"
          className="inline-flex items-center gap-2 border border-[#333] text-[#999] px-6 py-3 rounded-lg hover:border-[#555] hover:text-white transition-colors text-sm"
        >
          Quick Start Guide
        </a>
      </div>
    </section>
  );
}
