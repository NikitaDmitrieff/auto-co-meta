# Auto-Co Operational Runbook

*Maintained by: devops-hightower*
*Last updated: 2026-03-06*

---

## Overview

Auto-co runs as a 24/7 autonomous loop. Each cycle invokes Claude Code headlessly with a consolidated prompt, the Claude instance drives the AI team, produces artifacts, and writes the relay baton (`memories/consensus.md`) before exiting. The loop then sleeps and starts the next cycle.

```
auto-loop.sh
  └─ Cycle N
       ├─ Build FULL_PROMPT (PROMPT.md + current consensus)
       ├─ claude -p "$FULL_PROMPT" --output-format stream-json
       ├─ Extract CYCLE_COST, CYCLE_SUBTYPE from output
       ├─ Validate consensus.md was updated
       └─ Sleep LOOP_INTERVAL seconds → Cycle N+1
```

---

## Starting the Loop

### Foreground (development)
```bash
make start
# or directly:
./auto-loop.sh
```

### Foreground + prevent macOS sleep
```bash
make start-awake
```

### As a launchd daemon (production on macOS)
```bash
make install       # registers com.auto-co.loop with launchd
make status        # confirm it's running
```

---

## Stopping the Loop

### Graceful stop
```bash
make stop
# or:
./stop-loop.sh
```
This creates `.auto-loop-stop`, which the loop detects at the next cycle boundary and shuts down cleanly.

### Force stop
```bash
kill $(cat .auto-loop.pid)
```

### Pause daemon (no auto-restart)
```bash
make pause
make resume        # to resume
```

---

## Monitoring

### Quick status
```bash
make status
# Shows: loop PID, current cycle, total cost, last run time, consensus excerpt
```

### Live log tail
```bash
make monitor
# Equivalent to: ./monitor.sh
```

### Last cycle output
```bash
make last
# Full stream-json output from the most recent cycle
```

### Cycle history
```bash
make cycles
# Summary table: cycle#, timestamp, status (OK/FAIL), cost
```

### Log files
| File | Contents |
|------|----------|
| `logs/auto-loop.log` | Main loop events (start, stop, cycle status) |
| `logs/cycle-NNNN-YYYYMMDD-HHMMSS.log` | Full stream-json output per cycle |
| `logs/cycle-live.jsonl` | Live output of current in-progress cycle |
| `.auto-loop-state` | Persisted state: loop count, total cost, status |

---

## Configuration

All settings are environment variables. Set in `.env` or export before running.

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL` | `sonnet` | Claude model identifier |
| `LOOP_INTERVAL` | `120` | Seconds to sleep between cycles |
| `CYCLE_TIMEOUT_SECONDS` | `1800` | Max seconds per cycle before force-kill |
| `MAX_CONSECUTIVE_ERRORS` | `3` | Circuit breaker threshold |
| `COOLDOWN_SECONDS` | `300` | Cooldown after circuit break trips |
| `LIMIT_WAIT_SECONDS` | `3600` | Wait time when API usage limit is hit |
| `MAX_LOGS` | `200` | Max cycle logs to retain |

Example `.env`:
```bash
MODEL=sonnet
LOOP_INTERVAL=180
CYCLE_TIMEOUT_SECONDS=2400
```

---

## Debugging a Failed Cycle

### 1. Check status and recent errors
```bash
make status
make cycles        # look for FAIL entries
```

### 2. Read the failing cycle log
```bash
make last
# or open the specific log:
ls -lt logs/cycle-*.log | head -5
cat logs/cycle-0042-20260305-143000.log | jq -r 'select(.type=="result") | .result'
```

### 3. Check consensus integrity
```bash
cat memories/consensus.md
# Must contain: "# Auto Company Consensus", "## Next Action", "## Company State"
```
If consensus is corrupt or missing:
```bash
cat memories/consensus.md.bak    # last known good backup
cp memories/consensus.md.bak memories/consensus.md
```

### 4. Check for stale locks
```bash
ls -la .auto-loop.pid .auto-loop-stop .auto-loop-paused
# If stale (process not running):
rm -f .auto-loop.pid
```

### 5. Validate Claude CLI
```bash
claude --version
claude -p "Say hello" --output-format json
```

---

## Circuit Breaker

When `MAX_CONSECUTIVE_ERRORS` cycles fail in a row, the loop:
1. Logs `BREAKER` event
2. Sleeps `COOLDOWN_SECONDS`
3. Resets error count and resumes

During a circuit-break pause, the state file shows `STATUS=circuit_break`.

To manually reset without waiting:
```bash
make stop && make start
```

---

## API Usage Limit Handling

When Claude returns a usage-limit or rate-limit error, the loop:
1. Logs `LIMIT` event
2. Sleeps `LIMIT_WAIT_SECONDS` (default: 1 hour)
3. Resumes automatically

State file shows `STATUS=waiting_limit` during the wait.

---

## Cost Tracking

Total cost accumulates across restarts via `.auto-loop-state`:
```
TOTAL_COST=1.2345
```
Per-cycle cost is extracted from the stream-json `result` event's `total_cost_usd` field. If that's empty, the loop falls back to scanning all output lines for `total_cost_usd`.

View running total:
```bash
make status        # shows TOTAL_COST
grep TOTAL_COST .auto-loop-state
```

---

## Telegram Watcher

The `watcher.js` process monitors `memories/human-request.md` and bridges escalation requests to Telegram.

### Start watcher
```bash
make watcher
```

### Required env vars
```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```
Without these, watcher runs in degraded mode (logs requests locally, no Telegram delivery).

### How escalation works
1. CEO writes to `memories/human-request.md`
2. Watcher detects the file change and sends Telegram message
3. Human replies via Telegram bot
4. Watcher writes reply to `memories/human-response.md`
5. Next cycle reads and clears the response

---

## Dashboard

The Next.js dashboard shows live loop status, cycle history, and consensus.

```bash
make dashboard          # install deps + run dev server (port 3000)
make dashboard-build    # production build
```

---

## Atomic Consensus Write

Cycles write consensus atomically to prevent corruption on crash:
1. Write to `memories/.consensus.tmp`
2. `mv memories/.consensus.tmp memories/consensus.md`

On startup, `auto-loop.sh` cleans any stale `.consensus.tmp` from a previous crash. The backup (`memories/consensus.md.bak`) is restored automatically on cycle failure.

---

## Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Loop won't start: "already running" | Stale PID file | `rm .auto-loop.pid` if process is dead |
| Every cycle is FAIL with exit 124 | Cycle timeout | Increase `CYCLE_TIMEOUT_SECONDS` |
| CYCLE_COST always empty | Old Claude CLI version or stream format change | Update Claude CLI |
| Consensus validation fails | Claude didn't update consensus.md | Check last cycle log for Claude output |
| `claude: command not found` | Claude CLI not in PATH | Reinstall or fix PATH |
| Dashboard build fails | Stale deps or next.config.mjs issues | `cd dashboard && rm -rf .next node_modules && npm install` |
