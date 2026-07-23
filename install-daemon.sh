#!/bin/bash
# ============================================================
# Auto-Co -- Install launchd Daemon (macOS)
# ============================================================
# Registers com.auto-co.loop with launchd so the loop auto-starts
# on login and restarts after a crash. This is the installer that
# Makefile (install/uninstall), stop-loop.sh --resume-daemon, and
# docs/devops/runbook.md all reference.
#
# Usage:
#   ./install-daemon.sh             # generate plist + load
#   ./install-daemon.sh --uninstall # unload + remove plist
#   ./install-daemon.sh --dry-run   # generate plist + lint, no launchctl
#   ./install-daemon.sh --help
#
# Env overrides (mainly for tests):
#   ACO_PLIST_PATH   override the plist destination
#   ACO_LOG_DIR      override the daemon log directory
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.auto-co.loop"
PLIST_PATH="${ACO_PLIST_PATH:-$HOME/Library/LaunchAgents/${LABEL}.plist}"
LOG_DIR="${ACO_LOG_DIR:-$SCRIPT_DIR/logs}"
ACTION="install"

case "${1:-}" in
    --uninstall|-u)
        ACTION="uninstall"
        ;;
    --dry-run|-n)
        ACTION="dry-run"
        ;;
    --help|-h)
        cat <<EOF
Usage:
  ./install-daemon.sh               Generate plist and load the launchd daemon
  ./install-daemon.sh --uninstall   Unload and remove the daemon
  ./install-daemon.sh --dry-run     Generate the plist and lint it (no launchctl)
  ./install-daemon.sh --help        Show this help
EOF
        exit 0
        ;;
    "")
        ACTION="install"
        ;;
    *)
        echo "Unknown argument: $1 (try --help)" >&2
        exit 2
        ;;
esac

if [ "$(uname)" != "Darwin" ]; then
    echo "Error: launchd daemon is macOS-only (uname=$(uname))." >&2
    echo "On Linux, run the loop under systemd or a process manager instead." >&2
    exit 1
fi

# -----------------------------------------------------------------------------
# Plist body. KeepAlive as a dict with SuccessfulExit=false means:
#   - crash (non-zero exit)  -> launchd restarts it (crash recovery)
#   - graceful stop (exit 0) -> launchd leaves it dead (make stop works)
# This is why `./stop-loop.sh` (graceful) and `make pause` both take effect
# instead of being instantly resurrected.
# -----------------------------------------------------------------------------
generate_plist() {
    mkdir -p "$(dirname "$PLIST_PATH")"
    mkdir -p "$LOG_DIR"
    cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>
    <key>WorkingDirectory</key>
    <string>${SCRIPT_DIR}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${SCRIPT_DIR}/auto-loop.sh</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${PATH}:/usr/local/bin:/opt/homebrew/bin</string>
        <key>HOME</key>
        <string>${HOME}</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>StandardOutPath</key>
    <string>${LOG_DIR}/daemon.log</string>
    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/daemon.err.log</string>
</dict>
</plist>
EOF
}

do_uninstall() {
    if launchctl list 2>/dev/null | grep -q "$LABEL"; then
        launchctl unload "$PLIST_PATH" 2>/dev/null || true
        echo "Daemon unloaded."
    fi
    if [ -f "$PLIST_PATH" ]; then
        rm -f "$PLIST_PATH"
        echo "Removed: $PLIST_PATH"
    else
        echo "No plist at $PLIST_PATH (nothing to remove)."
    fi
}

do_install() {
    generate_plist
    # Validate before loading — refuse to install a malformed plist.
    if ! plutil -lint "$PLIST_PATH" >/dev/null 2>&1; then
        echo "Error: generated plist failed plutil -lint: $PLIST_PATH" >&2
        rm -f "$PLIST_PATH"
        exit 1
    fi
    # Reload if already loaded so the new plist takes effect.
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
    if launchctl load "$PLIST_PATH" 2>/dev/null; then
        echo "Daemon installed and started: $LABEL"
    else
        echo "Warning: launchctl load failed. The plist is installed at:" >&2
        echo "  $PLIST_PATH" >&2
        echo "Load it manually with: launchctl load \"$PLIST_PATH\"" >&2
        exit 1
    fi
    echo "  Out log:  $LOG_DIR/daemon.log"
    echo "  Err log:  $LOG_DIR/daemon.err.log"
    echo "Status:    ./auto-loop.sh --status"
    echo "Pause:     ./stop-loop.sh --pause-daemon"
    echo "Remove:    ./install-daemon.sh --uninstall"
}

case "$ACTION" in
    uninstall)
        do_uninstall
        ;;
    dry-run)
        generate_plist
        plutil -lint "$PLIST_PATH"
        echo "Dry-run: plist generated and linted at $PLIST_PATH (launchctl NOT called)."
        ;;
    install)
        do_install
        ;;
esac
