# Auto Company Consensus

## Last Updated
2026-03-08T10:00:00Z

## Current Phase
Building -- Dashboard Three Spaces (LIVE | OBSERVE | ACT)

## What We Did This Cycle
Cycle 126 -- Complete dashboard redesign per human directive: Three Spaces architecture.

1. **Human directive processed** -- "Dashboard Architecture: Three Spaces" received and executed. Replaces all previous widget layouts.
2. **LIVE tab built** -- Split view: terminal feed (60%, dark bg, agent color badges, filter tabs) + context panel (40%, dynamic content for selected entry) + bottom status bar
3. **OBSERVE tab built** -- Four sections: global metrics grid (10 metrics), document browser (file tree + rendered content), memory section (consensus + cycle history + escalations), cost breakdown (per-cycle bars, cumulative spend, cost by layer)
4. **ACT tab built** -- Split view: action center (escalation inbox, cycle frequency controls, agent enable/disable toggles) + chat interface ("Talk to your CEO")
5. **StatusBanner** -- Always-visible dark banner: company name, ACTIVE badge, cycle number, cost ticker
6. **Old widgets removed** -- Deleted CompanyHeader + 8 widget files (Activity, Chat, CycleStatus, Team, Finance, GitHub, Documents, Tasks)
7. **Mock data created** -- Rich mock data: 25 terminal entries, 8 documents, 5 cycle history, 3 escalations, 8 chat messages, 14 agent definitions, cost data
8. **Build passes** -- 6/6 static pages, no TypeScript errors, 13.4kB company route

## Key Decisions Made
- Executed human directive exactly as specified -- no improvisation, no "improvements"
- Frontend shell only -- mock data, no backend yet (as directed)
- Client-side tab state (useState) -- no URL routing for tabs
- Single-file-per-tab architecture -- LiveTab.tsx, ObserveTab.tsx, ActTab.tsx
- Kept existing data pipeline (consensus.md → state.json) for future real data integration

## Active Projects
- **dashboard**: `projects/dashboard/` -- THREE SPACES COMPLETE (LIVE | OBSERVE | ACT), deploying to Railway at `app.runautoco.com`
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` -- v1.1.1
- npm package: LIVE at `https://www.npmjs.com/package/create-auto-co` v1.1.1
- landing page: LIVE at `https://runautoco.com`
- demo dashboard: LIVE at `https://runautoco.com/demo`

## Distribution Tracker
| Channel | Status | URL/PR |
|---------|--------|--------|
| npm (create-auto-co) | LIVE v1.1.1 | https://www.npmjs.com/package/create-auto-co |
| dev.to | ARTICLE READY (awaiting API key -- 2 cycles, defaulting to skip) | docs/marketing/devto-120-cycles.md |
| awesome-claude-code | CLOSED (resubmit via issue after Mar 22) | https://github.com/hesreallyhim/awesome-claude-code/pull/942 |
| awesome-claude-skills | PR open (0 reviews) | https://github.com/ComposioHQ/awesome-claude-skills/pull/335 |
| awesome-ai-agents (e2b) | PR open (0 reviews) | https://github.com/e2b-dev/awesome-ai-agents/pull/395 |
| awesome-ai-agents (slava) | PR open (0 reviews) | https://github.com/slavakurilyak/awesome-ai-agents/pull/94 |
| awesome-ai-tools | PR open (0 reviews) | https://github.com/mahseema/awesome-ai-tools/pull/732 |
| awesome-llm-agents | PR open (0 reviews) | https://github.com/kaushikb11/awesome-llm-agents/pull/88 |

## Metrics
- Revenue: $0
- Users: 1 (creator) + 74 GitHub clones (14d)
- MRR: $0
- Waitlist signups: 2
- GitHub stars: 13
- GitHub forks: 1
- GitHub views (14d): 40 (26 unique)
- GitHub clones (14d): 166 total (74 unique)
- npm package: create-auto-co v1.1.1
- Blog posts: 4
- Deployed Services: Railway (landing, dashboard), npm
- Cost/month: ~$7 (Railway -- 2 services)
- Total cost: ~$244 (126 cycle runs)

## Next Action
**Cycle 127: Deploy Three Spaces to Railway + distribution follow-up.**
1. Git push to trigger Railway auto-deploy of Three Spaces dashboard
2. Dev.to API key: 2 cycles elapsed with no response -- skip dev.to auto-publish, human can manually paste if desired
3. Check awesome-list PR statuses (5 PRs open, comment on stale ones)
4. Consider SWR real-time data integration for future cycle (terminal feed from live data, metrics auto-refresh)

## Company State
- Product: auto-co framework + Three Spaces dashboard (LIVE terminal + OBSERVE transparency + ACT controls) + demo + landing + pricing + blog (4 posts) + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + motion + Railway + npm + GitHub Actions
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 GitHub clones

## Human Escalation
- Pending Request: no (dev.to API key request expired -- 2 cycles, defaulting to skip)
- Last Response: 2026-03-08 (Dashboard Three Spaces directive -- EXECUTED this cycle)
- Awaiting Response Since: N/A

## Open Questions
- When to add SWR real-time data refresh for terminal + metrics?
- Should the LIVE tab eventually connect to a WebSocket for true streaming?
- When to follow up on stale awesome-list PRs (5 open, 0 reviews)?
