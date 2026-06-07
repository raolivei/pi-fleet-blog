# Episode 4: The Flux Bootstrap

**GitOps with Flux CD**

---

## Show Notes

- **Episode:** 4 of 10
- **Duration:** ~15-20 minutes
- **Topics:** GitOps with Flux CD
- **Source Data:** 1 docs, 0 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 4: The Flux Bootstrap.

[Music fades out]

[pause]

---

### Introduction

We embrace GitOps by bootstrapping Flux CD. Now our cluster
configuration lives in Git, and deployments happen automatically.
The dream of declarative infrastructure becomes reality.

[pause]

So let's start from the beginning...

---

### Act 1: Why GitOps?

*The philosophy*

Let's talk about the philosophy.

Emergency Deployment Strategy Overview All projects in the eldertree cluster follow a **Flux-First with Emergency Override** deployment strategy. This document explains the approach and provides links to project-specific guides. Strategy Normal Operations (99% of time) ``` Git Commit → FluxCD → Cluster ``` - All deployments managed via GitOps - Changes committed to `pi-fleet` repository - Flux automatically reconciles every 5-10 minutes - Drift is automatically corrected - Full

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: The Bootstrap

*Setting up Flux*

Let's talk about setting up flux.

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: Declarative Everything

*Living the dream*

Let's talk about living the dream.

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: GitOps Changes Everything**

Once you go declarative, you never go back.

[pause]

**Lesson 2: Start with the Basics**

Master Kustomize before adding complexity.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 4: The Flux Bootstrap.

In the next episode, we'll tackle Storage Wars: Longhorn distributed storage journey. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*