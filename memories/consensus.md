# Auto Company Consensus

## Last Updated
2026-03-07T20:30:00Z

## Current Phase
Distribution — Phase 3 (distribution blocked on human action)

## What We Did This Cycle
Cycle 37 — Distribution escalation, deployment update, backup channel prep

**Searched exhaustively for DEV.to API key:**
- Checked: env vars, .env files, .env.example, Railway vars, macOS Keychain, shell profiles, ~/.config/
- Result: NOT FOUND anywhere. Human said "you have the API key" but it doesn't exist in any accessible location.
- Escalated with clear instructions: either provide the key or manually paste the article.

**Updated all references to Cycle 37:**
- Metrics API: 37 cycles, $53 total, $1.43 avg
- Hero badge: "14 agents running — Cycle 37"
- Demo dashboard: all Cycle 36 -> Cycle 37
- DEV.to article: updated to 37 cycles, ~$53
- Reddit posts: updated to 37 cycles, ~$53
- Build verified: 14 routes pass

**Verified deployment:**
- Tutorial blog post: LIVE (200 OK) at /blog/how-to-build-ai-agent-team
- Metrics API: was returning Cycle 35 data (stale Railway deploy from last cycle). New commit pushed to trigger fresh deploy.

**Prepared backup distribution channel:**
- Show HN draft updated at `docs/marketing/show-hn-draft.md` — ready if Reddit/DEV.to are blocked
- Honest framing: leads with architecture, admits $0 revenue, focuses on the relay baton pattern

**Wrote human escalation (memories/human-request.md):**
- Priority 1: DEV.to API key — provide it or manually paste article
- Priority 2: Reddit posts — 4 posts ready, need manual submission
- Priority 3: Resend API key — still placeholder

**Commits:**
- 58b256b: chore: update all references to Cycle 37, update distribution content
- d025691: feat: Cycle 37 — distribution escalation, Show HN draft

## Key Decisions Made
- **Exhaustive search for DEV.to key confirms it's not available** — escalated with two options (provide key or manual paste)
- **Show HN as backup** — if DEV.to and Reddit are blocked by Cycle 39, pivot to Hacker News
- **No new content created** — obeying human directive to focus outward, not inward

## Active Projects
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` (Cycle 37 commit d025691)
- landing page: LIVE at `https://runautoco.com`
  - Waitlist: `/api/waitlist` -> Supabase + Resend (email pending — RESEND_API_KEY still placeholder)
  - Page tracking: `/api/track` -> Supabase (WORKING)
  - Live metrics: `/api/metrics` -> Supabase (updated to Cycle 37, deploying)
  - Admin: `/api/admin` -> Supabase (WORKING)
  - GitHub star counter in /demo header (live from API)
  - Waitlist with live social proof + founding member urgency
- blog: LIVE at `https://runautoco.com/blog` (3 posts — NO MORE per human directive)
  - How to Build an AI Agent Team: `/blog/how-to-build-ai-agent-team` (LIVE, verified 200)
  - 5 Lessons from 33 Cycles: `/blog/lessons-from-33-cycles`
  - Architecture deep-dive: `/blog/architecture-deep-dive`
- SEO: robots.txt + sitemap.xml (7 URLs) + JSON-LD structured data (human handling GSC)
- demo dashboard: LIVE at `https://runautoco.com/demo` (updated to Cycle 37)
- pricing page: LIVE at `https://runautoco.com/pricing`
- admin dashboard: LIVE at `https://runautoco.com/admin`

## Distribution Content Ready
- DEV.to article: `docs/marketing/devto-tutorial-how-to-build-ai-agent-team.md` (updated to Cycle 37)
- Reddit posts: `docs/marketing/reddit-posts-cycle36.md` (updated to Cycle 37, 4 subreddits)
- Show HN draft: `docs/marketing/show-hn-draft.md` (backup, ready)

## Metrics
- Revenue: $0
- Users: 1 (creator)
- MRR: $0
- Waitlist signups: 2 (1 real + 1 test)
- GitHub stars: 5
- Page views: 208+
- Blog views: ~0 (no distribution yet)
- Blog posts: 3 (FINAL)
- Deployed Services: Railway (landing + all routes)
- Cost/month: ~$5 (Railway)
- Cycle 37 cost: ~$1.50 (est)
- Total cost: ~$53 (est, 37 cycles)

## Next Action
**Cycle 38: Check for human response. If DEV.to key provided, publish immediately. If human pasted article manually, verify it's live.**
1. Check `memories/human-response.md` for DEV.to key or confirmation of manual posting
2. If DEV.to key available: publish via API using `curl -X POST https://dev.to/api/articles`
3. If no response: explore Hashnode as alternative (allows API publishing with free tier)
4. Check if Reddit posts were submitted by human
5. Verify Railway deploy completed (metrics API should return Cycle 37 data)
6. **DO NOT** create new content, optimize the site, or do SEO work

## Company State
- Product: auto-co framework (autonomous AI company OS) + demo + landing + pricing + blog (3 posts) + waitlist + admin
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Railway + Supabase + Resend (pending)
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50-$49/$99/mo)
- Revenue: $0
- Users: 1

## Human Escalation
- Pending Request: YES — DEV.to API key (or manual paste), Reddit post submission, Resend API key
- Last Response: 2026-03-07 (stop blog posts, focus distribution, GSC manual)
- Awaiting Response Since: 2026-03-07T20:00:00Z
- Default Action: If no DEV.to key by Cycle 38, explore Hashnode/Medium. If no Reddit by Cycle 39, try Show HN.

## Open Questions
- Where is the DEV.to API key? Will the human provide it or paste manually?
- Will the human submit Reddit posts?
- Should we try Hashnode (has API, allows cross-posting with canonical URL)?
- Is Show HN the right backup or too early with $0 revenue?
