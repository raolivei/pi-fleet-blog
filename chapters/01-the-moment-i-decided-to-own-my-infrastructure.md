# Chapter 1: The Moment I Decided to Own My Infrastructure

I remember the exact moment I decided to build Eldertree.

I was looking at my AWS bill—again. Not a huge number, but enough to make me pause. Enough to make me think: *I'm paying monthly rent for my own data.* My personal finance dashboard lived on someone else's servers. My learning projects, my AI experiments, my half-finished ideas—all of it sitting in a cloud I didn't control, accumulating charges, subject to terms I didn't write.

And I thought: *What if I just... owned this?*

Not in the theoretical sense. Not "cloud ownership" with quotes around it. Actual ownership. Hardware I could touch. Infrastructure I could reboot. Data that never left my house unless I decided otherwise.

That's when I started researching Raspberry Pis.

## The Ownership Question

The decision to self-host wasn't purely financial, though the math helped. Three Raspberry Pi 5s cost about $600 total—less than six months of moderate cloud hosting. They pull 5-10 watts each. No monthly bills. No surprise charges because I forgot to shut down a test instance.

But the real motivation was deeper: **I wanted to understand the whole stack.**

Reading about Kubernetes isn't the same as running it. Tutorials give you sanitized problems with known solutions. Production gives you the 3 AM panic when DNS stops resolving and you have no idea why. That's where you actually learn.

And there was the privacy angle. My personal finance data—real transactions, real account balances—shouldn't live on someone else's infrastructure. User data from projects I was building deserved better than "we comply with industry-standard security practices." AI-generated content, learning experiments, half-baked ideas that might never ship—I wanted full control over all of it.

Cloud providers make it easy. That's their entire value proposition. But easy comes with trade-offs: vendor lock-in, opaque pricing, someone else's roadmap, someone else's terms of service. I wanted to make different trade-offs.

## Why Raspberry Pi?

Once I decided to self-host, the hardware question became obvious: Raspberry Pi 5.

Not because it's the most powerful option—it's not. Not because ARM64 makes everything easier—it doesn't. But because it hit a sweet spot between capability, cost, and learning value.

**The Pi 5 gives you:**
- 8GB RAM (enough to run real workloads, not enough to be wasteful)
- ARM64 architecture (forces you to think about cross-platform compatibility)
- Gigabit Ethernet (real network performance)
- NVMe support via PCIe (actual storage speed)
- Low power draw (can run 24/7 without guilt)

The ARM64 constraint turned out to be a feature, not a bug. Not every container image supports ARM64. Some tools don't have ARM64 builds. You learn to check, to build from source when needed, to understand what's actually happening under the hood. It's a forcing function for deeper learning.

And the 8GB RAM limit? Also a feature. You can't run everything at once. You have to think about resource limits, optimize what you deploy, prioritize what actually matters. In the cloud, you just scale up. On a Pi cluster, you learn to make it fit.

## Why K3s?

Once I had the hardware, I needed to choose a Kubernetes distribution. Full upstream Kubernetes felt like overkill for three Raspberry Pis. K3s—Rancher's lightweight Kubernetes—was purpose-built for exactly this use case.

**K3s gives you:**
- Single binary installation (no complex dependencies)
- Built-in Traefik ingress (one less thing to configure)
- Built-in storage provisioner (start deploying immediately)
- Embedded etcd for HA (three nodes, no separate etcd cluster)
- ARM64 first-class support (not an afterthought)

The trade-off: K3s makes some decisions for you. Traefik instead of NGINX. Local-path storage by default. SQLite or embedded etcd instead of external etcd. For a three-node homelab cluster, these were the right defaults. I could always swap them later if needed.

And here's the key insight: **K3s is real Kubernetes.** CNCF certified. Compatible with standard APIs. If you learn K3s, you've learned Kubernetes. The concepts transfer. The kubectl commands work the same. The debugging process is identical. You're not learning a toy version—you're learning the real thing, just optimized for resource-constrained environments.

## The Vision

I didn't start with a grand plan. I started with: *Can I run my personal finance dashboard on a Raspberry Pi cluster?*

That question expanded quickly:
- Can I run multiple apps?
- Can I make it resilient (high availability)?
- Can I automate deployments (GitOps)?
- Can I do secrets properly (Vault)?
- Can I monitor it like production (Prometheus, Grafana)?
- Can I access it remotely without punching holes in my firewall (Tailscale)?

Each question led to the next. Each answer raised new questions. What started as "run a few Docker containers" became "build a production-grade Kubernetes platform."

**The applications I wanted to run:**
- **Canopy** - Personal finance dashboard (private data, self-hosted by necessity)
- **SwimTO** - Toronto pool schedules (public service, learning project)
- **Ollie** - AI assistant with total recall (local-first by design)
- **Eldertree Docs** - Searchable runbook (documentation as infrastructure)
- Plus a dozen other projects in various states of completion

**The infrastructure goals:**
- Learn Kubernetes in production (real problems, real stakes)
- Build resilient, maintainable systems (GitOps, monitoring, proper secrets)
- Own the full stack (hardware to application)
- Document everything (searchable runbook, not scattered notes)

## The Name

I called it **Eldertree** because I wanted something that represented wisdom, stability, growth, and resilience. An elder tree in a forest is foundational—it supports the ecosystem around it, weathers challenges, learns from seasons, grows stronger over time.

This cluster was meant to be exactly that: a foundational piece of infrastructure that supports other projects, learns from failures, and evolves organically.

## The Evolution

Looking back six months later, the journey wasn't linear:

**October 2025:** Started with one Pi, one project (US Law Severity Map)  
**November 2025:** Set up K3s, Terraform, FluxCD (infrastructure phase)  
**December 2025:** Added Vault, monitoring, DNS, optimized everything  
**January 2026:** Expanded to three nodes for HA, added Tailscale VPN  
**February 2026:** Simplified storage (dropped Longhorn), built reusable CI/CD workflows  
**March-June 2026:** Deployed production apps, built the Control Center, survived multiple incidents

Each phase taught new lessons. Each incident revealed gaps in understanding. Each solved problem made the next one clearer. The cluster evolved organically—solving problems as they arose, not following a rigid master plan.

## What I Learned About Ownership

Here's what six months of owning my infrastructure taught me:

**Starting simple was the right choice.** One node, basic setup, then grow. Don't try to build HA on day one.

**Problems are learning opportunities.** Each of the 90+ documented issues taught something valuable. The runbook at docs.eldertree.xyz is the artifact of that learning.

**Documentation is critical.** Without it, you repeat the same mistakes. With it, you build on previous solutions.

**Iteration beats perfection.** Ship something that works, learn from it, improve it, repeat. The first version doesn't have to be the final version.

**Constraints force creativity.** 8GB RAM per node? You learn to optimize. ARM64 only? You learn to build from source. Home network? You learn creative solutions for remote access.

And most importantly: **Ownership means responsibility, but also freedom.** When something breaks at 3 AM, it's on me to fix it. But when I want to try something new, deploy a weird experiment, or completely redesign the network—I can. No approval needed. No terms of service to check. No vendor roadmap to wait for.

That freedom is worth the responsibility.

## The Trade-Off

I'm not arguing everyone should self-host. Cloud providers exist for good reasons. They handle the complexity you don't want to think about. They scale effortlessly. They have entire teams dedicated to security, reliability, and compliance.

But for me, the trade-off was clear: I was willing to take on that complexity in exchange for ownership, learning, and control.

**What I gave up:**
- Effortless scaling (I have three nodes, not infinite nodes)
- Managed services (I run my own Postgres, Redis, Vault)
- Support contracts (I am the support)

**What I gained:**
- Deep understanding of the full stack
- Complete control over my data
- Predictable costs (hardware is a one-time expense)
- Freedom to experiment without permission
- A production environment that taught me more than any tutorial could

## What's Next

This is Chapter 1 because it's the beginning, not the end. The cluster is running. Apps are deployed. Monitoring is in place. GitOps is working. But the journey isn't over—it's just shifted from "can I build this?" to "how far can I take this?"

The rest of this blog is the story of that journey: the technical decisions, the war stories, the late-night debugging sessions, the moments when automation saved me, and the moments when I had to dig deep into systemd logs to understand why a node wouldn't boot.

It's the story of choosing ownership over convenience, and finding out what that actually means in practice.

---

*Next: [Chapter 2: First Boot](/chapters/02-first-boot) - The moment I ran `kubectl get nodes` for the first time and saw all three nodes ready.*
