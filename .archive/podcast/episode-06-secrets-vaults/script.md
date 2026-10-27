# Episode 6: Secrets & Vaults

**HashiCorp Vault setup and HA**

---

## Show Notes

- **Episode:** 6 of 10
- **Duration:** ~20-25 minutes
- **Topics:** HashiCorp Vault setup and HA
- **Source Data:** 2 docs, 0 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 6: Secrets & Vaults.

[Music fades out]

[pause]

---

### Introduction

Secrets management is serious business. We deploy HashiCorp Vault,
learn about unsealing, integrate with External Secrets Operator,
and eventually achieve HA with Raft consensus.

[pause]

So let's start from the beginning...

---

### Act 1: Secrets Management 101

*Why Vault?*

Let's talk about why vault?.

Vault Migration to Production Mode This guide walks you through migrating Vault from dev mode (no persistence) to production mode with persistent storage. Overview **Dev Mode Issues:** - ❌ Secrets lost on pod restart - ❌ New root token generated each restart - ❌ External Secrets Operator breaks after restart **Production Mode Benefits:** - ✅ Secrets persist across restarts - ✅ Stable root token and unseal keys - ✅ Production-ready security model Prerequisites ```bash Set kubeconf

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: The Unseal Dance

*Vault initialization*

Let's talk about vault initialization.

Vault Secrets Management Guide Overview **All secrets MUST be stored in Vault** - never hardcode secrets in scripts, configuration files, or commit them to Git. Principles 1. ✅ **All secrets in Vault** - No exceptions 2. ✅ **Read from Vault** - Scripts should read secrets from Vault, not hardcode them 3. ✅ **Use External Secrets Operator** - For Kubernetes deployments, use External Secrets to sync from Vault 4. ✅ **Never commit secrets** - Use `.gitignore` for any files that might co

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: HA Configuration

*Raft consensus*

Let's talk about raft consensus.

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: Secrets Are Serious**

Never commit secrets to git. Ever.

[pause]

**Lesson 2: Plan for Unsealing**

Vault needs to be unsealed after every restart.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 6: Secrets & Vaults.

In the next episode, we'll tackle The HA Quest: Converting to 3-node high availability. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*