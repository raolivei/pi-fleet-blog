# Episode 1: The Beginning

**Setting up the Pi cluster hardware**

---

## Show Notes

- **Episode:** 1 of 10
- **Duration:** ~15-20 minutes
- **Topics:** Setting up the Pi cluster hardware
- **Source Data:** 44 docs, 73 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 1: The Beginning.

[Music fades out]

[pause]

---

### Introduction

The journey begins. We unbox three Raspberry Pi 5 units, set up the
hardware, and take our first steps toward building a home Kubernetes
cluster. What could possibly go wrong?

[pause]

So let's start from the beginning...

---

### Act 1: The Vision

_Why build a Pi cluster?_

Let's talk about why build a pi cluster?.

How to Access Canopy from Your Network Canopy is now accessible at: **https://canopy.eldertree.local** Quick Start Option 1: Use Pi-hole DNS (Recommended) Configure your device to use Pi-hole as its DNS server: **DNS Server**: `192.168.2.83` This will automatically resolve `canopy.eldertree.local` and give you ad-blocking too! macOS ```bash Temporarily (until reboot) sudo networksetup -setdnsservers Wi-Fi 192.168.2.83 To revert: sudo networksetup -setdnsservers Wi-Fi e

At one point, I asked: "validate everything work great..."

[pause - 2 seconds]

---

### Act 2: The Hardware

_Unboxing and assembly_

Let's talk about unboxing and assembly.

Adding a New Node to Eldertree Cluster Complete guide for adding a new Raspberry Pi node (e.g., node-2) to the eldertree k3s cluster. Prerequisites - New Raspberry Pi 5 with NVMe drive attached - SD card with backup OS (for initial setup) - Physical access to the node (for initial configuration) - Access to existing cluster nodes via SSH/Ansible - kubectl configured with cluster access Overview The process involves: 1. **NVMe Boot Setup** - Configure node to boot from NVMe 2. \*\*Syst

At one point, I asked: "@agent Continue: "Continue to iterate?"..."

[pause - 2 seconds]

---

### Act 3: First Boot

_Initial OS installation_

Let's talk about initial os installation.

Complete Guide: Adding a New Node to Eldertree Cluster This guide covers the complete process for adding a new Raspberry Pi node to the eldertree cluster, including NVMe boot configuration, network setup, and k3s integration. > **💡 Quick Setup Option**: For a streamlined setup, you can use the master playbook `setup-new-node.yml` which automates all steps below. See [Ansible Playbook Analysis](../ansible/PLAYBOOK_ANALYSIS.md) for usage examples. Overview When adding a new node to the el

At one point, I asked: "now create a medium.com article about this project, so that I can copy and paste on my medium account..."

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: Start Small**

You don't need a massive cluster to learn. Three nodes is plenty.

[pause]

**Lesson 2: Document Everything**

Future you will thank present you for those notes.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 1: The Beginning.

In the next episode, we'll tackle NVMe Migration: Moving from SD cards to NVMe storage. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

_Episode generated: 2026-01-13 20:38_
