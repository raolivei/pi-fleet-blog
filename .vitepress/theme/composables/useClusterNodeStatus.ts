import { computed, onMounted, ref } from "vue";
import { cluster, type ClusterNode, type NodeTier } from "../../../data/cluster";

export interface ClusterNodeView extends ClusterNode {
  tier: NodeTier;
  live: boolean;
}

interface StatusPayload {
  updated?: string;
  nodes: { id: string; ready: boolean }[];
}

const STATUS_URLS: string[] = [
  import.meta.env.VITE_CLUSTER_STATUS_URL,
  "https://control.eldertree.xyz/api/public/cluster/nodes",
  "https://elder.eldertree.local/api/public/cluster/nodes",
  "/cluster-status.json",
].filter((url): url is string => Boolean(url));

function readyToTier(ready: boolean): NodeTier {
  return ready ? "stable" : "unstable";
}

function normalizeNodeId(name: string): string {
  const base = name.split(".")[0];
  return base.startsWith("node-") ? base : name;
}

async function fetchJson(url: string): Promise<StatusPayload | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as StatusPayload;
    if (!Array.isArray(data.nodes) || data.nodes.length === 0) return null;
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function useClusterNodeStatus() {
  const source = ref<"static" | "live">("static");
  const lastUpdated = ref<string | null>(null);
  const tiersById = ref<Record<string, NodeTier>>({});

  const displayNodes = computed<ClusterNodeView[]>(() =>
    cluster.nodes.map((node) => ({
      ...node,
      tier: tiersById.value[node.id] ?? node.tier,
      live: source.value === "live",
    })),
  );

  async function refresh() {
    for (const url of STATUS_URLS) {
      const data = await fetchJson(url);
      if (!data) continue;

      const map: Record<string, NodeTier> = {};
      for (const n of data.nodes) {
        map[normalizeNodeId(n.id)] = readyToTier(n.ready);
      }
      for (const node of cluster.nodes) {
        if (!(node.id in map)) {
          map[node.id] = node.tier;
        }
      }

      tiersById.value = map;
      source.value = "live";
      lastUpdated.value = data.updated ?? null;
      return;
    }

    tiersById.value = Object.fromEntries(cluster.nodes.map((n) => [n.id, n.tier]));
    source.value = "static";
    lastUpdated.value = null;
  }

  onMounted(() => {
    void refresh();
  });

  return { displayNodes, source, lastUpdated, refresh };
}
