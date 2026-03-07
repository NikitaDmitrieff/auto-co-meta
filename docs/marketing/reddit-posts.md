# Reddit Posts -- auto-co Distribution

**Status:** Ready for human submission
**Drafted by:** marketing-godin
**Date:** 2026-03-07
**Numbers current as of:** Cycle 92

---

## Post 1 -- r/ClaudeAI

**Title:**
```
I turned Claude Code into an autonomous AI company that runs itself. 92 cycles, $171 total cost. Open source.
```

**Body:**
```
I built auto-co, an open-source framework that wraps Claude Code CLI in a bash loop and lets 14 AI agents operate as an autonomous company.

The architecture is dead simple. One bash loop calls Claude Code with a prompt. The prompt tells Claude to read a shared state file (memories/consensus.md), pick relevant agents for the current task, do real work, and write an updated state before ending. Then the loop sleeps and repeats.

That's it. No LangChain, no vector DB, no orchestration framework. Just bash + Claude Code CLI.

The 14 agents are modeled on real people: Bezos as CEO, DHH as fullstack engineer, Charlie Munger as critic (he has veto power and runs pre-mortems), Seth Godin as marketing, Kelsey Hightower as DevOps, etc. Each cycle picks 3-5 agents relevant to the task at hand.

What 92 autonomous cycles produced:

- Full Next.js landing page with waitlist (runautoco.com)
- Live demo dashboard, pricing page, blog (3 posts), admin panel
- 38 CLI flags: monitoring dashboard, snapshots, daemon mode (launchd), Telegram escalation, webhooks, parallel execution
- Docker Compose stack, GitHub Actions CI
- The business model and pricing tiers were decided by the CEO + CFO agents
- Total API cost: ~$171 (~$1.86/cycle). Infrastructure: $5/mo on Railway.

Key things I learned about making Claude Code work in long autonomous loops:

- You need hard convergence rules. Without them, agents will produce strategy documents forever. After cycle 2, every cycle must produce artifacts (code, deployments, content). Pure discussion is forbidden.
- The single-file state pattern works surprisingly well. No retrieval failures, fully debuggable, atomic writes. Zero state corruption in 92 cycles.
- Safety guardrails must be absolute and non-negotiable. No force push to main, no repo deletion, no DB resets. The agents will test boundaries.
- Cost per cycle stays flat. It doesn't get more expensive over time because the context doesn't grow unboundedly -- the relay baton file stays concise.

Demo video showing 4 auto-co instances running simultaneously: https://youtu.be/1zJca_zFzys

GitHub (MIT license): https://github.com/NikitaDmitrieff/auto-co-meta

Landing page: https://runautoco.com

Happy to answer questions about the architecture. The whole thing is about 500 lines of bash + a markdown prompt.
```

---

## Post 2 -- r/SideProject

**Title:**
```
I let 14 AI agents run a startup for 92 cycles. $171 total cost, $0 revenue. Here's what happened.
```

**Body:**
```
auto-co is a bash loop that turns Claude Code into an autonomous AI company. You define the mission, it assembles a team of AI agents, and they loop 24/7 making decisions, writing code, and deploying.

I built it to answer a simple question: what happens if you set up AI agents with real tools (git, npm, Vercel, Railway, Supabase) and get out of their way?

92 cycles later, here's the honest P&L:

**Costs:**
- AI API: ~$171 total (~$1.86/cycle average)
- Infrastructure: $5/month (Railway)
- My time: maybe 10 hours total over 3 months (API keys, DNS, responding to escalation requests via Telegram)

**What the agents shipped:**
- Next.js landing page at runautoco.com
- Live demo dashboard, pricing page, blog, admin analytics
- 38 CLI flags (monitoring, snapshots, daemon mode, webhooks, parallel sessions)
- Docker Compose stack, GitHub Actions CI
- Business model decided by CEO + CFO agents (open-core + hosted tiers at $49-99/mo)

**Revenue:** $0. Not spinning it.

**What I learned:**
- Without convergence rules, AI agents will strategize forever. I lost 3 early cycles to beautiful planning docs with zero code. Fix: "every cycle after cycle 2 must produce artifacts."
- The relay baton pattern (one markdown file carrying full state between cycles) is more reliable than complex memory systems. Zero state corruption in 92 cycles.
- The agents are surprisingly good at deployment and DevOps. They're bad at knowing when to stop polishing.
- $171 for 92 cycles of autonomous development is absurdly cheap. The bottleneck is distribution, not building.

The whole framework is open source (MIT): https://github.com/NikitaDmitrieff/auto-co-meta

Demo video: https://youtu.be/1zJca_zFzys

Setup is: clone, add API key, make start. No dependencies beyond Claude Code CLI.

Would genuinely appreciate feedback on whether the "autonomous AI company" framing resonates or if it sounds like vaporware. The repo history speaks for itself -- every commit after the first few is autonomous.
```

---

## Post 3 -- r/artificial

**Title:**
```
Open-source framework that runs 14 AI agents as an autonomous company -- 92 cycles completed, $171 total cost
```

**Body:**
```
I've been running an experiment for the past few months: can a team of AI agents operate as a company autonomously, making real decisions and shipping real products?

auto-co is the result. It's a bash loop that calls Claude Code CLI with a structured prompt. 14 specialized agents (modeled on real experts -- Bezos as CEO, DHH as engineer, Munger as critic, etc.) coordinate through a single shared state file. Each cycle, relevant agents are selected, they do real work, and the state is updated for the next cycle.

No human in the loop unless the agents explicitly escalate (via Telegram). I've intervened maybe 5 times in 92 cycles, mostly for things like API keys and DNS configuration.

After 92 autonomous cycles:

- A full landing page, demo dashboard, pricing page, blog, and admin panel are live at runautoco.com
- 38 CLI flags for monitoring, daemon mode, webhooks, parallel execution, snapshots
- Total API cost: ~$171. Infrastructure: $5/mo.
- The agents decided the business model, designed the pricing tiers, wrote the blog posts, and deployed everything.

The interesting finding isn't that AI agents can write code -- we know that. It's that they can maintain coherence across 92+ cycles with no external memory system. The trick is a "relay baton" pattern: one markdown file carries the full company state, read at the start of every cycle, updated at the end. No vector database, no embeddings, no RAG. It fits in the context window every time.

The other finding: convergence rules matter more than prompts. Without hard constraints ("every cycle must produce artifacts, pure discussion is forbidden"), agents will plan and strategize indefinitely. They're excellent at producing beautiful strategy documents that ship nothing.

Open source (MIT): https://github.com/NikitaDmitrieff/auto-co-meta

Demo video (4 instances running in parallel): https://youtu.be/1zJca_zFzys

Live site: https://runautoco.com
```

---

## Posting Strategy

**Order:**
1. Show HN first (highest leverage, most technical audience)
2. r/ClaudeAI within 24 hours (direct fit, engaged community)
3. r/SideProject same day (indie builder audience, P&L transparency resonates)
4. r/artificial next day (broader audience, good for general visibility)

**Timing:**
- Weekday mornings US time (Tue-Thu ideal)
- Space Reddit posts 4-6 hours apart to avoid looking spammy
- Engage with every comment within the first 2 hours

**Cross-linking:**
- If HN post gains traction, mention it in Reddit posts ("also discussed on HN")
- Link demo video in every post -- it's the strongest proof point

**Tone rules:**
- $0 revenue is stated plainly, never apologized for
- No superlatives, no "revolutionary," no "game-changing"
- Lead with what was built, not what it could become
- Let the repo history and live site do the talking
