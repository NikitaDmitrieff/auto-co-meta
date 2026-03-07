# auto-co — Autonomous AI Company OS

> 14 AI agents that debate, decide, and ship — 24/7, without you in the loop.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Open Source](https://img.shields.io/badge/open--source-yes-brightgreen.svg)](https://github.com/NikitaDmitrieff/auto-co-meta)

![auto-co demo dashboard — agent activity feed, cycle progress, P&L panel](https://runautoco.com/screenshots/demo-full.png)

**Auto-Co** is an open-source framework for running a fully autonomous AI company. You give it a mission. It forms a team of specialized AI agents, loops continuously, and ships real software — to real infrastructure, with real deployments.

This repo is the framework itself — currently being built and maintained by an auto-co instance running autonomously (yes, it wrote most of this).

→ **[Hosted version waitlist](https://runautoco.com)** — no-code, managed, $49/mo

---

## What the AI team has shipped (62 cycles in)

This repo is being built by an auto-co instance running itself. Here's what it has autonomously produced:

| Artifact | Status |
|----------|--------|
| This README and all docs | Written by agents |
| Premium Next.js landing page + waitlist | Live at [runautoco.com](https://runautoco.com) |
| Live demo dashboard at `/demo` (6 panels) | [runautoco.com/demo](https://runautoco.com/demo) |
| Blog with 3 posts | Live at [runautoco.com/blog](https://runautoco.com/blog) |
| Pricing page | Live at [runautoco.com/pricing](https://runautoco.com/pricing) |
| Admin panel | Live at [runautoco.com/admin](https://runautoco.com/admin) |
| Docker / Compose dev stack | Committed |
| 31 CLI flags (--status, --doctor, --init, --snapshot, --diff, --restore, --backup, --rollback, etc.) | Production-ready |
| CI/CD with GitHub Actions | Active |
| Business model (open-core + hosted tiers) | Decided by CEO + CFO agents |
| GitHub Release v1.1.0 | Published |

**Total cost:** ~$111 over 62 cycles (~$1.80/cycle) · **Infra:** ~$5/mo · **Human interventions in daily ops:** ~10 total

![auto-co agent activity feed panel](https://runautoco.com/screenshots/demo-activity.png)

**Follow the build:** [GitHub Discussions — 15 cycles story](https://github.com/NikitaDmitrieff/auto-co-meta/discussions/1)

No humans wrote the code. No humans made the product decisions. The loop runs, the agents argue, and things get shipped.

---

## What it does

Every cycle, auto-co:

1. **Reads the shared consensus** — current state, what was done, what's next
2. **Forms a team** — picks 3–5 agents relevant to the task
3. **Executes** — writes code, deploys services, publishes content, analyzes competitors
4. **Updates the relay baton** — writes the next action for the next cycle

Decisions that require a human (spending money, legal questions, credentials) are escalated via Telegram. Everything else is autonomous.

---

## Quick Start

**Requirements:** [Anthropic API key](https://console.anthropic.com), [Claude Code CLI](https://claude.ai/code), Node.js 20+, git

```bash
# 1. Clone
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta

# 2. Configure
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# 3. Start
make start

# 4. Monitor in another terminal
make monitor
```

With Docker:

```bash
make docker-start    # loop + dashboard
make docker-monitor  # tail logs
```

---

## Architecture

```
auto-co-meta/
├── auto-loop.sh          # Main loop — runs indefinitely
├── watcher.js            # Telegram escalation watcher
├── PROMPT.md             # The autonomous agent's master prompt
├── CLAUDE.md             # Company constitution (agents, safety, workflows)
├── Makefile              # All commands
├── memories/
│   ├── consensus.md      # Cross-cycle relay baton (state + next action)
│   ├── human-request.md  # Outbound: escalation to human
│   └── human-response.md # Inbound: reply from human
├── docs/                 # Each agent's output directory
│   ├── ceo/              # Strategic memos, PR/FAQ
│   ├── cto/              # ADRs, system design
│   ├── marketing/        # Positioning, content plans
│   └── ...
├── projects/             # All products built by the team
│   ├── landing/          # This landing page (Next.js)
│   └── dashboard/        # Live monitoring dashboard (Next.js)
└── .claude/
    └── agents/           # Agent persona definitions
```

**The loop is deliberately simple:** `auto-loop.sh` calls Claude Code with `PROMPT.md`, which reads the consensus, picks a team, executes, and writes a new consensus. Repeat.

---

## The 14 Agents

| Layer | Agent | Modeled on | Role |
|-------|-------|-----------|------|
| Strategy | CEO | Jeff Bezos | Strategy, priorities, final decisions |
| Strategy | CTO | Werner Vogels | Architecture, tech selection |
| Strategy | Critic | Charlie Munger | Veto power, pre-mortem, inversion |
| Product | Product | Don Norman | UX, usability, feature definition |
| Product | UI | Matias Duarte | Design system, visual direction |
| Product | Interaction | Alan Cooper | User flows, personas |
| Engineering | Fullstack | DHH | Implementation, code review |
| Engineering | QA | James Bach | Test strategy, quality gates |
| Engineering | DevOps | Kelsey Hightower | Deployments, infra, CI/CD |
| Business | Marketing | Seth Godin | Positioning, content, distribution |
| Business | Operations | Paul Graham | User acquisition, retention |
| Business | Sales | Aaron Ross | Pricing, conversion, CAC |
| Business | CFO | Patrick Campbell | Financial model, unit economics |
| Intelligence | Research | Ben Thompson | Market research, competitive analysis |

---

## Commands

```
make start           # Run loop in foreground
make start-awake     # Run loop + prevent macOS sleep
make stop            # Stop the loop
make status          # Show loop status + latest consensus
make last            # Show last cycle's full output
make cycles          # Show cycle history
make monitor         # Tail live logs
make install         # Install as launchd daemon (macOS)
make uninstall       # Remove daemon
make docker-start    # Start with Docker Compose
make docker-monitor  # Tail Docker logs
make bump-version    # Bump patch version (PART=patch|minor|major)
make dry-run         # Preview prompt without running Claude
make quick-status    # Quick status from state file
make changelog       # Generate changelog from git log (SINCE=v0.50.0)
make config          # Print all loop configuration values
make lint            # Run shellcheck on all shell scripts
make test            # Run selftest + lint together
make version         # Show current version
make reset-consensus # Reset to Day 0
```

### Loop flags

```
./auto-loop.sh                        # Run in foreground
./auto-loop.sh --daemon               # Run via launchd (no tty)
./auto-loop.sh --help                 # Show full help message
./auto-loop.sh --version              # Show version
./auto-loop.sh --config               # Print all config values
./auto-loop.sh --status               # Quick status with cycle duration stats
./auto-loop.sh --status --json        # Machine-readable JSON output
./auto-loop.sh --selftest             # Validate environment (12 checks)
./auto-loop.sh --dry-run              # Build prompt + show preview, don't run
./auto-loop.sh --doctor               # Comprehensive system health check (12 checks)
./auto-loop.sh --upgrade              # Check for newer version on GitHub
./auto-loop.sh --init <dir>           # Scaffold a new auto-co project
./auto-loop.sh --watch                # Live dashboard (alias for monitor.sh --dashboard)
./auto-loop.sh --pause                # Pause the loop (skip cycles until resumed)
./auto-loop.sh --resume               # Resume a paused loop
./auto-loop.sh --metrics              # Quick KPI dashboard (cycles, cost, duration)
./auto-loop.sh --tail                 # Follow main loop log in real-time
./auto-loop.sh --cycles N             # Run at most N cycles, then exit cleanly
./auto-loop.sh --notify URL           # POST JSON notifications to webhook after each cycle
./auto-loop.sh --env                  # Generate .env.example with all config options
./auto-loop.sh --snapshot             # Create timestamped tarball of project state
./auto-loop.sh --diff A B             # Compare two snapshots (added/removed/modified)
./auto-loop.sh --restore SNAP        # Restore project state from a snapshot tarball
./auto-loop.sh --restore SNAP --backup  # Backup current state before restoring
./auto-loop.sh --rollback              # Undo last restore from pre-restore backup
./auto-loop.sh --logs [N]             # Show last N lines of loop log
./auto-loop.sh --cost                 # Show cost summary across cycles
./auto-loop.sh --history [N]          # Show last N cycles as table
./auto-loop.sh --history --compact    # One-line-per-cycle summary
./auto-loop.sh --export [FMT]         # Export cycle history (csv, json, markdown)
./auto-loop.sh --reset-errors         # Clear circuit breaker state
./auto-loop.sh --purge-logs [N]       # Purge old logs, keep latest N
```

### Monitor flags

```
./monitor.sh                # Tail the main log (live)
./monitor.sh --status       # Loop status + latest consensus
./monitor.sh --last         # Last cycle's result
./monitor.sh --cycles       # Summary of all cycles
./monitor.sh --costs        # Cost analytics breakdown
./monitor.sh --history      # Tabular cycle history
./monitor.sh --dashboard    # Live-updating compact dashboard (10s refresh)
./monitor.sh --export       # Export cycle history as CSV
./monitor.sh --alerts       # Check for failures, cost spikes, stalls
./monitor.sh --compare      # Compare cost/duration/success across models
./monitor.sh --health       # Combined health check (status + env + alerts + stats)
./monitor.sh --trend        # Cost & duration trend with sparklines (last 20)
./monitor.sh --trend 10     # Trend for last N cycles
```

### Consensus diff logging

After each successful cycle, the loop compares consensus before and after. If it changed, a unified diff is saved to `logs/consensus-diff-NNNN.diff` and a log line records the change.

---

## Human Escalation

When agents hit a true blocker (spending money, legal, credentials):

1. CEO writes to `memories/human-request.md`
2. `watcher.js` detects it and sends you a Telegram message
3. You reply in Telegram
4. Watcher writes the reply to `memories/human-response.md`
5. Next cycle incorporates the answer

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`. Without them, escalation requests are written to the file but not messaged out.

---

## Safety Guardrails

**Hard limits (never violated):**

- No repo/project deletion
- No database resets
- No force push to main
- No credential leaks to public repos
- No spending without human approval

**Allowed:** create repos, deploy services, install packages, write files, push branches, open PRs — all autonomously.

---

## Why auto-co vs. LangGraph / AutoGen / CrewAI?

| | auto-co | LangGraph / AutoGen |
|--|---------|---------------------|
| Philosophy | Opinionated company OS | General-purpose framework |
| Setup | Clone → .env → make start | Build your own workflows |
| Persistence | Git + markdown | Varies (often in-memory) |
| Human-in-loop | Telegram, async | Usually synchronous |
| Output | Real deployments, real repos | Demos and prototypes |
| Scope | Full company operation | Task execution |

**The key difference:** auto-co is not a library. It's a running company with a mission.

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `TELEGRAM_BOT_TOKEN` | No | For human escalation notifications |
| `TELEGRAM_CHAT_ID` | No | Your Telegram chat ID |
| `LOOP_INTERVAL_SECONDS` | No | Pause between cycles (default: 300) |

---

## Hosted Version

Self-hosting requires a server and technical setup. A managed, no-code hosted version is in development:

- **Hosted ($49/mo):** Zero setup, dashboard included, Telegram built in, auto-updates
- **Pro ($99/mo):** Multiple projects, custom agents, webhook integrations

→ **[Join the waitlist](https://runautoco.com)**

---

## Contributing

PRs are welcome. The AI team reviews them.

1. Fork the repo
2. `git checkout -b feature/your-feature`
3. Commit, push, open a PR

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built by an autonomous AI company. For autonomous AI companies.*
