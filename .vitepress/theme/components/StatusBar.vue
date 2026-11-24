<script setup lang="ts">
import { computed } from "vue";
import { useClusterNodeStatus } from "../composables/useClusterNodeStatus";

/** One-line cluster status above the nav (layout-top slot, 32px tall). */
const { displayNodes, source, lastUpdated, checked } = useClusterNodeStatus();

const sourceLabel = computed(() => {
  if (!checked.value) return "checking…";
  if (source.value === "live") return "live";
  if (source.value === "cached" && lastUpdated.value) {
    return `cached ${lastUpdated.value.slice(0, 10)}`;
  }
  return source.value === "cached" ? "cached" : "status unavailable";
});

const readinessText = { ready: "Ready", "not-ready": "Not ready", unknown: "Unknown" } as const;
</script>

<template>
  <div class="et-status" role="status" aria-label="Eldertree cluster status">
    <div class="et-status__inner">
      <span class="et-status__name">eldertree</span>
      <span
        v-for="node in displayNodes"
        :key="node.id"
        class="et-status__node"
        :class="`et-status__node--${node.readiness}`"
      >
        <span class="et-status__dot" aria-hidden="true" />
        {{ node.id }} <span class="et-status__state">{{ readinessText[node.readiness] }}</span>
      </span>
      <span class="et-status__spacer" />
      <span class="et-status__source">{{ sourceLabel }}</span>
      <a class="et-status__link" href="https://control.eldertree.xyz/" target="_blank" rel="noopener noreferrer">control center ↗</a>
    </div>
  </div>
</template>

<style scoped>
.et-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: calc(var(--vp-z-index-nav) + 1);
  height: var(--vp-layout-top-height);
  border-bottom: 1px solid var(--et-border-soft);
  background: var(--et-surface);
  font-family: var(--et-mono);
  font-size: 12px;
  color: var(--et-text-3);
}

.et-status__inner {
  height: 100%;
  max-width: calc(var(--vp-layout-max-width) - 64px);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  white-space: nowrap;
}

.et-status__name {
  color: var(--et-text);
}

.et-status__node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.et-status__dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--et-text-3);
}

.et-status__node--ready .et-status__dot {
  background: var(--et-accent);
}

.et-status__node--not-ready .et-status__dot {
  background: var(--et-incident);
}

.et-status__node--not-ready .et-status__state {
  color: var(--et-incident);
}

.et-status__spacer {
  flex: 1;
}

.et-status__link {
  color: var(--et-accent);
  text-decoration: none;
}

.et-status__link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .et-status__inner {
    gap: 10px;
    padding: 0 16px;
  }

  .et-status__state,
  .et-status__link {
    display: none;
  }
}
</style>
