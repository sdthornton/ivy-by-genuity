<script setup>
import IvySphere from "./shared/IvySphere.vue";

</script>

<template>
  <section class="environmental-graph-visualizer">
    <IvySphere width="128" height="128" />
  </section>
</template>

<style scoped lang="scss">
.environmental-graph-visualizer {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 100%;
}
</style>
