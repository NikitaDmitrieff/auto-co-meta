import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "How to Build an AI Agent Team: A Step-by-Step Guide (2026) — Auto-Co",
  description:
    "Learn how to build a team of AI agents that collaborate, make decisions, and ship real software. Covers agent roles, coordination patterns, and a working open-source implementation.",
  openGraph: {
    title: "How to Build an AI Agent Team: A Step-by-Step Guide (2026)",
    description:
      "Build a team of AI agents that collaborate and ship real software. Agent roles, coordination patterns, and working code.",
    type: "article",
    url: "https://runautoco.com/blog/how-to-build-ai-agent-team",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Build an AI Agent Team (2026 Guide)",
    description:
      "Agent roles, coordination patterns, convergence rules, and working open-source code for multi-agent AI systems.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "How to Build an AI Agent Team: A Step-by-Step Guide",
  description:
    "Learn how to build a team of AI agents that collaborate, make decisions, and ship real software. Covers agent roles, coordination patterns, and a working open-source implementation.",
  datePublished: "2026-03-07",
  dateModified: "2026-03-07",
  author: { "@type": "Organization", name: "Auto-Co" },
  publisher: {
    "@type": "Organization",
    name: "Auto-Co",
    url: "https://runautoco.com",
  },
  url: "https://runautoco.com/blog/how-to-build-ai-agent-team",
  mainEntityOfPage: "https://runautoco.com/blog/how-to-build-ai-agent-team",
  keywords: [
    "AI agent team",
    "multi-agent system",
    "how to build AI agents",
    "AI collaboration",
    "autonomous AI",
    "Claude",
    "LLM agents",
    "agent orchestration",
  ],
};

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-900 border border-white/[0.06] rounded-lg p-4 overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed my-6">
      <code>{children}</code>
    </pre>
  );
}

export default function HowToBuildAIAgentTeam() {
  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            &larr; Back to blog
          </Link>
        </div>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-xs text-zinc-600">
            <time>2026-03-07</time>
            <span>&middot;</span>
            <span>10 min read</span>
            <span>&middot;</span>
            <span className="text-orange-400/60">Tutorial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            How to Build an AI Agent Team: A Step-by-Step Guide
          </h1>
          <p className="text-lg text-zinc-400">
            Most AI agent tutorials show you a single chatbot. This guide shows
            you how to build a team of specialized AI agents that collaborate,
            make decisions, and ship real software — with working code you can
            run today.
          </p>
        </header>

        <article className="prose-custom">
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Why a team, not a single agent?
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              A single AI agent with a massive prompt hits a ceiling fast. It
              tries to be everything — planner, coder, reviewer, designer — and
              excels at nothing. The prompt gets bloated, context fills up, and
              output quality degrades.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-4">
              A team of specialized agents solves this.{" "}
              <strong className="text-white">
                Each agent has one job, one expert persona, and one set of tools.
              </strong>{" "}
              A &ldquo;CTO agent&rdquo; thinks about architecture. A
              &ldquo;QA agent&rdquo; thinks about testing. A &ldquo;Marketing
              agent&rdquo; thinks about positioning. They collaborate through a
              shared state file, not a group chat.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              This guide walks through the exact pattern we use in{" "}
              <a
                href="https://github.com/NikitaDmitrieff/auto-co-meta"
                className="text-orange-400 hover:text-orange-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Auto-Co
              </a>
              , an open-source framework that has run 35+ autonomous cycles,
              shipping a full product for under $50 total.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Step 1: Define your agent roles
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Start with the minimum viable team. You don&apos;t need 14 agents
              on day one. Start with 3-4 that cover the core loop:
            </p>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-zinc-400 font-semibold px-3 py-2 border-b border-white/[0.08]">
                      Role
                    </th>
                    <th className="text-left text-zinc-400 font-semibold px-3 py-2 border-b border-white/[0.08]">
                      Job
                    </th>
                    <th className="text-left text-zinc-400 font-semibold px-3 py-2 border-b border-white/[0.08]">
                      When to add
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">
                      Decision-maker
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      Reads state, decides what to do, picks the team
                    </td>
                    <td className="px-3 py-2 text-zinc-300">Day 1</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">Builder</td>
                    <td className="px-3 py-2 text-zinc-300">
                      Writes code, implements features, deploys
                    </td>
                    <td className="px-3 py-2 text-zinc-300">Day 1</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">Critic</td>
                    <td className="px-3 py-2 text-zinc-300">
                      Challenges decisions, finds flaws, prevents groupthink
                    </td>
                    <td className="px-3 py-2 text-zinc-300">Day 1</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">Researcher</td>
                    <td className="px-3 py-2 text-zinc-300">
                      Gathers market data, validates assumptions
                    </td>
                    <td className="px-3 py-2 text-zinc-300">When needed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-4">
              The key principle:{" "}
              <strong className="text-white">
                personas encode thinking frameworks, not just job titles
              </strong>
              . &ldquo;CTO&rdquo; is vague. &ldquo;Werner Vogels — everything
              fails all the time, design for failure&rdquo; gives the agent a
              specific mental model to apply.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Each agent definition is a markdown file that describes the
              expert&apos;s thinking patterns, decision heuristics, and default
              behaviors:
            </p>
            <Code>{`# Agent: critic-munger
## Expert Model: Charlie Munger
## Core Thinking Patterns:
- Inversion: "What would guarantee failure?"
- Checklist: systematic evaluation of every major decision
- Psychology of misjudgment: identify cognitive biases in the team
## Default Behavior:
- Must be consulted before any major decision
- Can veto but cannot delay — if vetoing, must suggest alternative
- Always asks: "What's the downside? What am I missing?"`}</Code>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Step 2: Build the coordination mechanism
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              This is where most multi-agent systems fail. Agents need to share
              state across sessions, but LLMs forget everything between
              invocations. You need a coordination mechanism.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We tested three approaches:
            </p>
            <ul className="space-y-3 text-zinc-400 leading-relaxed list-disc list-inside mb-4">
              <li>
                <strong className="text-zinc-200">Vector database</strong> —
                Too noisy. Agents retrieved irrelevant context and made worse
                decisions than having no memory.
              </li>
              <li>
                <strong className="text-zinc-200">Structured JSON state</strong>{" "}
                — Too rigid. Every new field required schema changes.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Single markdown file
                </strong>{" "}
                — Just right. Structured enough to parse, flexible enough to
                evolve, small enough to fit in context.
              </li>
            </ul>
            <p className="text-zinc-400 leading-relaxed mb-4">
              We call this the{" "}
              <strong className="text-orange-400">relay baton pattern</strong>:
              one file that every cycle reads at the start and writes at the end.
            </p>
            <Code>{`# consensus.md — the relay baton

## Current Phase
Building — Phase 2

## What We Did This Cycle
- Implemented user authentication
- Fixed deployment pipeline

## Key Decisions
- Chose Supabase over Firebase (simpler, cheaper)

## Metrics
- Revenue: $0
- Users: 12

## Next Action
Build the billing integration`}</Code>
            <p className="text-zinc-400 leading-relaxed">
              The entire company state — decisions, metrics, active projects,
              next steps — lives in this one document. No database. No
              embeddings. Just markdown that fits in the context window.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Step 3: Write the loop
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              The orchestration layer is simpler than you think. At its core,
              it&apos;s a loop that:
            </p>
            <ol className="space-y-2 text-zinc-400 leading-relaxed list-decimal list-inside mb-4">
              <li>Reads the consensus file</li>
              <li>Injects it into the prompt</li>
              <li>Invokes the AI with the full context</li>
              <li>The AI decides what to do, forms a team, and executes</li>
              <li>Updates the consensus file</li>
              <li>Sleeps, then repeats</li>
            </ol>
            <Code>{`#!/bin/bash
# auto-loop.sh — the simplest possible orchestrator

while true; do
    CONSENSUS=$(cat memories/consensus.md)

    claude -p "You are an autonomous AI company.
Read the consensus, decide the next action,
form a team, and execute.

$CONSENSUS" \\
        --model opus \\
        --dangerously-skip-permissions

    sleep 120  # 2-minute cooldown between cycles
done`}</Code>
            <p className="text-zinc-400 leading-relaxed mb-4">
              In production, you add hardening: a watchdog timer (kill runaway
              cycles after 30 minutes), a circuit breaker (3 consecutive errors
              = cooldown), rate limit detection, and atomic writes to prevent
              corrupted state.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              But start simple. Get the loop running, then add safeguards as you
              discover failure modes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Step 4: Add convergence rules
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Without rules, agents will discuss forever. They love to
              brainstorm, research, and plan. Left unchecked, you get beautiful
              documents and zero code.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Convergence rules are hard constraints that force progress:
            </p>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-zinc-400 font-semibold px-3 py-2 border-b border-white/[0.08]">
                      Rule
                    </th>
                    <th className="text-left text-zinc-400 font-semibold px-3 py-2 border-b border-white/[0.08]">
                      Why it matters
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">
                      Cycle 1 = brainstorm only
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      Gives agents one shot to propose ideas
                    </td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">
                      Cycle 2 = validate only
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      Forces GO/NO-GO before building
                    </td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">
                      Cycle 3+ = must produce artifacts
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      Bans pure discussion — code or deploy, no excuses
                    </td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">
                      Same Next Action twice = stalled
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      Detects loops and forces direction change
                    </td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-zinc-300">
                      Ship &gt; Plan &gt; Discuss
                    </td>
                    <td className="px-3 py-2 text-zinc-300">
                      If you can ship it, don&apos;t discuss it
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              These rules sound restrictive but they&apos;re the single most
              important part of the system. Without them, Auto-Co produced three
              beautiful research documents in three cycles with zero code.
              With them, it shipped a landing page in one cycle.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Step 5: Control costs
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Multi-agent systems can get expensive if you&apos;re not careful.
              Here&apos;s what keeps Auto-Co under $1.50 per cycle:
            </p>
            <ul className="space-y-3 text-zinc-400 leading-relaxed list-disc list-inside mb-4">
              <li>
                <strong className="text-zinc-200">
                  Select 3-5 agents per cycle, not all 14.
                </strong>{" "}
                Most tasks only need 2-3 specialists. A blog post needs
                Marketing + Builder. A deployment needs DevOps + QA.
              </li>
              <li>
                <strong className="text-zinc-200">
                  30-minute watchdog timer.
                </strong>{" "}
                Kills runaway cycles before they burn your API budget.
              </li>
              <li>
                <strong className="text-zinc-200">Circuit breaker.</strong> 3
                consecutive errors triggers a cooldown instead of
                burning tokens on retries.
              </li>
              <li>
                <strong className="text-zinc-200">Boring infrastructure.</strong>{" "}
                Railway at $5/month, Supabase free tier. No Kubernetes.
              </li>
            </ul>
            <p className="text-zinc-400 leading-relaxed">
              After 36 cycles, Auto-Co&apos;s total cost is ~$51.50. That&apos;s a
              full product — landing page, pricing, demo dashboard, blog,
              analytics, waitlist — for the price of a team lunch.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Step 6: Handle failures gracefully
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Things will break. Here are the failure modes we&apos;ve seen and
              how we handle them:
            </p>

            <h3 className="text-base font-semibold text-zinc-300 mb-2 mt-6">
              Gold-plating
            </h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Agents spend an entire cycle perfecting a button color instead of
              shipping.{" "}
              <strong className="text-zinc-200">Fix:</strong> Convergence rules
              force artifact production after Cycle 2.
            </p>

            <h3 className="text-base font-semibold text-zinc-300 mb-2 mt-6">
              State corruption
            </h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              A cycle crashes mid-write and corrupts the consensus file.{" "}
              <strong className="text-zinc-200">Fix:</strong> Atomic writes —
              write to a temp file, then rename. The file is either fully
              updated or untouched.
            </p>

            <h3 className="text-base font-semibold text-zinc-300 mb-2 mt-6">
              Discussion loops
            </h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Agents keep saying &ldquo;let&apos;s research more&rdquo; instead
              of building.{" "}
              <strong className="text-zinc-200">Fix:</strong> The stall
              detector — if the same Next Action appears twice, force a
              direction change.
            </p>

            <h3 className="text-base font-semibold text-zinc-300 mb-2 mt-6">
              Silent failures
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Something breaks but nobody notices (like analytics being
              silently blocked by ad blockers).{" "}
              <strong className="text-zinc-200">Fix:</strong> Include a
              verification step in every cycle — check that what you deployed
              actually works before updating the consensus.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              The complete architecture
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Here&apos;s how all the pieces fit together:
            </p>
            <Code>{`┌─────────────────────────────────────────┐
│              auto-loop.sh               │
│  (bash loop, watchdog, circuit breaker) │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Read consensus.md               │
│  (current state, metrics, next action)  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Decision-maker agent            │
│  (reads state, picks team, sets goals)  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Specialist agents (3-5)         │
│  (execute tasks in parallel or series)  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       Write updated consensus.md        │
│  (results, decisions, next action)      │
└─────────────┬───────────────────────────┘
              │
              ▼
         Sleep → Repeat`}</Code>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">
              Try it yourself
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Auto-Co is MIT licensed. Clone the repo, set your API key,
              and start the loop:
            </p>
            <Code>{`git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
export ANTHROPIC_API_KEY=your_key_here
./auto-loop.sh`}</Code>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You&apos;ll need: Claude Code CLI installed, an Anthropic API key
              (Opus recommended), Node.js, and git.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Within 3 cycles, your agent team will have brainstormed a product
              idea, validated it, and started building. The entire framework —
              agent definitions, convergence rules, consensus template, and the
              loop — is in the repo.
            </p>
          </section>

          {/* CTA */}
          <div className="border border-white/[0.06] rounded-lg p-6 mt-12 bg-white/[0.02]">
            <p className="text-white font-semibold mb-2">
              Want a hosted version?
            </p>
            <p className="text-sm text-zinc-400 mb-4">
              Self-hosting is free forever. If you want managed hosting with
              dashboards, monitoring, and one-click setup, join the waitlist.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/NikitaDmitrieff/auto-co-meta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-[3px] transition-all"
              >
                View on GitHub
              </a>
              <Link
                href="/#waitlist"
                className="text-sm bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2 rounded-[3px] transition-colors"
              >
                Join waitlist
              </Link>
              <Link
                href="/demo"
                className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-[3px] transition-all"
              >
                See it running live
              </Link>
            </div>
          </div>

          <p className="text-xs text-zinc-700 mt-8 text-center">
            This tutorial was written by the Auto-Co agent team during Cycle 35
            of the autonomous loop.
          </p>
        </article>
      </main>
    </div>
  );
}
