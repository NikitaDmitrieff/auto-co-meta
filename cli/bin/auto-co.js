#!/usr/bin/env node

import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, basename } from "path";

const VERSION = "1.1.0";
const REPO = "https://github.com/NikitaDmitrieff/auto-co-meta.git";

const HELP = `
auto-co v${VERSION} -- Run an autonomous AI company from a bash loop

Usage:
  npx create-auto-co [name]   Scaffold a new auto-co project
  auto-co init [name]         Same as above
  auto-co start               Start the autonomous loop
  auto-co stop                Stop the loop gracefully
  auto-co status              Show loop status
  auto-co doctor              Run health check
  auto-co --version           Show version
  auto-co --help              Show this help

Quick start:
  npx create-auto-co my-company
  cd my-company
  cp .env.example .env        # Add your API keys
  nano CLAUDE.md              # Set your product mission
  make start                  # Launch the autonomous loop

Docs: https://runautoco.com
Repo: https://github.com/NikitaDmitrieff/auto-co-meta
`;

function step(msg) {
  process.stdout.write(`  [+] ${msg} ... `);
}

function done() {
  console.log("done");
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe", ...opts }).trim();
  } catch (e) {
    if (opts.silent) return null;
    console.error(`Error running: ${cmd}`);
    console.error(e.stderr || e.message);
    process.exit(1);
  }
}

function checkDeps() {
  const missing = [];
  try { run("git --version", { silent: true }); } catch { missing.push("git"); }
  try { run("claude --version", { silent: true }); } catch { missing.push("claude (Claude Code CLI)"); }

  if (missing.length > 0) {
    console.error("Missing required dependencies:");
    missing.forEach((d) => console.error(`  - ${d}`));
    if (missing.includes("claude (Claude Code CLI)")) {
      console.error("\nInstall Claude Code: npm install -g @anthropic-ai/claude-code");
    }
    process.exit(1);
  }
}

function init(name) {
  const dir = name || "auto-co-project";
  const target = resolve(process.cwd(), dir);

  if (existsSync(target)) {
    console.error(`Directory '${dir}' already exists. Pick a different name or delete it first.`);
    process.exit(1);
  }

  checkDeps();

  console.log(`\n  auto-co v${VERSION}\n`);
  console.log(`  Scaffolding autonomous AI company in ./${dir}\n`);

  // Clone the repo (shallow for speed)
  step("Cloning auto-co framework");
  run(`git clone --depth 1 ${REPO} "${target}"`, { stdio: "pipe" });
  done();

  // Remove the .git directory so it's a fresh project
  run(`rm -rf "${target}/.git"`);

  // Remove meta-specific files
  step("Cleaning up meta files");
  const metaFiles = [
    "memories/consensus.md",
    "niche-opportunity-research-2026-03-06.md",
    "PUBLISH_NOW.md",
    "social-preview.png",
    "AGENTS.md",
    "cli",
    "projects/landing",
    "docs/marketing",
    "docs/ceo",
    "docs/cto",
    "docs/critic",
    "docs/product",
    "docs/ui",
    "docs/interaction",
    "docs/fullstack",
    "docs/qa",
    "docs/devops",
    "docs/operations",
    "docs/sales",
    "docs/cfo",
    "docs/research",
    "demos",
    "snapshots",
    "logs",
    "dashboard",
  ];

  for (const f of metaFiles) {
    const p = resolve(target, f);
    if (existsSync(p)) {
      run(`rm -rf "${p}"`, { silent: true });
    }
  }
  done();

  // Create fresh directories
  step("Creating project structure");
  const dirs = [
    "memories",
    "docs/ceo", "docs/cto", "docs/critic", "docs/product",
    "docs/ui", "docs/interaction", "docs/fullstack", "docs/qa",
    "docs/devops", "docs/marketing", "docs/operations", "docs/sales",
    "docs/cfo", "docs/research",
    "projects",
    "logs",
    "snapshots",
  ];
  for (const d of dirs) {
    mkdirSync(resolve(target, d), { recursive: true });
  }
  done();

  // Create empty human escalation files
  writeFileSync(resolve(target, "memories/human-request.md"), "");
  writeFileSync(resolve(target, "memories/human-response.md"), "");

  // Create initial consensus
  step("Writing Day 0 consensus");
  writeFileSync(
    resolve(target, "memories/consensus.md"),
    `# Auto Company Consensus

## Last Updated
${new Date().toISOString()}

## Current Phase
Day 0

## What We Did This Cycle
- Project initialized via auto-co CLI

## Key Decisions Made
- None yet -- first cycle will brainstorm

## Active Projects
- None yet

## Metrics
- Revenue: $0
- Users: 0
- MRR: $0
- Deployed Services: none
- Cost/month: $0

## Next Action
CEO calls a strategy meeting. Each agent proposes one product idea. End by ranking top 3.

## Company State
- Product: TBD
- Tech Stack: TBD
- Revenue: $0
- Users: 0

## Human Escalation
- Pending Request: no
- Last Response: N/A
- Awaiting Response Since: N/A

## Open Questions
- What should we build?
`
  );
  done();

  // Initialize git
  step("Initializing git repository");
  run(`git init "${target}"`, { stdio: "pipe" });
  run(`git -C "${target}" add -A`);
  run(`git -C "${target}" commit -m "Initial auto-co project scaffold"`, { stdio: "pipe" });
  done();

  console.log(`
  Your autonomous AI company is ready.

  Project structure:
    ${dir}/
    ├── CLAUDE.md          # Company constitution (edit this first!)
    ├── PROMPT.md          # Autonomous loop instructions
    ├── auto-loop.sh       # Main loop script
    ├── Makefile            # make start | stop | monitor
    ├── .env.example        # API keys template
    ├── memories/           # Cross-cycle state relay
    ├── docs/               # Agent output directories (14 roles)
    ├── projects/           # Built projects go here
    └── .claude/agents/     # 14 AI agent definitions

  Get started:
    cd ${dir}
    cp .env.example .env        # Add your Anthropic API key
    nano CLAUDE.md              # Set your company mission
    make start                  # Launch the autonomous loop

  What happens next:
    Cycle 1: Your AI CEO calls a strategy meeting.
             14 agents brainstorm product ideas and rank top 3.
    Cycle 2: Market validation, financial analysis, go/no-go.
    Cycle 3+: Code ships. Every cycle produces artifacts.

  Docs: https://runautoco.com
  Repo: https://github.com/NikitaDmitrieff/auto-co-meta
`);
}

function delegateToLoop(flag) {
  const loop = resolve(process.cwd(), "auto-loop.sh");
  if (!existsSync(loop)) {
    console.error("Not in an auto-co project directory (auto-loop.sh not found).");
    console.error("Run 'auto-co init [name]' to create a new project first.");
    process.exit(1);
  }
  const child = spawn("bash", [loop, flag], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code || 0));
}

// Main
const args = process.argv.slice(2);
const cmd = args[0];

const COMMANDS = new Set(["init", "start", "stop", "status", "doctor", "--version", "-v", "--help", "-h"]);

switch (cmd) {
  case "init":
    init(args[1]);
    break;
  case "start":
    delegateToLoop("");
    break;
  case "stop":
    delegateToLoop("--stop");
    break;
  case "status":
    delegateToLoop("--status");
    break;
  case "doctor":
    delegateToLoop("--doctor");
    break;
  case "--version":
  case "-v":
    console.log(`auto-co v${VERSION}`);
    break;
  case "--help":
  case "-h":
  case undefined:
    console.log(HELP);
    break;
  default:
    // Treat unknown args as project names: `npx create-auto-co my-company`
    if (!cmd.startsWith("-")) {
      init(cmd);
    } else {
      console.error(`Unknown option: ${cmd}`);
      console.log(HELP);
      process.exit(1);
    }
}
