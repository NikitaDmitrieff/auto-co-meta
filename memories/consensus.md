# Auto Company Consensus

## Last Updated
2026-03-08T06:00:00Z

## Current Phase
Building -- dashboard redesign (NanoCorp-inspired)

## What We Did This Cycle
Cycle 124 -- Complete dashboard redesign per human directive.

1. **Human directive received** -- Dashboard redesign based on NanoCorp competitor analysis. Overrides planned cross-posting work.
2. **Sidebar navigation removed** -- Ripped out Sidebar, TopBar, MobileNav components and 6 separate pages (live, team, finance, github, health, settings).
3. **Portfolio page built** -- "/" now shows "Your Companies" with company cards + "+ New Company" card. Conglomerate-style view like NanoCorp.
4. **Single scrollable dashboard** -- "/company" now has all 8 widgets on one scrollable page:
   - **Activity** — Terminal-style log feed (dark bg, monospace, colored tags)
   - **Cycle Status** — Cycle #, cost, frequency control (PAUSED/SLOW/NORMAL/FAST/SURGE), RUN CYCLE button
   - **Team** — 14 agents compact roster with layer badges, activity indicators
   - **Tasks** — Task cards with priority/status badges, agent attribution
   - **Finance** — Cost sparkline, cumulative spend chart, projections
   - **GitHub** — Deployments, open PRs, recent commits
   - **Documents** — Mock document list with type badges
   - **Chat** — "Talk to your CEO" chat interface with placeholder messages
5. **Company header** -- Status banner (dark, loop running indicator) + company info bar
6. **Minimal top nav** -- Logo left, dropdown menu right (Portfolio, Dashboard, Website, GitHub links)
7. **All hand-built Tailwind** — Zero component libraries, white bg, orange accents, square corners, monospace for data
8. **Build passes** — 6/6 pages generated, deployed to Railway via git push

## Key Decisions Made
- Prioritized human directive over planned cross-posting work — dashboard redesign is now the focus
- Single scrollable page with widgets (matching NanoCorp UX pattern) replaces multi-page sidebar navigation
- Portfolio/conglomerate view at root — prepares for multi-company support
- All mock data for Documents and Chat — no backend changes needed yet

## Active Projects
- **dashboard**: `projects/dashboard/` -- REDESIGNED, deploying to Railway at `app.runautoco.com`, 2 routes (portfolio + company)
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` -- v1.1.1
- npm package: LIVE at `https://www.npmjs.com/package/create-auto-co` v1.1.1
- landing page: LIVE at `https://runautoco.com`
- demo dashboard: LIVE at `https://runautoco.com/demo`

## Distribution Tracker
| Channel | Status | URL/PR |
|---------|--------|--------|
| npm (create-auto-co) | LIVE v1.1.1 | https://www.npmjs.com/package/create-auto-co |
| awesome-claude-code | CLOSED (resubmit via issue after Mar 22) | https://github.com/hesreallyhim/awesome-claude-code/pull/942 |
| awesome-claude-skills | PR open (0 reviews) | https://github.com/ComposioHQ/awesome-claude-skills/pull/335 |
| awesome-ai-agents (e2b) | PR open (0 reviews) | https://github.com/e2b-dev/awesome-ai-agents/pull/395 |
| awesome-ai-agents (slava) | PR open (0 reviews) | https://github.com/slavakurilyak/awesome-ai-agents/pull/94 |
| awesome-ai-tools | PR open (0 reviews) | https://github.com/mahseema/awesome-ai-tools/pull/732 |
| awesome-llm-agents | PR open (0 reviews) | https://github.com/kaushikb11/awesome-llm-agents/pull/88 |

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
- Blog posts: 4
- Deployed Services: Railway (landing, dashboard), npm
- Cost/month: ~$7 (Railway -- 2 services)
- Total cost: ~$240 (124 cycle runs)

## Next Action
**Cycle 125: Dashboard polish + verify Railway deploy.**
1. Verify Railway deploy is live at app.runautoco.com with new design
2. Check DNS (CNAME app → ls0pn1cq.up.railway.app per human directive)
3. Polish widget responsive behavior (mobile testing)
4. Consider adding real-time data refresh via SWR (already a dependency)
5. Cross-post "120+ Cycles" blog to dev.to (deferred from cycle 124)

## Company State
- Product: auto-co framework + dashboard (2 routes: portfolio + company, 8 widgets) + demo + landing + pricing + blog (4 posts) + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + motion + Railway + npm + GitHub Actions
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: no
- Last Response: 2026-03-08 (Dashboard redesign directive — EXECUTED this cycle)
- Awaiting Response Since: N/A

## Open Questions
- Should Chat widget write to human-response.md in a future cycle? (backend integration)
- When to add real-time data refresh via SWR?
- Cross-post blog to dev.to — still planned for next cycle
