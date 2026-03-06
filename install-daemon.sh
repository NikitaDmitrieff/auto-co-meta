#!/bin/bash
# ============================================================
# Auto-Co -- Install/Uninstall launchd Daemon (macOS)
# ============================================================
# Generates a launchd plist dynamically based on current paths,
# installs it to ~/Library/LaunchAgents/, and loads it.
#
# Usage:
#   ./install-daemon.sh             # Install and start
#   ./install-daemon.sh --uninstall # Stop and remove
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.auto-co.loop"
PLIST_PATH="$HOME/Library/LaunchAgents/${LABEL}.plist"
PAUSE_FLAG="${SCRIPT_DIR}/.auto-loop-paused"

# --- Uninstall ---
if [ "${1:-}" = "--uninstall" ]; then
    echo "Uninstalling Auto-Co daemon..."
    if launchctl list | grep -q "$LABEL"; then
        launchctl unload "$PLIST_PATH" 2>/dev/null || true
        echo "Service unloaded."
    fi
    if [ -f "$PLIST_PATH" ]; then
        rm -f "$PLIST_PATH"
        echo "Plist removed: $PLIST_PATH"
    fi
    echo "Done. Daemon uninstalled."
    exit 0
fi

# --- Install ---

# Check dependencies
if ! command -v claude &>/dev/null; then
    echo "Error: 'claude' CLI not found. Install Claude Code first."
    exit 1
fi

CLAUDE_PATH="$(command -v claude)"
CLAUDE_DIR="$(dirname "$CLAUDE_PATH")"

# Detect node path (for npx etc.)
NODE_DIR=""
if command -v node &>/dev/null; then
    NODE_DIR="$(dirname "$(command -v node)")"
fi

# Build PATH: include all tool directories
DAEMON_PATH="${CLAUDE_DIR}"
[ -n "$NODE_DIR" ] && DAEMON_PATH="${DAEMON_PATH}:${NODE_DIR}"
DAEMON_PATH="${DAEMON_PATH}:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

echo "Installing Auto-Co daemon..."
echo "  Project: $SCRIPT_DIR"
echo "  Claude:  $CLAUDE_PATH"
echo "  PATH:    $DAEMON_PATH"

mkdir -p "$HOME/Library/LaunchAgents" "$SCRIPT_DIR/logs"
# Install implies active running state
rm -f "$PAUSE_FLAG"

# Unload existing if running
if launchctl list 2>/dev/null | grep -q "$LABEL"; then
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# Generate plist
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${SCRIPT_DIR}/auto-loop.sh</string>
        <string>--daemon</string>
    </array>

    <key>WorkingDirectory</key>
    <string>${SCRIPT_DIR}</string>

    <key>KeepAlive</key>
    <dict>
        <key>PathState</key>
        <dict>
            <key>${PAUSE_FLAG}</key>
            <false/>
        </dict>
    </dict>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>${SCRIPT_DIR}/logs/launchd-stdout.log</string>

    <key>StandardErrorPath</key>
    <string>${SCRIPT_DIR}/logs/launchd-stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${DAEMON_PATH}</string>
        <key>HOME</key>
        <string>${HOME}</string>
    </dict>

    <key>ThrottleInterval</key>
    <integer>30</integer>
</dict>
</plist>
EOF

echo "Plist written: $PLIST_PATH"

# Load
launchctl load "$PLIST_PATH"
echo ""
echo "Daemon installed and started!"
echo ""
echo "Commands:"
echo "  ./monitor.sh            # Watch live logs"
echo "  ./monitor.sh --status   # Check status"
echo "  ./stop-loop.sh          # Stop the loop (daemon will restart it)"
echo "  ./stop-loop.sh --pause-daemon   # Pause daemon (no auto-restart)"
echo "  ./stop-loop.sh --resume-daemon  # Resume daemon"
echo "  ./install-daemon.sh --uninstall  # Remove daemon completely"
