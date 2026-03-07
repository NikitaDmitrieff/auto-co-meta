<p align="center">
  <img src="projects/landing/public/logo-ac.png" alt="auto-co" width="80" />
</p>

<h1 align="center">auto-co</h1>
<p align="center"><strong>Autonomous AI Company OS</strong></p>
<p align="center">Give it a mission. It builds, ships, and runs an entire company — without you.</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" /></a>
  <a href="https://github.com/NikitaDmitrieff/auto-co-meta"><img src="https://img.shields.io/badge/open--source-yes-brightgreen.svg" alt="Open Source" /></a>
  <a href="https://github.com/NikitaDmitrieff/auto-co-meta/stargazers"><img src="https://img.shields.io/github/stars/NikitaDmitrieff/auto-co-meta?style=social" alt="Stars" /></a>
</p>

[![Watch the demo](https://img.youtube.com/vi/1zJca_zFzys/maxresdefault.jpg)](https://youtu.be/1zJca_zFzys)

> **[Watch the demo](https://youtu.be/1zJca_zFzys)** — 4 fully AI-driven companies running simultaneously, each with its own product, agents, and deployment pipeline.

---

## What is this?

You give auto-co a one-line mission. It assembles a team of 14 AI agents — CEO, CTO, Designer, Engineer, QA, Marketing, CFO — and they debate, decide, build, and deploy in a continuous loop. 24/7. No human in the loop.

It's not a chatbot. It's not a copilot. It's **a company that runs itself.**

> **[Live demo](https://runautoco.com/demo)** · **[Website](https://runautoco.com)**

---

## Built by auto-co, running right now

4 auto-co instances running in parallel. Each one picked its own product, built it from scratch, deployed it, and is now doing user acquisition — all autonomously. $0 human code.

| Product | What it does | Cycles | Live at |
|---------|-------------|--------|---------|
| **FormReply** | AI auto-replies to contact form submissions (Google Forms, Typeform, Jotform, Tally). Full SaaS with OAuth, Stripe billing, email notifications. | 112 | [formreply.app](https://formreply.app) |
| **Changelog.dev** | Beautiful changelogs for developer tools. GitHub integration, embeddable widget, email notifications, Stripe payments. | 68 | [changelogdev.com](https://www.changelogdev.com) |
| **auto-co** | This repo. The framework building and improving itself. Landing page, demo dashboard, blog, pricing, CLI tools. | 89+ | [runautoco.com](https://runautoco.com) |

Average cost per cycle: ~$1.80. Total infrastructure: ~$5/mo on Railway.

---

## Get started in 2 minutes

**All you need is a [Claude Code](https://claude.ai/code) subscription.** No separate API key required — auto-co works with the same Claude Code CLI you already have.

```bash
git clone https://github.com/NikitaDmitrieff/auto-co-meta
cd auto-co-meta
make start
```

That's it. In another terminal: `make monitor` to watch it work.

Want to start from a template?

```bash
./auto-loop.sh --template saas ~/Projects/my-startup
```

Templates: `saas` (Next.js + Supabase + Stripe), `docs-site` (MDX + Vercel), `api-backend` (Express + Railway).

---

## The 14 agents

| | Agent | Modeled after | What they do |
|--|-------|-------------|-------------|
| Strategy | CEO | Jeff Bezos | Priorities, decisions, direction |
| | CTO | Werner Vogels | Architecture, tech choices |
| | Critic | Charlie Munger | Veto bad ideas, pre-mortem |
| Product | Product | Don Norman | UX, features, usability |
| | Design | Matias Duarte | Visual design, design system |
| | Interaction | Alan Cooper | User flows, personas |
| Engineering | Fullstack | DHH | Write code, ship features |
| | QA | James Bach | Test strategy, quality gates |
| | DevOps | Kelsey Hightower | Deploy, CI/CD, infra |
| Business | Marketing | Seth Godin | Positioning, distribution |
| | Operations | Paul Graham | User acquisition, retention |
| | Sales | Aaron Ross | Pricing, conversion |
| | CFO | Patrick Campbell | Financial model, unit economics |
| Intelligence | Research | Ben Thompson | Market research, competitive analysis |

Each cycle picks 3-5 agents relevant to the task. They don't all run every time.

---

## How the loop works

```
read consensus → pick agents → execute → write next action → sleep → repeat
```

State lives in markdown files — `consensus.md` is the relay baton between cycles. Everything survives restarts. The loop runs with a single shell script (`auto-loop.sh`) calling Claude Code with a prompt.

When agents hit a real blocker (spending money, credentials, legal), they escalate to you via Telegram. You reply, next cycle picks it up. This happens maybe once every 20-30 cycles.

---

## Why not LangGraph / AutoGen / CrewAI?

| | auto-co | Agent frameworks |
|--|---------|-----------------|
| Setup | `git clone` → `make start` | Build your own workflows |
| Output | Real deployed products | Demos and prototypes |
| State | Git + markdown (survives anything) | Often in-memory |
| Scope | Runs a full company | Executes tasks |

**auto-co is not a library.** It's an opinionated system that ships real software to real users.

---

## Safety

Hard limits that can never be overridden:
- No repo/project deletion
- No database resets
- No force push to main
- No credential leaks
- No spending without human approval

Everything else — creating repos, deploying services, writing code, pushing branches — is fair game.

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built by an autonomous AI company. For autonomous AI companies.*
