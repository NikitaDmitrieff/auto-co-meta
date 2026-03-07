<p align="center">
  <img src="projects/landing/public/logo-ac.png" alt="auto-co" width="80" />
</p>

<h1 align="center">auto-co</h1>
<p align="center"><strong>Autonomous AI Company OS</strong></p>
<p align="center">Give it a mission. It forms a team of 14 AI agents, loops 24/7, and ships real software — without you in the loop.</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" /></a>
  <a href="https://github.com/NikitaDmitrieff/auto-co-meta"><img src="https://img.shields.io/badge/open--source-yes-brightgreen.svg" alt="Open Source" /></a>
  <a href="https://github.com/NikitaDmitrieff/auto-co-meta/stargazers"><img src="https://img.shields.io/github/stars/NikitaDmitrieff/auto-co-meta?style=social" alt="Stars" /></a>
</p>

[![Watch the demo](https://img.youtube.com/vi/1zJca_zFzys/maxresdefault.jpg)](https://youtu.be/1zJca_zFzys)

> **[Watch the demo](https://youtu.be/1zJca_zFzys)** — 4 fully AI-driven companies running simultaneously, each with its own product, agents, and deployment pipeline.

**Auto-Co** is an open-source framework that runs a fully autonomous AI company. You define the mission, it assembles a team of specialized agents — CEO, CTO, Designer, Engineer, QA, Marketing, CFO — and they debate, decide, build, and deploy in a continuous loop.

This repo is the framework itself. It's also being built and maintained by an auto-co instance running autonomously.

> **[Live demo](https://runautoco.com/demo)** · **[Waitlist for hosted version](https://runautoco.com)**

---

## See it run

```
$ make start

auto-co v1.1.0 — cycle 85 starting
Reading consensus... OK
Forming team: ceo-bezos, fullstack-dhh, qa-bach, devops-hightower
Executing cycle action: "Improve README and polish codebase"
─────────────────────────────────────────────
Agent fullstack-dhh: Refactoring auto-loop.sh...
Agent qa-bach: Running selftest (12 checks)... all passed
Agent devops-hightower: Deploying to Railway... live
─────────────────────────────────────────────
Cycle 85 complete (4m 12s, $1.85)
Writing consensus... OK
Next action: "Polish admin dashboard UI"
Sleeping 300s until next cycle...
```

Each cycle: read shared state → pick agents → execute → write next action → repeat. No human in the loop unless you want one.

---

## What auto-co has shipped (autonomously)

This repo is being built by its own auto-co instance. Over 89 cycles (~$165 total), the agents have produced:

- **Full Next.js landing page** with waitlist — [runautoco.com](https://runautoco.com)
- **Live demo dashboard** with 6 panels — [runautoco.com/demo](https://runautoco.com/demo)
- **Blog** (3 posts), **pricing page**, **admin panel** — all live
- **38 CLI flags** for monitoring, snapshots, scheduling, webhooks, and more
- **Docker Compose** dev stack, **CI/CD** with GitHub Actions
- **Business model** decided by CEO + CFO agents (open-core + hosted tiers)

Average cost per cycle: ~$1.80. Infrastructure: ~$5/mo on Railway.

No humans wrote the code. No humans made the product decisions.

> **[Follow the build — 10 cycles story](https://github.com/NikitaDmitrieff/auto-co-meta/discussions/1)**

---

## Quick Start

**Requirements:** [Claude Code CLI](https://claude.ai/code), [Anthropic API key](https://console.anthropic.com), Node.js 20+, git

```bash
# Clone and configure
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
cp .env.example .env   # add your ANTHROPIC_API_KEY

# Start the loop
make start

# Monitor in another terminal
make monitor
```

Or with Docker:

```bash
make docker-start    # loop + dashboard
make docker-logs     # tail logs
```

### Scaffold a new project from a template

```bash
./auto-loop.sh --init ~/Projects/my-startup
# or from a pre-built template:
./auto-loop.sh --template saas ~/Projects/my-saas
```

Available templates: `saas` (Next.js + Supabase + Stripe), `docs-site` (MDX + Vercel), `api-backend` (Express + Railway).

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

Each cycle picks 3–5 agents relevant to the task. They don't all run every time.

---

## How it works

```
auto-co-meta/
├── auto-loop.sh          # Main loop — runs indefinitely
├── PROMPT.md             # The autonomous agent prompt
├── CLAUDE.md             # Company constitution (agents, safety, workflows)
├── memories/
│   ├── consensus.md      # Cross-cycle relay baton (state + next action)
│   ├── human-request.md  # Outbound escalation to human
│   └── human-response.md # Inbound reply from human
├── docs/                 # Each agent's output directory (ceo/, cto/, etc.)
├── projects/             # Products built by the team
└── .claude/agents/       # Agent persona definitions
```

The loop is simple: `auto-loop.sh` calls Claude Code with `PROMPT.md`, which reads the consensus, picks a team, executes, and writes a new consensus. Repeat.

---

## Commands

```bash
# Running
make start             # Run loop in foreground
make start-awake       # Run loop + prevent macOS sleep
make stop              # Stop the loop
make install           # Install as launchd daemon (macOS)

# Monitoring
make monitor           # Tail live logs
make status            # Loop status + latest consensus
make last              # Last cycle's full output
make cycles            # Cycle history

# Maintenance
make test              # Run selftest + lint
make dry-run           # Preview prompt without running Claude
make config            # Print all config values
make version           # Show current version
```

The CLI has 38 flags for power users — run `./auto-loop.sh --help` for the full list. Key ones:

| Flag | What it does |
|------|-------------|
| `--status` | Quick status with cycle duration stats |
| `--doctor` | Comprehensive system health check |
| `--dashboard` | Rich terminal dashboard (status, costs, agents) |
| `--snapshot` / `--restore` | Save and restore project state |
| `--webhook URL` | POST JSON on lifecycle events |
| `--parallel DIR` | Run multiple Claude sessions per cycle |
| `--plugin DIR` | Lifecycle hooks (pre/post-cycle scripts) |
| `--cycles N` | Run N cycles then exit |

---

## Human Escalation

When agents hit a genuine blocker (spending money, legal, credentials):

1. CEO writes to `memories/human-request.md`
2. `watcher.js` sends you a Telegram message
3. You reply in Telegram
4. Next cycle incorporates your answer

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`.

---

## Safety Guardrails

**Hard limits (never violated):**

- No repo/project deletion
- No database resets
- No force push to main
- No credential leaks to public repos
- No spending without human approval

**Allowed:** create repos, deploy services, install packages, write code, push branches, open PRs — all autonomously.

---

## Why auto-co?

| | auto-co | LangGraph / AutoGen / CrewAI |
|--|---------|------------------------------|
| Philosophy | Opinionated company OS | General-purpose framework |
| Setup | Clone → .env → `make start` | Build your own workflows |
| Persistence | Git + markdown (survives restarts) | Often in-memory |
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

Don't want to self-host? A managed version is coming:

- **Hosted ($49/mo)** — Zero setup, dashboard, Telegram, auto-updates
- **Pro ($99/mo)** — Multiple projects, custom agents, webhooks

> **[Join the waitlist](https://runautoco.com)**

---

## Contributing

PRs welcome. The AI team reviews them.

```bash
git checkout -b feature/your-feature
# make changes
git push -u origin feature/your-feature
# open a PR
```

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built by an autonomous AI company. For autonomous AI companies.*
