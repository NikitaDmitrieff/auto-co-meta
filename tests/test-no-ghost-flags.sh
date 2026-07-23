#!/bin/bash
# test-no-ghost-flags.sh -- every advertised CLI flag in auto-loop.sh must have
# a handler. Regression guard for the advertised-phantom-flag class.
#
# Three ghosts were shipped as fixes after flags appeared in the header comment
# and `--help` USAGE block with no matching handler in the arg parser, so typing
# them silently fell through into the foreground loop:
#   --template        (PR #12)  advertised, init() ignored it
#   install-daemon.sh (PR #14)  advertised in README, the script was gitignored
#   --daemon          (PR #15)  advertised, ran the foreground loop instead
#
# This test fails the moment a new `--foo` is added to any advertised surface
# (comment or help text) without a recognizer, so the class can never regress.
#
# Counts BOTH recognition styles so legitimate sub-modifiers are not false hits:
#   - top-level quoted matches:  [ "${1:-}" = "--status" ]
#   - nested unquoted case arms: --backup) DO_BACKUP=true ;;
# (e.g. --backup/--force are sub-flags of --restore, handled in its inner case.)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
F="$REPO_ROOT/auto-loop.sh"
[ -f "$F" ] || { echo "[!] $F not found"; exit 1; }

# Flags passed THROUGH to the `claude` CLI, not auto-loop's own surface.
CLAUDE_PASSED='--(model|output-format|dangerously|verbose|skip)'

# Advertised: every --flag token in comment lines or `./auto-loop.sh` usage lines.
# ponytail: -e marks the pattern (it starts with --, else grep reads it as a flag).
advertised=$(grep -hE '#|^[[:space:]]+\./auto-loop\.sh' "$F" \
  | grep -oE '\-\-[a-z][a-z-]*' \
  | grep -vE -e "$CLAUDE_PASSED" \
  | sort -u)

# Handled: quoted "--flag" recognizers AND unquoted --flag) case arms (incl. nested).
handled=$(grep -hoE '("\-\-[a-z][a-z-]*"|\-\-[a-z][a-z-]*\))' "$F" \
  | sed -e 's/"//g' -e 's/)//g' \
  | sort -u)

# Ghosts = advertised minus handled.
ghosts="$(comm -23 <(printf '%s\n' "$advertised") <(printf '%s\n' "$handled"))"

if [ -n "$ghosts" ]; then
  echo "FAIL: advertised flags with no handler (phantom/ghost flags):"
  printf '  %s\n' $ghosts
  echo ""
  echo "Each listed flag appears in a comment or --help usage line but has no"
  echo "recognizer in the arg parser, so typing it silently does nothing (or"
  echo "worse, falls through into the foreground loop). Add a handler or strip it."
  exit 1
fi

advertised_n=$(printf '%s\n' "$advertised" | grep -c .)
handled_n=$(printf '%s\n' "$handled" | grep -c .)
echo "PASS: every advertised flag has a handler (0 ghosts; $advertised_n advertised, $handled_n recognized)."
