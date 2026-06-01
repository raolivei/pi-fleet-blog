/** Static Eldertree cluster manifest — source: pi-fleet/docs/ELDERTREE.md */

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

export interface ClusterLink {
  label: string;
  href: string;
  external?: boolean;
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
  links: [
    {
      label: "Grafana Ops Home",
      href: "https://grafana.eldertree.local/d/eldertree-ops-home",
      external: true,
    },
    {
      label: "Runbook",
      href: "https://docs.eldertree.xyz/runbook/",
      external: true,
    },
    {
      label: "Project docs",
      href: "https://docs.eldertree.xyz/project",
      external: true,
    },
    {
      label: "pi-fleet",
      href: "https://github.com/raolivei/pi-fleet",
      external: true,
    },
    {
      label: "Hardware health",
      href: "https://grafana.eldertree.local/d/hardware-health",
      external: true,
    },
  ] satisfies ClusterLink[],
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

export const docPillars = [
  {
    id: "setup",
    title: "Cluster setup",
    description: "Hardware, OS, K3s HA, first boot",
    chapters: [
      { label: "Vision", href: "/chapters/01-vision" },
      { label: "Hardware", href: "/chapters/02-hardware-decisions" },
      { label: "OS setup", href: "/chapters/03-os-base-setup" },
      { label: "Why K3s", href: "/chapters/04-kubernetes-choice" },
      { label: "Cluster setup", href: "/chapters/05-cluster-setup" },
    ],
    runbooks: [
      { label: "NODE-001", href: "https://docs.eldertree.xyz/runbook/issues/node/NODE-001" },
      { label: "BOOT-001", href: "https://docs.eldertree.xyz/runbook/issues/boot/BOOT-001" },
      { label: "K3S-001", href: "https://docs.eldertree.xyz/runbook/issues/node/K3S-001" },
    ],
  },
  {
    id: "infra",
    title: "Core infrastructure",
    description: "Network, DNS, secrets, ingress",
    chapters: [
      { label: "Networking", href: "/chapters/06-networking-architecture" },
      { label: "Vault", href: "/chapters/07-secrets-management" },
      { label: "DNS", href: "/chapters/08-dns-service-discovery" },
    ],
    runbooks: [
      { label: "DNS-001", href: "https://docs.eldertree.xyz/runbook/issues/dns/DNS-001" },
      { label: "CF-001", href: "https://docs.eldertree.xyz/runbook/issues/cloudflare/CF-001" },
      { label: "VAULT-001", href: "https://docs.eldertree.xyz/runbook/issues/storage/VAULT-001" },
    ],
  },
  {
    id: "ops",
    title: "Operations",
    description: "GitOps, monitoring, incidents",
    chapters: [
      { label: "Monitoring", href: "/chapters/09-monitoring-observability" },
      { label: "FluxCD", href: "/chapters/10-gitops-fluxcd" },
      { label: "Troubleshooting", href: "/chapters/14-troubleshooting" },
    ],
    runbooks: [
      { label: "HA-001", href: "https://docs.eldertree.xyz/runbook/issues/ha/HA-001" },
      { label: "CICD-001", href: "https://docs.eldertree.xyz/runbook/issues/cicd/CICD-001" },
      { label: "OPENCLAW-001", href: "https://docs.eldertree.xyz/runbook/issues/openclaw/OPENCLAW-001" },
    ],
  },
] as const;
