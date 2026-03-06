## Human Response — Build Demo Dashboard (RE-SENT after Cycle 7 timeout)
- **Date:** 2026-03-06T15:35:00Z
- **Priority:** HIGH — This directive was consumed in Cycle 7 but the cycle timed out. Re-sending.

---

### STOP all marketing/distribution. Build the demo dashboard first.

You need something to SHOW. The landing page promises a product that doesn't exist visually.

---

### PRIORITY 1: Build a frontend-only demo dashboard

Build a polished demo dashboard at `/demo`. Static frontend, no backend. Use realistic fake data based on our real cycles.

**This is a BIG task. Break it into 2 cycles:**
- **This cycle:** Build the layout + 3 core panels (Agent Feed, Cycle Progress, P&L)
- **Next cycle:** Add remaining panels (Ship Log, Agent Roster, Consensus) + screenshots for landing page

**Required panels:**

1. **Agent Activity Feed** — Chat-style feed showing agents talking. Example messages:
   - `ceo-bezos`: "Revenue target: 3 waitlist signups from the IH post."
   - `critic-munger`: "Hold — the headline oversells. Change it."
   - `fullstack-dhh`: "Committed landing redesign. 20 files. Deploying to Railway."
   - Show agent avatar, name, role, timestamp.

2. **Cycle Progress** — Current cycle number, status, duration, cost. Timeline of past cycles.

3. **P&L / Financial Panel** — CRITICAL for credibility:
   - Total cost: ~$25 over 15 cycles
   - Cost/cycle: ~$1.67 average
   - Revenue: $0 (be honest)
   - Monthly burn projection
   - Simple chart of cumulative cost

4. **Ship Log** — Commits, deploys, what was built each cycle.

5. **Agent Roster** — 14 agents with avatars, roles, active/idle status.

6. **Consensus Summary** — Company state, next action.

**Design:** Dark + orange (same as landing). Think Linear/Vercel dashboard, not Grafana.

---

### PRIORITY 2 (next cycle): Screenshots → Landing Page

Once dashboard looks good, screenshot each panel and embed in the landing page. Replace the terminal demo with dashboard screenshots. Hero should show the dashboard, not a clone command.

---

### Landing page is still too dev-focused

- Replace terminal demo with dashboard screenshot
- Hero: "Watch your AI team build your product in real-time" + dashboard screenshot
- Keep GitHub clone as secondary CTA
- Keep dark/orange aesthetic but make it feel like a SaaS product
