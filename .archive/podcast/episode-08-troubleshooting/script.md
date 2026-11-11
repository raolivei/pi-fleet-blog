# Episode 8: When Everything Breaks

**Troubleshooting war stories**

---

## Show Notes

- **Episode:** 8 of 10
- **Duration:** ~30-35 minutes
- **Topics:** Troubleshooting war stories
- **Source Data:** 17 docs, 3 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 8: When Everything Breaks.

[Music fades out]

[pause]

---

### Introduction

A collection of our greatest hits in cluster disasters. Node-1's
recurring issues, emergency mode recovery, locked root accounts,
and the time we couldn't SSH into anything.

[pause]

So let's start from the beginning...

---

### Act 1: Emergency Mode Adventures

*When boot fails*

Let's talk about when boot fails.

<!-- MIGRATED TO RUNBOOK --> > **📚 This document has been migrated to the Eldertree Runbook** > > For the latest version, see: [BOOT-002](https://docs.eldertree.xyz/runbook/issues/boot/BOOT-002) > > The runbook provides searchable troubleshooting guides with improved formatting. --- Boot Reliability Fix Problem Systems were failing to boot after reboot, getting stuck during the init process. This is typically caused by: 1. **fstab mounts without `nofail`** - System waits indefinitely 

At one point, I asked: "================================================================================
METRICS SUMMARY
================================================================================
train_loss            ..."

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: SSH Lockouts

*Permission denied*

Let's talk about permission denied.

<!-- MIGRATED TO RUNBOOK --> > **📚 This document has been migrated to the Eldertree Runbook** > > For the latest version, see: [DNS-001](https://docs.eldertree.xyz/runbook/issues/dns/DNS-001) > > The runbook provides searchable troubleshooting guides with improved formatting. --- DNS Troubleshooting Guide Issue: ExternalDNS Cannot Deploy Due to DNS Resolution Failure Problem The ExternalDNS HelmRelease fails to deploy because the HelmRepository cannot fetch the chart index from `k

At one point, I asked: "option 2..."

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: The Recovery Toolkit

*How we fix things*

Let's talk about how we fix things.

<!-- MIGRATED TO RUNBOOK --> > **📚 This document has been migrated to the Eldertree Runbook** > > For the latest version, see: [EMERG-002](https://docs.eldertree.xyz/runbook/issues/boot/EMERG-002) > > The runbook provides searchable troubleshooting guides with improved formatting. --- Fix Emergency Mode Without Keyboard Quick Solutions Option 1: Try SSH (Most Likely to Work) Even in emergency mode, SSH might still be available. Try: ```bash Try SSH to node-1 ssh raolivei@node-1

At one point, I asked: "validate everything works great..."

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: Have a Recovery Plan**

Know how to get back in when locked out.

[pause]

**Lesson 2: Logs Are Your Friend**

journalctl and kubectl logs will save you.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 8: When Everything Breaks.

In the next episode, we'll tackle The Monitoring Stack: Prometheus, Grafana, observability. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*