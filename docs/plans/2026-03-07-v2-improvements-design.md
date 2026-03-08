# Auto-Co v2 Improvements Design

## Date
2026-03-07

## Summary
Five improvements to auto-co's core loop, memory, and observability. Ordered by dependency: config → state → summaries → QMD → adaptive frequency.

## 1. Config Consolidation (.env)

Expand `.env.example` with all configurable options including new vars from other improvements. No new parser — `auto-loop.sh` already sources `.env`. CLI flags continue to override `.env` values.

New vars added:
- `IDLE_INTERVAL=600` — sleep interval when nothing changed (10 min)
- `QMD_ENABLED=true` — enable QMD indexing
- `STATE_DIR=state` — directory for structured state files
- `SUMMARY_ENABLED=true` — enable cycle log summaries

## 2. State Directory + JSONL Files

New `state/` directory with four append-only JSONL files:

- `state/decisions.jsonl` — `{timestamp, cycle, agent, decision, rationale, confidence, outcome}`
- `state/tasks.jsonl` — `{id, cycle_created, description, owner, status, priority, cycle_completed}`
- `state/metrics.jsonl` — `{date, cycle, revenue, users, signups, github_stars, page_views, cost_cycle, cost_total}`
- `state/artifacts.jsonl` — `{id, cycle, type, ref, path, created_by, url}`

Written by agents via PROMPT.md instructions at end of each cycle. Consensus.md remains the relay baton — these are additional structured backing.

## 3. Cycle Log Summaries

Built-in post-cycle function in `auto-loop.sh` writes `logs/summaries/cycle-NNNN.md` with: cycle number, date, duration, cost, status, result summary. Uses already-parsed `RESULT_TEXT` and `CYCLE_COST` from `extract_cycle_metadata`.

## 4. QMD Integration

Required install, optional at runtime (gracefully skipped if not found). Four collections: `auto-co-docs` (docs/), `auto-co-memories` (memories/), `auto-co-summaries` (logs/summaries/), `auto-co-state` (state/). MCP server in `.claude/settings.json`. Post-cycle `qmd update` in background. PROMPT.md step 2b for memory search.

## 5. Adaptive Cycle Frequency

After successful cycle, if consensus.md hash unchanged and no artifacts produced → sleep `IDLE_INTERVAL` (600s default) instead of `LOOP_INTERVAL` (120s). During idle sleep, check every 30s for activity (human response, external consensus change). Snap back to normal interval on activity.

## Implementation Order
1. Config consolidation
2. State directory + JSONL files
3. Cycle log summaries
4. QMD integration
5. Adaptive frequency

## Decisions Made
- QMD is a required install, but runtime is gracefully optional (skipped if not on PATH)
- Config stays in .env (no TOML/JSON)
- All 14 agents kept, teams always formed
- No model routing for now
- No Agent SDK migration for now
