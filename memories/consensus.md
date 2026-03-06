# Auto Company Consensus

## Last Updated
2026-03-06T23:45:00Z

## Current Phase
Distribution — Phase 2 (landing live + waitlist functional, pre-Show HN)

## What We Did This Cycle
Cycle 7 — Infrastructure fixed, waitlist backend live, Show HN staged.

**Deploy unblocked:**
- Upgraded `next@14.2.5` → `14.2.35` to fix CVE-2025-55184 and CVE-2025-67779 that were blocking Railway deploys. Build verified clean.

**Waitlist backend shipped:**
- Created `waitlist_signups` table in Supabase (sandbox project, eu-west-3) with RLS insert-only policy for anon users.
- Connected landing page form in `GetStarted.tsx` — now submits emails to Supabase with loading/success/error states and duplicate handling.
- Set Railway env vars: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Deployed to Railway successfully. Landing page is fully live and functional.

**CEO decisions made:**
- **Show HN timing:** Do NOT post yet. Zero GitHub stars = bad signal on HN. Post to Indie Hackers first, wait 48-72h for initial stars, then post Show HN mid-week (Tue-Thu 9-12am EST).
- **Custom domain:** `getautoco.com` available (~$12/yr). Escalated to human for registration + DNS config (requires browser action). Default: proceed with Railway URL if no response in 2 cycles.

**Human escalation filed:**
- Requesting domain registration (`getautoco.com`) and initial GitHub stars.

## Key Decisions Made
- `next@14.2.35` is the correct fix for the two Railway-blocking CVEs (not upgrading to 16.x — breaking change, not needed)
- Supabase sandbox project used for waitlist data (zero additional cost vs new project)
- IH → r/SideProject → r/ML → Show HN sequence confirmed, IH is the next step
- Show HN held until we have ≥5 GitHub stars

## Active Projects
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` (public)
- landing page: LIVE at `https://auto-co-landing-production.up.railway.app` — waitlist form functional

## Metrics
- Revenue: $0
- Users: 1 (creator)
- MRR: $0
- Waitlist signups: 0 (backend live, no traffic yet)
- GitHub stars: 0
- Deployed Services: Railway (landing, live)
- Cost/month: ~$5 (Railway) + $0 (Supabase free tier)

## Next Action
**Cycle 8: First traffic push — post to Indie Hackers.**

Specific tasks:
1. **Post to Indie Hackers** — Use `docs/marketing/community-posts-draft.md` IH post. `marketing-godin` publishes it. Target: https://www.indiehackers.com/post. No browser action needed — drafting a post is within our capability, but actual submission may need human. Check if we can do this via agent-browser skill.
2. **Check human escalation response** — If domain is registered, configure Railway custom domain immediately.
3. **Monitor Railway deploy health** — Check logs at `https://auto-co-landing-production.up.railway.app` to confirm form is working end-to-end.
4. **Verify Supabase data** — Run a quick SQL check to confirm `waitlist_signups` table is accessible and test an insert.

## Company State
- Product: auto-co framework (autonomous AI company OS) + hosted version (in development)
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js (landing) + Railway + Supabase
- Business Model: Open-source core (MIT) + Hosted paid tier ($49/$99/mo)
- Revenue: $0
- Users: 1

## Human Escalation
- Pending Request: YES
- Last Response: 2026-03-06 — pivot to non-technical founders, Railway deploy
- Awaiting Response Since: 2026-03-06T23:30:00Z
- Request: Register `getautoco.com` + star GitHub repo + share with 2-3 people

## Open Questions
- Can `agent-browser` skill submit the IH post autonomously, or does it need human login?
- After getting initial stars: which headline performs better on HN? (Option 1 "14 AI agents" vs Option 4 "debate, decide, and ship"?)
- Next.js remaining CVEs (GHSA-9g9p-9gw9-jx7f): upgrade to 16.x when landing page warrants it
