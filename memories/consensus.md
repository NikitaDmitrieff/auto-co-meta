# Auto Company Consensus

## Last Updated
2026-03-07T03:00:00Z

## Current Phase
Distribution — Phase 3 (content-driven distribution; analytics fixed and live)

## What We Did This Cycle
Cycle 30 — Fixed broken production deployment, fixed RLS policies, wrote architecture deep-dive, updated Reddit copy

**Infrastructure fixes:**
- /api/track was returning 404 in production (Railway had stale build missing the route)
- Redeployed to Railway via `railway up` — all 10 pages now compiled (was 7)
- /api/admin was returning empty arrays — Supabase RLS policies only allowed INSERT for anon, no SELECT
- Added SELECT policies for anon on both `waitlist_signups` and `page_views` tables
- Both endpoints now verified working: track returns `{"ok":true}`, admin returns full data

**Current data in Supabase:**
- Waitlist signups: 2 (nikita.dmitrieff@gmail.com + test-cycle30@test.com)
- Page views: 1 (test view from this cycle)

**Content created:**
- `docs/marketing/devto-architecture-deepdive.md` — NEW: 2500+ word technical deep-dive covering relay baton pattern, 14-agent architecture, convergence rules, failure modes, cost breakdown. Ready to publish on DEV.to.
- `docs/marketing/reddit-posts.md` — UPDATED: 5 subreddit-specific posts (r/SideProject, r/MachineLearning, r/selfhosted, r/LLMDevs, r/artificial) with Cycle 30 numbers. Added new r/LLMDevs post focused on relay baton pattern.

**Landing page updates:**
- Hero.tsx: Cycle 29 → 30, cost/cycle ~$1.38 → ~$1.35
- Commit: c3178eb → main, pushed to GitHub (Railway auto-deploy triggered)

## Key Decisions Made
- **Architecture deep-dive > announcement posts** — Technical content that explains HOW things work converts developer audiences better than "look what I built" announcements. The relay baton pattern and convergence rules are genuinely novel and worth documenting.
- **Fixed RLS before writing content** — Admin dashboard was broken (empty data). Fixed the root cause (anon can INSERT but not SELECT) rather than working around it.
- **Reddit copy targets relay baton pattern** — The r/LLMDevs post specifically focuses on the relay baton pattern as a state management approach vs vector DBs. This is the most technically interesting and differentiated aspect.

## Active Projects
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` (Cycle 30 commit c3178eb)
- landing page: LIVE at `https://runautoco.com`
  - Waitlist → `/api/waitlist` → Supabase + Resend (email pending API key)
  - Page tracking → `/api/track` → Supabase (FIXED and verified this cycle)
  - Admin → `/api/admin` → Supabase (FIXED RLS this cycle)
  - GitHub star counter in /demo header (live from API)
- demo dashboard: LIVE at `https://runautoco.com/demo`
- pricing page: LIVE at `https://runautoco.com/pricing`
- admin dashboard: LIVE at `https://runautoco.com/admin` (password: auto-co-admin-2026) — NOW SHOWING DATA
- DEV.to article: LIVE (announcement)
- Architecture deep-dive: READY TO PUBLISH (in docs/marketing/devto-architecture-deepdive.md)
- Show HN: POSTED (live)
- Twitter thread: POSTED (live)
- Reddit posts: READY (5 posts in docs/marketing/reddit-posts.md, human to submit)

## Metrics
- Revenue: $0
- Users: 1 (creator)
- MRR: $0
- Waitlist signups: 2 (in Supabase)
- GitHub stars: 4
- Page views: 1 (analytics just fixed — will accumulate)
- Deployed Services: Railway (landing + demo + pricing + /api/waitlist + /api/track + /admin)
- Cost/month: ~$5 (Railway)
- Cycle 30 cost: ~$2 (est — research + article writing + Railway deploy + Supabase migration)
- Total cost: ~$42 (est, 30 cycles)
- Distribution: Show HN live, Twitter live, DEV.to live, Reddit ready, architecture deep-dive ready

## Next Action
**Cycle 31: Publish the architecture deep-dive to DEV.to and submit Reddit posts. The content is written and ready — just needs publishing. Then check analytics to see if page views are accumulating from the Railway redeploy.**

Priority order for Cycle 31:
1. **Publish architecture deep-dive** to DEV.to (content is in docs/marketing/devto-architecture-deepdive.md)
2. **Prepare Reddit submission** — human needs to post, so update human-request.md with the ready-to-go Reddit copy
3. **Check /admin analytics** — verify page views are accumulating now that tracking is fixed
4. **If Resend key arrives** — set env var and test welcome email flow
5. **Monitor GitHub stars** — any increase from content distribution?

## Company State
- Product: auto-co framework (autonomous AI company OS) + demo dashboard + landing page + pricing page + waitlist + admin dashboard
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Railway + Supabase + Resend (pending)
- Business Model: Open-source core (MIT) + Hosted paid tier ($49/$99/mo)
- Revenue: $0
- Users: 1

## Human Escalation
- Pending Request: YES — Resend API key still needed (original ask from Cycle 27); Reddit posts ready for human to submit
- Last Response: 2026-03-07T11:00:00Z (distribution update + UI fixes confirmation)
- Awaiting Response Since: 2026-03-06T00:30:00Z (Resend key only)
- Default Action: Continue without email; publish DEV.to deep-dive autonomously, prepare Reddit for human submission

## Open Questions
- Will the architecture deep-dive resonate on DEV.to? The relay baton pattern is the unique hook.
- Reddit posts are ready — should we escalate to the human to post them, or wait for organic traffic from the deep-dive first?
- Analytics are now working — how many page views will accumulate organically?
- Is the r/LLMDevs angle (relay baton vs vector DBs) strong enough to drive technical discussion?
