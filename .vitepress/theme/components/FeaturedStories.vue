<script setup lang="ts">
import { journeyHighlights } from "../../../data/cluster";

const featured = journeyHighlights.slice(0, 6);
</script>

<template>
  <section class="featured" aria-label="Featured stories">
    <h2 class="featured__title">Featured stories</h2>
    <p class="featured__lead">
      Chapters from the build diary — plus runbook links when the fix lives in ops docs, not prose.
    </p>
    <ul class="featured__list">
      <li v-for="card in featured" :key="card.title" class="featured__card">
        <h3>{{ card.title }}</h3>
        <p>{{ card.summary }}</p>
        <div class="featured__footer">
          <span v-for="tag in card.tags" :key="tag" class="glance__chip">{{ tag }}</span>
          <a v-if="'chapter' in card && card.chapter" :href="card.chapter">Read chapter →</a>
          <a
            v-if="'runbook' in card && card.runbook"
            :href="card.runbook"
            target="_blank"
            rel="noopener noreferrer"
          >Runbook →</a>
        </div>
      </li>
    </ul>
  </section>
</template>
