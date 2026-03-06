#!/usr/bin/env python3
"""Auto-Co Live Cycle Watcher — clean, human-readable output."""
import sys, json, os

DIM = "\033[90m"
GREEN = "\033[32m"
CYAN = "\033[36m"
YELLOW = "\033[33m"
MAGENTA = "\033[35m"
RED = "\033[31m"
BOLD = "\033[1m"
RESET = "\033[0m"

SKIP_TOOLS = {"ToolSearch", "TodoRead"}
PREFIX = os.path.dirname(os.path.abspath(__file__)) + "/"

def short(path):
    return path.replace(PREFIX, "")

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        d = json.loads(line)
    except Exception:
        continue

    t = d.get("type")

    if t == "assistant":
        blocks = d.get("message", {}).get("content", [])
        for b in blocks:
            if b.get("type") == "text":
                txt = b.get("text", "").strip()
                if txt:
                    if len(txt) > 300:
                        txt = txt[:300] + "..."
                    print(f"{GREEN}{txt}{RESET}")

            elif b.get("type") == "tool_use":
                name = b.get("name", "")
                if name in SKIP_TOOLS:
                    continue
                inp = b.get("input", {})

                if name == "Agent":
                    desc = inp.get("description", "")
                    agent = inp.get("subagent_type", "")
                    bg = " (bg)" if inp.get("run_in_background") else ""
                    print(f"{MAGENTA}{BOLD}  AGENT{RESET}{MAGENTA} {desc} [{agent}]{bg}{RESET}")

                elif name == "Bash":
                    cmd = inp.get("command", "")
                    desc = inp.get("description", cmd[:80])
                    print(f"{YELLOW}  $ {desc}{RESET}")

                elif name in ("Read", "Glob", "Grep"):
                    path = inp.get("file_path", inp.get("pattern", ""))
                    print(f"{DIM}  {name.lower()} {short(path)}{RESET}")

                elif name in ("Write", "Edit"):
                    path = inp.get("file_path", "")
                    print(f"{CYAN}  {name.lower()} {short(path)}{RESET}")

                elif name.startswith("mcp__"):
                    s = name.replace("mcp__", "").replace("__", " ")
                    args = json.dumps(inp)[:100] if inp else ""
                    print(f"{YELLOW}  mcp {s} {DIM}{args}{RESET}")

                elif name == "Skill":
                    print(f"{MAGENTA}  skill {inp.get('skill_name', '')}{RESET}")

                else:
                    print(f"{DIM}  {name}{RESET}")

    elif t == "result":
        sub = d.get("subtype", "?")
        cost = d.get("total_cost_usd", 0)
        color = GREEN if sub == "success" else RED
        print(f"\n{color}{BOLD}=== CYCLE DONE: {sub} | ${cost:.2f} ==={RESET}\n")
