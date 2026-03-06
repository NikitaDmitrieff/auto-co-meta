# auto-co

A fully autonomous AI company powered by 14 AI agents running on Claude Code CLI. The agents research market opportunities, validate ideas, build products, deploy to real infrastructure, monitor performance, and pivot based on data.

## How It Works

A macOS `launchd` daemon runs `auto-loop.sh` in continuous cycles. Each cycle:

1. Reads `memories/consensus.md` (the cross-cycle relay baton)
2. Builds a prompt from `PROMPT.md` + consensus + cycle number
3. Runs `claude -p` with the assembled prompt
4. The AI assembles a team of 3-5 agents, executes work, produces artifacts
5. Updates `consensus.md` with what happened and what's next
6. Sleeps, then repeats

## The 14 Agents

| Layer | Agent | Expert Model | Role |
|-------|-------|-------------|------|
| Strategy | CEO | Jeff Bezos | Strategic decisions, prioritization, human escalation |
| Strategy | CTO | Werner Vogels | Architecture, tech selection, system design |
| Strategy | Critic | Charlie Munger | Pre-mortems, fatal flaw detection, anti-groupthink |
| Product | Product Design | Don Norman | Product definition, UX strategy |
| Product | UI Design | Matias Duarte | Visual design, design system |
| Product | Interaction | Alan Cooper | User flows, personas, interaction patterns |
| Engineering | Full-Stack | DHH | Code implementation, technical proposals |
| Engineering | QA | James Bach | Test strategy, quality gates |
| Engineering | DevOps/SRE | Kelsey Hightower | Deployments, CI/CD, infrastructure |
| Business | Marketing | Seth Godin | Positioning, brand, acquisition |
| Business | Operations | Paul Graham | Growth, community, PMF |
| Business | Sales | Aaron Ross | Sales funnel, conversion, pricing |
| Business | CFO | Patrick Campbell | Financial models, unit economics |
| Intelligence | Research | Ben Thompson | Market research, competitive analysis |

## Infrastructure

- **Vercel** — frontend deployments
- **Railway** — backend services
- **Supabase** — database, auth, storage
- **GitHub** — repos, issues, PRs
- **Telegram** — human escalation
- **Claude Code CLI** — agent runtime (OAuth subscription, zero API cost)

## Quick Start

```bash
# 1. Clone and configure
git clone https://github.com/NikitaDmitrieff/auto-co.git
cd auto-co
cp .env.example .env
# Edit .env with your Telegram bot token and chat ID

# 2. Install watcher dependencies
npm install

# 3. Run manually (foreground)
make start

# 4. Or install as a daemon (auto-restart, survives reboot)
make install
```

## Commands

```
make start          # Run loop in foreground
make start-awake    # Run loop + prevent macOS sleep
make stop           # Stop the loop gracefully
make status         # Show loop status + latest consensus
make last           # Show last cycle's full output
make cycles         # Show cycle history summary
make monitor        # Tail live logs (Ctrl+C to stop)
make install        # Install launchd daemon
make uninstall      # Remove daemon
make pause          # Pause daemon (no auto-restart)
make resume         # Resume paused daemon
make clean-logs     # Delete cycle logs
make reset-consensus # Reset to Day 0
```

## Convergence Rules

The system enforces velocity over deliberation:

1. **Cycle 1**: Brainstorm. Rank top 3 ideas.
2. **Cycle 2**: Validate #1 — Pre-Mortem + market check + financials → GO/NO-GO
3. **Cycle 3+**: GO = build. Discussion is **forbidden**. Every cycle must produce artifacts.
4. Same Next Action for 2 consecutive cycles = stalled → force direction change

**Priority: Ship > Plan > Discuss**

## Dashboard

A neo-brutalist Next.js monitoring dashboard lives in `dashboard/`. It reads the auto-co state files and displays:

- Current company phase and consensus
- Agent roster with activation history
- Cycle timeline and logs
- Artifact tree browser
- Metrics and analytics
- Agent interaction map

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:3000
```

## Human Escalation

When agents need human input (spending money, legal, credentials):

1. CEO writes to `memories/human-request.md`
2. `watcher.js` detects it and sends to Telegram
3. You reply in Telegram
4. Watcher writes reply to `memories/human-response.md`
5. Next cycle incorporates the answer

## Safety Guardrails

**Forbidden**: delete repos, delete Vercel/Railway projects, reset production DB, force push main, leak credentials, spend money without approval.

**Allowed**: create repos/branches/PRs, deploy to Vercel/Railway, create Supabase tables, install packages, use free-tier services.

## Files

```
CLAUDE.md                    # Company constitution + agent roster + safety rules
PROMPT.md                    # Per-cycle autonomous loop instructions
MASTER-PLAN.md               # Comprehensive setup guide for executing agent
auto-loop.sh                 # Main daemon loop
stop-loop.sh                 # Graceful stop + daemon pause/resume
monitor.sh                   # Live monitoring
install-daemon.sh            # launchd installer
watcher.js                   # Telegram escalation watcher
Makefile                     # All commands
.claude/agents/              # 14 agent persona definitions
.claude/skills/team/SKILL.md # Team formation skill
memories/consensus.md        # Cross-cycle relay baton
docs/<role>/                 # Agent output directories
projects/                    # Built products workspace
logs/                        # Cycle logs
dashboard/                   # Neo-brutalist monitoring UI
```

## License

Private repository. All rights reserved.
