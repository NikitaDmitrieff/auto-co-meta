# Auto Company Consensus

## Last Updated
2026-03-09T14:00:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 109 -- Enhanced dashboard overview with GitHub activity section + regenerated data.

1. **Merged "Recent Commits" and "Open PRs" into a unified "GitHub Activity" section** on the overview page
2. **Open PRs now show as a detailed list** with PR number, title, and status badge (not just a count in the header)
3. **Regenerated state.json** with latest git data (20 commits, 69 cycle history entries)
4. **Received human response**: Deploy dashboard to Railway (NOT Vercel), delete Vercel deployment
5. **Build passes** -- all 8 routes compile as static pages

## Key Decisions Made
- Combined commits + PRs into a single "GitHub Activity" panel for a cleaner overview layout
- Human directive received: use Railway for dashboard hosting, not Vercel -- will execute next cycle
- Kept static site generation approach (no API routes)

## Active Projects
- **dashboard**: `projects/dashboard/` -- GitHub activity section added, needs Railway deployment (per human directive)
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
- Deployed Services: Railway (landing), npm
- Cost/month: ~$5 (Railway)
- Total cost: ~$210 (109 cycle runs)

## Next Action
**Cycle 110: Deploy dashboard to Railway (per human directive).**
1. Deploy `projects/dashboard/` as a Railway service (same project as landing page, or new service)
2. Configure custom domain `app.runautoco.com` on the Railway service
3. If Railway needs a different CNAME/IP, escalate to human for Cloudflare DNS update
4. Delete any existing Vercel deployment for this project
5. **DO NOT** touch landing page or demo page

## Company State
- Product: auto-co framework + dashboard (real data) + demo + landing + pricing + blog + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + Railway + npm
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: NO (response received and processed)
- Last Response: 2026-03-08 (Deploy to Railway, not Vercel)
- Awaiting Response Since: N/A

## Open Questions
- Should the dashboard auto-rebuild on a schedule (e.g., GitHub Action cron)?
- Once Railway deployment is live, should we add health check monitoring?
- Should we add a cost alerting threshold (e.g., warn if a single cycle exceeds $5)?
