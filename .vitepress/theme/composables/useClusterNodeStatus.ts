import { computed, onMounted, ref } from "vue";
import { cluster, type ClusterNode } from "../../../data/cluster";

export type NodeReadiness = "ready" | "not-ready" | "unknown";
export type StatusSource = "live" | "cached" | "unavailable";

export interface ClusterNodeView {
  id: string;
  hostname?: string;
  wlan0?: string;
  eth0?: string;
  roles?: string[];
  readiness: NodeReadiness;
}

interface RemoteNode {
  id: string;
  ready: boolean;
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

const CACHE_URL = "/cluster-status.json";

const MANIFEST_BY_ID = Object.fromEntries(
  cluster.nodes.map((node) => [node.id, node]),
) as Record<string, ClusterNode>;

const REMOTE_NODES_URLS: string[] = [
  import.meta.env.VITE_CLUSTER_STATUS_URL,
  "https://control.eldertree.xyz/api/public/cluster/nodes",
  "https://elder.eldertree.local/api/public/cluster/nodes",
].filter((url): url is string => Boolean(url));

const HEALTH_URLS: string[] = [
  "https://control.eldertree.xyz/api/public/cluster/health",
  "https://elder.eldertree.local/api/public/cluster/health",
].filter((url): url is string => Boolean(url));

function readyToReadiness(ready: boolean): NodeReadiness {
  return ready ? "ready" : "not-ready";
}

function normalizeNodeId(name: string): string {
  const base = name.split(".")[0];
  return base.startsWith("node-") ? base : name;
}

function enrichNode(remote: RemoteNode): ClusterNodeView {
  const manifest = MANIFEST_BY_ID[remote.id];
  return {
    id: remote.id,
    hostname: manifest?.hostname,
    wlan0: manifest?.wlan0,
    eth0: manifest?.eth0,
    roles: manifest?.roles,
    readiness: readyToReadiness(remote.ready),
  };
}

function normalizeRemoteNodes(nodes: NodesPayload["nodes"]): RemoteNode[] {
  return nodes
    .map((node) => ({
      id: normalizeNodeId(node.id),
      ready: node.ready,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
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
  const source = ref<StatusSource>("unavailable");
  const lastUpdated = ref<string | null>(null);
  const remoteNodes = ref<RemoteNode[] | null>(null);
  const healthyApps = ref<number | null>(null);
  const totalApps = ref<number | null>(null);

  const displayNodes = computed<ClusterNodeView[]>(() => {
    if (remoteNodes.value?.length) {
      return remoteNodes.value.map(enrichNode);
    }

    return cluster.nodes.map((node) => ({
      id: node.id,
      hostname: node.hostname,
      wlan0: node.wlan0,
      eth0: node.eth0,
      roles: node.roles,
      readiness: "unknown" as NodeReadiness,
    }));
  });

  const readyNodeCount = computed(
    () => displayNodes.value.filter((n) => n.readiness === "ready").length,
  );

  const totalNodeCount = computed(() => displayNodes.value.length);

  function applyNodes(data: NodesPayload) {
    remoteNodes.value = normalizeRemoteNodes(data.nodes);
    lastUpdated.value = data.updated ?? null;
  }

  function applyHealth(data: HealthPayload) {
    applyNodes(data);
    if (Array.isArray(data.components)) {
      const apps = data.components.filter((c) => c.status === "healthy");
      healthyApps.value = apps.length;
      totalApps.value = data.components.length;
    }
  }

  function clearComponentStats() {
    healthyApps.value = null;
    totalApps.value = null;
  }

  function clearRemoteNodes() {
    remoteNodes.value = null;
    lastUpdated.value = null;
    clearComponentStats();
  }

  async function refresh() {
    for (const url of HEALTH_URLS) {
      const data = await fetchJson<HealthPayload>(url);
      if (data?.nodes?.length) {
        applyHealth(data);
        source.value = "live";
        return;
      }
    }

    for (const url of REMOTE_NODES_URLS) {
      const data = await fetchJson<NodesPayload>(url);
      if (data?.nodes?.length) {
        applyNodes(data);
        clearComponentStats();
        source.value = "live";
        return;
      }
    }

    const cached = await fetchJson<NodesPayload>(CACHE_URL);
    if (cached?.nodes?.length) {
      applyNodes(cached);
      clearComponentStats();
      source.value = "cached";
      return;
    }

    clearRemoteNodes();
    source.value = "unavailable";
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
    totalNodeCount,
    healthyApps,
    totalApps,
  };
}
