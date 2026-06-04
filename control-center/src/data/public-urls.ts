/** Public Eldertree URLs (prod). Override via Vite env when needed. */

export const GRAFANA_BASE =
  import.meta.env.VITE_GRAFANA_BASE ?? "https://grafana.eldertree.xyz";

export const PROMETHEUS_URL =
  import.meta.env.VITE_PROMETHEUS_URL ?? "https://prometheus.eldertree.xyz";

export const DOCS_URL =
  import.meta.env.VITE_DOCS_URL ?? "https://docs.eldertree.xyz";

export const BLOG_URL =
  import.meta.env.VITE_BLOG_URL ?? "https://blog.eldertree.xyz";

export const CONTROL_CENTER_PATH = "/control-center/";

export const CONTROL_CENTER_URL = `${BLOG_URL.replace(/\/$/, "")}${CONTROL_CENTER_PATH}`;
