#!/bin/bash
# ============================================================
# run-all.sh -- one-command verification gate for auto-co.
#
# Discovers and runs every tests/test-*.sh, propagates failure.
# Used locally and as the CI entry point; also the exact step the
# documented post-push/post-merge verification calls for (run every
# test file in a fresh clone, expect all green).
#
# A test file is considered "green" iff it exits 0. Each test prints
# its own "Results: N passed, N failed" line; this wrapper only adds
# the per-file pass/fail roll-up and a non-zero exit on any failure.
# ============================================================
set -u

# Resolve repo root from script location (works from a fresh clone).
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd "$script_dir/.." && pwd)
cd "$repo_root" || { echo "FAIL: cannot cd to repo root ($repo_root)"; exit 1; }

# jq is required by the test suite; fail fast with a clear message.
command -v jq >/dev/null || { echo "FAIL: jq is required (brew install jq)"; exit 1; }

shopt -s nullglob
test_files=(tests/test-*.sh)
[ "${#test_files[@]}" -gt 0 ] || { echo "FAIL: no tests found in tests/"; exit 1; }

failed=0
ran=0
echo "Running ${#test_files[@]} test file(s) from $repo_root"
echo "----------------------------------------"
for tf in "${test_files[@]}"; do
    ran=$((ran + 1))
    if bash "$tf"; then
        printf '\n  [OK]   %s\n' "$(basename "$tf")"
    else
        printf '\n  [FAIL] %s\n' "$(basename "$tf")"
        failed=$((failed + 1))
    fi
    echo "----------------------------------------"
done

echo ""
echo "Summary: $((ran - failed))/$ran test files passed"
if [ "$failed" -ne 0 ]; then
    echo "FAIL: $failed test file(s) failed"
    exit 1
fi
echo "ALL GREEN"
exit 0
