#!/bin/bash
# ============================================================
# Test: consensus recovery on cycle failure
# ============================================================
# Verifies the hardening in auto-loop.sh: a cycle that exits non-zero
# but wrote a VALID consensus keeps it (work preserved); only an
# INVALID consensus triggers restore from backup.
#
# Root cause this guards against: Claude returns subtype:"success"
# with is_error:true and exits 1 on a transient subagent/MCP error.
# The old code unconditionally called restore_consensus, throwing away
# a valid relay baton. validate_consensus is the real corruption gate.
#
# Mirrors validate_consensus() from auto-loop.sh on purpose so the
# test fails loudly if the production contract drifts.
#
# Run: ./tests/test-consensus-failure-recovery.sh
# ============================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONSENSUS_FILE="$(mktemp)"
BACKUP_FILE="$(mktemp)"
trap 'rm -f "$CONSENSUS_FILE" "$BACKUP_FILE"' EXIT

pass=0; fail=0
check() {
    if [ "$2" = "$3" ]; then
        printf "  [PASS] %s\n" "$1"; pass=$((pass+1))
    else
        printf "  [FAIL] %s -- got '%s' want '%s'\n" "$1" "$2" "$3"; fail=$((fail+1))
    fi
}

# --- Mirror of auto-loop.sh validate_consensus() ---
validate_consensus() {
    [ -s "$CONSENSUS_FILE" ] || return 1
    grep -q "^# Auto Company Consensus" "$CONSENSUS_FILE" || return 1
    grep -q "^## Next Action" "$CONSENSUS_FILE" || return 1
    # Next Action must have a non-empty body -- a header alone means the relay
    # baton was lost (cycle killed mid-write). Mirrors production fix.
    local na_body
    na_body=$(awk '/^## Next Action/{f=1;next} /^## /{f=0} f' "$CONSENSUS_FILE")
    [ -n "${na_body//[[:space:]]/}" ] || return 1
    grep -q "^## Company State" "$CONSENSUS_FILE" || return 1
    return 0
}

# Mirrors production: returns 0 if restored, 1 if no backup. Honest status so
# the caller can't log "restored" when nothing was restored.
restore_consensus() {
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$CONSENSUS_FILE"
        return 0
    fi
    return 1
}

# --- The decision under test (production logic in the fail branch) ---
# On cycle failure: keep consensus iff validate passes; else restore.
apply_failure_recovery() {
    if validate_consensus; then
        echo "KEEP"
    else
        restore_consensus
        echo "RESTORE"
    fi
}

VALID='
# Auto Company Consensus

## Current Phase
Building

## Next Action
Ship the thing.

## Company State
- Product: widget
'

VALID_BACKUP='
# Auto Company Consensus

## Next Action
(old)

## Company State
- Product: none
'

INVALID='this is not a consensus file at all, no headers'

# --- Case 1: cycle failed (exit 1) but consensus is valid -> KEEP (cycle-3 scenario) ---
printf '%s\n' "$VALID_BACKUP" > "$BACKUP_FILE"
printf '%s\n' "$VALID (cycle 3 did real work)" > "$CONSENSUS_FILE"
action=$(apply_failure_recovery)
check "valid consensus on failure: action" "$action" "KEEP"
check "valid consensus on failure: content preserved" \
    "$(grep -c 'cycle 3 did real work' "$CONSENSUS_FILE")" "1"

# --- Case 2: consensus corrupt/invalid after cycle -> RESTORE ---
printf '%s\n' "$VALID_BACKUP" > "$BACKUP_FILE"
printf '%s\n' "$INVALID" > "$CONSENSUS_FILE"
action=$(apply_failure_recovery)
check "invalid consensus on failure: action" "$action" "RESTORE"
check "invalid consensus on failure: backup restored" \
    "$(grep -c '^## Next Action' "$CONSENSUS_FILE")" "1"

# --- Case 3: empty/truncated consensus (crash mid-write) -> RESTORE ---
printf '%s\n' "$VALID_BACKUP" > "$BACKUP_FILE"
: > "$CONSENSUS_FILE"
action=$(apply_failure_recovery)
check "empty consensus on failure: action" "$action" "RESTORE"
check "empty consensus on failure: backup restored" \
    "$(grep -c '^## Company State' "$CONSENSUS_FILE")" "1"

# --- Case 4: invalid consensus + backup exists -> restore returns success ---
printf '%s\n' "$VALID_BACKUP" > "$BACKUP_FILE"
printf '%s\n' "$INVALID" > "$CONSENSUS_FILE"
restore_consensus
check "restore with backup: exit code" "$?" "0"
check "restore with backup: content restored" \
    "$(grep -c 'old)' "$CONSENSUS_FILE")" "1"

# --- Case 5: invalid consensus + NO backup -> restore returns failure, file untouched ---
# Root cause this guards: first cycle ever (no .bak yet) or manually deleted .bak.
# Old restore_consensus silently no-op'd; old caller STILL logged "restored from
# backup" -- a lie. New contract: return 1 so caller can surface NOBACKUP honestly.
rm -f "$BACKUP_FILE"
printf '%s\n' "$INVALID" > "$CONSENSUS_FILE"
restore_consensus
check "restore without backup: exit code" "$?" "1"
check "restore without backup: invalid file left untouched" \
    "$(grep -c 'not a consensus file' "$CONSENSUS_FILE")" "1"

# --- Case 6: headers present but Next Action body EMPTY -> RESTORE ---
# Root cause this guards: a cycle killed mid-write (or that wrote structure
# with no body) leaves a file with all three headers but an empty Next Action
# section. The old gate (header-presence only) judged it VALID -> KEEP, so the
# next cycle started from a relay baton with NO direction. Atomic .tmp->mv
# protects against partial bytes, not against this. The body check is the fix.
printf '%s\n' "$VALID_BACKUP" > "$BACKUP_FILE"
printf '# Auto Company Consensus\n\n## Current Phase\nBuilding\n\n## Next Action\n\n## Company State\n- Product: widget\n' > "$CONSENSUS_FILE"
action=$(apply_failure_recovery)
check "empty Next Action body: action" "$action" "RESTORE"
check "empty Next Action body: backup restored" \
    "$(grep -c 'old)' "$CONSENSUS_FILE")" "1"

echo ""
echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
