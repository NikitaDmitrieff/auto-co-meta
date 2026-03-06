import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import type { Artifact } from './types';

const AUTO_CO_ROOT = path.resolve(process.cwd(), '..');
const DOCS_DIR = path.join(AUTO_CO_ROOT, 'docs');
const PROJECTS_DIR = path.join(AUTO_CO_ROOT, 'projects');

function getFileType(fileName: string): Artifact['type'] {
  const ext = path.extname(fileName).toLowerCase().slice(1);
  switch (ext) {
    case 'md': return 'md';
    case 'ts': return 'ts';
    case 'tsx': return 'tsx';
    case 'json': return 'json';
    case 'yaml':
    case 'yml': return 'yaml';
    default: return 'other';
  }
}

const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', '.next', '.vercel', '__pycache__', '.turbo', 'coverage']);
const IGNORED_FILES = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', '.DS_Store']);

function scanDirectory(dirPath: string, basePath: string, agent: string = ''): Artifact[] {
  const artifacts: Artifact[] = [];

  try {
    if (!fs.existsSync(dirPath)) return artifacts;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        const subAgent = agent || entry.name;
        artifacts.push(...scanDirectory(fullPath, basePath, subAgent));
      } else if (entry.isFile()) {
        if (IGNORED_FILES.has(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(basePath, fullPath);
        const stat = fs.statSync(fullPath);
        artifacts.push({
          path: fullPath,
          relativePath,
          name: entry.name,
          agent: agent || 'unknown',
          type: getFileType(entry.name),
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        });
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return artifacts;
}

export function getAllArtifacts(): Artifact[] {
  const docsArtifacts = scanDirectory(DOCS_DIR, DOCS_DIR);
  const projectsArtifacts = scanDirectory(PROJECTS_DIR, PROJECTS_DIR, 'project');

  return [...docsArtifacts, ...projectsArtifacts].sort(
    (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
  );
}

export async function getArtifactContent(relativePath: string): Promise<{ raw: string; html: string } | null> {
  try {
    // Try docs first, then projects
    let fullPath = path.join(DOCS_DIR, relativePath);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(PROJECTS_DIR, relativePath);
    }
    if (!fs.existsSync(fullPath)) return null;

    const raw = fs.readFileSync(fullPath, 'utf-8');

    if (fullPath.endsWith('.md')) {
      const processed = await remark().use(html).process(raw);
      return { raw, html: processed.toString() };
    }

    return { raw, html: `<pre><code>${escapeHtml(raw)}</code></pre>` };
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getArtifactsByAgent(): Record<string, Artifact[]> {
  const artifacts = getAllArtifacts();
  const grouped: Record<string, Artifact[]> = {};

  for (const artifact of artifacts) {
    if (!grouped[artifact.agent]) {
      grouped[artifact.agent] = [];
    }
    grouped[artifact.agent].push(artifact);
  }

  return grouped;
}

export function getArtifactStats(): { total: number; byAgent: Record<string, number>; byType: Record<string, number> } {
  const artifacts = getAllArtifacts();
  const byAgent: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const a of artifacts) {
    byAgent[a.agent] = (byAgent[a.agent] || 0) + 1;
    byType[a.type] = (byType[a.type] || 0) + 1;
  }

  return { total: artifacts.length, byAgent, byType };
}
