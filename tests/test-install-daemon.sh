#!/bin/bash
# ============================================================
# Test: install-daemon.sh
# ============================================================
# Verifies the launchd-daemon installer without touching the real
# launchd registry: exercises --help, arg validation, --dry-run plist
# generation + lint, content correctness, and --uninstall idempotency,
# all via ACO_PLIST_PATH / ACO_LOG_DIR overrides pointed at a temp dir.
#
# No real `launchctl load` is performed by this test.
# ============================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALL="$ROOT_DIR/install-daemon.sh"

PASS=0
FAIL=0
TMP="$(mktemp -d)"
PLIST="$TMP/com.auto-co.loop.plist"
LOG_DIR="$TMP/logs"

cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

ok()   { echo "  ok   - $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL - $1"; FAIL=$((FAIL+1)); }

assert_contains() {
    # $1 = haystack file, $2 = needle
    if grep -q -F "$2" "$1"; then ok "plist contains: $2";
    else bad "plist missing: $2"; fi
}

echo "## install-daemon.sh tests"

# 1. Syntax check
if bash -n "$INSTALL"; then ok "bash -n (syntax) clean"; else bad "syntax errors"; fi

# 2. --help exits 0 and documents modes
OUT="$("$INSTALL" --help 2>&1)" && RC=$? || RC=$?
[ "$RC" -eq 0 ] && ok "--help exits 0" || bad "--help exit code $RC"
echo "$OUT" | grep -q -- "--uninstall" && ok "--help lists --uninstall" || bad "--help missing --uninstall"
echo "$OUT" | grep -q -- "--dry-run"   && ok "--help lists --dry-run"   || bad "--help missing --dry-run"

# 3. Unknown arg exits non-zero
if "$INSTALL" --no-such-flag >/dev/null 2>&1; then bad "unknown arg accepted"; else ok "unknown arg rejected"; fi

# 4. --dry-run generates a well-formed plist and does NOT call launchctl load.
#    Point PLIST_PATH and LOG_DIR at temp so ~/Library/LaunchAgents is untouched.
DRY_OUT="$(ACO_PLIST_PATH="$PLIST" ACO_LOG_DIR="$LOG_DIR" "$INSTALL" --dry-run 2>&1)" && RC=$? || RC=$?
[ "$RC" -eq 0 ] && ok "--dry-run exits 0" || bad "--dry-run exit code $RC"
[ -f "$PLIST" ] && ok "plist file created" || bad "plist file not created"
echo "$DRY_OUT" | grep -q "launchctl NOT called" && ok "--dry-run skips launchctl" || bad "--dry-run may have called launchctl"

# 5. Plist is valid XML (plutil -lint)
if plutil -lint "$PLIST" >/dev/null 2>&1; then ok "plutil -lint passes"; else bad "plutil -lint failed"; fi

# 6. Plist content correctness
assert_contains "$PLIST" "<key>Label</key>"
assert_contains "$PLIST" "<string>com.auto-co.loop</string>"
assert_contains "$PLIST" "<string>/bin/bash</string>"
assert_contains "$PLIST" "auto-loop.sh</string>"
assert_contains "$PLIST" "<key>RunAtLoad</key>"
assert_contains "$PLIST" "<true/>"
assert_contains "$PLIST" "<key>KeepAlive</key>"
assert_contains "$PLIST" "SuccessfulExit"      # crash-recovery + graceful-stop
assert_contains "$PLIST" "<key>WorkingDirectory</key>"
assert_contains "$PLIST" "daemon.log"
assert_contains "$PLIST" "daemon.err.log"

# 7. Plist PATH env var carries a resolver path (claude/jq/node under launchd)
grep -q -A1 '<key>PATH</key>' "$PLIST" && ok "PATH env var present" || bad "PATH env var missing"

# 8. --uninstall is idempotent and does not fail when nothing is loaded.
#    ACO_PLIST_PATH=temp: launchctl list|grep finds the real label only -> no-op unload.
UNOUT="$(ACO_PLIST_PATH="$PLIST" "$INSTALL" --uninstall 2>&1)" && RC=$? || RC=$?
[ "$RC" -eq 0 ] && ok "--uninstall exits 0" || bad "--uninstall exit code $RC"
[ ! -f "$PLIST" ] && ok "--uninstall removed plist" || bad "--uninstall left plist behind"

# 9. --uninstall when already absent is still clean (no crash)
if ACO_PLIST_PATH="$PLIST" "$INSTALL" --uninstall >/dev/null 2>&1; then
    ok "--uninstall idempotent on absent plist"
else
    bad "--uninstall failed on absent plist"
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
