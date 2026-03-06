import fs from 'fs';
import path from 'path';
import type { CycleLog, CompanyPhase, MetricsData, AgentInteraction } from './types';
import { AGENT_ROSTER } from './types';

const AUTO_CO_ROOT = path.resolve(process.cwd(), '..');
const LOGS_DIR = path.join(AUTO_CO_ROOT, 'logs');
const CONSENSUS_PATH = path.join(AUTO_CO_ROOT, 'memories', 'consensus.md');

const AGENT_NAMES = Object.keys(AGENT_ROSTER);

function findResultEvent(content: string): Record<string, unknown> | null {
  // stream-json: multiple JSON lines, find the one with type=result
  const lines = content.split('\n').filter(l => l.trim());
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.type === 'result') return parsed;
    } catch { /* not JSON, skip */ }
  }
  // Fallback: try parsing the whole content as single JSON
  try {
    const parsed = JSON.parse(content);
    if (parsed.result) return parsed;
  } catch { /* fall through */ }
  return null;
}

function extractResultText(content: string): string {
  const event = findResultEvent(content);
  if (event?.result) return event.result as string;

  // Fallback: treat the whole content as text
  return content;
}

function extractSubtype(content: string): string | null {
  const event = findResultEvent(content);
  return (event?.subtype as string) || null;
}

function extractCost(content: string): number | null {
  const event = findResultEvent(content);
  return (event?.total_cost_usd as number) ?? null;
}

function detectPhaseFromText(text: string): CompanyPhase {
  const lower = text.toLowerCase();
  // Look for phase mentions in the Claude output
  if (lower.includes('current phase') || lower.includes('phase:')) {
    if (lower.match(/phase[:\s]*(growing)/i)) return 'growing';
    if (lower.match(/phase[:\s]*(launching)/i)) return 'launching';
    if (lower.match(/phase[:\s]*(building)/i)) return 'building';
    if (lower.match(/phase[:\s]*(validating)/i)) return 'validating';
    if (lower.match(/phase[:\s]*(exploring)/i)) return 'exploring';
    if (lower.match(/phase[:\s]*(pivoting)/i)) return 'pivoting';
  }
  // Heuristic: detect from content
  if (lower.includes('brainstorm') || lower.includes('day 0') || lower.includes('first cycle')) return 'day0';
  if (lower.includes('deploy') || lower.includes('ship') || lower.includes('launch')) return 'building';
  if (lower.includes('validate') || lower.includes('pre-mortem') || lower.includes('go/no-go')) return 'validating';
  return 'day0';
}

// Map roster keys to actual agent file IDs used by auto-co
const AGENT_FILE_IDS: Record<string, string> = {
  ceo: 'ceo-bezos',
  cfo: 'cfo-campbell',
  critic: 'critic-munger',
  cto: 'cto-vogels',
  devops: 'devops-hightower',
  fullstack: 'fullstack-dhh',
  interaction: 'interaction-cooper',
  marketing: 'marketing-godin',
  operations: 'operations-pg',
  product: 'product-norman',
  qa: 'qa-bach',
  research: 'research-thompson',
  sales: 'sales-ross',
  ui: 'ui-duarte',
};

function detectAgentsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const name of AGENT_NAMES) {
    const fileId = AGENT_FILE_IDS[name];
    if (fileId && lower.includes(fileId)) {
      found.push(name);
    }
  }
  return found;
}

function extractSummary(text: string): string {
  // Try to find "What We Did" or "Summary" section
  const whatWeDidMatch = text.match(/what we did[^\n]*\n([\s\S]*?)(?=\n##|\n\*\*|$)/i);
  if (whatWeDidMatch) return whatWeDidMatch[1].trim().substring(0, 300);

  // Try to find the first substantive paragraph
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  for (const line of lines) {
    const trimmed = line.replace(/^[-*]\s*/, '').trim();
    if (trimmed.length > 30) return trimmed.substring(0, 300);
  }

  return lines[0]?.substring(0, 300) || 'No summary available';
}

function parseLogFile(filePath: string, fileName: string): CycleLog | null {
  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    if (!rawContent.trim()) return null;

    // Extract cycle number from filename: cycle-0001-20260305-163301.log
    const cycleMatch = fileName.match(/cycle-(\d+)/);
    const cycleNumber = cycleMatch ? parseInt(cycleMatch[1], 10) : 0;

    // Get the actual text output from Claude's JSON response
    const resultEvent = findResultEvent(rawContent);
    const resultText = resultEvent?.result as string || rawContent;
    const subtype = (resultEvent?.subtype as string) || null;
    const cost = (resultEvent?.total_cost_usd as number) ?? null;

    // Skip logs that have no completed result event
    if (!resultEvent) {
      return null;
    }

    const phase = detectPhaseFromText(resultText);
    const agents = detectAgentsFromText(resultText);
    const summary = extractSummary(resultText);

    // Detect success from JSON subtype, then fallback to text analysis
    const success = subtype
      ? subtype === 'success'
      : !resultText.toLowerCase().includes('failed') && !resultText.toLowerCase().includes('circuit breaker');

    // Extract artifact references from the result text
    const artifactMatches = resultText.match(/docs\/\S+|projects\/\S+/g) || [];

    const stat = fs.statSync(filePath);

    return {
      cycleNumber,
      timestamp: stat.mtime.toISOString(),
      phase,
      agents,
      summary,
      output: resultText,
      success,
      artifacts: artifactMatches,
    };
  } catch {
    return null;
  }
}

export function getAllCycles(): CycleLog[] {
  try {
    if (!fs.existsSync(LOGS_DIR)) return [];

    const files = fs.readdirSync(LOGS_DIR)
      .filter(f => /^cycle-\d{4}-/.test(f) && f.endsWith('.log'))
      .sort();

    const cycles: CycleLog[] = [];
    for (const file of files) {
      const filePath = path.join(LOGS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const log = parseLogFile(filePath, file);
        if (log) cycles.push(log);
      }
    }

    // Also parse cycle-live.jsonl if it has a completed result
    const livePath = path.join(LOGS_DIR, 'cycle-live.jsonl');
    if (fs.existsSync(livePath)) {
      const log = parseLogFile(livePath, 'cycle-live.jsonl');
      if (log && log.cycleNumber === 0) {
        // Assign next cycle number after the highest existing
        const maxCycle = cycles.reduce((m, c) => Math.max(m, c.cycleNumber), 0);
        log.cycleNumber = maxCycle + 1;
      }
      // Only add if it has a result event (completed cycle)
      if (log) {
        const duplicate = cycles.some(c => c.cycleNumber === log.cycleNumber);
        if (!duplicate) cycles.push(log);
      }
    }

    return cycles.sort((a, b) => b.cycleNumber - a.cycleNumber);
  } catch {
    return [];
  }
}

export function getCycleByNumber(num: number): CycleLog | null {
  const cycles = getAllCycles();
  return cycles.find(c => c.cycleNumber === num) || null;
}

function getConsensusMetrics(): { totalCycles: number; phase: CompanyPhase } {
  try {
    if (!fs.existsSync(CONSENSUS_PATH)) return { totalCycles: 0, phase: 'day0' };
    const content = fs.readFileSync(CONSENSUS_PATH, 'utf-8');
    const cycleMatch = content.match(/##\s*Cycles?\s*Completed\s*\n\s*(\d+)/i);
    const totalCycles = cycleMatch ? parseInt(cycleMatch[1], 10) : 0;
    const phaseMatch = content.match(/##\s*Current\s+Phase\s*\n\s*(\w+)/i);
    const phase = (phaseMatch ? phaseMatch[1].toLowerCase() : 'day0') as CompanyPhase;
    return { totalCycles, phase };
  } catch {
    return { totalCycles: 0, phase: 'day0' };
  }
}

export function getMetrics(): MetricsData {
  const cycles = getAllCycles();
  const consensus = getConsensusMetrics();

  // Use log-based count if available, fall back to consensus
  const totalCycles = cycles.length > 0 ? cycles.length : consensus.totalCycles;
  const successCount = cycles.filter(c => c.success).length;
  const successRate = cycles.length > 0 ? (successCount / cycles.length) * 100 : (consensus.totalCycles > 0 ? 100 : 0);

  // Agent activation counts
  const agentActivationCounts: Record<string, number> = {};
  for (const cycle of cycles) {
    for (const agent of cycle.agents) {
      const key = agent.toLowerCase();
      agentActivationCounts[key] = (agentActivationCounts[key] || 0) + 1;
    }
  }

  // Output velocity
  const outputVelocity = cycles.map(c => ({
    cycle: c.cycleNumber,
    count: c.artifacts.length,
  }));

  // Phase transitions
  const phaseTransitions: MetricsData['phaseTransitions'] = [];
  for (let i = 1; i < cycles.length; i++) {
    if (cycles[i].phase !== cycles[i - 1].phase) {
      phaseTransitions.push({
        cycle: cycles[i].cycleNumber,
        from: cycles[i - 1].phase,
        to: cycles[i].phase,
        timestamp: cycles[i].timestamp,
      });
    }
  }

  // Stall detection (same next action repeated)
  const stallDetections: MetricsData['stallDetections'] = [];

  return {
    totalCycles,
    successRate,
    agentActivationCounts,
    outputVelocity,
    phaseTransitions,
    stallDetections,
  };
}

export interface LiveCycleStatus {
  isRunning: boolean;
  activeAgents: string[];
  lastActivity: string | null;
  eventCount: number;
  tools: string[];
  statusText: string | null;
}

export function getLiveCycleStatus(): LiveCycleStatus {
  const livePath = path.join(LOGS_DIR, 'cycle-live.jsonl');
  const empty: LiveCycleStatus = { isRunning: false, activeAgents: [], lastActivity: null, eventCount: 0, tools: [], statusText: null };

  try {
    if (!fs.existsSync(livePath)) return empty;
    const stat = fs.statSync(livePath);

    // If file hasn't been modified in 5 minutes, cycle is probably not running
    const age = Date.now() - stat.mtimeMs;
    if (age > 5 * 60 * 1000) return empty;

    const content = fs.readFileSync(livePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Check if there's already a result (cycle finished)
    const hasResult = lines.some(l => { try { return JSON.parse(l).type === 'result'; } catch { return false; } });
    if (hasResult) return empty;

    const agents = new Set<string>();
    const tools: string[] = [];
    let statusText: string | null = null;

    for (const line of lines) {
      try {
        const d = JSON.parse(line);
        if (d.type === 'assistant') {
          const content = d.message?.content;
          if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === 'tool_use') {
                if (block.name === 'Agent') {
                  const agentType = block.input?.subagent_type || block.input?.name || '';
                  // Match against known agent file IDs
                  for (const [key, fileId] of Object.entries(AGENT_FILE_IDS)) {
                    if (agentType.includes(key) || agentType.includes(fileId)) {
                      agents.add(key);
                    }
                  }
                }
                if (!['ToolSearch', 'TodoWrite'].includes(block.name)) {
                  tools.push(block.name);
                }
              }
              if (block.type === 'text' && block.text?.trim()) {
                statusText = block.text.trim().substring(0, 200);
              }
            }
          }
        }
      } catch { /* skip */ }
    }

    return {
      isRunning: true,
      activeAgents: Array.from(agents),
      lastActivity: stat.mtime.toISOString(),
      eventCount: lines.length,
      tools: tools.slice(-5),
      statusText,
    };
  } catch {
    return empty;
  }
}

export function getAgentInteractions(): AgentInteraction[] {
  const cycles = getAllCycles();
  const interactionMap = new Map<string, { count: number; workflows: Set<string> }>();

  for (const cycle of cycles) {
    const agents = cycle.agents;
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const key = [agents[i], agents[j]].sort().join('::');
        const existing = interactionMap.get(key) || { count: 0, workflows: new Set<string>() };
        existing.count++;
        existing.workflows.add(cycle.phase);
        interactionMap.set(key, existing);
      }
    }
  }

  return Array.from(interactionMap.entries()).map(([key, data]) => {
    const [agent1, agent2] = key.split('::');
    return {
      agent1,
      agent2,
      count: data.count,
      workflows: Array.from(data.workflows),
    };
  });
}
