#!/bin/bash
# test-cli-template.sh -- verify `create-auto-co <name> --template <t>` actually
# applies the starter template instead of silently dropping the flag.
#
# Regression guard: before the fix, init() took only a project name and ignored
# `--template`, so the README-advertised flag did nothing. This scaffolds a real
# project from a local-clone stand-in origin and asserts the template's mission,
# Day-0 Next Action, extra dirs, and cleanup all landed.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
command -v node >/dev/null 2>&1 || { echo "[!] node required"; exit 1; }
command -v git  >/dev/null 2>&1 || { echo "[!] git required"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Stand-in origin: a clean clone of THIS repo (committed HEAD has templates/ + the fixed CLI).
git clone --quiet "$REPO_ROOT" "$TMP/origin" >/dev/null

# checkDeps() requires `claude --version`; stub it so the test runs anywhere node+git exist.
mkdir -p "$TMP/bin"
printf '#!/usr/bin/env bash\nexit 0\n' > "$TMP/bin/claude"
chmod +x "$TMP/bin/claude"
export PATH="$TMP/bin:$PATH"
export GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=test@test
export GIT_COMMITTER_NAME=test GIT_COMMITTER_EMAIL=test@test

pass=0; fail=0
assert_contains() { # file needle
  if grep -qF "$2" "$1"; then echo "  [+] PASS: $1 contains expected text"; pass=$((pass+1));
  else echo "  [-] FAIL: $1 missing: $2"; fail=$((fail+1)); fi
}
assert_exists() { # path
  if [ -e "$1" ]; then echo "  [+] PASS: exists $1"; pass=$((pass+1));
  else echo "  [-] FAIL: missing $1"; fail=$((fail+1)); fi
}
assert_missing() { # path
  if [ ! -e "$1" ]; then echo "  [+] PASS: cleaned up $1"; pass=$((pass+1));
  else echo "  [-] FAIL: should be removed $1"; fail=$((fail+1)); fi
}

echo "Scaffolding: create-auto-co saasproj --template saas"
( cd "$TMP" && AUTO_CO_REPO="file://$TMP/origin" node "$REPO_ROOT/cli/bin/auto-co.js" saasproj --template saas ) >/dev/null

P="$TMP/saasproj"
echo "Checks:"
# saas/mission.md injects into the cloned CLAUDE.md Mission section.
assert_contains "$P/CLAUDE.md" "profitable SaaS product"
# saas/consensus-next-action.md sets the Day-0 Next Action.
assert_contains "$P/memories/consensus.md" "what SaaS product to build"
# saas/template.conf EXTRA_DIRS="projects/app projects/landing" are created.
assert_exists   "$P/projects/app"
assert_exists   "$P/projects/landing"
# templates/ is removed from the scaffold after applying.
assert_missing  "$P/templates"

echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
