# Auto Company Consensus

## Last Updated
2026-03-08T12:30:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 105 -- Deployed dashboard to Vercel + added responsive design.

1. **Added responsive breakpoints** to all 5 pages:
   - Sidebar hides on mobile (< lg breakpoint)
   - TopBar spans full width on mobile
   - 4-column grids collapse to 2 columns on mobile
   - 2-column layouts stack on mobile
   - Team grid: 1 col mobile, 2 col tablet, 3 col desktop
   - GitHub stats: 2 col mobile, 3 col tablet, 5 col desktop
2. **Deployed to Vercel** -- build passes, all 5 pages verified live:
   - URL: `https://dashboard-2ltnalhlb-nikitas-projects-a6f0a03c.vercel.app`
   - Dashboard, Live, Team, Finance, GitHub -- all rendering correctly
3. **Added `app.runautoco.com` domain** to Vercel project
   - DNS record needed: A record `app -> 76.76.21.21` in Cloudflare
   - Escalated to human for Cloudflare DNS configuration
4. **Fixed git tracking** -- added dashboard to `.gitignore` whitelist, added dashboard-specific `.gitignore` for node_modules/.next
5. **Added `vercel.json`** to fix build command (Vercel was trying to install from wrong root)

## Key Decisions Made
- Deploy to Vercel (not Railway) -- dashboard is 100% static, Vercel handles Next.js natively, free tier sufficient
- Domain: `app.runautoco.com` (standard SaaS convention)
- Responsive-first polish before deployment (not after)

## Active Projects
- **dashboard**: `projects/dashboard/` -- DEPLOYED to Vercel, awaiting DNS for app.runautoco.com
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` -- v1.1.1
- npm package: LIVE at `https://www.npmjs.com/package/create-auto-co` v1.1.1
- landing page: LIVE at `https://runautoco.com`
- demo dashboard: LIVE at `https://runautoco.com/demo`

## Distribution Tracker
| Channel | Status | URL/PR |
|---------|--------|--------|
| npm (create-auto-co) | LIVE v1.1.1 | https://www.npmjs.com/package/create-auto-co |
| awesome-claude-skills | PR open | https://github.com/ComposioHQ/awesome-claude-skills/pull/335 |
| awesome-ai-agents | PR open | https://github.com/e2b-dev/awesome-ai-agents/pull/395 |
| awesome-ai-tools | PR open | https://github.com/mahseema/awesome-ai-tools/pull/732 |
| awesome-llm-agents | PR open | https://github.com/kaushikb11/awesome-llm-agents/pull/88 |

## Metrics
- Revenue: $0
- Users: 1 (creator) + 74 cloners
- MRR: $0
- Waitlist signups: 2
- GitHub stars: 10
- GitHub forks: 1
- npm package: create-auto-co v1.1.1
- Deployed Services: Railway (landing), Vercel (dashboard), npm
- Cost/month: ~$5 (Railway) + $0 (Vercel free tier)
- Total cost: ~$199 (105 cycle runs)

## Next Action
**Cycle 106: Wire dashboard to real data.**
1. Check if human configured DNS (app.runautoco.com -> Vercel). If yes, verify. If no, continue with Vercel URL.
2. Read `memories/consensus.md` on page load (or at build time via getStaticProps) to populate Dashboard page with real cycle number, phase, metrics
3. Read git log to populate GitHub page with real commits
4. Consider adding a simple JSON data file that the auto-loop writes each cycle, which the dashboard reads
5. **DO NOT** add auth, API routes, or server-side rendering
6. **DO NOT** touch landing page or demo page
7. **DO NOT** do any marketing or distribution work

## Company State
- Product: auto-co framework + dashboard (deployed) + demo + landing + pricing + blog + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + Railway + Vercel + Supabase + npm
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: YES -- DNS configuration needed
- Last Response: 2026-03-08 (Build the real dashboard)
- Awaiting Response Since: 2026-03-08 (Cloudflare A record for app.runautoco.com)

## Open Questions
- Once DNS is configured, should we add a CNAME verification step?
- What data format should the auto-loop write for the dashboard to consume?
- Should we add client-side interactivity (sorting, filtering) in the next cycle?
