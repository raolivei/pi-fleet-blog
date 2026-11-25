<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { data as chapters } from "../chapters.data";

/**
 * Previous / next chapter links (doc-footer-before slot). VitePress builds its own
 * pager from the sidebar, which chapters no longer have, so this one follows
 * chapter numbers from chapters.data instead. Interludes link back to the log.
 */
const { page } = useData();

const numbered = computed(() =>
  chapters.filter((c) => c.number).sort((a, b) => Number(a.number) - Number(b.number)),
);

const nav = computed(() => {
  const path = page.value.relativePath.replace(/\.md$/, "");
  if (!path.startsWith("chapters/") || path === "chapters/index") return undefined;
  const slug = path.slice("chapters/".length);
  const i = numbered.value.findIndex((c) => c.slug === slug);
  if (i === -1) {
    return chapters.some((c) => c.slug === slug) ? { prev: undefined, next: undefined } : undefined;
  }
  return { prev: numbered.value[i - 1], next: numbered.value[i + 1] };
});
</script>

<template>
  <nav v-if="nav" class="et-pager" aria-label="Chapter navigation">
    <a v-if="nav.prev" class="et-pager__link" :href="withBase(nav.prev.url)">
      <span class="et-pager__dir">← {{ nav.prev.label.toLowerCase() }}</span>
      <span class="et-pager__title">{{ nav.prev.title }}</span>
    </a>
    <span v-else />
    <a v-if="nav.next" class="et-pager__link et-pager__link--next" :href="withBase(nav.next.url)">
      <span class="et-pager__dir">{{ nav.next.label.toLowerCase() }} →</span>
      <span class="et-pager__title">{{ nav.next.title }}</span>
    </a>
    <a v-else class="et-pager__link et-pager__link--next" :href="withBase('/chapters/')">
      <span class="et-pager__dir">all chapters →</span>
      <span class="et-pager__title">The chapter log</span>
    </a>
  </nav>
</template>

<style scoped>
.et-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 56px;
}

.et-pager__link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--et-border);
  border-radius: 6px;
  text-decoration: none;
}

.et-pager__link:hover {
  border-color: var(--et-accent);
}

.et-pager__link--next {
  text-align: right;
}

.et-pager__dir {
  font-family: var(--et-mono);
  font-size: 11px;
  color: var(--et-text-3);
}

.et-pager__title {
  font-family: var(--et-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--et-text);
}

.et-pager__link:hover .et-pager__title {
  color: var(--et-accent);
}

@media (max-width: 560px) {
  .et-pager {
    grid-template-columns: 1fr;
  }

  .et-pager__link--next {
    text-align: left;
  }
}
</style>
