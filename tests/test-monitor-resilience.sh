#!/bin/bash
# test-monitor-resilience.sh -- monitor.sh analytics must tolerate a stray or
# corrupt line in logs/cycle-history.jsonl instead of aborting and falsely
# reporting "All clear" (a false-negative in monitoring).
#
# Regression guard: before the fix, one malformed line aborted `jq -s` for the
# whole file, so --alerts/--costs/--compare/--trend/--dashboard/--health all
# emitted parse errors and reported empty / zero cycle counts.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
command -v jq >/dev/null 2>&1 || { echo "[!] jq required"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
H="$TMP/cycle-history.jsonl"

# Two valid cycles + one stray non-JSON line (the real repo had exactly this).
{
  printf '{"cycle":1,"status":"ok","cost":0.10,"duration_s":10,"model":"opus","exit_code":0}\n'
  printf 'NOT-JSON stray line | cycle=x | corrupt\n'
  printf '{"cycle":2,"status":"fail","cost":0.20,"duration_s":20,"model":"opus","exit_code":1}\n'
} > "$H"

pass=0; fail=0
ok() { echo "  [+] PASS: $1"; pass=$((pass+1)); }
no() { echo "  [-] FAIL: $1"; fail=$((fail+1)); }

echo "Resilience unit (the jqh pattern monitor.sh now uses):"

# 1. The OLD bare-slurp pattern must abort on a corrupt line (documents the bug).
old=$(jq -s 'length' "$H" 2>/dev/null || true)
if [ -z "$old" ]; then ok "bare jq -s aborts on corrupt line (bug reproduced)"; else no "bare jq -s returned '$old' (expected no output)"; fi

# 2. The resilient per-line filter counts ALL valid lines (a neighbour of the
#    bad line must NOT be swallowed -- jq stream-resync would drop it).
got=$(jq -R 'fromjson? // empty' "$H" | jq -s 'length')
if [ "$got" = "2" ]; then ok "per-line filter counts 2 valid lines (got $got)"; else no "expected 2 valid lines, got '$got'"; fi

# 3. Failure detection survives the filter (the false-green regression).
fails=$(jq -R 'fromjson? // empty' "$H" | jq -s '[.[-10:] | .[] | select(.status=="fail")] | length')
if [ "$fails" = "1" ]; then ok "fail-count still detects 1 failure through filter"; else no "expected 1 failure detected, got '$fails'"; fi

echo "Structural guard (monitor.sh wired correctly):"

# 4. monitor.sh wires the per-line resilience filter into its history reads.
if grep -qE 'fromjson\?' "$REPO_ROOT/monitor.sh"; then ok "monitor.sh uses per-line fromjson? filter"; else no "monitor.sh missing fromjson? filter"; fi

# 5. No bare slurp/stream jq over HISTORY_FILE remains (all reads route via helper).
if grep -qE 'jq -(s|r) [^|]*"\$HISTORY_FILE"' "$REPO_ROOT/monitor.sh"; then no "bare jq -s/-r over \$HISTORY_FILE remains"; else ok "all history reads route through resilient helper"; fi

echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
