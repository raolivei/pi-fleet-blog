---
title: kube-vip leader failover instability
category: Networking
severity: High
resolved: true
date: 2026-05-15
---

Root cause was ARP timing on the Bell hub during simultaneous node reboots. kube-vip reclaimed VIP after second election round.
