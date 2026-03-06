#!/bin/bash
# Auto-Co Live Cycle Watcher — clean, human-readable output
# Usage: ./watch.sh
LOGS_DIR="$(cd "$(dirname "$0")" && pwd)/logs"
LIVE_LOG="$LOGS_DIR/cycle-live.jsonl"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$LIVE_LOG" ]; then
  echo "No live log yet. Start the loop first."
  exit 1
fi

echo -e "\033[32m=== Auto-Co Live Watcher ===\033[0m"
echo ""

tail -f "$LIVE_LOG" 2>/dev/null | python3 -u "$SCRIPT_DIR/watch.py"
