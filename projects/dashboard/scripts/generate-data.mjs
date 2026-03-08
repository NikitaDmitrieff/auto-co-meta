#!/usr/bin/env node
/**
 * Reads consensus.md + git log from the parent repo and writes
 * src/data/state.json so dashboard pages can import real data.
 *
 * Run: node scripts/generate-data.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../.."); // auto-co-meta repo root
const OUT = resolve(__dirname, "../src/data/state.json");

// ── Parse consensus.md ──────────────────────────────────────────────
function parseConsensus() {
  let raw;
  try {
    raw = readFileSync(resolve(ROOT, "memories/consensus.md"), "utf-8");
  } catch {
    return null;
  }

  const get = (heading) => {
    const re = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };

  // Extract cycle number from "What We Did This Cycle"
  const cycleMatch = raw.match(/Cycle (\d+)/);
  const cycleNumber = cycleMatch ? parseInt(cycleMatch[1], 10) : 0;

  // Extract phase
  const phaseSection = get("Current Phase");
  const phase = phaseSection.split("--")[0].trim() || "Unknown";

  // Extract metrics
  const metricsSection = get("Metrics");
  const metric = (label) => {
    const re = new RegExp(`${label}:\\s*(.+)`);
    const m = metricsSection.match(re);
    return m ? m[1].trim() : "0";
  };

  const totalCostRaw = metric("Total cost") || metric("Cost/month") || "$0";
  // Extract dollar amount from strings like "~$199 (105 cycle runs)"
  const totalCostNum = (() => {
    const m = totalCostRaw.match(/\$?([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
  })();
  const revenue = metric("Revenue");
  const users = metric("Users");
  const stars = metric("GitHub stars");
  const forks = metric("GitHub forks");
  const cloners = (() => {
    const m = users.match(/(\d+)\s*cloners/);
    return m ? parseInt(m[1], 10) : 0;
  })();

  // Extract next action (first non-empty line, strip markdown bold)
  const nextActionLines = get("Next Action").split("\n").filter(Boolean);
  const nextAction = (nextActionLines[0] || "")
    .replace(/\*\*/g, "")
    .replace(/^\d+\.\s*/, "")
    .trim();

  // Extract what we did
  const whatWeDid = get("What We Did This Cycle")
    .split("\n")
    .filter((l) => l.startsWith("- ") || /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^[-\d.]+\s*\*?\*?/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  // Extract active projects
  const projectsSection = get("Active Projects");
  const projects = projectsSection
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => {
      const m = l.match(/\*\*(.+?)\*\*:\s*(.+)/);
      return m ? { name: m[1], status: m[2].trim() } : null;
    })
    .filter(Boolean);

  // Extract human escalation
  const escalation = get("Human Escalation");
  const pendingRequest = /Pending Request:\s*(YES|yes|true)/i.test(escalation);

  // Extract distribution tracker
  const distSection = get("Distribution Tracker");
  const distRows = distSection
    .split("\n")
    .filter((l) => l.startsWith("|") && !l.includes("---") && !l.includes("Channel"))
    .map((l) => {
      const cols = l.split("|").filter(Boolean).map((c) => c.trim());
      return cols.length >= 3 ? { channel: cols[0], status: cols[1], url: cols[2] } : null;
    })
    .filter(Boolean);

  return {
    cycleNumber,
    phase,
    totalCostRaw,
    totalCostNum,
    revenue,
    users,
    stars,
    forks,
    cloners,
    nextAction,
    whatWeDid,
    projects,
    pendingRequest,
    distribution: distRows,
  };
}

// ── Git data ────────────────────────────────────────────────────────
function getGitData() {
  const logRaw = execSync(
    `git log --format='%h|%s|%ai' -20`,
    { cwd: ROOT, encoding: "utf-8" }
  );

  const commits = logRaw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, msg, date] = line.split("|");
      return { hash, msg, date };
    });

  // Get open PRs if gh is available
  let openPRs = [];
  try {
    const prRaw = execSync(
      `gh pr list --repo NikitaDmitrieff/auto-co-meta --json number,title,state,reviews,comments --limit 10 2>/dev/null`,
      { cwd: ROOT, encoding: "utf-8", timeout: 10000 }
    );
    openPRs = JSON.parse(prRaw).map((pr) => ({
      number: pr.number,
      title: pr.title,
      status: pr.state.toLowerCase(),
      reviews: pr.reviews?.length || 0,
      comments: pr.comments?.length || 0,
    }));
  } catch {
    // gh not available or no PRs
  }

  // Get repo stats if gh is available
  let repoStats = { stars: 0, forks: 0, openIssues: 0 };
  try {
    const repoRaw = execSync(
      `gh api repos/NikitaDmitrieff/auto-co-meta --jq '{stars: .stargazers_count, forks: .forks_count, openIssues: .open_issues_count}' 2>/dev/null`,
      { cwd: ROOT, encoding: "utf-8", timeout: 10000 }
    );
    repoStats = JSON.parse(repoRaw);
  } catch {
    // fallback to consensus values
  }

  return { commits, openPRs, repoStats };
}

// ── Cycle history (real per-cycle costs from auto-loop) ─────────────
function getCycleHistory() {
  const historyFile = resolve(ROOT, "logs/cycle-history.jsonl");
  if (!existsSync(historyFile)) return [];

  const raw = readFileSync(historyFile, "utf-8").trim();
  if (!raw) return [];

  return raw
    .split("\n")
    .map((line) => {
      try {
        const entry = JSON.parse(line);
        return {
          cycle: entry.cycle,
          timestamp: entry.timestamp,
          status: entry.status,
          cost: entry.cost,
          duration: entry.duration_s,
          model: entry.model,
          totalCost: entry.total_cost,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ── JSONL state files (decisions, tasks, artifacts) ─────────────────
function parseJsonlFile(filename) {
  const filePath = resolve(ROOT, `state/${filename}`);
  if (!existsSync(filePath)) return [];

  const raw = readFileSync(filePath, "utf-8").trim();
  if (!raw) return [];

  return raw
    .split("\n")
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function getStateData() {
  const decisions = parseJsonlFile("decisions.jsonl").map((d) => ({
    timestamp: d.timestamp,
    cycle: d.cycle,
    agent: d.agent,
    decision: d.decision,
    rationale: d.rationale,
    confidence: d.confidence,
    outcome: d.outcome,
  }));

  const tasks = parseJsonlFile("tasks.jsonl").map((t) => ({
    id: t.id,
    cycle: t.cycle_created,
    description: t.description,
    owner: t.owner,
    status: t.status,
    priority: t.priority,
    cycleCompleted: t.cycle_completed,
  }));

  const artifacts = parseJsonlFile("artifacts.jsonl").map((a) => ({
    cycle: a.cycle,
    type: a.type,
    ref: a.ref,
    path: a.path,
    createdBy: a.created_by,
  }));

  // Build per-agent activity summary from decisions + tasks
  const agentActivity = {};
  for (const d of decisions) {
    if (!agentActivity[d.agent]) agentActivity[d.agent] = { decisions: 0, lastCycle: 0 };
    agentActivity[d.agent].decisions++;
    agentActivity[d.agent].lastCycle = Math.max(agentActivity[d.agent].lastCycle, d.cycle);
  }
  for (const t of tasks) {
    if (!agentActivity[t.owner]) agentActivity[t.owner] = { decisions: 0, lastCycle: 0 };
    if (!agentActivity[t.owner].tasks) agentActivity[t.owner].tasks = 0;
    agentActivity[t.owner].tasks++;
    agentActivity[t.owner].lastCycle = Math.max(agentActivity[t.owner].lastCycle, t.cycle);
  }

  return { decisions, tasks, artifacts, agentActivity };
}

// ── Deployments (static list -- could query Vercel API later) ───────
const DEPLOYMENTS = [
  { service: "Landing Page", url: "runautoco.com", status: "live" },
  { service: "Dashboard", url: "app.runautoco.com", status: "live" },
  { service: "Demo Dashboard", url: "runautoco.com/demo", status: "live" },
  { service: "Blog", url: "runautoco.com/blog", status: "live" },
  { service: "Pricing", url: "runautoco.com/pricing", status: "live" },
  { service: "Admin", url: "runautoco.com/admin", status: "live" },
  { service: "npm Package", url: "npmjs.com/package/create-auto-co", status: "live" },
];

// ── Main ────────────────────────────────────────────────────────────
// Skip generation if repo root doesn't exist (e.g., Railway build)
if (!existsSync(resolve(ROOT, "memories/consensus.md"))) {
  console.log("[generate-data] Repo root not found, using pre-generated state.json");
  process.exit(0);
}

const consensus = parseConsensus();
const git = getGitData();
const cycleHistory = getCycleHistory();
const stateData = getStateData();

const state = {
  generatedAt: new Date().toISOString(),
  cycle: consensus?.cycleNumber || 0,
  phase: consensus?.phase || "Unknown",
  metrics: {
    totalCost: consensus?.totalCostNum || 0,
    avgCostPerCycle: consensus?.cycleNumber ? Math.round((consensus.totalCostNum / consensus.cycleNumber) * 100) / 100 : 0,
    revenue: consensus?.revenue || "$0",
    users: consensus?.users || "0",
    stars: git.repoStats.stars || parseInt(consensus?.stars || "0", 10),
    forks: git.repoStats.forks || parseInt(consensus?.forks || "0", 10),
    cloners: parseInt(consensus?.cloners || "0", 10),
    openIssues: git.repoStats.openIssues || 0,
  },
  nextAction: consensus?.nextAction || "",
  whatWeDid: consensus?.whatWeDid || [],
  projects: consensus?.projects || [],
  pendingEscalation: consensus?.pendingRequest || false,
  distribution: consensus?.distribution || [],
  git: {
    commits: git.commits,
    openPRs: git.openPRs,
  },
  deployments: DEPLOYMENTS,
  cycleHistory,
  decisions: stateData.decisions,
  tasks: stateData.tasks,
  artifacts: stateData.artifacts,
  agentActivity: stateData.agentActivity,
};

writeFileSync(OUT, JSON.stringify(state, null, 2));
console.log(`[generate-data] Wrote ${OUT}`);
console.log(`[generate-data] Cycle #${state.cycle}, ${state.git.commits.length} commits, ${state.git.openPRs.length} PRs, ${state.cycleHistory.length} cycle history entries`);
