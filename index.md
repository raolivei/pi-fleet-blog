---
layout: home

hero:
  name: Building Eldertree
  text: A Raspberry Pi Kubernetes journey
  tagline: The documented build diary — chapters, war stories, and podcast. Real failures, real fixes, no cloud rent.
  image:
    src: /banner.svg
    alt: Eldertree — circuit tree with three HA nodes
  actions:
    - theme: brand
      text: Start reading
      link: /chapters/01-vision
    - theme: alt
      text: War stories
      link: /chapters/16-the-great-deployment-disaster-of-2026
    - theme: alt
      text: Audio series
      link: /podcast
---

<div class="vp-doc">

## Start here

<div class="start-here">

<a class="start-card" href="/chapters/01-vision">
  <span class="start-card__label">Read the journey</span>
  <span class="start-card__title">Chapter 1 — The Vision</span>
  <span class="start-card__desc">Why self-host on ARM, what runs on the cluster, and how the story is organized.</span>
</a>

<a class="start-card" href="/podcast">
  <span class="start-card__label">Listen</span>
  <span class="start-card__title">Building Eldertree podcast</span>
  <span class="start-card__desc">Ten episodes — hardware, HA, Vault, and the disasters in between.</span>
</a>

<a class="start-card" href="https://docs.eldertree.xyz/runbook/" target="_blank" rel="noopener noreferrer">
  <span class="start-card__label">When something breaks</span>
  <span class="start-card__title">Eldertree runbook</span>
  <span class="start-card__desc">Procedures and playbooks on docs.eldertree.xyz — not duplicated here.</span>
</a>

</div>

<HomeNarrative />

## Podcast

**Building Eldertree** is a documentary-style audio series (10 episodes) that follows the same arc as the written chapters — from first boot through production. Episode scripts and show notes are in the [podcast folder on GitHub](https://github.com/raolivei/pi-fleet-blog/tree/main/podcast).

<p class="glance__lead"><a href="/chapters/">Browse all chapters</a> · <a href="https://github.com/raolivei/pi-fleet">pi-fleet on GitHub</a></p>

## Why Eldertree?

The name reflects the stability I wanted from this foundation — an **elder tree** that weathered storms and supported everything built on top. **Eldertree** is a three-node K3s cluster on Raspberry Pi 5 hardware in a portable open-frame tower: self-hosted apps, Vault for secrets, Flux for GitOps, and Grafana when I need live metrics. This site is the **build diary**; the runbook and ops consoles live elsewhere.

</div>
