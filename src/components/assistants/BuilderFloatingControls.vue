<script setup>
import BasicDropdown from "../shared/BasicDropdown.vue";
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
  "recenter",
  "undo",
  "toggle-editor-comments",
  "toggle-all-node-details",
  "add-step-select",
]);

function handleAddStepSelection(item) {
  emit("add-step-select", {
    item,
    context: {
      placement: "floating",
    },
  });
}
</script>

<template>
  <div class="builder-controls">
    <button
      v-tooltip="{ content: 'Zoom In', placement: 'left' }"
      type="button"
      class="builder-action--zoom-in btn btn-sm bg-white py-1 px-2.5 fw-bold"
      aria-label="Zoom in"
      @click.stop="emit('zoom-in')"
    >
      &plus;
    </button>
    <button
      v-tooltip="{ content: 'Zoom Out', placement: 'left' }"
      type="button"
      class="builder-action--zoom-out btn btn-sm bg-white py-1 px-2.5 fw-bold"
      aria-label="Zoom out"
      @click.stop="emit('zoom-out')"
    >
      &minus;
    </button>
    <button
      v-tooltip="{ content: 'Reset zoom and position.', placement: 'left' }"
      type="button"
      class="builder-action--recenter btn btn-sm bg-white py-2.5 px-2.5"
      aria-label="Reset zoom and position"
      @click.stop="emit('recenter')"
    >
      <img src="../../assets/recenter.svg" width="14" height="14" class="builder-action__icon d-block">
    </button>
    <button
      v-tooltip="{ content: 'Toggle comments', placement: 'left' }"
      type="button"
      class="builder-action--comments btn btn-sm bg-white py-2.5 px-2.5"
      aria-label="Toggle comments"
      @click.stop="emit('toggle-editor-comments')"
    >
      <img v-if="showEditorComments" src="../../assets/eye-closed.svg" width="14" height="14" class="d-block">
      <img v-else src="../../assets/eye-open.svg" width="14" height="14" class="d-block">
    </button>
    <button
      v-tooltip="{ content: 'Toggle details', placement: 'left' }"
      type="button"
      class="builder-action--details btn btn-sm bg-white py-2.5 px-2.5"
      aria-label="Toggle details"
      @click.stop="emit('toggle-all-node-details')"
    >
      <img
        src="../../assets/arrow-down-b.svg"
        width="14"
        height="14"
        class="d-block assistant-step-floating-mini-btn__icon"
        :class="{ 'assistant-step-floating-mini-btn__icon--collapsed': !areAllDetailsCollapsed }"
        aria-hidden="true"
      >
    </button>
  </div>
  <div class="assistant-step-floating-controls d-flex align-items-center gap-3">
    <button
      v-tooltip="{ content: 'Undo', placement: 'top' }"
      type="button"
      class="assistant-step-floating-mini-btn assistant-step-control d-flex align-items-center justify-content-center"
      aria-label="Undo"
      @click.stop="emit('undo')"
    >
      <img src="../../assets/undo.svg" width="14" height="14" class="d-block opacity-75">
    </button>
    <BasicDropdown placement="top-end">
      <template #trigger="{ open }">
        <button
          v-tooltip="{ content: 'Add Step', placement: 'top', disabled: open }"
          type="button"
          class="add-builder-node btn btn-dark rounded-circle d-flex align-items-center justify-content-center"
        >
          <img src="../../assets/plus-round.svg" width="20" height="20" class="d-block invert-to-white">
        </button>
      </template>
      <template #menu="{ close }">
        <AddStepMenuContent
          :groups="addStepMenuGroups"
          :close-menu="close"
          @select="handleAddStepSelection"
        />
      </template>
    </BasicDropdown>
  </div>
</template>

<style lang="scss" scoped>
.add-builder-node {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  height: 2.7rem;
  padding: 0;
  width: 2.7rem;
}

.builder-controls {
  border-radius: 0.5rem;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 2.25rem;
  top: 1.5rem;
}

.builder-action--zoom-in,
.builder-action--zoom-out,
.builder-action--recenter,
.builder-action--comments,
.builder-action--details {
  align-items: center;
  border-radius: 0;
  border-bottom: 1px solid var(--bs-gray-200);
  display: inline-flex;
  font-size: 1.125rem;
  justify-content: center;
  line-height: 1.875rem;

  &:hover {
    background-color: var(--bs-gray-200) !important;
  }
}

.builder-action--zoom-in {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.builder-action--details {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  border-bottom: 0;
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
  transform: rotate(-90deg);
}
</style>
