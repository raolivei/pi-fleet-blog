<script setup lang="ts">
import HomeNarrative from "./HomeNarrative.vue";

const startCards = [
  {
    href: "/chapters/01-vision",
    label: "Read the journey",
    title: "Chapter 1 — The Vision",
    desc: "Why self-host on ARM, what runs on the cluster, and how the story is organized.",
  },
  {
    href: "/podcast",
    label: "Listen",
    title: "Building Eldertree podcast",
    desc: "Ten episodes — hardware, HA, Vault, and the disasters in between.",
  },
  {
    href: "https://docs.eldertree.xyz/runbook/",
    label: "When something breaks",
    title: "Eldertree runbook",
    desc: "Procedures on docs.eldertree.xyz — not duplicated here.",
    external: true,
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
          Chapters, war stories, and podcast — real failures, real fixes, no cloud rent.
        </p>
        <div class="home-hero__actions">
          <a class="home-btn home-btn--brand" href="/chapters/01-vision">Start reading</a>
          <a class="home-btn home-btn--ghost" href="/chapters/16-the-great-deployment-disaster-of-2026">War stories</a>
          <a class="home-btn home-btn--ghost" href="/podcast">Audio series</a>
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

    <section class="home-section home-section--compact" aria-labelledby="podcast-heading">
      <h2 id="podcast-heading" class="home-section__title">Podcast</h2>
      <p class="home-prose">
        <strong>Building Eldertree</strong> is a documentary-style audio series (10 episodes)
        that follows the same arc as the written chapters. See the
        <a href="/podcast">podcast page</a> for the episode list.
      </p>
      <p class="home-meta-links">
        <a href="/chapters/">Browse all chapters</a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/raolivei/pi-fleet">pi-fleet on GitHub</a>
      </p>
    </section>

    <section class="home-section home-section--compact" aria-labelledby="why-heading">
      <h2 id="why-heading" class="home-section__title">Why Eldertree?</h2>
      <p class="home-prose">
        The name reflects the stability I wanted from this foundation — an
        <strong>elder tree</strong> that weathered storms and supported everything built on top.
        <strong>Eldertree</strong> is a three-node K3s cluster on Raspberry Pi 5 hardware in a
        portable open-frame tower. This site is the build diary; the runbook and ops consoles
        live elsewhere.
      </p>
    </section>
  </div>
</template>
