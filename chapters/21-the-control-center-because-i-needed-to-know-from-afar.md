# Chapter 21: The Control Center — Because I Needed to Know From Afar

> **Date:** June 2026  
> **Motivation:** “Is the cluster fine?” at 11pm from a hotel Wi‑Fi  
> **Grafana tabs open:** Too many  
> **Topology color when everything works:** Delicious green

## The problem nobody puts on a roadmap

Homelab operators have two moods:

1. **Builder mode** — “I will add one more Helm chart and then sleep.”
2. **Anxiety mode** — “Why is my phone buzzing. Is node-2 on fire. Is Vault sealed. Is Flux having an existential crisis.”

I live in both. Often in the same hour.

When I am **away** — coffee shop, family visit, airport gate with Wi‑Fi that charges by the packet — I do not want a full observability deep dive. I do not want seventeen Grafana dashboards and a PromQL PhD. I want one honest answer:

**“Can I go back to my life, or do I need to find a keyboard?”**

Grafana is excellent. Prometheus is excellent. They are also **a lot** when all you need is a vibe check with teeth.

## What I had before (and why it was almost enough)

The blog home already had **Cluster at a glance**: three Pis, STABLE/UNSTABLE badges, links to Grafana and the runbook. Elder exposed a tiny public API — `GET /api/public/cluster/nodes` — so the widget could ask Kubernetes “are the nodes Ready?” without handing the internet an API key.

That helped. It did not tell me if **Traefik, Vault, Loki, or SwimTO** were actually happy. Nodes can be green while your ingress is having a philosophical disagreement with TLS.

So I did what any reasonable person does: I built a **whole ops console**. Obviously.

## Enter the Eldertree Control Center

**URL:** [https://control.eldertree.local](https://control.eldertree.local)  
(LAN or Tailscale — not on the public internet. This is a feature, not a bug. I like my cluster gossip private.)

One page. One topology. One poll every **30 seconds** against real Kubernetes state.

### What you see

- **OSI-layered topology** — Physical Pis at the top, network/DNS in the middle, security (Vault, cert-manager), apps at the bottom. Dependencies drawn as links. When a link goes amber, something upstream is side‑eyeing you.
- **Live health colors** — Green = healthy. Amber = degraded. Red = down. Grey = “I have no idea, which is also information.” Red nodes pulse, because drama.
- **Down/degraded callout** — A polite list of what is misbehaving, so you do not have to play “Where’s Waldo” in SVG form.
- **Grafana shortcuts** — Deep dives when you *do* want graphs. The Control Center is the **trailer**; Grafana is the **director’s cut**.
- **Runbook index** — Links into [eldertree-docs](https://docs.eldertree.xyz/runbook/) for when the trailer ends on a cliffhanger.

No fake incident feed. No mock sparklines pretending the cluster had feelings. If it is on screen, Elder asked the API and got an answer.

## “Just add a button on the blog” (narrator: he did not just add a button)

The first prototype lived inside **pi-fleet-blog** — a React SPA under `/control-center/`, pretty animations, the works. It looked cool on `blog.eldertree.xyz`.

Then reality arrived with coffee:

- Static GitHub Pages **cannot** call `elder.eldertree.local` from the public internet (shocking, I know).
- Embedding live cluster health in the **blog build** was the wrong layer — the blog is a diary, not a NOC wall.
- Elder already had RBAC, K8s clients, and a FastAPI app IN the cluster. Why am I shipping ops UI in the same repo as chapter markdown about Pi PoE switches?

So we **decoupled**:

| Before | After |
|--------|--------|
| Blog builds Control Center static assets | **Elder** serves the SPA from its container |
| Fake / partial data | **`GET /api/public/cluster/health`** — nodes, workloads, Flux counts |
| `blog.eldertree.xyz/control-center/` | **`control.eldertree.local`** via Traefik ingress |

The blog home button now says **“Live Control Center”** and sends you to Elder. The blog stays narrative. The cluster gets a proper console.

## Enhancing Elder (a.k.a. “a few small API endpoints” that ate my weekend)

Elder was already the agent sidecar: code search, GitHub, kubectl-ish powers, LLM orchestration. The Control Center needed **read-only, public, browser-safe** cluster facts:

```bash
curl -sS https://control.eldertree.local/api/public/cluster/health | jq .
```

That returns nodes, a catalog of platform + app components (Traefik, Vault, Prometheus, Canopy, SwimTO, …), replica readiness, and Flux Kustomization counts. Frontend polls every 30s. Topology colors follow the worst status along each dependency edge — if Vault sneezes, downstream links feel it.

Implementation lives in the [elder](https://github.com/raolivei/elder) repo:

- `list_component_health()` in the K8s service
- `GET /api/public/cluster/health` route
- React SPA in `elder/frontend/` (Vite, framer-motion, Lucide icons)
- Multi-stage Docker image: build SPA → copy into FastAPI → serve at `/`

CORS allows `control.eldertree.local` (and the blog/docs origins for the smaller widgets). Still no API key on these routes — LAN/Tailscale trust model, same as the node glance endpoint.

Docs: [`elder/docs/PUBLIC_CLUSTER_API.md`](https://github.com/raolivei/elder/blob/main/docs/PUBLIC_CLUSTER_API.md)  
Ops reference: [`pi-fleet/docs/CONTROL_CENTER.md`](https://github.com/raolivei/pi-fleet/blob/main/docs/CONTROL_CENTER.md)

## The emotional support topology

The best moment is opening the page on Tailscale and seeing **all green**. Three Pis. VIP. Traefik. Vault. Flux. Apps. Links gently pulsing like a healthy heartbeat.

The second-best moment is seeing **one amber box** with a clear label — “Loki: degraded” — and a runbook link, instead of a vague sense of doom.

The worst moment is red. But at least red is **actionable**. It is not “something somewhere is wrong maybe.” It is “this Deployment name, this namespace, go.”

I have not achieved enlightenment. I have achieved **a single URL that tells the truth**.

## War story footnote: the image that did not exist

No post is complete without YAML karma. Flux bumped Elder to `v0.3.0` before CI finished its ruff lecture on import order. The pod entered **ImagePullBackOff**, which is Kubernetes for “your hubris is not on GHCR yet.”

Fix: lint, build, push, reconcile. The topology does not care about your feelings; it cares about `readyReplicas`.

## Takeaways

1. **Match the UI to the question** — “Is everything fine?” ≠ “Show me cardinality for the last 90 days.”
2. **Serve live ops UI from inside the cluster** — Elder was already there; the blog was not.
3. **Public read-only APIs are fine on LAN** — still lock down write paths and secrets.
4. **Green topology = peace** — worth the OSI diagram and one slightly passive-aggressive callout box.

If you run Eldertree (or something like it): steal the pattern. One glance endpoint, one SPA, one hostname on Tailscale. Your future self at an airport gate will thank you.

**Open it:** [https://control.eldertree.local](https://control.eldertree.local) (when Elder is up and your `/etc/hosts` or Pi-hole agrees with your life choices.)

Related: [Chapter 9 — Monitoring and Observability](/chapters/09-monitoring-observability) · [Chapter 20 — Synthetic monitoring sprint](/chapters/20-synthetic-monitoring-observability-sprint) · [Chapter 19 — AI Infrastructure (Elder)](/chapters/19-ai-infrastructure)
