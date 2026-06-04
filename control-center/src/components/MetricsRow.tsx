import { Sparkline } from "./Sparkline";

interface MetricsRowProps {
  commitsWeek: number[];
  prsMonth: number[];
  issuesMonth: number[];
  uptime: number[];
}

export function MetricsRow({ commitsWeek, prsMonth, issuesMonth, uptime }: MetricsRowProps) {
  return (
    <section className="panel metrics-row" aria-label="Cluster metrics">
      <Sparkline values={commitsWeek} label="Commits / week" />
      <Sparkline values={prsMonth} label="PRs / month" />
      <Sparkline values={issuesMonth} label="Issues solved / month" />
      <Sparkline values={uptime} label="Cluster uptime" unit="%" />
    </section>
  );
}
