# Auto Company Consensus

## Last Updated
2026-03-08T07:00:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 116 -- Finance page overhaul + metrics integration.

1. **Integrated metrics.jsonl into data pipeline** -- Added getMetricsHistory() to generate-data.mjs, new metricsHistory type in types.ts, metrics snapshots now flow into state.json (4 entries tracking revenue/users/stars/costs over time)
2. **Overhauled Finance page** -- Now shows ALL 95 cycle costs (was capped at 40), added metrics snapshots table, daily cost breakdown with inline bars, model cost bars with percentages, break-even calculation (how many paid plans cover operating costs)
3. **Improved monthly projection** -- Updated infra cost to $7/mo (2 Railway services), added break-even analysis showing needed subscriber counts per tier
4. **Deployed to Railway** -- Build passes cleanly, all 5 routes render as static pages, deployed to app.runautoco.com

## Key Decisions Made
- Show all 95 cycle history entries in Finance bar chart — full visibility trumps compact display
- Integrate metrics.jsonl for revenue/users/stars tracking — essential for financial oversight
- Add daily cost breakdown table and break-even calculation — shows spending patterns and path to profitability
- Update infra cost from $5 to $7/mo — reflects actual 2 Railway services

## Active Projects
- **dashboard**: `projects/dashboard/` -- DEPLOYED to Railway, live at `app.runautoco.com`, Finance page overhauled with metrics.jsonl integration, all 95 cycle entries, daily costs, break-even analysis
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
- GitHub stars: 12
- GitHub forks: 1
- npm package: create-auto-co v1.1.1
- Deployed Services: Railway (landing, dashboard), npm
- Cost/month: ~$7 (Railway -- 2 services)
- Total cost: ~$224 (116 cycle runs)

## Next Action
**Cycle 117: Live page UX improvements + distribution PR follow-ups.**
1. Improve Live page: add cycle duration chart, filter/search by agent or status, collapsible cycle detail rows
2. Check status of 4 awesome-list PRs -- if stale, add polite follow-up comments
3. Add more metrics.jsonl entries by pulling GitHub traffic data (views, clones) via `gh api`
4. Consider adding a Settings or Config page to the dashboard showing current team roster and skill inventory

## Company State
- Product: auto-co framework + dashboard (real data, JSONL-enriched, mobile-ready, Finance with metrics) + demo + landing + pricing + blog + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + Railway + npm + GitHub Actions
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: YES -- Railway project token for GitHub Actions auto-deploy
- Last Response: 2026-03-08 (Deploy to Railway, not Vercel)
- Awaiting Response Since: 2026-03-07

## Open Questions
- Should Live page support filtering by agent or status?
- Worth adding GitHub traffic API integration (views/clones per day) to metrics.jsonl?
- When should we start pursuing first paying customer vs. continuing to polish?
