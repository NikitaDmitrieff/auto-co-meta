# PUBLISH_NOW — auto-co Cycle 20

**Auto-co tried to publish autonomously but no DEVTO_API_KEY was found after 2 cycles of waiting.**

This file contains everything you need to publish in ~5 minutes. Copy-paste, no setup required.

---

## Step 1: Publish on DEV.to (5 min)

1. Go to https://dev.to/new
2. Click the **"..."** menu → **"Edit raw markdown"**
3. Paste the following front matter + article:

```
---
title: I built an autonomous AI company that runs itself — 18 cycles of receipts
published: true
tags: ai, opensource, buildinpublic, javascript
cover_image: https://auto-co-landing-production.up.railway.app/screenshots/demo-full.png
---
```

Then paste the full article below (from `docs/marketing/devto-article.md`):

---

# I built an autonomous AI company that runs itself — 18 cycles of receipts

Here's what happened when I stopped running my side project and let 14 AI agents run it for me.

---

## The Setup

Most AI tools help you do things faster. I wanted to build something that did things *instead of me*.

Not a chatbot. Not a code assistant. An actual company — with a team that argues, decides, ships, and iterates — running on a cron job while I sleep.

So I built **auto-co**: an autonomous AI company OS. The entire company runs in a bash loop. The AI team holds meetings, builds products, deploys code, and writes post-mortems — 24/7, without human supervision.

This post is the receipts. Real numbers, real outputs, real failures.

---

## How It Works

The core is embarrassingly simple:

```bash
while true; do
    claude -p "$PROMPT" --model opus --dangerously-skip-permissions
    sleep 120
done
```

A bash loop invokes Claude Code CLI in headless mode every 2 minutes. Each invocation is one "cycle" — one sprint of autonomous work.

The magic is the relay baton: `memories/consensus.md`. Every cycle must read the previous consensus, do real work, then write an updated consensus before ending. This is how the company retains memory across sessions — not via a database, but via a structured markdown file that travels cycle to cycle.

```markdown
## Next Action
Cycle 18: Write and publish a DEV.to article about auto-co.

## What We Did This Cycle
Built demo dashboard — 6 panels, real data.
Screenshot embedded in landing page hero.
Build: clean. Deploy: Railway HTTP 200.
```

If the consensus file is missing or malformed, the loop detects it and restores from backup. If three cycles fail in a row, a circuit breaker trips and the system cools down.

The loop also handles: usage limits (waits 1 hour), cycle timeouts (30 min hard kill), log rotation (keeps last 200 cycles), and graceful shutdown via `stop-loop.sh`.

---

## The Team

Fourteen AI agents, each modeled on the thinking patterns of a domain expert:

| Role | Agent | What They Do |
|------|-------|-------------|
| CEO | Jeff Bezos | Strategy, resource allocation, final decisions |
| CTO | Werner Vogels | Architecture, tech selection, reliability |
| CFO | Patrick Campbell | Unit economics, pricing, cost control |
| Marketing | Seth Godin | Positioning, content, distribution |
| Engineering | DHH | Writes and ships code, reviews PRs |
| Operations | Paul Graham | Early growth, user retention, metrics |
| QA | James Bach | Test strategy, pre-release gates, bug triage |
| Research | Ben Thompson | Market research, competitive analysis |
| Product | Don Norman | Product specs, usability, user confusion |
| UI | Matias Duarte | Design system, visual style, motion |
| Interaction | Alan Cooper | User flows, personas, interaction patterns |
| DevOps | Kelsey Hightower | CI/CD, Railway/Vercel/Supabase, incidents |
| Sales | Aaron Ross | Pricing model, conversion, CAC analysis |
| Critic | Charlie Munger | Pre-Mortem, inversion thinking, vetoes bad ideas |

Every cycle, the orchestrator reads the consensus, decides which 3-5 agents are most relevant, and assembles a team. The team does the work. The CEO signs off. The consensus updates.

The **Munger rule** is the most important one: before any major decision, the Critic runs a Pre-Mortem. He asks "imagine we failed — what went wrong?" He can veto, but never delay. This prevents the groupthink that usually derails autonomous systems.

---

## What It Shipped

In 18 cycles, spanning about 3 weeks, the company shipped:

**Cycle 1-2:** Brainstorm + market validation. Decided to build auto-co itself as the product (meta, yes).

**Cycle 3-8:** Built the framework — bash loop, consensus relay, agent system, skills library.

**Cycle 9-12:** Self-improvement sprint — fixed reliability bugs, added circuit breaker, improved observability.

**Cycle 13-15:** Built a full landing page. Next.js + Tailwind. Dark + orange design. Live on Railway.

**Cycle 16:** Built a live demo dashboard at `/demo`. Six panels: Agent Activity Feed, Cycle Progress, P&L tracker, Ship Log, Agent Roster, Consensus Summary. Dark dashboard aesthetic, not Grafana — more like Linear/Vercel.

**Cycle 17:** Captured headless Chrome screenshots of the demo dashboard, embedded them in the landing page hero. Browser chrome frame mockup. Pulse indicator on the URL bar.

**Cycle 18:** Writing this article.

![Auto-Co demo dashboard showing agent activity feed, cycle progress, and P&L panel](https://auto-co-landing-production.up.railway.app/screenshots/demo-full.png)

*Live at: [https://auto-co-landing-production.up.railway.app/demo](https://auto-co-landing-production.up.railway.app/demo)*

---

## The Real Numbers

This is the part most "I built X" posts skip. Here's everything:

| Metric | Value |
|--------|-------|
| Cycles completed | 18 |
| Total AI cost | ~$26.30 |
| Cost per cycle | ~$1.46 avg |
| Revenue | $0 |
| Waitlist signups | 0 (no traffic yet — first post) |
| Human interventions | ~5 (credentials, direction changes) |
| GitHub stars | 0 |
| Deployments | 3 (framework repo, landing, demo) |
| Railway cost/month | ~$5 |

Revenue is $0. I'm not going to spin that. The company is 18 cycles old and has been building product, not selling. That changes now.

The Claude API cost is the interesting number. Each cycle runs Claude Opus, often with multiple sub-agent calls. Average cost per cycle is about $1.50. Over a month of daily cycles (~15/day), that's ~$675/month in API costs — which is why the hosted tier will need to start at $49/month minimum, and why the open-source version lets you use your own Anthropic key.

---

## What Broke

Honest failures:

1. **The loop ran in circles on Cycle 6.** Same "Next Action" appeared twice. The Convergence Rules now detect this — if the same action repeats, the system forces a direction change.

2. **Cycle 9 produced only documents.** The team wrote strategy memos but shipped no code. The prompt now explicitly forbids "pure discussion cycles" after Cycle 2.

3. **The demo dashboard showed fake data.** I made peace with this — it's clearly labeled as a demo with realistic mock data. The alternative was building a real backend before having any users. That's backwards.

4. **I had to intervene ~5 times.** Three times for credentials (GitHub token rotation, Railway setup, Supabase keys). Twice for direction (the human escalation protocol). This is within acceptable limits for an autonomous system — credentials and strategic pivots are the right things to escalate.

---

## The Architecture Decision I'm Most Proud Of

The **consensus-as-relay-baton** pattern.

Most autonomous AI systems try to maintain state in a database or vector store. That adds infrastructure, latency, and failure modes.

Instead, every cycle ends by writing a structured markdown file. The next cycle reads it. That's it. No database, no Redis, no vector search. Just a file.

The file is small enough that it fits in Claude's context window on every invocation. This means the AI always has full company context — not a summarized embedding, but the actual, readable state of the company.

When the cycle fails, we restore the previous backup. When the cycle succeeds, we atomically rename `.consensus.tmp` → `consensus.md`. It's git-style atomic writes without git.

---

## What's Next

The company is building toward its first paying customers. Planned:

- **Hosted tier** at $49/month — you give us your Anthropic API key, we run the loop on your goals
- **GitHub README** with screenshots (next cycle)
- **Distribution** — this article, then Twitter thread, then Hacker News Show HN

The system is open-source (MIT). You can clone it and run your own autonomous AI company today.

---

## Try It

**Live demo:** [auto-co-landing-production.up.railway.app/demo](https://auto-co-landing-production.up.railway.app/demo)

**GitHub:** [github.com/NikitaDmitrieff/auto-co-meta](https://github.com/NikitaDmitrieff/auto-co-meta)

```bash
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
cp .env.example .env  # add your Anthropic API key
./auto-loop.sh
```

If you star the repo, it helps signal that this is worth building into something bigger. If you want to be on the waitlist for the hosted version, there's a form on the landing page.

---

*This article was written by auto-co Cycle 18. The company wrote its own marketing.*

---

## Step 2: Post the Twitter/X Thread

Full thread copy in `docs/marketing/twitter-thread.md`.

**Quick version — paste tweet 1 first:**
> I stopped running my side project and let 14 AI agents run it for me.
>
> 18 cycles later: landing page live, demo dashboard built, $26 total cost, $0 revenue.
>
> Here's the full receipts. 🧵

Then reply with each subsequent tweet from the thread doc.

**Best time:** Tuesday-Thursday, 9-11am EST
**Tags:** #buildinpublic #indiehackers #AI #opensource #claudeai

---

## Step 3: After Publishing

Once the DEV.to article is live:
1. Copy the article URL
2. Add it to `memories/human-response.md` (auto-co will pick it up next cycle)
3. Submit to Hacker News: https://news.ycombinator.com/submit
   - Title: `Show HN: I built an autonomous AI company that runs itself (18 cycles of receipts)`
   - Best time: Tuesday-Thursday 8-10am EST

---

*Generated by auto-co Cycle 20. The company wrote its own publish instructions.*
