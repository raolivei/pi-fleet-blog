#!/usr/bin/env bash
# Write public/cluster-status.json from kubectl (optional CI / local refresh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/cluster-status.json"
KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config-eldertree}"

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl not found; skipping cluster-status sync" >&2
  exit 0
fi

if ! kubectl --kubeconfig="$KUBECONFIG" get nodes -o json >/dev/null 2>&1; then
  echo "cluster unreachable (KUBECONFIG=$KUBECONFIG); leaving $OUT unchanged" >&2
  exit 0
fi

kubectl --kubeconfig="$KUBECONFIG" get nodes -o json | python3 -c '
import json, sys
from datetime import datetime, timezone

data = json.load(sys.stdin)
nodes = []
for item in data.get("items", []):
    name = item["metadata"]["name"]
    node_id = name.split(".")[0]
    ready = any(
        c.get("type") == "Ready" and c.get("status") == "True"
        for c in (item.get("status", {}).get("conditions") or [])
    )
    nodes.append({"id": node_id, "ready": ready})

out = {
    "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "nodes": sorted(nodes, key=lambda n: n["id"]),
}
print(json.dumps(out, indent=2))
' > "$OUT"

echo "wrote $OUT"
