<script setup>
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import AddStepMenuContent from "./AddStepMenuContent.vue";

const props = defineProps({
  viewportSize: {
    type: Object,
    required: true,
  },
  reorderDrag: {
    type: Object,
    required: true,
  },
  canvasSize: {
    type: Object,
    required: true,
  },
  connectionLines: {
    type: Array,
    required: true,
  },
  terminalAddControls: {
    type: Array,
    required: true,
  },
  highlightedConnectionKey: {
    type: String,
    default: null,
  },
  hiddenDraggedConnectionKey: {
    type: String,
    default: null,
  },
  addStepMenuGroups: {
    type: Array,
    default: () => [],
  },
  shouldShowFullTerminalAddCard: {
    type: Boolean,
    default: false,
  },
  singleStartTerminalAddControl: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "line-pointerdown",
  "line-pointerhover",
  "line-pointerleave",
  "add-step-select",
]);

function handleLinePointerDown(event, line) {
  emit("line-pointerdown", { event, line });
}

function handleLinePointerHover(event, lineKey) {
  emit("line-pointerhover", { event, lineKey });
}

function handleLinePointerLeave(lineKey) {
  emit("line-pointerleave", { lineKey });
}

function handleAddStepSelection(item) {
  emit("add-step-select", item);
}
</script>

<template>
  <Teleport to="body">
    <svg
      v-if="reorderDrag.active && reorderDrag.moved && viewportSize.width && viewportSize.height"
      class="assistant-step-reorder-overlay"
      :width="viewportSize.width"
      :height="viewportSize.height"
      aria-hidden="true"
    >
      <line
        class="assistant-step-reorder-line"
        :x1="reorderDrag.sourceX"
        :y1="reorderDrag.sourceY"
        :x2="reorderDrag.targetId ? reorderDrag.targetX : reorderDrag.pointerX"
        :y2="reorderDrag.targetId ? reorderDrag.targetY : reorderDrag.pointerY"
      />
    </svg>
  </Teleport>

  <svg
    class="assistant-step-connections"
    :width="canvasSize.width"
    :height="canvasSize.height"
    overflow="visible"
    aria-hidden="true"
  >
    <line
      v-for="line in connectionLines"
      :key="`highlight-${line.key}`"
      v-show="highlightedConnectionKey === line.key && hiddenDraggedConnectionKey !== line.key"
      class="assistant-step-connection-hover-band"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
    />
    <line
      v-for="line in connectionLines"
      :key="`hit-${line.key}`"
      v-show="hiddenDraggedConnectionKey !== line.key"
      class="assistant-step-connection-hit-area"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      v-tooltip="{ content: 'Click to remove. Drag to change.', placement: 'right' }"
      @pointerdown.stop.prevent="handleLinePointerDown($event, line)"
      @pointerover="handleLinePointerHover($event, line.key)"
      @pointermove="handleLinePointerHover($event, line.key)"
      @pointerleave="handleLinePointerLeave(line.key)"
    />
    <line
      v-for="line in connectionLines"
      :key="line.key"
      v-show="hiddenDraggedConnectionKey !== line.key"
      class="assistant-step-connection-line"
      :class="{ 'assistant-step-connection-line--active': highlightedConnectionKey === line.key }"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
    />
    <line
      v-for="terminalAdd in terminalAddControls"
      :key="terminalAdd.lineKey"
      class="assistant-step-connection-line"
      :x1="terminalAdd.x1"
      :y1="terminalAdd.y1"
      :x2="terminalAdd.x2"
      :y2="terminalAdd.y2"
    />
  </svg>

  <StepOptionsDropdown
    v-for="line in connectionLines"
    :key="`mid-add-${line.key}`"
    v-show="hiddenDraggedConnectionKey !== line.key"
    class="assistant-step-inline-add"
    :style="{ left: `${line.midX}px`, top: `${line.midY}px` }"
  >
    <template #trigger="{ open }">
      <button
        v-tooltip="{ content: 'Add a step here.', placement: 'right', disabled: open }"
        type="button"
        class="assistant-step-inline-add-btn d-flex align-items-center justify-content-center"
        aria-label="Add step between connected nodes"
      >
        <img src="../../assets/plus-round.svg" width="12" height="12" class="d-block invert-to-white">
      </button>
    </template>
    <template #menu="{ close }">
      <AddStepMenuContent
        :groups="addStepMenuGroups"
        :close-menu="close"
        @select="handleAddStepSelection"
      />
    </template>
  </StepOptionsDropdown>

  <StepOptionsDropdown
    v-for="terminalAdd in terminalAddControls"
    :key="terminalAdd.key"
    v-show="!shouldShowFullTerminalAddCard"
    class="assistant-step-terminal-add"
    :style="{ left: `${terminalAdd.x}px`, top: `${terminalAdd.top}px` }"
  >
    <template #trigger="{ open }">
      <button
        v-tooltip="{ content: 'Add a step here.', placement: 'right', disabled: open }"
        type="button"
        class="assistant-step-inline-add-btn d-flex align-items-center justify-content-center"
        aria-label="Add step after this node"
      >
        <img src="../../assets/plus-round.svg" width="12" height="12" class="d-block invert-to-white">
      </button>
    </template>
    <template #menu="{ close }">
      <AddStepMenuContent
        :groups="addStepMenuGroups"
        :close-menu="close"
        @select="handleAddStepSelection"
      />
    </template>
  </StepOptionsDropdown>

  <StepOptionsDropdown
    v-if="singleStartTerminalAddControl"
    class="assistant-step-terminal-add assistant-step-terminal-add--card"
    :style="{ left: `${singleStartTerminalAddControl.x}px`, top: `${singleStartTerminalAddControl.top}px` }"
  >
    <template #trigger>
      <div class="assistant-step-add-card border rounded-sm fw-medium bg-white py-2.5 px-3 reduced text-center">
        <span class="me-1">&plus;</span>
        Add Step
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
</template>

<style lang="scss" scoped>
.assistant-step-connections {
  height: 100%;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  width: 100%;
  z-index: 1;
}

.assistant-step-reorder-overlay {
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: fixed;
  z-index: 500;
}

.assistant-step-reorder-line {
  fill: none;
  stroke: var(--bs-dark);
  stroke-dasharray: 5 6;
  stroke-linecap: round;
  stroke-width: 2;
  opacity: 0.9;
}

.assistant-step-connection-line {
  fill: none;
  stroke: var(--bs-gray-400);
  stroke-dasharray: 5 6;
  stroke-linecap: round;
  stroke-width: 2;
  animation: assistant-step-connection-flow 1.8s linear infinite;
  pointer-events: none;
  transition: stroke 120ms ease-in-out, stroke-width 120ms ease-in-out;
}

.assistant-step-connection-line--active {
  stroke: var(--bs-gray-600);
  stroke-width: 3;
}

.assistant-step-connection-hover-band {
  fill: none;
  pointer-events: none;
  stroke: rgba(222, 226, 230, 0.95);
  stroke-linecap: round;
  stroke-width: 20;
  opacity: 1;
  transition: opacity 120ms ease-in-out;
}

.assistant-step-connection-hit-area {
  cursor: pointer;
  fill: none;
  pointer-events: stroke;
  stroke: transparent;
  stroke-width: 18;
  transition: opacity 120ms ease-in-out;
}

.assistant-step-inline-add {
  margin-left: -0.625rem;
  margin-top: -0.625rem;
  position: absolute;
  z-index: 3;
}

.assistant-step-inline-add:focus-within,
.assistant-step-inline-add:has(.step-options-dropdown--open) {
  z-index: 40;
}

.assistant-step-inline-add-btn {
  background-color: var(--bs-dark);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  height: 1.25rem;
  padding: 0;
  transition: background-color 120ms ease-in-out;
  width: 1.25rem;
}

.assistant-step-inline-add-btn:hover {
  background-color: #3e4756;
}

.assistant-step-terminal-add {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.assistant-step-terminal-add--card {
  transform: translate(-50%, 0);
}

.assistant-step-terminal-add:focus-within,
.assistant-step-terminal-add:has(.step-options-dropdown--open) {
  z-index: 40;
}

.assistant-step-add-card {
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  cursor: pointer;
  white-space: nowrap;
}

@keyframes assistant-step-connection-flow {
  to {
    stroke-dashoffset: -22;
  }
}
</style>
