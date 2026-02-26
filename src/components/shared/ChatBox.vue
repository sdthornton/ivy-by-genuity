<script setup>

import { useTemplateRef } from 'vue';

const chatInput = useTemplateRef('chatInput');

const props = defineProps({
  showQuickActions: {
    type: Boolean,
    default: true,
  },
  chatPlaceholder: {
    type: String,
    default: "Ask Ivy anything...",
  },
});

defineExpose({
  chatInput,
});

</script>

<template>
  <div class="text-center search-wrap">
    <div class="position-relative">
      <input type="text" class="mx-auto chat-prompt-input form-control py-3 pe-4 rounded-pill" ref="chatInput" placeholder="">
      <div class="position-absolute start-0 top-50 translate-middle-y ms-4 text-muted d-flex align-items-center">
        <img src="../../assets/plus-round.svg" width="16" height="16" class="me-3">
        <div class="d-flex align-items-center ivy-placeholder" @click="chatInput.focus()">
          <img src="../../assets/nav-resources-alt.svg" width="24" height="24" class="me-2">
          <span>{{ chatPlaceholder }}</span>
        </div>
      </div>
      <div class="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center">
        <button class="btn btn-sm border-0 rounded-pill d-flex align-items-center justify-content-center me-2">
          <img src="../../assets/voice.svg" width="20" height="20">
        </button>
        <button class="btn btn-primary btn-sm border-0 rounded-pill p-1 d-flex align-items-center justify-content-center">
          <img src="../../assets/arrow-right-c.svg" width="20" height="20">
        </button>
      </div>
    </div>

    <div 
      v-if="showQuickActions"
      class="chat-quick-actions mt-3 d-flex text-biscay-blue true-small d-flex"
    >
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/nav-prompt-library.svg" height="16" width="16" class="me-1">
        Library
        <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
      </div>
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/nav-resources.svg" height="16" width="16" class="me-1">
        Actions
        <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
      </div>
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/nav-connectors.svg" height="16" width="16" class="me-1">
        Integrations
        <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
      </div>
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/global-search.svg" height="16" width="16" class="me-1">
        <span>Search the Web</span>
      </div>
      <div class="chat-quick-action bg-secondary-subtle rounded-pill px-3 py-1 d-flex align-items-center ms-auto">
        <img src="../../assets/help-circled-2.svg" height="16" width="16" class="me-1">
        <span>What can you do?</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";

.search-wrap {
  // max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
}

.ivy-placeholder {
  cursor: text;
  opacity: 0;
  transition: opacity 100ms cubic-bezier(0.4, 0, 1, 1);
}

.chat-prompt-input {
  --shadow-color: 0deg 0% 0%;
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  padding-left: 3.5rem;
  width: 100%;

  &:placeholder-shown ~ .position-absolute {
    > .btn-primary {
      background-color: var(--bs-dark) !important;
    }

    > .ivy-placeholder {
      opacity: 1;
    }
  }

  &:focus + .position-absolute > .ivy-placeholder {
    opacity: 0;
  }
}

.chat-quick-actions {
  gap: 0.5rem;

  img {
    mix-blend-mode: color-burn;
  }
}

.chat-quick-action {
  background-color: $iceberg-blue;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: color.mix($iceberg-blue, #020D1C, 87.5%);
  }
}

.pill-dropdown-arrow {
  margin-right: -0.25rem;
}
</style>
