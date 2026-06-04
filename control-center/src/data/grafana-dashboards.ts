/** Curated Eldertree Grafana dashboards — UIDs from pi-fleet/helm/monitoring-stack/DASHBOARDS.md */

export const GRAFANA_BASE =
  import.meta.env.VITE_GRAFANA_BASE ?? "https://grafana.eldertree.local";

export const PROMETHEUS_URL =
  import.meta.env.VITE_PROMETHEUS_URL ?? "https://prometheus.eldertree.local";

export interface GrafanaDashboard {
  uid: string;
  label: string;
  description: string;
  featured?: boolean;
}

export const GRAFANA_DASHBOARDS: GrafanaDashboard[] = [
  {
    uid: "eldertree-ops-home",
    label: "Ops home",
    description: "Start here — probes, Traefik, Pi readiness, links to other boards",
    featured: true,
  },
  {
    uid: "eldertree-command-center",
    label: "Command center",
    description: "Cluster health, resources, problem pods, top consumers",
    featured: true,
  },
  {
    uid: "eldertree-cluster",
    label: "Cluster overview",
    description: "3-node HA, namespaces, infra + app service summary",
    featured: true,
  },
  {
    uid: "hardware-health",
    label: "Hardware health",
    description: "Pi temperature, load, disk, watchdog, reboot signals",
    featured: true,
  },
  {
    uid: "kubernetes-workloads",
    label: "Kubernetes workloads",
    description: "Deployments, restarts, CPU/memory vs requests",
  },
  {
    uid: "namespace-resources",
    label: "Resources by namespace",
    description: "Per-namespace CPU, memory, network trends",
  },
  {
    uid: "network-intelligence",
    label: "Network intelligence",
    description: "Traefik rates, status codes, top services",
  },
  {
    uid: "vault-ops",
    label: "Vault operations",
    description: "Sealed state, raft, tokens, request rates",
  },
  {
    uid: "swimto-dashboard",
    label: "SwimTO",
    description: "App traffic, pods, Postgres & Redis",
  },
];

export function grafanaDashboardUrl(uid: string): string {
  return `${GRAFANA_BASE.replace(/\/$/, "")}/d/${uid}`;
}
