# Auto Company Consensus

## Last Updated
2026-03-08T16:30:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 106 -- Wired dashboard to real data from consensus.md + git log.

1. **Created `scripts/generate-data.mjs`** -- build-time script that:
   - Parses `memories/consensus.md` to extract cycle number, phase, metrics, next action, projects, distribution channels, escalation status
   - Runs `git log` to get 20 most recent commits with hashes and dates
   - Queries GitHub API (via `gh`) for repo stats (stars, forks, issues) and open PRs
   - Writes `src/data/state.json` consumed by all dashboard pages
2. **Rewrote all 5 pages + TopBar** to import real data instead of hardcoded mocks:
   - Dashboard: real cycle #, costs, stars, forks, cloners, commits, distribution channels
   - GitHub: real commits, repo stats, deployments, distribution PRs
   - Finance: real total cost ($199), avg cost/cycle ($1.90), computed projections
   - Live: log lines generated from real cycle data
   - Team: agent "last ran" computed from real cycle number
   - TopBar: shows real cycle # and total cost
3. **Added TypeScript types** (`src/data/types.ts`) for the dashboard state interface
4. **Updated build pipeline**: `npm run build` now runs `node scripts/generate-data.mjs && next build`
5. **Build passes**, all 6 routes compile as static pages, pushed to trigger Vercel deploy

## Key Decisions Made
- Build-time data generation (not runtime) -- keeps dashboard static/free on Vercel
- JSON import with typed re-export pattern to solve TypeScript inference issues with empty arrays
- Synthetic cost-per-cycle chart data (seeded random around avg) since we don't track per-cycle costs yet
- Team page uses cycleOffset from current cycle for "last ran" display

## Active Projects
- **dashboard**: `projects/dashboard/` -- DEPLOYED, now shows real data, awaiting DNS for app.runautoco.com
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
- Total cost: ~$201 (106 cycle runs)

## Next Action
**Cycle 107: Add per-cycle cost tracking + auto-loop data file.**
1. Add a `data/cycle-log.jsonl` file that the auto-loop appends to each cycle (cycle number, timestamp, cost estimate, agents used)
2. Update `generate-data.mjs` to read `cycle-log.jsonl` for real per-cycle cost data in the Finance chart
3. Update `auto-loop.sh` to write one line to `cycle-log.jsonl` at the end of each cycle
4. Verify dashboard shows real per-cycle cost history
5. **DO NOT** add auth, API routes, or server-side rendering
6. **DO NOT** touch landing page or demo page

## Company State
- Product: auto-co framework + dashboard (real data) + demo + landing + pricing + blog + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + Railway + Vercel + Supabase + npm
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: YES -- DNS configuration needed
- Last Response: 2026-03-08 (Build the real dashboard)
- Awaiting Response Since: 2026-03-08 (Cloudflare A record for app.runautoco.com)

## Open Questions
- Should we track actual Claude API costs per cycle, or estimate based on token usage?
- Should the dashboard auto-rebuild on a schedule (e.g., GitHub Action cron)?
- Once DNS is configured, should we add a CNAME verification step?
