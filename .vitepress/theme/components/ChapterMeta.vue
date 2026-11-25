<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { data as chapters } from "../chapters.data";

/** Chip row above a chapter's H1 (doc-before slot). Renders nothing elsewhere. */
const { page } = useData();

const entry = computed(() => {
  const path = page.value.relativePath.replace(/\.md$/, "");
  if (!path.startsWith("chapters/")) return undefined;
  return chapters.find((c) => c.slug === path.slice("chapters/".length));
});
</script>

<template>
  <p v-if="entry" class="et-meta">
    <span v-if="entry.kind" class="et-meta__chip" :class="`et-meta__chip--${entry.kind}`">{{ entry.kind }}</span>
    <span class="et-meta__chip">{{ entry.label.toLowerCase() }}</span>
    <span class="et-meta__chip">{{ entry.minutes }} min read</span>
    <span v-for="tag in entry.tags" :key="tag" class="et-meta__tag">#{{ tag.toLowerCase() }}</span>
  </p>
</template>

<style scoped>
.et-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  font-family: var(--et-mono);
  font-size: 12px;
}

.et-meta__chip {
  padding: 3px 8px;
  border: 1px solid var(--et-border);
  border-radius: 4px;
  color: var(--et-text-3);
}

.et-meta__chip--incident { color: var(--et-incident); border-color: color-mix(in srgb, var(--et-incident) 45%, transparent); }
.et-meta__chip--audit { color: var(--et-audit); border-color: color-mix(in srgb, var(--et-audit) 45%, transparent); }
.et-meta__chip--build { color: var(--et-build); border-color: color-mix(in srgb, var(--et-build) 45%, transparent); }
.et-meta__chip--decision { color: var(--et-decision); border-color: color-mix(in srgb, var(--et-decision) 45%, transparent); }

.et-meta__tag {
  color: var(--et-text-3);
}
</style>
