#!/bin/bash
# ============================================================
# Auto-Co -- 24/7 Autonomous Loop
# ============================================================
# Keeps Claude Code running continuously to drive the AI team.
# Uses fresh sessions with consensus.md as the relay baton.
#
# Usage:
#   ./auto-loop.sh              # Run in foreground
#   ./auto-loop.sh --daemon     # Run via launchd (no tty)
#
# Stop:
#   ./stop-loop.sh              # Graceful stop
#   kill $(cat .auto-loop.pid)  # Force stop
#
# Config (env vars):
#   MODEL=sonnet                # Claude model (default: sonnet)
#   LOOP_INTERVAL=120           # Seconds between cycles (default: 120)
#   CYCLE_TIMEOUT_SECONDS=1800  # Max seconds per cycle before force-kill
#   MAX_CONSECUTIVE_ERRORS=3    # Circuit breaker threshold
#   COOLDOWN_SECONDS=300        # Cooldown after circuit break
#   LIMIT_WAIT_SECONDS=3600     # Wait on usage limit
#   MAX_LOGS=200                # Max cycle logs to keep
# ============================================================

set -euo pipefail

# === Resolve project root (always relative to this script) ===
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# === Load .env if present ===
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

LOG_DIR="$PROJECT_DIR/logs"
CONSENSUS_FILE="$PROJECT_DIR/memories/consensus.md"
PROMPT_FILE="$PROJECT_DIR/PROMPT.md"
PID_FILE="$PROJECT_DIR/.auto-loop.pid"
STATE_FILE="$PROJECT_DIR/.auto-loop-state"

# Loop settings (all overridable via env vars)
MODEL="${MODEL:-sonnet}"
LOOP_INTERVAL="${LOOP_INTERVAL:-120}"
CYCLE_TIMEOUT_SECONDS="${CYCLE_TIMEOUT_SECONDS:-1800}"
MAX_CONSECUTIVE_ERRORS="${MAX_CONSECUTIVE_ERRORS:-3}"
COOLDOWN_SECONDS="${COOLDOWN_SECONDS:-300}"
LIMIT_WAIT_SECONDS="${LIMIT_WAIT_SECONDS:-3600}"
MAX_LOGS="${MAX_LOGS:-200}"

# Ensure Agent Teams is available
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# === Functions ===

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local msg="[$timestamp] $1"
    echo "$msg" >> "$LOG_DIR/auto-loop.log"
    if [ -t 1 ]; then
        echo "$msg"
    fi
}

log_cycle() {
    local cycle_num=$1
    local status=$2
    local msg=$3
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] Cycle #$cycle_num [$status] $msg" >> "$LOG_DIR/auto-loop.log"
    if [ -t 1 ]; then
        echo "[$timestamp] Cycle #$cycle_num [$status] $msg"
    fi
}

check_usage_limit() {
    local output="$1"
    if echo "$output" | grep -qi "usage limit\|rate limit\|too many requests\|resource_exhausted\|overloaded"; then
        return 0
    fi
    return 1
}

check_stop_requested() {
    if [ -f "$PROJECT_DIR/.auto-loop-stop" ]; then
        rm -f "$PROJECT_DIR/.auto-loop-stop"
        return 0
    fi
    return 1
}

save_state() {
    cat > "$STATE_FILE" << EOF
LOOP_COUNT=$loop_count
ERROR_COUNT=$error_count
LAST_RUN=$(date '+%Y-%m-%d %H:%M:%S')
STATUS=$1
MODEL=$MODEL
TOTAL_COST=$total_cost
EOF
}

cleanup() {
    log "=== Auto Loop Shutting Down (PID $$) ==="
    rm -f "$PID_FILE"
    save_state "stopped"
    exit 0
}

rotate_logs() {
    # Keep only the latest N cycle logs
    local count
    count=$(find "$LOG_DIR" -name "cycle-*.log" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt "$MAX_LOGS" ]; then
        local to_delete=$((count - MAX_LOGS))
        find "$LOG_DIR" -name "cycle-*.log" -type f | sort | head -n "$to_delete" | xargs rm -f 2>/dev/null || true
        log "Log rotation: removed $to_delete old cycle logs"
    fi

    # Rotate main log if over 10MB
    local log_size
    log_size=$(stat -f%z "$LOG_DIR/auto-loop.log" 2>/dev/null || echo 0)
    if [ "$log_size" -gt 10485760 ]; then
        mv "$LOG_DIR/auto-loop.log" "$LOG_DIR/auto-loop.log.old"
        log "Main log rotated (was ${log_size} bytes)"
    fi
}

backup_consensus() {
    if [ -f "$CONSENSUS_FILE" ]; then
        cp "$CONSENSUS_FILE" "$CONSENSUS_FILE.bak"
    fi
}

restore_consensus() {
    if [ -f "$CONSENSUS_FILE.bak" ]; then
        cp "$CONSENSUS_FILE.bak" "$CONSENSUS_FILE"
        log "Consensus restored from backup after failed cycle"
    fi
}

validate_consensus() {
    if [ ! -s "$CONSENSUS_FILE" ]; then
        return 1
    fi
    if ! grep -q "^# Auto Company Consensus" "$CONSENSUS_FILE"; then
        return 1
    fi
    if ! grep -q "^## Next Action" "$CONSENSUS_FILE"; then
        return 1
    fi
    if ! grep -q "^## Company State" "$CONSENSUS_FILE"; then
        return 1
    fi
    return 0
}

kill_process_tree() {
    local pid=$1
    local sig=${2:-TERM}
    # Kill all children first, then the parent
    local children
    children=$(pgrep -P "$pid" 2>/dev/null || true)
    for child in $children; do
        kill_process_tree "$child" "$sig"
    done
    kill -"$sig" "$pid" 2>/dev/null || true
}

run_claude_cycle() {
    local prompt="$1"
    local output_file timeout_flag

    output_file=$(mktemp)
    timeout_flag=$(mktemp)
    LIVE_LOG="$LOG_DIR/cycle-live.jsonl"
    : > "$LIVE_LOG"

    set +e
    (
        cd "$PROJECT_DIR" && claude -p "$prompt" \
            --model "$MODEL" \
            --dangerously-skip-permissions \
            --verbose \
            --output-format stream-json \
            > "$output_file" 2>&1
    ) &
    local claude_pid=$!

    # Live log mirror: tail the output file as it's written
    tail -f "$output_file" >> "$LIVE_LOG" 2>/dev/null &
    local tail_pid=$!

    (
        sleep "$CYCLE_TIMEOUT_SECONDS"
        if kill -0 "$claude_pid" 2>/dev/null; then
            echo "1" > "$timeout_flag"
            # Kill entire process tree (claude + MCP servers + sub-agents)
            kill_process_tree "$claude_pid" TERM
            sleep 5
            kill_process_tree "$claude_pid" KILL
        fi
    ) &
    local watchdog_pid=$!

    wait "$claude_pid"
    EXIT_CODE=$?

    kill "$tail_pid" 2>/dev/null || true
    kill "$watchdog_pid" 2>/dev/null || true
    wait "$tail_pid" 2>/dev/null || true
    wait "$watchdog_pid" 2>/dev/null || true
    set -e

    OUTPUT=$(cat "$output_file")
    rm -f "$output_file"

    if [ -s "$timeout_flag" ]; then
        CYCLE_TIMED_OUT=1
        EXIT_CODE=124
    else
        CYCLE_TIMED_OUT=0
    fi
    rm -f "$timeout_flag"
}

extract_cycle_metadata() {
    RESULT_TEXT=""
    CYCLE_COST=""
    CYCLE_SUBTYPE=""
    CYCLE_TYPE=""

    # stream-json: each line is a JSON event; the final "result" event has the summary
    if command -v jq &>/dev/null; then
        # Extract from the last line with type=result
        local result_line
        result_line=$(grep '"type":"result"' <<< "$OUTPUT" | tail -1 || true)
        if [ -n "$result_line" ]; then
            RESULT_TEXT=$(echo "$result_line" | jq -r '.result // empty' 2>/dev/null | head -c 2000 || true)
            CYCLE_COST=$(echo "$result_line" | jq -r '.total_cost_usd // empty' 2>/dev/null || true)
            CYCLE_SUBTYPE=$(echo "$result_line" | jq -r '.subtype // empty' 2>/dev/null || true)
            CYCLE_TYPE=$(echo "$result_line" | jq -r '.type // empty' 2>/dev/null || true)
        else
            # Fallback: try parsing as single JSON (non-stream format)
            RESULT_TEXT=$(echo "$OUTPUT" | jq -r '.result // empty' 2>/dev/null | head -c 2000 || true)
            CYCLE_COST=$(echo "$OUTPUT" | jq -r '.total_cost_usd // empty' 2>/dev/null || true)
            CYCLE_SUBTYPE=$(echo "$OUTPUT" | jq -r '.subtype // empty' 2>/dev/null || true)
            CYCLE_TYPE=$(echo "$OUTPUT" | jq -r '.type // empty' 2>/dev/null || true)
        fi
    else
        RESULT_TEXT=$(echo "$OUTPUT" | head -c 2000 || true)
        CYCLE_COST=$(echo "$OUTPUT" | sed -n 's/.*"total_cost_usd":\([0-9.]*\).*/\1/p' | tail -1 || true)
        CYCLE_SUBTYPE=$(echo "$OUTPUT" | sed -n 's/.*"subtype":"\([^"]*\)".*/\1/p' | tail -1 || true)
        CYCLE_TYPE=$(echo "$OUTPUT" | sed -n 's/.*"type":"\([^"]*\)".*/\1/p' | tail -1 || true)
    fi
}

# === Setup ===

mkdir -p "$LOG_DIR" "$PROJECT_DIR/memories"

# Clean up stale stop file from previous run
rm -f "$PROJECT_DIR/.auto-loop-stop"

# Clean up any incomplete atomic consensus write from a crashed cycle
if [ -f "$PROJECT_DIR/memories/.consensus.tmp" ]; then
    log "Found stale .consensus.tmp — removing (previous cycle may have crashed mid-write)"
    rm -f "$PROJECT_DIR/memories/.consensus.tmp"
fi

# Check for existing instance
if [ -f "$PID_FILE" ]; then
    existing_pid=$(cat "$PID_FILE")
    if kill -0 "$existing_pid" 2>/dev/null; then
        echo "Auto loop already running (PID $existing_pid). Stop it first with ./stop-loop.sh"
        exit 1
    fi
fi

# Check dependencies
if ! command -v claude &>/dev/null; then
    echo "Error: 'claude' CLI not found in PATH. Install Claude Code first."
    exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: PROMPT.md not found at $PROMPT_FILE"
    exit 1
fi

# Write PID file
echo $$ > "$PID_FILE"

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT SIGHUP

# Initialize counters
loop_count=0
error_count=0
total_cost=0

# Restore counters from previous run if state file exists
if [ -f "$STATE_FILE" ]; then
    saved_total=$(grep '^TOTAL_COST=' "$STATE_FILE" | cut -d= -f2 || echo 0)
    total_cost="${saved_total:-0}"
fi

log "=== Auto-Co Loop Started (PID $$) ==="
log "Project: $PROJECT_DIR"
log "Model: $MODEL | Interval: ${LOOP_INTERVAL}s | Timeout: ${CYCLE_TIMEOUT_SECONDS}s | Breaker: ${MAX_CONSECUTIVE_ERRORS} errors"

# === Main Loop ===

while true; do
    # Check for stop request
    if check_stop_requested; then
        log "Stop requested. Shutting down gracefully."
        cleanup
    fi

    loop_count=$((loop_count + 1))
    cycle_log="$LOG_DIR/cycle-$(printf '%04d' $loop_count)-$(date '+%Y%m%d-%H%M%S').log"

    log_cycle $loop_count "START" "Beginning work cycle"
    save_state "running"

    # Log rotation
    rotate_logs

    # Backup consensus before cycle
    backup_consensus

    # Build prompt with consensus pre-injected
    PROMPT=$(cat "$PROMPT_FILE")
    CONSENSUS=$(cat "$CONSENSUS_FILE" 2>/dev/null || echo "No consensus file found. This is the very first cycle.")
    FULL_PROMPT="$PROMPT

---

## Current Consensus (pre-loaded, do NOT re-read this file)

$CONSENSUS

---

This is Cycle #$loop_count. Act decisively."

    # Run Claude Code in headless mode with per-cycle timeout
    run_claude_cycle "$FULL_PROMPT"

    # Save full output to cycle log
    echo "$OUTPUT" > "$cycle_log"

    # Extract result fields for status classification
    extract_cycle_metadata

    # Accumulate cost
    if [ -n "$CYCLE_COST" ] && echo "$CYCLE_COST" | grep -qE '^[0-9]+\.?[0-9]*$'; then
        total_cost=$(awk "BEGIN {printf \"%.4f\", $total_cost + $CYCLE_COST}")
    fi

    cycle_failed_reason=""
    if [ "$CYCLE_TIMED_OUT" -eq 1 ]; then
        cycle_failed_reason="Timed out after ${CYCLE_TIMEOUT_SECONDS}s"
    elif [ $EXIT_CODE -ne 0 ]; then
        cycle_failed_reason="Exit code $EXIT_CODE"
    elif [ "$CYCLE_SUBTYPE" != "success" ]; then
        cycle_failed_reason="Non-success subtype '${CYCLE_SUBTYPE:-unknown}'"
    elif ! validate_consensus; then
        cycle_failed_reason="consensus.md validation failed after cycle"
    fi

    if [ -z "$cycle_failed_reason" ]; then
        log_cycle $loop_count "OK" "Completed (cost: \$${CYCLE_COST:-unknown}, subtype: ${CYCLE_SUBTYPE:-unknown})"
        if [ -n "$RESULT_TEXT" ]; then
            log_cycle $loop_count "SUMMARY" "$(echo "$RESULT_TEXT" | head -c 300)"
        fi
        error_count=0
    else
        error_count=$((error_count + 1))
        log_cycle $loop_count "FAIL" "$cycle_failed_reason (cost: \$${CYCLE_COST:-unknown}, subtype: ${CYCLE_SUBTYPE:-unknown}, errors: $error_count/$MAX_CONSECUTIVE_ERRORS)"

        # Restore consensus on failure
        restore_consensus
        # Discard any partial atomic write
        rm -f "$PROJECT_DIR/memories/.consensus.tmp"

        # Check for usage limit
        if check_usage_limit "$OUTPUT"; then
            log_cycle $loop_count "LIMIT" "API usage limit detected. Waiting ${LIMIT_WAIT_SECONDS}s..."
            save_state "waiting_limit"
            sleep $LIMIT_WAIT_SECONDS
            error_count=0
            continue
        fi

        # Circuit breaker
        if [ $error_count -ge $MAX_CONSECUTIVE_ERRORS ]; then
            log_cycle $loop_count "BREAKER" "Circuit breaker tripped! Cooling down ${COOLDOWN_SECONDS}s..."
            save_state "circuit_break"
            sleep $COOLDOWN_SECONDS
            error_count=0
            log "Circuit breaker reset. Resuming..."
        fi
    fi

    save_state "idle"
    log_cycle $loop_count "WAIT" "Sleeping ${LOOP_INTERVAL}s before next cycle..."
    sleep $LOOP_INTERVAL
done
