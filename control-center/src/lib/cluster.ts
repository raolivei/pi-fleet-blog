export interface LiveNode {
  id: string;
  ready: boolean;
}

export interface ClusterSnapshot {
  nodes: LiveNode[];
  source: "elder" | "json" | "static";
  updated?: string;
}

const STATIC_NODES: LiveNode[] = [
  { id: "node-1", ready: true },
  { id: "node-2", ready: true },
  { id: "node-3", ready: true },
];

export async function fetchClusterSnapshot(): Promise<ClusterSnapshot> {
  const elderUrl =
    import.meta.env.VITE_ELDER_API ??
    "https://elder.eldertree.local/api/public/cluster/nodes";

  try {
    const res = await fetch(elderUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = (await res.json()) as { updated?: string; nodes?: LiveNode[] };
      if (data.nodes?.length) {
        return { nodes: data.nodes, source: "elder", updated: data.updated };
      }
    }
  } catch {
    /* LAN / CORS — fall through */
  }

  try {
    const res = await fetch("/cluster-status.json", { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = (await res.json()) as { updated?: string; nodes?: LiveNode[] };
      if (data.nodes?.length) {
        return { nodes: data.nodes, source: "json", updated: data.updated };
      }
    }
  } catch {
    /* optional proxy to blog dev server */
  }

  return { nodes: STATIC_NODES, source: "static" };
}
