<script setup lang="ts">
import { cluster } from "../../../data/cluster";
import { AlertTriangle, CheckCircle2 } from "lucide-vue-next";
</script>

<template>
  <section class="ecc-panel">
    <h3 class="ecc-panel__title">Node topology</h3>
    <p class="ecc-panel__lead">
      Three-node HA control plane. <strong>node-1</strong> is deprioritized for new workloads (soft taint).
    </p>

    <div class="ecc-nodes">
      <article
        v-for="node in cluster.nodes"
        :key="node.id"
        class="ecc-node"
        :class="{ 'ecc-node--unstable': node.tier === 'unstable' }"
      >
        <div class="ecc-node__head">
          <component
            :is="node.tier === 'unstable' ? AlertTriangle : CheckCircle2"
            class="ecc-icon"
            :class="node.tier === 'unstable' ? 'ecc-icon--warn' : 'ecc-icon--ok'"
            aria-hidden="true"
          />
          <strong>{{ node.id }}</strong>
          <span class="ecc-badge" :class="`ecc-badge--${node.tier}`">{{ node.tier }}</span>
        </div>
        <dl class="ecc-node__meta">
          <div><dt>Wi‑Fi</dt><dd><code>{{ node.wlan0 }}</code></dd></div>
          <div><dt>Eth</dt><dd><code>{{ node.eth0 }}</code></dd></div>
          <div><dt>Roles</dt><dd>{{ node.roles.join(", ") }}</dd></div>
        </dl>
      </article>
    </div>

    <div class="ecc-stack">
      <h4>Platform</h4>
      <ul>
        <li v-for="item in cluster.stack" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="ecc-storage">
      <h4>Storage</h4>
      <p><strong>Active:</strong> {{ cluster.storage.active.join(" · ") }}</p>
      <p class="ecc-muted"><strong>Retired:</strong> {{ cluster.storage.retired }}</p>
    </div>

    <div class="ecc-apps">
      <h4>Workloads</h4>
      <span v-for="app in cluster.apps" :key="app" class="ecc-chip">{{ app }}</span>
    </div>
  </section>
</template>
