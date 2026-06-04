import { ExternalLink, LayoutDashboard } from "lucide-react";
import {
  GRAFANA_BASE,
  GRAFANA_DASHBOARDS,
  PROMETHEUS_URL,
  grafanaDashboardUrl,
} from "../data/grafana-dashboards";

export function GrafanaPanel() {
  const featured = GRAFANA_DASHBOARDS.filter((d) => d.featured);
  const more = GRAFANA_DASHBOARDS.filter((d) => !d.featured);

  return (
    <section className="panel grafana-panel" aria-label="Grafana dashboards">
      <div className="grafana-panel-header">
        <h2 className="panel-title">Grafana dashboards</h2>
        <a
          href={GRAFANA_BASE}
          className="grafana-home-link"
          target="_blank"
          rel="noreferrer"
        >
          Open Grafana
          <ExternalLink size={14} aria-hidden />
        </a>
      </div>
      <p className="grafana-lead">
        Live metrics on the LAN — same stack as production observability (
        <code>pi-fleet</code> monitoring chart).
      </p>

      <p className="grafana-group-label">Start here</p>
      <ul className="grafana-list">
        {featured.map((d) => (
          <li key={d.uid}>
            <a href={grafanaDashboardUrl(d.uid)} target="_blank" rel="noreferrer">
              <LayoutDashboard size={18} className="grafana-icon" aria-hidden />
              <span className="grafana-link-text">
                <span className="grafana-link-label">{d.label}</span>
                <span className="grafana-link-desc">{d.description}</span>
              </span>
              <ExternalLink size={14} className="docs-external" aria-hidden />
            </a>
          </li>
        ))}
      </ul>

      {more.length > 0 && (
        <>
          <p className="grafana-group-label">Platform & apps</p>
          <ul className="grafana-list grafana-list--compact">
            {more.map((d) => (
              <li key={d.uid}>
                <a href={grafanaDashboardUrl(d.uid)} target="_blank" rel="noreferrer">
                  <span className="grafana-link-label">{d.label}</span>
                  <ExternalLink size={14} className="docs-external" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="grafana-related">
        <a href={PROMETHEUS_URL} target="_blank" rel="noreferrer">
          Prometheus
          <ExternalLink size={12} aria-hidden />
        </a>
        <span className="grafana-related-sep">·</span>
        <a
          href="https://docs.eldertree.xyz/project"
          target="_blank"
          rel="noreferrer"
        >
          Dashboard index (runbook)
          <ExternalLink size={12} aria-hidden />
        </a>
      </div>
    </section>
  );
}
