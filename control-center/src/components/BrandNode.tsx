import type { CSSProperties } from "react";
import { ComponentIcon, getBrandColor } from "../lib/componentIcons";

interface BrandNodeProps {
  id: string;
  label: string;
  x: number;
  y: number;
  ready?: boolean;
}

/** Brand mark + label in logo colors — same visual language as the Eldertree logo. */
export function BrandNode({ id, label, x, y, ready = true }: BrandNodeProps) {
  const color = getBrandColor(id);

  return (
    <div
      className={`topology-brand-node ${ready ? "ready" : "not-ready"}`}
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          "--brand-color": color,
        } as CSSProperties
      }
    >
      <div className="topology-brand-icon" style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}>
        <ComponentIcon componentId={id} size={22} />
      </div>
      <span className="topology-brand-label">{label}</span>
    </div>
  );
}
