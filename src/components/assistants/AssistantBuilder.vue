// src/components/assistants/AssistantBuilder.vue

<script setup>

import interact from "interactjs";
import { onMounted, onBeforeUnmount, reactive, defineEmits, defineProps, watch, ref, nextTick } from "vue";
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";

const emit = defineEmits(["toggleSidebar"]);

function toggleSidebar(nodeId) {
  emit("toggleSidebar", nodeId);
}

const props = defineProps({
  currentBuilderStep: {
    type: Number,
    required: false,
    default: 0,
  },
});

const canvas = ref(null);
const connectionLines = ref([]);
const canvasSize = reactive({ width: 0, height: 0 });
const activeStepMenuId = ref(null);
const showEditorComments = ref(true);

function findNodeById(id) {
  return nodes.find(n => String(n.id) === String(id));
}

function hasIncomingConnection(nodeId) {
  return nodes.some((node) => node.connections?.some((target) => String(target) === String(nodeId)));
}

function isStepMenuOpen(nodeId) {
  return String(activeStepMenuId.value) === String(nodeId);
}

function closeStepMenu() {
  activeStepMenuId.value = null;
}

function toggleStepMenu(nodeId) {
  activeStepMenuId.value = isStepMenuOpen(nodeId) ? null : nodeId;
}

function toggleEditorComments() {
  showEditorComments.value = !showEditorComments.value;
}

function handleUndoClick() {
  // Placeholder until undo stack behavior is implemented.
}

function updateConnectionLines() {
  const canvasEl = canvas.value;
  if (!canvasEl) return;

  canvasSize.width = canvasEl.clientWidth;
  canvasSize.height = canvasEl.clientHeight;

  const canvasRect = canvasEl.getBoundingClientRect();
  const nodeEls = Array.from(canvasEl.querySelectorAll(".assistant-step[data-step-id]"));
  const anchors = new Map();

  nodeEls.forEach((el) => {
    const nodeId = String(el.dataset.stepId || "");
    if (!nodeId) return;
    const rect = el.getBoundingClientRect();
    anchors.set(nodeId, {
      x: rect.left + rect.width / 2 - canvasRect.left,
      topY: rect.top - canvasRect.top,
      bottomY: rect.bottom - canvasRect.top,
    });
  });

  const lines = [];
  nodes.forEach((node) => {
    const source = anchors.get(String(node.id));
    if (!source) return;

    node.connections?.forEach((targetId) => {
      const target = anchors.get(String(targetId));
      if (!target) return;

      lines.push({
        key: `${node.id}-${targetId}`,
        x1: source.x,
        y1: source.bottomY,
        x2: target.x,
        y2: target.topY,
        midX: (source.x + target.x) / 2,
        midY: (source.bottomY + target.topY) / 2,
      });
    });
  });

  connectionLines.value = lines;
}

let lineRaf = 0;
const scheduleConnectionLineUpdate = () => {
  if (lineRaf) cancelAnimationFrame(lineRaf);
  lineRaf = requestAnimationFrame(() => {
    lineRaf = 0;
    updateConnectionLines();
  });
};

const GRID_SIZE = 12;
function snapToGrid(val, grid = GRID_SIZE) {
  return Math.round(val / grid) * grid;
}

let nodeInteraction = null;

const onDocumentPointerDown = (event) => {
  if (activeStepMenuId.value === null) {
    return;
  }

  if (!(event.target instanceof Element)) {
    closeStepMenu();
    return;
  }

  if (!event.target.closest("[data-step-menu-root]")) {
    closeStepMenu();
  }
};

const onDocumentKeyDown = (event) => {
  if (event.key === "Escape") {
    closeStepMenu();
  }
};

onMounted(() => {
  nodeInteraction = interact(".assistant-step").draggable({
    inertia: true,
    ignoreFrom: ".assistant-step-control",
    listeners: {
      move(event) {
        const el = event.target;
        const node = findNodeById(el?.dataset?.stepId);
        if (!node) {
          return;
        }

        node.x += event.dx;
        node.y += event.dy;

        el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
        scheduleConnectionLineUpdate();
      },
      end(event) {
        const el = event.target;
        const node = findNodeById(el?.dataset?.stepId);
        if (!node) {
          return;
        }

        node.x = snapToGrid(node.x);
        node.y = snapToGrid(node.y);

        el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
        scheduleConnectionLineUpdate();
      },
    },
  });

  window.addEventListener("resize", scheduleConnectionLineUpdate);
  document.addEventListener("pointerdown", onDocumentPointerDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  nextTick(() => scheduleConnectionLineUpdate());
});

/* BEGIN MOCK DATA */

const scheduleNode = { id: 1, type: "schedule", title: "Every Morning", data: { frequency: "Once Daily", time: "09:00 am", timezone: "CST"}, detailsCollapsed: false, connections: [2], x: 0,  y: 0 };
const lookupNewNode = { id: 2, type: "lookup", title: "Get SP Audit Data", data: { source: "SharePoint", list: "SP GetAudit", code: "Get yesterday's SharePoint audit activity if present." }, detailsCollapsed: false, connections: [3],  x: 0, y: 60 };
const emailDataNode = { id: 3, type: "schedule", title: "Do something", data: { frequency: "Once Daily", time: "09:00 am", timezone: "CST"}, detailsCollapsed: false, connections: [],  x: 0,  y: 120 };

const nodes = reactive([]);

function cloneNodeTemplate(node) {
  return {
    ...node,
    data: { ...node.data },
    detailsCollapsed: Boolean(node.detailsCollapsed),
    connections: [...(node.connections || [])],
  };
}

function getNextNodeId() {
  return nodes.reduce((maxId, node) => Math.max(maxId, Number(node.id) || 0), 0) + 1;
}

function toggleNodeDetails(nodeId) {
  const node = findNodeById(nodeId);
  if (!node) return;
  node.detailsCollapsed = !node.detailsCollapsed;
  nextTick(() => scheduleConnectionLineUpdate());
}

function duplicateStep(nodeId) {
  const sourceNode = findNodeById(nodeId);
  if (!sourceNode) return;

  const duplicatedNode = cloneNodeTemplate(sourceNode);
  duplicatedNode.id = getNextNodeId();
  duplicatedNode.connections = [];
  duplicatedNode.x = sourceNode.x + GRID_SIZE * 2;
  duplicatedNode.y = sourceNode.y + GRID_SIZE * 2;

  nodes.push(duplicatedNode);
  closeStepMenu();
  nextTick(() => scheduleConnectionLineUpdate());
}

function removeAllConnections(nodeId) {
  const selectedId = String(nodeId);

  nodes.forEach((node) => {
    if (String(node.id) === selectedId) {
      node.connections = [];
      return;
    }

    node.connections = (node.connections || []).filter((targetId) => String(targetId) !== selectedId);
  });

  closeStepMenu();
  nextTick(() => scheduleConnectionLineUpdate());
}

function deleteStep(nodeId) {
  const selectedId = String(nodeId);
  const index = nodes.findIndex((node) => String(node.id) === selectedId);
  if (index === -1) return;

  nodes.splice(index, 1);
  nodes.forEach((node) => {
    node.connections = (node.connections || []).filter((targetId) => String(targetId) !== selectedId);
  });

  closeStepMenu();
  nextTick(() => scheduleConnectionLineUpdate());
}

watch(
  () => props.currentBuilderStep,
  (newStep) => {
    nodes.splice(0, nodes.length);

    if (newStep >= 1) nodes.push(cloneNodeTemplate(scheduleNode));
    if (newStep >= 2) nodes.push(cloneNodeTemplate(lookupNewNode));
    if (newStep >= 3) nodes.push(cloneNodeTemplate(emailDataNode));

    nextTick(() => scheduleConnectionLineUpdate());
  },
  { immediate: true },
);

/* END MOCK DATA */

onBeforeUnmount(() => {
  nodeInteraction?.unset();
  nodeInteraction = null;
  window.removeEventListener("resize", scheduleConnectionLineUpdate);
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("keydown", onDocumentKeyDown);
  if (lineRaf) cancelAnimationFrame(lineRaf);
  lineRaf = 0;
});

</script>

<template>
  <article class="assistant-builder-canvas" ref="canvas">
    <svg
      class="assistant-step-connections"
      :width="canvasSize.width"
      :height="canvasSize.height"
      aria-hidden="true"
    >
      <line
        v-for="line in connectionLines"
        :key="line.key"
        class="assistant-step-connection-line"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
      />
    </svg>
    <StepOptionsDropdown
      v-for="line in connectionLines"
      :key="`mid-add-${line.key}`"
      class="assistant-step-inline-add"
      :style="{ left: `${line.midX}px`, top: `${line.midY}px` }"
    >
      <template #trigger>
        <button
          type="button"
          class="assistant-step-inline-add-btn d-flex align-items-center justify-content-center"
          aria-label="Add step between connected nodes"
        >
          <img src="../../assets/plus-round.svg" width="11" height="11" class="d-block invert-to-white opacity-90">
        </button>
      </template>
    </StepOptionsDropdown>

    <TransitionGroup name="nodes">
      <div
        v-for="node in nodes"
        :key="node.id"
        class="assistant-step border rounded bg-white"
        :class="{ 'assistant-step--has-incoming': hasIncomingConnection(node.id) }"
        draggable
        :data-step-id="node.id"
        :style="{ transform: `translate3d(${node.x}px, ${node.y}px, 0)`}"
        @click="toggleSidebar(node.id)"
      >
        <div class="assistant-step-connector assistant-step-connector--top" aria-hidden="true" />
        <div
          v-show="showEditorComments"
          class="add-comment-to-step bg-white px-2.5 py-2.5 rounded-circle d-flex align-items-center justify-content-center"
        >
          <img src="../../assets/comment.svg" width="18" height="18" class="d-block">
        </div>

        <div class="assistant-step-header border-bottom px-2.5 py-2.5 d-flex align-items-center justify-content-start">
          <div v-if="node.type === 'schedule'" style="border-radius: 0.25rem;" class="bg-schedule me-2 p-1">
            <img src="../../assets/sim-ai/calendar.svg" width="16" height="16" class="d-block">
          </div>
          <div v-if="node.type === 'lookup'" style="border-radius: 0.25rem;" class="bg-lookup me-2 p-1">
            <img src="../../assets/sim-ai/lookup.svg" width="16" height="16" class="d-block">
          </div>
          <h6 class="fw-bold mb-0 me-2">
            {{  node.title }}
          </h6>
          <img src="../../assets/edit.svg" width="12" height="12" class="opacity-25 me-3">
          <div class="assistant-step-menu ms-auto" data-step-menu-root>
            <button
              type="button"
              class="assistant-step-menu-trigger assistant-step-control"
              aria-label="Step actions"
              @click.stop="toggleStepMenu(node.id)"
            >
              <img src="../../assets/ellipses.svg" width="14" height="14" class="assistant-step-menu-trigger__icon">
            </button>
            <div v-if="isStepMenuOpen(node.id)" class="assistant-step-menu-panel dropdown-menu show">
              <button type="button" class="dropdown-item" @click.stop="duplicateStep(node.id)">Duplicate Step</button>
              <button type="button" class="dropdown-item" @click.stop="removeAllConnections(node.id)">Remove All Connections</button>
              <button type="button" class="dropdown-item" @click.stop="deleteStep(node.id)">Delete Step</button>
            </div>
          </div>
        </div>
        <div class="assistant-step-details">
          <button
            type="button"
            class="assistant-step-details-toggle assistant-step-control px-2.5 py-1"
            @click.stop="toggleNodeDetails(node.id)"
          >
            <span>Details</span>
            <img
              src="../../assets/arrow-down-b.svg"
              width="11"
              height="11"
              class="assistant-step-details-caret"
              :class="{ 'assistant-step-details-caret--collapsed': node.detailsCollapsed }"
            >
          </button>
          <div v-show="!node.detailsCollapsed" class="assistant-step-details-content p-2 not-as-small text-black">
            <table class="w-100 table table-borderless table-sm mb-0">
              <tbody>
                <tr 
                  v-for="(value, key) in node.data"
                  :key="key"
                >
                  <td class="text-muted text-capitalize assistant-step-detail__key">
                    {{ key }}
                  </td>
                  <td class="text-end assistant-step-detail__val">
                    {{ value }}
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- <div
              v-for="(value, key) in node.data"
              :key="key"
              class="d-flex align-items-center mb-1"
            >
              <span class="text-muted me-3 text-capitalize">{{ key }}</span>
              <span class="ms-auto">{{ value }}</span>
            </div> -->
          </div>
        </div>
        <div class="assistant-step-connector assistant-step-connector--bottom" aria-hidden="true" />
      </div>
    </TransitionGroup>

    <StepOptionsDropdown
      v-if="!nodes.length"
      class="assistant-step assistant-step--add"
    >
      <template #trigger>
        <div class="border rounded-sm fw-medium bg-white py-2.5 px-3 reduced text-center">
          <span class="me-1">&plus;</span>
          Add Step
        </div>
      </template>
    </StepOptionsDropdown>

    <!-- <div class="assistant-step border rounded bg-white" data-step-id="1" draggable>
      <div class="border-bottom px-2.5 py-2.5 d-flex align-items-center justify-content-start">
        <div style="background-color: rgb(123, 104, 238); border-radius: 0.25rem;" class="me-2 p-1">
          <img src="../../assets/sim-ai/calendar.svg" width="16" height="16" class="d-block">
        </div>
        <h6 class="fw-bold mb-0">Schedule</h6>
      </div>
      <div class="px-2.5 py-2.5 not-as-small text-black">
        <div class="d-flex align-items-center mb-1">
          <span class="text-muted me-3">Frequency</span>
          <span class="ms-auto">Once Daily</span>
        </div>
        <div class="d-flex align-items-center mb-1">
          <span class="text-muted me-3">Time</span>
          <span class="ms-auto">09:00 am</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="text-muted me-3">Timezone</span>
          <span class="ms-auto">CST</span>
        </div>
      </div>
    </div> -->

    <div class="builder-zoom">
      <button class="builder-action--zoom-in btn btn-sm btn-light bg-white py-1 px-2.5 fw-bold">
        &plus;
      </button>
      <button class="builder-action--zoom-out btn btn-sm btn-light bg-white py-1 px-2.5 fw-bold">
        &minus;
      </button>
    </div>
    <div class="assistant-step-floating-controls d-flex align-items-center gap-3">
      <button
        type="button"
        class="assistant-step-floating-mini-btn assistant-step-control d-flex align-items-center justify-content-center"
        aria-label="Undo"
        @click.stop="handleUndoClick"
      >
        <img src="../../assets/undo.svg" width="14" height="14" class="d-block opacity-75">
      </button>
      <button
        type="button"
        class="assistant-step-floating-mini-btn assistant-step-control d-flex align-items-center justify-content-center"
        :class="{ 'assistant-step-floating-mini-btn--inactive': !showEditorComments }"
        aria-label="Toggle comments"
        @click.stop="toggleEditorComments"
      >
        <img src="../../assets/comment.svg" width="14" height="14" class="d-block">
      </button>
      <StepOptionsDropdown class="assistant-step-floating-add">
        <template #trigger>
          <button class="add-builder-node btn btn-dark rounded-circle d-flex align-items-center justify-content-center">
            <img src="../../assets/plus-round.svg" width="20" height="20" class="d-block invert-to-white">
          </button>
        </template>
      </StepOptionsDropdown>
    </div>
  </article>
</template>

<style lang="scss" scoped>

.assistant-builder-canvas {
  background-image: radial-gradient(circle, var(--bs-gray-300), 1px, transparent 0);
  background-size: 12px 12px;
  background-position: 2px 4px;
  cursor: move;
  overflow: hidden;
  position: relative;
  touch-actions: none;
}

.assistant-step-connections {
  height: 100%;
  inset: 0;
  pointer-events: none;
  position: absolute;
  width: 100%;
  z-index: 1;
}

.assistant-step-connection-line {
  fill: none;
  stroke: var(--bs-gray-400);
  stroke-dasharray: 5 6;
  stroke-linecap: round;
  stroke-width: 2;
  animation: assistant-step-connection-flow 1.8s linear infinite;
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

@keyframes assistant-step-connection-flow {
  to {
    stroke-dashoffset: -22;
  }
}

.assistant-step {
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  cursor: grab;
  margin: 0 auto;
  max-width: 18rem;
  position: relative;
  transform: translate3d(0,0,0);
  user-select: none;
  will-change: transform;
  z-index: 2;

  &:active {
    cursor: grabbing;
  }
}

.assistant-step-control {
  cursor: pointer;
}

.assistant-step-header {
  min-height: 2.5rem;
}

.assistant-step-menu {
  position: relative;
}

.assistant-step-menu-trigger {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 0.25rem;
  display: inline-flex;
  justify-content: center;
  line-height: 0;
  padding: 0.125rem;
}

.assistant-step-menu-trigger__icon {
  display: block;
  opacity: 0.55;
  transform: rotate(90deg);
}

.assistant-step-menu-panel {
  display: block;
  left: auto;
  margin-top: 0.35rem;
  min-width: 12.5rem;
  right: 0;
  top: 100%;
  z-index: 12;
}

.assistant-step-details-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--bs-gray-600);
  display: flex;
  font-size: 0.625rem;
  font-weight: 600;
  justify-content: space-between;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  width: 100%;
}

.assistant-step-details {
  background-color: transparent;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  overflow: hidden;
  transition: background-color 120ms ease-in-out;
}

.assistant-step-details:hover {
  background-color: var(--bs-gray-100);
}

.assistant-step-details-content {
  background-color: transparent;
}

.assistant-step-details-caret {
  opacity: 0.55;
  transition: transform 120ms ease-in-out;
}

.assistant-step-details-caret--collapsed {
  transform: rotate(-90deg);
}

.assistant-step-connector {
  background-color: var(--bs-dark);
  border-radius: 0.3rem;
  height: 0.5rem;
  left: 50%;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  width: 1rem;
}

.assistant-step-connector--top {
  opacity: 0;
  top: 0;
  transform: translate(-50%, -50%);
  transition: opacity 120ms ease-in-out;
}

.assistant-step-connector--bottom {
  bottom: -0.28rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.28);
}

.assistant-step:hover .assistant-step-connector--top,
.assistant-step--has-incoming .assistant-step-connector--top {
  opacity: 1;
}

table {
  table-layout: auto;
  width: 100%;
}

.assistant-step-detail__key {
  white-space: nowrap;
  width: 1%;
}

.assistant-step-detail__val {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.add-comment-to-step {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  opacity: 0;
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translate(-1.5rem, -50%);

  img {
    transform: translateY(14%);
  }

  .assistant-step:hover & {
    opacity: 1;
  }
}

.builder-zoom {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  right: 2.25rem;
  top: 1.5rem;
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

.assistant-step-floating-mini-btn--inactive img {
  opacity: 0.35;
}

.add-builder-node {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  height: 2.7rem;
  padding: 0;
  width: 2.7rem;
}

:deep(.assistant-step-floating-add.step-options-dropdown .step-options-menu) {
  bottom: calc(100% + 0.35rem);
  left: auto;
  margin-top: 0;
  right: 0;
  top: auto;
}

.nodes-enter-active,
.nodes-leave-active {
  transition: all 0.2s ease-in-out;
  will-change: opacity;
}

.nodes-enter-from,
.nodes-leave-to {
  opacity: 0;
}

.assistant-step--add {
  border-radius: 0.5rem;
  display: inline-block;
  left: 50%;
  position: absolute;
  transform: translate3d(-50%, -50%, 0);
  top: 50%;
}

.bg-ivy {
  background-color: $left-nav-background !important;
}
</style>
