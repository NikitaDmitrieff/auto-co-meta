#!/usr/bin/env node
/**
 * Reads consensus.md + git log from the parent repo and writes
 * src/data/state.json so dashboard pages can import real data.
 *
 * Run: node scripts/generate-data.mjs
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname, relative } from "node:path";
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

// ── Metrics history (daily snapshots from state/metrics.jsonl) ───────
function getMetricsHistory() {
  const metricsFile = resolve(ROOT, "state/metrics.jsonl");
  if (!existsSync(metricsFile)) return [];

  const raw = readFileSync(metricsFile, "utf-8").trim();
  if (!raw) return [];

  return raw
    .split("\n")
    .map((line) => {
      try {
        const e = JSON.parse(line);
        return {
          date: e.date,
          cycle: e.cycle,
          revenue: e.revenue || 0,
          users: e.users || 0,
          signups: e.signups || 0,
          githubStars: e.github_stars || 0,
          pageViews: e.page_views || 0,
          costCycle: e.cost_cycle || 0,
          costTotal: e.cost_total || 0,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ── GitHub traffic data (views + clones) ─────────────────────────────
function getGitHubTraffic() {
  try {
    const viewsRaw = execSync(
      `gh api repos/NikitaDmitrieff/auto-co-meta/traffic/views 2>/dev/null`,
      { cwd: ROOT, encoding: "utf-8", timeout: 10000 }
    );
    const clonesRaw = execSync(
      `gh api repos/NikitaDmitrieff/auto-co-meta/traffic/clones 2>/dev/null`,
      { cwd: ROOT, encoding: "utf-8", timeout: 10000 }
    );
    const views = JSON.parse(viewsRaw);
    const clones = JSON.parse(clonesRaw);
    return {
      views: { total: views.count || 0, unique: views.uniques || 0 },
      clones: { total: clones.count || 0, unique: clones.uniques || 0 },
      daily: (views.views || [])
        .map((v) => {
          const cloneDay = (clones.clones || []).find((c) => c.timestamp === v.timestamp);
          return {
            date: v.timestamp.split("T")[0],
            views: v.count,
            uniqueViews: v.uniques,
            clones: cloneDay?.count || 0,
            uniqueClones: cloneDay?.uniques || 0,
          };
        })
        .filter((d) => d.views > 0 || d.clones > 0),
    };
  } catch {
    return { views: { total: 0, unique: 0 }, clones: { total: 0, unique: 0 }, daily: [] };
  }
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

// ── Health checks (HTTP HEAD against each service) ───────────────────
async function checkServiceHealth() {
  const results = [];
  for (const dep of DEPLOYMENTS) {
    const url = `https://${dep.url}`;
    const start = Date.now();
    try {
      let res = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      });
      // Some services (npm) reject HEAD -- fall back to GET
      if (!res.ok) {
        res = await fetch(url, {
          method: "GET",
          signal: AbortSignal.timeout(8000),
          redirect: "follow",
        });
      }
      // 2xx/3xx = healthy, 4xx = healthy (service is up, just rejecting bots), 5xx = degraded
      const status = res.status >= 500 ? "degraded" : "healthy";
      results.push({
        service: dep.service,
        url: dep.url,
        status,
        statusCode: res.status,
        responseMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      });
    } catch {
      results.push({
        service: dep.service,
        url: dep.url,
        status: "unreachable",
        statusCode: 0,
        responseMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      });
    }
  }
  return results;
}

// ── Loop health (derived from cycle history) ─────────────────────────
function computeLoopHealth(cycleHistory) {
  if (!cycleHistory.length) {
    return {
      totalCycles: 0,
      successRate: 0,
      avgDuration: 0,
      avgCost: 0,
      lastCycle: null,
      recentFailures: 0,
    };
  }

  const successes = cycleHistory.filter((c) => c.status === "success");
  const last10 = cycleHistory.slice(-10);
  const recentFailures = last10.filter((c) => c.status !== "success").length;
  const durations = cycleHistory.filter((c) => c.duration > 0).map((c) => c.duration);
  const costs = cycleHistory.filter((c) => c.cost > 0).map((c) => c.cost);
  const last = cycleHistory[cycleHistory.length - 1];

  return {
    totalCycles: cycleHistory.length,
    successRate: Math.round((successes.length / cycleHistory.length) * 1000) / 10,
    avgDuration: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    avgCost: costs.length ? Math.round((costs.reduce((a, b) => a + b, 0) / costs.length) * 100) / 100 : 0,
    lastCycle: last ? {
      number: last.cycle,
      timestamp: last.timestamp,
      status: last.status,
      duration: last.duration,
      cost: last.cost,
    } : null,
    recentFailures,
  };
}

// ── Raw consensus text ───────────────────────────────────────────────
function getConsensusText() {
  try {
    return readFileSync(resolve(ROOT, "memories/consensus.md"), "utf-8");
  } catch {
    return "";
  }
}

// ── Escalation data from memories/ ───────────────────────────────────
function getEscalations() {
  const escalations = [];

  // Parse human-request.md for pending escalation
  try {
    const req = readFileSync(resolve(ROOT, "memories/human-request.md"), "utf-8").trim();
    if (req) {
      const dateMatch = req.match(/\*\*Date:\*\*\s*(.+)/);
      const fromMatch = req.match(/\*\*From:\*\*\s*(.+)/);
      const contextMatch = req.match(/\*\*Context:\*\*\s*(.+)/);
      const questionMatch = req.match(/\*\*Question:\*\*\s*(.+)/);
      const defaultMatch = req.match(/\*\*Default Action:\*\*\s*(.+)/);
      escalations.push({
        id: `esc-pending`,
        date: dateMatch?.[1]?.trim() || new Date().toISOString().split("T")[0],
        from: fromMatch?.[1]?.trim() || "ceo-bezos",
        context: contextMatch?.[1]?.trim() || "",
        question: questionMatch?.[1]?.trim() || req.slice(0, 200),
        defaultAction: defaultMatch?.[1]?.trim() || "Make autonomous decision",
        resolved: false,
      });
    }
  } catch {
    // No pending request
  }

  return escalations;
}

// ── Synthesize terminal entries from decisions + commits + artifacts ──
function synthesizeTerminalEntries(decisions, artifacts, commits, cycleHistory) {
  const entries = [];
  let id = 1;

  // Map decision types to terminal entry types
  const typeMap = {
    commit: "commit",
    deploy: "deploy",
    file: "code",
    pr: "action",
  };

  // Add decisions as terminal entries (most recent 30)
  for (const d of decisions.slice(-30)) {
    entries.push({
      id: `t-${String(id++).padStart(3, "0")}`,
      timestamp: d.timestamp || new Date().toISOString(),
      agent: d.agent || "ceo-bezos",
      type: "decision",
      content: d.decision || "",
    });
  }

  // Add artifacts as terminal entries (most recent 20)
  for (const a of artifacts.slice(-20)) {
    const lastHistory = cycleHistory.find((c) => c.cycle === a.cycle);
    entries.push({
      id: `t-${String(id++).padStart(3, "0")}`,
      timestamp: lastHistory?.timestamp || new Date().toISOString(),
      agent: a.createdBy || "fullstack-dhh",
      type: typeMap[a.type] || "action",
      content: `[${a.type}] ${a.ref || ""} ${a.path || ""}`.trim(),
    });
  }

  // Add git commits as terminal entries (most recent 15)
  for (const c of commits.slice(0, 15)) {
    entries.push({
      id: `t-${String(id++).padStart(3, "0")}`,
      timestamp: (() => { try { const d = new Date(c.date); return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); } catch { return new Date().toISOString(); } })(),
      agent: "fullstack-dhh",
      type: "commit",
      content: `${c.hash} ${c.msg}`,
    });
  }

  // Sort by timestamp, most recent last
  entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Deduplicate and limit to 40
  return entries.slice(-40);
}

// ── Real document files from docs/ ────────────────────────────────────
function getDocFiles() {
  const docsDir = resolve(ROOT, "docs");
  if (!existsSync(docsDir)) return [];

  const files = [];

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = resolve(dir, entry);
      try {
        const st = statSync(full);
        if (st.isDirectory()) {
          walk(full);
        } else if (entry.endsWith(".md")) {
          const rel = relative(ROOT, full);
          const raw = readFileSync(full, "utf-8");
          // Extract title from first heading or filename
          const headingMatch = raw.match(/^#\s+(.+)/m);
          const title = headingMatch
            ? headingMatch[1].trim()
            : entry.replace(/\.md$/, "").replace(/-/g, " ");
          // Derive author from directory (docs/marketing/ -> marketing-godin)
          const parts = rel.split("/");
          const roleDir = parts[1] || "";
          const authorMap = {
            ceo: "ceo-bezos",
            cto: "cto-vogels",
            critic: "critic-munger",
            product: "product-norman",
            ui: "ui-duarte",
            interaction: "interaction-cooper",
            fullstack: "fullstack-dhh",
            qa: "qa-bach",
            devops: "devops-hightower",
            marketing: "marketing-godin",
            operations: "operations-pg",
            sales: "sales-ross",
            cfo: "cfo-campbell",
            research: "research-thompson",
            plans: "cto-vogels",
          };
          const author = authorMap[roleDir] || "fullstack-dhh";
          // Get file modification date
          const date = st.mtime.toISOString().split("T")[0];
          // Preview = first 200 chars of content (strip headings)
          const contentClean = raw.replace(/^#+\s+.+\n/gm, "").trim();
          const preview = contentClean.slice(0, 200).replace(/\n/g, " ").trim();
          // Truncate content to 2000 chars to keep state.json reasonable
          const content = raw.slice(0, 2000);

          files.push({ path: rel, title, author, date, preview, content });
        }
      } catch {
        // skip unreadable files
      }
    }
  }

  walk(docsDir);
  // Sort by date descending, take top 15
  files.sort((a, b) => b.date.localeCompare(a.date));
  return files.slice(0, 15);
}

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
const metricsHistory = getMetricsHistory();
const traffic = getGitHubTraffic();
const healthChecks = await checkServiceHealth();
const loopHealth = computeLoopHealth(cycleHistory);
const consensusText = getConsensusText();
const escalations = getEscalations();
const terminalEntries = synthesizeTerminalEntries(
  stateData.decisions,
  stateData.artifacts,
  git.commits,
  cycleHistory,
);
const docFiles = getDocFiles();

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
  metricsHistory,
  traffic,
  health: {
    checks: healthChecks,
    loopHealth,
  },
  consensusText,
  escalations,
  terminalEntries,
  docFiles,
};

writeFileSync(OUT, JSON.stringify(state, null, 2));
console.log(`[generate-data] Wrote ${OUT}`);
console.log(`[generate-data] Cycle #${state.cycle}, ${state.git.commits.length} commits, ${state.git.openPRs.length} PRs, ${state.cycleHistory.length} cycle history entries`);
console.log(`[generate-data] Health: ${healthChecks.filter(h => h.status === "healthy").length}/${healthChecks.length} services healthy`);
