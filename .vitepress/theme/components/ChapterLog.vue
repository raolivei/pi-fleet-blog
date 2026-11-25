<script setup lang="ts">
import { withBase } from "vitepress";
import { data as chapters } from "../chapters.data";
</script>

<template>
  <div class="et-log">
    <div class="et-log__scroll">
      <div class="et-log__head" aria-hidden="true">
        <span>CH</span><span>KIND</span><span>TITLE</span><span>READ</span>
      </div>
      <ol class="et-log__list">
        <li v-for="c in chapters" :key="c.slug">
          <a class="et-log__row" :href="withBase(c.url)">
            <span class="et-log__n">{{ c.number || "—" }}</span>
            <span class="et-log__kind" :class="c.kind && `et-kind--${c.kind}`">{{ c.kind ?? (c.number ? "story" : "interlude") }}</span>
            <span class="et-log__title">
              <span v-if="!c.number" class="et-log__label">Interlude · </span>{{ c.title }}
            </span>
            <span class="et-log__min">{{ c.minutes }} min</span>
          </a>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.et-log {
  border: 1px solid var(--et-border);
  border-radius: 8px;
  background: var(--et-surface);
  overflow: hidden;
}

.et-log__scroll {
  overflow-x: auto;
}

.et-log__head,
.et-log__row {
  display: grid;
  grid-template-columns: 52px 104px minmax(0, 1fr) 72px;
  gap: 12px;
  align-items: baseline;
  padding: 12px 16px;
  min-width: 560px;
}

.et-log__head {
  border-bottom: 1px solid var(--et-border);
  font-family: var(--et-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--et-text-3);
}

.et-log__list {
  list-style: none;
  margin: 0 !important;
  padding: 0 !important;
}

.et-log__list li {
  margin: 0 !important;
  border-bottom: 1px solid var(--et-border-soft);
}

.et-log__list li:last-child {
  border-bottom: 0;
}

.et-log__row {
  color: var(--et-text) !important;
  text-decoration: none !important;
  font-weight: 400 !important;
  font-size: 15px;
  line-height: 1.45;
}

.et-log__row:hover {
  background: var(--et-surface-2);
}

.et-log__row:hover .et-log__title {
  color: var(--et-accent);
}

.et-log__n,
.et-log__kind,
.et-log__min {
  font-family: var(--et-mono);
  font-size: 12px;
  color: var(--et-text-3);
}

.et-log__n {
  font-size: 13px;
}

.et-log__label {
  color: var(--et-text-3);
}

.et-log__min {
  text-align: right;
}

.et-kind--incident { color: var(--et-incident); }
.et-kind--audit { color: var(--et-audit); }
.et-kind--build { color: var(--et-build); }
.et-kind--decision { color: var(--et-decision); }
</style>
