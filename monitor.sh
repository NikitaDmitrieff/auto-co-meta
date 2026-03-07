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
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
LOG_DIR="$PROJECT_DIR/logs"
STATE_FILE="$PROJECT_DIR/.auto-loop-state"
PID_FILE="$PROJECT_DIR/.auto-loop.pid"
PAUSE_FLAG="$PROJECT_DIR/.auto-loop-paused"
LABEL="com.auto-co.loop"

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
        latest=$(ls -t "$LOG_DIR"/cycle-*.log 2>/dev/null | grep -v cycle-live | head -1)
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
                    printf "  Loop: \033[32mRUNNING\033[0m (PID $pid)"
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
        HISTORY_FILE="$LOG_DIR/cycle-history.jsonl"
        echo "=== Auto-Co Alerts ==="
        alerts=0

        if [ ! -f "$HISTORY_FILE" ] || [ ! -s "$HISTORY_FILE" ] || ! command -v jq &>/dev/null; then
            echo "  No cycle history or jq not installed. Nothing to check."
            exit 0
        fi

        total_cycles=$(jq -s 'length' "$HISTORY_FILE")

        # 1. Recent failures (last 10 cycles)
        recent_fails=$(jq -s '[.[-10:] | .[] | select(.status=="fail")] | length' "$HISTORY_FILE")
        if [ "$recent_fails" -gt 0 ]; then
            echo "  [WARN] $recent_fails failures in last 10 cycles"
            jq -s '.[-10:] | .[] | select(.status=="fail") | "    Cycle \(.cycle): exit \(.exit_code), \(.duration_s)s"' -r "$HISTORY_FILE"
            alerts=$((alerts + 1))
        fi

        # 2. Cost spike detection (last cycle > 2x average)
        if [ "$total_cycles" -ge 3 ]; then
            cost_alert=$(jq -s '
                if length < 3 then empty
                else
                    (.[:-1] | [.[].cost] | add / length) as $avg |
                    (.[-1].cost) as $last |
                    if $last > ($avg * 2) then
                        "  [WARN] Last cycle cost $\($last) is >2x average ($\($avg | . * 100 | floor / 100))"
                    else empty end
                end
            ' -r "$HISTORY_FILE")
            if [ -n "$cost_alert" ]; then
                echo "$cost_alert"
                alerts=$((alerts + 1))
            fi
        fi

        # 3. Consecutive failure streak
        streak=$(jq -s '[foreach .[] as $x (0; if $x.status == "fail" then . + 1 else 0 end)] | max' "$HISTORY_FILE")
        if [ "$streak" -ge 3 ]; then
            echo "  [CRIT] Worst consecutive failure streak: $streak cycles"
            alerts=$((alerts + 1))
        fi

        # 4. Stall detection (loop not running but should be)
        if [ -f "$STATE_FILE" ]; then
            last_run=$(grep '^LAST_RUN=' "$STATE_FILE" | cut -d= -f2-)
            if [ -n "$last_run" ]; then
                last_epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$last_run" +%s 2>/dev/null || echo 0)
                now_epoch=$(date +%s)
                idle_minutes=$(( (now_epoch - last_epoch) / 60 ))
                if [ "$idle_minutes" -gt 60 ]; then
                    echo "  [WARN] Loop idle for ${idle_minutes}m (last run: $last_run)"
                    alerts=$((alerts + 1))
                fi
            fi
        fi

        # 5. Duration anomaly (last cycle > 2x average duration)
        if [ "$total_cycles" -ge 3 ]; then
            dur_alert=$(jq -s '
                if length < 3 then empty
                else
                    (.[:-1] | [.[].duration_s] | add / length) as $avg |
                    (.[-1].duration_s) as $last |
                    if $last > ($avg * 2) then
                        "  [WARN] Last cycle took \($last)s (>2x avg \($avg | floor)s)"
                    else empty end
                end
            ' -r "$HISTORY_FILE")
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
