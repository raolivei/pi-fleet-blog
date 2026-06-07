<script setup lang="ts">
import { Activity, ExternalLink, LayoutDashboard, Server } from "lucide-vue-next";
import { cluster } from "../../../data/cluster";
import { useClusterNodeStatus } from "../composables/useClusterNodeStatus";

const { displayNodes, source, lastUpdated, readyNodeCount, healthyApps, totalApps } =
  useClusterNodeStatus();

const secondaryLinks = [
  { label: "Runbook", href: "https://docs.eldertree.xyz/runbook/" },
  { label: "Project docs", href: "https://docs.eldertree.xyz/project" },
  { label: "Grafana (LAN)", href: "https://grafana.eldertree.local/d/eldertree-ops-home" },
] as const;
</script>

<template>
  <section class="cluster-banner" aria-label="Eldertree cluster live status">
    <div class="cluster-banner__glow" aria-hidden="true" />

    <div class="cluster-banner__inner">
      <header class="cluster-banner__header">
        <div class="cluster-banner__intro">
          <p class="cluster-banner__eyebrow">
            <Server class="cluster-banner__eyebrow-icon" aria-hidden="true" />
            Homelab · {{ cluster.hardware }}
          </p>
          <h2 class="cluster-banner__title">The cluster behind this blog</h2>
          <p class="cluster-banner__pitch">
            Three-node K3s on Raspberry Pi&nbsp;5 — GitOps, Vault, Traefik, and the apps
            documented here. Open Control Center for live topology, health, and ops links.
          </p>
        </div>

        <div
          class="cluster-banner__live-pill"
          :class="{ 'cluster-banner__live-pill--live': source === 'live' }"
        >
          <span class="cluster-banner__live-dot" aria-hidden="true" />
          {{ source === "live" ? "Live from cluster" : "Cached status" }}
        </div>
      </header>

      <div class="cluster-banner__grid">
        <div class="cluster-banner__topology">
          <p class="cluster-banner__label">Control plane</p>
          <div class="cluster-banner__nodes">
            <article
              v-for="node in displayNodes"
              :key="node.id"
              class="cluster-banner__node"
              :class="{ 'cluster-banner__node--unstable': node.tier === 'unstable' }"
            >
              <span class="cluster-banner__node-id">{{ node.id }}</span>
              <span
                class="cluster-banner__badge"
                :class="`cluster-banner__badge--${node.tier}`"
              >
                {{ node.tier }}
              </span>
              <code class="cluster-banner__node-ip">{{ node.wlan0 }}</code>
            </article>
          </div>

          <div class="cluster-banner__vips">
            <span v-for="v in cluster.vips" :key="v.ip" class="cluster-banner__vip">
              <span class="cluster-banner__vip-label">{{ v.label }}</span>
              <code>{{ v.ip }}</code>
            </span>
          </div>
        </div>

        <aside class="cluster-banner__panel">
          <dl class="cluster-banner__stats">
            <div class="cluster-banner__stat">
              <dt>Nodes ready</dt>
              <dd>{{ readyNodeCount }}/{{ cluster.nodes.length }}</dd>
            </div>
            <div class="cluster-banner__stat">
              <dt>K3s</dt>
              <dd>{{ cluster.k3sVersion }}</dd>
            </div>
            <div v-if="healthyApps != null && totalApps != null" class="cluster-banner__stat">
              <dt>Components</dt>
              <dd>{{ healthyApps }}/{{ totalApps }} healthy</dd>
            </div>
            <div v-else class="cluster-banner__stat">
              <dt>Stack</dt>
              <dd>{{ cluster.apps.length }} apps</dd>
            </div>
          </dl>

          <div class="cluster-banner__stack">
            <span
              v-for="item in cluster.stack.slice(0, 4)"
              :key="item"
              class="cluster-banner__chip"
            >{{ item }}</span>
            <span class="cluster-banner__chip cluster-banner__chip--muted">+ more</span>
          </div>

          <a
            class="cluster-banner__cta"
            href="https://control.eldertree.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LayoutDashboard aria-hidden="true" />
            Open Control Center
            <ExternalLink class="cluster-banner__cta-icon" aria-hidden="true" />
          </a>

          <p class="cluster-banner__cta-hint">
            Public URL · LAN mirror at
            <a href="https://control.eldertree.local" target="_blank" rel="noopener noreferrer"
              >control.eldertree.local</a
            >
          </p>

          <div class="cluster-banner__links">
            <a
              v-for="link in secondaryLinks"
              :key="link.href"
              :href="link.href"
              class="cluster-banner__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Activity aria-hidden="true" />
              {{ link.label }}
            </a>
          </div>
        </aside>
      </div>

      <footer v-if="lastUpdated" class="cluster-banner__footer">
        Status as of {{ lastUpdated }} UTC
      </footer>
    </div>
  </section>
</template>
