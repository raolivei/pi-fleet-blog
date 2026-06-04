<script setup lang="ts">
import { ExternalLink } from "lucide-vue-next";
import { cluster } from "../../../data/cluster";
import { useClusterNodeStatus } from "../composables/useClusterNodeStatus";

const { displayNodes, source, lastUpdated } = useClusterNodeStatus();

const opsLinks = [
  {
    label: "Control Center (LAN)",
    href: "https://control.eldertree.local",
    external: true,
  },
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
      <span v-if="source === 'live'" class="glance__live" title="Node badges from cluster API"> · live</span>
      <span
        v-else
        class="glance__static"
        title="Cluster API unreachable; showing last known or static status"
      >
        · cached
      </span>
    </p>

    <div class="glance__nodes">
      <article
        v-for="node in displayNodes"
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
        <ExternalLink v-if="link.external" class="glance__icon-inline" aria-hidden="true" />
      </a>
    </div>
    <p v-if="lastUpdated" class="glance__updated">Status as of {{ lastUpdated }} UTC</p>
  </section>
</template>
