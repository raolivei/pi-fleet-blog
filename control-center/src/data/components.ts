/** Cluster infrastructure catalog (no user-facing L7 apps). */

export type OSILayer =
  | "L1_Physical"
  | "L2_L3_Network"
  | "L4_Transport"
  | "L5_L6_Security"
  | "L7_Application";

export interface ClusterComponent {
  id: string;
  label: string;
  layer: OSILayer;
  dependsOn: string[];
}

/** Positions in 0–100 viewBox coords (higher y = lower on screen). */
export const POSITIONS: Record<string, { x: number; y: number }> = {
  node_1: { x: 20, y: 90 },
  node_2: { x: 50, y: 94 },
  node_3: { x: 80, y: 90 },

  kube_vip: { x: 50, y: 74 },
  coredns: { x: 22, y: 68 },
  pihole: { x: 50, y: 68 },
  external_dns: { x: 78, y: 66 },
  cloudflare_tunnel: { x: 78, y: 72 },

  traefik: { x: 50, y: 56 },

  cert_manager: { x: 22, y: 44 },
  vault: { x: 50, y: 40 },
  external_secrets: { x: 78, y: 44 },

  fluxcd: { x: 14, y: 14 },
  prometheus: { x: 30, y: 14 },
  grafana: { x: 46, y: 14 },
  loki: { x: 62, y: 14 },
  keda: { x: 78, y: 14 },

  logoTop: { x: 50, y: 24 },
  logoBottom: { x: 50, y: 36 },
};

export const COMPONENTS: ClusterComponent[] = [
  { id: "node_1", label: "Pi01", layer: "L1_Physical", dependsOn: [] },
  { id: "node_2", label: "Pi02", layer: "L1_Physical", dependsOn: [] },
  { id: "node_3", label: "Pi03", layer: "L1_Physical", dependsOn: [] },

  { id: "kube_vip", label: "kube-vip", layer: "L2_L3_Network", dependsOn: ["node_1", "node_2", "node_3"] },
  { id: "coredns", label: "CoreDNS", layer: "L2_L3_Network", dependsOn: ["kube_vip"] },
  { id: "pihole", label: "Pi-hole", layer: "L2_L3_Network", dependsOn: ["coredns"] },
  { id: "cloudflare_tunnel", label: "Cloudflare", layer: "L2_L3_Network", dependsOn: ["coredns"] },
  { id: "external_dns", label: "external-dns", layer: "L2_L3_Network", dependsOn: ["cert_manager"] },

  { id: "traefik", label: "Traefik", layer: "L4_Transport", dependsOn: ["kube_vip"] },

  { id: "cert_manager", label: "cert-manager", layer: "L5_L6_Security", dependsOn: ["kube_vip"] },
  { id: "vault", label: "Vault", layer: "L5_L6_Security", dependsOn: ["cert_manager"] },
  { id: "external_secrets", label: "External Secrets", layer: "L5_L6_Security", dependsOn: ["vault"] },

  { id: "fluxcd", label: "FluxCD", layer: "L7_Application", dependsOn: ["traefik"] },
  { id: "prometheus", label: "Prometheus", layer: "L7_Application", dependsOn: ["traefik", "external_secrets"] },
  { id: "grafana", label: "Grafana", layer: "L7_Application", dependsOn: ["traefik", "prometheus", "vault"] },
  { id: "loki", label: "Loki", layer: "L7_Application", dependsOn: ["traefik"] },
  { id: "keda", label: "KEDA", layer: "L7_Application", dependsOn: ["prometheus"] },
];

export const LAYER_ORDER: OSILayer[] = [
  "L1_Physical",
  "L2_L3_Network",
  "L4_Transport",
  "L5_L6_Security",
  "L7_Application",
];

export const LAYER_LABELS: Record<OSILayer, string> = {
  L1_Physical: "Physical",
  L2_L3_Network: "Network",
  L4_Transport: "Transport",
  L5_L6_Security: "Security",
  L7_Application: "Application",
};

const PI_MESH: [string, string][] = [
  ["node_1", "node_2"],
  ["node_2", "node_3"],
  ["node_3", "node_1"],
];

/** Hub links from Eldertree logo to physical layer + network VIP. */
const LOGO_LINKS: [string, string][] = [
  ["kube_vip", "logoTop"],
  ["logoBottom", "traefik"],
  ["logoBottom", "node_1"],
  ["logoBottom", "node_2"],
  ["logoBottom", "node_3"],
];

export function buildLinks(): [string, string][] {
  const depLinks: [string, string][] = [];
  for (const comp of COMPONENTS) {
    for (const depId of comp.dependsOn) {
      depLinks.push([depId, comp.id]);
    }
  }
  return [...LOGO_LINKS, ...depLinks, ...PI_MESH];
}

export function getPosition(id: string): { x: number; y: number } | undefined {
  return POSITIONS[id];
}
