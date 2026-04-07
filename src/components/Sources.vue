<script setup>
import ContentHeader from "./shared/ContentHeader.vue";
</script>

<template>
  <section class="text-left w-100">
    <ContentHeader />
    <div class="d-flex py-3 border-bottom">
      <div class="heading-icon heading-icon--workspace me-3">
        <img src="../assets/nav-connectors.svg" height="24" width="24">
      </div>
      <div>
        <h2 class="fw-bold text-left mb-1">Data Sources</h2>
        <p class="mb-0 not-as-small text-body-secondary">
          Connect and manage your integrations so Ivy can deliver richer, cross-source insights.
        </p>
      </div>
    </div>
  </section>
</template>
