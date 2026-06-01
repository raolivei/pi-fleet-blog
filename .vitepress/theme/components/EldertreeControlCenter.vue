<script setup lang="ts">
import ClusterHeader from "./ClusterHeader.vue";
import NodeTopology from "./NodeTopology.vue";
import IssueExplorer from "./IssueExplorer.vue";
import DocsPillars from "./DocsPillars.vue";
</script>

<template>
  <section class="ecc" aria-label="Eldertree cluster control center">
    <ClusterHeader />
    <NodeTopology />
    <IssueExplorer />
    <DocsPillars />
  </section>
</template>
