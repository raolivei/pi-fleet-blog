<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

/**
 * Renders a chapter's optional `record:` frontmatter as a summary panel.
 * Use it in the Markdown right after the H1: <RecordPanel />
 *
 *   record:
 *     observed: "…"
 *     confirmed: "…"
 *     changed: "…"
 *     verified: "…"
 *     not_demonstrated: "…"
 *     unknown: "…"
 *
 * Every field is optional; empty fields are left out.
 */
const FIELDS = [
  { key: "observed", label: "Observed", tone: "decision" },
  { key: "confirmed", label: "Confirmed", tone: "build" },
  { key: "changed", label: "Changed", tone: "audit" },
  { key: "verified", label: "Verified", tone: "build" },
  { key: "not_demonstrated", label: "Not demonstrated", tone: "incident" },
  { key: "unknown", label: "Unknown", tone: "incident" },
] as const;

const { frontmatter } = useData();

const rows = computed(() => {
  const record = frontmatter.value.record ?? {};
  return FIELDS.filter((f) => typeof record[f.key] === "string" && record[f.key].trim()).map((f) => ({
    ...f,
    text: record[f.key] as string,
  }));
});
</script>

<template>
  <section v-if="rows.length" class="et-record" aria-label="Record: the short version">
    <header class="et-record__head">
      <p class="et-record__title">Record</p>
      <span class="et-record__hint">the short version — the story follows</span>
    </header>
    <dl class="et-record__grid">
      <div v-for="row in rows" :key="row.key" class="et-record__cell">
        <dt class="et-record__label" :class="`et-tone--${row.tone}`">
          <span class="et-record__dot" aria-hidden="true" />{{ row.label }}
        </dt>
        <dd class="et-record__text">{{ row.text }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.et-record {
  margin: 28px 0 40px;
  border: 1px solid var(--et-border);
  border-radius: 10px;
  background: var(--et-surface);
  overflow: hidden;
}

.et-record__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--et-border);
  font-family: var(--et-mono);
  font-size: 12px;
}

.vp-doc .et-record__title {
  line-height: 1.5;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--et-text-3);
}

.et-record__hint {
  color: var(--et-text-3);
}

.et-record__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin: 0;
}

.et-record__cell {
  padding: 14px 18px;
  border-bottom: 1px solid var(--et-border-soft);
  border-right: 1px solid var(--et-border-soft);
}

.et-record__label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--et-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.et-record__dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: currentColor;
}

.et-record__text {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--et-text-2);
}

.et-tone--incident { color: var(--et-incident); }
.et-tone--audit { color: var(--et-audit); }
.et-tone--build { color: var(--et-build); }
.et-tone--decision { color: var(--et-decision); }
</style>
