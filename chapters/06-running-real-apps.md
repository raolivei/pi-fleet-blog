# Chapter 6: Running Real Apps

There's a specific moment when a homelab stops being a hobby and becomes infrastructure. It's not when you get Kubernetes running. It's not when you deploy monitoring. It's not even when you achieve high availability.

It's when someone else uses it.

For me, that moment came with SwimTO—a web app that aggregates Toronto's community pool schedules. It's not a huge app. No machine learning. No massive data processing. Just a React frontend, a FastAPI backend, a PostgreSQL database, and Redis for caching. But it's real. It serves real users. It has real data. And that changes everything.

When you're running test apps, downtime is annoying. When you're running apps that other people depend on, downtime is unacceptable. That's when you learn what "production" actually means.

## The First Real App

SwimTO was the application that made running Eldertree feel different. Pi-hole, Vault, Prometheus—those are utilities. They serve the cluster itself. SwimTO serves people outside the cluster. That's a different contract.

The application has four components:
- **Frontend** (React, port 3000) — The user interface
- **API** (FastAPI, port 8000) — The backend that fetches and serves pool data
- **PostgreSQL** — The database holding pool schedules
- **Redis** — Caching layer for API responses

In development, these ran on my laptop. Docker Compose, localhost, good enough. But production means Kubernetes: Deployments, Services, Ingresses, Secrets, ConfigMaps, Persistent Volumes. It means resource limits (8GB Raspberry Pis don't have infinite RAM). It means health checks, restart policies, and autoscaling.

SwimTO's Flux-managed directory combines a Helm release for the API and web frontend with separate PostgreSQL, Redis, storage, and job manifests. The chart does not own all four components. External Secrets synchronizes credentials from Vault. Ingress handles local routing, and Cloudflare Tunnel provides public access at [SwimTO](https://swimto.eldertree.xyz/).

The first deployment worked. Then the frontend crashed. Nginx permission issues—the container runs as non-root (UID 1000), and nginx wants to write to directories it doesn't own. The fix: emptyDir volumes for nginx cache. Add volumes, mount them, restart. Fixed.

Then the API crashed. Connection timeout to PostgreSQL. The DATABASE_URL had a pod IP (ephemeral) instead of a service name (stable). Change it to `postgres-service.swimto.svc.cluster.local`. Restart. Fixed.

Then cross-node communication broke (see Chapter 9 for that saga—Tailscale was hijacking k3s routes). Fix the routes, restart. Finally, everything worked.

That's production: a series of failures you didn't predict, debugged and fixed, until the app just runs.

## When Data Matters

With test apps, you can delete the database and start over. With production apps, the data is the product.

SwimTO's database holds pool schedules. If the database pod restarts, the data needs to survive. That means persistent storage.

Kubernetes PersistentVolumeClaims (PVCs) let you request storage that outlives pods. The local-path provisioner (built into K3s) creates volumes on the node's local disk. When the pod restarts, it reattaches to the same volume. Data persists.

But here's the catch: local-path volumes are node-local. If the pod is pinned to node-1 and node-1 fails, the pod can't move to another node (the volume is stuck on node-1). That's not high availability. That's a single point of failure.

For a while, I ran Longhorn—a distributed block storage system that replicates volumes across nodes. With healthy replicas on the surviving nodes, a volume can be made available elsewhere after a node fails. That is a capability local-path storage does not provide; it still depends on replica health, networking, and the workload recovering.

But Longhorn on Raspberry Pis is resource-heavy. The manager, driver, and replica pods consumed significant RAM and CPU. For a 3-node homelab, the overhead didn't justify the benefit. Vault also has its own Raft replication across members, so it does not need Longhorn to replicate the same data underneath it. That does not give PostgreSQL the same protection.

So I removed Longhorn and went back to local-path. Simpler and lighter, with a recovery tradeoff I had to own. There is a `pg_dump` backup script in the repository, but a script is not evidence of a regular backup schedule or a successful restore. The November 10, 2026 check found SwimTO's data-maintenance jobs, not a database-backup CronJob; it did not establish whether a backup was scheduled elsewhere.

The lesson is to distinguish a recovery plan from a recovery result. I cannot promise a ten-minute restore without checking the backup, its age, and a timed restore test. Choosing node-local storage means accepting that work, not making the data resilient by calling the cluster HA.

## Autoscaling: Don't Waste What You Don't Have

Raspberry Pis have limited resources. Each node has 8GB RAM and 4 CPU cores. That's enough for a small cluster, but not enough to waste.

Kubernetes lets you set resource requests and limits for every container. Requests guide scheduling and resource allocation; limits constrain how much the container can use. If you don't set them, a single misbehaving pod can consume all node resources and starve other workloads. If you set them too high, you prevent other pods from scheduling even when resources are available.

For example, SwimTO's API configuration in the November 2026 source snapshot requests 256Mi of memory and 250m of CPU:
```yaml
resources:
  requests:
    memory: 256Mi
    cpu: 250m
  limits:
    memory: 512Mi
    cpu: 500m
```

The scheduler accounts for 256MiB of memory and 0.25 CPU for this container, with limits of 512MiB and 0.5 CPU. It's a balance: enough to run, not so much that other apps can't schedule.

But static limits don't handle traffic spikes. If SwimTO suddenly gets 10x traffic (unlikely, but possible), the pods will hit CPU limits and slow down. The solution: autoscaling.

KEDA (Kubernetes Event-Driven Autoscaler) watches metrics and adjusts replica counts. SwimTO's API and web scalers use HTTP request rates from Prometheus; they are not queue-depth scalers. Database and cache scaling configuration uses CPU and memory signals instead.

The API range in the November 2026 configuration is two to five replicas. The web frontend has its own rate threshold and replica limits. Those are desired scaling bounds, not a promise that five API pods will fit on the available nodes or that a broken metrics query will scale anything.

That is useful on constrained hardware, but it still needs checking under load. More replicas do not create more memory or fix a slow database.

## The App Portfolio

By mid-2026, the cluster's application configuration had grown well beyond the first SwimTO deployment:

**SwimTO** — Toronto pool schedules (frontend, API, PostgreSQL, Redis)
**OpenClaw** — AI assistant with Telegram bot integration (Gemini, Groq, Ollama)
**Pitanga** — Pitanga LLC website (static site)
**Eldertree Docs** — [Operational runbook](https://docs.eldertree.xyz/) (VitePress)

**Canopy** — Personal finance dashboard, with public tunnel routing committed in February 2026 and further deployment work in June. It was not an app that had never reached the cluster. In the November 10 check, its API, frontend, and Redis Deployments were present but scaled to zero; PostgreSQL was Ready. That is a dated observation of a scaled-down application, not a claim that the complete app was serving traffic.

Other projects stayed disabled in the cluster configuration:

**Journey** — AI career pathfinder

**NIMA** — LLM training project

The pattern for each app is consistent:
- Helm and Kustomize for deployment configuration
- External Secrets for credentials (synced from Vault)
- Ingress for local routing
- Cloudflare Tunnel for public access (if needed)
- KEDA ScaledObjects for autoscaling (if needed)
- Resource limits appropriate for Raspberry Pi

I use the [Grafana dashboards](https://grafana.eldertree.xyz/) to look at the metrics behind those deployments, alongside checking the application itself.

Consistency matters. When every app follows the same pattern, troubleshooting is easier. You know where to look for secrets (Vault). You know how to check logs (`kubectl logs`). You know how to scale replicas (edit the HelmRelease). Patterns reduce cognitive load.

## The Production Checklist

Here are the checks I use when deciding whether an app is ready. This is a set of requirements to verify, not a claim that every app has passed them all:

**Security:**
- Credentials managed in Vault and delivered through Kubernetes Secrets, rather than committed as values
- TLS and certificate trust checked for the connections the app actually uses
- Non-root containers where possible
- Network access controls reviewed; NetworkPolicy coverage still needs its own verification

**Reliability:**
- Health checks (readiness and liveness probes)
- Resource requests and limits
- Multiple replicas where useful, with failure domains and storage checked
- Persistent storage for stateful apps
- A database backup schedule and a tested restore

**Observability:**
- Metrics exported (Prometheus scraping)
- Logs aggregated (Loki)
- Dashboards in Grafana
- Alert rules evaluated by Prometheus, with Alertmanager routing notifications

**Automation:**
- CI/CD pipeline (GitHub Actions)
- Automated builds and image publishing (GHCR)
- GitOps deployment (FluxCD), followed by a deployment check
- Autoscaling (KEDA, if needed), with working metrics and enough capacity

Not every app needs the same availability or scaling setup. But I should be able to explain each choice and show what I checked.

## The Learning Curve

Running production apps taught me things that theory doesn't cover.

**Resource limits are critical.** Without them, one pod can consume all node RAM and crash other workloads. With them, the scheduler can make better decisions about pod placement.

**Persistent storage is tricky.** Node-local storage is simple but tied to a node. Distributed replication can improve availability at a cost. Backups serve a different purpose: recovering data. Neither one is a substitute for testing recovery.

**Autoscaling prevents waste.** Static replicas mean you're either over-provisioned (wasting resources) or under-provisioned (poor performance). KEDA scales based on actual demand.

**Health checks catch issues early.** A pod that's "Running" but not responding to requests is worse than a crashed pod. Readiness probes tell Kubernetes when a pod is actually ready to serve traffic.

**Secrets management is non-negotiable.** One leaked API key can compromise everything. Vault + External Secrets makes secrets manageable.

**Patterns reduce friction.** When every app follows the same deployment pattern, adding a new app is fast. No reinventing the wheel.

## The Moment It Clicked

Once SwimTO was publicly accessible and serving people, the reason for all this infrastructure was much clearer. Monitoring and deployment automation were supporting an application, rather than being the whole project. That did not make every recovery procedure finished.

A platform is infrastructure that makes deploying applications easy. A shared chart can take care of the repeated application pieces, while separate manifests handle the resources that need them. I commit the intended setup to Git, let Flux reconcile it, and then check the deployment.

The controllers handle recurring work: synchronizing Secrets, checking pod health, reconciling certificates and routes, adjusting replicas, and collecting telemetry. I still have to verify the result from the application's side. A collection of healthy controllers is not the same as a user successfully loading the app.

That's the goal. That's why you build infrastructure. Not for the sake of Kubernetes. For the sake of running things that matter.

And SwimTO matters. It helps people find pools. That's real value. And it runs on three Raspberry Pis in my living room.

That's pretty cool.

---

*Next: [Chapter 7: Watching It All](https://github.com/raolivei/pi-fleet-blog/pull/24) - The night metrics saved me, and why observability is not optional.*
