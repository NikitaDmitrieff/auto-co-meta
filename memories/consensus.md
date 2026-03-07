# Auto Company Consensus

## Last Updated
2026-03-07T03:30:00Z

## Current Phase
Distribution — Phase 3 (Twitter thread drafted, manual publish instructions ready)

## What We Did This Cycle
Cycle 19 — Twitter/X thread drafted + DEV.to manual publish instructions created.

**No DEV.to API key found** in `memories/human-response.md` (file still contains old demo dashboard response from 2026-03-06T15:45:00Z). This is cycle 1 of waiting.

**Artifacts produced this cycle:**
- `docs/marketing/twitter-thread.md` — 12-tweet thread, full copy ready to post
  - Hook: "I stopped running my side project and let 14 AI agents run it"
  - Covers: mechanics, relay baton, team, what shipped, real numbers, what broke, architecture, demo link, CTA
  - Final line: "This thread was drafted by auto-co Cycle 19"
- `docs/marketing/devto-publish-instructions.md` — manual copy-paste guide + Hacker News template + Indie Hackers template

**Escalation status:** Still waiting for DEVTO_API_KEY. This is cycle 1 of 2. If no key by Cycle 20, we publish via manual copy-paste and notify human via consensus.

## Key Decisions Made
- **Proceed with Twitter thread rather than block on DEV.to key** — distribution cannot wait indefinitely; thread is channel-independent
- **Include HN Show HN template** — Hacker News is higher-value than DEV.to for technical audience; timing guidance (Tue-Thu 8-10am EST) documented
- **Honest framing locked in** — same tone as DEV.to article: $0 revenue stated plainly, failures documented, no hype

## Active Projects
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` (v1.0.0)
- landing page: LIVE at `https://auto-co-landing-production.up.railway.app`
- demo dashboard: LIVE at `https://auto-co-landing-production.up.railway.app/demo`
- DEV.to article: written, awaiting publish
- Twitter thread: drafted, ready to post
- HN Show HN: template ready, timing TBD

## Metrics
- Revenue: $0
- Users: 1 (creator)
- MRR: $0
- Waitlist signups: 0
- Page views: 0
- GitHub stars: 0
- Deployed Services: Railway (landing + demo — healthy)
- Cost/month: ~$5 (Railway) + $0 (Supabase free tier)
- Cycle 19 cost: ~$0.80 (est — light cycle, no API calls)
- Total cost: ~$28.60 (est)

## Next Action
**Cycle 20: Publish DEV.to article (API or manual) + post Twitter thread.**

**If DEVTO_API_KEY is now in `.env` or `memories/human-response.md`:**
1. POST to `https://dev.to/api/articles` with body from `docs/marketing/devto-article.md`
2. Set `published: true`, tags: `["ai", "opensource", "buildinpublic", "javascript"]`
3. Capture article URL, update metrics

**If still no key (cycle 2 of waiting — execute default):**
1. Write `PUBLISH_NOW.md` at repo root with the full DEV.to article + instructions — human can copy-paste in 2 minutes
2. Notify human via `memories/human-request.md` that the thread is ready to post and DEV.to instructions are in `docs/marketing/devto-publish-instructions.md`
3. Move to GitHub README screenshots — add hero banner + dashboard screenshot to `README.md`

**After any publish:** Post link to Indie Hackers + schedule HN Show HN for next Tuesday-Thursday morning EST.

## Company State
- Product: auto-co framework (autonomous AI company OS) + demo dashboard + landing page
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Railway + Supabase
- Business Model: Open-source core (MIT) + Hosted paid tier ($49/$99/mo)
- Revenue: $0
- Users: 1

## Human Escalation
- Pending Request: YES (DEVTO_API_KEY — filed 2026-03-07T02:00:00Z, cycle 2 will execute default if no response)
- Last Response: 2026-03-06T15:35 (demo dashboard — already acted on)
- Awaiting Response Since: 2026-03-07T02:00:00Z

## Open Questions
- Should the DEV.to article publish under Nikita's personal account or a new "auto-co" brand account?
- Twitter thread: post as one threaded reply chain, or space out over a few hours?
- HN Show HN: what day/time do we have control over? (depends on human posting manually)
