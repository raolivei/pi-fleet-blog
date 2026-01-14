# Episode 2: NVMe Migration

**Moving from SD cards to NVMe storage**

---

## Show Notes

- **Episode:** 2 of 10
- **Duration:** ~20-25 minutes
- **Topics:** Moving from SD cards to NVMe storage
- **Source Data:** 6 docs, 0 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 2: NVMe Migration.

[Music fades out]

[pause]

---

### Introduction

SD cards are slow and unreliable for Kubernetes workloads. We embark
on a journey to migrate the entire cluster to NVMe SSDs, discovering
along the way that boot configuration is an art form.

[pause]

So let's start from the beginning...

---

### Act 1: The Problem with SD Cards

*Why migrate to NVMe*

Let's talk about why migrate to nvme.

Node Migration Guide: Rename and IP Update This guide walks you through migrating nodes from old names/IPs to new ones. Migration Overview **Old → New:** - `node-0` → `node-1` (192.168.2.86 → 192.168.2.101) - `node-1` → `node-2` (192.168.2.85 → 192.168.2.102) - `node-2` → `node-3` (192.168.2.84 → 192.168.2.103) **Note:** eth0 IPs (10.0.0.1, 10.0.0.2, 10.0.0.3) do NOT change - they're based on physical position. Prerequisites 1. ✅ **All nodes accessible via old IPs** (verify with `

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: The Migration Process

*Step by step*

Let's talk about step by step.

Multi-Node Storage Configuration Overview The eldertree cluster is designed to support multiple nodes with different storage types: - **Main Node (eldertree)**: SATA/NVMe drive for high-performance workloads - **Worker Nodes**: SD card storage for standard workloads Storage Classes Available Storage Classes 1. **`local-path-nvme`** - For high-performance workloads on the main node    - Uses SATA/NVMe drive at `/mnt/nvme/storage` or `/mnt/sata/storage`    - Recommended for: Data

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: Boot Configuration Hell

*Making it actually boot*

Let's talk about making it actually boot.

NVMe Boot Configuration Complete Status: ✅ Both Nodes Configured Both **node-0** and **node-1** have been configured to boot from NVMe while preserving all existing data, including Kubernetes (K3s) data. Configuration Summary ✅ node-0 (192.168.2.86) - **Boot configuration**: Updated to use `/dev/nvme0n1p2` - **K3s data**: Preserved at `/var/lib/rancher/k3s` - **Status**: Ready to boot from NVMe ✅ node-1 (192.168.2.85) - **Boot configuration**: Updated to use `/dev/nvme0n1p2`

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: Boot Configuration Matters**

The bootloader is finicky. Respect it.

[pause]

**Lesson 2: Test Before Committing**

Always have a fallback boot option.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 2: NVMe Migration.

In the next episode, we'll tackle Network Nightmares: DNS, firewall, and connectivity battles. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*