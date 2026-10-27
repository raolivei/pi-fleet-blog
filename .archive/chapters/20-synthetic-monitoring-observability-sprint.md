# Chapter 20: Synthetic Uptime and a Full-Stack Observability Sprint

_Why Blackbox exists on Eldertree, and what else landed the same day_

## The angle most clusters miss

Prometheus in Kubernetes is excellent at answering whether **pods, nodes, and Services** are healthy. Traefik can tell you request rates, status codes, and latency at the edge. You can even scrape application `/metrics` when you annotate the Service. That is a lot of truth.

It still does not always answer the question you care about when a user pings you: **“Is the public URL actually working, end to end, through DNS, TLS, ingress, tunnels, and whatever else sits in front of the container?”** A `Deployment` can be green while a cert is wrong, a `IngressRoute` is mis-typed, or a Cloudflare rule is blocking. You need a probe that **walks the same path a browser does** — and does it from *outside* the app but *on a schedule* with clear pass/fail semantics.

That is the niche **[Prometheus Blackbox exporter](https://github.com/prometheus/blackbox_exporter)** fills: it does not replace your app metrics, logs, or traces. It is **synthetic** monitoring — HTTP(S) modules (or TCP, ICMP, etc.) that produce metrics like `probe_success`, duration, and response codes, which Prometheus can scrape and alert on. If you conflate that with [OpenTelemetry](https://opentelemetry.io/), you will be disappointed: OTel is a pipeline for traces, metrics, and logs from instrumented code; Blackbox is a small robot that knocks on URLs. Both belong in a complete story; neither substitutes for the other.

## What we wired on Eldertree

I deployed Blackbox in the `observability` namespace, plus static ScrapeConfig secrets so Prometheus **scrapes the exporter in “prober” mode**: the metrics live on the Blackbox job, but the `__param_target` (and relabels) point at the real `https://…` hosts. Public names (e.g. SwimTO, Pitanga) use the normal `http_2xx`-style check; a separate job with a relaxed TLS profile hits internal UIs (Grafana, Prometheus, Alertmanager) on local names with our cluster CA, so I still get `probe_success` for those without pretending they are public DigiCert hostnames.

Alertmanager gets a clear rule, **`BlackboxProbeFailing`**: when `probe_success` for the Blackbox jobs is `0` for long enough, something is wrong with **reachability or HTTP semantics** for that URL, not (necessarily) with a single container’s liveness.

Canonical write-up, target lists, and how to add a new hostname: **[`pi-fleet` — OBSERVABILITY_BLACKBOX_AND_SYNTHETIC](https://github.com/raolivei/pi-fleet/blob/main/docs/OBSERVABILITY_BLACKBOX_AND_SYNTHETIC.md)** (same content lives in the repo; paths may vary after refactors). The **Eldertree Ops Home** Grafana dashboard ties this together with a minimum `probe_success` panel so you can glance at “are our synthetic checks green” without opening every URL.

## The same sprint: the rest of the story

This was not a one-component change. In the same push we:

- **Scraped Traefik’s native Prometheus endpoint** (static `additionalScrapeConfigs`) so ingress reality matches dashboard PromQL. Traefik v3 label names matter: dashboards and the doc [`DASHBOARDS.md`](https://github.com/raolivei/pi-fleet/blob/main/helm/monitoring-stack/DASHBOARDS.md) in `monitoring-stack` call out the “source of truth” for which labels to use, so you do not chase ghosts after an upgrade.
- **Scoped the Grafana sidecar to `observability` only** — a previous `searchNamespace: ALL` meant *any* ConfigMap in the cluster tagged for dashboard import (including charts from other vendors) could show up in my homelab Grafana. That looked like a “hacked” dashboard list; it was just an overly promiscuous sidecar. Namespaces exist for a reason.
- **Loki, Promtail, and a Loki datasource in Grafana** for a single place to read pod logs, complementing metrics without pretending logs replace them.
- **Eldertree Ops Home** as a lightweight hub: links into the folders and UIDs we actually maintain, plus a few high-signal stats (Traefik, Blackbox, a SwimTO product gauge for depth — see the SwimTO API release for `swimto_db_users_total`).

I also re-audited every custom dashboard JSON, fixed a broken `expr` in one panel (invalid quoting), and wrote [`DASHBOARDS.md`](https://github.com/raolivei/pi-fleet/blob/main/helm/monitoring-stack/DASHBOARDS.md) as a real **inventory and overlap** guide instead of wishful file names. Chart bumps tracked those fixes.

## Takeaways

1. **Blackbox answers “is the URL alive?”** — not “is my code correct?” or “where is the slow span?”
2. **In-cluster `up` and Blackbox are complementary** — I want both, plus Traefik, plus app metrics where they exist.
3. **Grafana’s sidecar is powerful and dangerous** — always tighten `searchNamespace` to the namespace *you* own.
4. **When you add synthetics, add alerts and a dashboard row** — otherwise you only find out in Firefighting Mode™.

[Chapter 9: Monitoring and Observability](/chapters/09-monitoring-observability) covers the original foundations; this chapter is the “what we did in 2026 when we closed the last obvious gaps” addendum. If you run a similar cluster, the doc linked above is the operational reference; this post is the narrative.
