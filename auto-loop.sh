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
#   ./auto-loop.sh --help       # Show full help message
#   ./auto-loop.sh --selftest   # Validate environment without running
#   ./auto-loop.sh --dry-run    # Build prompt + show preview, don't run
#   ./auto-loop.sh --status     # Quick status from state file
#   ./auto-loop.sh --status --json  # Machine-readable JSON status
#   ./auto-loop.sh --export     # Export cycle history as CSV
#   ./auto-loop.sh --logs [N]   # Show last N lines of loop log (default: 50)
#   ./auto-loop.sh --cost       # Show cost summary across cycles
#   ./auto-loop.sh --history [N]   # Show last N cycles as table (default: 10)
#   ./auto-loop.sh --history --compact [N]  # One-line-per-cycle summary
#   ./auto-loop.sh --reset-errors  # Clear circuit breaker state
#   ./auto-loop.sh --purge-logs [N]  # Purge old logs, keep latest N (default: 50)
#   ./auto-loop.sh --doctor     # Comprehensive health check
#   ./auto-loop.sh --upgrade    # Check for newer version on GitHub
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
    # shellcheck source=/dev/null
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
        # shellcheck disable=SC2034
        CYCLE_TYPE=$(echo "$OUTPUT" | sed -n 's/.*"type":"\([^"]*\)".*/\1/p' | tail -1 || true)
    fi
}

# === Help flag ===

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    cat << 'HELPEOF'
Auto-Co -- 24/7 Autonomous AI Company Loop

USAGE:
  ./auto-loop.sh              Run the loop in foreground
  ./auto-loop.sh --daemon     Run via launchd (no tty)
  ./auto-loop.sh --help       Show this help message
  ./auto-loop.sh --version    Show version
  ./auto-loop.sh --config     Print all config values
  ./auto-loop.sh --status     Quick status check (with cycle stats)
  ./auto-loop.sh --status --json  Machine-readable JSON output
  ./auto-loop.sh --export [FMT]  Export cycle history (csv, json, markdown)
  ./auto-loop.sh --logs [N]   Show last N lines of loop log (default: 50)
  ./auto-loop.sh --cost       Show cost summary across cycles
  ./auto-loop.sh --history [N]   Show last N cycles as table (default: 10)
  ./auto-loop.sh --history --compact [N]  One-line-per-cycle summary
  ./auto-loop.sh --reset-errors  Clear circuit breaker state
  ./auto-loop.sh --purge-logs [N]  Purge old logs, keep latest N (default: 50)
  ./auto-loop.sh --doctor     Comprehensive system health check
  ./auto-loop.sh --upgrade    Check for newer version on GitHub
  ./auto-loop.sh --selftest   Validate environment
  ./auto-loop.sh --dry-run    Preview prompt without running

STOP:
  ./stop-loop.sh              Graceful stop
  kill $(cat .auto-loop.pid)  Force stop

CONFIG (env vars or .env file):
  MODEL                  Claude model (default: opus)
  LOOP_INTERVAL          Seconds between cycles (default: 120)
  CYCLE_TIMEOUT_SECONDS  Max seconds per cycle (default: 1800)
  MAX_CONSECUTIVE_ERRORS Circuit breaker threshold (default: 3)
  COOLDOWN_SECONDS       Cooldown after circuit break (default: 300)
  LIMIT_WAIT_SECONDS     Wait on API usage limit (default: 3600)
  MAX_LOGS               Max cycle logs to keep (default: 200)
  RETRY_BASE_SECONDS     Initial backoff on failure (default: 30)
  RETRY_MAX_SECONDS      Max backoff cap (default: 600)

MONITORING:
  ./monitor.sh --dashboard    Live TUI dashboard
  ./monitor.sh --status       Quick status
  ./monitor.sh --tail         Follow main log
  ./monitor.sh --last         Show latest cycle output

MORE INFO:
  https://github.com/NikitaDmitrieff/auto-co-meta
HELPEOF
    exit 0
fi

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
    json_mode=0
    if [ "${2:-}" = "--json" ]; then
        json_mode=1
    fi

    status="unknown"; loop_ct=0; last_run=""; model_st="unknown"; total_ct=0
    if [ -f "$STATE_FILE" ]; then
        status=$(grep '^STATUS=' "$STATE_FILE" | cut -d= -f2)
        loop_ct=$(grep '^LOOP_COUNT=' "$STATE_FILE" | cut -d= -f2)
        last_run=$(grep '^LAST_RUN=' "$STATE_FILE" | cut -d= -f2-)
        model_st=$(grep '^MODEL=' "$STATE_FILE" | cut -d= -f2)
        total_ct=$(grep '^TOTAL_COST=' "$STATE_FILE" | cut -d= -f2)
    fi

    # Loop running?
    loop_state="not_running"
    loop_pid=""
    if [ -f "$PID_FILE" ]; then
        loop_pid=$(cat "$PID_FILE")
        if kill -0 "$loop_pid" 2>/dev/null; then
            loop_state="running"
        else
            loop_state="stopped_stale"
        fi
    fi

    # Cycle duration stats from history
    avg_dur=0; min_dur=0; max_dur=0; ok_cycles=0; fail_cycles=0
    if [ -f "$CYCLE_HISTORY_FILE" ] && command -v jq &>/dev/null; then
        stats=$(jq -s '
            if length == 0 then {avg:0,min:0,max:0,ok:0,fail:0}
            else {
                avg: ([.[].duration_s] | add / length | floor),
                min: ([.[].duration_s] | min),
                max: ([.[].duration_s] | max),
                ok:  [.[] | select(.status=="ok")] | length,
                fail: [.[] | select(.status=="fail")] | length
            } end' "$CYCLE_HISTORY_FILE" 2>/dev/null || echo '{"avg":0,"min":0,"max":0,"ok":0,"fail":0}')
        avg_dur=$(echo "$stats" | jq -r '.avg')
        min_dur=$(echo "$stats" | jq -r '.min')
        max_dur=$(echo "$stats" | jq -r '.max')
        ok_cycles=$(echo "$stats" | jq -r '.ok')
        fail_cycles=$(echo "$stats" | jq -r '.fail')
    fi

    # Next Action from consensus
    next_action=""
    if [ -f "$CONSENSUS_FILE" ]; then
        next_action=$(sed -n '/^## Next Action/,/^##/{/^## Next Action/d;/^##/d;p;}' "$CONSENSUS_FILE" | head -1 | sed 's/^[[:space:]]*//')
    fi

    if [ "$json_mode" -eq 1 ]; then
        jq -n \
            --arg loop_state "$loop_state" \
            --arg loop_pid "$loop_pid" \
            --arg status "${status:-unknown}" \
            --arg model "${model_st:-unknown}" \
            --argjson cycles "${loop_ct:-0}" \
            --arg total_cost "${total_ct:-0}" \
            --arg last_run "${last_run:-}" \
            --argjson avg_duration "$avg_dur" \
            --argjson min_duration "$min_dur" \
            --argjson max_duration "$max_dur" \
            --argjson ok_cycles "$ok_cycles" \
            --argjson fail_cycles "$fail_cycles" \
            --arg next_action "$next_action" \
            '{
                loop: $loop_state,
                pid: (if $loop_pid == "" then null else ($loop_pid | tonumber) end),
                status: $status,
                model: $model,
                cycles: $cycles,
                total_cost: ($total_cost | tonumber),
                last_run: (if $last_run == "" then null else $last_run end),
                duration: {avg_s: $avg_duration, min_s: $min_duration, max_s: $max_duration},
                results: {ok: $ok_cycles, fail: $fail_cycles},
                next_action: (if $next_action == "" then null else $next_action end)
            }'
        exit 0
    fi

    # Human-readable output
    if [ "$loop_state" = "running" ]; then
        printf "Loop: RUNNING (PID %s)  " "$loop_pid"
    elif [ "$loop_state" = "stopped_stale" ]; then
        printf "Loop: STOPPED (stale PID)  "
    else
        printf "Loop: NOT RUNNING  "
    fi

    printf "Status: %s  Model: %s  Cycles: %s  Cost: \$%s\n" \
        "${status:-unknown}" "${model_st:-unknown}" "${loop_ct:-0}" "${total_ct:-0}"

    if [ -n "${last_run:-}" ]; then
        echo "Last run: $last_run"
    fi

    # Show cycle duration stats
    if [ "$ok_cycles" -gt 0 ] || [ "$fail_cycles" -gt 0 ]; then
        printf "Cycles: %s ok, %s fail  Duration: avg %ss, min %ss, max %ss\n" \
            "$ok_cycles" "$fail_cycles" "$avg_dur" "$min_dur" "$max_dur"
    fi

    if [ -n "$next_action" ]; then
        echo "Next: $next_action"
    fi
    exit 0
fi

# === Export flag (cycle history as CSV) ===

if [ "${1:-}" = "--export" ]; then
    if [ ! -f "$CYCLE_HISTORY_FILE" ]; then
        echo "No cycle history found at $CYCLE_HISTORY_FILE"
        exit 1
    fi
    if ! command -v jq &>/dev/null; then
        echo "Error: jq is required for --export. Install: brew install jq"
        exit 1
    fi
    format="${2:-csv}"
    case "$format" in
        csv)
            echo "cycle,timestamp,status,cost,duration_s,exit_code,model,total_cost"
            jq -r '[.cycle, .timestamp, .status, .cost, .duration_s, .exit_code, .model, .total_cost] | @csv' "$CYCLE_HISTORY_FILE"
            ;;
        json)
            jq -s '.' "$CYCLE_HISTORY_FILE"
            ;;
        markdown|md)
            printf "| %-7s | %-22s | %-8s | %-10s | %-10s | %-6s | %-8s |\n" \
                "Cycle" "Timestamp" "Status" "Cost" "Duration" "Exit" "Model"
            printf "| %-7s | %-22s | %-8s | %-10s | %-10s | %-6s | %-8s |\n" \
                "-------" "----------------------" "--------" "----------" "----------" "------" "--------"
            jq -r '[.cycle, .timestamp, .status, .cost, .duration_s, .exit_code, .model] |
                 "\(.[0])\t\(.[1])\t\(.[2])\t$\(.[3])\t\(.[4])s\t\(.[5])\t\(.[6])"' "$CYCLE_HISTORY_FILE" | \
                while IFS=$'\t' read -r cy ts st co du ex mo; do
                    printf "| %-7s | %-22s | %-8s | %-10s | %-10s | %-6s | %-8s |\n" "$cy" "$ts" "$st" "$co" "$du" "$ex" "$mo"
                done
            ;;
        *)
            echo "Unknown format: $format (supported: csv, json, markdown)"
            exit 1
            ;;
    esac
    exit 0
fi

# === Logs flag (show recent cycle logs) ===

if [ "${1:-}" = "--logs" ]; then
    lines="${2:-50}"
    if ! echo "$lines" | grep -qE '^[0-9]+$'; then
        echo "Usage: ./auto-loop.sh --logs [LINES]  (default: 50)"
        exit 1
    fi
    if [ -f "$LOG_DIR/auto-loop.log" ]; then
        tail -n "$lines" "$LOG_DIR/auto-loop.log"
    else
        echo "No log file found at $LOG_DIR/auto-loop.log"
        exit 1
    fi
    exit 0
fi

# === Cost flag (cost summary from cycle history) ===

if [ "${1:-}" = "--cost" ]; then
    if [ ! -f "$CYCLE_HISTORY_FILE" ]; then
        echo "No cycle history found at $CYCLE_HISTORY_FILE"
        exit 1
    fi
    if ! command -v jq &>/dev/null; then
        echo "Error: jq is required for --cost. Install: brew install jq"
        exit 1
    fi
    jq -s '
        if length == 0 then "No cycle data.\n" | halt_error
        else
            {
                total_cycles: length,
                total_cost: ([.[].cost] | add),
                avg_per_cycle: (([.[].cost] | add) / length),
                last_5: (if length >= 5 then .[-5:] else . end | [.[].cost] | add),
                last_5_count: (if length >= 5 then 5 else length end),
                cheapest: ([.[].cost] | min),
                most_expensive: ([.[].cost] | max)
            }
        end
    ' "$CYCLE_HISTORY_FILE" | jq -r '
        "=== Auto-Co Cost Summary ===",
        "",
        "Total cycles:      \(.total_cycles)",
        "Total cost:        $\(.total_cost | tostring | .[0:8])",
        "Avg per cycle:     $\(.avg_per_cycle | tostring | .[0:8])",
        "Last \(.last_5_count) cycles:    $\(.last_5 | tostring | .[0:8])",
        "Cheapest cycle:    $\(.cheapest | tostring | .[0:8])",
        "Most expensive:    $\(.most_expensive | tostring | .[0:8])"
    '
    exit 0
fi

# === History flag (show last N cycles as table) ===

if [ "${1:-}" = "--history" ]; then
    compact=0
    if [ "${2:-}" = "--compact" ]; then
        compact=1
        count="${3:-10}"
    else
        count="${2:-10}"
    fi
    if ! echo "$count" | grep -qE '^[0-9]+$'; then
        echo "Usage: ./auto-loop.sh --history [--compact] [N]  (default: 10)"
        exit 1
    fi
    if [ ! -f "$CYCLE_HISTORY_FILE" ]; then
        echo "No cycle history found at $CYCLE_HISTORY_FILE"
        exit 1
    fi
    if ! command -v jq &>/dev/null; then
        echo "Error: jq is required for --history. Install: brew install jq"
        exit 1
    fi
    total_lines=$(wc -l < "$CYCLE_HISTORY_FILE" | tr -d ' ')
    if [ "$count" -gt "$total_lines" ]; then
        count="$total_lines"
    fi
    if [ "$compact" -eq 1 ]; then
        tail -n "$count" "$CYCLE_HISTORY_FILE" | jq -r \
            '"\(.cycle) \(.status) $\(.cost) \(.duration_s)s \(.timestamp | split("T")[0])"'
        echo "-- $count of $total_lines cycles"
    else
        printf "%-7s %-22s %-8s %-10s %-10s %-6s %-8s\n" \
            "CYCLE" "TIMESTAMP" "STATUS" "COST" "DURATION" "EXIT" "MODEL"
        printf "%-7s %-22s %-8s %-10s %-10s %-6s %-8s\n" \
            "-----" "---------------------" "------" "--------" "--------" "----" "------"
        tail -n "$count" "$CYCLE_HISTORY_FILE" | jq -r \
            '[.cycle, .timestamp, .status, .cost, .duration_s, .exit_code, .model] |
             "\(.[0])\t\(.[1])\t\(.[2])\t$\(.[3])\t\(.[4])s\t\(.[5])\t\(.[6])"' | \
            while IFS=$'\t' read -r cy ts st co du ex mo; do
                printf "%-7s %-22s %-8s %-10s %-10s %-6s %-8s\n" "$cy" "$ts" "$st" "$co" "$du" "$ex" "$mo"
            done
        echo ""
        echo "Showing last $count of $total_lines cycles"
    fi
    exit 0
fi

# === Reset-errors flag (clear circuit breaker state) ===

if [ "${1:-}" = "--reset-errors" ]; then
    if [ -f "$STATE_FILE" ]; then
        # Reset error count and status in state file
        if grep -q '^STATUS=circuit_break\|^STATUS=backoff' "$STATE_FILE"; then
            sed -i '' 's/^STATUS=.*/STATUS=idle/' "$STATE_FILE" 2>/dev/null || \
                sed -i 's/^STATUS=.*/STATUS=idle/' "$STATE_FILE"
            echo "Circuit breaker state cleared. Status reset to idle."
        else
            current_status=$(grep '^STATUS=' "$STATE_FILE" | cut -d= -f2)
            echo "No circuit breaker active (current status: ${current_status:-unknown})."
        fi
    else
        echo "No state file found. Nothing to reset."
    fi
    exit 0
fi

# === Purge-logs flag (manual log rotation) ===

if [ "${1:-}" = "--purge-logs" ]; then
    keep="${2:-50}"
    if ! echo "$keep" | grep -qE '^[0-9]+$'; then
        echo "Usage: ./auto-loop.sh --purge-logs [KEEP]  (default: 50, keep latest N cycle logs)"
        exit 1
    fi
    count=$(find "$LOG_DIR" -name "cycle-*.log" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -le "$keep" ]; then
        echo "Only $count cycle logs found (keeping $keep). Nothing to purge."
        exit 0
    fi
    to_delete=$((count - keep))
    find "$LOG_DIR" -name "cycle-*.log" -type f | sort | head -n "$to_delete" | xargs rm -f 2>/dev/null || true
    # Also remove old diff files
    diff_count=$(find "$LOG_DIR" -name "consensus-diff-*.diff" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$diff_count" -gt "$keep" ]; then
        diff_delete=$((diff_count - keep))
        find "$LOG_DIR" -name "consensus-diff-*.diff" -type f | sort | head -n "$diff_delete" | xargs rm -f 2>/dev/null || true
        echo "Purged $to_delete cycle logs + $diff_delete consensus diffs (kept latest $keep of each)"
    else
        echo "Purged $to_delete cycle logs (kept latest $keep)"
    fi
    # Rotate main log if over 10MB
    if [ -f "$LOG_DIR/auto-loop.log" ]; then
        log_size=$(stat -f%z "$LOG_DIR/auto-loop.log" 2>/dev/null || echo 0)
        if [ "$log_size" -gt 10485760 ]; then
            mv "$LOG_DIR/auto-loop.log" "$LOG_DIR/auto-loop.log.old"
            echo "Main log rotated (was $(( log_size / 1024 / 1024 ))MB)"
        fi
    fi
    exit 0
fi

# === Doctor flag (comprehensive health check) ===

if [ "${1:-}" = "--doctor" ]; then
    echo "=== Auto-Co Doctor ==="
    echo ""
    warnings=0
    ok=0

    doctor_check() {
        local label="$1" status="$2" detail="$3"
        if [ "$status" = "ok" ]; then
            printf "  [OK]   %s" "$label"
            ok=$((ok + 1))
        elif [ "$status" = "warn" ]; then
            printf "  [WARN] %s" "$label"
            warnings=$((warnings + 1))
        else
            printf "  [CRIT] %s" "$label"
            warnings=$((warnings + 1))
        fi
        [ -n "$detail" ] && printf " -- %s" "$detail"
        echo ""
    }

    # 1. Disk space
    avail_kb=$(df -k "$PROJECT_DIR" | tail -1 | awk '{print $4}')
    avail_mb=$((avail_kb / 1024))
    if [ "$avail_mb" -lt 100 ]; then
        doctor_check "Disk space" "crit" "${avail_mb}MB available (< 100MB)"
    elif [ "$avail_mb" -lt 500 ]; then
        doctor_check "Disk space" "warn" "${avail_mb}MB available (< 500MB)"
    else
        doctor_check "Disk space" "ok" "${avail_mb}MB available"
    fi

    # 2. Log directory size
    if [ -d "$LOG_DIR" ]; then
        log_size_kb=$(du -sk "$LOG_DIR" 2>/dev/null | cut -f1)
        log_size_mb=$((log_size_kb / 1024))
        log_count=$(find "$LOG_DIR" -name "cycle-*.log" -type f 2>/dev/null | wc -l | tr -d ' ')
        if [ "$log_size_mb" -gt 500 ]; then
            doctor_check "Log directory" "warn" "${log_size_mb}MB, ${log_count} cycle logs (consider --purge-logs)"
        else
            doctor_check "Log directory" "ok" "${log_size_mb}MB, ${log_count} cycle logs"
        fi
    else
        doctor_check "Log directory" "ok" "not yet created"
    fi

    # 3. Stale PID
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            doctor_check "Loop process" "ok" "running (PID $pid)"
        else
            doctor_check "Loop process" "warn" "stale PID file (process $pid not running)"
        fi
    else
        doctor_check "Loop process" "ok" "not running (no PID file)"
    fi

    # 4. Consensus freshness
    if [ -f "$CONSENSUS_FILE" ]; then
        last_updated=$(grep '^[0-9T:Z-]' "$CONSENSUS_FILE" | head -1 || echo "")
        if [ -n "$last_updated" ]; then
            # Check file modification time instead (more reliable)
            file_mod=$(stat -f%m "$CONSENSUS_FILE" 2>/dev/null || stat -c%Y "$CONSENSUS_FILE" 2>/dev/null || echo 0)
            now=$(date +%s)
            age_hours=$(( (now - file_mod) / 3600 ))
            if [ "$age_hours" -gt 24 ]; then
                doctor_check "Consensus freshness" "warn" "last modified ${age_hours}h ago"
            else
                doctor_check "Consensus freshness" "ok" "last modified ${age_hours}h ago"
            fi
        else
            doctor_check "Consensus freshness" "ok" "timestamp not parsed"
        fi
    else
        doctor_check "Consensus freshness" "ok" "no consensus yet (first run)"
    fi

    # 5. Git status
    if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree &>/dev/null; then
        dirty=$(git -C "$PROJECT_DIR" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        branch=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "detached")
        if [ "$dirty" -gt 20 ]; then
            doctor_check "Git repo" "warn" "branch: $branch, $dirty uncommitted changes"
        else
            doctor_check "Git repo" "ok" "branch: $branch, $dirty uncommitted changes"
        fi
    else
        doctor_check "Git repo" "warn" "not a git repository"
    fi

    # 6. Cycle history integrity
    if [ -f "$CYCLE_HISTORY_FILE" ] && command -v jq &>/dev/null; then
        total_lines=$(wc -l < "$CYCLE_HISTORY_FILE" | tr -d ' ')
        bad_lines=$(while IFS= read -r line; do echo "$line" | jq empty 2>/dev/null || echo "bad"; done < "$CYCLE_HISTORY_FILE" | grep -c "bad" || true)
        if [ "$bad_lines" -gt 0 ]; then
            doctor_check "Cycle history" "warn" "$bad_lines/$total_lines malformed JSON lines"
        else
            doctor_check "Cycle history" "ok" "$total_lines records, all valid JSON"
        fi
    elif [ -f "$CYCLE_HISTORY_FILE" ]; then
        doctor_check "Cycle history" "ok" "exists (install jq for integrity check)"
    else
        doctor_check "Cycle history" "ok" "no history yet"
    fi

    # 7. Recent failure rate
    if [ -f "$CYCLE_HISTORY_FILE" ] && command -v jq &>/dev/null; then
        last10=$(tail -10 "$CYCLE_HISTORY_FILE" | jq -s '[.[] | select(.status=="fail")] | length' 2>/dev/null || echo 0)
        if [ "$last10" -ge 5 ]; then
            doctor_check "Recent failures" "warn" "$last10 of last 10 cycles failed"
        else
            doctor_check "Recent failures" "ok" "$last10 of last 10 cycles failed"
        fi
    fi

    # 8. Dependencies
    for cmd in claude jq git node; do
        if command -v "$cmd" &>/dev/null; then
            ver=$("$cmd" --version 2>/dev/null | head -1 || echo "installed")
            doctor_check "$cmd" "ok" "$ver"
        else
            if [ "$cmd" = "claude" ] || [ "$cmd" = "jq" ]; then
                doctor_check "$cmd" "crit" "not found"
            else
                doctor_check "$cmd" "warn" "not found"
            fi
        fi
    done

    # 9. Orphaned Claude processes
    orphan_count=$( (pgrep -f "claude.*--print-conversation-id" 2>/dev/null || true) | wc -l | tr -d ' ')
    if [ -f "$PID_FILE" ]; then
        loop_pid_val=$(cat "$PID_FILE")
        # Subtract processes that are children of the current loop
        if kill -0 "$loop_pid_val" 2>/dev/null; then
            child_count=$( (pgrep -P "$loop_pid_val" -f "claude" 2>/dev/null || true) | wc -l | tr -d ' ')
            orphan_count=$((orphan_count - child_count))
            [ "$orphan_count" -lt 0 ] && orphan_count=0
        fi
    fi
    if [ "$orphan_count" -gt 0 ]; then
        doctor_check "Orphaned Claude processes" "warn" "$orphan_count process(es) not attached to loop"
    else
        doctor_check "Orphaned Claude processes" "ok" "none detected"
    fi

    echo ""
    if [ "$warnings" -eq 0 ]; then
        echo "Health: ALL OK ($ok checks passed)"
    else
        echo "Health: $warnings warnings, $ok OK"
    fi
    exit 0
fi

# === Upgrade check flag ===

if [ "${1:-}" = "--upgrade" ]; then
    local_version=$(cat "$PROJECT_DIR/VERSION" 2>/dev/null || echo "0.0.0")
    echo "Local version: v${local_version}"
    echo "Checking GitHub for latest release..."
    if ! command -v curl &>/dev/null; then
        echo "Error: curl is required for --upgrade."
        exit 1
    fi
    remote_tag=$(curl -sS --max-time 10 \
        "https://api.github.com/repos/NikitaDmitrieff/auto-co-meta/releases/latest" 2>/dev/null \
        | grep '"tag_name"' | head -1 | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"v\{0,1\}\([^"]*\)".*/\1/')
    if [ -z "$remote_tag" ]; then
        echo "Could not fetch latest release from GitHub."
        echo "Check manually: https://github.com/NikitaDmitrieff/auto-co-meta/releases"
        exit 1
    fi
    echo "Latest release: v${remote_tag}"
    if [ "$local_version" = "$remote_tag" ]; then
        echo "You are up to date."
    else
        # Simple version comparison using sort -V
        newer=$(printf '%s\n%s' "$local_version" "$remote_tag" | sort -V | tail -1)
        if [ "$newer" = "$remote_tag" ] && [ "$newer" != "$local_version" ]; then
            echo ""
            echo "A newer version is available!"
            echo "  Upgrade: git pull origin main"
            echo "  Release: https://github.com/NikitaDmitrieff/auto-co-meta/releases/tag/v${remote_tag}"
        else
            echo "Local version is ahead of latest release."
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
        agent_count=$(find "$PROJECT_DIR/.claude/agents" -name '*.md' -type f 2>/dev/null | wc -l | tr -d ' ')
        check "Agent definitions" 1 "$agent_count agents"
    else
        check "Agent definitions" 0 ".claude/agents/ missing"
    fi

    # 11. Signal handling (verify trap is functional)
    if (bash -c 'trap "echo caught" SIGTERM; kill -TERM $$ 2>/dev/null; exit 0' 2>/dev/null); then
        check "Signal handling (trap)" 1 "SIGTERM trap works"
    else
        check "Signal handling (trap)" 0 "bash signal trapping broken"
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
            sleep "$LIMIT_WAIT_SECONDS"
            error_count=0
            continue
        fi

        # Circuit breaker
        if [ "$error_count" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
            log_cycle $loop_count "BREAKER" "Circuit breaker tripped! Cooling down ${COOLDOWN_SECONDS}s..."
            save_state "circuit_break"
            sleep "$COOLDOWN_SECONDS"
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
    sleep "$LOOP_INTERVAL"
done
