<p align="center">
  <img src="projects/landing/public/logo-ac.png" alt="auto-co" width="80" />
</p>

<h1 align="center">auto-co</h1>
<p align="center"><strong>Run an autonomous AI company from your terminal.</strong></p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/create-auto-co"><img src="https://img.shields.io/npm/v/create-auto-co" alt="npm" /></a>
  <a href="https://github.com/NikitaDmitrieff/auto-co-meta/stargazers"><img src="https://img.shields.io/github/stars/NikitaDmitrieff/auto-co-meta?style=social" alt="Stars" /></a>
</p>

<p align="center">
  <a href="https://runautoco.com/demo"><strong>Live Demo</strong></a> · <a href="https://runautoco.com"><strong>Website</strong></a> · <a href="https://youtu.be/1zJca_zFzys"><strong>Watch Video</strong></a>
</p>

---

## What is auto-co?

A bash loop that calls Claude Code every 2 minutes. 14 AI agents (CEO, CTO, Engineer, Designer, QA, Marketing...) debate, decide, build, and deploy software — 24/7, without you.

It's not a chatbot. It's not a framework. It's **~50 lines of bash** that turn Claude Code into a self-running company.

```
read consensus → pick agents → execute → update consensus → sleep → repeat
```

State lives in markdown files. Everything survives restarts. The only dependency is Claude Code.

---

## Quick Start

**Prerequisites:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and working.

```bash
npx create-auto-co my-company
cd my-company
make start
```

Watch it work: `make monitor`

That's it. First cycle starts in ~30 seconds. Cost: ~$1.80/cycle.

### From a template

```bash
npx create-auto-co my-saas --template saas
```

Templates preconfigure your company's mission and tech-stack direction (your agents build toward it from cycle 1): `saas` (Next.js + Supabase + Stripe), `docs-site` (MDX + Vercel), `api-backend` (Express + Railway).

### Clone directly

```bash
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
cp .env.example .env   # optionally configure
make start
```

---

## What to Expect

| Cycles | What happens |
|--------|-------------|
| 1-3 | CEO assembles team, evaluates product ideas, picks a direction |
| 4-8 | Architecture decisions, first code, initial deploy |
| 9-20 | Iterating: features, fixes, landing page, pricing |
| 20+ | Distribution, user acquisition, self-improvement |

Human input needed: ~once every 20-30 cycles (for credentials, spending decisions, or legal questions). Escalation requests come via Telegram if you set it up.

---

## The Agents

14 agents, each modeled on a real-world expert. Each cycle picks 3-5 relevant ones.

| Layer | Agent | Modeled after | Role |
|-------|-------|---------------|------|
| Strategy | CEO | Jeff Bezos | Priorities and direction |
| | CTO | Werner Vogels | Architecture and tech choices |
| | Critic | Charlie Munger | Veto bad ideas |
| Product | Product | Don Norman | UX and features |
| | Design | Matias Duarte | Visual design |
| | Interaction | Alan Cooper | User flows |
| Engineering | Fullstack | DHH | Write and ship code |
| | QA | James Bach | Test strategy |
| | DevOps | Kelsey Hightower | Deploy and infra |
| Business | Marketing | Seth Godin | Positioning and distribution |
| | Operations | Paul Graham | User acquisition |
| | Sales | Aaron Ross | Pricing and conversion |
| | CFO | Patrick Campbell | Financial model |
| Intelligence | Research | Ben Thompson | Market research |

Agent definitions live in `.claude/agents/`. Edit them to change behavior.

---

## Configuration

Copy `.env.example` to `.env`. The only required setting:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...   # if not using Claude Code's built-in auth
MODEL=opus                      # or sonnet for cheaper cycles (~$0.50)
```

Everything else has sensible defaults. See `.env.example` for advanced options (loop interval, idle detection, Telegram notifications, webhooks).

---

## How It Works

```
auto-loop.sh
├── reads memories/consensus.md        ← shared state ("relay baton")
├── builds prompt with PROMPT.md       ← instructions for Claude
├── calls `claude -p` with prompt      ← Claude Code does the work
├── agents update consensus.md         ← next action for next cycle
├── appends to state/*.jsonl           ← structured logs (decisions, tasks, artifacts)
└── sleeps → repeats
```

**Key files:**
- `auto-loop.sh` — the entire loop (~3000 lines with monitoring, error handling, adaptive frequency)
- `PROMPT.md` — system prompt sent to Claude each cycle
- `memories/consensus.md` — the "relay baton" that carries state between cycles
- `.claude/agents/*.md` — agent persona definitions
- `Makefile` — all commands (`make start`, `make monitor`, `make status`, etc.)

**No database.** No server. No framework. Just files, git, and a bash loop.

---

## Built With auto-co

These products were built entirely by auto-co instances, from idea to deployment:

| Product | What it does | Live at |
|---------|-------------|---------|
| **FormReply** | AI auto-replies to form submissions. Full SaaS with OAuth and Stripe. | [formreply.app](https://formreply.app) |
| **Changelog.dev** | Beautiful changelogs for dev tools. GitHub integration + payments. | [changelogdev.com](https://www.changelogdev.com) |
| **auto-co** | This repo. The framework improving itself. | [runautoco.com](https://runautoco.com) |

---

## Monitoring

```bash
make monitor     # live cycle output
make status      # current state summary
make health      # check loop health
make history     # cycle history with costs
make export      # export all data as JSON
```

Dashboard: [app.runautoco.com](https://app.runautoco.com) (or run your own from `projects/dashboard/`).

---

## Safety

Hard limits that can never be overridden:
- No repo/project/service deletion
- No database resets or force push to main
- No credential leaks to public repos
- No spending without human approval

Everything else — creating repos, deploying services, writing code — is fair game.

---

## vs. Other Tools

| | auto-co | Agent frameworks (LangGraph, CrewAI) | Paperclip |
|--|---------|--------------------------------------|-----------|
| Core | Bash loop + Claude Code | Python SDK with abstractions | TypeScript + Postgres orchestrator |
| Setup | `npx create-auto-co` | Install SDK, define graphs | `npx paperclipai onboard` |
| State | Git + markdown files | In-memory or custom stores | PostgreSQL |
| Dependencies | Claude Code only | Framework + LLM provider | Node.js + PostgreSQL |
| Output | Deployed products | Task completions | Managed agent sessions |
| Complexity | ~50 lines of core logic | Medium-high | Medium |

The insight: Claude Code already handles tool use, code generation, and multi-step reasoning. You don't need a framework on top of an AI that can already code. You just need a loop and a shared notepad.

---

## Project Structure

```
auto-co-meta/
├── auto-loop.sh           # The loop
├── PROMPT.md              # System prompt for each cycle
├── Makefile               # All commands
├── .env.example           # Configuration
├── memories/
│   └── consensus.md       # Shared state between cycles
├── .claude/
│   ├── agents/            # 14 agent persona files
│   └── skills/            # Agent capabilities
├── templates/             # Starter templates (saas, docs-site, api-backend)
├── projects/              # Output: products built by auto-co
├── state/                 # Structured logs (JSONL)
└── logs/                  # Cycle logs
```

---

## Cost

- **Per cycle:** ~$1.80 (Opus) or ~$0.50 (Sonnet)
- **Infrastructure:** ~$5-7/mo on Railway (optional)
- **Typical project:** 50-100 cycles to reach a deployed MVP = $90-180

---

## License

MIT — see [LICENSE](./LICENSE)

---

<p align="center"><em>Built by an autonomous AI company. For autonomous AI companies.</em></p>
