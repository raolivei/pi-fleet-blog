# Chapter 11: The Control Center

By April 2026, I had a lot of browser tabs open.

Grafana for dashboards. Prometheus for raw metrics. Alertmanager for alert rules. The pi-fleet repo for checking FluxCD status. The Eldertree docs for runbooks. Ollie's UI for asking questions. GitHub Actions for CI/CD status. GHCR for checking image tags.

Every time something needed attention, I'd open five tabs, correlate information between them, figure out what was wrong, and fix it. It worked. But it wasn't elegant.

What I wanted was simple: **one place to see whether the cluster is okay** — and when it isn't, a fast path to the right tool. Not a replacement for Grafana. A dashboard light, not an instrument cluster.

That's what I built at [`control.eldertree.local`](https://control.eldertree.local).

## The feeling question

Grafana answers *"how is this metric behaving over time?"* When I'm away — on Tailscale from a café, or on my phone in the backyard — I don't have a metric question. I have a feeling question:

> Is everything okay?

I don't want to read a graph to answer that. I want a single glance that's green or it isn't. If it's green, I close the tab. If something's amber or red, *then* I open Grafana.

The Control Center has exactly one job: **render the whole cluster as a living map and color it by health.**

## What shipped in v1 (and what didn't)

The first version is intentionally smaller than the full vision. That's not a failure — it's scope discipline.

**Shipped today:**

- **Live cluster topology** — OSI-layer map of ~25 catalogued components, polled every 30 seconds
- **Incident feed** — down/degraded nodes and workloads derived from the same health poll (not Alertmanager)
- **Grafana / Prometheus / docs links** — curated dashboard shortcuts, not embedded iframes
- **Runbook panel** — quick links into eldertree-docs
- **Clickable components** — click a node to bring it into evidence and read what it does in the cluster

**On the roadmap (not in v1):**

- Live Alertmanager alert feed in the UI
- Flux deployment history panel
- Embedded Ollie chat
- Proxied Prometheus queries
- In-page actions (scale, silence, reconcile)

I wrote the vision with all of those in mind. Shipping a reliable glance page first was the right cut.

## How it actually works

The Control Center is a React SPA served by **Elder** — the cluster agent in the `openclaw` namespace (same HelmRelease as OpenClaw). Every 30 seconds the browser polls:

```
GET /api/public/cluster/health
```

Elder answers by talking **directly to the Kubernetes API server** — not to Prometheus, not to Alertmanager, not to Ollie. It reads:

- **Node `Ready` conditions** — are Pi01, Pi02, Pi03 alive?
- **Workload readiness** — `ready/total` replicas for each catalogued Deployment, StatefulSet, or DaemonSet
- **Flux reconciliation** — how many Kustomizations are `Ready`

Three reads from the source of truth, mapped to green / amber / red, drawn as a topology. No API key on the public health route — it's LAN/Tailscale only.

<figure>
  <img src="/control-center-topology-grid.png" alt="Eldertree Control Center — the Live cluster topology in the 3-grid layout, every component green" />
  <figcaption>The Live cluster topology (3-grid layout) on a quiet summer day — every layer green from the Pis at the bottom to the apps on top.</figcaption>
</figure>

### The map is the OSI model

The topology isn't arranged by namespace — it's arranged by **layer**, bottom to top:

- **L1 Physical** — the three Pis
- **L2/L3 Network** — kube-vip, CoreDNS, BIND9, external-dns, Cloudflare Tunnel
- **L4 Transport** — Traefik
- **L5/L6 Security** — cert-manager, Vault, External Secrets
- **L7 Application** — Flux, observability stack, and every product (Canopy, SwimTO, Ollie, the websites…)

Lines connect each component to what it depends on. A line inherits the worst health of its endpoints — so a single red node downstream lights up the whole path it affects. You don't just see *what's* red; you see *what it's going to take down with it.*

### Click a node, get the story

Click any component and it comes **into evidence** — it brightens and scales up while everything else dims. A card slides in with what the component is, what it does in the cluster, live status and replica count, namespace, workload name, and a runbook link. The map becomes something you can learn the cluster from, not just stare at. (Keyboard accessible: Tab, Enter/Space; click the background to dismiss.)

## Where everyone else fits

The Control Center is one instrument in a larger observability band. Each tool has exactly one role:

| Tool | Role | The one-liner |
|------|------|---------------|
| **Prometheus** | Metrics + alert rules | The cluster's **memory** — what happened, and when |
| **Alertmanager** | Alert routing | The **messenger** — turns firing rules into notifications |
| **Grafana** | Dashboards | The **microscope** — deep-dive any metric or log |
| **Loki** | Log aggregation | The **diary** — every pod's logs, searchable |
| **Elder API + Control Center** | Live health glance | The **dashboard light** — "is it fine?" right now |
| **Ollie** | RAG assistant | The **librarian** — ask the runbooks in plain English |

Ollie isn't in the health path. It answers *"how do I deploy Canopy?"* by searching project docs — it's not what tells me a pod is down. And Prometheus, for all its power, isn't what the Control Center reads.

## The design decision I kept second-guessing

My instinct was to build the health page *on top of Prometheus*. It already scrapes everything. Why not query it?

Two reasons, and both are good SRE hygiene:

**1. The API server is the source of truth for readiness.** "Is this Deployment ready?" is a control-plane fact. Prometheus learns it via `kube-state-metrics`, which reads the same API server — with scrape-interval staleness and an extra hop. For a glance page, reading the API directly is simpler and more correct.

**2. A status page must not depend on the stack it's watching.** If I'd built this on Prometheus and Grafana, then the day Prometheus fell over — exactly when I'd most want to know — my status page would go dark too. Instead, Elder reads the API server directly and renders Prometheus, Grafana, and Loki as *components on the map.* When observability is what's broken, the dashboard light still works and points right at it.

The Control Center does less on purpose. It's not a metrics system; it's the green light, wired to the most reliable signal available.

## Grafana, runbooks, and incidents

The Control Center doesn't replace Grafana — it **links** to it. A panel of curated dashboard shortcuts (cluster health, Traefik, Vault, Flux, per-app boards) opens Grafana at the right place. Same for Prometheus and the docs site.

The **incident feed** beside the topology shows what's down or degraded *right now*, with links to runbooks. It's derived from the health API — workload and node readiness — not from Alertmanager. That's enough for "what's broken?" at a glance; Alertmanager is still where firing rules live.

During the node-1 watchdog incidents (see Chapter 12), this view would have shown the node red and downstream paths lit up — without kubectl across five namespaces.

## The honest gap: pull vs push

Right now the Control Center is **pull-only**: it tells me everything's fine *when I open it.* Prometheus already evaluates a solid set of alert rules — node down, OOM kills, watchdog status, crash loops, disks filling up, SwimTO synthetic checks — but those alerts don't yet *push* to my phone.

A status page you have to remember to check isn't fully "knowing from afar"; it's "checking from afar." The next step is wiring Alertmanager to a real notification channel so red finds me instead of waiting for me to look. The messenger is hired; he just doesn't have my number yet.

## What's next

Version 1 is the glance page. The roadmap:

- **Push alerting** — Alertmanager → phone (Telegram, ntfy, or similar)
- **Optional Alertmanager feed** in the UI — best-effort, never blocking the health page
- **Flux deployment history** — recent reconciliations in the incident area
- **Ollie integration** — ask runbooks without leaving the page
- **In-page actions** — reconcile, scale, silence (with guardrails)

Even at v1, the Control Center changed how I operate the cluster. It's the first URL I open when I sit down. When everything's green — like on a quiet summer day — I glance, smile, and close the laptop.

---

*Next: [Chapter 12: The Tuesday Night Apocalypse](/chapters/12-tuesday-night-apocalypse) — when everything hung, and the watchdog saved the day.*
