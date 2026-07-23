#!/bin/bash
# Regression test for the --daemon ghost fix.
#
# Background: auto-loop.sh advertised "./auto-loop.sh --daemon" in its usage
# comment and --help text, but no such mode existed -- an unrecognized flag
# fell through to the foreground loop, so `--daemon` silently ran in the
# foreground (a footgun: a user who thought they had daemonized had not).
#
# This PR (a) stops advertising the flag and (b) recognizes it with a truthful
# no-op message. These tests lock both halves in so the ghost cannot return.
#
# CI-safe: never starts the real loop, never touches launchd.
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
AUTO_LOOP="$SCRIPT_DIR/auto-loop.sh"

PASS=0
FAIL=0

ok()   { PASS=$((PASS + 1)); echo "  ok - $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  not ok - $1"; }

echo "## --daemon ghost fix"

# 1. Script still parses.
if bash -n "$AUTO_LOOP" 2>/dev/null; then
    ok "auto-loop.sh passes bash -n syntax check"
else
    fail "auto-loop.sh fails bash -n syntax check"
fi

# 2. --help exits 0.
if "$AUTO_LOOP" --help >/dev/null 2>&1; then
    ok "--help exits 0"
else
    fail "--help does not exit 0"
fi

# 3. --help must NOT advertise --daemon (the ghost is gone from the surface).
HELP_OUT="$("$AUTO_LOOP" --help 2>/dev/null)"
if printf '%s' "$HELP_OUT" | /usr/bin/grep -q -- "--daemon"; then
    fail "--help still advertises --daemon (ghost not stripped)"
else
    ok "--help no longer advertises --daemon"
fi

# 4. The stripped advertisement phrase must be gone everywhere. The original
#    header comment and --help line both said "Run via launchd (no tty)" --
#    that exact phrase is the ghost's signature and must not remain.
if /usr/bin/grep -q -- "Run via launchd (no tty)" "$AUTO_LOOP"; then
    fail "advertised phrase 'Run via launchd (no tty)' still present"
else
    ok "advertised phrase 'Run via launchd (no tty)' fully removed"
fi

# 5. ./auto-loop.sh --daemon must exit 0 (recognized, not an error).
DAEMON_OUT="$("$AUTO_LOOP" --daemon 2>/dev/null)"; DAEMON_RC=$?
if [ "$DAEMON_RC" -eq 0 ]; then
    ok "--daemon exits 0"
else
    fail "--daemon exits $DAEMON_RC (expected 0)"
fi

# 6. --daemon output must explain there is no separate daemon mode.
if printf '%s' "$DAEMON_OUT" | /usr/bin/grep -qi "not a separate mode"; then
    ok "--daemon output states there is no separate mode"
else
    fail "--daemon output does not explain itself: $(printf '%s' "$DAEMON_OUT" | head -1)"
fi

# 7. --daemon output must point to a real launchd mechanism.
if printf '%s' "$DAEMON_OUT" | /usr/bin/grep -qE "install-daemon\.sh|--schedule"; then
    ok "--daemon output points at a real launchd mechanism (install-daemon.sh / --schedule)"
else
    fail "--daemon output points at no real launchd mechanism"
fi

# 8. --daemon must NOT start a foreground loop. Proof: a bare foreground run
#    would block indefinitely / emit cycle output, never exit 0 with this short
#    message. A non-empty, short, exit-0 response proves it was handled, not
#    swallowed into the loop.
LINES=$(printf '%s\n' "$DAEMON_OUT" | /usr/bin/grep -c .)
if [ "$DAEMON_RC" -eq 0 ] && [ "$LINES" -ge 1 ] && [ "$LINES" -le 12 ]; then
    ok "--daemon returns a short handled message, not a foreground loop ($LINES lines, rc $DAEMON_RC)"
else
    fail "--daemon response looks like a loop, not a handler ($LINES lines, rc $DAEMON_RC)"
fi

echo
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
