// src/components/assistants/AssistantBuilder.vue

<script setup>

import interact from "interactjs";
import { onMounted, reactive, defineEmits, defineProps, watch, ref } from "vue";

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

const showDropdown = ref(false);

function findNodeById(id) {
  return nodes.find(n => String(n.id) === String(id));
}

const GRID_SIZE = 12;
function snapToGrid(val, grid = GRID_SIZE) {
  return Math.round(val / grid) * grid;
}

onMounted(() => {
  const nodeInteraction = interact(".assistant-step").draggable({
    inertia: true,
    listeners: {
      move(event) {
        const el = event.target;;
        const node = findNodeById(el?.dataset?.stepId);
        if (!node) {
          return;
        }

        node.x += event.dx;
        node.y += event.dy;

        el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
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
      },
    },
  });
});

/* BEGIN MOCK DATA */

const scheduleNode = { id: 1, type: "schedule", title: "Every Morning", data: { frequency: "Once Daily", time: "09:00 am", timezone: "CST"}, connections: [2], x: 0,  y: 0 };
const lookupNewNode = { id: 2, type: "lookup", title: "Get SP Audit Data", data: { source: "SharePoint", list: "SP GetAudit", code: "Get yesterday's SharePoint audit activity if present." }, connections: [],  x: 0, y: 60 };
const emailDataNode = { id: 3, type: "schedule", title: "Do something", data: { frequency: "Once Daily", time: "09:00 am", timezone: "CST"}, connections: [2], x: 0,  y: 120 };

const nodes = reactive([]);

function cloneNodeTemplate(node) {
  return {
    ...node,
    data: { ...node.data },
    connections: [...node.connections],
  };
}

watch(
  () => props.currentBuilderStep,
  (newStep) => {
    nodes.splice(0, nodes.length);

    if (newStep >= 1) nodes.push(cloneNodeTemplate(scheduleNode));
    if (newStep >= 2) nodes.push(cloneNodeTemplate(lookupNewNode));
    if (newStep >= 3) nodes.push(cloneNodeTemplate(emailDataNode));
  },
  { immediate: true },
);

/* END MOCK DATA */

</script>

<template>
  <article class="assistant-builder-canvas" ref="canvas">
    <TransitionGroup name="nodes">
      <div
        v-for="node in nodes"
        :key="node.id"
        class="assistant-step border rounded bg-white"
        draggable
        :data-step-id="node.id"
        :style="{ transform: `translate3d(${node.x}px, ${node.y}px, 0)`}"
        @click="toggleSidebar(node.id)"
      >
        <div class="add-comment-to-step bg-white px-2.5 py-2.5 rounded-circle d-flex align-items-center justify-content-center">
          <img src="../../assets/comment.svg" width="18" height="18" class="d-block">
        </div>

        <div class="border-bottom px-2.5 py-2.5 d-flex align-items-center justify-content-start">
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
          <img src="../../assets/arrow-down-b.svg" width="14" height="14" class="ms-auto opacity-50">
        </div>
        <div class="p-2 not-as-small text-black">
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
    </TransitionGroup>

    <div
      v-if="!nodes.length"
      class="assistant-step assistant-step--add dropdown"
    >
      <div 
        class="border rounded-sm fw-medium bg-white py-2.5 px-3 reduced text-center"
        @click="showDropdown = !showDropdown"
      >
        <span class="me-1">&plus;</span>
        Add Step
      </div>
      <div 
        class="dropdown-menu"
        :class="{ 'show': showDropdown }"
      >
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-lookup me-2 p-1">
            <img src="../../assets/sim-ai/lookup.svg" height="12" width="12" class="d-block">
          </div>
          <span>Data Source(s)</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-trigger me-2 p-1">
            <img src="../../assets/sim-ai/trigger.svg" height="12" width="12" class="invert-to-white d-block">
          </div>
          <span>Trigger</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-schedule me-2 p-1">
            <img src="../../assets/sim-ai/calendar.svg" height="12" width="12" class="d-block">
          </div>
          <span>Schedule</span>
        </a>
        <hr class="my-2 mx-1 border-top border-body-subtle opacity-100">
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-split me-2 p-1">
            <img src="../../assets/sim-ai/split.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Conditional Split</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-parallel me-2 p-1">
            <img src="../../assets/sim-ai/parallel.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Parallel Steps</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-wait me-2 p-1">
            <img src="../../assets/sim-ai/wait.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Wait/Delay</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-loop me-2 p-1">
            <img src="../../assets/sim-ai/loop.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Loop</span>
        </a>
        <hr class="my-2 mx-1 border-top border-body-subtle opacity-100">
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-primary me-2 p-1">
            <img src="../../assets/sim-ai/action.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Ivy Action</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-code me-2 p-1">
            <img src="../../assets/sim-ai/code.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Run Code</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-note me-2 p-1">
            <img src="../../assets/sim-ai/note.svg" height="12" width="12" class="d-block">
          </div>
          <span>Create Note</span>
        </a>
        <a href="#" class="dropdown-item d-flex align-items-center">
          <div style="border-radius: 0.25rem;" class="bg-alert me-2 p-1">
            <img src="../../assets/sim-ai/alert.svg" height="12" width="12" class="d-block invert-to-white">
          </div>
          <span>Set Alert</span>
        </a>
      </div>
    </div>

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
    <button class="add-builder-node btn btn-dark px-2.5 py-2.5 rounded-circle d-flex align-items-center justify-content-center">
      <img src="../../assets/plus-round.svg" width="20" height="20" class="d-block invert-to-white">
    </button>
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

.assistant-step {
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  cursor: grab;
  margin: 0 auto;
  max-width: 18rem;
  position: relative;
  transform: translate3d(0,0,0);
  user-select: none;
  will-change: transform;

  &:active {
    cursor: grabbing;
  }
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

.add-builder-node {
  bottom: 1.5rem;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20);
  position: absolute;
  right: 1.5rem;
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
