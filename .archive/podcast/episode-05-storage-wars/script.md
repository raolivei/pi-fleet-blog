# Episode 5: Storage Wars

**Longhorn distributed storage journey**

---

## Show Notes

- **Episode:** 5 of 10
- **Duration:** ~25-30 minutes
- **Topics:** Longhorn distributed storage journey
- **Source Data:** 1 docs, 0 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 5: Storage Wars.

[Music fades out]

[pause]

---

### Introduction

Local-path storage is fine until a node goes down. We attempt to
deploy Longhorn for distributed storage, fail spectacularly, give up,
come back two days later, and finally achieve victory.

[pause]

So let's start from the beginning...

---

### Act 1: Local Path Limitations

*Single point of failure*

Let's talk about single point of failure.

Longhorn Storage Recommendation Current Status Longhorn is experiencing issues: - **Webhook connectivity problems** - Managers can't verify webhook service - **Stuck in uninstalling state** - HelmRelease is trying to uninstall but failing - **PVCs in Pending state** - Cannot provision new volumes - **Root cause**: Hairpin mode required but cannot be enabled on cni0 bridge What "Continue with local-path storage" Means The recommendation means: ✅ **DO:** - Use `local-path` storage c

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: Enter Longhorn

*First attempt (failure)*

Let's talk about first attempt (failure).

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: The Breakthrough

*Making it work*

Let's talk about making it work.

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: Persistence Requires Planning**

Think about storage before you need it.

[pause]

**Lesson 2: Never Give Up**

Sometimes you need fresh eyes and a new day.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 5: Storage Wars.

In the next episode, we'll tackle Secrets & Vaults: HashiCorp Vault setup and HA. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*