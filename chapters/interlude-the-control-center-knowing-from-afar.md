# Interlude: The Control Center — Knowing From Afar

It's a good day. Summer in Toronto, the windows are open, and three Raspberry Pis on a shelf are quietly running everything I've built. No alerts. No red. Every node Ready, every workload at full replicas, Flux reconciled and smug about it. The whole cluster is *green*.

Which is exactly the problem I built the Control Center to solve — because "everything is fine" is only useful information if I can see it when I'm **not** standing next to the shelf.

This interlude is about that one page: [`control.eldertree.local`](https://control.eldertree.local). What it is, how it actually works, and — the part I had to argue myself out of over-engineering — why it deliberately does *less* than you'd think.

## The question a homelab never stops asking

Grafana is wonderful. It has dashboards for everything: CPU, memory, pod restarts, disk pressure, network throughput, temperatures on each Pi. But Grafana answers *"how is this metric behaving over time?"* When I'm away — on Tailscale from a café, or just on my phone in the backyard — I don't have a metric question. I have a feeling question:

> Is everything okay?

I don't want to read a graph to answer that. I want a single glance that's green or it isn't. A dashboard light, not an instrument cluster.

So the Control Center has exactly one job: **render the whole cluster as a living map and color it by health.** If it's green, I close the tab and enjoy the summer. If something's amber or red, *then* I open Grafana.

## How it actually works

Here's the part people assume wrong, so let me be precise. The Control Center is a small React app served by **Elder** (the cluster's agent, living in the `openclaw` namespace). Every 30 seconds the browser polls one endpoint:

```
GET /api/public/cluster/health
```

And Elder answers that by talking **directly to the Kubernetes API server** — not to Prometheus, not to Alertmanager, not to Ollie. It reads:

- **Node `Ready` conditions** — are Pi01, Pi02, Pi03 alive?
- **Workload readiness** — for ~25 catalogued components, the `ready/total` replicas of each Deployment, StatefulSet, or DaemonSet.
- **Flux reconciliation** — how many Kustomizations are `Ready`.

That's it. Three reads from the source of truth, mapped to green / amber / red, drawn as a topology.

<figure>
  <img src="/control-center-topology-grid.png" alt="Eldertree Control Center — the Live cluster topology in the 3-grid layout, every component green" />
  <figcaption>The Live cluster topology (3-grid layout) on a quiet day — every layer green from the Pis at the bottom to the apps on top.</figcaption>
</figure>

### The map is the OSI model

The topology isn't arranged by namespace — it's arranged by **layer**, bottom to top, like the OSI stack:

- **L1 Physical** — the three Pis.
- **L2/L3 Network** — kube-vip, CoreDNS, BIND9, external-dns, Cloudflare Tunnel.
- **L4 Transport** — Traefik.
- **L5/L6 Security** — cert-manager, Vault, External Secrets.
- **L7 Application** — Flux, the observability stack, and every product (Canopy, SwimTO, Ollie, the websites…).

Lines connect each component to what it depends on, and the lines inherit the worst health of their endpoints — so a single red node downstream lights up the whole path it affects. When something breaks, you don't just see *what's* red, you see *what it's going to take down with it.*

### Click a node, get the story

The newest addition: click any component and it comes **into evidence** — it brightens and scales up while everything else dims — and a card slides in explaining what that component actually *is* and what it does in the cluster, along with its live status, replica count, namespace, workload name, and a link straight to its runbook. It turns the map from a pretty status board into something you can actually *learn the cluster from*. (Tab + Enter works too; click the background to dismiss.)

## Where everyone else fits

The Control Center is one instrument in a larger observability band. The trick is that each tool has exactly one role, and they don't step on each other:

| Tool | Role | The one-liner |
|------|------|---------------|
| **Prometheus** | Metrics + alert rules | The cluster's **memory** — what happened, and when |
| **Alertmanager** | Alert routing | The **messenger** — turns firing rules into notifications |
| **Grafana** | Dashboards | The **microscope** — deep-dive any metric or log |
| **Loki** | Log aggregation | The **diary** — every pod's logs, searchable |
| **Elder API + Control Center** | Live health glance | The **dashboard light** — "is it fine?" right now |
| **Ollie** | RAG assistant | The **librarian** — ask the runbooks in plain English |

Notice Ollie isn't in the health path at all. Ollie answers *"how do I deploy Canopy?"* by searching my docs; it's not what tells me a pod is down. And Prometheus, for all its power, isn't what the Control Center reads. Which brings me to the decision I kept second-guessing.

## The over-engineering I talked myself out of

My instinct was to build the Control Center *on top of Prometheus*. It's right there. It already scrapes everything. Why not query it for the health page?

Two reasons stopped me, and they're both good SRE hygiene:

**1. The API server is the actual source of truth.** "Is this Deployment ready?" is a control-plane fact. Prometheus would learn it by scraping `kube-state-metrics`, which reads it from… the same API server. Going through Prometheus would add a scrape interval of staleness and an extra hop to get *less* authoritative data. For a glance page, reading the API directly is both simpler and more correct.

**2. A status page must not depend on the thing it's watching.** This is the one that mattered. If I'd built the Control Center on Prometheus and Grafana, then the day Prometheus itself fell over — exactly the day I'd most want to know — my status page would go dark right along with it. Instead, the Control Center reads the API server directly and renders Prometheus, Grafana, and Loki as *components on the map.* When the observability stack is the thing that's broken, the dashboard light still works and points right at it. Watching the watchers shouldn't share their fate.

So the Control Center does less on purpose. It's not a metrics system; it's the green light on the dashboard, wired to the most reliable signal available and isolated from everything it reports on.

## What's next

There's an honest gap in this story, and I'll close it in a future chapter. Right now the Control Center is **pull-only**: it tells me everything's fine *when I open it.* Prometheus already evaluates a solid set of alert rules — node down, OOM kills, watchdog status, crash loops, disks filling up, the SwimTO synthetic checks — but those alerts don't yet *push* to my phone. A status page you have to remember to check isn't really "knowing from afar"; it's "checking from afar."

The next step is wiring Alertmanager to an actual notification channel, so red comes and finds *me* instead of waiting for me to look. The messenger is hired; he just doesn't have my number yet.

But that's a problem for a day when the cluster isn't this green. Today, I'm going to glance at the map, see six layers of calm, and close the laptop.
