# Episode 7: The HA Quest

**Converting to 3-node high availability**

---

## Show Notes

- **Episode:** 7 of 10
- **Duration:** ~35-45 minutes
- **Topics:** Converting to 3-node high availability
- **Source Data:** 3 docs, 0 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 7: The HA Quest.

[Music fades out]

[pause]

---

### Introduction

The big one. We convert our single control plane into a 3-node
highly available cluster. etcd quorum, kube-vip, and the moment
of truth when we shut down node-1 to test failover.

[pause]

So let's start from the beginning...

---

### Act 1: Single Point of Failure

*The wake-up call*

Let's talk about the wake-up call.

HA Failover Test Report **Date:** 2026-01-10   **Test:** Shut down one control plane node and verify cluster remains operational Test Setup - **Cluster:** Eldertree (3-node HA control plane) - **Nodes:**   - node-1.eldertree.local (10.0.0.1) - Control plane + etcd   - node-2.eldertree.local (10.0.0.2) - Control plane + etcd   - node-3.eldertree.local (10.0.0.3) - Control plane + etcd - **Node Shut Down:** node-3.eldertree.local (10.0.0.3) Test Results ✅ Cluster Status - **Node 

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: The Conversion

*Worker to control plane*

Let's talk about worker to control plane.

High Availability (HA) Setup for Eldertree Cluster Current Setup ✅ - **node-1** (10.0.0.1): Control plane + etcd - **node-2** (10.0.0.2): Control plane + etcd - **node-3** (10.0.0.3): Control plane + etcd **Status**: **3-Node HA Control Plane** ✅ **Quorum**: Can lose 1 node and maintain quorum (2/3 = 66.7% > 50%) If any single node goes down: - ✅ Cluster API remains available - ✅ New pods can still be scheduled - ✅ Existing pods continue running - ✅ Automatic failover to remaining con

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: The Test

*Pulling the plug on node-1*

Let's talk about pulling the plug on node-1.

Restore SSH Configuration from Backup Quick Restore On node-1 (where you have physical access): ```bash List available backups sudo ls -lt /etc/ssh/sshd_config* | head -5 Restore the most recent backup (usually the one with .backup extension) sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config Or if there are timestamped backups, use the most recent one: sudo cp /etc/ssh/sshd_config.*.backup /etc/ssh/sshd_config 2>/dev/null || \ sudo cp /etc/ssh/sshd_config.backup /etc/ssh/s

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: HA is Worth It**

The peace of mind is invaluable.

[pause]

**Lesson 2: Test Your Failover**

HA that's never tested isn't really HA.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 7: The HA Quest.

In the next episode, we'll tackle When Everything Breaks: Troubleshooting war stories. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*