/** Static Eldertree cluster manifest — source: pi-fleet/docs/ELDERTREE.md
 *
 * ClusterGlance (see useClusterNodeStatus.ts):
 * - Node list comes from the Control Center / K8s API when live or cached — new cluster nodes appear automatically.
 * - Entries here enrich known nodes (IPs, roles); unknown ids still render id + Ready badge only.
 * - Offline fallback: manifest nodes with "Unknown" readiness.
 * - Refresh cluster-status.json: scripts/sync-cluster-status.sh (requires kubectl + LAN cluster).
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
    { label: "DNS", ip: "192.168.2.201", purpose: "BIND9 LB" },
  ] satisfies ClusterVip[],
  stack: [
    "K3s HA (3× control-plane)",
    "FluxCD GitOps",
    "Traefik ingress",
    "Vault HA (Raft)",
    "External Secrets Operator",
    "BIND9 + external-dns",
    "Cloudflare Tunnel",
    "Prometheus / Grafana / Loki",
  ],
  storage: {
    active: ["local-path", "local-path-nvme (Vault)"],
    retired: "Longhorn (removed Feb 2026)",
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
    title: "The Moment I Decided to Own My Infrastructure",
    summary:
      "The AWS bill moment — why self-host on ARM, privacy over convenience, and how Eldertree started.",
    chapter: "/chapters/01-the-moment-i-decided-to-own-my-infrastructure",
    tags: ["Origin story", "Self-hosting"],
  },
  {
    title: "The CI/CD consolidation",
    summary:
      "Eight repos, copy-paste workflows — centralized reusable GitHub Actions in github-workflows.",
    chapter: "/chapters/18-reusable-workflows",
    tags: ["CI/CD", "GitHub Actions"],
  },
  {
    title: "HA node failure cascade",
    summary:
      "node-1 NotReady triggered Multi-Attach (historical Longhorn), Vault failover, and ESO sync issues.",
    runbook: "https://docs.eldertree.xyz/runbook/issues/ha/HA-001",
    tags: ["HA", "Node"],
  },
  {
    title: "Vault seal after reboot",
    summary: "HA Raft survives node loss; unseal workflow documented in runbook VAULT-001.",
    runbook: "https://docs.eldertree.xyz/runbook/issues/vault/VAULT-001",
    tags: ["Vault", "Secrets"],
  },
  {
    title: "Pi-hole → BIND9",
    summary:
      "Why we removed Pi-hole ~8 months in — adblock unused, sidecar complexity, and the June 2026 cutover to standalone BIND9 on the same VIP.",
    chapter: "/chapters/interlude-why-we-dropped-pihole-for-bind9",
    tags: ["DNS", "Simplification"],
  },
  {
    title: "Port 53 on bare-metal K3s",
    summary:
      "Historical: Pi-hole vs klipper ServiceLB, kube-vip VIPs, and disabling ServiceLB — lessons BIND9 inherited.",
    chapter: "/chapters/interlude-why-we-dropped-pihole-for-bind9",
    tags: ["DNS", "Networking"],
  },
  {
    title: "Longhorn removed",
    summary: "Distributed storage was resource-heavy on 8GB Pis; Vault uses Raft + local-path-nvme instead.",
    runbook: "https://docs.eldertree.xyz/runbook/",
    tags: ["Storage"],
  },
  {
    title: "Tailscale routing",
    summary: "Subnet routes without advertising K8s CIDRs — remote access without breaking Flannel.",
    runbook: "https://docs.eldertree.xyz/runbook/",
    tags: ["Networking", "Remote access"],
  },
  {
    title: "node-1 deprioritized",
    summary: "Soft taint and Flux reconciler steer new workloads to node-2/3 after intermittent freezes.",
    runbook: "https://docs.eldertree.xyz/runbook/",
    tags: ["Node", "Scheduling"],
  },
] as const;
