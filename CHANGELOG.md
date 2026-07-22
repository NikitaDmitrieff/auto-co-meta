# Changelog

All notable changes to the **auto-co framework** are documented here.

> **How delivery works:** `npx create-auto-co` runs `git clone --depth 1` of this repository at install time (see `cli/bin/auto-co.js`). So changes to `auto-loop.sh` and other loop files reach **new users as soon as they land on `main`** — no npm version bump is required for loop-script fixes. The npm package version (currently 1.1.1) tracks the **CLI scaffolder** itself, not the loop script.

## [Unreleased]

These changes are committed locally but **not yet on `main`** — the maintainer repo is not pushable by this contributor, so they are delivered as a **contribution PR** (see the linked pull request). They reach users the instant they are merged into `main`; because `create-auto-co` clones this repo, no npm-side change is required.

### Fixed
- **Loop no longer discards valid consensus on non-fatal cycle failures.** Previously, a cycle that failed non-fatally (e.g. a timeout, or a subagent/MCP error that did not corrupt the consensus) still wiped the consensus relay baton, forcing the next cycle to start from a blank slate and losing cross-cycle context. Consensus is now conditionally restored when the failure was not fatal. (`19995fb`)
- **Restore no longer logs a false "restored" when no backup exists.** On the very first cycle (or any cycle where no `.bak` was ever written), a failed cycle with an invalid consensus used to print "Consensus restored from backup" while leaving the invalid file in place — silently carrying a corrupt relay baton into the next cycle. `restore_consensus` now returns a distinct status and logs `WARNING: no consensus backup to restore from` so a missing backup is visible, not masked. (`7833f91`)
- **`cycle-history.jsonl` can no longer be silently corrupted.** The history writer escaped quotes and newlines but **not backslashes**, so a `reason` containing a Windows-style path (`C:\Users\foo`) or a trailing `\` emitted an invalid JSON escape. Since every `--history` / `--dashboard` / `--costs` read does `jq -s` over the whole file, **one bad line returned nothing and nuked the entire dashboard**. The writer now escapes backslash first (order matters), collapses control chars to space, and self-checks each record with `jq -e` before it touches the file — falling back to a guaranteed-valid minimal record if any field ever breaks JSON. One corrupt line can never enter the file. (`919bbcd`)
- **Webhook / notification payloads can no longer be broken by their own content.** `send_webhook` and `send_notification` built JSON with `printf '... "model":"%s" ... "reason":"%s"' "$MODEL" "$reason"`, so a `"` or `\` in any string field emitted **invalid JSON that the receiver rejected or misparsed**. The live trigger is the `error` event, whose `reason` comes straight from captured command output and routinely contains quotes and backslashes (e.g. `parse error: "unexpected" at C:\Users\foo`). A new `json_escape` helper now escapes every string field (backslash first, then quote, then control chars); numeric fields are untouched. Added `tests/test-notify-json.sh` (16 assertions) proving pathological `MODEL`/status/reason values produce valid, round-tripping JSON.

### Added
- **Cycle-failure `reason` surfaced in `--history` and `--dashboard`.** `auto-loop.sh --history` now prints a REASON column (full table) and a `[reason]` suffix (compact mode); `--dashboard` prints the reason inline (red) on any failed cycle. Older records written before this telemetry degrade gracefully to `-` (they never captured a reason). Glance at history/dashboard to see *why* a cycle failed, not just *that* it did. (`de09690`)
- **One-command test gate: `tests/run-all.sh`.** Discovers and runs every `tests/test-*.sh`, propagates failure, and prints a per-file roll-up. CI-ready, and the exact step the fresh-clone verification uses. Current suite: 36 assertions across 3 files, all green.

## History

Releases `1.1.0` and `1.1.1` of the `create-auto-co` CLI were published 2026-03-07 and predate this changelog. See `git log` for earlier history.
