<script setup lang="ts">
import HomeNarrative from "./HomeNarrative.vue";

const startCards = [
  {
    href: "/chapters/01-the-moment-i-decided-to-own-my-infrastructure",
    label: "Start the journey",
    title: "The Moment I Decided to Own My Infrastructure",
    desc: "Why self-host on ARM, what ownership means, and how Eldertree started.",
  },
  {
    href: "/chapters/02-first-boot",
    label: "Chapter 2",
    title: "First Boot",
    desc: "Power-on, base OS setup, and building the foundation.",
  },
  {
    href: "/chapters/interlude-why-we-dropped-pihole-for-bind9",
    label: "Interlude",
    title: "Why we dropped Pi-hole for BIND9",
    desc: "June 2026 DNS cutover — kube-vip, ServiceLB, and the VIP story.",
  },
] as const;
</script>

<template>
  <div class="eldertree-home">
    <header class="home-hero">
      <div class="home-hero__copy">
        <p class="home-hero__eyebrow">Build diary</p>
        <h1 class="home-hero__title">Building Eldertree</h1>
        <p class="home-hero__subtitle">A Raspberry Pi Kubernetes journey</p>
        <p class="home-hero__tagline">
          I was paying monthly rent for my own data — so I bought three Raspberry Pi&nbsp;5s and
          built Kubernetes in my living room. This is the story of choosing ownership over convenience.
        </p>
        <div class="home-hero__actions">
          <a class="home-btn home-btn--brand" href="/chapters/01-the-moment-i-decided-to-own-my-infrastructure">Start reading</a>
          <a class="home-btn home-btn--ghost" href="/chapters/02-first-boot">Chapter 2</a>
          <a class="home-btn home-btn--ghost" href="https://control.eldertree.xyz" target="_blank" rel="noopener noreferrer">Control Center</a>
        </div>
      </div>
      <div class="home-hero__mark" aria-hidden="true">
        <img
          class="home-hero__logo"
          src="/logo-full.png"
          width="320"
          height="320"
          alt="eldertree — circuit tree with three cluster nodes"
        />
      </div>
    </header>

    <section class="home-section" aria-labelledby="start-heading">
      <h2 id="start-heading" class="home-section__title">Start here</h2>
      <div class="start-here">
        <a
          v-for="card in startCards"
          :key="card.href"
          class="start-card"
          :href="card.href"
          :target="card.external ? '_blank' : undefined"
          :rel="card.external ? 'noopener noreferrer' : undefined"
        >
          <span class="start-card__label">{{ card.label }}</span>
          <span class="start-card__title">{{ card.title }}</span>
          <span class="start-card__desc">{{ card.desc }}</span>
        </a>
      </div>
    </section>

    <HomeNarrative />

    <section class="home-section home-section--compact" aria-labelledby="why-heading">
      <h2 id="why-heading" class="home-section__title">Why Eldertree?</h2>
      <p class="home-prose">
        The name reflects the stability I wanted from this foundation — an
        <strong>elder tree</strong> that weathered storms and supported everything built on top.
        <strong>Eldertree</strong> is a three-node K3s cluster on Raspberry Pi 5 hardware in a
        portable open-frame tower. This site is the build diary; the runbook and ops consoles
        live elsewhere.
      </p>
      <p class="home-meta-links">
        <a href="/chapters/">Browse all chapters</a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/raolivei/pi-fleet">pi-fleet on GitHub</a>
      </p>
    </section>
  </div>
</template>
