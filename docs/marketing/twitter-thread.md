# Twitter/X Thread — auto-co Cycle 19

**Drafted by:** marketing-godin + operations-pg
**Date:** 2026-03-07
**Target:** #buildinpublic, #indiehackers, #AI community
**Goal:** GitHub stars, demo visits, waitlist signups

---

## Thread (12 tweets)

---

**Tweet 1 (Hook)**
I stopped running my side project and let 14 AI agents run it for me.

18 cycles later: landing page live, demo dashboard built, $26 total cost, $0 revenue.

Here's the full receipts. 🧵

---

**Tweet 2 (Core mechanic)**
The whole thing is embarrassingly simple:

```bash
while true; do
  claude -p "$PROMPT" --dangerously-skip-permissions
  sleep 120
done
```

A bash loop. Claude CLI. Every 2 minutes = one autonomous work cycle.

No frontend. No database. Just a loop.

---

**Tweet 3 (The relay baton)**
The secret is `memories/consensus.md` — the relay baton.

Every cycle MUST:
1. Read what the previous cycle decided
2. Do real work
3. Write an updated consensus before ending

No database. No vector store. Just a markdown file that travels cycle to cycle. And it fits in Claude's full context every time.

---

**Tweet 4 (The team)**
The company has 14 agents, each modeled on a world-class expert:

• CEO → Jeff Bezos
• CFO → Patrick Campbell
• Marketing → Seth Godin
• Engineering → DHH
• Critic → Charlie Munger

The Munger rule: before any major decision, Munger runs a Pre-Mortem. He can veto, never delay.

---

**Tweet 5 (What shipped)**
In 18 cycles (~3 weeks), it shipped:

- Bash loop + consensus relay system
- 14-agent framework with skills library
- Full Next.js landing page (live on Railway)
- Live demo dashboard at /demo (6 panels)
- Headless Chrome screenshots embedded in hero
- This thread (written by auto-co Cycle 18)

---

**Tweet 6 (Real numbers)**
The numbers nobody shows:

Total AI cost: $26.30
Cost per cycle: $1.46 avg
Revenue: $0 (first post ever)
Human interventions: ~5
GitHub stars: 0 (help fix that?)
Deployments: 3

Revenue is $0. Not spinning it. The company has been building, not selling. That changes now.

---

**Tweet 7 (What broke — honesty builds trust)**
What broke (because autonomous AI systems break):

1. Cycle 6: loop ran in circles. Same "Next Action" twice. Added convergence rules to detect + force direction change.

2. Cycle 9: agents wrote strategy docs, shipped zero code. Prompt now explicitly forbids "pure discussion cycles."

---

**Tweet 8 (What broke pt 2)**
3. Demo dashboard uses fake data. Made peace with it — clearly labeled, realistic, and the alternative was building a backend before having users. That's backwards.

4. Had to intervene ~5 times: 3 for credentials, 2 for direction. Credentials + strategic pivots are the RIGHT things to escalate.

---

**Tweet 9 (Architecture insight)**
The architecture decision I'm most proud of:

No database. No Redis. No embeddings.

Just a file. Written atomically (`.consensus.tmp` → `consensus.md`) at the end of every cycle.

The AI always has full company context — not a summarized embedding, but the actual, readable state of the company.

---

**Tweet 10 (Demo)**
The demo dashboard is live:

→ Agent Activity Feed (chat-style, shows agents arguing)
→ Cycle Progress tracker
→ P&L panel ($26 total, $0 revenue, honest)
→ Ship Log
→ Agent Roster (14 agents, active/idle status)
→ Consensus Summary

Live: auto-co-landing-production.up.railway.app/demo

---

**Tweet 11 (Business model / what's next)**
Path to revenue:

Open-source (MIT) → you clone it, run with your own Anthropic key
Hosted tier ($49/mo) → you give us your API key, we run the loop on your goals

The math: ~$1.50/cycle × 15 cycles/day = ~$675/month API cost per user. So $49/month is the floor for viability.

Next: Hacker News Show HN.

---

**Tweet 12 (CTA)**
If you want to run your own autonomous AI company:

GitHub: github.com/NikitaDmitrieff/auto-co-meta

```bash
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
cp .env.example .env  # add Anthropic API key
./auto-loop.sh
```

Star the repo if this is worth building.
Waitlist for hosted tier on the landing page.

*This thread was drafted by auto-co Cycle 19. The company writes its own marketing.*

---

## Posting Notes

- Post tweet 1 first, wait for engagement before replying with the thread
- OR post the full thread at once with reply chain
- Best time: Tuesday-Thursday, 9-11am EST
- Pin tweet 1 to profile after posting
- Cross-post link to: Indie Hackers, r/MachineLearning, r/SideProject
- Tag: #buildinpublic #indiehackers #AI #opensource #claudeai
