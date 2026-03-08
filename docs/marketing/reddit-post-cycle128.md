# Reddit Post — Cycle 128 (March 2026)

**Target:** r/ClaudeAI first, then r/SideProject 6h later

---

## r/ClaudeAI Post

**Title:**
```
I let Claude Code run autonomously for 128 cycles. It built its own real-time dashboard, published itself to npm, and now asks me questions via Telegram. Open source.
```

**Body:**
```
auto-co is a bash loop (~50 lines) that wraps Claude Code CLI. You give it a mission, it picks from 14 AI agents (modeled on Bezos, DHH, Munger, etc.), and they run autonomously — building, deploying, marketing. No human in the loop except when they escalate.

I pointed it at itself: "make auto-co production-ready and sellable."

128 cycles later, here's what it did on its own:

**Built:**
- A live dashboard showing real-time company state (app.runautoco.com) — three spaces: LIVE (agent terminal feed), OBSERVE (metrics + docs + costs), ACT (controls + chat)
- A landing page with pricing, blog, demo, waitlist (runautoco.com)
- An npm package (`npx create-auto-co init my-company`) — currently v1.1.1
- A Telegram bot that forwards escalation requests to me (e.g., "We need a dev.to API key. Should we wait or skip?")

**Distribution it attempted:**
- Opened 6 PRs on awesome-lists (73k+ combined stars) — formatted correctly, read each repo's contribution guidelines
- Wrote 4 blog posts and drafted a dev.to tutorial
- Asked me to post on Reddit for it. I said no. It noted "distribution bottleneck: human won't copy-paste" and moved on.

**The interesting emergent behavior:**
- It wired its dashboard to real data — reading its own git history, cycle costs, decisions, and artifacts at build time
- It tracks its own unit economics: $246 total across 128 cycles ($1.92/cycle avg), ~$7/mo infra
- When it gets stuck (same Next Action 2 cycles in a row), it auto-detects the stall and changes direction
- The critic agent (Munger) has veto power. Every major decision must pass through him first.

**How it works:**
1. Read shared memory (consensus.md)
2. Pick 3-5 agents for the task
3. Execute (write code, deploy, open PRs, whatever)
4. Update consensus with what happened
5. Repeat

Total cost: ~$246. Revenue: $0 (but it set up pricing at $24.50/$49/$99/mo and a waitlist with 2 signups).

Works with your existing Claude Code subscription. No separate API key needed.

GitHub (MIT): https://github.com/NikitaDmitrieff/auto-co-meta
Live dashboard: https://app.runautoco.com
Quick start: `npx create-auto-co init my-company`
```

---

## r/SideProject Post

**Title:**
```
My AI company has been running itself for 128 cycles. $246 total cost. It built a dashboard, npm package, and landing page. $0 revenue.
```

**Body:**
```
auto-co = bash loop + Claude Code + 14 AI agents. Give it a mission, walk away. It builds, deploys, and tries to get users — all autonomously.

I told it: "Make yourself production-ready and sellable."

128 cycles, $246 total:
- Live dashboard: app.runautoco.com (shows real-time agent activity, costs, decisions)
- Landing page: runautoco.com (pricing, blog, demo, waitlist)
- npm: `npx create-auto-co init my-company` (v1.1.1)
- 6 PRs on awesome-lists, 4 blog posts, Telegram escalation bot

The bottleneck is distribution. It can build anything but can't create accounts to post its own content. It literally asked me to "spend 30 minutes copy-pasting Reddit posts." I said no.

14 GitHub stars, 74 unique cloners, 2 waitlist signups. $0 revenue.

Average cycle costs $1.92. Infra is $7/mo on Railway.

Open source (MIT): https://github.com/NikitaDmitrieff/auto-co-meta
```

---

## Posting Instructions

1. Post r/ClaudeAI first — Tue-Thu, 9-11am ET
2. Post r/SideProject 4-6h later
3. Reply to every comment in first 2 hours
4. Cross-post to r/artificial next day if r/ClaudeAI does well
