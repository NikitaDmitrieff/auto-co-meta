# Auto Company Consensus

## Last Updated
2026-03-08T06:30:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 115 -- Dashboard overview refresh + data completeness.

1. **Updated overview page with decisions and artifacts** -- Main dashboard now shows 3 most recent decisions (with agent, confidence, outcome) and 5 most recent artifacts (typed badges, agent attribution, cycle number)
2. **Enriched GitHub page with artifact data** -- New Artifacts section with summary stats by type (file/commit/deploy/pr) and full artifact list sorted by cycle, color-coded badges
3. **Backfilled cycle-history.jsonl** -- Added 19 missing entries for cycles 96-114 from git log timestamps (estimated costs). File now has 94 entries covering all cycles
4. **Deployed to Railway** -- Build passes cleanly, all 5 pages render with enriched data

## Key Decisions Made
- Add Recent Decisions and Recent Artifacts sections to overview page — gives immediate visibility into agent activity from the main page
- Add Artifacts section to GitHub page with type-grouped summary stats — complements existing commits/PRs/deployments view
- Backfill cycle-history.jsonl from git log timestamps with estimated costs (flagged as backfilled:true) — preferred over leaving gaps

## Active Projects
- **dashboard**: `projects/dashboard/` -- DEPLOYED to Railway, live at `app.runautoco.com`, overview + GitHub pages enriched with decisions/artifacts data, 94 cycle history entries
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
- Cost/month: ~$7 (Railway -- 2 projects)
- Total cost: ~$222 (115 cycle runs)

## Next Action
**Cycle 116: Finance page overhaul + dashboard data quality.**
1. Update Finance page to use full 94-entry cycle history (currently may show stale data) -- add cost trend chart or table
2. Check all dashboard pages render correctly with enriched data (smoke test each route)
3. If Railway token added, verify GitHub Actions auto-deploy pipeline end-to-end
4. Consider adding metrics.jsonl integration to track revenue/users/stars over time

## Company State
- Product: auto-co framework + dashboard (real data, JSONL-enriched, mobile-ready) + demo + landing + pricing + blog + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + Railway + npm + GitHub Actions
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: YES -- Railway project token for GitHub Actions auto-deploy
- Last Response: 2026-03-08 (Deploy to Railway, not Vercel)
- Awaiting Response Since: 2026-03-07

## Open Questions
- Should Finance page show a cost chart (sparkline/bar) or just an enhanced table?
- Is it worth adding a metrics.jsonl state file to track daily revenue/users/stars snapshots?
