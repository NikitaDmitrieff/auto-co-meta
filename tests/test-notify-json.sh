#!/bin/bash
# ============================================================
# Test: notify/webhook payloads are always valid JSON
# ============================================================
# Verifies send_webhook() + send_notification() in auto-loop.sh emit valid
# JSON even when $MODEL, a status, or an error reason contains characters
# that break a raw printf-into-JSON: double-quote, backslash, newline, CR, tab.
#
# Root cause this guards: those functions built JSON via
#   printf '... "model":"%s" ... "reason":"%s"' "$MODEL" "$reason"
# A " or \ in the value terminates/escapes the field wrong -> invalid JSON ->
# the receiver (Slack/Discord/custom webhook) rejects or misparses the whole
# event. The live trigger is the `error` event, whose `reason` ($3) comes
# straight from captured command output and routinely contains quotes/backslashes
# (e.g. 'parse error: "unexpected" at C:\Users\foo').
#
# Tests the REAL shipped functions -- extracted via sed from auto-loop.sh, not
# a hand-maintained mirror -- and stubs `curl` to capture the payload instead
# of posting it. Fails loudly if a function is moved/renamed.
#
# Run: ./tests/test-notify-json.sh
# ============================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_LOOP="$SCRIPT_DIR/../auto-loop.sh"

pass=0; fail=0
check() {
    if [ "$2" = "$3" ]; then
        printf "  [PASS] %s\n" "$1"; pass=$((pass+1))
    else
        printf "  [FAIL] %s -- got '%s' want '%s'\n" "$1" "$2" "$3"; fail=$((fail+1))
    fi
}

command -v jq >/dev/null || { echo "FAIL: jq is required for this test"; exit 1; }

# --- Extract the REAL functions from auto-loop.sh (tests shipped code) ---
_extract() { sed -n "/^$1() {/,/^}/p" "$AUTO_LOOP"; }
for _f in json_escape send_notification send_webhook; do
    _body=$(_extract "$_f")
    [ -n "$_body" ] || { echo "FAIL: could not extract $_f from auto-loop.sh"; exit 1; }
    eval "$_body"
done

# --- Stub deps so the extracted bodies run standalone (no network) ---
MODEL="test-model"
total_cost="1.23"
PROJECT_DIR="/tmp/proj"
MAX_CONSECUTIVE_ERRORS=5
COOLDOWN_SECONDS=30
LIMIT_WAIT_SECONDS=60
NOTIFY_URL="http://example/notify"
WEBHOOK_URL="http://example/hook"

CAPTURE="$(mktemp)"
trap 'rm -f "$CAPTURE"' EXIT
# Capture the -d payload, drop everything else, no network. The shipped functions
# call this backgrounded (`curl ... &`), so callers must `wait` before reading.
curl() {
    local d=""
    while [ $# -gt 0 ]; do
        case "$1" in
            -d) d="$2"; shift 2;;
            *) shift;;
        esac
    done
    printf '%s' "$d" > "$CAPTURE"
}

payload_valid() { [ -s "$CAPTURE" ] && jq -e . "$CAPTURE" >/dev/null 2>&1; }
field() { jq -r "$1" "$CAPTURE"; }

# --- Case 1: json_escape unit -- direct char mapping ---
check "escape: backslash"   "$(json_escape 'a\b')"              'a\\b'
check "escape: quote"       "$(json_escape 'a"b')"              'a\"b'
check "escape: newline"     "$(json_escape "$(printf 'a\nb')")" 'a\nb'
check "escape: tab"         "$(json_escape "$(printf 'a\tb')")" 'a\tb'

# --- Case 2: send_webhook error -- reason from captured output (THE live path) ---
: > "$CAPTURE"
send_webhook "error" 7 'parse error: "unexpected" at C:\Users\foo' 2
wait
if payload_valid; then
    check "webhook error: valid JSON (quote+backslash reason)" "1" "1"
    check "webhook error: reason round-trips" "$(field '.reason')" 'parse error: "unexpected" at C:\Users\foo'
else
    check "webhook error: valid JSON (quote+backslash reason)" "0" "1"
    check "webhook error: reason round-trips" "" 'parse error: "unexpected" at C:\Users\foo'
fi

# --- Case 3: send_webhook error -- newline in reason (would split the JSON) ---
: > "$CAPTURE"
send_webhook "error" 8 "$(printf 'multi\nline reason')" 1
wait
if payload_valid; then
    check "webhook error: valid JSON (newline reason)" "1" "1"
    check "webhook error: newline reason round-trips" "$(field '.reason')" "$(printf 'multi\nline reason')"
else
    check "webhook error: valid JSON (newline reason)" "0" "1"
fi

# --- Case 4: send_webhook cycle.end -- status containing a quote ---
: > "$CAPTURE"
send_webhook "cycle.end" 9 'partially"done' 0.5 12
wait
check "webhook cycle.end: valid JSON (quote in status)" "$(payload_valid && echo 1 || echo 0)" "1"

# --- Case 5: send_webhook base -- MODEL + project with quotes/backslashes ---
: > "$CAPTURE"
MODEL='claude-"opus"'
PROJECT_DIR='/tmp/bad"name\dir'
send_webhook "cycle.start" 10
wait
if payload_valid; then
    check "webhook base: valid JSON (quote in MODEL+project)" "1" "1"
    check "webhook base: MODEL round-trips" "$(field '.model')" 'claude-"opus"'
else
    check "webhook base: valid JSON (quote in MODEL+project)" "0" "1"
fi

# --- Case 6: send_notification -- MODEL with quote (the original bug class) ---
: > "$CAPTURE"
MODEL='claude-"opus"'
send_notification 11 "ok" 0.4 9
wait
if payload_valid; then
    check "notify: valid JSON (quote in MODEL)" "1" "1"
    check "notify: MODEL round-trips" "$(field '.model')" 'claude-"opus"'
else
    check "notify: valid JSON (quote in MODEL)" "0" "1"
fi

# --- Case 7: happy path still valid + round-trips ---
: > "$CAPTURE"
MODEL="normal-model"
send_webhook "cycle.end" 12 "ok" 0.3 8
wait
if payload_valid; then
    check "happy path: valid JSON" "1" "1"
    check "happy path: status round-trips" "$(field '.status')" "ok"
else
    check "happy path: valid JSON" "0" "1"
fi

# --- Case 8: disabled paths short-circuit cleanly (no payload, no error) ---
: > "$CAPTURE"
NOTIFY_URL=""
send_notification 13 "ok" 0 1
wait
check "notify: empty URL short-circuits (no payload)" "$(wc -c < "$CAPTURE" | tr -d ' ')" "0"

echo ""
echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
