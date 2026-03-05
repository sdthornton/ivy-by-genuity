<script setup>
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import AddStepMenuContent from "./AddStepMenuContent.vue";

defineProps({
  showEditorComments: {
    type: Boolean,
    default: true,
  },
  areAllDetailsCollapsed: {
    type: Boolean,
    default: false,
  },
  addStepMenuGroups: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "zoom-in",
  "zoom-out",
  "undo",
  "toggle-editor-comments",
  "toggle-all-node-details",
  "add-step-select",
]);

function handleAddStepSelection(item) {
  emit("add-step-select", item);
}
</script>

<template>
  <div class="builder-zoom">
    <div class="builder-zoom-tooltip-wrap">
      <button
        type="button"
        class="builder-action--zoom-in btn btn-sm bg-white py-1 px-2.5 fw-bold"
        aria-label="Zoom in"
        @click.stop="emit('zoom-in')"
      >
        &plus;
      </button>
      <div class="builder-zoom-tooltip true-small" role="tooltip">Zoom In</div>
    </div>
    <div class="builder-zoom-tooltip-wrap">
      <button
        type="button"
        class="builder-action--zoom-out btn btn-sm bg-white py-1 px-2.5 fw-bold"
        aria-label="Zoom out"
        @click.stop="emit('zoom-out')"
      >
        &minus;
      </button>
      <div class="builder-zoom-tooltip true-small" role="tooltip">Zoom Out</div>
    </div>
  </div>
  <div class="assistant-step-floating-controls d-flex align-items-center gap-3">
    <div class="builder-zoom-tooltip-wrap assistant-step-floating-tooltip-wrap">
      <button
        type="button"
        class="assistant-step-floating-mini-btn assistant-step-control d-flex align-items-center justify-content-center"
        aria-label="Undo"
        @click.stop="emit('undo')"
      >
        <img src="../../assets/undo.svg" width="14" height="14" class="d-block opacity-75">
      </button>
      <div class="builder-zoom-tooltip true-small" role="tooltip">Undo</div>
    </div>
    <div class="builder-zoom-tooltip-wrap assistant-step-floating-tooltip-wrap">
      <button
        type="button"
        class="assistant-step-floating-mini-btn assistant-step-control d-flex align-items-center justify-content-center"
        aria-label="Toggle comments"
        @click.stop="emit('toggle-editor-comments')"
      >
        <img v-if="showEditorComments" src="../../assets/eye-closed.svg" width="14" height="14" class="d-block">
        <img v-else src="../../assets/eye-open.svg" width="14" height="14" class="d-block">
      </button>
      <div class="builder-zoom-tooltip true-small" role="tooltip">Toggle comments</div>
    </div>
    <div class="builder-zoom-tooltip-wrap assistant-step-floating-tooltip-wrap">
      <button
        type="button"
        class="assistant-step-floating-mini-btn assistant-step-control d-flex align-items-center justify-content-center"
        aria-label="Toggle details"
        @click.stop="emit('toggle-all-node-details')"
      >
        <img
          src="../../assets/dropdown.svg"
          width="14"
          height="14"
          class="d-block assistant-step-floating-mini-btn__icon"
          :class="{ 'assistant-step-floating-mini-btn__icon--collapsed': !areAllDetailsCollapsed }"
          aria-hidden="true"
        >
      </button>
      <div class="builder-zoom-tooltip true-small" role="tooltip">Toggle details</div>
    </div>
    <StepOptionsDropdown placement="top-end">
      <template #trigger="{ open }">
        <div class="builder-zoom-tooltip-wrap assistant-step-floating-tooltip-wrap">
          <button class="add-builder-node btn btn-dark rounded-circle d-flex align-items-center justify-content-center">
            <img src="../../assets/plus-round.svg" width="20" height="20" class="d-block invert-to-white">
          </button>
          <div v-if="!open" class="builder-zoom-tooltip true-small" role="tooltip">Add Step</div>
        </div>
      </template>
      <template #menu="{ close }">
        <AddStepMenuContent
          :groups="addStepMenuGroups"
          :close-menu="close"
          @select="handleAddStepSelection"
        />
      </template>
    </StepOptionsDropdown>
  </div>
</template>

<style lang="scss" scoped>
.builder-zoom {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: absolute;
  right: 2.25rem;
  top: 1.5rem;
}

.builder-zoom-tooltip-wrap {
  position: relative;
}

.builder-zoom-tooltip {
  background-color: #1b2434;
  border-radius: 0.35rem;
  color: #fff;
  line-height: 1.3;
  opacity: 0;
  padding: 0.35rem 0.5rem;
  pointer-events: none;
  position: absolute;
  right: calc(100% + 0.5rem);
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  z-index: 22;
}

.builder-zoom-tooltip-wrap:hover .builder-zoom-tooltip {
  opacity: 1;
  pointer-events: auto;
}

.assistant-step-floating-tooltip-wrap .builder-zoom-tooltip {
  bottom: calc(100% + 0.5rem);
  left: 50%;
  right: auto;
  top: auto;
  transform: translateX(-50%);
}

.builder-action--zoom-in,
.builder-action--zoom-out {
  border-radius: 0;
  font-size: 1.125rem;
}

.builder-action--zoom-in {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.builder-action--zoom-out {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.assistant-step-floating-controls {
  bottom: 1.5rem;
  position: absolute;
  right: 1.5rem;
}

.assistant-step-floating-mini-btn {
  background-color: #fff;
  border: 0;
  border-radius: 999px;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  height: 2.7rem;
  padding: 0;
  transition: opacity 120ms ease-in-out;
  width: 2.7rem;
}

.assistant-step-floating-mini-btn__icon {
  transition: transform 120ms ease-in-out;
}

.assistant-step-floating-mini-btn__icon--collapsed {
  transform: rotate(180deg);
}

.add-builder-node {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  height: 2.7rem;
  padding: 0;
  width: 2.7rem;
}
</style>
