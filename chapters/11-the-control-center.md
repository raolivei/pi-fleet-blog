# Chapter 11: The Control Center

By April 2026, I had a lot of browser tabs open.

Grafana for dashboards. Prometheus for raw metrics. Alertmanager for alert rules. The pi-fleet repo for checking FluxCD status. The Eldertree docs for runbooks. Ollie's Streamlit UI for asking questions. GitHub Actions for CI/CD status. GHCR for checking image tags.

Every time something needed attention, I'd open five tabs, correlate information between them, figure out what was wrong, and fix it. It worked. But it wasn't elegant.

What I wanted was simple: **one place to see everything**. Cluster health, application status, recent deployments, active alerts, quick access to dashboards, and an AI assistant ready to answer questions. All in one interface. A control center.

Not just a dashboard. A hub. The place you go when you need to operate the cluster.

## The Vision

The Control Center is a single-page React app that lives at `https://control.eldertree.local`. It shows:

**Cluster Health** — Node status, pod count, resource usage across all nodes  
**Application Status** — Which apps are running, their replica counts, recent restarts  
**Active Alerts** — What's currently firing in Alertmanager  
**Recent Deployments** — Latest FluxCD reconciliations and image updates  
**Quick Links** — Direct access to Grafana dashboards, Prometheus queries, runbooks  
**Ollie Chat** — Embedded AI assistant for asking questions without leaving the page  
**Cluster Topology** — Visual map of nodes, pods, and network connections  

The goal: open one URL, see the state of the cluster, drill down into specifics, ask questions, take action. No tab-switching. No hunting for information.

It's the cockpit for Eldertree.

## The Elder Integration

The Control Center is built on top of **Elder**, the cluster agent that lives in the `elder` namespace. Elder is OpenClaw's more serious sibling—it handles cluster operations, Git workflows, live topology updates, and API access for the Control Center.

Elder exposes an API (`http://elder.elder.svc.cluster.local:8006`) that the Control Center queries for:
- Kubernetes resource status (nodes, pods, deployments)
- FluxCD reconciliation history
- Alertmanager alerts
- Git commit history from pi-fleet
- Prometheus metrics (proxied queries)

The Control Center is the frontend. Elder is the backend. Together, they form the operational hub.

## The Topology View

One of the coolest features of the Control Center is the live cluster topology. It's a visual graph showing:

- **Nodes** (three Raspberry Pis: node-1, node-2, node-3)
- **Pods** (grouped by namespace and deployment)
- **Network connections** (which pods talk to which services)
- **Health status** (green = healthy, yellow = warning, red = failing)

The graph updates in real-time. When a pod restarts, it flashes. When a node goes down, it turns red. When FluxCD deploys a new version, the affected pods highlight.

It's not just pretty—it's useful. You can see at a glance:
- Which pods are running on which nodes
- How workloads are distributed
- What's connected to what
- Where failures are happening

During the node-1 watchdog incident (see Chapter 12), the topology view showed exactly which pods were affected when node-1 hung. I didn't have to kubectl everything—I just looked at the graph. Red node, yellow pods, network partitioned. Clear picture.

## The Grafana Integration

The Control Center doesn't replace Grafana. It links to it. Embedded iframes for critical dashboards, direct links for deep dives.

The "Eldertree Ops Home" dashboard in Grafana acts as a hub: it has panels for high-signal stats (Traefik request rate, Blackbox probe success, Vault seal status) and links to all other dashboards.

The Control Center takes this further: instead of navigating Grafana's folder structure, you get a curated set of links:
- Pi Fleet Overview
- Hardware Health
- Traefik Metrics
- Vault Status
- Application Dashboards (SwimTO, OpenClaw, etc.)

Click a link, Grafana opens in the correct dashboard. No hunting. No folder navigation. Direct access.

## The Ollie Chat Embed

Instead of opening a separate Streamlit tab for Ollie, the Control Center embeds a chat interface in the bottom-right corner. Click the icon, ask a question, get an answer—all without leaving the page.

Example flow:
1. See an alert: "Vault seal status failing"
2. Click Ollie chat icon
3. Ask: "How do I unseal Vault?"
4. Ollie replies with the unseal script path and command
5. Run the command
6. Alert clears
7. Close chat

The chat queries Ollie's API in the cluster. Same RAG system, same LLM providers, same workspace knowledge. Just integrated into the Control Center instead of a separate UI.

## The Alert Integration

Alertmanager fires alerts when things go wrong. The Control Center shows active alerts prominently:

**Critical Alerts** (red badge) — Vault sealed, node down, pod CrashLoopBackOff  
**Warning Alerts** (yellow badge) — High memory usage, elevated latency, cert expiring soon  

Each alert has:
- **Name** (e.g., "BlackboxProbeFailing")
- **Severity** (critical, warning, info)
- **Target** (which service/pod/node)
- **Duration** (how long it's been firing)
- **Runbook link** (direct link to troubleshooting steps)

Click an alert, see details. Click the runbook link, see the fix. No guessing. No searching. Just: alert → runbook → fix.

## The Recent Deployments View

FluxCD deploys changes automatically every 5 minutes. The Control Center shows the last 10 reconciliations:

- **Time** — When the deployment happened
- **Resource** — Which HelmRelease or Kustomization
- **Status** — Success, failed, or in progress
- **Changes** — What changed (new image tag, config update, etc.)

If a deployment fails, the status shows red. Click it, see the FluxCD error message. If it succeeded, the status shows green. Click it, see what got deployed.

This is gold during troubleshooting. "When did SwimTO last deploy?" Check the Control Center. "Did the Vault update succeed?" Check the Control Center. No kubectl. No log digging. Just: look at the list.

## The Design

The Control Center is intentionally minimal. No animations. No flashy transitions. Just information, clearly presented, quickly accessible.

Dark theme (easier on the eyes during late-night debugging). Clean layout. Fast load times. Responsive (works on mobile, though you probably won't operate a cluster from your phone).

The goal is not to look cool. The goal is to be **useful**. Every element on the page answers a question or provides an action. No fluff.

## The Philosophy

The Control Center embodies a specific philosophy about operational tooling:

**Centralize access, not functionality.** The Control Center doesn't replace Grafana, Prometheus, or Alertmanager. It links to them. It aggregates their information. But the deep functionality stays in the specialized tools.

**Show the right level of detail.** Too much detail is overwhelming. Too little is useless. The Control Center shows high-level status with drill-down options.

**Make common actions fast.** Checking cluster health? One glance. Opening a dashboard? One click. Asking Ollie a question? One chat message.

**Integrate AI naturally.** Ollie isn't a separate chatbot. It's embedded in the workflow. Alert fires → ask Ollie → get answer → take action. No context-switching.

**Prioritize signal over noise.** Not every metric needs to be on the front page. Show what matters: active alerts, failing pods, recent deployments. The rest is a click away.

## The Workflow

Here's a typical troubleshooting session with the Control Center:

1. **Alert notification** (phone buzzes)
2. **Open Control Center** (`https://control.eldertree.local`)
3. **See active alert** ("Vault seal status failing")
4. **Click runbook link** (opens Eldertree docs)
5. **Run unseal script** (from runbook)
6. **Watch topology view** (Vault pods turn green)
7. **Alert clears** (badge disappears)
8. **Close tab** (done)

Total time: ~2 minutes. No searching. No guessing. Just: see problem, read fix, apply fix, confirm resolution.

That's the power of centralized operations. Everything you need is in one place.

## The Future Vision

The Control Center is version 1.0. Here's what's next:

**Interactive actions** — Not just "see alert," but "silence alert" or "scale deployment" directly from the UI.

**Deployment triggers** — Click a button to trigger a FluxCD reconciliation or GitHub Actions workflow.

**Log aggregation view** — Embed Loki logs alongside metrics. See logs + metrics + topology in one place.

**Custom dashboards** — Let users configure their own view. Pin favorite dashboards. Arrange widgets.

**Mobile app** — Native iOS/Android app for on-the-go cluster monitoring. Not for deploying (please don't deploy from your phone), but for monitoring and acknowledging alerts.

But even at v1.0, the Control Center is transformative. I use it every day. It's the first tab I open when I sit down to work. It's the interface to my infrastructure.

## The Realization

Building the Control Center taught me something important: **the right interface makes complex systems simple**.

Kubernetes is powerful but complex. Prometheus is comprehensive but overwhelming. Grafana is flexible but requires navigation. Alertmanager is precise but terse.

Individually, these tools are great. But without integration, they create cognitive load. You have to remember which tool does what, where to find information, how to correlate data.

The Control Center removes that load. One interface. All information. Clear hierarchy. Fast access.

It doesn't make the cluster simpler—it makes operating the cluster simpler. And that's the goal.

When you can glance at a screen and immediately know the state of your infrastructure—healthy or broken, what's failing, what to do about it—you've built the right interface.

The Control Center is that interface. And the cluster is better for it.

---

*Next: [Chapter 12: The Tuesday Night Apocalypse](/chapters/12-tuesday-night-apocalypse) - When everything hung, and the watchdog saved the day.*
