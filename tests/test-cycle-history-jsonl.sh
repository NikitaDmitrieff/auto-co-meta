#!/bin/bash
# ============================================================
# Test: cycle-history JSONL never corrupts
# ============================================================
# Verifies append_cycle_history() in auto-loop.sh always emits a valid
# JSON line, even for pathological reasons (backslash paths, trailing
# backslash, quotes, newlines, control chars, percent signs).
#
# Root cause this guards: the old sanitizer escaped quotes but NOT
# backslashes, so a reason like "C:\Users\foo" or "path \" emitted an
# invalid JSON escape -> a corrupt line in cycle-history.jsonl. Since
# every --history/--dashboard/--costs read does `jq -s` (or `jq -r`)
# over the WHOLE file, ONE corrupt line returns nothing and nukes the
# entire dashboard/history view.
#
# Tests the REAL shipped function -- extracted via sed from auto-loop.sh,
# not a hand-maintained mirror -- so the test fails loudly if the
# function is moved/renamed, and exercises the actual sanitize + self-check.
#
# Run: ./tests/test-cycle-history-jsonl.sh
# ============================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_LOOP="$SCRIPT_DIR/../auto-loop.sh"
HISTORY_FILE="$(mktemp)"
trap 'rm -f "$HISTORY_FILE"' EXIT

pass=0; fail=0
check() {
    if [ "$2" = "$3" ]; then
        printf "  [PASS] %s\n" "$1"; pass=$((pass+1))
    else
        printf "  [FAIL] %s -- got '%s' want '%s'\n" "$1" "$2" "$3"; fail=$((fail+1))
    fi
}

command -v jq >/dev/null || { echo "FAIL: jq is required for this test"; exit 1; }

# --- Extract the REAL append_cycle_history body from auto-loop.sh ---
# Tests shipped code, not a copy. Fails loudly if the function moves.
_fn_body=$(sed -n '/^append_cycle_history() {/,/^}/p' "$AUTO_LOOP")
[ -n "$_fn_body" ] || { echo "FAIL: could not extract append_cycle_history from auto-loop.sh"; exit 1; }

# Stub the function's external deps so the extracted body runs standalone.
MODEL="test-model"
total_cost="1.23"
CYCLE_HISTORY_FILE="$HISTORY_FILE"
log() { :; }   # silent in tests
eval "$_fn_body"

# Run append_cycle_history with a reason; return 0 iff exactly one valid JSON
# line was written.
emits_valid_line() {
    local reason="$1"
    : > "$HISTORY_FILE"
    append_cycle_history 7 "fail" 0 12 1 "$reason" "true"
    [ -s "$HISTORY_FILE" ] || return 1
    [ "$(wc -l < "$HISTORY_FILE" | tr -d ' ')" = "1" ] || return 1
    tail -n1 "$HISTORY_FILE" | jq -e . >/dev/null 2>&1
}

# --- Case 1: backslash path (THE live bug -- old code corrupted this) ---
if emits_valid_line 'error in C:\Users\foo\bar'; then
    check "backslash path: valid JSON" "1" "1"
else
    check "backslash path: valid JSON" "0" "1"
fi

# --- Case 2: trailing backslash (would escape the closing quote) ---
if emits_valid_line 'path ends here \'; then
    check "trailing backslash: valid JSON" "1" "1"
else
    check "trailing backslash: valid JSON" "0" "1"
fi

# --- Case 3: double quotes ---
if emits_valid_line 'she said "hi"'; then
    check "double quotes: valid JSON" "1" "1"
else
    check "double quotes: valid JSON" "0" "1"
fi

# --- Case 4: embedded newlines + tabs + CR (must collapse to one line) ---
if emits_valid_line "$(printf 'line1\nline2\ttabbed\rthird')"; then
    check "newlines+tabs+CR: valid JSON, single line" "1" "1"
else
    check "newlines+tabs+CR: valid JSON, single line" "0" "1"
fi

# --- Case 5: combined pathological (backslash + quote + newline + percent) ---
if emits_valid_line "$(printf 'C:\\x "q" 50%%\nnew')"; then
    check "combined pathological: valid JSON" "1" "1"
else
    check "combined pathological: valid JSON" "0" "1"
fi

# --- Case 6: self-check fallback -- force a NON-reason field that breaks JSON ---
# Override MODEL to inject a raw double-quote (simulates a future field bug or
# any field the sanitizer doesn't cover). The validate-before-write guard must
# catch it and emit the sanitized record instead of a corrupt line.
: > "$HISTORY_FILE"
MODEL='bad"model'   # raw quote in a %s field -> invalid JSON
append_cycle_history 9 "fail" 0 5 1 "whatever" "true"
if tail -n1 "$HISTORY_FILE" | jq -e . >/dev/null 2>&1; then
    check "self-check: broken field falls back to valid record" "1" "1"
    _reason=$(tail -n1 "$HISTORY_FILE" | jq -r '.reason')
    check "self-check: sanitized reason marker present" "$_reason" "<sanitized: invalid reason field>"
    _cyc=$(tail -n1 "$HISTORY_FILE" | jq -r '.cycle')
    check "self-check: facts preserved (cycle)" "$_cyc" "9"
else
    check "self-check: broken field falls back to valid record" "0" "1"
fi

# --- Case 7: the fix didn't regress the happy path (plain reason, ok status) ---
if emits_valid_line 'pushed fix'; then
    check "happy path: valid JSON" "1" "1"
    # re-read and assert parsed fields round-trip
    _status=$(tail -n1 "$HISTORY_FILE" | jq -r '.status')
    check "happy path: status round-trips" "$_status" "fail"
else
    check "happy path: valid JSON" "0" "1"
fi

echo ""
echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
