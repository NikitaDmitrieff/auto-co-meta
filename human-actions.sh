#!/bin/bash
# ============================================================
# Auto-Co -- Human Actions Monitor
# ============================================================
# Live view of pending human escalation requests for this repo.
# Run in its own terminal alongside the loop and monitor.
#
# Usage:
#   ./human-actions.sh          # Live (refreshes every 10s)
#   ./human-actions.sh --once   # Print once and exit
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
REQUEST_FILE="$PROJECT_DIR/memories/human-request.md"
CONSENSUS_FILE="$PROJECT_DIR/memories/consensus.md"
STATE_FILE="$PROJECT_DIR/.auto-loop-state"
NAME=$(basename "$PROJECT_DIR")
REFRESH=10

# --- Colors ---
R='\033[0;31m'
BR='\033[1;31m'
G='\033[0;32m'
BG='\033[1;32m'
Y='\033[0;33m'
BY='\033[1;33m'
C='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
RST='\033[0m'

render() {
    local cols=$(tput cols 2>/dev/null || echo 80)
    local line=$(printf '%*s' "$cols" '' | tr ' ' '─')
    local now=$(date '+%H:%M:%S')

    # Loop status
    local status="unknown"
    if [ -f "$STATE_FILE" ]; then
        status=$(grep '^STATUS=' "$STATE_FILE" 2>/dev/null | cut -d= -f2- || echo "unknown")
    fi

    # Phase from consensus
    local phase=""
    if [ -f "$CONSENSUS_FILE" ]; then
        phase=$(grep -A1 '^## Current Phase' "$CONSENSUS_FILE" 2>/dev/null | tail -1 | sed 's/^[[:space:]]*//')
    fi

    clear
    echo -e "${BR}  ${NAME}${RST} ${DIM}── human actions${RST}  ${DIM}${now}  [${status}]${RST}"
    echo -e "${DIM}${line}${RST}"
    echo ""

    if [ ! -f "$REQUEST_FILE" ] || [ ! -s "$REQUEST_FILE" ]; then
        echo ""
        echo -e "  ${BG}✓  No pending human actions.${RST}"
        echo ""
        echo -e "  ${DIM}Phase: ${phase:-unknown}${RST}"
        echo ""
        echo -e "${DIM}${line}${RST}"
        echo -e "  ${DIM}Refreshing every ${REFRESH}s  |  Ctrl+C to exit${RST}"
        return
    fi

    # Parse request file
    local from="" question="" date_str="" default_action="" context=""
    while IFS= read -r reqline; do
        [[ -z "$reqline" ]] && continue
        [[ "$reqline" =~ ^##\  ]] && continue
        if [[ "$reqline" =~ ^\-\ \*\*From:\*\* ]]; then
            from=$(echo "$reqline" | sed 's/.*\*\*From:\*\* *//')
        elif [[ "$reqline" =~ ^\-\ \*\*Date:\*\* ]]; then
            date_str=$(echo "$reqline" | sed 's/.*\*\*Date:\*\* *//')
        elif [[ "$reqline" =~ ^\-\ \*\*Context:\*\* ]]; then
            context=$(echo "$reqline" | sed 's/.*\*\*Context:\*\* *//')
        elif [[ "$reqline" =~ ^\-\ \*\*Question:\*\* ]]; then
            question=$(echo "$reqline" | sed 's/.*\*\*Question:\*\* *//')
        elif [[ "$reqline" =~ ^\-\ \*\*Default\ Action:\*\* ]]; then
            default_action=$(echo "$reqline" | sed 's/.*\*\*Default Action:\*\* *//')
        fi
    done < "$REQUEST_FILE"

    echo -e "  ${BR}ACTION REQUIRED${RST}"
    echo ""
    [ -n "$from" ] && echo -e "  ${C}From:${RST}  ${from}  ${DIM}(${date_str})${RST}"
    [ -n "$phase" ] && echo -e "  ${C}Phase:${RST} ${phase}"
    echo ""

    if [ -n "$context" ]; then
        echo -e "  ${DIM}Context:${RST}"
        echo "$context" | fmt -w $((cols - 6)) 2>/dev/null | while IFS= read -r wl; do
            echo -e "  ${DIM}  ${wl}${RST}"
        done
        echo ""
    fi

    if [ -n "$question" ]; then
        echo -e "  ${BY}Question:${RST}"
        echo "$question" | fmt -w $((cols - 6)) 2>/dev/null | while IFS= read -r wl; do
            echo -e "  ${Y}  ${wl}${RST}"
        done
        echo ""
    fi

    # Show numbered options / **Option lines
    local options
    options=$(grep -E '^\s+([0-9]+\.|(\*\*Option))' "$REQUEST_FILE" 2>/dev/null || true)
    if [ -n "$options" ]; then
        while IFS= read -r opt; do
            opt=$(echo "$opt" | sed 's/^[[:space:]]*//')
            echo -e "  ${R}  ${opt}${RST}"
        done <<< "$options"
        echo ""
    fi

    if [ -n "$default_action" ]; then
        echo ""
        echo -e "  ${DIM}Default action:${RST}"
        echo "$default_action" | fmt -w $((cols - 6)) 2>/dev/null | while IFS= read -r wl; do
            echo -e "  ${DIM}  ${wl}${RST}"
        done
    fi

    echo ""
    echo -e "${DIM}${line}${RST}"
    echo -e "  ${DIM}Respond: edit memories/human-response.md${RST}"
    echo -e "  ${DIM}Refreshing every ${REFRESH}s  |  Ctrl+C to exit${RST}"
}

# --- Main ---
if [ "${1:-}" = "--once" ]; then
    render
    exit 0
fi

trap 'echo ""; exit 0' INT TERM

while true; do
    render
    sleep "$REFRESH"
done
