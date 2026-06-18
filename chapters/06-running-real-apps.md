# Chapter 6: Running Real Apps

There's a specific moment when a homelab stops being a hobby and becomes infrastructure. It's not when you get Kubernetes running. It's not when you deploy monitoring. It's not even when you achieve high availability.

It's when someone else uses it.

For me, that moment came with SwimTO—a web app that aggregates Toronto's community pool schedules. It's not a huge app. No machine learning. No massive data processing. Just a React frontend, a FastAPI backend, a PostgreSQL database, and Redis for caching. But it's real. It serves real users. It has real data. And that changes everything.

When you're running test apps, downtime is annoying. When you're running apps that other people depend on, downtime is unacceptable. That's when you learn what "production" actually means.

## The First Real App

SwimTO was the first application deployed to Eldertree that wasn't infrastructure. Pi-hole, Vault, Prometheus—those are utilities. They serve the cluster itself. SwimTO serves people outside the cluster. That's a different contract.

The application has four components:
- **Frontend** (React, port 3000) — The user interface
- **API** (FastAPI, port 8000) — The backend that fetches and serves pool data
- **PostgreSQL** — The database holding pool schedules
- **Redis** — Caching layer for API responses

In development, these ran on my laptop. Docker Compose, localhost, good enough. But production means Kubernetes: Deployments, Services, Ingresses, Secrets, ConfigMaps, Persistent Volumes. It means resource limits (8GB Raspberry Pis don't have infinite RAM). It means health checks, restart policies, and autoscaling.

The Helm chart for SwimTO handles all of this. Four deployments, four services, one ingress. Database credentials from Vault via External Secrets. Local access at `https://swimto.eldertree.local`. Public access at `https://swimto.eldertree.xyz` via Cloudflare Tunnel.

The first deployment worked. Then the frontend crashed. Nginx permission issues—the container runs as non-root (UID 1000), and nginx wants to write to directories it doesn't own. The fix: emptyDir volumes for nginx cache. Add volumes, mount them, restart. Fixed.

Then the API crashed. Connection timeout to PostgreSQL. The DATABASE_URL had a pod IP (ephemeral) instead of a service name (stable). Change it to `postgres-service.swimto.svc.cluster.local`. Restart. Fixed.

Then cross-node communication broke (see Chapter 9 for that saga—Tailscale was hijacking k3s routes). Fix the routes, restart. Finally, everything worked.

That's production: a series of failures you didn't predict, debugged and fixed, until the app just runs.

## When Data Matters

With test apps, you can delete the database and start over. With production apps, the data is the product.

SwimTO's database holds pool schedules. If the database pod restarts, the data needs to survive. That means persistent storage.

Kubernetes PersistentVolumeClaims (PVCs) let you request storage that outlives pods. The local-path provisioner (built into K3s) creates volumes on the node's local disk. When the pod restarts, it reattaches to the same volume. Data persists.

But here's the catch: local-path volumes are node-local. If the pod is pinned to node-1 and node-1 fails, the pod can't move to another node (the volume is stuck on node-1). That's not high availability. That's a single point of failure.

For a while, I ran Longhorn—a distributed block storage system that replicates volumes across nodes. If node-1 fails, the volume is still available on node-2 and node-3. True high availability.

But Longhorn on Raspberry Pis is resource-heavy. The manager, driver, and replica pods consumed significant RAM and CPU. For a 3-node homelab, the overhead didn't justify the benefit. And Vault (the most critical stateful app) already has high availability via Raft replication—it doesn't need distributed storage underneath.

So I removed Longhorn. Back to local-path. Simpler, lighter, and good enough with proper backup strategies. SwimTO's database gets regular backups via pg_dump. If the node fails, I restore from backup. That's acceptable for a homelab.

The lesson: not all data needs distributed storage. Know your recovery time objective (RTO) and design accordingly. For Eldertree, "restore from backup in 10 minutes" is fine. For a bank, it wouldn't be.

## Autoscaling: Don't Waste What You Don't Have

Raspberry Pis have limited resources. Each node has 8GB RAM and 4 CPU cores. That's enough for a small cluster, but not enough to waste.

Kubernetes lets you set resource requests (minimum guaranteed) and limits (maximum allowed) for every container. If you don't set them, a single misbehaving pod can consume all node resources and starve other workloads. If you set them too high, you prevent other pods from scheduling even when resources are available.

SwimTO's resource configuration:
```yaml
resources:
  requests:
    memory: 256Mi
    cpu: 100m
  limits:
    memory: 512Mi
    cpu: 500m
```

This means: reserve 256MB RAM and 0.1 CPU for the pod, but let it burst up to 512MB and 0.5 CPU if available. It's a balance: enough to run, not so much that other apps can't schedule.

But static limits don't handle traffic spikes. If SwimTO suddenly gets 10x traffic (unlikely, but possible), the pods will hit CPU limits and slow down. The solution: autoscaling.

KEDA (Kubernetes Event-Driven Autoscaler) watches metrics and scales pods up or down based on demand. For SwimTO, I configured ScaledObjects that scale based on HTTP request rate and queue depth. Low traffic? One replica. High traffic? Scale up to three.

This prevents over-provisioning during quiet periods (saving resources for other apps) and ensures responsiveness during traffic spikes. It's the right model for resource-constrained hardware.

## The App Portfolio

By mid-2026, Eldertree was running several production applications:

**SwimTO** — Toronto pool schedules (frontend, API, PostgreSQL, Redis)  
**OpenClaw** — AI assistant with Telegram bot integration (Gemini, Groq, Ollama)  
**Pitanga** — Pitanga LLC website (static site)  
**Eldertree Docs** — Operational runbook (VitePress)  

And a few in development or disabled:

**Canopy** — Personal finance dashboard (not deployed yet, too resource-heavy)  
**Journey** — AI career pathfinder (disabled, resource constraints)  
**NIMA** — LLM training project (not needed currently)

The pattern for each app is consistent:
- Helm chart for deployment configuration
- External Secrets for credentials (synced from Vault)
- Ingress for local access (`*.eldertree.local`)
- Cloudflare Tunnel for public access (if needed)
- KEDA ScaledObjects for autoscaling (if needed)
- Resource limits appropriate for Raspberry Pi

Consistency matters. When every app follows the same pattern, troubleshooting is easier. You know where to look for secrets (Vault). You know how to check logs (`kubectl logs`). You know how to scale replicas (edit the HelmRelease). Patterns reduce cognitive load.

## The Production Checklist

Here's what "production-ready" means for an app on Eldertree:

**Security:**
- [x] All secrets in Vault, not in Git
- [x] TLS certificates via cert-manager or Cloudflare
- [x] Non-root containers where possible
- [x] Network policies (future work)

**Reliability:**
- [x] Health checks (readiness and liveness probes)
- [x] Resource limits (requests and limits)
- [x] Multiple replicas for critical services
- [x] Persistent storage for stateful apps
- [x] Backup strategy for databases

**Observability:**
- [x] Metrics exported (Prometheus scraping)
- [x] Logs aggregated (Loki)
- [x] Dashboards in Grafana
- [x] Alerts for critical failures (Alertmanager)

**Automation:**
- [x] CI/CD pipeline (GitHub Actions)
- [x] Automated builds and image publishing (GHCR)
- [x] GitOps deployment (FluxCD)
- [x] Autoscaling (KEDA, if needed)

Not every app needs every checkbox. But every app should have a reason for not checking a box.

## The Learning Curve

Running production apps taught me things that theory doesn't cover.

**Resource limits are critical.** Without them, one pod can consume all node RAM and crash other workloads. With them, the scheduler can make better decisions about pod placement.

**Persistent storage is tricky.** Node-local storage is simple but not HA. Distributed storage is HA but resource-heavy. Backups are a middle ground. Choose based on RTO and resource constraints.

**Autoscaling prevents waste.** Static replicas mean you're either over-provisioned (wasting resources) or under-provisioned (poor performance). KEDA scales based on actual demand.

**Health checks catch issues early.** A pod that's "Running" but not responding to requests is worse than a crashed pod. Readiness probes tell Kubernetes when a pod is actually ready to serve traffic.

**Secrets management is non-negotiable.** One leaked API key can compromise everything. Vault + External Secrets makes secrets manageable.

**Patterns reduce friction.** When every app follows the same deployment pattern, adding a new app is fast. No reinventing the wheel.

## The Moment It Clicked

The moment SwimTO was live—publicly accessible, serving real users, with monitoring and autoscaling and backups—I realized: this isn't a homelab anymore. It's a platform.

A platform is infrastructure that makes deploying applications easy. You don't think about Kubernetes primitives. You don't write raw manifests. You just define your app (Helm chart), commit to Git (GitOps), and watch it deploy.

The cluster handles the rest: secrets injection, health checks, TLS certificates, ingress routing, autoscaling, monitoring, logging. The platform takes care of the infrastructure so you can focus on the application.

That's the goal. That's why you build infrastructure. Not for the sake of Kubernetes. For the sake of running things that matter.

And SwimTO matters. It helps people find pools. That's real value. And it runs on three Raspberry Pis in my living room.

That's pretty cool.

---

*Next: [Chapter 7: Watching It All](/chapters/07-watching-it-all) - The night metrics saved me, and why observability is not optional.*
