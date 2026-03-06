import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Agent } from './types';
import { AGENT_ROSTER } from './types';

const AUTO_CO_ROOT = path.resolve(process.cwd(), '..');
const AGENTS_DIR = path.join(AUTO_CO_ROOT, '.claude', 'agents');
const DOCS_DIR = path.join(AUTO_CO_ROOT, 'docs');

function countOutputs(role: string): number {
  const roleDir = path.join(DOCS_DIR, role);
  try {
    if (!fs.existsSync(roleDir)) return 0;
    const files = fs.readdirSync(roleDir, { recursive: true });
    return files.filter(f => {
      const fname = typeof f === 'string' ? f : f.toString();
      return !fname.startsWith('.');
    }).length;
  } catch {
    return 0;
  }
}

function loadPersona(role: string): { description: string; hasPersona: boolean } {
  try {
    if (!fs.existsSync(AGENTS_DIR)) {
      return { description: AGENT_ROSTER[role]?.role || role, hasPersona: false };
    }

    const files = fs.readdirSync(AGENTS_DIR);
    const agentFile = files.find(f => f.startsWith(role + '-') && f.endsWith('.md'));

    if (!agentFile) {
      return { description: AGENT_ROSTER[role]?.role || role, hasPersona: false };
    }

    const content = fs.readFileSync(path.join(AGENTS_DIR, agentFile), 'utf-8');
    const { data } = matter(content);

    return {
      description: data.description || AGENT_ROSTER[role]?.role || role,
      hasPersona: true,
    };
  } catch {
    return { description: AGENT_ROSTER[role]?.role || role, hasPersona: false };
  }
}

export function getAgentPersonaContent(role: string): string | null {
  try {
    if (!fs.existsSync(AGENTS_DIR)) return null;
    const files = fs.readdirSync(AGENTS_DIR);
    const agentFile = files.find(f => f.startsWith(role + '-') && f.endsWith('.md'));
    if (!agentFile) return null;
    return fs.readFileSync(path.join(AGENTS_DIR, agentFile), 'utf-8');
  } catch {
    return null;
  }
}

export function getAllAgents(): Agent[] {
  const agents: Agent[] = [];

  for (const [id, meta] of Object.entries(AGENT_ROSTER)) {
    const persona = loadPersona(id);
    const outputCount = countOutputs(id);

    agents.push({
      id,
      name: meta.role,
      role: meta.role,
      expert: meta.expert,
      layer: meta.layer,
      description: persona.description,
      lastActiveCycle: null, // Will be enriched from cycle logs
      outputCount,
      hasPersona: persona.hasPersona,
      status: persona.hasPersona ? 'idle' : 'never-activated',
    });
  }

  return agents;
}

export function getAgentById(id: string): Agent | null {
  const agents = getAllAgents();
  return agents.find(a => a.id === id) || null;
}
