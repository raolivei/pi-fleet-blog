<script setup lang="ts">
import { computed } from "vue";
import { Server, ExternalLink } from "lucide-vue-next";
import { cluster } from "../../../data/cluster";
import journeyStats from "../../../data/journey-stats.json";

const stats = computed(() => [
  { label: "Commits", value: journeyStats.commits },
  { label: "Pull requests", value: journeyStats.pullRequests },
  {
    label: "Fix commits (heuristic)",
    value: journeyStats.problemsSolved,
    hint: journeyStats.methodology.problems,
  },
  { label: "Features (heuristic)", value: journeyStats.featuresAdded },
]);
</script>

<template>
  <header class="ecc-header">
    <div class="ecc-header__title-row">
      <Server class="ecc-icon ecc-icon--brand" aria-hidden="true" />
      <div>
        <h2 class="ecc-header__title">{{ cluster.name }} Control Center</h2>
        <p class="ecc-header__sub">
          {{ cluster.k3sVersion }} · {{ cluster.os }} · {{ cluster.hardware }}
        </p>
      </div>
      <span class="ecc-badge ecc-badge--live">Production</span>
    </div>

    <div class="ecc-stats">
      <div v-for="s in stats" :key="s.label" class="ecc-stat" :title="s.hint">
        <span class="ecc-stat__value">{{ s.value }}</span>
        <span class="ecc-stat__label">{{ s.label }}</span>
      </div>
    </div>

    <div class="ecc-vips">
      <span v-for="v in cluster.vips" :key="v.ip" class="ecc-vip">
        <span class="ecc-vip__label">{{ v.label }}</span>
        <code>{{ v.ip }}</code>
        <span class="ecc-vip__purpose">{{ v.purpose }}</span>
      </span>
    </div>

    <div class="ecc-links">
      <a
        v-for="link in cluster.links"
        :key="link.href"
        :href="link.href"
        class="ecc-link"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noopener noreferrer' : undefined"
      >
        {{ link.label }}
        <ExternalLink v-if="link.external" class="ecc-icon ecc-icon--inline" aria-hidden="true" />
      </a>
    </div>
  </header>
</template>
