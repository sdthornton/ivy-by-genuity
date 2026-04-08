<script setup>

import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import SourceSelectorDropdown from "./SourceSelectorDropdown.vue";

const chatInput = useTemplateRef("chatInput");
const inputSourcePrefix = useTemplateRef("inputSourcePrefix");
const dynamicInputPaddingLeft = ref("");
let inputSourcePrefixResizeObserver = null;

const props = defineProps({
  showQuickActions: {
    type: Boolean,
    default: true,
  },
  chatPlaceholder: {
    type: String,
    default: "Ask Ivy anything...",
  },
  inputSourceIcon: {
    type: String,
    default: "",
  },
  inputSourceLabel: {
    type: String,
    default: "",
  },
  sourceOptions: {
    type: Array,
    default: () => [],
  },
  activeSources: {
    type: Array,
    default: () => [],
  },
  highlightSourcesPill: {
    type: Boolean,
    default: false,
  },
  sourcesCalloutText: {
    type: String,
    default: "",
  },
  highlightSubmitButton: {
    type: Boolean,
    default: false,
  },
  submitCalloutText: {
    type: String,
    default: "",
  },
  disableAnimations: {
    type: Boolean,
    default: false,
  },
  showGenericOnboarding: {
    type: Boolean,
    default: true,
  },
  showInitialOnboarding: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select-source", "connect-source", "submit"]);

const inactiveSources = computed(() => (
  props.sourceOptions.filter((source) => !props.activeSources.includes(source))
));
const showInputSourceContext = computed(() => (
  Boolean(props.inputSourceIcon && props.inputSourceLabel)
));

function handleSelectSource(source) {
  emit("select-source", source);
}

function handleConnectSource(source) {
  emit("connect-source", source);
}

function handleSubmit() {
  emit("submit", chatInput.value?.value || "");
}

function updateDynamicInputPadding() {
  if (!showInputSourceContext.value) {
    dynamicInputPaddingLeft.value = "";
    return;
  }

  const inputEl = chatInput.value;
  const prefixEl = inputSourcePrefix.value;
  if (!inputEl || !prefixEl) {
    return;
  }

  const inputRect = inputEl.getBoundingClientRect();
  const prefixRect = prefixEl.getBoundingClientRect();
  const spacingAfterPill = 8;
  const nextPadding = Math.ceil(prefixRect.right - inputRect.left + spacingAfterPill);
  dynamicInputPaddingLeft.value = `${nextPadding}px`;
}

function disconnectInputSourcePrefixResizeObserver() {
  if (!inputSourcePrefixResizeObserver) {
    return;
  }

  inputSourcePrefixResizeObserver.disconnect();
  inputSourcePrefixResizeObserver = null;
}

function connectInputSourcePrefixResizeObserver() {
  disconnectInputSourcePrefixResizeObserver();

  if (!showInputSourceContext.value || !inputSourcePrefix.value) {
    return;
  }

  inputSourcePrefixResizeObserver = new ResizeObserver(() => {
    updateDynamicInputPadding();
  });
  inputSourcePrefixResizeObserver.observe(inputSourcePrefix.value);
}

onMounted(async () => {
  await nextTick();
  updateDynamicInputPadding();
  connectInputSourcePrefixResizeObserver();
  window.addEventListener("resize", updateDynamicInputPadding);
});

onBeforeUnmount(() => {
  disconnectInputSourcePrefixResizeObserver();
  window.removeEventListener("resize", updateDynamicInputPadding);
});

watch(showInputSourceContext, async () => {
  await nextTick();
  updateDynamicInputPadding();
  connectInputSourcePrefixResizeObserver();
});

watch(() => props.inputSourceLabel, async () => {
  await nextTick();
  updateDynamicInputPadding();
});

defineExpose({
  chatInput,
});

</script>

<template>
  <div class="text-center search-wrap" :class="{ 'chat-box--no-motion': disableAnimations }">
    <div class="position-relative">
      <input
        type="text"
        class="mx-auto chat-prompt-input form-control py-3 pe-4 rounded-pill"
        :style="{ paddingLeft: dynamicInputPaddingLeft || undefined }"
        ref="chatInput"
        placeholder=""
      >
      <div class="position-absolute start-0 top-50 translate-middle-y ms-4 text-muted d-flex align-items-center">
        <div ref="inputSourcePrefix" class="d-flex align-items-center">
          <img src="../../assets/plus-round.svg" width="16" height="16" class="me-3">
          <span
            v-if="showInputSourceContext"
            class="chat-input-source-pill d-inline-flex align-items-center rounded-pill px-2 py-1 me-2"
            @click="chatInput.focus()"
          >
            <img :src="inputSourceIcon" width="20" height="20" class="me-1">
            <span class="chat-input-source-name">{{ inputSourceLabel }}</span>
          </span>
        </div>
        <div class="d-flex align-items-center ivy-placeholder" @click="chatInput.focus()">
          <img v-if="!showInputSourceContext" src="../../assets/nav-resources-alt.svg" width="24" height="24" class="me-2">
          <span>{{ chatPlaceholder }}</span>
        </div>
      </div>
      <div class="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center">
        <button class="btn btn-sm border-0 rounded-pill d-flex align-items-center justify-content-center me-2">
          <img src="../../assets/voice.svg" width="20" height="20">
        </button>
        <div class="position-relative d-flex align-items-center">
          <button
            class="btn btn-primary btn-sm border-0 rounded-pill p-1 d-flex align-items-center justify-content-center"
            :class="{ 'chat-submit-btn--highlight': highlightSubmitButton }"
            @click="handleSubmit"
          >
            <img src="../../assets/arrow-right-c.svg" width="20" height="20">
          </button>
          <div
            v-if="highlightSubmitButton && submitCalloutText"
            class="chat-quick-action-callout chat-submit-callout reduced bg-dark text-white rounded-pill px-2 py-1"
          >
            {{ submitCalloutText }}
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="showQuickActions"
      class="chat-quick-actions mt-3 d-flex text-biscay-blue true-small d-flex"
      :class="{ 'chat-quick-actions--focus-sources': highlightSourcesPill }"
    >
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/nav-prompt-library.svg" height="16" width="16" class="me-1">
        Library
        <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
      </div>
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/nav-resources.svg" height="16" width="16" class="me-1">
        Assistants
        <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
      </div>
      <div class="position-relative chat-source-focus">
        <SourceSelectorDropdown
          v-if="sourceOptions.length"
          :source-options="sourceOptions"
          :active-source-options="activeSources"
          :inactive-source-options="inactiveSources"
          placement="bottom-start"
          menu-class="chat-source-dropdown-menu"
          title="Filter Ivy response by source..."
          @select-source="handleSelectSource"
          @connect-source="handleConnectSource"
        >
          <template #trigger>
            <div
              class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center"
              :class="{ 'chat-quick-action--highlight': highlightSourcesPill }"
            >
              <img src="../../assets/nav-connectors.svg" height="16" width="16" class="me-1">
              Sources
              <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
            </div>
          </template>
        </SourceSelectorDropdown>
        <div v-else class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
          <img src="../../assets/nav-connectors.svg" height="16" width="16" class="me-1">
          Sources
          <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 pill-dropdown-arrow">
        </div>
        <div
          v-if="highlightSourcesPill && sourcesCalloutText"
          class="chat-quick-action-callout reduced bg-dark text-white rounded-pill px-2 py-1"
        >
          {{ sourcesCalloutText }}
        </div>
      </div>
      <div class="chat-quick-action rounded-pill px-3 py-1 d-flex align-items-center">
        <img src="../../assets/global-search.svg" height="16" width="16" class="me-1">
        <span>Search the Web</span>
      </div>
      <div 
        v-if="showGenericOnboarding && !showInitialOnboarding"
        class="chat-quick-action chat-quick-action--help bg-secondary-subtle rounded-pill px-3 py-1 d-flex align-items-center ms-auto"
      >
        <img src="../../assets/help-circled-2.svg" height="16" width="16" class="me-1">
        <span>What can you do?</span>
      </div>
      <RouterLink
        v-else-if="showInitialOnboarding"
        to="/chats/ivy-onboarding"
        class="chat-quick-action chat-quick-action--help text-white bg-ivy-accent rounded-pill px-3 py-1 d-flex align-items-center ms-auto"
      >
        <img src="../../assets/nav-resources-nav.svg" height="16" width="16" class="me-1" style="mix-blend-mode: unset;">
        <span>Quick Start</span>
      </RouterLink>
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

.chat-input-source-name {
  color: var(--bs-gray-600);
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-input-source-pill {
  background-color: var(--bs-gray-200);
  cursor: text;
}

.chat-prompt-input {
  --shadow-color: 0deg 0% 0%;
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  padding-left: 3.5rem;
  width: 100%;

  &:placeholder-shown ~ .position-absolute .ivy-placeholder {
    opacity: 1;
  }

  &:placeholder-shown ~ .position-absolute .btn-primary {
    background-color: var(--bs-dark) !important;
  }

  &:not(:placeholder-shown) ~ .position-absolute .ivy-placeholder {
    opacity: 0;
  }

  &:focus ~ .position-absolute .ivy-placeholder {
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
  text-decoration: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: color.mix($iceberg-blue, #020D1C, 87.5%);
  }
}

.chat-quick-actions--focus-sources > *:not(.chat-source-focus):not(.chat-quick-action--help) {
  opacity: 0.4;
}

.chat-quick-action--help {
  opacity: 1;
}

.chat-source-focus {
  opacity: 1 !important;
}

.chat-quick-action--highlight {
  animation: sources-pill-pulse 1.05s ease-in-out infinite;
  background-color: var(--bs-primary-bg-subtle);
  box-shadow: inset 0 0 0 1px var(--bs-primary), 0 0 0 4px rgba(13, 110, 253, 0.25);
}

.chat-quick-action-callout {
  animation: sources-callout-float 0.95s ease-in-out infinite;
  font-weight: 500;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: -2rem;
  transform: translateX(-50%);
  white-space: nowrap;

  &:after {
    border-left: 0.35rem solid transparent;
    border-right: 0.35rem solid transparent;
    border-top: 0.45rem solid var(--bs-dark);
    content: "";
    left: 50%;
    margin-left: -0.35rem;
    position: absolute;
    top: calc(100% - 1px);
  }
}

.chat-submit-btn--highlight {
  animation: sources-pill-pulse 1.05s ease-in-out infinite;
  box-shadow: inset 0 0 0 1px var(--bs-primary), 0 0 0 4px rgba(13, 110, 253, 0.25);
}

.chat-submit-callout {
  left: 50%;
}

.chat-box--no-motion {
  .chat-quick-action,
  .ivy-placeholder {
    transition: none;
  }

  .chat-quick-action--highlight,
  .chat-quick-action-callout,
  .chat-submit-btn--highlight {
    animation: none;
  }
}

@keyframes sources-pill-pulse {
  0% {
    transform: translateY(0);
    box-shadow: inset 0 0 0 1px var(--bs-primary), 0 0 0 0 rgba(13, 110, 253, 0.45);
  }
  40% {
    transform: translateY(-1px);
  }
  70% {
    transform: translateY(0);
    box-shadow: inset 0 0 0 1px var(--bs-primary), 0 0 0 9px rgba(13, 110, 253, 0);
  }
  100% {
    transform: translateY(0);
    box-shadow: inset 0 0 0 1px var(--bs-primary), 0 0 0 0 rgba(13, 110, 253, 0);
  }
}

@keyframes sources-callout-float {
  0% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-2px);
  }
  100% {
    transform: translateX(-50%) translateY(0);
  }
}

.pill-dropdown-arrow {
  margin-right: -0.25rem;
}
</style>
