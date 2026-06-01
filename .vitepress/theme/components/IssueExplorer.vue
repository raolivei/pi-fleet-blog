<script setup lang="ts">
import { computed, ref } from "vue";
import { BookOpen, GitBranch, Search } from "lucide-vue-next";
import { journeyHighlights } from "../../../data/cluster";
import runbookData from "../../../data/runbook-issues.json";
import journeyStats from "../../../data/journey-stats.json";

type Tab = "runbook" | "journey";

const tab = ref<Tab>("runbook");
const query = ref("");
const category = ref("all");

const categories = computed(() => {
  const set = new Set(runbookData.issues.map((i) => i.category));
  return ["all", ...[...set].sort()];
});

const filteredRunbook = computed(() => {
  const q = query.value.trim().toLowerCase();
  return runbookData.issues.filter((issue) => {
    if (category.value !== "all" && issue.category !== category.value) return false;
    if (!q) return true;
    return (
      issue.id.toLowerCase().includes(q) ||
      issue.title.toLowerCase().includes(q) ||
      issue.symptoms.some((s) => s.toLowerCase().includes(q))
    );
  });
});

const filteredJourney = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return journeyHighlights;
  return journeyHighlights.filter(
    (h) =>
      h.title.toLowerCase().includes(q) ||
      h.summary.toLowerCase().includes(q) ||
      h.tags.some((t) => t.toLowerCase().includes(q)),
  );
});

function severityClass(severity: string) {
  return `ecc-severity ecc-severity--${severity}`;
}
</script>

<template>
  <section class="ecc-panel">
    <div class="ecc-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'runbook'"
        class="ecc-tab"
        :class="{ 'ecc-tab--active': tab === 'runbook' }"
        @click="tab = 'runbook'"
      >
        <BookOpen class="ecc-icon ecc-icon--inline" aria-hidden="true" />
        Runbook ({{ runbookData.count }})
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'journey'"
        class="ecc-tab"
        :class="{ 'ecc-tab--active': tab === 'journey' }"
        @click="tab = 'journey'"
      >
        <GitBranch class="ecc-icon ecc-icon--inline" aria-hidden="true" />
        Journey highlights
      </button>
    </div>

    <p v-if="tab === 'runbook'" class="ecc-panel__lead">
      Curated playbooks in
      <a href="https://docs.eldertree.xyz/runbook/" target="_blank" rel="noopener noreferrer">eldertree-docs</a>.
      Not the same as the {{ journeyStats.problemsSolved }} “fix” commits in git history.
    </p>
    <p v-else class="ecc-panel__lead">
      Selected war stories from this blog — not a dump of every heuristic “problem” commit.
    </p>

    <div class="ecc-search">
      <Search class="ecc-icon ecc-icon--muted" aria-hidden="true" />
      <input
        v-model="query"
        type="search"
        class="ecc-search__input"
        :placeholder="tab === 'runbook' ? 'Search runbook ID, title, symptoms…' : 'Search journey cards…'"
      />
      <select v-if="tab === 'runbook'" v-model="category" class="ecc-search__select" aria-label="Category">
        <option v-for="c in categories" :key="c" :value="c">
          {{ c === "all" ? "All categories" : c }}
        </option>
      </select>
    </div>

    <ul v-if="tab === 'runbook'" class="ecc-issue-list">
      <li v-for="issue in filteredRunbook" :key="issue.id" class="ecc-issue">
        <a :href="issue.url" target="_blank" rel="noopener noreferrer" class="ecc-issue__link">
          <span class="ecc-issue__id">{{ issue.id }}</span>
          <span :class="severityClass(issue.severity)">{{ issue.severity }}</span>
        </a>
        <p class="ecc-issue__title">{{ issue.title }}</p>
        <p v-if="issue.symptoms.length" class="ecc-issue__symptoms">
          {{ issue.symptoms[0] }}
        </p>
        <span class="ecc-chip ecc-chip--sm">{{ issue.category }}</span>
      </li>
    </ul>
    <p v-if="tab === 'runbook' && filteredRunbook.length === 0" class="ecc-muted">No matching runbook issues.</p>

    <ul v-if="tab === 'journey'" class="ecc-journey-list">
      <li v-for="card in filteredJourney" :key="card.title" class="ecc-journey-card">
        <h4>{{ card.title }}</h4>
        <p>{{ card.summary }}</p>
        <div class="ecc-journey-card__footer">
          <span v-for="tag in card.tags" :key="tag" class="ecc-chip ecc-chip--sm">{{ tag }}</span>
          <a
            v-if="'runbook' in card && (card as { runbook?: string }).runbook"
            :href="(card as { runbook: string }).runbook"
            target="_blank"
            rel="noopener noreferrer"
          >Runbook</a>
          <a :href="card.chapter">Chapter →</a>
        </div>
      </li>
    </ul>
  </section>
</template>
