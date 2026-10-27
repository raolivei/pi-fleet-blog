# Episode 3: Network Nightmares

**DNS, firewall, and connectivity battles**

---

## Show Notes

- **Episode:** 3 of 10
- **Duration:** ~25-30 minutes
- **Topics:** DNS, firewall, and connectivity battles
- **Source Data:** 13 docs, 0 conversations

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, and today we're diving into Episode 3: Network Nightmares.

[Music fades out]

[pause]

---

### Introduction

If there's one thing that will break your cluster, it's networking.
Join us as we battle DNS resolution issues, firewall misconfigurations,
and the dreaded "packets silently dropped" syndrome.

[pause]

So let's start from the beginning...

---

### Act 1: DNS, The Silent Killer

*When names don't resolve*

Let's talk about when names don't resolve.

AWS Client VPN DNS Configuration Fix Problema A VPN **US-non-prod** conecta corretamente e as rotas aparecem ok (utun6), mas o DNS está usando `10.56.0.2` que resolve hostnames do ambiente **PROD** em vez do ambiente **NON-PROD**. **Sintomas:** - DNS `10.56.0.2` funciona e resolve hostnames (ex: `argo-hq.shipyard.prod.us-west-2.momentive.internal`) - Mas não resolve hostnames do ambiente **non-prod** (ex: `argo-hq.shipyard.non-prod.us-west-2.momentive.internal`) - Causa falhas em:   - E

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 2: Firewall Follies

*UFW and the packets it ate*

Let's talk about ufw and the packets it ate.

Canopy Quick Start - Network Access 🚀 Quick Access (5 Minutes) Step 1: Configure DNS on Your Device **Set DNS Server to**: `192.168.2.83` <details> <summary><b>macOS</b></summary> ```bash sudo networksetup -setdnsservers Wi-Fi 192.168.2.83 ``` </details> <details> <summary><b>Windows</b></summary> 1. Network Settings → Change adapter options 2. Right-click adapter → Properties 3. IPv4 → Properties → Use DNS: `192.168.2.83` </details> <details> <summary><b>Linux</b></summary> `

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Act 3: Cross-Node Communication

*Flannel and VXLAN troubles*

Let's talk about flannel and vxlan troubles.

Cloudflare Free Domain Options for eldertree This guide covers free domain options available through Cloudflare for your eldertree k3s cluster. Overview Cloudflare offers several options for getting domains for your eldertree cluster: 1. **Cloudflare Registrar** - Free domain registration (limited TLDs) 2. **Cloudflare DNS** - Free DNS management for existing domains 3. **Cloudflare Tunnel** - Free tunnel service (no port forwarding needed) Option 1: Cloudflare Registrar (Free Domai

[Expand with specific details, commands, and personal commentary]

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

**Lesson 1: Check the Firewall First**

UFW can silently drop packets with no logs.

[pause]

**Lesson 2: DNS is Everything**

When DNS breaks, everything breaks.

[pause]

---

### Closing

[Music swells slightly]

And that's a wrap on Episode 3: Network Nightmares.

In the next episode, we'll tackle The Flux Bootstrap: GitOps with Flux CD. Trust me, you won't want to miss it.

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

*Episode generated: 2026-01-13 20:38*

*This is a draft script. Please review and expand with personal commentary before recording.*