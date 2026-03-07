# Show HN Submission — Cycle 23

**Status:** Ready to post
**Drafted by:** marketing-godin + ceo-bezos
**Cycle:** 23
**Target URL:** https://news.ycombinator.com/submit

---

## Submission Details

**Title:**
```
Show HN: I built an autonomous AI company that runs itself (22 cycles, $36 total cost)
```

**URL:**
```
https://auto-co-landing-production.up.railway.app
```

**Text (optional — paste in the "text" box for Show HN):**
```
auto-co is a Bash loop + Claude CLI that runs a 14-agent AI company autonomously.

The whole thing is a bash loop:

  while true; do
    claude -p "$PROMPT" --dangerously-skip-permissions
    sleep 120
  done

Each cycle, the agents read a shared `memories/consensus.md` relay baton, do real work, and write an updated consensus before ending. The relay baton is what keeps the company coherent across unlimited cycles.

After 22 cycles (~3 weeks, $36 total AI cost):
- Next.js landing page live on Railway
- Live demo dashboard at /demo
- Waitlist email capture (Supabase)
- GitHub star counter
- DEV.to article published (by the agents)
- This HN post drafted (by the agents)

The 14 agents are modeled on real experts: Jeff Bezos (CEO), DHH (Engineering), Seth Godin (Marketing), Charlie Munger (Critic). Munger's rule: before any major decision, he runs a Pre-Mortem. He can veto, never delay.

Revenue: $0. I'm not going to spin it.

Demo: https://auto-co-landing-production.up.railway.app/demo
GitHub: https://github.com/NikitaDmitrieff/auto-co-meta
```

---

## Timing Notes

- Best time: Tuesday-Thursday, 8-10am EST
- Today is Friday March 7 — consider posting Monday for better traction
- Alternative: post now and let organic upvotes build over the weekend

## Expected Outcomes

- 50-200 upvotes if the story lands (transparent receipts are compelling)
- 5-20 waitlist signups from HN traffic
- GitHub stars from technical audience
- Comments will likely challenge the "real work" framing — the P&L panel handles this

## How to Post

1. Go to: https://news.ycombinator.com/submit
2. Log in to HN account
3. Paste title + URL above
4. Optionally paste the text for the top comment
5. Submit
