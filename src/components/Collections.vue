<script setup>

import ContentHeader from "./shared/ContentHeader.vue";

</script>

<template>
  <section class="text-left w-100">
    <ContentHeader />
    <div class="d-flex py-3 border-bottom">
      <div class="heading-icon heading-icon--workspace me-3">
        <img src="../assets/nav-collections.svg" height="24" width="24">
      </div>
      <div>
        <h2 class="fw-bold text-left mb-1">
          Ivy Collections
        </h2>
        <p class="mb-0 not-as-small text-body-secondary">
          Space for your ongoing projects - upload files, continue chats, build docs, & collaborate with your team.
        </p>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-3">
        <div class="border bg-white p-3 rounded mb-1">
          <div class="p-2 rounded bg-info-subtle d-inline-flex align-items-center justify-content-center mb-3">
            <img src="../assets/checkmark.svg" width="16" height="16">
          </div>
          <h6 class="fw-bold mb-1">
            Daily Tasks
          </h6>
          <p class="text-secondary true-small mb-0">A daily chat with an editable to-do list.</p>
          <div class="text-body-tertiary smallest mt-3">
            <span>128 chats</span>
            <span class="mx-1">&middot;</span>
            <span>Productivity</span>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
</style>
