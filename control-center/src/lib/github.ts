export interface GithubStats {
  commits: number;
  prs: number;
  issues: number;
  repo?: string;
  mock?: boolean;
  message?: string;
}

export async function getGithubStats(): Promise<GithubStats> {
  const res = await fetch("/api/github-stats");
  if (!res.ok) {
    throw new Error(`GitHub stats failed: ${res.status}`);
  }
  return res.json() as Promise<GithubStats>;
}

/** Demo sparkline series when live metrics are unavailable */
export function sparklinesFromStats(stats: GithubStats) {
  const c = stats.commits;
  return {
    commitsWeek: [c * 0.02, c * 0.03, c * 0.025, c * 0.04, c * 0.035, c * 0.03, c * 0.045].map(
      (n) => Math.round(n) % 20 || 4
    ),
    prsMonth: [stats.prs * 0.08, stats.prs * 0.12, stats.prs * 0.1, stats.prs * 0.15].map(
      (n) => Math.round(n) % 18 || 3
    ),
    issuesMonth: [stats.issues * 0.06, stats.issues * 0.09, stats.issues * 0.11, stats.issues * 0.08].map(
      (n) => Math.round(n) % 16 || 2
    ),
    uptime: [98, 99, 97, 99, 100, 99, 100],
  };
}
