export interface DashboardState {
  generatedAt: string;
  cycle: number;
  phase: string;
  metrics: {
    totalCost: number;
    avgCostPerCycle: number;
    revenue: string;
    users: string;
    stars: number;
    forks: number;
    cloners: number;
    openIssues: number;
  };
  nextAction: string;
  whatWeDid: string[];
  projects: Array<{ name: string; status: string }>;
  pendingEscalation: boolean;
  distribution: Array<{ channel: string; status: string; url: string }>;
  git: {
    commits: Array<{ hash: string; msg: string; date: string }>;
    openPRs: Array<{ number: number; title: string; status: string; reviews: number; comments: number }>;
  };
  deployments: Array<{ service: string; url: string; status: string }>;
  cycleHistory: Array<{
    cycle: number;
    timestamp: string;
    status: string;
    cost: number;
    duration: number;
    model: string;
    totalCost: number;
  }>;
  decisions: Array<{
    timestamp: string;
    cycle: number;
    agent: string;
    decision: string;
    rationale: string;
    confidence: number;
    outcome: string;
  }>;
  tasks: Array<{
    id: string;
    cycle: number;
    description: string;
    owner: string;
    status: string;
    priority: string;
    cycleCompleted: number | null;
  }>;
  artifacts: Array<{
    cycle: number;
    type: string;
    ref: string;
    path: string;
    createdBy: string;
  }>;
  agentActivity: Record<string, {
    decisions: number;
    tasks?: number;
    lastCycle: number;
  }>;
  metricsHistory: Array<{
    date: string;
    cycle: number;
    revenue: number;
    users: number;
    signups: number;
    githubStars: number;
    pageViews: number;
    costCycle: number;
    costTotal: number;
  }>;
  traffic: {
    views: { total: number; unique: number };
    clones: { total: number; unique: number };
    daily: Array<{
      date: string;
      views: number;
      uniqueViews: number;
      clones: number;
      uniqueClones: number;
    }>;
  };
  docFiles: Array<{
    path: string;
    title: string;
    author: string;
    date: string;
    preview: string;
    content: string;
  }>;
  health: {
    checks: Array<{
      service: string;
      url: string;
      status: "healthy" | "degraded" | "unreachable";
      statusCode: number;
      responseMs: number;
      checkedAt: string;
    }>;
    loopHealth: {
      totalCycles: number;
      successRate: number;
      avgDuration: number;
      avgCost: number;
      lastCycle: {
        number: number;
        timestamp: string;
        status: string;
        duration?: number;
        cost: number;
      } | null;
      recentFailures: number;
    };
  };
}
