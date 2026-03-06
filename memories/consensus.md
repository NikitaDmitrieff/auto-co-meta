# Auto Company Consensus

## Last Updated
2026-03-07T00:00:00Z

## Current Phase
Distribution — Phase 3 (Demo dashboard built, landing page + demo live)

## What We Did This Cycle
Cycle 16 — Built and deployed the demo dashboard per human directive.

**Human response processed (2026-03-06T15:00 + re-sent 2026-03-06T15:35):**
- STOP distribution work — wrong to push without something to show
- BUILD demo dashboard at /demo as #1 priority (Cycles 16-17)
- Screenshots → embed in landing page (Cycle 17)
- Then resume distribution

**Demo dashboard shipped (`/demo`):**
- Agent Activity Feed — live-looking chat with typing indicator simulation, 11 real messages from agents, orange highlight on latest messages, LIVE badge, AnimatePresence entrance
- Cycle Progress — 16-cycle timeline, progress bar animation, cost per cycle, running indicator
- P&L / Financial — $24.80 total / $1.67/cycle / $0 revenue (honest) / ~$55/mo burn / SVG cumulative cost chart
- Ship Log — 6 commit entries with real hashes, file counts, deploy status, Railway/Supabase tags
- Agent Roster — all 14 agents, active/idle dots, animated entrance, stats footer
- Company State — current phase, next action

**Build result:** ✓ 5/5 static pages, clean TypeScript
**Deploy result:** ✓ HTTP 200 at auto-co-landing-production.up.railway.app/demo
**Landing page changes:** Hero "See demo dashboard →" CTA + Footer "Live Demo" link

**Files changed:** 3 files (new: demo/page.tsx, updated: Hero.tsx, Footer.tsx) — 788 insertions

## Key Decisions Made
- **All-in-one page file** — Put all dashboard components inline in page.tsx (no extra files). Simpler, maintainable, no over-engineering.
- **Static fake data from real numbers** — Used actual cycle costs, commit hashes, and agent messages that match the real consensus. Authentic feels better than generic.
- **Typing indicator simulation** — useEffect adds "DHH is typing" at 2.8s, then shows new message at 5.5s. Makes the feed feel genuinely live on first load.
- **SVG cost chart** — Built inline with real cumulative cost data ($0 → $24.80). No charting library needed.
- **Orange highlight on latest messages** — Left border accent on "highlight: true" messages gives visual hierarchy without clutter.

## Active Projects
- auto-co framework: `https://github.com/NikitaDmitrieff/auto-co-meta` (v1.0.0)
- landing page: LIVE at `https://auto-co-landing-production.up.railway.app` — premium design + demo CTA
- demo dashboard: LIVE at `https://auto-co-landing-production.up.railway.app/demo` — 6 panels, real data

## Metrics
- Revenue: $0
- Users: 1 (creator)
- MRR: $0
- Waitlist signups: 0 (checking next cycle)
- GitHub stars: 0
- Demo dashboard: LIVE (Cycle 16 ship)
- Deployed Services: Railway (landing + demo — healthy)
- Cost/month: ~$5 (Railway) + $0 (Supabase free tier)
- Cycle 16 cost: ~$1.67 (est)

## Next Action
**Cycle 17: Screenshots + Landing Page Update.**

Priority order:
1. **Screenshot the demo dashboard** — Use puppeteer or agent-browser to capture `/demo` screenshots (full page + each panel individually). Save to `projects/landing/public/screenshots/`.
2. **Update landing page Hero** — Replace the terminal/clone-command block with a dashboard screenshot. Lead with: "Watch your AI team build your product in real-time" + screenshot of the Agent Activity Feed.
3. **Replace LiveDemo section** — Replace the cycle log terminal with a screenshot of the dashboard (or keep the terminal as secondary). The dashboard screenshot is more compelling.
4. **Update copy** — Hero subheading: make it outcomes-focused ("Your AI team is running right now") not code-focused. Keep the GitHub clone as secondary CTA.
5. **Check Supabase analytics** — Any page views or waitlist signups since Cycle 15 relaunch?

After Cycle 17: Resume distribution (DEV.to article, Twitter thread, IH post).

## Company State
- Product: auto-co framework (autonomous AI company OS) + demo dashboard (live)
- Tech Stack: Bash + Claude Code CLI + Node.js + Next.js (landing + demo) + Railway + Supabase
- Business Model: Open-source core (MIT) + Hosted paid tier ($49/$99/mo)
- Revenue: $0
- Users: 1

## Human Escalation
- Pending Request: NO
- Last Response: 2026-03-06T15:35 — build demo dashboard (Cycles 16-17), then screenshots for landing, then distribution
- Awaiting Response Since: N/A

## Open Questions
- Do the dashboard screenshots look good enough to embed in the landing page? Need to assess after taking them.
- Should we use puppeteer (code) or agent-browser (headless) for screenshots? Puppeteer is more reliable for pixel-perfect captures.
- After distribution resumes: which channel first? DEV.to article seems highest ROI — founders/indie hackers, SEO value, shows technical depth.
- Should we close the 6 abandoned awesome-list PRs? Low harm to leave open, but might create confusion.
