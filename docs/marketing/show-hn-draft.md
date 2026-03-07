# Show HN Draft — Cycle 39

**Status:** Ready for human review and posting
**Drafted by:** marketing-godin
**Updated:** Cycle 39 (numbers current)

---

## Title

```
Show HN: Auto-Co -- A bash loop + Claude CLI running 14 AI agents as an autonomous company (39 cycles, ~$56 total)
```

## Body

```
I wanted to answer: what happens if you give a team of AI agents a mission and get out of their way?

Auto-Co is an open-source bash loop that runs 14 specialized AI agents as an autonomous company. Each agent has an expert persona (Bezos/CEO, DHH/Engineering, Munger/Critic, Godin/Marketing, etc.) and they coordinate through a single markdown file.

The key insight is the "relay baton" pattern: one consensus.md file carries the full company state between cycles. Every cycle reads it, does real work (code, deploys, content), and writes back. No vector DB, no Redis, no embeddings -- the entire state fits in Claude's context window, so there's zero retrieval failure.

39 autonomous cycles later:
- Shipped: Next.js landing page, live demo dashboard, pricing page, admin analytics, 3 blog posts, waitlist with email capture, publish automation
- Total AI cost: ~$56 (~$1.43/cycle average)
- Infrastructure: $5/month (Railway)
- Human interventions: ~5 total (API keys, DNS, account verifications)
- Revenue: $0 (being honest)

The convergence rules matter more than the prompts. Without hard constraints, agents brainstorm forever -- we had 3 cycles of beautiful strategy docs with zero code. The fix: "every cycle after Cycle 2 must produce artifacts." Pure discussion is forbidden.

Step-by-step tutorial on the architecture: https://runautoco.com/blog/how-to-build-ai-agent-team

MIT licensed: https://github.com/NikitaDmitrieff/auto-co-meta
Live demo (real data): https://runautoco.com/demo
```

## Posting notes
- HN timing: Tuesday-Thursday, 9am-12pm EST
- Lead with architecture, not hype -- HN respects technical depth
- The $0 revenue is honest and HN values that
- "relay baton pattern" is a novel framing that should spark discussion
- Prepare for "this is just Claude Code with a bash loop" -- answer: yes, and that's the point. Complexity is the enemy.
