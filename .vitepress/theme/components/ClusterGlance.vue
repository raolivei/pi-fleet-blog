<script setup lang="ts">
import { ExternalLink } from "lucide-vue-next";
import { cluster } from "../../../data/cluster";

const opsLinks = [
  { label: "Runbook", href: "https://docs.eldertree.xyz/runbook/", external: true },
  { label: "Project docs", href: "https://docs.eldertree.xyz/project", external: true },
  {
    label: "Live metrics (LAN)",
    href: "https://grafana.eldertree.local/d/eldertree-ops-home",
    external: true,
  },
] as const;
</script>

<template>
  <section class="glance" aria-label="Cluster at a glance">
    <h2 class="glance__title">Cluster at a glance</h2>
    <p class="glance__lead">
      {{ cluster.k3sVersion }} · {{ cluster.hardware }}.
      <a href="https://docs.eldertree.xyz/project" target="_blank" rel="noopener noreferrer">Full topology →</a>
    </p>

    <div class="glance__nodes">
      <article
        v-for="node in cluster.nodes"
        :key="node.id"
        class="glance__node"
        :class="{ 'glance__node--unstable': node.tier === 'unstable' }"
      >
        <strong>{{ node.id }}</strong>
        <span class="glance__badge" :class="`glance__badge--${node.tier}`">{{ node.tier }}</span>
        <code class="glance__ip">{{ node.wlan0 }}</code>
      </article>
    </div>

    <div class="glance__vips">
      <span v-for="v in cluster.vips" :key="v.ip" class="glance__vip">
        <span class="glance__vip-label">{{ v.label }}</span>
        <code>{{ v.ip }}</code>
      </span>
    </div>

    <p class="glance__ops-label">When something breaks</p>
    <div class="glance__links">
      <a
        v-for="link in opsLinks"
        :key="link.href"
        :href="link.href"
        class="glance__link"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noopener noreferrer' : undefined"
      >
        {{ link.label }}
        <ExternalLink class="glance__icon-inline" aria-hidden="true" />
      </a>
    </div>
  </section>
</template>
