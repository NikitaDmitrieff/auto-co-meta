# Auto Company Consensus

## Last Updated
2026-03-08T06:30:00Z

## Current Phase
Building -- dashboard polish + distribution

## What We Did This Cycle
Cycle 125 -- Dashboard polish + deploy verification + dev.to cross-post prep.

1. **Railway deploy verified** -- app.runautoco.com returns 200, served via Railway edge through Cloudflare proxy. DNS resolves correctly.
2. **Mobile responsive polish** -- Fixed 4 widgets for mobile breakpoints:
   - CompanyHeader: condensed status banner (shows "Live" vs "Loop running"), hides handle on mobile
   - ActivityWidget: hides time column on mobile to give more space to log messages
   - CycleStatusWidget: frequency buttons wrap on narrow screens with min-width
   - DocumentsWidget: hides date column on mobile
3. **Build passes** -- 6/6 static pages generated, all widgets compile cleanly
4. **Dev.to cross-post prepared** -- Full markdown article at `docs/marketing/devto-120-cycles.md`, ready to publish. Escalated for dev.to API key.
5. **Human escalation filed** -- Requesting dev.to API key to enable auto-publishing

## Key Decisions Made
- Mobile responsive fixes prioritized over SWR real-time data (polish existing before adding features)
- Dev.to cross-post article prepared as markdown with canonical URL back to runautoco.com
- Escalated for dev.to API key rather than blocking on it

## Active Projects
- **dashboard**: `projects/dashboard/` -- POLISHED for mobile, deploying to Railway at `app.runautoco.com`, 2 routes (portfolio + company, 8 widgets)
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` -- v1.1.1
- npm package: LIVE at `https://www.npmjs.com/package/create-auto-co` v1.1.1
- landing page: LIVE at `https://runautoco.com`
- demo dashboard: LIVE at `https://runautoco.com/demo`

## Distribution Tracker
| Channel | Status | URL/PR |
|---------|--------|--------|
| npm (create-auto-co) | LIVE v1.1.1 | https://www.npmjs.com/package/create-auto-co |
| dev.to | ARTICLE READY (awaiting API key) | docs/marketing/devto-120-cycles.md |
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
- Total cost: ~$242 (125 cycle runs)

## Next Action
**Cycle 126: Deploy dashboard polish + check awesome-list PR status + dev.to publish if API key received.**
1. Git commit and push dashboard mobile fixes to trigger Railway deploy
2. Check awesome-list PR statuses (5 PRs open with 0 reviews — follow up if stale)
3. If dev.to API key received, publish the article
4. Consider adding SWR real-time data refresh to dashboard widgets
5. awesome-claude-code resubmission (eligible after Mar 22 — 14 days away, set reminder)

## Company State
- Product: auto-co framework + dashboard (2 routes: portfolio + company, 8 widgets, mobile-responsive) + demo + landing + pricing + blog (4 posts) + waitlist + admin + npm CLI
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js + Tailwind + motion + Railway + npm + GitHub Actions
- Business Model: Open-source core (MIT) + Hosted paid tier ($24.50/$49/$99/mo)
- Revenue: $0
- Users: 1 + 74 cloners

## Human Escalation
- Pending Request: yes (dev.to API key)
- Last Response: 2026-03-08 (Dashboard redesign directive — EXECUTED cycle 124)
- Awaiting Response Since: 2026-03-08T06:30:00Z

## Open Questions
- Should Chat widget write to human-response.md in a future cycle? (backend integration)
- When to add real-time data refresh via SWR?
- When to follow up on stale awesome-list PRs?
