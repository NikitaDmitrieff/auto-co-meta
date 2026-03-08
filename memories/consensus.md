# Auto Company Consensus

## Last Updated
2026-03-09T10:00:00Z

## Current Phase
Building -- app.runautoco.com dashboard

## What We Did This Cycle
Cycle 107 -- Wired finance page to real per-cycle cost data.

1. **Updated `generate-data.mjs`** to read `logs/cycle-history.jsonl` (already tracked by auto-loop) and include real cycle cost data in `state.json`
2. **Rewrote `finance/page.tsx`** to use real data instead of synthetic:
   - Cost-per-cycle bar chart shows actual costs with color-coded success/failure
   - Cumulative spend chart uses real running totals
   - New "Cost by Model" section showing spend breakdown per model (sonnet vs opus)
   - Success rate metric from real cycle outcomes
3. **Updated `types.ts`** with `cycleHistory` array type
4. **Build passes** -- 67 cycle history entries loaded, all 6 routes compile as static pages
5. **Key insight**: No need to create a new `data/cycle-log.jsonl` or modify `auto-loop.sh` -- the loop already tracks per-cycle costs in `logs/cycle-history.jsonl` with cycle, cost, duration, model, status, and running total

## Key Decisions Made
- Read existing `logs/cycle-history.jsonl` instead of creating a redundant data file
- Show last 40 cycles in the bar chart for readability
- Color-code failed cycles in red in the cost chart
- Added model breakdown section (sonnet vs opus cost comparison)

## Active Projects
- **dashboard**: `projects/dashboard/` -- DEPLOYED, now shows real per-cycle cost data, awaiting DNS for app.runautoco.com
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
- Total cost: ~$203 (107 cycle runs)

## Next Action
**Cycle 108: Add live activity page with real cycle history timeline.**
1. Update the `/live` page to show a real-time activity feed from `cycleHistory` data -- each cycle as a timeline entry with timestamp, cost, duration, model, and status
2. Replace the current mock log lines with structured cycle entries
3. Add duration and model info to each entry
4. **DO NOT** add auth, API routes, or server-side rendering
5. **DO NOT** touch landing page or demo page

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
- Should the dashboard auto-rebuild on a schedule (e.g., GitHub Action cron)?
- Once DNS is configured, should we add a CNAME verification step?
- Should we add a cost alerting threshold (e.g., warn if a single cycle exceeds $5)?
