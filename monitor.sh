#!/bin/bash
# ============================================================
# Auto-Co -- Live Monitor
# ============================================================
# Watch the auto-loop output in real-time.
#
# Usage:
#   ./monitor.sh            # Tail the main log
#   ./monitor.sh --last     # Show last cycle's full output
#   ./monitor.sh --status   # Show current loop status
#   ./monitor.sh --cycles   # Summary of all cycles
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
        latest=$(ls -t "$LOG_DIR"/cycle-*.log 2>/dev/null | head -1)
        if [ -n "$latest" ]; then
            echo "=== Latest Cycle: $(basename "$latest") ==="
            if command -v jq &>/dev/null && jq -r '.result' "$latest" 2>/dev/null; then
                :
            else
                cat "$latest"
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
