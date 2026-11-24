<script setup lang="ts">
import { useSidebar } from "vitepress/theme";

const { hasSidebar } = useSidebar();
</script>

<template>
  <footer class="site-footer" :class="{ 'has-sidebar': hasSidebar }">
    <div class="site-footer__inner">
      <nav class="site-footer__nav" aria-label="Eldertree sites">
        <a href="https://blog.eldertree.xyz/">Blog</a>
        <a href="https://docs.eldertree.xyz/">Runbook</a>
        <a href="https://control.eldertree.xyz/">Control Center</a>
      </nav>
      <p>Building Eldertree — a self-hosted Kubernetes build diary</p>
      <p>Copyright © 2026 Rafael Oliveira</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--vp-c-divider);
  padding: 1.5rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.75;
  text-align: center;
}

.site-footer__inner {
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem 1.5rem;
  margin-bottom: 0.75rem;
}

.site-footer__nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--vp-c-text-1);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.site-footer__nav a:hover {
  color: var(--vp-c-brand-1);
}

.site-footer__nav a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
  border-radius: 2px;
}

@media (min-width: 960px) {
  .site-footer.has-sidebar {
    padding-left: calc(var(--vp-sidebar-width) + 1.5rem);
  }
}

@media (min-width: 1440px) {
  .site-footer.has-sidebar {
    padding-right: calc((100vw - var(--vp-layout-max-width)) / 2 + 1.5rem);
    padding-left: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width) + 1.5rem);
  }
}
</style>
