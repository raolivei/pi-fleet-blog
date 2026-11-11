# Chapter 11: The Control Center

I didn't need another place to draw graphs. Grafana already did that. I wanted somewhere to start when I needed to check the cluster and didn't yet know which graph to open.

By then, the answers were spread around. Prometheus had metrics and alert rules. Grafana had dashboards. Loki had logs. Flux had reconciliation status. The runbook had the fixes I'd already worked out. Ollie could help me find the documentation, but that didn't tell me whether a workload was ready right now.

The Control Center was my attempt to give those tools a front door. The first React SPA landed in the Elder repository on June 1, 2026. Its job was deliberately small: show the cluster's reported state, let me inspect a component, and point me toward the next useful check.

## Start with the question I can actually answer

“Is everything okay?” is a bigger question than it looks.

Kubernetes can tell me whether a node is Ready and how many replicas of a Deployment are ready. It can't tell me that a user can sign in, reach the right page, or complete whatever they came to the application to do. Those need their own checks.

I built the first view around the Kubernetes facts because they gave me a useful starting point. A missing replica or a node that stopped reporting is worth seeing without opening a terminal. Green means those reported checks are passing. It doesn't mean I've tested the whole service from the user's side.

That distinction is easy to lose when a dashboard looks reassuring. I need it written into how I use the page, not buried in a footnote after something goes wrong.

## What the browser asks for

The frontend is React, served by Elder, which runs alongside OpenClaw's infrastructure in the `openclaw` namespace. The browser polls this route every 30 seconds:

```text
GET /api/public/cluster/health
```

Elder collects the result from the Kubernetes API. It reads node conditions, readiness for the catalogued Deployments, StatefulSets and DaemonSets, and Flux reconciliation status. The frontend turns those results into the topology and incident list.

Prometheus isn't in that request path. Neither is Ollie.

I liked that separation. I didn't need to query a metrics system just to find the readiness value Kubernetes already held. It also meant a Prometheus problem didn't have to prevent me from checking the Prometheus workload on this page.

There are still dependencies. Elder has to run, the API server has to answer, and my browser has to reach the service. The page isn't an independent external monitor just because it doesn't query Grafana. If the request fails, unavailable or stale information needs to look unavailable or stale.

The public entry point is now [Control Center](https://control.eldertree.xyz/). The earlier LAN access described how I reached it during the build; it isn't the only access path anymore.

## Making the map useful

The map groups components into physical, network, ingress, security, and application areas, using OSI-inspired layer labels. That is a way to organise the picture, not a literal account of every protocol involved. Traefik, for example, handles application-level HTTP routing even though the diagram puts it in the ingress band.

The useful part is seeing the names together: the Pis, DNS, ingress, certificate management, Vault, Flux, observability, and the applications. They stop being a list of namespaces I have to reconstruct in my head.

<figure>
  <img src="/control-center-topology-grid.png" alt="Control Center topology in the three-column grid layout" />
  <figcaption>One of the topology layouts. This screenshot shows the interface, not the cluster's current health.</figcaption>
</figure>

The lines need a little care too. Each line takes the worse status of its two endpoints. If one end is down, the line can show that. The code doesn't walk the graph and simulate every downstream failure.

So I can use the connections to decide where to investigate next. I can't use them as proof that one red component caused every other problem, or that the map predicts which service will fail next. Dependency relationships and demonstrated causes are different things.

Clicking a component opens its details: what it does, its namespace and workload, reported readiness, and a runbook link. The rest of the map dims so I can concentrate on that component. Keyboard access matters here too; a useful operations page shouldn't require carefully aiming at a small icon.

That detail card does more for me than adding another summary number. It puts the explanation beside the thing I'm checking.

## Where the other tools still fit

If the Control Center tells me a workload has no ready replicas, I still need to find out why.

Prometheus gives me measurements over time and evaluates alert rules. Alertmanager handles grouping and routing firing alerts. Grafana lets me inspect those metrics and query logs. Loki holds the logs that its collectors actually delivered. Ollie helps retrieve the documentation and previous decisions.

None of those roles disappears because I made a map. A readiness response won't explain every crash, a log collector can miss data, and a retrieved runbook can be old. I still have to follow the evidence far enough to answer the question I started with.

The incident feed in this version is also narrower than its name might suggest. It is built from the health response and recorded incident entries. It isn't a live stream of Alertmanager notifications. Keeping those sources distinct makes it easier to understand what the page has actually observed.

## Getting to the tools

The first interface included shortcuts to monitoring addresses that only worked on my network. Those were convenient for me and poor navigation for a public page.

[Grafana now has a public entry point](https://grafana.eldertree.xyz/), which opens its sign-in page. That gives the Control Center a real destination for metrics and collected logs without publishing a LAN-only address or implying that dashboards are open to everyone.

The [runbook](https://docs.eldertree.xyz/) is the other useful destination. A link should land on the procedure it names. If I haven't written that procedure yet, I'd rather send someone to the runbook overview than to a plausible-looking path that returns 404.

These are small details until I need them. A status card with a broken next step leaves me doing the same search the page was meant to save.

## Checking isn't the same as being notified

The first version was a page I opened. It wasn't a demonstrated phone-notification system.

That left a practical gap: I could check the cluster from elsewhere, but I still had to remember to check it. Alert rules and a notification receiver are separate pieces. A rule existing in Git isn't proof that a message reached my phone.

Push notifications, a richer incident feed, deployment history, and actions such as reconciliation can all come later. Each needs its own working path and verification. I don't want to turn a page for reading health into an operations console just by adding buttons faster than I can test their consequences.

For now, I have somewhere to begin. I can inspect what Kubernetes reports, see which component deserves attention, and get to its documentation. That's enough to be useful, provided I remember what the green boxes do and don't establish.

---

*Next: [Chapter 12: The Tuesday Night Apocalypse](/chapters/12-tuesday-night-apocalypse) — two node hangs, a watchdog investigation, and what the surviving evidence could tell me.*
