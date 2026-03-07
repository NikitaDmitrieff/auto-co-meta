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
#   ./auto-loop.sh --selftest   # Validate environment without running
#   ./auto-loop.sh --dry-run    # Build prompt + show preview, don't run
#   ./auto-loop.sh --status     # Quick status from state file
#   ./auto-loop.sh --config     # Print all config values
#   ./auto-loop.sh --version    # Show version
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
#   RETRY_BASE_SECONDS=30       # Initial backoff on transient failure
#   RETRY_MAX_SECONDS=600       # Max backoff cap
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
MODEL="${MODEL:-opus}"
LOOP_INTERVAL="${LOOP_INTERVAL:-120}"
CYCLE_TIMEOUT_SECONDS="${CYCLE_TIMEOUT_SECONDS:-1800}"
CYCLE_HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
MAX_CONSECUTIVE_ERRORS="${MAX_CONSECUTIVE_ERRORS:-3}"
COOLDOWN_SECONDS="${COOLDOWN_SECONDS:-300}"
LIMIT_WAIT_SECONDS="${LIMIT_WAIT_SECONDS:-3600}"
MAX_LOGS="${MAX_LOGS:-200}"
RETRY_BASE_SECONDS="${RETRY_BASE_SECONDS:-30}"
RETRY_MAX_SECONDS="${RETRY_MAX_SECONDS:-600}"

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

append_cycle_history() {
    local cycle_num=$1
    local status=$2
    local cost=${3:-0}
    local duration=$4
    local exit_code=$5
    local timestamp
    timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    # Append structured JSONL record for analytics
    printf '{"cycle":%d,"timestamp":"%s","status":"%s","cost":%s,"duration_s":%d,"exit_code":%d,"model":"%s","total_cost":%s}\n' \
        "$cycle_num" "$timestamp" "$status" "${cost:-0}" "${duration:-0}" "${exit_code:-0}" "$MODEL" "$total_cost" \
        >> "$CYCLE_HISTORY_FILE"
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
        # Extract from the last line with type=result (handles both compact and spaced JSON)
        local result_line
        result_line=$(grep -E '"type"\s*:\s*"result"' <<< "$OUTPUT" | tail -1 || true)
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

        # Second fallback: scan all events for total_cost_usd if still empty
        if [ -z "$CYCLE_COST" ]; then
            CYCLE_COST=$(grep -o '"total_cost_usd"[[:space:]]*:[[:space:]]*[0-9.]*' <<< "$OUTPUT" | tail -1 | grep -o '[0-9.]*$' || true)
        fi
    else
        RESULT_TEXT=$(echo "$OUTPUT" | head -c 2000 || true)
        CYCLE_COST=$(echo "$OUTPUT" | sed -n 's/.*"total_cost_usd":\([0-9.]*\).*/\1/p' | tail -1 || true)
        CYCLE_SUBTYPE=$(echo "$OUTPUT" | sed -n 's/.*"subtype":"\([^"]*\)".*/\1/p' | tail -1 || true)
        CYCLE_TYPE=$(echo "$OUTPUT" | sed -n 's/.*"type":"\([^"]*\)".*/\1/p' | tail -1 || true)
    fi
}

# === Version flag ===

if [ "${1:-}" = "--version" ] || [ "${1:-}" = "-V" ]; then
    version=$(cat "$PROJECT_DIR/VERSION" 2>/dev/null || echo "unknown")
    echo "auto-loop.sh v${version}"
    exit 0
fi

# === Config flag (print all config values) ===

if [ "${1:-}" = "--config" ]; then
    echo "=== Auto-Co Configuration ==="
    echo ""
    echo "Version:                $(cat "$PROJECT_DIR/VERSION" 2>/dev/null || echo 'unknown')"
    echo "Project dir:            $PROJECT_DIR"
    echo ""
    echo "--- Loop Settings ---"
    echo "MODEL:                  $MODEL"
    echo "LOOP_INTERVAL:          ${LOOP_INTERVAL}s"
    echo "CYCLE_TIMEOUT_SECONDS:  ${CYCLE_TIMEOUT_SECONDS}s"
    echo "MAX_CONSECUTIVE_ERRORS: $MAX_CONSECUTIVE_ERRORS"
    echo "COOLDOWN_SECONDS:       ${COOLDOWN_SECONDS}s"
    echo "LIMIT_WAIT_SECONDS:     ${LIMIT_WAIT_SECONDS}s"
    echo "MAX_LOGS:               $MAX_LOGS"
    echo "RETRY_BASE_SECONDS:     ${RETRY_BASE_SECONDS}s"
    echo "RETRY_MAX_SECONDS:      ${RETRY_MAX_SECONDS}s"
    echo ""
    echo "--- Paths ---"
    echo "PROMPT_FILE:            $PROMPT_FILE"
    echo "CONSENSUS_FILE:         $CONSENSUS_FILE"
    echo "LOG_DIR:                $LOG_DIR"
    echo "PID_FILE:               $PID_FILE"
    echo "STATE_FILE:             $STATE_FILE"
    echo "CYCLE_HISTORY_FILE:     $CYCLE_HISTORY_FILE"
    echo ""
    echo "--- Environment ---"
    echo ".env loaded:            $([ -f "$PROJECT_DIR/.env" ] && echo 'yes' || echo 'no')"
    echo "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: ${CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS:-unset}"
    exit 0
fi

# === Status flag (quick check without monitor.sh) ===

if [ "${1:-}" = "--status" ]; then
    if [ -f "$STATE_FILE" ]; then
        status=$(grep '^STATUS=' "$STATE_FILE" | cut -d= -f2)
        loop_ct=$(grep '^LOOP_COUNT=' "$STATE_FILE" | cut -d= -f2)
        last_run=$(grep '^LAST_RUN=' "$STATE_FILE" | cut -d= -f2-)
        model_st=$(grep '^MODEL=' "$STATE_FILE" | cut -d= -f2)
        total_ct=$(grep '^TOTAL_COST=' "$STATE_FILE" | cut -d= -f2)
    fi

    # Loop running?
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            printf "Loop: RUNNING (PID %s)  " "$pid"
        else
            printf "Loop: STOPPED (stale PID)  "
        fi
    else
        printf "Loop: NOT RUNNING  "
    fi

    printf "Status: %s  Model: %s  Cycles: %s  Cost: \$%s\n" \
        "${status:-unknown}" "${model_st:-unknown}" "${loop_ct:-0}" "${total_ct:-0}"

    if [ -n "${last_run:-}" ]; then
        echo "Last run: $last_run"
    fi

    # Show Next Action from consensus
    if [ -f "$CONSENSUS_FILE" ]; then
        next=$(sed -n '/^## Next Action/,/^##/{/^## Next Action/d;/^##/d;p;}' "$CONSENSUS_FILE" | head -3)
        if [ -n "$next" ]; then
            echo "Next: $(echo "$next" | head -1 | sed 's/^[[:space:]]*//')"
        fi
    fi
    exit 0
fi

# === Dry-run mode ===

if [ "${1:-}" = "--dry-run" ]; then
    echo "=== Auto-Co Dry Run ==="
    echo ""
    PROMPT=$(cat "$PROMPT_FILE")
    CONSENSUS=$(cat "$CONSENSUS_FILE" 2>/dev/null || echo "No consensus file found. This is the very first cycle.")
    FULL_PROMPT="$PROMPT

---

## Current Consensus (pre-loaded, do NOT re-read this file)

$CONSENSUS

---

This is Cycle #1. Act decisively."

    echo "Model: $MODEL"
    echo "Interval: ${LOOP_INTERVAL}s"
    echo "Timeout: ${CYCLE_TIMEOUT_SECONDS}s"
    echo "Prompt length: $(echo "$FULL_PROMPT" | wc -c | tr -d ' ') bytes"
    echo ""
    echo "--- Prompt Preview (first 80 lines) ---"
    echo "$FULL_PROMPT" | head -80
    echo ""
    echo "--- End Preview ---"
    echo ""
    echo "(dry run -- no Claude session started)"
    exit 0
fi

# === Self-test mode ===

if [ "${1:-}" = "--selftest" ]; then
    echo "=== Auto-Co Self-Test ==="
    pass=0
    fail=0

    check() {
        local label="$1" ok="$2" detail="${3:-}"
        if [ "$ok" -eq 1 ]; then
            printf "  [PASS] %s" "$label"
            [ -n "$detail" ] && printf " (%s)" "$detail"
            echo ""
            pass=$((pass + 1))
        else
            printf "  [FAIL] %s" "$label"
            [ -n "$detail" ] && printf " -- %s" "$detail"
            echo ""
            fail=$((fail + 1))
        fi
    }

    # 1. Claude CLI
    if command -v claude &>/dev/null; then
        ver=$(claude --version 2>/dev/null | head -1 || echo "unknown")
        check "Claude CLI installed" 1 "$ver"
    else
        check "Claude CLI installed" 0 "not found in PATH"
    fi

    # 2. PROMPT.md
    if [ -f "$PROMPT_FILE" ]; then
        lines=$(wc -l < "$PROMPT_FILE" | tr -d ' ')
        check "PROMPT.md exists" 1 "${lines} lines"
    else
        check "PROMPT.md exists" 0 "missing at $PROMPT_FILE"
    fi

    # 3. memories/ directory
    if [ -d "$PROJECT_DIR/memories" ]; then
        check "memories/ directory" 1
    else
        check "memories/ directory" 0 "missing"
    fi

    # 4. consensus.md validity
    if [ -f "$CONSENSUS_FILE" ]; then
        if validate_consensus; then
            check "consensus.md valid" 1
        else
            check "consensus.md valid" 0 "missing required sections"
        fi
        # 4b. Check all required consensus sections
        required_sections=("Last Updated" "Current Phase" "What We Did This Cycle" "Key Decisions Made" "Active Projects" "Metrics" "Next Action" "Company State" "Human Escalation" "Open Questions")
        missing_sections=""
        for section in "${required_sections[@]}"; do
            if ! grep -q "^## $section" "$CONSENSUS_FILE"; then
                missing_sections="${missing_sections}${section}, "
            fi
        done
        if [ -z "$missing_sections" ]; then
            check "consensus.md sections" 1 "${#required_sections[@]} required sections present"
        else
            check "consensus.md sections" 0 "missing: ${missing_sections%, }"
        fi
    else
        check "consensus.md exists" 1 "not yet created (OK for first run)"
    fi

    # 5. jq installed
    if command -v jq &>/dev/null; then
        check "jq installed" 1 "$(jq --version 2>/dev/null || echo 'unknown')"
    else
        check "jq installed" 0 "required for cost analytics"
    fi

    # 6. git repo
    if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree &>/dev/null; then
        branch=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "detached")
        check "Git repository" 1 "branch: $branch"
    else
        check "Git repository" 0 "not a git repo"
    fi

    # 7. No stale PID
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            check "No stale PID" 1 "loop running as PID $pid"
        else
            check "No stale PID" 0 "stale PID file (process $pid not running) -- delete $PID_FILE"
        fi
    else
        check "No stale PID" 1 "no PID file"
    fi

    # 8. .env file
    if [ -f "$PROJECT_DIR/.env" ]; then
        check ".env config" 1
    else
        check ".env config" 1 "no .env (using defaults)"
    fi

    # 9. Log directory writable
    mkdir -p "$LOG_DIR" 2>/dev/null
    if [ -w "$LOG_DIR" ]; then
        check "Log directory writable" 1 "$LOG_DIR"
    else
        check "Log directory writable" 0 "$LOG_DIR not writable"
    fi

    # 10. Agents directory
    if [ -d "$PROJECT_DIR/.claude/agents" ]; then
        agent_count=$(ls "$PROJECT_DIR/.claude/agents"/*.md 2>/dev/null | wc -l | tr -d ' ')
        check "Agent definitions" 1 "$agent_count agents"
    else
        check "Agent definitions" 0 ".claude/agents/ missing"
    fi

    echo ""
    echo "Results: $pass passed, $fail failed"
    if [ "$fail" -gt 0 ]; then
        echo "Fix the failures above before running the loop."
        exit 1
    else
        echo "All checks passed. Ready to run: ./auto-loop.sh"
        exit 0
    fi
fi

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

# Validate numeric config values
validate_numeric() {
    local name="$1" value="$2"
    if ! echo "$value" | grep -qE '^[0-9]+$'; then
        echo "Error: $name='$value' is not a valid integer."
        exit 1
    fi
}
validate_numeric "LOOP_INTERVAL" "$LOOP_INTERVAL"
validate_numeric "CYCLE_TIMEOUT_SECONDS" "$CYCLE_TIMEOUT_SECONDS"
validate_numeric "MAX_CONSECUTIVE_ERRORS" "$MAX_CONSECUTIVE_ERRORS"
validate_numeric "COOLDOWN_SECONDS" "$COOLDOWN_SECONDS"
validate_numeric "LIMIT_WAIT_SECONDS" "$LIMIT_WAIT_SECONDS"
validate_numeric "MAX_LOGS" "$MAX_LOGS"
validate_numeric "RETRY_BASE_SECONDS" "$RETRY_BASE_SECONDS"
validate_numeric "RETRY_MAX_SECONDS" "$RETRY_MAX_SECONDS"

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
    saved_loop=$(grep '^LOOP_COUNT=' "$STATE_FILE" | cut -d= -f2 || echo 0)
    loop_count="${saved_loop:-0}"
    log "Restored state: cycle=$loop_count, cost=\$$total_cost"
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

    cycle_start_epoch=$(date +%s)
    log_cycle $loop_count "START" "Beginning work cycle"
    save_state "running"

    # Log rotation
    rotate_logs

    # Backup consensus before cycle (also used for diff logging)
    backup_consensus
    pre_cycle_consensus_hash=$(md5 -q "$CONSENSUS_FILE" 2>/dev/null || md5sum "$CONSENSUS_FILE" 2>/dev/null | cut -d' ' -f1 || echo "")

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

    cycle_end_epoch=$(date +%s)
    cycle_duration=$((cycle_end_epoch - cycle_start_epoch))

    if [ -z "$cycle_failed_reason" ]; then
        log_cycle $loop_count "OK" "Completed (cost: \$${CYCLE_COST:-unknown}, subtype: ${CYCLE_SUBTYPE:-unknown}, ${cycle_duration}s)"
        if [ -n "$RESULT_TEXT" ]; then
            log_cycle $loop_count "SUMMARY" "$(echo "$RESULT_TEXT" | head -c 300)"
        fi
        # Log consensus diff if it changed
        post_cycle_consensus_hash=$(md5 -q "$CONSENSUS_FILE" 2>/dev/null || md5sum "$CONSENSUS_FILE" 2>/dev/null | cut -d' ' -f1 || echo "")
        if [ -n "$pre_cycle_consensus_hash" ] && [ "$pre_cycle_consensus_hash" != "$post_cycle_consensus_hash" ]; then
            diff_file="$LOG_DIR/consensus-diff-$(printf '%04d' $loop_count).diff"
            diff -u "$CONSENSUS_FILE.bak" "$CONSENSUS_FILE" > "$diff_file" 2>/dev/null || true
            diff_lines=$(wc -l < "$diff_file" | tr -d ' ')
            log_cycle $loop_count "DIFF" "Consensus changed ($diff_lines diff lines) -- saved to $diff_file"
        else
            log_cycle $loop_count "DIFF" "Consensus unchanged"
        fi
        append_cycle_history "$loop_count" "ok" "${CYCLE_COST:-0}" "$cycle_duration" "$EXIT_CODE"
        error_count=0
    else
        error_count=$((error_count + 1))
        log_cycle $loop_count "FAIL" "$cycle_failed_reason (cost: \$${CYCLE_COST:-unknown}, subtype: ${CYCLE_SUBTYPE:-unknown}, ${cycle_duration}s, errors: $error_count/$MAX_CONSECUTIVE_ERRORS)"
        append_cycle_history "$loop_count" "fail" "${CYCLE_COST:-0}" "$cycle_duration" "$EXIT_CODE"

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
        else
            # Exponential backoff for transient failures: 30s, 60s, 120s... capped at RETRY_MAX_SECONDS
            backoff=$(awk "BEGIN {v=$RETRY_BASE_SECONDS * 2^($error_count - 1); print (v > $RETRY_MAX_SECONDS ? $RETRY_MAX_SECONDS : v)}")
            log_cycle $loop_count "RETRY" "Backoff ${backoff}s before retry (error $error_count/$MAX_CONSECUTIVE_ERRORS)"
            save_state "backoff"
            sleep "$backoff"
            continue
        fi
    fi

    save_state "idle"
    log_cycle $loop_count "WAIT" "Sleeping ${LOOP_INTERVAL}s before next cycle..."
    sleep $LOOP_INTERVAL
done
