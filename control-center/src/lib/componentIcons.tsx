import type { LucideIcon } from "lucide-react";
import {
  Cpu,
  Gauge,
  Globe,
  KeyRound,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  siCloudflare,
  siFlux,
  siGrafana,
  siHashicorp,
  siPihole,
  siPrometheus,
  siTraefikproxy,
} from "simple-icons/icons";

type SimpleIconData = { path: string; hex: string; title: string };

function SimpleBrandIcon({ icon, size = 22 }: { icon: SimpleIconData; size?: number }) {
  return (
    <svg role="img" aria-label={icon.title} viewBox="0 0 24 24" width={size} height={size} fill={`#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}

function LucideBrandIcon({
  icon: Icon,
  size = 22,
  color = "#e8eef4",
}: {
  icon: LucideIcon;
  size?: number;
  color?: string;
}) {
  return <Icon size={size} color={color} aria-hidden strokeWidth={1.75} />;
}

/** Brand hex color for label typography. */
export function getBrandColor(componentId: string): string {
  switch (componentId) {
    case "node_1":
    case "node_2":
    case "node_3":
      return "#14b8a6";
    case "kube_vip":
      return "#fbbf24";
    case "coredns":
      return "#326ce5";
    case "pihole":
      return `#${siPihole.hex}`;
    case "external_dns":
      return "#38bdf8";
    case "cloudflare_tunnel":
      return `#${siCloudflare.hex}`;
    case "traefik":
      return `#${siTraefikproxy.hex}`;
    case "cert_manager":
      return "#22c55e";
    case "vault":
      return `#${siHashicorp.hex}`;
    case "external_secrets":
      return "#a78bfa";
    case "fluxcd":
      return `#${siFlux.hex}`;
    case "prometheus":
      return `#${siPrometheus.hex}`;
    case "grafana":
      return `#${siGrafana.hex}`;
    case "loki":
      return "#f97316";
    case "keda":
      return "#326ce5";
    default:
      return "#8b9aab";
  }
}

export function ComponentIcon({ componentId, size = 22 }: { componentId: string; size?: number }) {
  switch (componentId) {
    case "node_1":
    case "node_2":
    case "node_3":
      return <LucideBrandIcon icon={Cpu} color="#14b8a6" size={size} />;
    case "kube_vip":
      return <LucideBrandIcon icon={Zap} color="#fbbf24" size={size} />;
    case "coredns":
      return <LucideBrandIcon icon={Globe} color="#326ce5" size={size} />;
    case "pihole":
      return <SimpleBrandIcon icon={siPihole} size={size} />;
    case "external_dns":
      return <LucideBrandIcon icon={Globe} color="#38bdf8" size={size} />;
    case "cloudflare_tunnel":
      return <SimpleBrandIcon icon={siCloudflare} size={size} />;
    case "traefik":
      return <SimpleBrandIcon icon={siTraefikproxy} size={size} />;
    case "cert_manager":
      return <LucideBrandIcon icon={ShieldCheck} color="#22c55e" size={size} />;
    case "vault":
      return <SimpleBrandIcon icon={siHashicorp} size={size} />;
    case "external_secrets":
      return <LucideBrandIcon icon={KeyRound} color="#a78bfa" size={size} />;
    case "fluxcd":
      return <SimpleBrandIcon icon={siFlux} size={size} />;
    case "prometheus":
      return <SimpleBrandIcon icon={siPrometheus} size={size} />;
    case "grafana":
      return <SimpleBrandIcon icon={siGrafana} size={size} />;
    case "loki":
      return <LucideBrandIcon icon={Layers} color="#f97316" size={size} />;
    case "keda":
      return <LucideBrandIcon icon={Gauge} color="#326ce5" size={size} />;
    default:
      return <LucideBrandIcon icon={Globe} size={size} />;
  }
}
