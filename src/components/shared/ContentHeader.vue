<script setup>

</script>

<template>
  <div 
    class="content-header-info reduced pe-4 d-flex align-items-center"
    :class="{ 'is-split-content ps-4': $route.meta.splitContent }"
  >
    <span class="text-secondary">Ivy</span>
    <span class="mx-3 text-secondary reduced">&rsaquo;</span>
    <span class="text-secondary">{{ $route.name }}</span>
    <slot />
  </div>
</template>

<style lang="scss" scoped>

.content-header-info {
  background-color: var(--bs-gray-150);
  box-shadow: $shadow-header;
  display: flex;
  align-items: center;
  height: 3.5rem;
  margin-left: -4.5rem;
  margin-right: -4.5rem;
  padding-left: 4.5rem;
  z-index: 999;

  &.is-split-content {
    margin-left: 0;
    margin-right: 0;
  }
}

</style>
