<script setup lang="ts">
import HomeNarrative from "./HomeNarrative.vue";
import { cluster } from "../../../data/cluster";

const chapters = [
  { number: "01", title: "The Moment I Decided to Own My Infrastructure", slug: "01-the-moment-i-decided-to-own-my-infrastructure" },
  { number: "11", title: "The Control Center", slug: "11-the-control-center" },
  { number: "12", title: "The Tuesday Night Apocalypse", slug: "12-tuesday-night-apocalypse" },
  { number: "14", title: "The Ticket Was Real", slug: "14-the-ticket-was-real" },
];
</script>

<template>
  <div class="eldertree-home">
    <header class="home-hero">
      <div>
        <p class="notebook-label">Build diary / Rafael Oliveira</p>
        <h1>Building <span>Eldertree</span></h1>
        <p class="home-hero__tagline">I was paying monthly rent for my own data. So I bought three Raspberry Pi 5s and built Kubernetes in my living room.</p>
        <a class="notebook-link" :href="`/chapters/${chapters[0].slug}`">Start with chapter 1 →</a>
      </div>
      <figure class="pi-rack">
        <figcaption class="notebook-label">Raspberry Pi 5 · cluster layout</figcaption>
        <ul>
          <li v-for="node in cluster.nodes" :key="node.id"><i aria-hidden="true" />{{ node.id }}</li>
        </ul>
      </figure>
    </header>

    <section class="notebook-index" aria-label="From the build diary">
      <div class="notebook-pick">
        <p class="notebook-label">Chapter 11</p>
        <h2>The Control Center</h2>
        <p>Grafana had the graphs. I wanted somewhere to start when I didn’t know which graph to open.</p>
        <a class="notebook-link" href="/chapters/11-the-control-center">Read the chapter →</a>
      </div>
      <div>
        <ul class="notebook-chapters">
          <li v-for="chapter in chapters" :key="chapter.slug">
            <a :href="`/chapters/${chapter.slug}`"><span class="notebook-label">{{ chapter.number }}</span>{{ chapter.title }}<span aria-hidden="true">→</span></a>
          </li>
        </ul>
        <a class="notebook-link" href="/chapters/">Browse all chapters →</a>
      </div>
    </section>

    <HomeNarrative />

    <section class="home-section home-section--compact" aria-labelledby="why-heading">
      <h2 id="why-heading" class="home-section__title">Why Eldertree?</h2>
      <p class="home-prose">
        The name reflects the stability I wanted from this foundation — an
        <strong>elder tree</strong> that weathered storms and supported everything built on top.
        <strong>Eldertree</strong> is a three-node K3s cluster on Raspberry Pi 5 hardware in a
        portable open-frame tower. This site is the build diary; the
        <a href="https://docs.eldertree.xyz/">Runbook</a> covers setup and operations, and the
        <a href="https://control.eldertree.xyz/">Control Center</a> shows the live cluster.
      </p>
      <p class="home-meta-links">
        <a href="/chapters/">Browse all chapters</a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/raolivei/pi-fleet">pi-fleet on GitHub</a>
      </p>
    </section>
  </div>
</template>
