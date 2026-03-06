export type CompanyPhase =
  | 'day0'
  | 'exploring'
  | 'validating'
  | 'building'
  | 'launching'
  | 'growing'
  | 'pivoting';

export type AgentLayer = 'Strategy' | 'Product' | 'Engineering' | 'Business' | 'Intelligence';

export interface Agent {
  id: string;
  name: string;
  role: string;
  expert: string;
  layer: AgentLayer;
  description: string;
  lastActiveCycle: number | null;
  outputCount: number;
  hasPersona: boolean;
  status: 'active' | 'idle' | 'never-activated';
}

export interface ConsensusData {
  raw: string;
  html: string;
  phase: CompanyPhase;
  cycleNumber: number;
  streak: number;
  cyclesSinceLastShip: number;
  whatWeDid: string;
  nextAction: string;
  humanEscalation: string | null;
  activeAgents: string[];
  timestamp: string | null;
}

export interface CycleLog {
  cycleNumber: number;
  timestamp: string;
  phase: CompanyPhase;
  agents: string[];
  summary: string;
  output: string;
  success: boolean;
  artifacts: string[];
}

export interface Artifact {
  path: string;
  relativePath: string;
  name: string;
  agent: string;
  type: 'md' | 'ts' | 'tsx' | 'json' | 'yaml' | 'other';
  size: number;
  modifiedAt: string;
  content?: string;
}

export interface MetricsData {
  totalCycles: number;
  successRate: number;
  agentActivationCounts: Record<string, number>;
  outputVelocity: { cycle: number; count: number }[];
  phaseTransitions: { cycle: number; from: CompanyPhase; to: CompanyPhase; timestamp: string }[];
  stallDetections: { cycle: number; repeatedAction: string; count: number }[];
}

export interface AgentInteraction {
  agent1: string;
  agent2: string;
  count: number;
  workflows: string[];
}

// The 14 agent roles with their metadata
export const AGENT_ROSTER: Record<string, { role: string; layer: AgentLayer; expert: string; color: string }> = {
  ceo: { role: 'CEO', layer: 'Strategy', expert: 'Jeff Bezos', color: '#FFE000' },
  cfo: { role: 'CFO', layer: 'Business', expert: 'Patrick Campbell', color: '#FF0080' },
  critic: { role: 'Critic', layer: 'Strategy', expert: 'Charlie Munger', color: '#FF3333' },
  cto: { role: 'CTO', layer: 'Engineering', expert: 'Werner Vogels', color: '#00D4FF' },
  devops: { role: 'DevOps/SRE', layer: 'Engineering', expert: 'Kelsey Hightower', color: '#00FF41' },
  fullstack: { role: 'Full-Stack Dev', layer: 'Engineering', expert: 'DHH', color: '#00FF88' },
  interaction: { role: 'Interaction Design', layer: 'Product', expert: 'Alan Cooper', color: '#FF6B00' },
  marketing: { role: 'Marketing', layer: 'Business', expert: 'Seth Godin', color: '#FF0080' },
  operations: { role: 'Operations', layer: 'Business', expert: 'Paul Graham', color: '#888888' },
  product: { role: 'Product Design', layer: 'Product', expert: 'Don Norman', color: '#00D4FF' },
  qa: { role: 'QA', layer: 'Engineering', expert: 'James Bach', color: '#FFE000' },
  research: { role: 'Research', layer: 'Intelligence', expert: 'Ben Thompson', color: '#9B59B6' },
  sales: { role: 'Sales', layer: 'Business', expert: 'Aaron Ross', color: '#FF3333' },
  ui: { role: 'UI Designer', layer: 'Product', expert: 'Matias Duarte', color: '#00FF41' },
};

export const LAYER_COLORS: Record<AgentLayer, string> = {
  Strategy: '#FFE000',
  Product: '#00D4FF',
  Engineering: '#00FF41',
  Business: '#FF0080',
  Intelligence: '#9B59B6',
};
