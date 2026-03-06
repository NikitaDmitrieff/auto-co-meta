#!/bin/bash
# ============================================================
# Auto-Co -- Stop Loop
# ============================================================
# Gracefully stops the auto-loop process.
# Can also pause/resume launchd daemon mode.
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PID_FILE="$PROJECT_DIR/.auto-loop.pid"
PAUSE_FLAG="$PROJECT_DIR/.auto-loop-paused"
LABEL="com.auto-co.loop"
PLIST_PATH="$HOME/Library/LaunchAgents/${LABEL}.plist"

stop_loop_process() {
    # Method 1: Signal file (graceful, waits for current cycle to finish)
    touch "$PROJECT_DIR/.auto-loop-stop"
    echo "Stop signal sent. Loop will stop after current cycle completes."

    # Method 2: Also send SIGTERM if PID file exists
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Sending SIGTERM to PID $pid..."
            kill -TERM "$pid"
        else
            echo "Process $pid not running. Cleaning up PID file."
            rm -f "$PID_FILE"
        fi
    else
        echo "No PID file found."
    fi
}

pause_daemon() {
    touch "$PAUSE_FLAG"
    echo "Pause flag created: $PAUSE_FLAG"
    stop_loop_process

    if launchctl list 2>/dev/null | grep -q "$LABEL"; then
        launchctl unload "$PLIST_PATH" 2>/dev/null || true
        echo "Daemon unloaded."
    fi
    echo "Daemon paused. Resume with: ./stop-loop.sh --resume-daemon"
}

resume_daemon() {
    rm -f "$PAUSE_FLAG"
    echo "Pause flag removed."

    if [ ! -f "$PLIST_PATH" ]; then
        echo "LaunchAgent plist not found: $PLIST_PATH"
        echo "Install daemon first: ./install-daemon.sh"
        exit 1
    fi

    if launchctl list 2>/dev/null | grep -q "$LABEL"; then
        launchctl unload "$PLIST_PATH" 2>/dev/null || true
    fi

    launchctl load "$PLIST_PATH"
    echo "Daemon resumed and started."
}

case "${1:-}" in
    --pause-daemon)
        pause_daemon
        ;;
    --resume-daemon)
        resume_daemon
        ;;
    --help|-h)
        echo "Usage:"
        echo "  ./stop-loop.sh                 # Stop current loop process"
        echo "  ./stop-loop.sh --pause-daemon  # Pause launchd daemon and stop loop"
        echo "  ./stop-loop.sh --resume-daemon # Resume launchd daemon"
        ;;
    *)
        stop_loop_process
        ;;
esac
