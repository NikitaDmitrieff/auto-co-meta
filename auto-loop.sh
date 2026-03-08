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
#   ./auto-loop.sh --init <dir> # Scaffold a new auto-co project
#   ./auto-loop.sh --watch      # Live dashboard (alias for monitor.sh --dashboard)
#   ./auto-loop.sh --pause      # Pause the loop (skip cycles until resumed)
#   ./auto-loop.sh --resume     # Resume a paused loop
#   ./auto-loop.sh --tail       # Follow main loop log in real-time
#   ./auto-loop.sh --cycles N   # Run at most N cycles, then exit cleanly
#   ./auto-loop.sh --notify URL # POST JSON notification to webhook after each cycle
#   ./auto-loop.sh --config     # Print all config values
#   ./auto-loop.sh --metrics    # Quick KPI dashboard from cycle history
#   ./auto-loop.sh --env        # Generate .env.example with all config options
#   ./auto-loop.sh --snapshot   # Create timestamped tarball of project state
#   ./auto-loop.sh --rollback   # Undo last restore from pre-restore backup
#   ./auto-loop.sh --schedule [MIN] # Generate launchd/cron/systemd config (default: 30min)
#   ./auto-loop.sh --plugin DIR # Load lifecycle hooks from DIR (pre-cycle.sh, post-cycle.sh)
#   ./auto-loop.sh --parallel DIR # Run .md prompt files from DIR as parallel Claude sessions
#   ./auto-loop.sh --template [NAME] [DIR] # Scaffold from pre-built template (saas, docs-site, api-backend)
#   ./auto-loop.sh --dashboard  # Rich terminal dashboard (status, costs, agents, projects)
#   ./auto-loop.sh --agent NAME "PROMPT" # Run a single named agent ad-hoc
#   ./auto-loop.sh --webhook URL # POST JSON on lifecycle events (start, end, error, circuit break)
#   ./auto-loop.sh --version    # Show version
#
# Stop:
#   ./stop-loop.sh              # Graceful stop
#   kill $(cat .auto-loop.pid)  # Force stop
#
# Config (env vars):
#   MODEL=opus                  # Claude model (default: opus)
#   LOOP_INTERVAL=120           # Seconds between cycles (default: 120)
#   CYCLE_TIMEOUT_SECONDS=1800  # Max seconds per cycle before force-kill
#   MAX_CONSECUTIVE_ERRORS=3    # Circuit breaker threshold
#   COOLDOWN_SECONDS=300        # Cooldown after circuit break
#   LIMIT_WAIT_SECONDS=3600     # Wait on usage limit
#   MAX_LOGS=200                # Max cycle logs to keep
#   RETRY_BASE_SECONDS=30       # Initial backoff on transient failure
#   RETRY_MAX_SECONDS=600       # Max backoff cap
#   MAX_CYCLES=0                # Max cycles before exit (0 = unlimited)
#   NOTIFY_URL=                 # Webhook URL for cycle notifications (empty = disabled)
#   WEBHOOK_URL=               # Event-based webhook URL (empty = disabled)
#   PLUGIN_DIR=                 # Directory with hook scripts (empty = disabled)
#   PARALLEL_DIR=               # Directory with .md prompt files for parallel sessions (empty = disabled)
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
PAUSE_FILE="$PROJECT_DIR/.auto-loop-paused"

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
MAX_CYCLES="${MAX_CYCLES:-0}"  # 0 = unlimited
NOTIFY_URL="${NOTIFY_URL:-}"  # Webhook URL for notifications (empty = disabled)
WEBHOOK_URL="${WEBHOOK_URL:-}"  # Event-based webhook URL (empty = disabled)
PLUGIN_DIR="${PLUGIN_DIR:-}"  # Directory with lifecycle hook scripts (empty = disabled)
PARALLEL_DIR="${PARALLEL_DIR:-}"  # Directory with .md prompt files for parallel sessions (empty = disabled)
STATE_DIR="${STATE_DIR:-state}"
SUMMARY_ENABLED="${SUMMARY_ENABLED:-true}"
IDLE_INTERVAL="${IDLE_INTERVAL:-600}"  # Sleep interval when no changes detected (0 = disabled)
QMD_ENABLED="${QMD_ENABLED:-true}"

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
    log_size=$(stat -f%z "$LOG_DIR/auto-loop.log" 2>/dev/null || stat -c%s "$LOG_DIR/auto-loop.log" 2>/dev/null || echo 0)
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

send_notification() {
    [ -z "$NOTIFY_URL" ] && return 0
    local cycle_num=$1
    local status=$2
    local cost=${3:-0}
    local duration=${4:-0}
    local timestamp
    timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    local payload
    payload=$(printf '{"cycle":%d,"status":"%s","cost":%s,"duration_s":%d,"model":"%s","total_cost":%s,"timestamp":"%s"}' \
        "$cycle_num" "$status" "${cost}" "${duration}" "$MODEL" "$total_cost" "$timestamp")
    # Fire-and-forget: don't block the loop if the webhook is slow or down
    curl -s -o /dev/null -X POST -H "Content-Type: application/json" -d "$payload" "$NOTIFY_URL" --max-time 10 &
}

send_webhook() {
    [ -z "$WEBHOOK_URL" ] && return 0
    local event=$1
    local timestamp
    timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    # Build base payload with event type
    local payload
    payload=$(printf '{"event":"%s","timestamp":"%s","model":"%s","project":"%s"' \
        "$event" "$timestamp" "$MODEL" "$(basename "$PROJECT_DIR")")
    # Append event-specific fields
    case "$event" in
        cycle.start)
            payload=$(printf '%s,"cycle":%d}' "$payload" "${2:-0}")
            ;;
        cycle.end)
            payload=$(printf '%s,"cycle":%d,"status":"%s","cost":%s,"duration_s":%d,"total_cost":%s}' \
                "$payload" "${2:-0}" "${3:-unknown}" "${4:-0}" "${5:-0}" "$total_cost")
            ;;
        error)
            payload=$(printf '%s,"cycle":%d,"reason":"%s","error_count":%d,"max_errors":%d}' \
                "$payload" "${2:-0}" "${3:-unknown}" "${4:-0}" "$MAX_CONSECUTIVE_ERRORS")
            ;;
        circuit_break)
            payload=$(printf '%s,"cycle":%d,"cooldown_s":%d,"error_count":%d}' \
                "$payload" "${2:-0}" "$COOLDOWN_SECONDS" "${3:-0}")
            ;;
        usage_limit)
            payload=$(printf '%s,"cycle":%d,"wait_s":%d}' \
                "$payload" "${2:-0}" "$LIMIT_WAIT_SECONDS")
            ;;
        *)
            payload=$(printf '%s}' "$payload")
            ;;
    esac
    # Fire-and-forget
    curl -s -o /dev/null -X POST -H "Content-Type: application/json" -d "$payload" "$WEBHOOK_URL" --max-time 10 &
}

run_plugin_hook() {
    [ -z "$PLUGIN_DIR" ] && return 0
    local hook_name=$1
    local hook_script="$PLUGIN_DIR/${hook_name}.sh"
    [ ! -f "$hook_script" ] && return 0
    [ ! -x "$hook_script" ] && {
        log "Plugin hook $hook_script is not executable, skipping"
        return 0
    }
    log "Running plugin hook: $hook_name"
    # Export context variables for the hook script
    export AUTO_CO_CYCLE="${2:-0}"
    export AUTO_CO_STATUS="${3:-}"
    export AUTO_CO_COST="${4:-0}"
    export AUTO_CO_DURATION="${5:-0}"
    export AUTO_CO_MODEL="$MODEL"
    export AUTO_CO_PROJECT_DIR="$PROJECT_DIR"
    export AUTO_CO_LOG_DIR="$LOG_DIR"
    export AUTO_CO_CONSENSUS_FILE="$CONSENSUS_FILE"
    # Run with timeout (10s max) — don't let a broken hook stall the loop
    if timeout 10 "$hook_script" 2>&1 | head -20; then
        log "Plugin hook $hook_name completed"
    else
        log "Plugin hook $hook_name failed (exit $?) — continuing anyway"
    fi
    return 0
}

launch_parallel_sessions() {
    # Launches parallel Claude sessions in the background. Sets global arrays for collect_parallel_sessions.
    PARALLEL_PIDS=()
    PARALLEL_NAMES=()
    PARALLEL_OUTPUTS=()
    PARALLEL_COUNT=0
    [ -z "$PARALLEL_DIR" ] && return 0
    local cycle_num=$1
    local prompt_files
    prompt_files=$(find "$PARALLEL_DIR" -maxdepth 1 -name '*.md' -type f 2>/dev/null | sort)
    [ -z "$prompt_files" ] && {
        log "Parallel: no .md files found in $PARALLEL_DIR"
        return 0
    }
    PARALLEL_COUNT=$(echo "$prompt_files" | wc -l | tr -d ' ')
    log "Parallel: launching $PARALLEL_COUNT session(s) from $PARALLEL_DIR"
    while IFS= read -r prompt_file; do
        local name
        name=$(basename "$prompt_file" .md)
        local output_file
        output_file=$(mktemp)
        local parallel_log="$LOG_DIR/cycle-$(printf '%04d' "$cycle_num")-parallel-${name}.log"
        local prompt_content
        prompt_content=$(cat "$prompt_file")
        (
            cd "$PROJECT_DIR" && timeout "$CYCLE_TIMEOUT_SECONDS" claude -p "$prompt_content" \
                --model "$MODEL" \
                --dangerously-skip-permissions \
                --verbose \
                --output-format stream-json \
                > "$output_file" 2>&1
        ) &
        local pid=$!
        PARALLEL_PIDS+=("$pid")
        PARALLEL_NAMES+=("$name")
        PARALLEL_OUTPUTS+=("$output_file:$parallel_log")
        log "Parallel: started session '$name' (PID $pid)"
    done <<< "$prompt_files"
}

collect_parallel_sessions() {
    # Waits for all parallel sessions launched by launch_parallel_sessions. Logs results and accumulates cost.
    [ "$PARALLEL_COUNT" -eq 0 ] && return 0
    for i in "${!PARALLEL_PIDS[@]}"; do
        local pid="${PARALLEL_PIDS[$i]}"
        local name="${PARALLEL_NAMES[$i]}"
        local out_pair="${PARALLEL_OUTPUTS[$i]}"
        local output_file="${out_pair%%:*}"
        local parallel_log="${out_pair##*:}"
        set +e
        wait "$pid" 2>/dev/null
        local exit_code=$?
        set -e
        cp "$output_file" "$parallel_log" 2>/dev/null || true
        # Extract cost from parallel session
        local pcost=""
        if command -v jq &>/dev/null; then
            local result_line
            result_line=$(grep -E '"type"\s*:\s*"result"' "$output_file" 2>/dev/null | tail -1 || true)
            if [ -n "$result_line" ]; then
                pcost=$(echo "$result_line" | jq -r '.total_cost_usd // empty' 2>/dev/null || true)
            fi
        fi
        if [ "$exit_code" -eq 0 ]; then
            log "Parallel: session '$name' completed (cost: \$${pcost:-unknown})"
        elif [ "$exit_code" -eq 124 ]; then
            log "Parallel: session '$name' timed out after ${CYCLE_TIMEOUT_SECONDS}s"
        else
            log "Parallel: session '$name' failed (exit $exit_code, cost: \$${pcost:-unknown})"
        fi
        # Add parallel session cost to total
        if [ -n "$pcost" ] && echo "$pcost" | grep -qE '^[0-9]+\.?[0-9]*$'; then
            total_cost=$(awk "BEGIN {printf \"%.4f\", $total_cost + $pcost}")
        fi
        rm -f "$output_file"
    done
    log "Parallel: all $PARALLEL_COUNT session(s) finished"
}

show_tarball_preview() {
    # Shows what files a tarball would overwrite/add. Sets SNAP_FILES for caller.
    local tarball="$1"
    SNAP_FILES="$(tar -tzf "$tarball" 2>/dev/null)"
    if [ -z "$SNAP_FILES" ]; then
        echo "Error: Could not read snapshot (corrupt or empty tarball)."
        return 1
    fi
    local overwrite_count=0 new_count=0
    while IFS= read -r f; do
        [ -z "$f" ] && continue
        [ "${f: -1}" = "/" ] && continue
        if [ -f "$f" ]; then
            echo "  ~ $f (overwrite)"
            overwrite_count=$((overwrite_count + 1))
        else
            echo "  + $f (new)"
            new_count=$((new_count + 1))
        fi
    done <<< "$SNAP_FILES"
    echo ""
    echo "Summary: ${overwrite_count} files to overwrite, ${new_count} new files"
}

create_project_snapshot() {
    # Creates a tarball of core project files. Returns 1 if no files found.
    local target_path="$1"
    local include_list=()
    for item in memories/ docs/ .claude/agents/ CLAUDE.md PROMPT.md auto-loop.sh monitor.sh stop-loop.sh watcher.js Makefile VERSION README.md package.json .env.example; do
        [ -e "$item" ] && include_list+=("$item")
    done
    if [ ${#include_list[@]} -eq 0 ]; then
        return 1
    fi
    mkdir -p "$(dirname "$target_path")"
    tar -czf "$target_path" \
        --exclude='logs/' \
        --exclude='.git/' \
        --exclude='node_modules/' \
        --exclude='.next/' \
        --exclude='out/' \
        --exclude='*.tar.gz' \
        "${include_list[@]}" 2>/dev/null
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

    # stream-json: each line is a JSON event; the final "result" event has the summary
    if command -v jq &>/dev/null; then
        # Extract from the last line with type=result (handles both compact and spaced JSON)
        local result_line
        result_line=$(grep -E '"type"\s*:\s*"result"' <<< "$OUTPUT" | tail -1 || true)
        if [ -n "$result_line" ]; then
            RESULT_TEXT=$(echo "$result_line" | jq -r '.result // empty' 2>/dev/null | head -c 2000 || true)
            CYCLE_COST=$(echo "$result_line" | jq -r '.total_cost_usd // empty' 2>/dev/null || true)
            CYCLE_SUBTYPE=$(echo "$result_line" | jq -r '.subtype // empty' 2>/dev/null || true)
        else
            # Fallback: try parsing as single JSON (non-stream format)
            RESULT_TEXT=$(echo "$OUTPUT" | jq -r '.result // empty' 2>/dev/null | head -c 2000 || true)
            CYCLE_COST=$(echo "$OUTPUT" | jq -r '.total_cost_usd // empty' 2>/dev/null || true)
            CYCLE_SUBTYPE=$(echo "$OUTPUT" | jq -r '.subtype // empty' 2>/dev/null || true)
        fi

        # Second fallback: scan all events for total_cost_usd if still empty
        if [ -z "$CYCLE_COST" ]; then
            CYCLE_COST=$(grep -o '"total_cost_usd"[[:space:]]*:[[:space:]]*[0-9.]*' <<< "$OUTPUT" | tail -1 | grep -o '[0-9.]*$' || true)
        fi
    else
        RESULT_TEXT=$(echo "$OUTPUT" | head -c 2000 || true)
        CYCLE_COST=$(echo "$OUTPUT" | sed -n 's/.*"total_cost_usd":\([0-9.]*\).*/\1/p' | tail -1 || true)
        CYCLE_SUBTYPE=$(echo "$OUTPUT" | sed -n 's/.*"subtype":"\([^"]*\)".*/\1/p' | tail -1 || true)
    fi
}

write_cycle_summary() {
    local cycle_num=$1
    local summary_dir="$LOG_DIR/summaries"
    mkdir -p "$summary_dir"
    local summary_file="$summary_dir/cycle-$(printf '%04d' "$cycle_num").md"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local status="ok"
    [ -n "${cycle_failed_reason:-}" ] && status="fail"

    # Extract next action from consensus if available
    local next_action=""
    if [ -f "$CONSENSUS_FILE" ]; then
        next_action=$(sed -n '/^## Next Action/,/^## /{ /^## Next Action/d; /^## /d; p; }' "$CONSENSUS_FILE" | head -5 || true)
    fi

    cat > "$summary_file" << SUMMARYEOF
# Cycle $cycle_num Summary
- **Date:** $timestamp
- **Duration:** ${cycle_duration:-0}s
- **Cost:** \$${CYCLE_COST:-unknown}
- **Status:** $status
- **Model:** $MODEL

## Result
$(echo "${RESULT_TEXT:-No result text captured}" | head -c 1000)

## Next Action
${next_action:-No next action found in consensus}
SUMMARYEOF
    log_cycle "$cycle_num" "SUMMARY_FILE" "Written to $summary_file"
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
  ./auto-loop.sh --init DIR   Scaffold a new auto-co project
  ./auto-loop.sh --watch      Live dashboard (alias for monitor.sh --dashboard)
  ./auto-loop.sh --pause      Pause the loop (skip cycles until resumed)
  ./auto-loop.sh --resume     Resume a paused loop
  ./auto-loop.sh --tail       Follow main loop log in real-time
  ./auto-loop.sh --cycles N   Run at most N cycles, then exit cleanly
  ./auto-loop.sh --notify URL POST JSON notifications to webhook after each cycle
  ./auto-loop.sh --metrics    Quick KPI dashboard (cycles, cost, duration)
  ./auto-loop.sh --dashboard  Rich terminal dashboard (status, costs, agents, projects)
  ./auto-loop.sh --agent         List available agents
  ./auto-loop.sh --agent NAME "PROMPT"  Run a single named agent ad-hoc
  ./auto-loop.sh --webhook URL  POST JSON on lifecycle events (start, end, error, circuit break)
  ./auto-loop.sh --env        Generate .env.example with all config options
  ./auto-loop.sh --env FILE   Write template to custom path
  ./auto-loop.sh --snapshot   Create timestamped tarball of project state
  ./auto-loop.sh --snapshot PATH  Write snapshot to custom path
  ./auto-loop.sh --diff A B  Compare two snapshots (show added/removed/changed files)
  ./auto-loop.sh --restore SNAP  Restore project state from a snapshot tarball
  ./auto-loop.sh --restore SNAP --force  Restore without confirmation prompt
  ./auto-loop.sh --restore SNAP --backup  Snapshot current state before restoring
  ./auto-loop.sh --restore SNAP --backup --force  Backup + restore without confirmation
  ./auto-loop.sh --rollback   Restore from most recent pre-restore backup (quick undo)
  ./auto-loop.sh --rollback --force  Rollback without confirmation prompt
  ./auto-loop.sh --schedule [MIN]  Generate launchd/cron/systemd config (default: 30)
  ./auto-loop.sh --schedule 60 --cron  Force crontab output
  ./auto-loop.sh --schedule 15 --systemd  Force systemd output
  ./auto-loop.sh --plugin DIR Load lifecycle hooks from DIR (pre-cycle.sh, post-cycle.sh)
  ./auto-loop.sh --parallel DIR  Run .md prompts from DIR as parallel Claude sessions
  ./auto-loop.sh --template      List available project templates
  ./auto-loop.sh --template NAME DIR  Scaffold project from template
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
  MAX_CYCLES             Max cycles before exit (default: 0 = unlimited)

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

# === Shared scaffolding function (used by --init and --template) ===

# scaffold_project <target_dir> <mission_text> <next_action> <consensus_annotation> <tech_stack> <commit_msg>
#   target_dir:            absolute path to new project
#   mission_text:          mission for CLAUDE.md
#   next_action:           initial Next Action for consensus.md
#   consensus_annotation:  extra text for consensus (e.g. "template: saas") or empty
#   tech_stack:            tech stack label for consensus or "TBD"
#   commit_msg:            git commit message
scaffold_project() {
    local target_dir="$1"
    local mission_text="$2"
    local next_action="$3"
    local annotation="$4"
    local tech_stack="${5:-TBD}"
    local commit_msg="$6"

    # Create directory structure
    mkdir -p "$target_dir"/{memories,logs,docs,projects}
    mkdir -p "$target_dir/docs"/{ceo,cto,critic,product,ui,interaction,fullstack,qa,devops,marketing,operations,sales,cfo,research}
    mkdir -p "$target_dir/.claude/agents"
    mkdir -p "$target_dir/.claude/skills/team"

    # Copy core scripts
    for script in auto-loop.sh stop-loop.sh monitor.sh; do
        if [ -f "$PROJECT_DIR/$script" ]; then
            cp "$PROJECT_DIR/$script" "$target_dir/$script"
            chmod +x "$target_dir/$script"
            echo "  copied $script"
        fi
    done

    # Copy agent definitions
    if [ -d "$PROJECT_DIR/.claude/agents" ]; then
        cp "$PROJECT_DIR/.claude/agents/"*.md "$target_dir/.claude/agents/" 2>/dev/null || true
        local agent_count
        agent_count=$(ls "$target_dir/.claude/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')
        echo "  copied $agent_count agent definitions"
    fi

    # Copy team skill
    if [ -f "$PROJECT_DIR/.claude/skills/team/SKILL.md" ]; then
        cp "$PROJECT_DIR/.claude/skills/team/SKILL.md" "$target_dir/.claude/skills/team/SKILL.md"
        echo "  copied team skill"
    fi

    # Copy VERSION
    cp "$PROJECT_DIR/VERSION" "$target_dir/VERSION" 2>/dev/null || echo "1.0.1" > "$target_dir/VERSION"

    # Build consensus annotation strings
    local cycle_note="Nothing yet -- this is a fresh auto-co project."
    local product_note="TBD"
    local question_note="the"
    if [ -n "$annotation" ]; then
        cycle_note="Nothing yet -- this is a fresh auto-co project ($annotation)."
        product_note="TBD ($annotation)"
        question_note="the ${annotation#template: }"
    fi

    # Create consensus (Day 0)
    cat > "$target_dir/memories/consensus.md" << CONSENSUS_EOF
# Auto Company Consensus

## Last Updated
(not yet started)

## Current Phase
Day 0

## What We Did This Cycle
${cycle_note}

## Key Decisions Made
(none)

## Active Projects
(none)

## Metrics
- Revenue: \$0
- Users: 0
- MRR: \$0
- Deployed Services: (none)
- Cost/month: \$0

## Next Action
${next_action}

## Company State
- Product: ${product_note}
- Tech Stack: ${tech_stack}
- Revenue: \$0
- Users: 0

## Human Escalation
- Pending Request: NO
- Last Response: N/A
- Awaiting Response Since: N/A

## Open Questions
- What specific product should we build within ${question_note} space?
- What market should we target?
CONSENSUS_EOF
    echo "  created memories/consensus.md"

    # Create empty escalation files
    echo "" > "$target_dir/memories/human-request.md"
    echo "" > "$target_dir/memories/human-response.md"
    echo "  created escalation files"

    # Create PROMPT.md
    cat > "$target_dir/PROMPT.md" << 'PROMPT_EOF'
# Auto-Co -- Autonomous Loop Prompt

You are Auto-Co's autonomous operating coordinator. Each time you are invoked, you drive one work cycle. No supervision, autonomous decisions, bold action.

## Work Cycle

### 1. Read Consensus

The current consensus is pre-loaded at the end of this prompt. If it's missing, read `memories/consensus.md`.

### 2. Check for Human Escalation Response

Before deciding on the cycle's action, check `memories/human-response.md`. If it contains a response:
- Read and incorporate the human's answer into your decision-making
- Clear the file after processing (write an empty string)
- Note in consensus that a human response was received and acted upon

### 3. Decide

- Clear Next Action exists -> execute it
- Active project in progress -> continue pushing forward (check `docs/*/` for outputs)
- Day 0, no direction -> CEO calls a strategy meeting
- Stuck -> change angle, narrow scope, or just ship it

Priority: **Ship > Plan > Discuss**

### 4. Form Team and Execute

Read `.claude/skills/team/SKILL.md` and follow the process to assemble a team for the task. Select 3-5 of the most relevant agents per cycle -- do not pull everyone in.

### 5. Update Consensus (Mandatory)

Before ending, you **must** update `memories/consensus.md`.

**Atomic write protocol:** Write to `memories/.consensus.tmp` first, then rename to `memories/consensus.md`.

## Convergence Rules (Mandatory)

1. **Cycle 1**: Brainstorm. Each agent proposes one idea. End by ranking top 3.
2. **Cycle 2**: Select #1. Critic runs Pre-Mortem, Research validates the market, CFO runs the numbers. Deliver a **GO / NO-GO** verdict.
3. **Cycle 3+**: GO -> create repo, start writing code. Discussion is **FORBIDDEN**. NO-GO -> try #2. If all fail, force-pick one and build it.
4. **Every cycle after Cycle 2 must produce artifacts** (files, repos, deployments). Pure discussion is forbidden.
5. **Same Next Action appearing 2 consecutive cycles** -> you are stalled. Change direction or narrow scope and ship immediately.

## Anti-Patterns (Never Do These)

- Endless brainstorming past Cycle 1
- "Let's research more" after Cycle 2
- Producing only documents with no code or deployments
- Waiting for perfect information
- Asking the human for routine decisions
- Repeating the same Next Action without progress
PROMPT_EOF
    echo "  created PROMPT.md"

    # Create CLAUDE.md
    cat > "$target_dir/CLAUDE.md" << CLAUDE_EOF
# Auto-Co -- Fully Autonomous AI Company

## Mission

${mission_text}

## Operating Mode

This is a **fully autonomous AI company** with no human involvement in daily decisions.

- **Do NOT wait for human approval** -- you are the decision-maker
- **Do NOT ask for human opinions** -- discuss internally as a team, then act
- **CEO (Bezos) is the ultimate decision-maker** -- when the team disagrees, CEO has final say
- **Munger is the only brake** -- every major decision must pass through him

## Safety Red Lines (Absolute -- Never Violate)

| Forbidden | Specifics |
|-----------|-----------|
| Delete GitHub repos | \`gh repo delete\` and any repo-deletion operations |
| Delete Vercel projects | \`vercel remove\` -- never delete projects/deployments |
| Delete Railway services | \`railway delete\` -- never delete services/projects |
| Reset Supabase databases | \`supabase db reset\` -- never wipe production data |
| Delete system files | \`rm -rf /\`, do not touch \`~/.ssh/\`, \`~/.config/\`, \`~/.claude/\` |
| Illegal activity | Fraud, copyright infringement, data theft, unauthorized access |
| Leak credentials | API keys/tokens/passwords must never enter public repos or logs |
| Force push main | \`git push --force\` to main/master |
| Destructive git ops | \`git reset --hard\` only on temporary branches |

## Team Architecture

14 AI Agents defined in \`.claude/agents/\`. See agent files for full role definitions.

## Decision Principles

1. **Ship > Plan > Discuss** -- if you can ship it, don't discuss it
2. **Act on 70% information** -- waiting for 90% means you're already too slow
3. **Customer obsession** -- start from real needs
4. **Simplicity first** -- if one person can do it, don't split it
5. **Ramen profitability** -- the first goal is revenue, not users
6. **Boring technology** -- mature, stable tech unless new tech offers 10x advantage
7. **Monolith first** -- get it running, split when needed

## Shared Memory

- **\`memories/consensus.md\`** -- cross-cycle relay baton
- **\`memories/human-request.md\`** -- outbound escalation requests
- **\`memories/human-response.md\`** -- inbound responses from the human
- **\`docs/<role>/\`** -- each Agent's work output
- **\`projects/\`** -- all new projects

## Human Escalation Protocol

When truly necessary (spending money, legal questions, credentials):
1. CEO writes request to \`memories/human-request.md\`
2. If no response within 2 cycles, make autonomous decision and note it
CLAUDE_EOF
    echo "  created CLAUDE.md"

    # Create .gitignore
    cat > "$target_dir/.gitignore" << 'GITIGNORE_EOF'
# Auto-Co
.auto-loop.pid
.auto-loop-stop
.auto-loop-paused
.auto-loop-state
logs/cycle-*.log
logs/auto-loop.log*
memories/.consensus.tmp

# Dependencies
node_modules/
.next/
out/

# Environment
.env
.env.local
.env*.local

# OS
.DS_Store
Thumbs.db
GITIGNORE_EOF
    echo "  created .gitignore"

    # Init git repo if not already one
    if [ ! -d "$target_dir/.git" ]; then
        (cd "$target_dir" && git init -q && git add -A && git commit -q -m "$commit_msg")
        echo "  initialized git repository"
    fi
}

# === Init flag (scaffold a new auto-co project) ===

if [ "${1:-}" = "--init" ]; then
    TARGET_DIR="${2:-}"
    if [ -z "$TARGET_DIR" ]; then
        echo "Usage: ./auto-loop.sh --init <project-directory>"
        echo ""
        echo "Scaffolds a new auto-co project with all necessary files."
        echo "Example: ./auto-loop.sh --init ~/Projects/my-ai-company"
        exit 1
    fi

    # Resolve to absolute path
    if [[ "$TARGET_DIR" != /* ]]; then
        TARGET_DIR="$(pwd)/$TARGET_DIR"
    fi

    if [ -f "$TARGET_DIR/auto-loop.sh" ]; then
        echo "Error: $TARGET_DIR already contains an auto-co project (auto-loop.sh exists)."
        exit 1
    fi

    echo "=== Scaffolding new auto-co project ==="
    echo "Target: $TARGET_DIR"
    echo ""

    scaffold_project \
        "$TARGET_DIR" \
        "**Define your mission here.** This auto-co instance will work autonomously toward this goal." \
        "**Cycle 1: CEO calls a strategy meeting to decide what to build.**" \
        "" \
        "TBD" \
        "chore: scaffold auto-co project via --init"

    echo ""
    echo "=== Auto-Co project scaffolded successfully! ==="
    echo ""
    echo "Next steps:"
    echo "  1. cd $TARGET_DIR"
    echo "  2. Edit CLAUDE.md -- set your mission and customize"
    echo "  3. Run: ./auto-loop.sh --selftest"
    echo "  4. Run: ./auto-loop.sh"
    echo ""
    echo "The AI team will hold a strategy meeting in Cycle 1"
    echo "and start building by Cycle 3."
    exit 0
fi

# === Template flag (scaffold from pre-built templates) ===

if [ "${1:-}" = "--template" ]; then
    TEMPLATES_DIR="$PROJECT_DIR/templates"

    # List available templates
    if [ -z "${2:-}" ] || [ "${2:-}" = "list" ]; then
        echo "=== Available Templates ==="
        echo ""
        if [ ! -d "$TEMPLATES_DIR" ] || [ -z "$(ls -d "$TEMPLATES_DIR"/*/ 2>/dev/null)" ]; then
            echo "No templates found in $TEMPLATES_DIR"
            echo ""
            echo "Create a template by adding a directory under templates/ with:"
            echo "  template.conf        -- NAME, DESCRIPTION, TECH_STACK, EXTRA_DIRS"
            echo "  mission.md           -- Mission statement for CLAUDE.md"
            echo "  consensus-next-action.md  -- Initial Next Action for consensus"
            exit 1
        fi
        for tpl_dir in "$TEMPLATES_DIR"/*/; do
            tpl_name="$(basename "$tpl_dir")"
            if [ -f "$tpl_dir/template.conf" ]; then
                # shellcheck source=/dev/null
                source "$tpl_dir/template.conf"
                printf "  %-16s %s\n" "$tpl_name" "${DESCRIPTION:-No description}"
                printf "  %-16s Tech: %s\n" "" "${TECH_STACK:-unspecified}"
                echo ""
            else
                printf "  %-16s (no template.conf)\n" "$tpl_name"
                echo ""
            fi
        done
        echo "Usage: ./auto-loop.sh --template <name> <project-directory>"
        echo "Example: ./auto-loop.sh --template saas ~/Projects/my-saas"
        exit 0
    fi

    TPL_NAME="${2:-}"
    TARGET_DIR="${3:-}"

    # Validate template exists
    TPL_DIR="$TEMPLATES_DIR/$TPL_NAME"
    if [ ! -d "$TPL_DIR" ] || [ ! -f "$TPL_DIR/template.conf" ]; then
        echo "Error: Template '$TPL_NAME' not found."
        echo ""
        echo "Available templates:"
        for tpl_dir in "$TEMPLATES_DIR"/*/; do
            [ -f "$tpl_dir/template.conf" ] && echo "  $(basename "$tpl_dir")"
        done
        echo ""
        echo "Usage: ./auto-loop.sh --template <name> <project-directory>"
        exit 1
    fi

    # Validate target directory
    if [ -z "$TARGET_DIR" ]; then
        echo "Usage: ./auto-loop.sh --template <name> <project-directory>"
        echo ""
        echo "Example: ./auto-loop.sh --template $TPL_NAME ~/Projects/my-project"
        exit 1
    fi

    # Resolve to absolute path
    if [[ "$TARGET_DIR" != /* ]]; then
        TARGET_DIR="$(pwd)/$TARGET_DIR"
    fi

    if [ -f "$TARGET_DIR/auto-loop.sh" ]; then
        echo "Error: $TARGET_DIR already contains an auto-co project (auto-loop.sh exists)."
        exit 1
    fi

    # Load template config
    # shellcheck source=/dev/null
    source "$TPL_DIR/template.conf"

    echo "=== Scaffolding from template: ${NAME:-$TPL_NAME} ==="
    echo "Description: ${DESCRIPTION:-none}"
    echo "Tech stack:  ${TECH_STACK:-unspecified}"
    echo "Target:      $TARGET_DIR"
    echo ""

    # Create template-specific extra directories
    if [ -n "${EXTRA_DIRS:-}" ]; then
        mkdir -p "$TARGET_DIR"
        for dir in $EXTRA_DIRS; do
            mkdir -p "$TARGET_DIR/$dir"
            echo "  created $dir/"
        done
    fi

    # Read template mission
    TPL_MISSION="**Define your mission here.**"
    if [ -f "$TPL_DIR/mission.md" ]; then
        TPL_MISSION="$(cat "$TPL_DIR/mission.md")"
    fi

    # Read template next action
    TPL_NEXT_ACTION="**Cycle 1: CEO calls a strategy meeting to decide what to build.**"
    if [ -f "$TPL_DIR/consensus-next-action.md" ]; then
        TPL_NEXT_ACTION="$(cat "$TPL_DIR/consensus-next-action.md")"
    fi

    scaffold_project \
        "$TARGET_DIR" \
        "$TPL_MISSION" \
        "$TPL_NEXT_ACTION" \
        "template: $TPL_NAME" \
        "${TECH_STACK:-TBD}" \
        "chore: scaffold auto-co project from template '$TPL_NAME'"

    # Copy templates directory so the new project can also scaffold
    if [ -d "$TEMPLATES_DIR" ]; then
        cp -r "$TEMPLATES_DIR" "$TARGET_DIR/templates"
        echo "  copied templates/"
    fi

    echo ""
    echo "=== Auto-Co project scaffolded from '$TPL_NAME' template! ==="
    echo ""
    echo "Next steps:"
    echo "  1. cd $TARGET_DIR"
    echo "  2. Review CLAUDE.md -- customize the mission if needed"
    echo "  3. Run: ./auto-loop.sh --selftest"
    echo "  4. Run: ./auto-loop.sh"
    echo ""
    echo "The AI team will start working from the $TPL_NAME template"
    echo "and begin building by Cycle 3."
    exit 0
fi

# === Watch flag (alias for monitor.sh --dashboard) ===

if [ "${1:-}" = "--watch" ] || [ "${1:-}" = "-w" ]; then
    exec "$SCRIPT_DIR/monitor.sh" --dashboard
fi

# === Pause flag (create pause file to skip cycles) ===

if [ "${1:-}" = "--pause" ]; then
    touch "$PAUSE_FILE"
    echo "Loop paused. Cycles will be skipped until resumed."
    echo "Resume with: ./auto-loop.sh --resume"
    exit 0
fi

# === Resume flag (remove pause file to resume cycles) ===

if [ "${1:-}" = "--resume" ]; then
    if [ -f "$PAUSE_FILE" ]; then
        rm -f "$PAUSE_FILE"
        echo "Loop resumed. Next cycle will run normally."
    else
        echo "Loop is not paused."
    fi
    exit 0
fi

# === Schedule flag (generate launchd plist or crontab entry) ===

if [ "${1:-}" = "--schedule" ]; then
    INTERVAL_MINUTES="${2:-30}"
    # Validate interval
    if ! echo "$INTERVAL_MINUTES" | grep -qE '^[0-9]+$' || [ "$INTERVAL_MINUTES" -lt 1 ]; then
        echo "Error: interval must be a positive integer (minutes)."
        echo "Usage: ./auto-loop.sh --schedule [MINUTES] [--cron|--launchd|--systemd]"
        echo "  Default: 30 minutes, auto-detects platform"
        exit 1
    fi

    MODE="${3:-auto}"
    if [ "$MODE" = "auto" ]; then
        case "$(uname -s)" in
            Darwin) MODE="--launchd" ;;
            Linux)
                if command -v systemctl &>/dev/null; then
                    MODE="--systemd"
                else
                    MODE="--cron"
                fi
                ;;
            *) MODE="--cron" ;;
        esac
    fi

    PLIST_LABEL="com.auto-co.loop"
    PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
    INTERVAL_SECONDS=$((INTERVAL_MINUTES * 60))

    case "$MODE" in
        --launchd)
            cat <<LAUNCHD_EOF
=== launchd plist (macOS) ===

Save to: $PLIST_PATH

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${PROJECT_DIR}/auto-loop.sh</string>
        <string>--cycles</string>
        <string>1</string>
    </array>
    <key>StartInterval</key>
    <integer>${INTERVAL_SECONDS}</integer>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>StandardOutPath</key>
    <string>${LOG_DIR}/launchd-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/launchd-stderr.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>

Install:
  mkdir -p ~/Library/LaunchAgents
  cp <saved-file> $PLIST_PATH
  launchctl load $PLIST_PATH

Uninstall:
  launchctl unload $PLIST_PATH
  rm $PLIST_PATH
LAUNCHD_EOF
            ;;

        --cron)
            # Convert minutes to cron expression
            if [ "$INTERVAL_MINUTES" -lt 60 ]; then
                CRON_EXPR="*/${INTERVAL_MINUTES} * * * *"
            else
                HOURS=$((INTERVAL_MINUTES / 60))
                CRON_EXPR="0 */${HOURS} * * *"
            fi
            cat <<CRON_EOF
=== crontab entry (Linux/macOS) ===

Add with: crontab -e

${CRON_EXPR} cd ${PROJECT_DIR} && ./auto-loop.sh --cycles 1 >> ${LOG_DIR}/cron.log 2>&1

To install automatically:
  (crontab -l 2>/dev/null; echo "${CRON_EXPR} cd ${PROJECT_DIR} && ./auto-loop.sh --cycles 1 >> ${LOG_DIR}/cron.log 2>&1") | crontab -

To remove:
  crontab -l | grep -v 'auto-loop.sh' | crontab -
CRON_EOF
            ;;

        --systemd)
            UNIT_NAME="auto-co-loop"
            cat <<SYSTEMD_EOF
=== systemd timer (Linux) ===

Save service to: /etc/systemd/system/${UNIT_NAME}.service

[Unit]
Description=Auto-Co autonomous loop (single cycle)
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=${PROJECT_DIR}
ExecStart=${PROJECT_DIR}/auto-loop.sh --cycles 1
User=$(whoami)
Environment=PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target

---

Save timer to: /etc/systemd/system/${UNIT_NAME}.timer

[Unit]
Description=Run Auto-Co every ${INTERVAL_MINUTES} minutes

[Timer]
OnBootSec=5min
OnUnitActiveSec=${INTERVAL_MINUTES}min
Persistent=true

[Install]
WantedBy=timers.target

---

Install:
  sudo systemctl daemon-reload
  sudo systemctl enable --now ${UNIT_NAME}.timer

Check status:
  systemctl status ${UNIT_NAME}.timer
  journalctl -u ${UNIT_NAME}.service -f

Uninstall:
  sudo systemctl disable --now ${UNIT_NAME}.timer
  sudo rm /etc/systemd/system/${UNIT_NAME}.{service,timer}
  sudo systemctl daemon-reload
SYSTEMD_EOF
            ;;

        *)
            echo "Unknown mode: $MODE"
            echo "Usage: ./auto-loop.sh --schedule [MINUTES] [--cron|--launchd|--systemd]"
            exit 1
            ;;
    esac
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
    echo "MAX_CYCLES:             ${MAX_CYCLES:-0} (0 = unlimited)"
    echo "NOTIFY_URL:             ${NOTIFY_URL:-disabled}"
    echo "WEBHOOK_URL:            ${WEBHOOK_URL:-disabled}"
    echo "PLUGIN_DIR:             ${PLUGIN_DIR:-disabled}"
    echo "PARALLEL_DIR:           ${PARALLEL_DIR:-disabled}"
    echo ""
    echo "--- Adaptive Frequency ---"
    echo "IDLE_INTERVAL:          ${IDLE_INTERVAL}s (0 = disabled)"
    echo ""
    echo "--- Memory & State ---"
    echo "STATE_DIR:              $STATE_DIR"
    echo "SUMMARY_ENABLED:        $SUMMARY_ENABLED"
    echo "QMD_ENABLED:            $QMD_ENABLED"
    echo "QMD installed:          $(command -v qmd &>/dev/null && echo 'yes' || echo 'no')"
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

# === Env flag (generate .env.example template) ===

if [ "${1:-}" = "--env" ] || [ "${1:-}" = "-e" ]; then
    TARGET="${2:-.env.example}"
    if [ -f "$TARGET" ] && [ "${3:-}" != "--force" ]; then
        echo "File '$TARGET' already exists. Use --force as third arg to overwrite."
        echo "  ./auto-loop.sh --env $TARGET --force"
        exit 1
    fi
    cat > "$TARGET" << 'ENVEOF'
# ============================================================
# Auto-Co Configuration
# ============================================================
# Copy this file to .env and adjust values as needed.
# All variables are optional -- defaults are shown.
# ============================================================

# --- Claude Model ---
# Which Claude model to use for each cycle.
# Options: opus, sonnet, haiku
# MODEL=opus

# --- Loop Timing ---
# Seconds to wait between cycles.
# LOOP_INTERVAL=120

# Max seconds a single cycle can run before being force-killed.
# CYCLE_TIMEOUT_SECONDS=1800

# --- Error Handling ---
# How many consecutive errors before the circuit breaker trips.
# MAX_CONSECUTIVE_ERRORS=3

# Seconds to wait after circuit breaker trips before retrying.
# COOLDOWN_SECONDS=300

# Seconds to wait when hitting API usage limits.
# LIMIT_WAIT_SECONDS=3600

# Initial backoff (seconds) on transient failure. Doubles each retry.
# RETRY_BASE_SECONDS=30

# Maximum backoff cap (seconds).
# RETRY_MAX_SECONDS=600

# --- Cycle Limits ---
# Max cycles to run before auto-stopping (0 = unlimited).
# MAX_CYCLES=0

# --- Log Management ---
# Maximum number of cycle log files to keep.
# MAX_LOGS=200

# --- Notifications ---
# Webhook URL to POST JSON notifications after each cycle.
# Receives: {cycle, status, cost, duration_s, model, total_cost, timestamp}
# Leave empty to disable.
# NOTIFY_URL=

# Event-based webhook URL — POST JSON on lifecycle events (start, end, error, circuit break).
# WEBHOOK_URL=

# --- Plugins ---
# Directory containing lifecycle hook scripts (pre-cycle.sh, post-cycle.sh).
# Scripts receive context via AUTO_CO_* environment variables.
# Leave empty to disable.
# PLUGIN_DIR=

# --- Parallel Sessions ---
# Directory containing .md prompt files to run as parallel Claude sessions.
# Each .md file runs alongside the main cycle as an independent session.
# Leave empty to disable.
# PARALLEL_DIR=

# --- Adaptive Frequency ---
# Seconds to sleep when no changes detected between cycles (default: 600 = 10 min).
# Set to 0 to disable adaptive frequency (always use LOOP_INTERVAL).
# IDLE_INTERVAL=600

# --- Memory & State ---
# Enable QMD semantic search integration.
# QMD_ENABLED=true

# Directory for structured state files (decisions, tasks, metrics, artifacts).
# STATE_DIR=state

# Enable cycle log summaries in logs/summaries/.
# SUMMARY_ENABLED=true

# --- Advanced ---
# Enable Agent Teams (experimental). Set by auto-loop.sh automatically.
# CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
ENVEOF
    echo "Generated $TARGET with all configuration options."
    echo "Copy to .env and uncomment the values you want to change."
    exit 0
fi

# === Snapshot flag (create timestamped tarball of project state) ===

if [ "${1:-}" = "--snapshot" ] || [ "${1:-}" = "-S" ]; then
    SNAP_DIR="snapshots"
    TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
    VERSION_STR="$(cat VERSION 2>/dev/null || echo 'unknown')"
    SNAP_NAME="auto-co-snapshot-${VERSION_STR}-${TIMESTAMP}.tar.gz"
    SNAP_PATH="${2:-${SNAP_DIR}/${SNAP_NAME}}"

    # If user gave a directory (ends with /), append default filename
    if [ "${SNAP_PATH: -1}" = "/" ]; then
        SNAP_PATH="${SNAP_PATH}${SNAP_NAME}"
    fi

    if ! create_project_snapshot "$SNAP_PATH"; then
        echo "Error: No project files found to snapshot."
        exit 1
    fi

    SIZE="$(du -h "$SNAP_PATH" | cut -f1)"
    echo "Snapshot created: $SNAP_PATH ($SIZE)"
    echo "Contents:"
    tar -tzf "$SNAP_PATH" | head -20
    TOTAL="$(tar -tzf "$SNAP_PATH" | wc -l | tr -d ' ')"
    if [ "$TOTAL" -gt 20 ]; then
        echo "... and $((TOTAL - 20)) more files"
    fi
    exit 0
fi

# === Diff flag (compare two snapshots) ===

if [ "${1:-}" = "--diff" ]; then
    if [ -z "${2:-}" ] || [ -z "${3:-}" ]; then
        echo "Usage: ./auto-loop.sh --diff <snapshot-a> <snapshot-b>"
        echo "Compare two snapshot tarballs and show what changed."
        exit 1
    fi
    SNAP_A="$2"
    SNAP_B="$3"

    for f in "$SNAP_A" "$SNAP_B"; do
        if [ ! -f "$f" ]; then
            echo "Error: Snapshot not found: $f"
            exit 1
        fi
    done

    # Create temp dirs for extraction
    DIFF_TMP="$(mktemp -d)"
    trap 'rm -rf "$DIFF_TMP"' EXIT
    mkdir -p "$DIFF_TMP/a" "$DIFF_TMP/b"

    tar -xzf "$SNAP_A" -C "$DIFF_TMP/a" 2>/dev/null
    tar -xzf "$SNAP_B" -C "$DIFF_TMP/b" 2>/dev/null

    # Get file lists
    (cd "$DIFF_TMP/a" && find . -type f | sort) > "$DIFF_TMP/files_a.txt"
    (cd "$DIFF_TMP/b" && find . -type f | sort) > "$DIFF_TMP/files_b.txt"

    # Files only in A (removed)
    REMOVED="$(comm -23 "$DIFF_TMP/files_a.txt" "$DIFF_TMP/files_b.txt")"
    # Files only in B (added)
    ADDED="$(comm -13 "$DIFF_TMP/files_a.txt" "$DIFF_TMP/files_b.txt")"
    # Files in both (check for modifications)
    COMMON="$(comm -12 "$DIFF_TMP/files_a.txt" "$DIFF_TMP/files_b.txt")"

    MODIFIED=""
    while IFS= read -r file; do
        [ -z "$file" ] && continue
        if ! diff -q "$DIFF_TMP/a/$file" "$DIFF_TMP/b/$file" &>/dev/null; then
            MODIFIED="${MODIFIED}${file}\n"
        fi
    done <<< "$COMMON"

    echo "=== Snapshot Diff ==="
    echo "A: $(basename "$SNAP_A")"
    echo "B: $(basename "$SNAP_B")"
    echo ""

    ADD_COUNT=0; REM_COUNT=0; MOD_COUNT=0

    if [ -n "$ADDED" ]; then
        echo "--- Added (in B, not in A) ---"
        while IFS= read -r f; do
            [ -n "$f" ] && echo "  + ${f#./}" && ADD_COUNT=$((ADD_COUNT + 1))
        done <<< "$ADDED"
        echo ""
    fi

    if [ -n "$REMOVED" ]; then
        echo "--- Removed (in A, not in B) ---"
        while IFS= read -r f; do
            [ -n "$f" ] && echo "  - ${f#./}" && REM_COUNT=$((REM_COUNT + 1))
        done <<< "$REMOVED"
        echo ""
    fi

    if [ -n "$MODIFIED" ]; then
        echo "--- Modified ---"
        while IFS= read -r f; do
            [ -n "$f" ] && echo "  ~ ${f#./}" && MOD_COUNT=$((MOD_COUNT + 1))
        done <<< "$(echo -e "$MODIFIED")"
        echo ""
    fi

    TOTAL_A="$(wc -l < "$DIFF_TMP/files_a.txt" | tr -d ' ')"
    TOTAL_B="$(wc -l < "$DIFF_TMP/files_b.txt" | tr -d ' ')"
    echo "Summary: ${ADD_COUNT} added, ${REM_COUNT} removed, ${MOD_COUNT} modified"
    echo "Total files: A=${TOTAL_A}, B=${TOTAL_B}"
    exit 0
fi

# === Restore flag (unpack a snapshot over the current project) ===

if [ "${1:-}" = "--restore" ]; then
    if [ -z "${2:-}" ]; then
        echo "Usage: ./auto-loop.sh --restore <snapshot.tar.gz> [--backup] [--force]"
        echo "Restore project state from a snapshot tarball."
        echo ""
        echo "Options:"
        echo "  --backup   Create a snapshot of current state before restoring"
        echo "  --force    Skip confirmation prompt"
        exit 1
    fi
    SNAP_FILE="$2"
    DO_BACKUP=false
    FORCE_RESTORE=false
    shift 2
    while [ $# -gt 0 ]; do
        case "$1" in
            --backup) DO_BACKUP=true ;;
            --force)  FORCE_RESTORE=true ;;
            *) echo "Unknown option: $1"; exit 1 ;;
        esac
        shift
    done

    if [ ! -f "$SNAP_FILE" ]; then
        echo "Error: Snapshot not found: $SNAP_FILE"
        exit 1
    fi

    # Show what will be overwritten
    echo "=== Restore Preview ==="
    echo "Snapshot: $(basename "$SNAP_FILE")"
    echo ""
    echo "Files to be restored:"
    if ! show_tarball_preview "$SNAP_FILE"; then
        exit 1
    fi

    if [ "$FORCE_RESTORE" != true ]; then
        echo ""
        printf "Proceed with restore? [y/N] "
        read -r CONFIRM
        if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
            echo "Restore cancelled."
            exit 0
        fi
    fi

    # Backup current state before restoring (if requested)
    if [ "$DO_BACKUP" = true ]; then
        BACKUP_DIR="snapshots"
        BACKUP_TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
        BACKUP_VERSION="$(cat VERSION 2>/dev/null || echo 'unknown')"
        BACKUP_NAME="auto-co-pre-restore-${BACKUP_VERSION}-${BACKUP_TIMESTAMP}.tar.gz"
        BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

        if create_project_snapshot "$BACKUP_PATH"; then
            BACKUP_SIZE="$(du -h "$BACKUP_PATH" | cut -f1)"
            echo "Backup created: $BACKUP_PATH ($BACKUP_SIZE)"
            echo ""
        else
            echo "Warning: No project files found to backup."
        fi
    fi

    # Extract snapshot over current directory
    tar -xzf "$SNAP_FILE" 2>/dev/null
    echo ""
    echo "Restored $(echo "$SNAP_FILES" | grep -cv '/$' | tr -d ' ') files from $(basename "$SNAP_FILE")"
    exit 0
fi

# === Rollback flag (quick undo: restore from most recent pre-restore backup) ===

if [ "${1:-}" = "--rollback" ]; then
    SNAP_DIR="snapshots"
    FORCE_ROLLBACK=false
    [ "${2:-}" = "--force" ] && FORCE_ROLLBACK=true

    if [ ! -d "$SNAP_DIR" ]; then
        echo "Error: No snapshots directory found."
        exit 1
    fi

    # Find the most recent pre-restore backup
    LATEST_BACKUP="$(ls -1t "$SNAP_DIR"/auto-co-pre-restore-*.tar.gz 2>/dev/null | head -1 || true)"

    if [ -z "$LATEST_BACKUP" ]; then
        echo "Error: No pre-restore backups found in $SNAP_DIR/"
        echo "Backups are created when you use: ./auto-loop.sh --restore SNAP --backup"
        exit 1
    fi

    echo "=== Rollback ==="
    echo "Found backup: $(basename "$LATEST_BACKUP")"
    SIZE="$(du -h "$LATEST_BACKUP" | cut -f1)"
    echo "Size: $SIZE"
    echo ""

    # Show contents preview
    echo "Files to be restored:"
    if ! show_tarball_preview "$LATEST_BACKUP"; then
        exit 1
    fi

    if [ "$FORCE_ROLLBACK" != true ]; then
        echo ""
        printf "Proceed with rollback? [y/N] "
        read -r CONFIRM
        if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
            echo "Rollback cancelled."
            exit 0
        fi
    fi

    tar -xzf "$LATEST_BACKUP" 2>/dev/null
    echo ""
    echo "Rolled back $(echo "$SNAP_FILES" | grep -cv '/$' | tr -d ' ') files from $(basename "$LATEST_BACKUP")"
    exit 0
fi

# === Metrics flag (quick KPI dashboard from cycle history) ===

if [ "${1:-}" = "--metrics" ]; then
    if [ ! -f "$CYCLE_HISTORY_FILE" ]; then
        echo "No cycle history found at $CYCLE_HISTORY_FILE"
        exit 1
    fi
    if ! command -v jq &>/dev/null; then
        echo "Error: jq is required for --metrics. Install: brew install jq"
        exit 1
    fi
    jq -s '
        if length == 0 then "No cycle data.\n" | halt_error
        else
            {
                total_cycles: length,
                successful: ([.[] | select(.status == "ok")] | length),
                failed: ([.[] | select(.status != "ok")] | length),
                success_rate: (([.[] | select(.status == "ok")] | length) / length * 100),
                total_cost: ([.[].cost] | add),
                avg_cost: (([.[].cost] | add) / length),
                avg_duration_s: (([.[].duration_s] | add) / length),
                total_duration_h: (([.[].duration_s] | add) / 3600),
                min_cost: ([.[].cost] | min),
                max_cost: ([.[].cost] | max),
                min_duration: ([.[].duration_s] | min),
                max_duration: ([.[].duration_s] | max),
                first_cycle: (.[0].timestamp),
                last_cycle: (.[-1].timestamp)
            }
        end
    ' "$CYCLE_HISTORY_FILE" | jq -r '
        "=== Auto-Co Metrics Dashboard ===",
        "",
        "--- Cycles ---",
        "Total cycles:      \(.total_cycles)",
        "Successful:        \(.successful)",
        "Failed:            \(.failed)",
        "Success rate:      \(.success_rate | tostring | .[0:5])%",
        "",
        "--- Cost ---",
        "Total cost:        $\(.total_cost | tostring | .[0:8])",
        "Avg per cycle:     $\(.avg_cost | tostring | .[0:6])",
        "Min cycle cost:    $\(.min_cost | tostring | .[0:6])",
        "Max cycle cost:    $\(.max_cost | tostring | .[0:6])",
        "",
        "--- Duration ---",
        "Avg per cycle:     \(.avg_duration_s | floor)s",
        "Min cycle:         \(.min_duration)s",
        "Max cycle:         \(.max_duration)s",
        "Total runtime:     \(.total_duration_h | tostring | .[0:5])h",
        "",
        "--- Timeline ---",
        "First cycle:       \(.first_cycle)",
        "Last cycle:        \(.last_cycle)"
    '
    exit 0
fi

# === Agent flag (run a single named agent ad-hoc) ===

if [ "${1:-}" = "--agent" ]; then
    AGENTS_DIR="$PROJECT_DIR/.claude/agents"

    # List available agents
    if [ -z "${2:-}" ] || [ "${2:-}" = "list" ]; then
        echo "=== Available Agents ==="
        echo ""
        if [ ! -d "$AGENTS_DIR" ] || [ -z "$(ls "$AGENTS_DIR"/*.md 2>/dev/null)" ]; then
            echo "No agents found in $AGENTS_DIR"
            exit 1
        fi
        for agent_file in "$AGENTS_DIR"/*.md; do
            agent_name="$(basename "$agent_file" .md)"
            agent_desc=$(sed -n 's/^description: *"\(.*\)"/\1/p' "$agent_file" | head -1)
            printf "  %-24s %s\n" "$agent_name" "${agent_desc:-No description}"
        done
        echo ""
        echo "Usage: ./auto-loop.sh --agent <name> \"<prompt>\""
        echo "Example: ./auto-loop.sh --agent ceo-bezos \"evaluate pricing strategy\""
        exit 0
    fi

    AGENT_NAME="$2"
    AGENT_FILE="$AGENTS_DIR/${AGENT_NAME}.md"

    if [ ! -f "$AGENT_FILE" ]; then
        echo "Error: Agent '$AGENT_NAME' not found."
        echo ""
        echo "Available agents:"
        for agent_file in "$AGENTS_DIR"/*.md; do
            echo "  $(basename "$agent_file" .md)"
        done
        echo ""
        echo "Usage: ./auto-loop.sh --agent <name> \"<prompt>\""
        exit 1
    fi

    AGENT_PROMPT="${3:-}"
    if [ -z "$AGENT_PROMPT" ]; then
        echo "Usage: ./auto-loop.sh --agent <name> \"<prompt>\""
        echo ""
        echo "Example: ./auto-loop.sh --agent $AGENT_NAME \"evaluate pricing strategy\""
        exit 1
    fi

    # Build the full prompt: agent definition + consensus context + user prompt
    AGENT_CONTENT=$(cat "$AGENT_FILE")
    CONSENSUS_CONTENT=""
    if [ -f "$CONSENSUS_FILE" ]; then
        CONSENSUS_CONTENT=$(cat "$CONSENSUS_FILE")
    fi

    FULL_PROMPT="$(cat <<AGENTEOF
You are being invoked as a single agent outside the auto-co loop.

## Your Agent Definition

$AGENT_CONTENT

## Current Company State

$CONSENSUS_CONTENT

## Task

$AGENT_PROMPT

Respond directly and actionably. This is a one-shot invocation -- give your complete analysis or output in this single response.
AGENTEOF
)"

    echo "=== Running Agent: $AGENT_NAME ==="
    echo "Prompt: $AGENT_PROMPT"
    echo "Model: $MODEL"
    echo ""

    # Run claude with the agent prompt
    cd "$PROJECT_DIR" && claude -p "$FULL_PROMPT" \
        --model "$MODEL" \
        --verbose \
        2>&1

    exit $?
fi

# === Dashboard flag (inline terminal dashboard) ===

if [ "${1:-}" = "--dashboard" ]; then
    if ! command -v jq &>/dev/null; then
        echo "Error: jq is required for --dashboard. Install: brew install jq"
        exit 1
    fi

    # --- Gather data ---
    # Loop state
    loop_status="unknown"; loop_count=0; last_run="N/A"; model_name="unknown"; total_cost_state=0
    if [ -f "$STATE_FILE" ]; then
        loop_status=$(grep '^STATUS=' "$STATE_FILE" 2>/dev/null | cut -d= -f2 || echo "unknown")
        loop_count=$(grep '^LOOP_COUNT=' "$STATE_FILE" 2>/dev/null | cut -d= -f2 || echo "0")
        last_run=$(grep '^LAST_RUN=' "$STATE_FILE" 2>/dev/null | cut -d= -f2- || echo "N/A")
        model_name=$(grep '^MODEL=' "$STATE_FILE" 2>/dev/null | cut -d= -f2 || echo "unknown")
        total_cost_state=$(grep '^TOTAL_COST=' "$STATE_FILE" 2>/dev/null | cut -d= -f2 || echo "0")
    fi

    # Loop running?
    loop_running="stopped"
    if [ -f "$PID_FILE" ]; then
        pid_val=$(cat "$PID_FILE")
        if kill -0 "$pid_val" 2>/dev/null; then
            loop_running="running"
        fi
    fi
    if [ -f "$PAUSE_FILE" ]; then
        loop_running="paused"
    fi

    # Cycle stats from history
    cycle_stats='{"total":0,"ok":0,"fail":0,"avg_cost":0,"avg_dur":0,"total_cost":0,"total_dur_h":0,"last5":[]}'
    if [ -f "$CYCLE_HISTORY_FILE" ]; then
        cycle_stats=$(jq -s '
            if length == 0 then
                {"total":0,"ok":0,"fail":0,"avg_cost":0,"avg_dur":0,"total_cost":0,"total_dur_h":0,"last5":[]}
            else
                {
                    total: length,
                    ok: ([.[] | select(.status == "ok")] | length),
                    fail: ([.[] | select(.status != "ok")] | length),
                    avg_cost: (([.[].cost] | add) / length * 100 | floor / 100),
                    avg_dur: (([.[].duration_s] | add) / length | floor),
                    total_cost: (([.[].cost] | add) * 100 | floor / 100),
                    total_dur_h: (([.[].duration_s] | add) / 3600 * 100 | floor / 100),
                    last5: [.[-5:][] | {c:.cycle, s:.status, cost:.cost, dur:.duration_s}]
                }
            end
        ' "$CYCLE_HISTORY_FILE" 2>/dev/null || echo "$cycle_stats")
    fi

    # Consensus data
    current_phase="Unknown"
    next_action="Unknown"
    active_projects=""
    if [ -f "$CONSENSUS_FILE" ]; then
        current_phase=$(grep '^## Current Phase' "$CONSENSUS_FILE" -A 1 2>/dev/null | tail -1 | sed 's/^[[:space:]]*//' || echo "Unknown")
        next_action=$(sed -n '/^## Next Action/,/^##/p' "$CONSENSUS_FILE" 2>/dev/null | grep -v '^##' | head -3 | sed 's/^[[:space:]]*//' | tr '\n' ' ' || echo "Unknown")
        active_projects=$(sed -n '/^## Active Projects/,/^##/p' "$CONSENSUS_FILE" 2>/dev/null | grep '^- ' | head -5 || echo "")
    fi

    # Agent activity from recent cycle logs
    latest_log=$(ls -t "$LOG_DIR"/cycle-*.log 2>/dev/null | head -1)
    agents_active=""
    if [ -n "$latest_log" ]; then
        agents_active=$(grep -oE '(ceo-bezos|cto-vogels|critic-munger|product-norman|ui-duarte|interaction-cooper|fullstack-dhh|qa-bach|devops-hightower|marketing-godin|operations-pg|sales-ross|cfo-campbell|research-thompson)' "$latest_log" 2>/dev/null | sort -u | tr '\n' ', ' | sed 's/,$//' || echo "")
    fi

    # --- Render dashboard ---
    # Colors
    BOLD="\033[1m"
    DIM="\033[2m"
    GREEN="\033[32m"
    RED="\033[31m"
    YELLOW="\033[33m"
    CYAN="\033[36m"
    BLUE="\033[34m"
    RESET="\033[0m"

    # Status color
    case "$loop_running" in
        running) status_color="${GREEN}" ;;
        paused)  status_color="${YELLOW}" ;;
        *)       status_color="${RED}" ;;
    esac

    width=60
    line=$(printf '%*s' "$width" '' | tr ' ' '─')
    dline=$(printf '%*s' "$width" '' | tr ' ' '═')

    printf "\n${BOLD}${CYAN}${dline}${RESET}\n"
    printf "${BOLD}${CYAN}  AUTO-CO DASHBOARD${RESET}\n"
    printf "${BOLD}${CYAN}${dline}${RESET}\n\n"

    # Loop status section
    printf "${BOLD}  LOOP STATUS${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    printf "  %-20s ${status_color}${BOLD}%-20s${RESET}\n" "State:" "$loop_running"
    printf "  %-20s %-20s\n" "Model:" "$model_name"
    printf "  %-20s %-20s\n" "Cycles run:" "$loop_count"
    printf "  %-20s %-20s\n" "Last run:" "$last_run"
    printf "  %-20s %-20s\n" "Phase:" "$current_phase"
    printf "\n"

    # Cost section
    tc=$(echo "$cycle_stats" | jq -r '.total_cost')
    ac=$(echo "$cycle_stats" | jq -r '.avg_cost')
    printf "${BOLD}  COST & PERFORMANCE${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    printf "  %-20s ${BOLD}\$%-19s${RESET}\n" "Total cost:" "$tc"
    printf "  %-20s \$%-19s\n" "Avg per cycle:" "$ac"
    total_h=$(echo "$cycle_stats" | jq -r '.total_dur_h')
    avg_d=$(echo "$cycle_stats" | jq -r '.avg_dur')
    printf "  %-20s %-20s\n" "Total runtime:" "${total_h}h"
    printf "  %-20s %-20s\n" "Avg cycle time:" "${avg_d}s"
    printf "\n"

    # Cycle stats
    total_c=$(echo "$cycle_stats" | jq -r '.total')
    ok_c=$(echo "$cycle_stats" | jq -r '.ok')
    fail_c=$(echo "$cycle_stats" | jq -r '.fail')
    if [ "$total_c" -gt 0 ]; then
        rate=$((ok_c * 100 / total_c))
    else
        rate=0
    fi
    printf "${BOLD}  CYCLE STATS${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    printf "  %-20s %-20s\n" "Total:" "$total_c"
    printf "  %-20s ${GREEN}%-20s${RESET}\n" "Successful:" "$ok_c"
    printf "  %-20s ${RED}%-20s${RESET}\n" "Failed:" "$fail_c"
    printf "  %-20s %-19s\n" "Success rate:" "${rate}%"

    # Progress bar
    if [ "$total_c" -gt 0 ]; then
        bar_width=30
        filled=$((rate * bar_width / 100))
        empty=$((bar_width - filled))
        bar_filled=$(printf '%*s' "$filled" '' | tr ' ' '█')
        bar_empty=$(printf '%*s' "$empty" '' | tr ' ' '░')
        printf "  %-20s ${GREEN}%s${DIM}%s${RESET} %s%%\n" "" "$bar_filled" "$bar_empty" "$rate"
    fi
    printf "\n"

    # Recent cycles
    printf "${BOLD}  RECENT CYCLES${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    printf "  ${DIM}%-8s %-8s %-10s %-10s${RESET}\n" "CYCLE" "STATUS" "COST" "TIME"
    echo "$cycle_stats" | jq -r '.last5[] | "  \(.c)\t\(.s)\t$\(.cost)\t\(.dur)s"' 2>/dev/null | \
        while IFS=$'\t' read -r cy st co du; do
            if [ "$st" = "ok" ]; then
                sc="${GREEN}"
            else
                sc="${RED}"
            fi
            printf "  %-8s ${sc}%-8s${RESET} %-10s %-10s\n" "$cy" "$st" "$co" "$du"
        done
    printf "\n"

    # Agent activity
    printf "${BOLD}  AGENT ACTIVITY (last cycle)${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    if [ -n "$agents_active" ]; then
        printf "  ${BLUE}%s${RESET}\n" "$agents_active"
    else
        printf "  ${DIM}No agent data available${RESET}\n"
    fi
    printf "\n"

    # Active projects
    printf "${BOLD}  ACTIVE PROJECTS${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    if [ -n "$active_projects" ]; then
        echo "$active_projects" | while IFS= read -r proj; do
            printf "  ${CYAN}%s${RESET}\n" "$proj"
        done
    else
        printf "  ${DIM}No active projects${RESET}\n"
    fi
    printf "\n"

    # Next action
    printf "${BOLD}  NEXT ACTION${RESET}\n"
    printf "  ${DIM}${line}${RESET}\n"
    printf "  ${YELLOW}%s${RESET}\n" "$next_action"
    printf "\n"

    printf "${BOLD}${CYAN}${dline}${RESET}\n"
    printf "${DIM}  Run at: $(date '+%Y-%m-%d %H:%M:%S')${RESET}\n\n"

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

# === Tail flag (follow main loop log in real-time) ===

if [ "${1:-}" = "--tail" ] || [ "${1:-}" = "-t" ]; then
    if [ -f "$LOG_DIR/auto-loop.log" ]; then
        echo "Following $LOG_DIR/auto-loop.log (Ctrl+C to stop)"
        tail -f "$LOG_DIR/auto-loop.log"
    else
        echo "No log file found at $LOG_DIR/auto-loop.log"
        exit 1
    fi
    exit 0
fi

# === Cycles flag (limit number of cycles) ===

if [ "${1:-}" = "--cycles" ] || [ "${1:-}" = "-c" ]; then
    if [ -z "${2:-}" ] || ! echo "$2" | grep -qE '^[0-9]+$' || [ "$2" -lt 1 ]; then
        echo "Usage: ./auto-loop.sh --cycles N  (N must be a positive integer)"
        echo ""
        echo "Run at most N cycles, then exit cleanly."
        echo "Example: ./auto-loop.sh --cycles 5  # run a quick 5-cycle burst"
        exit 1
    fi
    MAX_CYCLES="$2"
    shift 2
fi

# === Notify flag (webhook URL for cycle notifications) ===

if [ "${1:-}" = "--notify" ] || [ "${1:-}" = "-n" ]; then
    if [ -z "${2:-}" ]; then
        echo "Usage: ./auto-loop.sh --notify URL"
        echo ""
        echo "POST a JSON payload to URL after each cycle."
        echo "Payload: {cycle, status, cost, duration_s, model, total_cost, timestamp}"
        echo ""
        echo "Example: ./auto-loop.sh --notify https://hooks.example.com/auto-co"
        echo "Also: NOTIFY_URL=https://... ./auto-loop.sh"
        exit 1
    fi
    NOTIFY_URL="$2"
    shift 2
fi

# === Webhook flag (event-based notifications) ===

if [ "${1:-}" = "--webhook" ]; then
    if [ -z "${2:-}" ]; then
        echo "Usage: ./auto-loop.sh --webhook URL"
        echo ""
        echo "POST JSON payloads to URL on key lifecycle events."
        echo "Events: cycle.start, cycle.end, error, circuit_break, usage_limit"
        echo ""
        echo "Each payload includes: {event, timestamp, model, project, ...event-specific fields}"
        echo ""
        echo "Example: ./auto-loop.sh --webhook https://hooks.example.com/auto-co"
        echo "Also: WEBHOOK_URL=https://... ./auto-loop.sh"
        echo ""
        echo "Differs from --notify: --notify fires only on cycle end."
        echo "--webhook fires on all lifecycle events with typed payloads."
        exit 1
    fi
    WEBHOOK_URL="$2"
    shift 2
fi

# === Plugin flag (lifecycle hooks directory) ===

if [ "${1:-}" = "--plugin" ]; then
    if [ -z "${2:-}" ]; then
        echo "Usage: ./auto-loop.sh --plugin DIR"
        echo ""
        echo "Load lifecycle hook scripts from DIR."
        echo "Supported hooks (must be executable .sh files):"
        echo "  pre-cycle.sh   Runs before each cycle starts"
        echo "  post-cycle.sh  Runs after each cycle completes"
        echo ""
        echo "Hook scripts receive context via environment variables:"
        echo "  AUTO_CO_CYCLE          Current cycle number"
        echo "  AUTO_CO_STATUS         Cycle result (ok/fail, post-cycle only)"
        echo "  AUTO_CO_COST           Cycle cost in dollars (post-cycle only)"
        echo "  AUTO_CO_DURATION       Cycle duration in seconds (post-cycle only)"
        echo "  AUTO_CO_MODEL          Model name"
        echo "  AUTO_CO_PROJECT_DIR    Project root directory"
        echo "  AUTO_CO_LOG_DIR        Log directory path"
        echo "  AUTO_CO_CONSENSUS_FILE Path to consensus.md"
        echo ""
        echo "Example: ./auto-loop.sh --plugin ./plugins"
        echo "Also: PLUGIN_DIR=./plugins ./auto-loop.sh"
        exit 1
    fi
    if [ ! -d "$2" ]; then
        echo "Error: Plugin directory '$2' does not exist."
        exit 1
    fi
    PLUGIN_DIR="$2"
    shift 2
fi

# === Parallel flag (run multiple prompt files as parallel Claude sessions) ===

if [ "${1:-}" = "--parallel" ]; then
    if [ -z "${2:-}" ]; then
        echo "Usage: ./auto-loop.sh --parallel DIR"
        echo ""
        echo "Run .md prompt files from DIR as parallel Claude sessions alongside each cycle."
        echo "Each .md file in DIR becomes an independent Claude session that runs concurrently"
        echo "with the main cycle prompt."
        echo ""
        echo "Features:"
        echo "  - Each session gets its own log file (cycle-NNNN-parallel-<name>.log)"
        echo "  - Sessions share the same timeout as the main cycle"
        echo "  - Session costs are tracked and added to the total"
        echo "  - Failures in parallel sessions do not affect the main cycle"
        echo ""
        echo "Example:"
        echo "  mkdir parallel-prompts"
        echo "  echo 'Review and update project documentation.' > parallel-prompts/docs.md"
        echo "  echo 'Run all tests and fix failures.' > parallel-prompts/tests.md"
        echo "  ./auto-loop.sh --parallel ./parallel-prompts"
        echo ""
        echo "Also: PARALLEL_DIR=./parallel-prompts ./auto-loop.sh"
        exit 1
    fi
    if [ ! -d "$2" ]; then
        echo "Error: Parallel directory '$2' does not exist."
        exit 1
    fi
    PARALLEL_DIR="$2"
    shift 2
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
        log_size=$(stat -f%z "$LOG_DIR/auto-loop.log" 2>/dev/null || stat -c%s "$LOG_DIR/auto-loop.log" 2>/dev/null || echo 0)
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
    if [ -n "$PARALLEL_DIR" ]; then
        pcount=$(find "$PARALLEL_DIR" -maxdepth 1 -name '*.md' -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "Parallel dir: $PARALLEL_DIR ($pcount prompt files)"
    fi
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

    # 11. QMD search engine
    if command -v qmd &>/dev/null; then
        qmd_ver=$(qmd --version 2>/dev/null | head -1 || echo "unknown")
        check "QMD installed" 1 "$qmd_ver"
    else
        check "QMD installed" 0 "npm install -g @tobilu/qmd"
    fi

    # 12. State directory
    if [ -d "$PROJECT_DIR/$STATE_DIR" ]; then
        state_files=$(find "$PROJECT_DIR/$STATE_DIR" -name '*.jsonl' -type f 2>/dev/null | wc -l | tr -d ' ')
        check "State directory" 1 "$state_files JSONL files in $STATE_DIR/"
    else
        check "State directory" 0 "$STATE_DIR/ missing -- will be created on first run"
    fi

    # 13. Signal handling (verify trap is functional)
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

mkdir -p "$LOG_DIR" "$PROJECT_DIR/memories" "$PROJECT_DIR/$STATE_DIR"

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
QMD_TAG=""; [ "${QMD_ENABLED:-true}" = "true" ] && QMD_TAG=" | QMD: on"
log "Model: $MODEL | Interval: ${LOOP_INTERVAL}s | Idle: ${IDLE_INTERVAL}s | Timeout: ${CYCLE_TIMEOUT_SECONDS}s | Breaker: ${MAX_CONSECUTIVE_ERRORS} errors | Max cycles: ${MAX_CYCLES:-unlimited}${NOTIFY_URL:+ | Notify: $NOTIFY_URL}${WEBHOOK_URL:+ | Webhook: $WEBHOOK_URL}${PLUGIN_DIR:+ | Plugins: $PLUGIN_DIR}${PARALLEL_DIR:+ | Parallel: $PARALLEL_DIR}${QMD_TAG}"

# === Startup Banner (terminal only) ===
if [ -t 1 ]; then
    cat <<'BANNER'

    ___         __           ______
   /   | __  __/ /_____     / ____/___
  / /| |/ / / / __/ __ \   / /   / __ \
 / ___ / /_/ / /_/ /_/ /  / /___/ /_/ /
/_/  |_\__,_/\__/\____/   \____/\____/

BANNER
    printf "  Project:  %s\n" "$(basename "$PROJECT_DIR")"
    printf "  Model:    %s\n" "$MODEL"
    printf "  PID:      %s\n" "$$"
    if [ "$MAX_CYCLES" -gt 0 ] 2>/dev/null; then
        printf "  Cycles:   %s max\n" "$MAX_CYCLES"
    else
        printf "  Cycles:   unlimited\n"
    fi
    printf "  Interval: %ss between cycles\n" "$LOOP_INTERVAL"
    printf "  Timeout:  %ss per cycle\n" "$CYCLE_TIMEOUT_SECONDS"
    if [ "$loop_count" -gt 0 ]; then
        printf "  Resumed:  cycle %d, \$%.2f spent\n" "$loop_count" "$total_cost"
    fi
    echo ""
    echo "  Stop: ./stop-loop.sh or Ctrl+C"
    echo "  Logs: ./auto-loop.sh --tail"
    echo ""
    echo "  Starting cycle loop..."
    echo ""
fi

# === Main Loop ===

while true; do
    # Check for stop request
    if check_stop_requested; then
        log "Stop requested. Shutting down gracefully."
        cleanup
    fi

    # Check for pause
    if [ -f "$PAUSE_FILE" ]; then
        log "Loop is paused. Sleeping ${LOOP_INTERVAL}s... (resume with: ./auto-loop.sh --resume)"
        save_state "paused"
        sleep "$LOOP_INTERVAL"
        continue
    fi

    loop_count=$((loop_count + 1))
    cycle_log="$LOG_DIR/cycle-$(printf '%04d' $loop_count)-$(date '+%Y%m%d-%H%M%S').log"

    cycle_start_epoch=$(date +%s)
    if [ -t 1 ]; then
        echo ""
        printf "  %-60s\n" "$(printf '=%.0s' {1..56})"
        printf "  Cycle #%-4d                          %s\n" "$loop_count" "$(date '+%H:%M:%S')"
        printf "  %-60s\n" "$(printf '=%.0s' {1..56})"
        echo ""
    fi
    log_cycle $loop_count "START" "Beginning work cycle"
    save_state "running"
    send_webhook "cycle.start" "$loop_count"

    # Log rotation
    rotate_logs

    # Backup consensus before cycle (also used for diff logging)
    backup_consensus
    pre_cycle_consensus_hash=$(md5 -q "$CONSENSUS_FILE" 2>/dev/null || md5sum "$CONSENSUS_FILE" 2>/dev/null | cut -d' ' -f1 || echo "")

    # Run pre-cycle plugin hook
    run_plugin_hook "pre-cycle" "$loop_count"

    # Build prompt with consensus pre-injected
    PROMPT=$(cat "$PROMPT_FILE")
    CONSENSUS=$(cat "$CONSENSUS_FILE" 2>/dev/null || echo "No consensus file found. This is the very first cycle.")
    FULL_PROMPT="$PROMPT

---

## Current Consensus (pre-loaded, do NOT re-read this file)

$CONSENSUS

---

This is Cycle #$loop_count. Act decisively."

    # Launch parallel sessions (run alongside main cycle)
    launch_parallel_sessions "$loop_count"

    # Run Claude Code in headless mode with per-cycle timeout
    run_claude_cycle "$FULL_PROMPT"

    # Save full output to cycle log
    echo "$OUTPUT" > "$cycle_log"

    # Collect parallel session results (wait for any still running)
    collect_parallel_sessions

    # Extract result fields for status classification
    extract_cycle_metadata

    # Accumulate cost
    if [ -n "$CYCLE_COST" ] && echo "$CYCLE_COST" | grep -qE '^[0-9]+\.?[0-9]*$'; then
        total_cost=$(awk "BEGIN {printf \"%.4f\", $total_cost + $CYCLE_COST}")
    fi

    cycle_failed_reason=""
    post_cycle_consensus_hash=""
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
        if [ -t 1 ]; then
            mins=$((cycle_duration / 60))
            secs=$((cycle_duration % 60))
            printf "\n  Cycle #%d complete  |  %dm%ds  |  \$%s  |  \$%.2f total\n\n" \
                "$loop_count" "$mins" "$secs" "${CYCLE_COST:-?}" "$total_cost"
        fi
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
        send_notification "$loop_count" "ok" "${CYCLE_COST:-0}" "$cycle_duration"
        send_webhook "cycle.end" "$loop_count" "ok" "${CYCLE_COST:-0}" "$cycle_duration"
        if [ "${SUMMARY_ENABLED:-true}" = "true" ]; then
            write_cycle_summary "$loop_count"
        fi
        error_count=0
    else
        error_count=$((error_count + 1))
        log_cycle $loop_count "FAIL" "$cycle_failed_reason (cost: \$${CYCLE_COST:-unknown}, subtype: ${CYCLE_SUBTYPE:-unknown}, ${cycle_duration}s, errors: $error_count/$MAX_CONSECUTIVE_ERRORS)"
        send_webhook "error" "$loop_count" "$cycle_failed_reason" "$error_count"
        append_cycle_history "$loop_count" "fail" "${CYCLE_COST:-0}" "$cycle_duration" "$EXIT_CODE"
        send_notification "$loop_count" "fail" "${CYCLE_COST:-0}" "$cycle_duration"
        send_webhook "cycle.end" "$loop_count" "fail" "${CYCLE_COST:-0}" "$cycle_duration"

        # Restore consensus on failure
        restore_consensus
        # Discard any partial atomic write
        rm -f "$PROJECT_DIR/memories/.consensus.tmp"

        # Check for usage limit
        if check_usage_limit "$OUTPUT"; then
            log_cycle $loop_count "LIMIT" "API usage limit detected. Waiting ${LIMIT_WAIT_SECONDS}s..."
            send_webhook "usage_limit" "$loop_count"
            save_state "waiting_limit"
            sleep "$LIMIT_WAIT_SECONDS"
            error_count=0
            run_plugin_hook "post-cycle" "$loop_count" "fail" "${CYCLE_COST:-0}" "$cycle_duration"
            continue
        fi

        # Circuit breaker
        if [ "$error_count" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
            log_cycle $loop_count "BREAKER" "Circuit breaker tripped! Cooling down ${COOLDOWN_SECONDS}s..."
            send_webhook "circuit_break" "$loop_count" "$error_count"
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
            run_plugin_hook "post-cycle" "$loop_count" "fail" "${CYCLE_COST:-0}" "$cycle_duration"
            continue
        fi
    fi

    # Run post-cycle plugin hook
    post_status="ok"
    [ -n "$cycle_failed_reason" ] && post_status="fail"
    run_plugin_hook "post-cycle" "$loop_count" "$post_status" "${CYCLE_COST:-0}" "$cycle_duration"

    save_state "idle"

    # Check cycle limit
    if [ "$MAX_CYCLES" -gt 0 ] && [ "$loop_count" -ge "$MAX_CYCLES" ]; then
        log "Cycle limit reached ($MAX_CYCLES cycles). Exiting cleanly."
        save_state "completed"
        rm -f "$PID_FILE"
        exit 0
    fi

    # Update QMD index in background (if enabled and installed)
    if [ "${QMD_ENABLED:-true}" = "true" ] && command -v qmd &>/dev/null; then
        qmd update 2>/dev/null &
    fi

    # Adaptive frequency: sleep longer when nothing changed
    cycle_was_idle=0
    if [ "$IDLE_INTERVAL" -gt 0 ] && [ -z "$cycle_failed_reason" ]; then
        # Cycle is "idle" if consensus didn't change and no artifacts were produced
        if [ "$pre_cycle_consensus_hash" = "$post_cycle_consensus_hash" ]; then
            # Check if any artifacts were logged this cycle
            artifacts_this_cycle=0
            if [ -f "$PROJECT_DIR/$STATE_DIR/artifacts.jsonl" ]; then
                artifacts_this_cycle=$(grep -c "\"cycle\":$loop_count" "$PROJECT_DIR/$STATE_DIR/artifacts.jsonl" 2>/dev/null) || artifacts_this_cycle=0
            fi
            if [ "$artifacts_this_cycle" -eq 0 ]; then
                cycle_was_idle=1
            fi
        fi
    fi

    if [ "$cycle_was_idle" -eq 1 ]; then
        log_cycle $loop_count "IDLE" "No changes detected. Sleeping ${IDLE_INTERVAL}s (checking every 30s for activity)..."
        save_state "idle_adaptive"
        # Sleep in 30s chunks, checking for activity signals each time
        idle_elapsed=0
        while [ "$idle_elapsed" -lt "$IDLE_INTERVAL" ]; do
            sleep 30
            idle_elapsed=$((idle_elapsed + 30))
            # Check for activity: human response, external consensus change, or stop request
            if check_stop_requested; then
                log "Stop requested during idle. Shutting down."
                cleanup
            fi
            if [ -f "$PAUSE_FILE" ]; then
                break
            fi
            if [ -s "$PROJECT_DIR/memories/human-response.md" ]; then
                log_cycle $loop_count "WAKE" "Human response detected — resuming immediately"
                break
            fi
            current_consensus_hash=$(md5 -q "$CONSENSUS_FILE" 2>/dev/null || md5sum "$CONSENSUS_FILE" 2>/dev/null | cut -d' ' -f1 || echo "")
            if [ "$current_consensus_hash" != "$post_cycle_consensus_hash" ]; then
                log_cycle $loop_count "WAKE" "Consensus externally modified — resuming immediately"
                break
            fi
        done
    else
        log_cycle $loop_count "WAIT" "Sleeping ${LOOP_INTERVAL}s before next cycle..."
        sleep "$LOOP_INTERVAL"
    fi
done
