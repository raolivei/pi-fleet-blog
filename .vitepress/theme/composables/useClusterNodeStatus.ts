import { computed, onMounted, ref } from "vue";
import { cluster, type ClusterNode, type NodeTier } from "../../../data/cluster";

export interface ClusterNodeView extends ClusterNode {
  tier: NodeTier;
  live: boolean;
}

interface NodesPayload {
  updated?: string;
  nodes: { id: string; ready: boolean }[];
}

interface HealthPayload extends NodesPayload {
  components?: { id: string; label: string; status: string; ready: number | null; total: number | null }[];
  flux_ready?: number;
  flux_total?: number;
}

const NODES_URLS: string[] = [
  import.meta.env.VITE_CLUSTER_STATUS_URL,
  "https://control.eldertree.xyz/api/public/cluster/nodes",
  "https://elder.eldertree.local/api/public/cluster/nodes",
  "/cluster-status.json",
].filter((url): url is string => Boolean(url));

const HEALTH_URLS: string[] = [
  "https://control.eldertree.xyz/api/public/cluster/health",
  "https://elder.eldertree.local/api/public/cluster/health",
].filter((url): url is string => Boolean(url));

function readyToTier(ready: boolean): NodeTier {
  return ready ? "stable" : "unstable";
}

function normalizeNodeId(name: string): string {
  const base = name.split(".")[0];
  return base.startsWith("node-") ? base : name;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
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
  const healthyApps = ref<number | null>(null);
  const totalApps = ref<number | null>(null);

  const displayNodes = computed<ClusterNodeView[]>(() =>
    cluster.nodes.map((node) => ({
      ...node,
      tier: tiersById.value[node.id] ?? node.tier,
      live: source.value === "live",
    })),
  );

  const readyNodeCount = computed(
    () => displayNodes.value.filter((n) => n.tier === "stable").length,
  );

  function applyNodes(data: NodesPayload) {
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
    lastUpdated.value = data.updated ?? null;
  }

  function applyHealth(data: HealthPayload) {
    applyNodes(data);
    if (Array.isArray(data.components)) {
      const apps = data.components.filter((c) => c.status === "healthy");
      healthyApps.value = apps.length;
      totalApps.value = data.components.length;
    }
    source.value = "live";
  }

  async function refresh() {
    for (const url of HEALTH_URLS) {
      const data = await fetchJson<HealthPayload>(url);
      if (data?.nodes?.length) {
        applyHealth(data);
        return;
      }
    }

    for (const url of NODES_URLS) {
      const data = await fetchJson<NodesPayload>(url);
      if (data?.nodes?.length) {
        applyNodes(data);
        source.value = "live";
        return;
      }
    }

    tiersById.value = Object.fromEntries(cluster.nodes.map((n) => [n.id, n.tier]));
    source.value = "static";
    lastUpdated.value = null;
    healthyApps.value = null;
    totalApps.value = null;
  }

  onMounted(() => {
    void refresh();
  });

  return {
    displayNodes,
    source,
    lastUpdated,
    refresh,
    readyNodeCount,
    healthyApps,
    totalApps,
  };
}
