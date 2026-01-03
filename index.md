---
layout: home

hero:
  name: Building Eldertree
  text: A Journey in Self-Hosted Kubernetes
  tagline: A comprehensive diary of building a production-ready Kubernetes cluster on Raspberry Pi hardware
  image:
    src: /banner.svg
    alt: Eldertree Cluster
  actions:
    - theme: brand
      text: Start Reading
      link: /chapters/01-vision
    - theme: alt
      text: View Infrastructure
      link: https://github.com/raolivei/pi-fleet
---

## About This Blog

**Eldertree** is my self-hosted Kubernetes cluster running on Raspberry Pi hardware. This blog documents the complete journey from initial concept to a production-ready infrastructure that hosts multiple applications, manages secrets securely, and provides monitoring and observability.

**Why this blog?** Building a Kubernetes cluster on ARM hardware comes with unique challenges and decisions. This documentation serves as both a personal record and a resource for others embarking on similar journeys. Through **212 commits**, **45 pull requests**, and solving **92 problems**, this journey represents months of learning, troubleshooting, and iteration.

## The Journey in Numbers

<div class="stats-grid">

<div class="stat-card">
  <div class="stat-number">212</div>
  <div class="stat-label">Commits</div>
</div>

<div class="stat-card">
  <div class="stat-number">45</div>
  <div class="stat-label">Pull Requests</div>
</div>

<div class="stat-card">
  <div class="stat-number">92</div>
  <div class="stat-label">Problems Solved</div>
</div>

<div class="stat-card">
  <div class="stat-number">91</div>
  <div class="stat-label">Features Added</div>
</div>

</div>

## Current Status

- **Control Plane:** eldertree (192.168.2.83)
- **Hardware:** Raspberry Pi 5 (8GB, ARM64)
- **OS:** Debian 12 Bookworm
- **Kubernetes:** K3s v1.33.5+k3s1
- **Status:** ✅ Production-ready, hosting multiple services

## What You'll Learn

- How to build a production-ready Kubernetes cluster on Raspberry Pi
- ARM64 compatibility challenges and solutions
- Secrets management with Vault in production
- DNS architecture for local services
- Monitoring and observability on resource-constrained hardware
- GitOps workflows with FluxCD
- Troubleshooting strategies that actually work
- Lessons learned from real-world problems

## Quick Navigation

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">

<div class="nav-card">
  <h3>🚀 Getting Started</h3>
  <ul>
    <li><a href="/chapters/01-vision">Chapter 1: The Vision</a></li>
    <li><a href="/chapters/05-cluster-setup">Chapter 5: Initial Cluster Setup</a></li>
  </ul>
</div>

<div class="nav-card">
  <h3>🔧 Infrastructure</h3>
  <ul>
    <li>Chapter 7: Secrets Management <em>(Coming soon)</em></li>
    <li>Chapter 8: DNS and Service Discovery <em>(Coming soon)</em></li>
    <li>Chapter 9: Monitoring <em>(Coming soon)</em></li>
  </ul>
</div>

<div class="nav-card">
  <h3>📚 Learning</h3>
  <ul>
    <li>Chapter 14: Troubleshooting <em>(Coming soon)</em></li>
    <li>Appendix: Reference Materials <em>(Coming soon)</em></li>
  </ul>
</div>

</div>

---

**Cluster Name:** The name "eldertree" reflects the wisdom and stability I hoped to build into this infrastructure - a foundational system that grows and supports other projects. Like an elder tree that has weathered storms and provided shelter for generations, this cluster is designed to be resilient, learn from challenges, and support future growth.

Built with ❤️ documenting the eldertree Kubernetes cluster journey

