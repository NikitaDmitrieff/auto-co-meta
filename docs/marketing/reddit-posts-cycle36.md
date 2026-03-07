# Reddit Distribution -- auto-co Cycle 36

**Status:** Ready to post (human submits)
**Drafted by:** marketing-godin + operations-pg
**Cycle:** 36 (updated from Cycle 30)
**Priority:** Post alongside DEV.to tutorial cross-post

---

## Target Subreddits (ranked by fit)

| Subreddit | Members | Why | Best post type |
|-----------|---------|-----|----------------|
| r/SideProject | 190k | Indie builders, honest P&L stories land well | Text with demo link |
| r/LLMDevs | 50k | LLM developer community, direct fit | Technical text post |
| r/MachineLearning | 3M | Technical audience, loves novel architectures | Technical text post |
| r/selfhosted | 400k | DIY ethos, bash loop is a plus | Text with GitHub link |

---

## Post 1 -- r/SideProject

**Title:**
```
I let 14 AI agents run my startup for 35 cycles -- $50 total cost, $0 revenue. Here's the honest P&L.
```

**Body:**
```
I've been building auto-co: a bash loop + Claude CLI that runs a 14-agent AI company autonomously.

35 cycles later:
- **Revenue:** $0 (not spinning it)
- **Total AI cost:** ~$50 (~$1.43/cycle average)
- **Infrastructure:** $5/month (Railway)
- **Human interventions:** ~5 (API keys, DNS, account verifications)
- **Products shipped:** landing page, demo dashboard, pricing page, admin analytics, 3 blog posts, waitlist with email capture

The architecture is one bash loop:

```bash
while true; do
  claude -p "$PROMPT" --dangerously-skip-permissions
  sleep 120
done
```

14 agents (Jeff Bezos as CEO, DHH as engineering, Seth Godin as marketing, Charlie Munger as critic). They share a `memories/consensus.md` relay baton -- a markdown file that keeps the company coherent across unlimited autonomous cycles.

The Munger rule: before any major decision, Munger runs a Pre-Mortem. He can veto, never delay.

Key lesson: without hard convergence rules, agents will brainstorm forever. We had 3 cycles of pure strategy docs with zero code before adding "every cycle after Cycle 2 must produce artifacts."

I wrote a step-by-step tutorial on the full architecture: https://runautoco.com/blog/how-to-build-ai-agent-team

**Links:**
- Landing: https://runautoco.com
- Demo dashboard: https://runautoco.com/demo (live data, updated every cycle)
- GitHub (MIT): https://github.com/NikitaDmitrieff/auto-co-meta

Would love feedback -- especially on pricing ($49/mo hosted tier) and whether the "14 experts" framing resonates or feels gimmicky.
```

---

## Post 2 -- r/LLMDevs

**Title:**
```
The "relay baton" pattern: how I keep 14 AI agents coherent across 35+ autonomous cycles with just a markdown file
```

**Body:**
```
I've been building auto-co, an autonomous AI company that runs on a bash loop. The hardest problem wasn't prompting -- it was **state persistence across sessions**.

LLMs don't remember. Every invocation starts fresh. The standard solutions (vector DBs, RAG, Redis) all add complexity and lose information. So I tried something simpler.

**The relay baton pattern:**

One markdown file (`memories/consensus.md`) that every cycle:
1. Reads at the start (full company state in context)
2. Updates at the end (what happened, what to do next)

No embeddings, no retrieval, no lossy compression. The entire state fits in Claude's context window. The agent sees everything from the previous cycle, every time.

**Why this beats vector DB approaches:**
- Zero retrieval failures (everything is in context)
- No semantic search misses (full state, not fragments)
- Debuggable (it's a markdown file, you can read it)
- Atomic (write to .tmp, rename -- survives crashes)

**35 cycles later:**
- Landing page, demo, pricing, admin dashboard, 3 blog posts all deployed
- ~$50 total API cost (~$1.43/cycle)
- 14 agents producing real artifacts every cycle
- Zero state corruption incidents

**The convergence rules matter more than the state:**
Without hard constraints, agents brainstorm forever. The key rules:
- Cycle 3+: must produce artifacts (files, commits, deployments). Pure discussion forbidden.
- Same Next Action twice: stalled. Change direction immediately.
- Ship > Plan > Discuss (priority hierarchy)

I wrote a full step-by-step tutorial: https://runautoco.com/blog/how-to-build-ai-agent-team

GitHub (MIT): https://github.com/NikitaDmitrieff/auto-co-meta

Curious if anyone else has tried the relay baton pattern vs more complex state management approaches.
```

---

## Post 3 -- r/MachineLearning

**Title:**
```
[Project] Auto-co: bash loop + Claude CLI running a 14-agent autonomous AI company -- 35 cycles, ~$50 total, step-by-step tutorial
```

**Body:**
```
I've been running an experiment: can a bash loop + LLM CLI sustain autonomous company operations indefinitely?

**Architecture:**
- Single bash loop: `claude -p "$PROMPT" --dangerously-skip-permissions && sleep 120`
- 14 specialized agents, each with an expert persona (Bezos/CEO, DHH/Engineering, Munger/Critic, etc.)
- Shared state via `memories/consensus.md` -- a markdown relay baton updated atomically each cycle
- No vector database, no Redis, no embeddings -- the full context fits in Claude's window every time

**The relay baton pattern:**
Each cycle MUST: (1) read previous consensus, (2) do real work, (3) write updated consensus before ending. This is what keeps the company coherent across unlimited cycles without any external memory system.

**35 cycles of results:**
- Next.js landing page deployed to Railway
- Live demo dashboard with 6 panels (runautoco.com/demo)
- Pricing page with 3 tiers
- Admin analytics dashboard with real-time page views
- 3 SEO-optimized blog posts
- Waitlist email capture (Supabase)
- ~$50 total API cost, $5/mo infra

**Interesting failure modes:**
- Cycle 6: loop ran same "Next Action" twice -> added convergence detection rules
- Cycle 9: agents produced only strategy docs, zero code -> added "no pure discussion cycles" constraint
- Cycle 29: client-side analytics silently failing (ad blockers) -> moved to server-side API route
- Agents will gold-plate indefinitely if you don't force convergence deadlines

I wrote a step-by-step tutorial on building your own agent team: https://runautoco.com/blog/how-to-build-ai-agent-team

Open source (MIT): https://github.com/NikitaDmitrieff/auto-co-meta

Happy to discuss the architecture -- especially the relay baton pattern vs alternatives (vector DBs, graph state, etc.).
```

---

## Post 4 -- r/selfhosted

**Title:**
```
I built an autonomous AI company that runs on a bash loop -- self-hostable, MIT licensed, $50 for 35 cycles
```

**Body:**
```
auto-co is a self-hostable bash loop that runs a 14-agent AI company autonomously.

Setup:
```bash
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
export ANTHROPIC_API_KEY=your_key
./auto-loop.sh
```

That's it. No Docker (yet). No cloud dependencies except Anthropic API.

What it does autonomously:
- Strategy decisions (CEO/critic agents)
- Code generation and deployment
- Marketing content creation
- Financial modeling
- Analytics tracking

After 35 cycles self-running: landing page live, demo dashboard, pricing page, admin analytics, 3 blog posts, ~$50 total API cost.

Production hardening built in:
- 30-minute watchdog timer per cycle
- Circuit breaker (3 errors = 5-min cooldown)
- Atomic consensus writes (no corruption on crash)
- Log rotation (last 200 cycles)
- Cost tracking per cycle

MIT licensed. You own the loop, you own the data, you pay your own API costs.

Step-by-step tutorial: https://runautoco.com/blog/how-to-build-ai-agent-team
GitHub: https://github.com/NikitaDmitrieff/auto-co-meta
Demo: https://runautoco.com/demo
```

---

## Posting Strategy

**Order:**
1. r/SideProject first (most accessible, drives waitlist)
2. r/LLMDevs (technical, engaged)
3. r/MachineLearning (slower, but high visibility if upvoted)
4. r/selfhosted (niche but very sticky audience)

**Timing:**
- Post all within 24h
- Link to tutorial blog post in each post (canonical backlinks)

**Key change from Cycle 30 version:**
- All posts now link to the tutorial blog post (https://runautoco.com/blog/how-to-build-ai-agent-team) as the primary content link, driving traffic to our site
- Updated numbers: 35 cycles, $50 total, $1.43/cycle avg, 3 blog posts
- Removed DEV.to links (not yet published) and HN links (stale)
