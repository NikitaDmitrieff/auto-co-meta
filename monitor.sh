#!/bin/bash
# ============================================================
# Auto-Co -- Live Monitor
# ============================================================
# Watch the auto-loop output in real-time.
#
# Usage:
#   ./monitor.sh            # Tail the main log
#   ./monitor.sh --last     # Show last cycle's result
#   ./monitor.sh --status   # Show current loop status
#   ./monitor.sh --cycles   # Summary of all cycles (from log)
#   ./monitor.sh --costs    # Cost analytics from cycle history
#   ./monitor.sh --history  # Tabular cycle history
#   ./monitor.sh --dashboard # Live-updating compact dashboard
#   ./monitor.sh --export    # Export cycle history as CSV
#   ./monitor.sh --alerts    # Check for failures, cost spikes, stalls
#   ./monitor.sh --compare   # Compare cost/duration across models
#   ./monitor.sh --health    # Combined health check (status + alerts + uptime)
#   ./monitor.sh --trend [N] # Cost & duration trend over last N cycles (default 20)
#   ./monitor.sh --version   # Show version
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
LOG_DIR="$PROJECT_DIR/logs"
STATE_FILE="$PROJECT_DIR/.auto-loop-state"
PID_FILE="$PROJECT_DIR/.auto-loop.pid"
PAUSE_FLAG="$PROJECT_DIR/.auto-loop-paused"
LABEL="com.auto-co.loop"

# Shared alerts logic used by --alerts and --health
check_alerts() {
    local history_file="$LOG_DIR/cycle-history.jsonl"
    local alerts=0

    if [ ! -f "$history_file" ] || [ ! -s "$history_file" ] || ! command -v jq &>/dev/null; then
        echo "  No cycle history or jq not installed. Nothing to check."
        return 0
    fi

    local total_cycles
    total_cycles=$(jq -s 'length' "$history_file")

    # 1. Recent failures (last 10 cycles)
    local recent_fails
    recent_fails=$(jq -s '[.[-10:] | .[] | select(.status=="fail")] | length' "$history_file")
    if [ "$recent_fails" -gt 0 ]; then
        echo "  [WARN] $recent_fails failures in last 10 cycles"
        jq -s '.[-10:] | .[] | select(.status=="fail") | "    Cycle \(.cycle): exit \(.exit_code), \(.duration_s)s"' -r "$history_file"
        alerts=$((alerts + 1))
    fi

    # 2. Cost spike detection (last cycle > 2x average)
    if [ "$total_cycles" -ge 3 ]; then
        local cost_alert
        cost_alert=$(jq -s '
            if length < 3 then empty
            else
                (.[:-1] | [.[].cost] | add / length) as $avg |
                (.[-1].cost) as $last |
                if $last > ($avg * 2) then
                    "  [WARN] Last cycle cost $\($last) is >2x average ($\($avg | . * 100 | floor / 100))"
                else empty end
            end
        ' -r "$history_file")
        if [ -n "$cost_alert" ]; then
            echo "$cost_alert"
            alerts=$((alerts + 1))
        fi
    fi

    # 3. Consecutive failure streak
    local streak
    streak=$(jq -s '[foreach .[] as $x (0; if $x.status == "fail" then . + 1 else 0 end)] | max' "$history_file")
    if [ "$streak" -ge 3 ]; then
        echo "  [CRIT] Worst consecutive failure streak: $streak cycles"
        alerts=$((alerts + 1))
    fi

    # 4. Stall detection (loop not running but should be)
    if [ -f "$STATE_FILE" ]; then
        local last_run_ts lr_epoch n_epoch idle_m
        last_run_ts=$(grep '^LAST_RUN=' "$STATE_FILE" | cut -d= -f2-)
        if [ -n "$last_run_ts" ]; then
            lr_epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$last_run_ts" +%s 2>/dev/null || date -d "$last_run_ts" +%s 2>/dev/null || echo 0)
            n_epoch=$(date +%s)
            idle_m=$(( (n_epoch - lr_epoch) / 60 ))
            if [ "$idle_m" -gt 60 ]; then
                echo "  [WARN] Loop idle for ${idle_m}m (last run: $last_run_ts)"
                alerts=$((alerts + 1))
            fi
        fi
    fi

    # 5. Duration anomaly (last cycle > 2x average duration)
    if [ "$total_cycles" -ge 3 ]; then
        local dur_alert
        dur_alert=$(jq -s '
            if length < 3 then empty
            else
                (.[:-1] | [.[].duration_s] | add / length) as $avg |
                (.[-1].duration_s) as $last |
                if $last > ($avg * 2) then
                    "  [WARN] Last cycle took \($last)s (>2x avg \($avg | floor)s)"
                else empty end
            end
        ' -r "$history_file")
        if [ -n "$dur_alert" ]; then
            echo "$dur_alert"
            alerts=$((alerts + 1))
        fi
    fi

    if [ "$alerts" -eq 0 ]; then
        echo "  All clear. No alerts across $total_cycles cycles."
    else
        echo ""
        echo "  $alerts alert(s) found."
    fi
}

if [ "${1:-}" = "--version" ] || [ "${1:-}" = "-V" ]; then
    version=$(cat "$PROJECT_DIR/VERSION" 2>/dev/null || echo "unknown")
    echo "monitor.sh v${version}"
    exit 0
fi

case "${1:-}" in
    --status)
        echo "=== Auto-Co Status ==="
        if [ -f "$PID_FILE" ]; then
            pid=$(cat "$PID_FILE")
            if kill -0 "$pid" 2>/dev/null; then
                echo "Loop: RUNNING (PID $pid)"
            else
                echo "Loop: STOPPED (stale PID $pid)"
            fi
        else
            echo "Loop: NOT RUNNING"
        fi

        if [ -f "$PAUSE_FLAG" ]; then
            echo "Daemon: PAUSED (.auto-loop-paused present)"
        elif launchctl list 2>/dev/null | grep -q "$LABEL"; then
            echo "Daemon: LOADED ($LABEL)"
        else
            echo "Daemon: NOT LOADED"
        fi

        if [ -f "$STATE_FILE" ]; then
            echo ""
            cat "$STATE_FILE"
            total=$(grep '^TOTAL_COST=' "$STATE_FILE" | cut -d= -f2 || echo "")
            if [ -n "$total" ]; then
                echo "TOTAL_COST_DISPLAY=\$$total"
            fi
        fi

        echo ""
        echo "=== Latest Consensus ==="
        if [ -f "$PROJECT_DIR/memories/consensus.md" ]; then
            head -30 "$PROJECT_DIR/memories/consensus.md"
        else
            echo "(no consensus file)"
        fi

        echo ""
        echo "=== Recent Log ==="
        if [ -f "$LOG_DIR/auto-loop.log" ]; then
            tail -20 "$LOG_DIR/auto-loop.log"
        fi
        ;;

    --last)
        latest=$(find "$LOG_DIR" -name 'cycle-*.log' ! -name 'cycle-live*' -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -1)
        if [ -n "$latest" ]; then
            echo "=== Latest Cycle: $(basename "$latest") ==="
            if command -v jq &>/dev/null; then
                # Stream-json format: extract result from last "type":"result" line
                result_line=$(grep -E '"type"\s*:\s*"result"' "$latest" | tail -1)
                if [ -n "$result_line" ]; then
                    echo "$result_line" | jq -r '.result // "No result text"' 2>/dev/null
                    cost=$(echo "$result_line" | jq -r '.total_cost_usd // empty' 2>/dev/null)
                    [ -n "$cost" ] && echo -e "\nCost: \$$cost"
                else
                    # Fallback: try single JSON object
                    jq -r '.result // empty' "$latest" 2>/dev/null || tail -50 "$latest"
                fi
            else
                tail -50 "$latest"
            fi
        else
            echo "No cycle logs found."
        fi
        ;;

    --cycles)
        echo "=== Cycle History ==="
        if [ -f "$LOG_DIR/auto-loop.log" ]; then
            grep -E "Cycle #[0-9]+ \[(OK|FAIL|START|LIMIT|BUDGET|BREAKER)\]" "$LOG_DIR/auto-loop.log" | tail -50
        else
            echo "No log found."
        fi
        ;;

    --costs)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        echo "=== Cost Analytics ==="
        if [ ! -f "$HISTORY_FILE" ] || [ ! -s "$HISTORY_FILE" ]; then
            echo "No cycle history yet. History tracking starts on next loop run."
            # Fallback: show total from state file
            if [ -f "$STATE_FILE" ]; then
                total=$(grep '^TOTAL_COST=' "$STATE_FILE" | cut -d= -f2)
                echo "Total cost (from state): \$${total:-unknown}"
            fi
        elif command -v jq &>/dev/null; then
            echo ""
            echo "Per-cycle breakdown:"
            jq -r '"  Cycle \(.cycle): $\(.cost) (\(.status), \(.duration_s)s, \(.model))"' "$HISTORY_FILE"
            echo ""
            total=$(jq -s '[.[].cost] | add' "$HISTORY_FILE")
            count=$(jq -s 'length' "$HISTORY_FILE")
            ok=$(jq -s '[.[] | select(.status=="ok")] | length' "$HISTORY_FILE")
            fail=$(jq -s '[.[] | select(.status=="fail")] | length' "$HISTORY_FILE")
            avg=$(jq -s 'if length > 0 then ([.[].cost] | add) / length else 0 end' "$HISTORY_FILE")
            avg_dur=$(jq -s 'if length > 0 then ([.[].duration_s] | add) / length | floor else 0 end' "$HISTORY_FILE")
            echo "Total: \$$total across $count cycles ($ok ok, $fail failed)"
            echo "Average: \$$avg/cycle, ${avg_dur}s/cycle"
        else
            echo "Install jq for cost analytics. Raw history:"
            cat "$HISTORY_FILE"
        fi
        ;;

    --history)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        if [ -f "$HISTORY_FILE" ] && command -v jq &>/dev/null; then
            echo "=== Cycle History (structured) ==="
            printf "%-7s %-22s %-6s %-9s %-9s %s\n" "Cycle" "Timestamp" "Status" "Cost" "Duration" "Model"
            echo "-------------------------------------------------------------------"
            jq -r '"\(.cycle)\t\(.timestamp)\t\(.status)\t$\(.cost)\t\(.duration_s)s\t\(.model)"' "$HISTORY_FILE" \
                | while IFS=$'\t' read -r cyc ts st cost dur model; do
                    printf "%-7s %-22s %-6s %-9s %-9s %s\n" "$cyc" "$ts" "$st" "$cost" "$dur" "$model"
                done
        elif [ -f "$HISTORY_FILE" ]; then
            cat "$HISTORY_FILE"
        else
            echo "No cycle history yet."
        fi
        ;;

    --export)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        if [ ! -f "$HISTORY_FILE" ] || [ ! -s "$HISTORY_FILE" ]; then
            echo "No cycle history to export." >&2
            exit 1
        elif ! command -v jq &>/dev/null; then
            echo "jq is required for export." >&2
            exit 1
        fi
        echo "cycle,timestamp,status,cost_usd,duration_s,model"
        jq -r '[.cycle, .timestamp, .status, .cost, .duration_s, .model] | @csv' "$HISTORY_FILE"
        ;;

    --dashboard)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        while true; do
            clear
            echo "╔══════════════════════════════════════════════════════════╗"
            echo "║              Auto-Co Dashboard  (Ctrl+C to stop)       ║"
            echo "╚══════════════════════════════════════════════════════════╝"
            echo ""

            # Loop status
            if [ -f "$PID_FILE" ]; then
                pid=$(cat "$PID_FILE")
                if kill -0 "$pid" 2>/dev/null; then
                    printf "  Loop: \033[32mRUNNING\033[0m (PID %s)" "$pid"
                else
                    printf "  Loop: \033[31mSTOPPED\033[0m (stale PID)"
                fi
            else
                printf "  Loop: \033[33mNOT RUNNING\033[0m"
            fi

            if [ -f "$PAUSE_FLAG" ]; then
                printf "  |  Daemon: PAUSED"
            fi

            # State info
            if [ -f "$STATE_FILE" ]; then
                status=$(grep '^STATUS=' "$STATE_FILE" | cut -d= -f2)
                model=$(grep '^MODEL=' "$STATE_FILE" | cut -d= -f2)
                loop_count=$(grep '^LOOP_COUNT=' "$STATE_FILE" | cut -d= -f2)
                last_run=$(grep '^LAST_RUN=' "$STATE_FILE" | cut -d= -f2-)
                printf "  |  Status: %s  |  Model: %s\n" "${status:-?}" "${model:-?}"
                printf "  Internal cycle: %s  |  Last: %s\n" "${loop_count:-?}" "${last_run:-?}"
            else
                echo ""
            fi

            echo ""

            # Cost summary from history
            if [ -f "$HISTORY_FILE" ] && [ -s "$HISTORY_FILE" ] && command -v jq &>/dev/null; then
                total=$(jq -s '[.[].cost] | add' "$HISTORY_FILE")
                count=$(jq -s 'length' "$HISTORY_FILE")
                ok=$(jq -s '[.[] | select(.status=="ok")] | length' "$HISTORY_FILE")
                fail=$(jq -s '[.[] | select(.status=="fail")] | length' "$HISTORY_FILE")
                avg=$(jq -s 'if length > 0 then ([.[].cost] | add) / length | . * 100 | floor / 100 else 0 end' "$HISTORY_FILE")
                avg_dur=$(jq -s 'if length > 0 then ([.[].duration_s] | add) / length | floor else 0 end' "$HISTORY_FILE")

                echo "  ┌─────────────────────────────────────────────────────┐"
                printf "  │  Cycles: %-5s  OK: %-5s  Fail: %-5s             │\n" "$count" "$ok" "$fail"
                printf "  │  Total cost: \$%-10s  Avg: \$%-8s/cycle       │\n" "$total" "$avg"
                printf "  │  Avg duration: %ss/cycle                          │\n" "$avg_dur"
                # Cost trend sparkline (last 10 cycles)
                spark=$(jq -s '[ .[-10:][].cost ] | [ range(length) as $i | {v: .[$i], min: min, max: max} ] | [.[] | if .max == .min then 4 else (((.v - .min) / (.max - .min) * 7) | floor) end] | map(["▁","▂","▃","▄","▅","▆","▇","█"][.]) | join("")' "$HISTORY_FILE" 2>/dev/null | tr -d '"')
                printf "  │  Cost trend (last 10): %-28s │\n" "$spark"
                echo "  └─────────────────────────────────────────────────────┘"

                echo ""
                echo "  Last 10 cycles:"
                printf "  %-6s %-6s %-9s %-8s %s\n" "Cycle" "Status" "Cost" "Duration" "Model"
                echo "  ────── ────── ───────── ──────── ──────"
                jq -r '"\(.cycle)\t\(.status)\t$\(.cost)\t\(.duration_s)s\t\(.model)"' "$HISTORY_FILE" \
                    | tail -10 \
                    | while IFS=$'\t' read -r cyc st cost dur model; do
                        if [ "$st" = "ok" ]; then
                            printf "  %-6s \033[32m%-6s\033[0m %-9s %-8s %s\n" "$cyc" "$st" "$cost" "$dur" "$model"
                        else
                            printf "  %-6s \033[31m%-6s\033[0m %-9s %-8s %s\n" "$cyc" "$st" "$cost" "$dur" "$model"
                        fi
                    done
            else
                echo "  No cycle history available."
            fi

            echo ""

            # Consensus snippet
            if [ -f "$PROJECT_DIR/memories/consensus.md" ]; then
                echo "  Next Action:"
                sed -n '/^## Next Action/,/^##/{/^## Next Action/d;/^##/d;p;}' "$PROJECT_DIR/memories/consensus.md" | head -3 | sed 's/^/    /'
            fi

            echo ""
            echo "  $(date '+%H:%M:%S') — refreshing every 10s"
            sleep 10
        done
        ;;

    --alerts)
        echo "=== Auto-Co Alerts ==="
        check_alerts
        ;;

    --compare)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        if [ ! -f "$HISTORY_FILE" ] || [ ! -s "$HISTORY_FILE" ] || ! command -v jq &>/dev/null; then
            echo "No cycle history or jq not installed."
            exit 1
        fi

        echo "=== Model Comparison ==="
        echo ""
        printf "%-12s %7s %10s %10s %10s %8s\n" "Model" "Cycles" "Total" "Avg Cost" "Avg Dur" "OK Rate"
        echo "──────────── ─────── ────────── ────────── ────────── ────────"

        jq -s '
            group_by(.model) | .[] |
            {
                model: .[0].model,
                count: length,
                total: ([.[].cost] | add),
                avg_cost: (([.[].cost] | add) / length | . * 100 | floor / 100),
                avg_dur: (([.[].duration_s] | add) / length | floor),
                ok: ([.[] | select(.status=="ok")] | length),
                ok_pct: (([.[] | select(.status=="ok")] | length) * 100 / length | floor)
            } |
            "\(.model)\t\(.count)\t$\(.total)\t$\(.avg_cost)\t\(.avg_dur)s\t\(.ok_pct)%"
        ' -r "$HISTORY_FILE" \
            | sort -t$'\t' -k2 -rn \
            | while IFS=$'\t' read -r model count total avg_cost avg_dur ok_pct; do
                printf "%-12s %7s %10s %10s %10s %8s\n" "$model" "$count" "$total" "$avg_cost" "$avg_dur" "$ok_pct"
            done

        echo ""
        echo "Cost efficiency (lower = better):"
        jq -s '
            group_by(.model) | .[] |
            {
                model: .[0].model,
                cost_per_ok: (
                    ([.[] | select(.status=="ok")] | length) as $ok |
                    if $ok > 0 then (([.[].cost] | add) / $ok | . * 100 | floor / 100)
                    else "N/A" end
                )
            } |
            "  \(.model): $\(.cost_per_ok) per successful cycle"
        ' -r "$HISTORY_FILE"
        ;;

    --trend)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        N="${2:-20}"
        if [ ! -f "$HISTORY_FILE" ] || [ ! -s "$HISTORY_FILE" ] || ! command -v jq &>/dev/null; then
            echo "No cycle history or jq not installed."
            exit 1
        fi

        total_cycles=$(jq -s 'length' "$HISTORY_FILE")
        shown=$((total_cycles < N ? total_cycles : N))

        echo "=== Cost & Duration Trend (last $shown of $total_cycles cycles) ==="
        echo ""

        # Cost sparkline
        cost_spark=$(jq -s "[ .[-${N}:][].cost ] | [ range(length) as \$i | {v: .[\$i], min: min, max: max} ] | [.[] | if .max == .min then 4 else (((.v - .min) / (.max - .min) * 7) | floor) end] | map([\"▁\",\"▂\",\"▃\",\"▄\",\"▅\",\"▆\",\"▇\",\"█\"][.]) | join(\"\")" "$HISTORY_FILE" 2>/dev/null | tr -d '"')
        cost_min=$(jq -s "[ .[-${N}:][].cost ] | min | . * 100 | floor / 100" "$HISTORY_FILE")
        cost_max=$(jq -s "[ .[-${N}:][].cost ] | max | . * 100 | floor / 100" "$HISTORY_FILE")
        cost_avg=$(jq -s "[ .[-${N}:][].cost ] | add / length | . * 100 | floor / 100" "$HISTORY_FILE")

        printf "  Cost:     %s\n" "$cost_spark"
        printf "            min: \$%-8s  avg: \$%-8s  max: \$%-8s\n" "$cost_min" "$cost_avg" "$cost_max"
        echo ""

        # Duration sparkline
        dur_spark=$(jq -s "[ .[-${N}:][].duration_s ] | [ range(length) as \$i | {v: .[\$i], min: min, max: max} ] | [.[] | if .max == .min then 4 else (((.v - .min) / (.max - .min) * 7) | floor) end] | map([\"▁\",\"▂\",\"▃\",\"▄\",\"▅\",\"▆\",\"▇\",\"█\"][.]) | join(\"\")" "$HISTORY_FILE" 2>/dev/null | tr -d '"')
        dur_min=$(jq -s "[ .[-${N}:][].duration_s ] | min" "$HISTORY_FILE")
        dur_max=$(jq -s "[ .[-${N}:][].duration_s ] | max" "$HISTORY_FILE")
        dur_avg=$(jq -s "[ .[-${N}:][].duration_s ] | add / length | floor" "$HISTORY_FILE")

        printf "  Duration: %s\n" "$dur_spark"
        printf "            min: %-8ss  avg: %-8ss  max: %-8ss\n" "$dur_min" "$dur_avg" "$dur_max"
        echo ""

        # Per-cycle detail table
        echo "  Details:"
        printf "  %-7s %-9s %-9s %-10s %s\n" "Cycle" "Cost" "Duration" "Status" "Model"
        echo "  ------- --------- --------- ---------- ------"
        jq -s ".[-${N}:][] | \"\(.cycle)\t\$\(.cost)\t\(.duration_s)s\t\(.status)\t\(.model)\"" -r "$HISTORY_FILE" \
            | while IFS=$'\t' read -r cyc cost dur st model; do
                printf "  %-7s %-9s %-9s %-10s %s\n" "$cyc" "$cost" "$dur" "$st" "$model"
            done

        # Running total trend
        echo ""
        total=$(jq -s '[.[].cost] | add | . * 100 | floor / 100' "$HISTORY_FILE")
        echo "  Cumulative cost: \$$total across $total_cycles cycles"
        ;;

    --health)
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        echo "=== Auto-Co Health Report ==="
        echo ""

        # 1. Loop status
        printf "Loop: "
        if [ -f "$PID_FILE" ]; then
            pid=$(cat "$PID_FILE")
            if kill -0 "$pid" 2>/dev/null; then
                printf "RUNNING (PID %s)" "$pid"
            else
                printf "STOPPED (stale PID %s)" "$pid"
            fi
        else
            printf "NOT RUNNING"
        fi

        if [ -f "$PAUSE_FLAG" ]; then
            printf "  |  Daemon: PAUSED"
        fi
        echo ""

        # 2. Uptime / idle time
        if [ -f "$STATE_FILE" ]; then
            last_run=$(grep '^LAST_RUN=' "$STATE_FILE" | cut -d= -f2-)
            model=$(grep '^MODEL=' "$STATE_FILE" | cut -d= -f2)
            loop_count=$(grep '^LOOP_COUNT=' "$STATE_FILE" | cut -d= -f2)
            total_cost=$(grep '^TOTAL_COST=' "$STATE_FILE" | cut -d= -f2)
            if [ -n "$last_run" ]; then
                last_epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$last_run" +%s 2>/dev/null || date -d "$last_run" +%s 2>/dev/null || echo 0)
                now_epoch=$(date +%s)
                idle_minutes=$(( (now_epoch - last_epoch) / 60 ))
                echo "Last run: $last_run (${idle_minutes}m ago)"
            fi
            echo "Model: ${model:-unknown}  |  Internal cycles: ${loop_count:-0}  |  Total cost: \$${total_cost:-0}"
        fi

        echo ""

        # 3. Selftest summary (inline, no subprocess)
        echo "--- Environment ---"
        st_pass=0
        st_fail=0
        st_check() {
            if [ "$2" -eq 1 ]; then
                st_pass=$((st_pass + 1))
            else
                printf "  [FAIL] %s -- %s\n" "$1" "$3"
                st_fail=$((st_fail + 1))
            fi
        }
        if command -v claude &>/dev/null; then st_check "Claude CLI" 1; else st_check "Claude CLI" 0 "not found"; fi
        if [ -f "$PROJECT_DIR/PROMPT.md" ]; then st_check "PROMPT.md" 1; else st_check "PROMPT.md" 0 "missing"; fi
        if [ -d "$PROJECT_DIR/memories" ]; then st_check "memories/" 1; else st_check "memories/" 0 "missing"; fi
        if command -v jq &>/dev/null; then st_check "jq" 1; else st_check "jq" 0 "not installed"; fi
        if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree &>/dev/null; then st_check "git repo" 1; else st_check "git repo" 0 "not a repo"; fi
        if [ -d "$PROJECT_DIR/.claude/agents" ]; then st_check "agents" 1; else st_check "agents" 0 "missing"; fi

        if [ "$st_fail" -eq 0 ]; then
            echo "  All $st_pass checks passed."
        else
            echo "  $st_pass passed, $st_fail failed."
        fi

        echo ""

        # 4. Alerts (shared with --alerts)
        echo "--- Alerts ---"
        check_alerts

        echo ""

        # 5. Quick stats
        if [ -f "$HISTORY_FILE" ] && [ -s "$HISTORY_FILE" ] && command -v jq &>/dev/null; then
            echo "--- Stats ---"
            ok=$(jq -s '[.[] | select(.status=="ok")] | length' "$HISTORY_FILE")
            fail=$(jq -s '[.[] | select(.status=="fail")] | length' "$HISTORY_FILE")
            total=$(jq -s '[.[].cost] | add' "$HISTORY_FILE")
            rate=$(jq -s '([.[] | select(.status=="ok")] | length) * 100 / length | floor' "$HISTORY_FILE")
            echo "  Cycles: $total_cycles ($ok ok, $fail failed)  |  Success rate: ${rate}%  |  Total cost: \$$total"
        fi
        ;;

    *)
        echo "=== Auto-Co Live Monitor (Ctrl+C to stop) ==="
        echo "Watching: $LOG_DIR/auto-loop.log"
        echo ""
        if [ -f "$LOG_DIR/auto-loop.log" ]; then
            tail -f "$LOG_DIR/auto-loop.log"
        else
            echo "No log file yet. Start the loop first: ./auto-loop.sh"
        fi
        ;;
esac
