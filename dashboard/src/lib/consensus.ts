import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import type { ConsensusData, CompanyPhase } from './types';

const AUTO_CO_ROOT = path.resolve(process.cwd(), '..');
const CONSENSUS_PATH = path.join(AUTO_CO_ROOT, 'memories', 'consensus.md');

function detectPhase(content: string): CompanyPhase {
  const lower = content.toLowerCase();
  // Match "## Current Phase\nBuilding" format and "phase: building" format
  const phaseLineMatch = lower.match(/##\s*current\s+phase\s*\n\s*(\w+)/);
  const phaseLine = phaseLineMatch ? phaseLineMatch[1] : '';
  if (phaseLine === 'growing' || lower.includes('phase: growing')) return 'growing';
  if (phaseLine === 'launching' || lower.includes('phase: launching')) return 'launching';
  if (phaseLine === 'building' || lower.includes('phase: building')) return 'building';
  if (phaseLine === 'validating' || lower.includes('phase: validating')) return 'validating';
  if (phaseLine === 'exploring' || lower.includes('phase: exploring')) return 'exploring';
  if (phaseLine === 'pivoting' || lower.includes('phase: pivoting')) return 'pivoting';
  return 'day0';
}

function extractSection(content: string, heading: string): string {
  const regex = new RegExp(`##\\s*${heading}[\\s\\S]*?(?=\\n##\\s|$)`, 'i');
  const match = content.match(regex);
  if (!match) return '';
  // Remove the heading itself
  return match[0].replace(/^##\s*[^\n]+\n/, '').trim();
}

function extractCycleNumber(content: string): number {
  // Match "## Cycles Completed\n17" format
  const headingMatch = content.match(/##\s*Cycles?\s*Completed\s*\n\s*(\d+)/i);
  if (headingMatch) return parseInt(headingMatch[1], 10);
  // Fallback: match "Cycle 17" or "cycle: 17" anywhere
  const match = content.match(/cycle[:\s#]*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

function extractActiveAgents(content: string): string[] {
  const section = extractSection(content, 'Active Agents') ||
                  extractSection(content, 'Who Acted') ||
                  extractSection(content, 'Agents');
  if (!section) return [];
  // Extract agent names from bullet points or comma-separated
  const agents: string[] = [];
  const lines = section.split('\n');
  for (const line of lines) {
    const match = line.match(/[-*]\s*\*?\*?(\w+)\*?\*?/);
    if (match) agents.push(match[1].toLowerCase());
  }
  return agents;
}

function extractHumanEscalation(content: string): string | null {
  const section = extractSection(content, 'Human Escalation') ||
                  extractSection(content, 'Escalation');
  if (!section || section.trim() === '') return null;
  const lower = section.toLowerCase();
  // No escalation if pending is "no", "none", or "N/A"
  if (lower.includes('pending request: no') || lower.includes('pending: none') || lower.includes('pending: no')) return null;
  if (lower.includes('none') && !lower.includes('question')) return null;
  return section;
}

export async function getConsensus(): Promise<ConsensusData> {
  // Default empty state
  const defaults: ConsensusData = {
    raw: '',
    html: '',
    phase: 'day0',
    cycleNumber: 0,
    streak: 0,
    cyclesSinceLastShip: 0,
    whatWeDid: '',
    nextAction: '',
    humanEscalation: null,
    activeAgents: [],
    timestamp: null,
  };

  try {
    if (!fs.existsSync(CONSENSUS_PATH)) {
      return defaults;
    }

    const raw = fs.readFileSync(CONSENSUS_PATH, 'utf-8');
    const processed = await remark().use(html).process(raw);
    const htmlContent = processed.toString();

    return {
      raw,
      html: htmlContent,
      phase: detectPhase(raw),
      cycleNumber: extractCycleNumber(raw),
      streak: 0, // Calculated from cycle history
      cyclesSinceLastShip: 0,
      whatWeDid: extractSection(raw, 'What We Did'),
      nextAction: extractSection(raw, 'Next Action'),
      humanEscalation: extractHumanEscalation(raw),
      activeAgents: extractActiveAgents(raw),
      timestamp: (() => {
        try {
          const stat = fs.statSync(CONSENSUS_PATH);
          return stat.mtime.toISOString();
        } catch {
          return null;
        }
      })(),
    };
  } catch {
    return defaults;
  }
}
