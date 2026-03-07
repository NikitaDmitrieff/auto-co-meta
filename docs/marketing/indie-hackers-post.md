# Indie Hackers Post — Cycle 23

**Status:** Ready to post
**Drafted by:** marketing-godin + operations-pg
**Cycle:** 23
**Target:** https://www.indiehackers.com/post/new (or Milestone section)

---

## Post Details

**Title:**
```
I let 14 AI agents run my startup for 22 cycles — here's the honest P&L
```

**Body:**
```
I've been building auto-co: an autonomous AI company that runs itself on a Bash loop + Claude CLI.

22 cycles later, here's the honest P&L:

**Revenue:** $0
**Total AI cost:** $36.00 (~$1.64/cycle)
**Human interventions:** ~5 (all for credentials or direction pivots)
**Products shipped:** FormReply v1, auto-co landing page + demo dashboard

---

### How it works

The whole architecture is embarrassingly simple:

```bash
while true; do
  claude -p "$PROMPT" --dangerously-skip-permissions
  sleep 120
done
```

14 agents, each modeled on a real expert (Jeff Bezos, DHH, Seth Godin, Charlie Munger). They share a `memories/consensus.md` relay baton — the file that keeps the company coherent across unlimited autonomous cycles.

The Munger rule: before any major decision, Charlie Munger runs a Pre-Mortem. He can veto, never delay.

---

### What shipped in 22 cycles

- Cycle 1-2: Strategy + product selection
- Cycle 3-5: FormReply v1 (form builder + email capture + Stripe)
- Cycle 6: Pivot to auto-co itself as the product
- Cycle 7-14: Landing page iterations, community seeding
- Cycle 15: Full landing page redesign (TextHoverEffect hero, glass bento)
- Cycle 16: Live demo dashboard at /demo (6 panels, real data)
- Cycle 17-19: DEV.to article drafted + published
- Cycle 20-21: Sticky nav + Aceternity Compare section
- Cycle 22: Waitlist email capture (Supabase) + GitHub star counter
- Cycle 23 (this cycle): Distribution push — Show HN + this post

---

### The business model

Open-source (MIT) — clone it, run with your own Anthropic key.
Hosted tier ($49/mo) — you give us your API key, we run the loop on your goals.

Math check: ~$1.64/cycle × 15 cycles/day = ~$738/month API cost. So $49/mo is the floor if users run 5-6 cycles/day. Still need to validate the pricing.

---

### Links

- Live landing: https://auto-co-landing-production.up.railway.app
- Demo dashboard: https://auto-co-landing-production.up.railway.app/demo
- DEV.to article: https://dev.to/nikita_dmitrieff_4ac62e72/i-built-an-autonomous-ai-company-that-runs-itself-22-cycles-of-receipts-4kbc
- GitHub: https://github.com/NikitaDmitrieff/auto-co-meta

---

### What I'd love feedback on

1. Is the $49/mo price too low given the API costs?
2. Would you use this? What's missing?
3. The "14 experts" framing — does it resonate or feel gimmicky?

Revenue target: first paying customer by Cycle 30.

*This post was drafted by auto-co Cycle 23. The company writes its own marketing.*
```

---

## Where to Post

1. **New Post:** https://www.indiehackers.com/post/new — select "Product" category
2. **Milestone section** (if applicable): "Launched" or "First Distribution Attempt"
3. **Groups to cross-post:** "Artificial Intelligence", "Show Your Work"

## Timing

- Post any time — IH has lower time-sensitivity than HN
- Best days: Monday-Wednesday
- Engage with comments within 2 hours of posting for algorithm boost
