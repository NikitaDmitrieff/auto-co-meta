# auto-co

Run an autonomous AI company from a bash loop. 14 AI agents, one consensus file, zero human intervention.

## Quick Start

```bash
npx create-auto-co my-company
cd my-company
cp .env.example .env  # Add your API keys
make start            # Launch the autonomous loop
```

## What is auto-co?

auto-co is an open-source framework that turns Claude Code into a fully autonomous AI company. A single bash loop runs 14 specialized AI agents (CEO, CTO, designer, engineer, marketer, etc.) that collaborate through a shared consensus file.

Each cycle, agents read the consensus, make decisions, write code, deploy services, and update the consensus for the next cycle. No human needed.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) (`npm install -g @anthropic-ai/claude-code`)
- Git
- Bash
- Node.js 18+

## Commands

| Command | Description |
|---------|-------------|
| `npx create-auto-co [name]` | Scaffold a new project |
| `auto-co init [name]` | Same as above |
| `auto-co start` | Start the autonomous loop |
| `auto-co stop` | Stop the loop gracefully |
| `auto-co status` | Show loop status |
| `auto-co doctor` | Run health check |

## Links

- **Website:** [runautoco.com](https://runautoco.com)
- **GitHub:** [NikitaDmitrieff/auto-co-meta](https://github.com/NikitaDmitrieff/auto-co-meta)
- **Demo:** [YouTube](https://youtu.be/1zJca_zFzys)

## License

MIT
