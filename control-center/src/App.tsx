import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { MetricsRow } from "./components/MetricsRow";
import { Topology } from "./components/Topology";
import { FloatingWidgets } from "./components/FloatingWidgets";
import { IncidentFeed } from "./components/IncidentFeed";
import { DocumentationPanel } from "./components/DocumentationPanel";
import { TerminalFeed } from "./components/TerminalFeed";
import { getGithubStats, sparklinesFromStats } from "./lib/github";
import { getIncidents } from "./lib/incidents";
import { fetchClusterSnapshot, type ClusterSnapshot } from "./lib/cluster";
import "./App.css";

const incidents = getIncidents();

export default function App() {
  const [cluster, setCluster] = useState<ClusterSnapshot | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [sparklines, setSparklines] = useState({
    commitsWeek: [4, 8, 7, 12, 15, 9, 18],
    prsMonth: [3, 6, 5, 9],
    issuesMonth: [2, 4, 6, 5],
    uptime: [98, 99, 97, 99, 100, 99, 100],
  });
  const [repoLabel, setRepoLabel] = useState("raolivei/pi-fleet");

  useEffect(() => {
    void fetchClusterSnapshot().then(setCluster);
    const interval = setInterval(() => void fetchClusterSnapshot().then(setCluster), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    void getGithubStats()
      .then((s) => {
        setSparklines(sparklinesFromStats(s));
        if (s.repo) setRepoLabel(s.repo);
        if (s.mock) setStatsError(s.message ?? "Using mock GitHub stats");
      })
      .catch((e: Error) => setStatsError(e.message));
  }, []);

  const nodes = cluster?.nodes ?? [
    { id: "node-1", ready: true },
    { id: "node-2", ready: true },
    { id: "node-3", ready: true },
  ];

  return (
    <div className="control-center">
      <header className="cc-header">
        <div className="cc-header-main">
          <Activity className="cc-header-icon" size={28} />
          <div>
            <p className="cc-eyebrow">Local preview · port 5174</p>
            <h1>Eldertree Control Center</h1>
          </div>
        </div>
        <div className="cc-header-meta">
          <span className={`source-pill source-${cluster?.source ?? "static"}`}>
            Nodes: {cluster?.source ?? "static"}
          </span>
          <span className="repo-pill">{repoLabel}</span>
          {statsError && <span className="mock-pill">{statsError}</span>}
        </div>
      </header>

      <MetricsRow {...sparklines} />

      <div className="topology-section">
        <Topology nodes={nodes} />
        <FloatingWidgets />
      </div>

      <div className="split-row">
        <IncidentFeed incidents={incidents} />
        <DocumentationPanel />
      </div>

      <TerminalFeed />
    </div>
  );
}
