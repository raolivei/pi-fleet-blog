import { motion } from "framer-motion";
import type { LiveNode } from "../lib/cluster";
import { BrandNode } from "./BrandNode";
import {
  COMPONENTS,
  LAYER_LABELS,
  LAYER_ORDER,
  POSITIONS,
  buildLinks,
  getPosition,
} from "../data/components";

interface TopologyProps {
  nodes: LiveNode[];
}

const LAYER_COUNT = LAYER_ORDER.length;

/** OSI stack grows upward: L1 Physical at bottom, L7 Application at top. */
function laneLabelTopPct(layerIdx: number): number {
  const invertedIdx = LAYER_COUNT - 1 - layerIdx;
  return (invertedIdx * 100) / LAYER_COUNT + 2;
}

function layerSeparatorY(layerIdx: number): number {
  return 100 - (layerIdx * 100) / LAYER_COUNT;
}

const NODE_ID_MAP: Record<string, string> = {
  node_1: "node-1",
  node_2: "node-2",
  node_3: "node-3",
};

export function Topology({ nodes }: TopologyProps) {
  const isReady = (componentId: string) => {
    const liveId = NODE_ID_MAP[componentId];
    if (!liveId) return true;
    return nodes.find((n) => n.id === liveId)?.ready ?? true;
  };

  const links = buildLinks();

  return (
    <section className="panel topology-panel" aria-label="Cluster topology">
      <h2 className="panel-title">Live cluster topology</h2>
      <div className="topology-canvas">
        <motion.svg
          className="topology-links"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {LAYER_ORDER.map((layer, idx) => (
            <line
              key={`sep-${layer}`}
              x1="8"
              y1={layerSeparatorY(idx)}
              x2="92"
              y2={layerSeparatorY(idx)}
              stroke="#1e2a36"
              strokeWidth={0.2}
              strokeDasharray="1.5,1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {links.map(([fromId, toId], i) => {
            const from = getPosition(fromId);
            const to = getPosition(toId);
            if (!from || !to) return null;
            return (
              <motion.line
                key={`${fromId}-${toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#22c55e"
                strokeWidth={0.35}
                vectorEffect="non-scaling-stroke"
                animate={{ strokeOpacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.08 }}
              />
            );
          })}
        </motion.svg>

        <div className="topology-lane-labels" aria-hidden>
          {LAYER_ORDER.map((layer, idx) => (
            <div
              key={layer}
              className="topology-lane-label"
              style={{ top: `${laneLabelTopPct(idx)}%` }}
            >
              {LAYER_LABELS[layer]}
            </div>
          ))}
        </div>

        <div className="topology-center">
          <img
            src={`${import.meta.env.BASE_URL}logo-full.png`}
            alt="Eldertree cluster"
            className="topology-logo"
          />
        </div>

        {COMPONENTS.map((comp) => {
          const pos = POSITIONS[comp.id];
          if (!pos) return null;
          return (
            <BrandNode
              key={comp.id}
              id={comp.id}
              label={comp.label}
              x={pos.x}
              y={pos.y}
              ready={isReady(comp.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
