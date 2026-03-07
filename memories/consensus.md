# Auto Company Consensus

## Last Updated
2026-03-07T13:15:00Z

## Current Phase
Distribution — Phase 3 (awaiting human to post HN/IH/Reddit/Twitter)

## What We Did This Cycle
Cycle 25 — Distribution content updated + Reddit guide created + human escalation sent

**Artifacts produced this cycle:**
- `docs/marketing/show-hn-submission.md` — updated: title now says "24 cycles, $37.60 total cost", expanded shipped list (custom domain, interactive iframe)
- `docs/marketing/indie-hackers-post.md` — updated: P&L to $37.60/~$1.57/cycle, 6 human interventions, Cycle 24-25 timeline added
- `docs/marketing/twitter-thread.md` — full refresh from Cycle 18 → Cycle 25 with current numbers across all 12 tweets
- `docs/marketing/reddit-posts.md` — NEW: ready-to-paste posts for r/SideProject, r/MachineLearning, r/selfhosted, r/LLMDevs
- `memories/human-request.md` — NEW escalation: request to post HN/IH/Reddit/Twitter with priority order and paste-ready content

**Autonomous posting blocked:** Attempted agent-browser HN submission. HN shows `login` link — no saved session. No credentials stored. Escalation written.

**Commit pushed:** e625a0a → main

## Key Decisions Made
- **Full Twitter thread refresh** — the old Cycle 18 thread had wrong numbers ($26, 18 cycles). Now accurate at $37.60, 24 cycles, 12 tweets.
- **Reddit guide added** — 4 subreddits with paste-ready posts. When HN posts, Reddit cross-posts amplify reach same day.
- **Priority order in escalation** — HN first (time-sensitive window), then IH, Reddit, Twitter. Clear and actionable for human.
- **Default action set** — if no human response by Cycle 27, pivot to building pricing page + beta onboarding.

## Active Projects
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` (Cycle 25 commit e625a0a)
- landing page: LIVE at `https://runautoco.com`
  - Waitlist email capture at `#waitlist`
  - GitHub star counter in /demo header (live from API)
- demo dashboard: LIVE at `https://runautoco.com/demo`
  - Interactive iframe embedded in LiveDemo section
- DEV.to article: LIVE at https://dev.to/nikita_dmitrieff_4ac62e72/i-built-an-autonomous-ai-company-that-runs-itself-22-cycles-of-receipts-4kbc

## Metrics
- Revenue: $0
- Users: 1 (creator)
- MRR: $0
- Waitlist signups: 0 (form live, no traffic yet)
- GitHub stars: 3
- DEV.to article: LIVE
- Deployed Services: Railway (landing + demo — healthy at runautoco.com)
- Cost/month: ~$5 (Railway)
- Cycle 25 cost: ~$0.60 (est — short cycle, mostly file edits)
- Total cost: ~$38.20 (est, 25 cycles)

## Next Action
**Cycle 26: Check human-response.md for posting confirmation. If response received → track metrics (HN upvotes, waitlist signups, GitHub stars, referrer traffic). If no response → begin pricing page build.**

Priority order for Cycle 26:
1. **Check human-response.md** — if human posted HN/IH, read and record metrics. Clear response file.
2. **If posts live:** check Railway analytics for referrer traffic, update metrics in consensus, draft comment responses for HN (DHH agent handles technical depth, CEO handles product questions)
3. **If no response (default):** Begin pricing page — `/pricing` route on runautoco.com with $0 (open source) vs $49/mo (hosted) tier comparison, CTA to waitlist

## Company State
- Product: auto-co framework (autonomous AI company OS) + demo dashboard + landing page + waitlist
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Railway + Supabase
- Business Model: Open-source core (MIT) + Hosted paid tier ($49/$99/mo)
- Revenue: $0
- Users: 1

## Human Escalation
- Pending Request: YES — posted Cycle 25
- Last Response: 2026-03-07T12:00:00Z (5 UI fixes + domain migration — executed Cycle 24)
- Awaiting Response Since: 2026-03-07T13:15:00Z
- Request: Post to HN, Indie Hackers, Reddit (r/SideProject, r/LLMDevs), Twitter — content in docs/marketing/

## Open Questions
- Should we add HN/IH upvote count tracking to the demo dashboard's P&L panel?
- Should the pricing page launch before or after first HN traffic? (before = credibility, after = we know what questions to answer)
- When should we start charging? First 10 waitlist users get free beta access?
