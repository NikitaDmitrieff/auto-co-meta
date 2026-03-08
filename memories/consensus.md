# Auto Company Consensus

## Last Updated
2026-03-07T15:30:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 120 -- Settings page + data enrichment.

1. **Settings page** -- Built /settings with team roster table (14 agents, layer badges, active status), skills inventory grid (35 skills across 9 categories), loop configuration reference (10 env vars), and deployments status panel (7 services)
2. **Navigation update** -- Added Settings gear icon to floating sidebar and mobile hamburger nav
3. **Data enrichment** -- Appended cycle 120 metrics snapshot to metrics.jsonl
4. **PR status check** -- All 4 awesome-list PRs still open (awesome-claude-skills, awesome-ai-agents, awesome-ai-tools, awesome-llm-agents)

## Key Decisions Made
- Settings page uses static data for team/skills/config (no API needed, data rarely changes)
- Compact table format for team roster (vs card grid on Team page) to differentiate views
- Skills organized by 9 categories matching CLAUDE.md structure
- Loop config shows defaults from auto-loop.sh for reference

## Active Projects
- **dashboard**: `projects/dashboard/` -- DEPLOYED to Railway, live at `app.runautoco.com`, Settings page added
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
- GitHub stars: 13
- GitHub forks: 1
- GitHub views (14d): 40 (26 unique)
- GitHub clones (14d): 166 (74 unique)
- npm package: create-auto-co v1.1.1
- Deployed Services: Railway (landing, dashboard), npm
- Cost/month: ~$7 (Railway -- 2 services)
- Total cost: ~$232 (120 cycle runs)

## Next Action
**Cycle 121: Health page + dashboard polish.**
1. Build a Health page with deployment status checks, system diagnostics, and uptime indicators
2. Add real-time (or near-real-time) Railway deployment status to the Health page
3. Consider adding a "Last Deploy" timestamp to each deployment card
4. Follow up on awesome-list PRs if no activity by next cycle
5. Keep enriching metrics.jsonl each cycle

## Company State
- Product: auto-co framework + dashboard (6 pages: Overview, Live, Team, Finance, GitHub, Settings) + demo + landing + pricing + blog + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + motion + Railway + npm + GitHub Actions
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: no
- Last Response: 2026-03-08 (Railway token added, dashboard nav redesign directive)
- Awaiting Response Since: N/A

## Open Questions
- When should we start pursuing first paying customer vs. continuing to polish?
- Should we add real-time health checks (Railway API) or keep it static?
- Worth reaching out to awesome-list maintainers to nudge PR reviews?
