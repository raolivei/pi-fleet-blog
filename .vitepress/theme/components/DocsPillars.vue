<script setup lang="ts">
import { docPillars } from "../../../data/cluster";
import { Layers } from "lucide-vue-next";
</script>

<template>
  <section class="ecc-panel ecc-panel--pillars">
    <h3 class="ecc-panel__title">
      <Layers class="ecc-icon ecc-icon--inline" aria-hidden="true" />
      Documentation map
    </h3>
    <p class="ecc-panel__lead">
      Blog chapters and runbook cross-links — same mental model as
      <a href="https://docs.eldertree.xyz/project" target="_blank" rel="noopener noreferrer">docs.eldertree.xyz</a>.
    </p>

    <div class="ecc-pillars">
      <article v-for="pillar in docPillars" :key="pillar.id" class="ecc-pillar">
        <h4>{{ pillar.title }}</h4>
        <p class="ecc-muted">{{ pillar.description }}</p>
        <div class="ecc-pillar__group">
          <span class="ecc-pillar__label">Chapters</span>
          <ul>
            <li v-for="ch in pillar.chapters" :key="ch.href">
              <a :href="ch.href">{{ ch.label }}</a>
            </li>
          </ul>
        </div>
        <div class="ecc-pillar__group">
          <span class="ecc-pillar__label">Runbooks</span>
          <ul>
            <li v-for="rb in pillar.runbooks" :key="rb.href">
              <a :href="rb.href" target="_blank" rel="noopener noreferrer">{{ rb.label }}</a>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
