---
layout: home

hero:
  name: Building Eldertree
  text: A Journey in Self-Hosted Kubernetes
  tagline: Documenting the complete journey of building a production-ready K3s cluster on Raspberry Pi hardware — from first boot to GitOps automation.
  image:
    src: /banner.svg
    alt: Eldertree Cluster Infrastructure
  actions:
    - theme: brand
      text: Start Reading →
      link: /chapters/01-vision
    - theme: alt
      text: View on GitHub
      link: https://github.com/raolivei/pi-fleet
---

<div class="vp-doc">

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

## About This Project

**Eldertree** is a self-hosted Kubernetes cluster running on Raspberry Pi hardware. This blog documents the complete journey from initial concept to a production-ready infrastructure that hosts multiple applications, manages secrets securely, and provides monitoring and observability.

Building a Kubernetes cluster on ARM hardware comes with unique challenges and decisions. This documentation serves as both a personal record and a resource for others embarking on similar journeys.

<div class="status-badge">Production Ready</div>

### Current Infrastructure

| Component | Details |
|-----------|---------|
| **Control Plane** | eldertree (192.168.2.83) |
| **Hardware** | Raspberry Pi 5 (8GB, ARM64) |
| **Operating System** | Debian 12 Bookworm |
| **Kubernetes** | K3s v1.33.5+k3s1 |
| **Storage** | NVMe SSD via USB 3.0 |

## What You'll Learn

- **Cluster Architecture** — Building a production-ready K3s cluster on resource-constrained ARM64 hardware
- **Secrets Management** — HashiCorp Vault integration with External Secrets Operator
- **GitOps Automation** — FluxCD for declarative infrastructure management
- **Networking** — Traefik ingress, Pi-hole DNS, and WireGuard VPN
- **Monitoring** — Prometheus, Grafana, and Loki on minimal resources
- **Troubleshooting** — Real-world problems and solutions from months of operation

## Quick Navigation

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">

<div class="nav-card">
  <h3>🚀 Getting Started</h3>
  <ul>
    <li><a href="/chapters/01-vision">Chapter 1: The Vision</a></li>
    <li><a href="/chapters/02-hardware-decisions">Chapter 2: Hardware Decisions</a></li>
    <li><a href="/chapters/05-cluster-setup">Chapter 5: Initial Cluster Setup</a></li>
  </ul>
</div>

<div class="nav-card">
  <h3>🔧 Core Infrastructure</h3>
  <ul>
    <li><a href="/chapters/06-networking-architecture">Chapter 6: Networking Architecture</a></li>
    <li><a href="/chapters/07-secrets-management">Chapter 7: Secrets Management</a></li>
    <li><a href="/chapters/08-dns-service-discovery">Chapter 8: DNS & Service Discovery</a></li>
  </ul>
</div>

<div class="nav-card">
  <h3>📊 Operations</h3>
  <ul>
    <li><a href="/chapters/09-monitoring-observability">Chapter 9: Monitoring</a></li>
    <li><a href="/chapters/10-gitops-fluxcd">Chapter 10: GitOps with FluxCD</a></li>
    <li><a href="/chapters/11-deploying-applications">Chapter 11: Deploying Apps</a></li>
  </ul>
</div>

</div>

---

**Why "Eldertree"?** The name reflects the wisdom and stability I hoped to build into this infrastructure — a foundational system that grows and supports other projects. Like an elder tree that has weathered storms and provided shelter, this cluster is designed to be resilient and support future growth.

</div>
