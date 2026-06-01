/** Static Eldertree cluster manifest — source: pi-fleet/docs/ELDERTREE.md
 *
 * ClusterGlance badge semantics (see useClusterNodeStatus.ts):
 * - Live: K8s node Ready=True → "stable"; Ready=False → "unstable".
 * - Fallback chain: Elder GET /api/public/cluster/nodes → public/cluster-status.json → tiers below.
 * - Static tiers here reflect operational intent (node-1 deprioritized / soft-tainted), not live Ready.
 *   Refresh cluster-status.json locally: scripts/sync-cluster-status.sh (requires kubectl + LAN cluster).
 */

export type NodeTier = "stable" | "unstable";

export interface ClusterNode {
  id: string;
  hostname: string;
  wlan0: string;
  eth0: string;
  tier: NodeTier;
  roles: string[];
}

export interface ClusterVip {
  label: string;
  ip: string;
  purpose: string;
}

export const cluster = {
  name: "Eldertree",
  k3sVersion: "v1.35.0+k3s1",
  os: "Debian 13 (trixie)",
  osNote: "Blog ch.3 covers Bookworm setup; nodes upgraded to trixie in production.",
  hardware: "3× Raspberry Pi 5 (8GB), NVMe boot, PoE+ HAT",
  chassis: "EcoFlow River 3 · TP-Link TL-SG1008MP",
  nodes: [
    {
      id: "node-1",
      hostname: "node-1.eldertree.local",
      wlan0: "192.168.2.101",
      eth0: "10.0.0.1",
      tier: "unstable",
      roles: ["control-plane", "etcd"],
    },
    {
      id: "node-2",
      hostname: "node-2.eldertree.local",
      wlan0: "192.168.2.102",
      eth0: "10.0.0.2",
      tier: "stable",
      roles: ["control-plane", "etcd"],
    },
    {
      id: "node-3",
      hostname: "node-3.eldertree.local",
      wlan0: "192.168.2.103",
      eth0: "10.0.0.3",
      tier: "stable",
      roles: ["control-plane", "etcd"],
    },
  ] satisfies ClusterNode[],
  vips: [
    { label: "API", ip: "192.168.2.100", purpose: "kube-vip HA" },
    { label: "Ingress", ip: "192.168.2.200", purpose: "Traefik *.eldertree.local" },
    { label: "DNS", ip: "192.168.2.201", purpose: "Pi-hole LB" },
  ] satisfies ClusterVip[],
  stack: [
    "K3s HA (3× control-plane)",
    "FluxCD GitOps",
    "Traefik ingress",
    "Vault HA (Raft)",
    "External Secrets Operator",
    "Pi-hole + external-dns",
    "Cloudflare Tunnel",
    "Prometheus / Grafana / Loki",
  ],
  storage: {
    active: ["local-path", "local-path-nvme (Vault)"],
    retired: "Longhorn (removed Feb 2026 — see ch.12)",
  },
  apps: [
    "canopy",
    "swimto",
    "pitanga",
    "ollie",
    "openclaw",
    "eldertree-docs",
    "personal-website",
  ],
} as const;

export const journeyHighlights = [
  {
    title: "Pi-hole vs K3s ServiceLB",
    summary: "Port 53 conflict between Pi-hole and klipper-lb — resolved with kube-vip and disabling ServiceLB.",
    chapter: "/chapters/14-troubleshooting",
    tags: ["DNS", "Networking"],
  },
  {
    title: "Longhorn removed",
    summary: "Distributed storage was resource-heavy on 8GB Pis; Vault uses Raft + local-path-nvme instead.",
    chapter: "/chapters/12-storage-persistence",
    tags: ["Storage"],
  },
  {
    title: "Vault seal after reboot",
    summary: "HA Raft survives node loss; unseal workflow documented in runbook VAULT-001.",
    chapter: "/chapters/07-secrets-management",
    tags: ["Vault", "Secrets"],
  },
  {
    title: "Tailscale routing",
    summary: "Subnet routes without advertising K8s CIDRs — remote access without breaking Flannel.",
    chapter: "/chapters/17-the-tailscale-treachery",
    tags: ["Networking", "Remote access"],
  },
  {
    title: "HA node failure cascade",
    summary: "node-1 NotReady triggered Multi-Attach (historical Longhorn), Vault failover, and ESO sync issues — HA-001 runbook.",
    chapter: "/chapters/14-troubleshooting",
    runbook: "https://docs.eldertree.xyz/runbook/issues/ha/HA-001",
    tags: ["HA", "Node"],
  },
  {
    title: "Deployment disaster 2026",
    summary: "Cascading failures across the cluster — war story with recovery steps.",
    chapter: "/chapters/16-the-great-deployment-disaster-of-2026",
    tags: ["Incident", "GitOps"],
  },
  {
    title: "Reusable CI workflows",
    summary: "Centralized github-workflows for docker-build and static-site-pages.",
    chapter: "/chapters/18-reusable-workflows",
    tags: ["CI/CD"],
  },
  {
    title: "node-1 deprioritized",
    summary: "Soft taint and Flux reconciler steer new workloads to node-2/3 after intermittent freezes.",
    chapter: "/chapters/15-future-plans-scaling",
    tags: ["Node", "Scheduling"],
  },
] as const;
