# Chapter 7: Watching It All

The first time monitoring saved me, I was asleep.

It was 2 AM on a Tuesday in April 2026. My phone buzzed. Half-awake, I looked at the screen: **"Alertmanager: BlackboxProbeFailing - swimto.eldertree.xyz"**. The synthetic check had failed. The URL wasn't responding.

I grabbed my laptop, connected to Tailscale, opened Grafana. The dashboard told the story immediately: SwimTO's API pod had OOMKilled (out of memory). The database connection pool had leaked, memory usage climbed, Kubernetes killed the pod. The pod restarted automatically (that's what health checks do), but for about 90 seconds, the site was down.

I hadn't noticed. My users hadn't complained yet. But the monitoring caught it. Alert fired. I investigated. I patched the leak, bumped the memory limit, deployed the fix. By morning, it was a non-event.

That's the moment I became religious about observability.

## What You Can't See, You Can't Fix

Before monitoring, debugging meant: user reports a problem, you SSH into the cluster, run kubectl commands, check logs, guess at what happened, maybe find the issue, maybe not. It's reactive, slow, and you only see the current state—not what led to the failure.

After monitoring, debugging means: alert fires, you open Grafana, the dashboard shows exactly what happened, when it happened, and what metrics spiked or dropped. It's proactive, fast, and you see the history.

The difference is enormous.

## The Monitoring Stack

Eldertree's observability stack has five core components:

**Prometheus** — Metrics collection and storage (7-day retention, 8GB persistent volume)  
**Grafana** — Visualization and dashboards  
**Pushgateway** — Metrics push endpoint for batch jobs  
**Loki** — Log aggregation (for when metrics aren't enough)  
**Alertmanager** — Alerting rules and notifications

Deployed in the `observability` namespace. Managed by Helm. Monitored by... itself.

Prometheus scrapes metrics from:
- Kubernetes API (via kube-state-metrics)
- Node hardware (via node-exporter)
- Applications (via `/metrics` endpoints)
- Traefik (ingress metrics)
- Vault (seal status, request latency)
- PostgreSQL (database stats)
- Redis (cache hit rates)
- Pi-hole (DNS queries, ad blocking)

Every 15 seconds, Prometheus scrapes these endpoints and stores the metrics. Grafana queries Prometheus and renders dashboards. Alertmanager evaluates rules and fires alerts.

It's a closed loop: the cluster monitors itself.

## The Dashboards That Matter

I built several dashboards, but these are the ones I actually use:

**Pi Fleet Overview** — Cluster-wide health at a glance. Node status, pod count, resource usage, Vault seal status, Traefik request rate. The first thing I check every morning.

**Hardware Health** — Raspberry Pi-specific metrics. CPU temperature, throttling status, memory usage, disk I/O. When a node starts thermal throttling (65°C+), I know to check airflow.

**Traefik Ingress Metrics** — HTTP requests per second, response codes, latency percentiles. When response times spike, I know where to look (usually database queries).

**Vault Health** — Seal status, leadership, request latency, token expirations. If Vault is sealed, nothing works. This dashboard catches it immediately.

**Eldertree Ops Home** — The hub. Links to all other dashboards, plus high-signal stats: Blackbox probe success rate, Traefik request rate, SwimTO user count. The dashboard I keep open in a browser tab.

The key is: **each dashboard answers a specific question**. "Is the cluster healthy?" "Is the hardware okay?" "Are services responding?" Don't build dashboards for the sake of dashboards. Build them to answer questions.

## The Missing Piece: Synthetic Monitoring

Prometheus is excellent at telling you whether **pods, nodes, and Services** are healthy. Traefik can tell you request rates and status codes at the edge. Application metrics tell you what the app is doing.

But none of that answers: **"Is the public URL actually working?"**

A Deployment can be green, the Service can exist, Traefik can be routing traffic, but if DNS is misconfigured or a cert is wrong or a Cloudflare rule is blocking traffic, users can't reach the app. You need a probe that walks the same path a browser does.

That's where Blackbox exporter comes in.

Blackbox does synthetic monitoring: it makes HTTP(S) requests to URLs on a schedule and produces pass/fail metrics. If `probe_success` is 0, something is wrong with reachability or HTTP semantics—not necessarily with the pod itself, but with the entire stack (DNS, TLS, ingress, tunnels, etc.).

I deployed Blackbox in the `observability` namespace with two sets of checks:

**Public URLs** (swimto.eldertree.xyz, pitanga.cloud) — Uses the normal `http_2xx` module. If the probe fails, the public URL is broken.

**Internal URLs** (grafana.eldertree.local, prometheus.eldertree.local) — Uses a relaxed TLS profile (self-signed CA). If the probe fails, internal services aren't responding.

Prometheus scrapes Blackbox in "prober" mode: the metrics live on the Blackbox job, but the target is the actual URL. Alertmanager has a rule: `BlackboxProbeFailing` fires when `probe_success` is 0 for more than 2 minutes.

That's how I caught the SwimTO outage at 2 AM. The synthetic check failed. Alert fired. I fixed it before most users woke up.

## The Observability Sprint (April 2026)

By April 2026, monitoring was good but not great. Prometheus worked. Grafana had dashboards. But there were gaps:

- Traefik metrics weren't being scraped properly (service annotations missed)
- Grafana's sidecar was importing dashboards from every namespace (chaos)
- No log aggregation (had to kubectl logs every time)
- No synthetic checks (couldn't tell if public URLs actually worked)
- Dashboard inventory was a mess (which dashboards were canonical?)

So I spent a weekend closing the gaps. The result:

**Blackbox synthetic monitoring** — Deployed, configured, alerts wired up. Now I know if public URLs break.

**Traefik scrape config fixed** — Added static `additionalScrapeConfigs` for Traefik's native Prometheus endpoint. Ingress metrics now flow correctly.

**Grafana sidecar scoped** — Changed `searchNamespace` from `ALL` to `observability` only. No more random vendor dashboards polluting the dashboard list.

**Loki and Promtail deployed** — Logs now flow to Loki. Grafana can query logs alongside metrics. One place for observability.

**Dashboard audit** — Wrote `DASHBOARDS.md` as a real inventory. Fixed broken PromQL queries. Documented which labels to use (Traefik v3 label names matter).

**Eldertree Ops Home** — Built a lightweight hub dashboard with links and high-signal stats. The landing page for troubleshooting.

After that sprint, the observability story was complete. Metrics, logs, alerts, synthetic checks, dashboards. If something breaks, I'll know. If it's already broken, I'll see why.

## The Lessons

Here's what six months of monitoring taught me:

**Monitoring is essential from day one.** Don't wait until production. Deploy Prometheus and Grafana with the first app. You'll catch issues early.

**Raspberry Pi-specific metrics matter.** CPU temperature and throttling status are critical on Pis. If a node hits 85°C, it throttles. Performance tanks. Monitor it.

**Persistent storage for Prometheus is critical.** Seven-day retention fits in 8GB. That's enough to see trends and debug issues from "yesterday." Ephemeral metrics are useless.

**Grafana dashboards save significant time.** The first time something breaks, you spend 20 minutes building a dashboard. Every time after, you open the dashboard. It pays for itself.

**Blackbox answers "is the URL alive?"** — not "is my code correct?" It's complementary. You want both Blackbox and application metrics.

**Loki complements Prometheus.** Metrics tell you *what* happened. Logs tell you *why*. You need both.

**Alerting is about signal, not noise.** Too many alerts and you ignore them. Too few and you miss critical issues. Tune thresholds. Test alerts. Make sure they fire for real problems.

**Grafana's sidecar is powerful and dangerous.** Always scope `searchNamespace` to the namespace you own. Otherwise, vendor charts can pollute your dashboard list.

**Document your dashboards.** When you have 10+ dashboards, you'll forget which one does what. Write an inventory. Link to it from the main dashboard.

**Monitor the monitors.** Prometheus scrapes itself. Grafana has uptime checks. If monitoring fails, you need to know.

## The Feeling

There's a specific feeling that comes from good observability. It's confidence.

When something breaks (and things always break), you don't panic. You don't guess. You don't waste time searching logs or running kubectl commands blindly. You open Grafana, look at the dashboard, see the spike or drop, drill down, and fix it.

That's the difference between "I hope this works" and "I know this works." Monitoring gives you visibility. Visibility gives you control. Control gives you confidence.

And when the alert fires at 2 AM and you fix the issue before most users even notice? That's when you realize: the infrastructure works. The automation works. The observability works.

You built a system that watches itself, alerts when something's wrong, and gives you the tools to fix it.

That's production-ready.

---

*Next: [Chapter 8: The Great Deployment Disaster](/chapters/08-deployment-disaster) - When everything decided to break simultaneously, and the lessons from debugging it all.*
