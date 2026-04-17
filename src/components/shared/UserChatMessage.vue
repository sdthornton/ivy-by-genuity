<script setup>
import { computed } from "vue";

const props = defineProps({
  filterSourceIcon: {
    type: String,
    default: "",
  },
  filterSourceLabel: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  preserveWhitespace: {
    type: Boolean,
    default: false,
  },
});

const messageStyle = computed(() => (
  props.preserveWhitespace ? { whiteSpace: "pre-line" } : null
));
</script>

<template>
  <article class="user-chat-bubble rounded bg-iceberg-blue px-3 py-2 mb-4 position-relative">
    <div
      v-if="filterSourceLabel"
      class="d-flex align-items-center mb-0"
    >
      <span class="smallest text-dark opacity-50 me-2">Source:</span>
      <img
        v-if="filterSourceIcon"
        :src="filterSourceIcon"
        :alt="filterSourceLabel"
        width="14"
        height="14"
        class="me-1"
      >
      <span class="smallest text-dark opacity-75">{{ filterSourceLabel }}</span>
    </div>
    <slot>
      <p class="mb-0" :style="messageStyle">{{ text }}</p>
    </slot>
  </article>
</template>
