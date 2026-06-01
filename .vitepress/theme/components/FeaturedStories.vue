<script setup lang="ts">
import { journeyHighlights } from "../../../data/cluster";

const featured = journeyHighlights.slice(0, 6);
</script>

<template>
  <section class="featured" aria-label="Featured stories">
    <h2 class="featured__title">Featured stories</h2>
    <p class="featured__lead">War stories and turning points from the build diary — not a git commit dump.</p>
    <ul class="featured__list">
      <li v-for="card in featured" :key="card.title" class="featured__card">
        <h3>{{ card.title }}</h3>
        <p>{{ card.summary }}</p>
        <div class="featured__footer">
          <span v-for="tag in card.tags" :key="tag" class="glance__chip">{{ tag }}</span>
          <a
            v-if="'runbook' in card && (card as { runbook?: string }).runbook"
            :href="(card as { runbook: string }).runbook"
            target="_blank"
            rel="noopener noreferrer"
          >Runbook</a>
          <a :href="card.chapter">Read chapter →</a>
        </div>
      </li>
    </ul>
  </section>
</template>
