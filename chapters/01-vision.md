# Chapter 1: The Vision

The eldertree cluster didn't start as a grand plan—it began with a simple need: run my personal applications without depending on cloud providers. What started as a single Raspberry Pi running Docker containers evolved into a full Kubernetes cluster, teaching me more about infrastructure, resilience, and problem-solving than I ever expected.

## Why Self-Host?

The decision to self-host came from several motivations:

**Privacy and Data Ownership**

- Personal finance data (Canopy) shouldn't live on someone else's servers
- User data for commercial projects (SwimTO) requires full control
- AI-generated content (Visage headshots, Ollie memories) should stay private
- Learning projects (NIMA, Journey) generate data I want to own completely

**Learning Kubernetes Hands-On**

- Reading about Kubernetes isn't the same as running it
- Production experience teaches lessons you can't learn from tutorials
- Understanding the full stack from hardware to applications

**Cost-Effective Infrastructure**

- Raspberry Pi 5 costs less than a month of cloud hosting
- No ongoing monthly fees
- Power consumption is minimal (~5-10W)

**Full Control Over the Stack**

- Choose my own tools and versions
- No vendor lock-in
- Customize everything to my needs
- Learn how everything actually works

## Goals

When I started, I had a clear set of goals:

✅ **Run Personal Applications**

*Active on cluster:*

- **SwimTO** - Toronto pool schedules (public at swimto.eldertree.xyz)
- **OpenClaw** - AI assistant with Telegram bot integration (@eldertree_assistant_bot)
- **Pitanga** - Pitanga LLC website (public at pitanga.cloud)
- **Northway Signal** - Cloud consulting website (public at northwaysignal.pitanga.cloud)
- **Eldertree Docs** - Searchable documentation site (public at docs.eldertree.xyz)

*In development / planned for cluster:*

- **Canopy** - Personal finance dashboard (private financial data)
- **Visage** - Self-hosted AI headshot generator (SDXL + LoRA, GPU offloaded to local Mac)
- **Grove** - AI agent for cluster management and development (extends OpenClaw)
- **Ollie** - Local AI with total recall and RAG-based memory retrieval
- **Journey** - AI-powered career pathfinder
- **iPhone Export** - Ecommerce platform for international iPhone sales
- **Fragment** - Identity fragments archive (local-first PWA)
- **NIMA** - AI/ML learning project
- **US Law Severity Map** - Data visualization project
- **Personal Website** - Portfolio site (WIP)

✅ **Learn Kubernetes in Production**

- Not just tutorials—real production workloads
- Understand the full lifecycle: deployment, scaling, troubleshooting
- Learn from real problems, not contrived examples

✅ **Build a Resilient, Maintainable Infrastructure**

- Infrastructure as Code (GitOps with FluxCD)
- Automated deployments
- Proper monitoring and alerting
- Documentation for future reference

✅ **Implement Proper Secrets Management**

- No secrets in Git
- Policy-based access control
- Integration with Kubernetes (External Secrets Operator)
- Production-grade security

✅ **Set Up Monitoring and Observability**

- Know what's happening in the cluster
- Catch problems before they become critical
- Understand resource usage
- Raspberry Pi-specific metrics

✅ **Enable GitOps Workflows**

- All infrastructure in Git
- Automated synchronization
- Easy rollbacks
- Version-controlled configuration

## Constraints

Every project has constraints, and eldertree was no exception:

**ARM64 Hardware (Raspberry Pi)**

- Not all container images support ARM64
- Some tools don't have ARM64 builds
- Performance characteristics differ from x86_64
- Learning opportunity, but also a constraint

**Limited Resources (8GB RAM)**

- Can't run everything at once
- Need to optimize resource usage
- Careful resource limit configuration
- Prioritize what's actually needed

**Home Network Environment**

- No static public IP (initially)
- Need secure remote access solution
- DNS resolution for local services
- Network-wide DNS with Pi-hole

**Budget Considerations**

- Single Raspberry Pi 5 (not a multi-node cluster initially)
- No expensive hardware
- Use what's available
- Cost-effective solutions

## The Evolution

What started as "let's run a few Docker containers" quickly became "let's build a proper Kubernetes cluster." The journey wasn't linear:

1. **Initial Phase (October 2025):** Started with US Law Severity Map project
2. **Infrastructure Phase (November 2025):** Set up K3s cluster, Terraform, FluxCD
3. **Services Phase (November-December 2025):** Added Vault, monitoring, DNS, applications
4. **Optimization Phase (December 2025):** Fixed issues, optimized resources, improved documentation
5. **HA Phase (January 2026):** Expanded to 3-node HA cluster, Vault HA with Raft, kube-vip, Tailscale VPN
6. **Consolidation Phase (February 2026):** Removed Longhorn (simplified to local-path), reusable CI/CD workflows, deployed OpenClaw and Pitanga

Each phase taught new lessons and revealed new requirements. The cluster evolved organically, solving problems as they arose, rather than following a rigid plan.

## What I Learned About Planning

Looking back, I realize that:

- **Starting simple was the right choice** - Single node, basic setup, then grow
- **Problems are learning opportunities** - Each of the 92 problems taught something valuable
- **Documentation is critical** - Without it, you repeat the same mistakes
- **Git history tells the story** - Commits document the journey better than memory
- **Iteration beats perfection** - Ship, learn, improve, repeat

## The Name: Eldertree

Why "eldertree"? The name came from wanting something that represented:

- **Wisdom** - Learning from experience and mistakes
- **Stability** - A foundation that supports other projects
- **Growth** - Starting small but designed to expand
- **Resilience** - Weathering challenges and continuing to thrive

Like an elder tree in a forest, this cluster is meant to be a foundational piece of infrastructure that supports other projects, learns from challenges, and grows stronger over time.



