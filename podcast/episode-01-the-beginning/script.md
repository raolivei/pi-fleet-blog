# Episode 1: The Beginning

**The vision behind the eldertree cluster**

---

## Show Notes

- **Episode:** 1 of 10
- **Duration:** ~15-20 minutes
- **Topics:** Why self-host, project goals, constraints, and how the cluster evolved
- **Chapter Reference:** [Chapter 1: The Vision](../../chapters/01-vision.md)

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and this is Episode 1: The Beginning.

[Music fades out]

[pause]

---

### Introduction

The eldertree cluster didn't start as a grand plan. It began with a simple need: run my personal applications without depending on cloud providers. What started as a single Raspberry Pi running Docker containers evolved into a full Kubernetes cluster — and taught me more about infrastructure, resilience, and problem-solving than I ever expected.

This episode is about the "why." Why build a Pi cluster? What was I trying to accomplish? And what constraints shaped every decision along the way?

[pause]

---

### Act 1: Why Self-Host?

_The motivations behind the project_

The decision to self-host came from several directions at once.

First — **privacy and data ownership**. I was building Canopy, a personal finance dashboard. My financial data shouldn't live on someone else's servers. Same for SwimTO, a commercial project tracking Toronto pool schedules — user data requires full control. And my learning projects, NIMA and Journey, generate data I want to own completely.

Second — **learning Kubernetes hands-on**. I'd read about Kubernetes. I'd done tutorials. But reading about Kubernetes isn't the same as running it. Production experience teaches lessons you simply cannot learn from tutorials. I wanted to understand the full stack, from hardware all the way up to applications.

Third — **cost**. A Raspberry Pi 5 costs less than a single month of cloud hosting for equivalent services. No ongoing monthly fees. Power consumption is minimal — roughly 5 to 10 watts per node. Over time, the math is overwhelmingly in favor of self-hosting.

And finally — **full control over the stack**. Choose my own tools and versions. No vendor lock-in. Customize everything to my needs. And most importantly, learn how everything actually works under the hood.

[pause]

---

### Act 2: Goals and Constraints

_What the cluster needed to do — and what limited it_

When I started, I had a clear set of goals. Run personal applications — Canopy, SwimTO, Journey, NIMA. Learn Kubernetes in production, not from contrived examples. Build resilient, maintainable infrastructure using GitOps with FluxCD. Implement proper secrets management with HashiCorp Vault. Set up real monitoring and observability with Prometheus and Grafana. And enable GitOps workflows where all infrastructure lives in Git.

But every project has constraints, and eldertree was no exception.

**ARM64 hardware.** Not all container images support ARM64. Some tools don't have ARM builds at all. Performance characteristics differ from x86. It's a learning opportunity, but also a real limitation you hit constantly.

**Limited resources.** Each Raspberry Pi 5 has 8GB of RAM. You can't run everything at once. You need to optimize resource usage and carefully configure limits. You have to prioritize what's actually needed.

**Home network environment.** No static public IP initially. Need a secure remote access solution. DNS resolution for local services. Network-wide DNS with Pi-hole.

**Budget.** I started with a single Raspberry Pi 5, not a multi-node cluster. No expensive hardware. Use what's available. Cost-effective solutions at every turn.

These constraints shaped every architectural decision. They forced simplicity and forced me to really understand what each component was doing.

[pause]

---

### Act 3: The Evolution

_How the project grew organically_

What started as "let's run a few Docker containers" quickly became "let's build a proper Kubernetes cluster." The journey wasn't linear — it was organic, solving problems as they arose.

The **initial phase**, back in October 2025, started with the US Law Severity Map project. Just getting something running.

Then came the **infrastructure phase** in November — setting up K3s, Terraform for Cloudflare DNS, and FluxCD for GitOps. This is when it started feeling like real infrastructure.

The **services phase** ran through November and December — adding Vault for secrets, monitoring with Prometheus and Grafana, Pi-hole for DNS, and deploying the actual applications.

And then the **optimization phase** in December — fixing issues that came up, optimizing resource usage, and improving documentation.

Each phase taught new lessons and revealed new requirements. The cluster evolved organically rather than following a rigid plan.

[pause]

---

### The Name: Eldertree

One thing people ask about is the name. Why "eldertree"?

I wanted something that represented wisdom — learning from experience and mistakes. Stability — a foundation that supports other projects. Growth — starting small but designed to expand. And resilience — weathering challenges and continuing to thrive.

Like an elder tree in a forest, this cluster is meant to be a foundational piece of infrastructure that supports other projects, learns from challenges, and grows stronger over time.

[pause]

---

### Lessons Learned

[Reflective music starts - low volume]

What did I learn from this first phase?

**Starting simple was the right choice.** Single node, basic setup, then grow. Don't try to build the final architecture on day one.

**Problems are learning opportunities.** Over the course of this project, I hit ninety-two documented problems. Each one taught something valuable.

**Documentation is critical.** Without it, you repeat the same mistakes. Future you will thank present you for those notes.

**Git history tells the story.** Commits document the journey better than memory ever could.

**Iteration beats perfection.** Ship, learn, improve, repeat. That's the real workflow.

[pause]

---

### Closing

[Music swells slightly]

And that's Episode 1: The Beginning. The vision, the motivations, and the constraints that shaped everything that followed.

In the next episode, we'll tackle the first real infrastructure challenge: NVMe Migration — moving from SD cards to NVMe storage. That's where things start getting hands-on, and where the first real problems show up.

[pause]

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*This is a draft script. Use as reference material for recording — speak naturally, deviate when it feels right, and add personal commentary. See [RECORDING_NOTES.md](../RECORDING_NOTES.md) for guidance.*
