#!/bin/bash
# ============================================================
# Test: artifacts.jsonl per-cycle count must not substring-match
# ============================================================
# Verifies the adaptive-frequency idle check counts artifacts for THIS
# cycle only. The shipped expression (auto-loop.sh, ~the idle block) is
#   grep -Ec "\"cycle\":$loop_count(,|})" .../artifacts.jsonl
#
# Root cause this guards: the old bare pattern `grep -c "\"cycle\":1"`
# substring-matched `{"cycle":1`, `{"cycle":10`, `{"cycle":11},
# `{"cycle":100}` -- so cycle 1 reported 4 artifacts when only 1 existed.
# Effect: a low-numbered cycle never looked "idle" (artifacts_this_cycle
# always > 0 once higher cycles exist), so the adaptive sleep never
# kicked in. Metric/perf severity, not data loss.
#
# Fix: anchor the pattern on the JSON field terminator (`,|}`) and use
# ERE (-E) so the alternation parses on both BSD and GNU grep.
#
# This test runs the SHIPPED expression verbatim (extracted from
# auto-loop.sh, not a mirror), so it fails loudly if the line is removed
# or the anchor is dropped.
#
# Run: ./tests/test-artifacts-cycle-count.sh
# ============================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTO_LOOP="$SCRIPT_DIR/../auto-loop.sh"
FIXTURE="$(mktemp)"
trap 'rm -f "$FIXTURE"' EXIT

pass=0; fail=0
check() {
    if [ "$2" = "$3" ]; then
        printf "  [PASS] %s\n" "$1"; pass=$((pass+1))
    else
        printf "  [FAIL] %s -- got '%s' want '%s'\n" "$1" "$2" "$3"; fail=$((fail+1))
    fi
}

# Fixture: the over-count trap -- cycles 1, 10, 11, 100 present.
cat > "$FIXTURE" <<'EOF'
{"cycle":1,"type":"commit","ref":"aaa","path":"x","created_by":"a"}
{"cycle":10,"type":"deploy","ref":"bbb","path":"y","created_by":"b"}
{"cycle":11,"type":"file","ref":"ccc","path":"z","created_by":"c"}
{"cycle":100,"type":"pr","ref":"ddd","path":"w","created_by":"d"}
EOF

# --- Extract the SHIPPED artifacts-count line from auto-loop.sh ---
# Tests shipped code, not a copy. Fails loudly if the expression moves.
_line=$(grep -E '^[[:space:]]*artifacts_this_cycle=\$\(grep' "$AUTO_LOOP" | head -1)
[ -n "$_line" ] || { echo "FAIL: artifacts-count expression not found in auto-loop.sh"; exit 1; }

# Run the shipped expression for a given cycle against the fixture.
# The line references $loop_count and $PROJECT_DIR/$STATE_DIR/artifacts.jsonl,
# so point PROJECT_DIR at a dir that holds a copy named artifacts.jsonl.
count_for() {
    local n="$1" d
    d="$(mktemp -d)"
    cp "$FIXTURE" "$d/artifacts.jsonl"
    PROJECT_DIR="$d"; STATE_DIR=""; loop_count="$n"; artifacts_this_cycle=0
    eval "$_line"
    printf '%s' "${artifacts_this_cycle:-0}"
    rm -rf "$d"
}

# --- The over-count cases (red without the fix) ---
check "cycle 1 -- substring bug would count 4" "$(count_for 1)"   "1"
check "cycle 10 -- substring bug would count 2" "$(count_for 10)"  "1"
check "cycle 11 -- true 1"                     "$(count_for 11)"  "1"
check "cycle 100 -- true 1"                    "$(count_for 100)" "1"

# --- Negative case: no such cycle must read 0 (drives the idle branch) ---
check "cycle 2 -- absent cycle -> 0"           "$(count_for 2)"   "0"

echo ""
echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
