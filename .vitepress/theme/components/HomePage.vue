<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as chapters } from "../chapters.data";
import ChapterLog from "./ChapterLog.vue";

const featured = computed(() =>
  chapters
    .filter((c) => c.rank !== undefined && c.rank <= 3)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
);

const first = computed(() => chapters.find((c) => c.number === "01"));
const latest = computed(() => chapters.find((c) => c.number));
</script>

<template>
  <div class="et-home">
    <section class="et-hero">
      <p class="et-hero__prompt">$ cat README.md</p>
      <h1 class="et-hero__title">Building Eldertree<span class="et-hero__cursor" aria-hidden="true">_</span></h1>
      <p class="et-hero__lede">
        A build diary for a three-node K3s cluster on Raspberry Pi&nbsp;5: the decisions, investigations and
        mistakes, including what I observed, what I could confirm, what I changed and what I still don't know.
        Procedures live in the <a href="https://docs.eldertree.xyz/">runbook</a>.
      </p>
      <div class="et-hero__actions">
        <a v-if="first" class="et-btn et-btn--brand" :href="withBase(first.url)">./start --chapter 1</a>
        <a v-if="latest" class="et-btn" :href="withBase(latest.url)">./latest — {{ latest.label.toLowerCase() }}</a>
      </div>
    </section>

    <section v-if="featured.length" class="et-section" aria-labelledby="et-featured">
      <h2 id="et-featured" class="et-section__title"># featured</h2>
      <div class="et-cards">
        <a v-for="s in featured" :key="s.slug" class="et-card" :href="withBase(s.url)">
          <span class="et-card__head">
            <span>{{ s.label.toLowerCase() }}</span>
            <span v-if="s.kind" :class="`et-kind--${s.kind}`">{{ s.kind }}</span>
          </span>
          <span class="et-card__title">{{ s.title }}</span>
          <span class="et-card__desc">{{ s.description }}</span>
          <span class="et-card__foot">{{ s.minutes }} min read →</span>
        </a>
      </div>
    </section>

    <section class="et-section" aria-labelledby="et-log">
      <h2 id="et-log" class="et-section__title">$ git log --chapters</h2>
      <ChapterLog />
    </section>

    <section class="et-section et-ecosystem" aria-label="Related Eldertree sites">
      <a href="https://docs.eldertree.xyz/" class="et-eco">
        <span class="et-eco__name">docs.eldertree.xyz</span>
        <span class="et-eco__desc">Runbook: symptoms, fixes and verification commands.</span>
      </a>
      <a href="https://control.eldertree.xyz/" class="et-eco">
        <span class="et-eco__name">control.eldertree.xyz</span>
        <span class="et-eco__desc">Control Center: node, workload and Flux status.</span>
      </a>
      <a href="https://github.com/raolivei/pi-fleet" class="et-eco">
        <span class="et-eco__name">github.com/raolivei/pi-fleet</span>
        <span class="et-eco__desc">The cluster as code: Ansible, Flux, Helm.</span>
      </a>
    </section>
  </div>
</template>

<style scoped>
.et-home {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 64px;
  color: var(--et-text);
}

.et-hero {
  padding: 72px 0 48px;
  border-bottom: 1px dashed var(--et-border);
}

.et-hero__prompt {
  margin: 0;
  font-family: var(--et-mono);
  font-size: 14px;
  color: var(--et-text-3);
}

.et-hero__title {
  margin: 14px 0 0;
  font-family: var(--et-mono);
  font-size: clamp(36px, 7vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  font-weight: 700;
  color: var(--et-text);
}

.et-hero__cursor {
  color: var(--et-accent);
  animation: et-blink 1.1s steps(1) infinite;
}

@keyframes et-blink {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .et-hero__cursor { animation: none; }
}

.et-hero__lede {
  margin: 18px 0 0;
  max-width: 680px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--et-text-2);
}

.et-hero__lede a {
  color: var(--et-accent);
  text-decoration: none;
}

.et-hero__lede a:hover {
  text-decoration: underline;
}

.et-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.et-btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--et-border);
  border-radius: 6px;
  font-family: var(--et-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--et-text);
  text-decoration: none;
}

.et-btn:hover {
  border-color: var(--et-accent);
}

.et-btn--brand {
  border-color: transparent;
  background: var(--et-accent);
  color: var(--vp-button-brand-text);
  font-weight: 600;
}

.et-btn--brand:hover {
  background: var(--et-accent-strong);
}

.et-section {
  padding-top: 48px;
}

.et-section__title {
  margin: 0 0 16px;
  font-family: var(--et-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--et-text-3);
}

.et-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.et-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--et-border);
  border-radius: 8px;
  background: var(--et-surface);
  color: var(--et-text);
  text-decoration: none;
  overflow: hidden;
  transition: border-color 0.15s;
}

.et-card:hover {
  border-color: var(--et-accent);
}

.et-card__head {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--et-border-soft);
  font-family: var(--et-mono);
  font-size: 12px;
  color: var(--et-text-3);
}

.et-card__title {
  padding: 18px 16px 0;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.et-card__desc {
  flex: 1;
  padding: 10px 16px 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--et-text-2);
}

.et-card__foot {
  padding: 16px;
  font-family: var(--et-mono);
  font-size: 12px;
  color: var(--et-text-3);
}

.et-ecosystem {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.et-eco {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 1px dashed var(--et-border);
  border-radius: 8px;
  text-decoration: none;
}

.et-eco:hover {
  border-style: solid;
  border-color: var(--et-accent);
}

.et-eco__name {
  font-family: var(--et-mono);
  font-size: 13px;
  color: var(--et-accent);
}

.et-eco__desc {
  font-size: 14px;
  color: var(--et-text-2);
}

.et-kind--incident { color: var(--et-incident); }
.et-kind--audit { color: var(--et-audit); }
.et-kind--build { color: var(--et-build); }
.et-kind--decision { color: var(--et-decision); }
</style>
