<script setup>
import { computed, nextTick, ref, watch } from "vue";
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import AddStepMenuContent from "./AddStepMenuContent.vue";
import {
  getBranchConnections,
  getAddStepMenuGroups,
  getContainerInnerSections,
  getSplitConditionSections,
  getVisibleStepRows,
} from "./stepRuntime";
import {
  isStepWarningVisible,
} from "./mockSteps";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  nodeIndex: {
    type: Number,
    required: true,
  },
  showEditorComments: {
    type: Boolean,
    default: true,
  },
  isComposerOpen: {
    type: Boolean,
    default: false,
  },
  commentComposerText: {
    type: String,
    default: "",
  },
  startBlockOptions: {
    type: Array,
    default: () => [],
  },
  isReorderingNodes: {
    type: Boolean,
    default: false,
  },
  hasIncomingConnection: {
    type: Boolean,
    default: false,
  },
  isActiveConnectionDragSource: {
    type: Boolean,
    default: false,
  },
  isActiveConnectionDragTarget: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "select-step",
  "open-comment-composer",
  "close-comment-composer",
  "update-comment-text",
  "save-comment",
  "comment-keydown",
  "connector-pointerdown",
  "connector-pointerhover",
  "connector-pointerleave",
  "toggle-node-details",
  "duplicate-step",
  "remove-connections",
  "delete-step",
  "select-start-block",
  "add-split-else-if",
  "add-branch-step",
  "set-inner-step",
  "add-inner-step",
]);

const commentComposerInput = ref(null);
const addStepMenuGroups = computed(() => getAddStepMenuGroups());
const visibleRows = computed(() => getVisibleStepRows(props.node));
const branchConditionSections = computed(() => (
  props.node.type === "split"
    ? getSplitConditionSections(props.node.data)
    : []
));
const isContainerStep = computed(() => props.node.type === "parallel" || props.node.type === "loop");
const isSplitContainerStep = computed(() => props.node.type === "split");
const hasBranchContainer = computed(() => isContainerStep.value || isSplitContainerStep.value);
const splitBranchConnections = computed(() => (
  isSplitContainerStep.value
    ? getBranchConnections(props.node?.data, props.node?.type)
    : {}
));
const containerInnerSections = computed(() => {
  if (!isContainerStep.value) {
    return [];
  }

  return getContainerInnerSections(props.node?.data, props.node.type);
});

watch(
  () => props.isComposerOpen,
  (isOpen) => {
    if (!isOpen) {
      return;
    }

    nextTick(() => {
      commentComposerInput.value?.focus();
    });
  },
);

function hasStepDetailValue(value) {
  return String(value ?? "").trim().length > 0;
}

function formatStepDetailValue(row) {
  const value = props.node.data?.[row?.dataKey];
  if (hasStepDetailValue(value)) {
    return String(value).trim();
  }

  return row?.placeholder || "-";
}

function isPlaceholderStepDetailValue(row) {
  return !hasStepDetailValue(props.node.data?.[row?.dataKey]);
}

function shouldShowStepRowWarning(row) {
  return Boolean(
    row?.isCode
      && hasStepDetailValue(props.node.data?.[row.dataKey])
      && isStepWarningVisible(
        props.node.stateKey || props.node.id,
        row.dataKey,
        row.showWarning,
      ),
  );
}

function handleConnectorPointerDown(event, connectorKind) {
  emit("connector-pointerdown", {
    event,
    nodeId: props.node.id,
    connectorKind,
  });
}

function handleConnectorPointerHover(event, connectorKind) {
  emit("connector-pointerhover", {
    event,
    nodeId: props.node.id,
    connectorKind,
  });
}

function handleConnectorPointerLeave(connectorKind) {
  emit("connector-pointerleave", {
    nodeId: props.node.id,
    connectorKind,
  });
}

function handleCommentInput(event) {
  emit("update-comment-text", event.target.value);
}

function handleCommentKeydown(event) {
  emit("comment-keydown", {
    event,
    nodeId: props.node.id,
  });
}

function handleStartBlockSelect(mode, close) {
  emit("select-start-block", mode);
  close();
}

function formatSplitConditionValue(section) {
  const value = String(section?.value ?? "").trim();
  if (value.length > 0) {
    return value;
  }

  return section?.placeholder || "-";
}

function isSplitConditionPlaceholder(section) {
  return String(section?.value ?? "").trim().length === 0;
}

function isSplitBranchConnected(connectorKind) {
  return Boolean(splitBranchConnections.value?.[connectorKind]);
}

function handleContainerSectionSelection(sectionIndex, item, close) {
  emit("set-inner-step", {
    nodeId: props.node.id,
    sectionIndex,
    item,
  });
  close();
}

function handleContainerAddSelection(item, close) {
  emit("add-inner-step", {
    nodeId: props.node.id,
    item,
  });
  close();
}

function handleSplitBranchAddSelection(connectorKind, item, close) {
  const connectorEl = document.querySelector(
    `.assistant-step-connector[data-step-id="${String(props.node.id)}"][data-connector-kind="${String(connectorKind)}"]`,
  );
  const connectorRect = connectorEl instanceof HTMLElement
    ? connectorEl.getBoundingClientRect()
    : null;

  emit("add-branch-step", {
    nodeId: props.node.id,
    connectorKind,
    item,
    connectorCenterClient: connectorRect
      ? {
        x: connectorRect.left + (connectorRect.width / 2),
        y: connectorRect.top + (connectorRect.height / 2),
      }
      : null,
  });
  close();
}
</script>

<template>
  <div
    class="assistant-step border rounded"
    :class="{
      'assistant-step--has-incoming': hasIncomingConnection,
      'assistant-step--reordering': isReorderingNodes,
      'assistant-step--container': hasBranchContainer,
      'bg-white': !hasBranchContainer,
      'bg-titan-white': hasBranchContainer,
      'border-primary': isActiveConnectionDragSource || isActiveConnectionDragTarget,
    }"
    draggable
    :data-step-id="node.id"
    :style="{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }"
    @click="emit('select-step', node.id)"
  >
    <div
      v-if="showEditorComments"
      class="assistant-step-comments assistant-step-control"
      :class="[
        nodeIndex % 2 === 0 ? 'assistant-step-comments--left' : 'assistant-step-comments--right',
        { 'assistant-step-comments--composer-open': isComposerOpen },
      ]"
      @click.stop
    >
      <div
        v-for="(comment, commentIndex) in node.comments"
        :key="`${node.id}-comment-${commentIndex}`"
        class="assistant-step-comment-item"
      >
        <div class="assistant-step-comment-box bg-iceberg-blue border rounded-sm p-2 true-small text-info-emphasis">
          <div class="assistant-step-comment-box__body">
            <span class="assistant-step-comment-box__author fw-semibold">{{ comment.author }}:</span>
            <span>{{ comment.body }}</span>
          </div>
        </div>
        <div class="assistant-step-comment-box__meta smallest text-info-emphasis">
          Step {{ nodeIndex + 1 }}<template v-if="comment.stamp"> &bull; {{ comment.stamp }}</template>
        </div>
      </div>

      <div
        v-if="isComposerOpen"
        class="assistant-step-comment-item assistant-step-comment-item--composer"
      >
        <div class="assistant-step-comment-compose bg-white border rounded-sm p-2 assistant-step-control">
          <textarea
            ref="commentComposerInput"
            class="assistant-step-comment-compose__input form-control form-control-sm true-small assistant-step-control"
            rows="3"
            placeholder="Add a comment"
            :value="commentComposerText"
            @click.stop
            @input="handleCommentInput"
            @keydown="handleCommentKeydown"
          />
          <div class="d-flex justify-content-end gap-1 mt-2">
            <button
              type="button"
              class="btn btn-sm btn-white border rounded-sm true-small assistant-step-control"
              @click.stop="emit('close-comment-composer')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-sm bg-dark text-white rounded-sm true-small assistant-step-control"
              :disabled="!commentComposerText.trim()"
              @click.stop="emit('save-comment', node.id)"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <button
        v-if="!isComposerOpen"
        type="button"
        class="assistant-step-comment-add assistant-step-control d-flex align-items-center justify-content-center"
        :class="{ 'assistant-step-comment-add--centered': node.comments?.length }"
        aria-label="Add comment"
        @click.stop="emit('open-comment-composer', node.id)"
      >
        <img src="../../assets/comment.svg" width="13" height="13" class="d-block opacity-50">
      </button>
    </div>

    <div
      v-tooltip="{ content: 'Click to remove. Drag to change.', placement: 'right' }"
      class="assistant-step-connector assistant-step-connector--top assistant-step-control"
      :class="{
        'assistant-step-connector--active-target': isActiveConnectionDragTarget,
        'assistant-step-connector--drag-source': isActiveConnectionDragSource,
      }"
      :data-step-id="node.id"
      data-connector-kind="top"
      role="button"
      @pointerdown.stop.prevent="handleConnectorPointerDown($event, 'top')"
      @pointerover="handleConnectorPointerHover($event, 'top')"
      @pointermove="handleConnectorPointerHover($event, 'top')"
      @pointerleave="handleConnectorPointerLeave('top')"
      @click.stop
    />

    <div
      class="assistant-step-header px-2.5 py-2.5 d-flex align-items-center justify-content-start"
      :class="{
        'border-bottom': !node.detailsCollapsed && !hasBranchContainer,
        'assistant-step-header--collapsed': node.detailsCollapsed,
      }"
    >
      <div
        v-if="node.typeMeta && !node.isStartBlock"
        style="border-radius: 0.25rem;"
        class="me-2 p-1"
        :class="node.typeMeta.bgClass"
      >
        <img
          :src="node.typeMeta.icon"
          width="16"
          height="16"
          class="d-block"
          :class="{ 'invert-to-white': node.typeMeta.iconInvert }"
        >
      </div>

      <StepOptionsDropdown
        v-if="node.isStartBlock"
        class="assistant-step-start-switcher me-2"
        placement="bottom-start"
        menu-class="assistant-step-start-switcher-menu"
        @click.stop
      >
        <template #trigger>
          <button
            type="button"
            class="assistant-step-start-switcher__trigger assistant-step-control d-flex"
            aria-label="Change starting block"
          >
            <span class="assistant-step-start-switcher__pill true-small fw-medium text-white d-inline-flex align-items-center rounded-pill px-2 py-0" :class="node.typeMeta.bgClass">
              <img
                :src="node.typeMeta.icon"
                width="14"
                height="14"
                class="d-block me-1"
                :class="{ 'invert-to-white': node.typeMeta.iconInvert }"
              >
              <span>{{ node.title || node.typeMeta.label }}</span>
              <img src="../../assets/dropdown.svg" width="11" height="11" class="assistant-step-start-switcher__caret ms-3">
            </span>
          </button>
        </template>
        <template #menu="{ close }">
          <div class="assistant-step-add-menu__label true-small text-muted px-2 pb-1">Starting Blocks</div>
          <button
            v-for="option in startBlockOptions"
            :key="option.key"
            type="button"
            class="dropdown-item d-flex align-items-center text-start"
            @click.stop="handleStartBlockSelect(option.key, close)"
          >
            <span class="assistant-step-menu-item__icon me-2 rounded-sm d-inline-flex align-items-center justify-content-center" :class="option.typeMeta.bgClass">
              <img
                :src="option.typeMeta.icon"
                width="12"
                height="12"
                class="d-block"
                :class="{ 'invert-to-white': option.typeMeta.iconInvert }"
              >
            </span>
            <span>{{ option.label }}</span>
          </button>
        </template>
      </StepOptionsDropdown>

      <h6 v-if="!node.isStartBlock" class="mb-0 me-2">
        {{ node.title }}
      </h6>

      <div class="assistant-step-header-actions ms-auto d-flex align-items-center">
        <button
          v-if="!hasBranchContainer"
          type="button"
          class="assistant-step-header-toggle assistant-step-control me-1"
          aria-label="Toggle step details"
          @click.stop="emit('toggle-node-details', node.id)"
        >
          <img
            src="../../assets/arrow-down-b.svg"
            width="11"
            height="11"
            class="assistant-step-details-caret"
            :class="{ 'assistant-step-details-caret--collapsed': node.detailsCollapsed }"
          >
        </button>

        <StepOptionsDropdown
          class="assistant-step-menu"
          placement="bottom-end"
          menu-class="assistant-step-menu-panel"
          @click.stop
        >
          <template #trigger>
            <button
              type="button"
              class="assistant-step-menu-trigger assistant-step-control"
              aria-label="Step actions"
            >
              <img src="../../assets/ellipses.svg" width="14" height="14" class="assistant-step-menu-trigger__icon">
            </button>
          </template>
          <template #menu="{ close }">
            <button type="button" class="dropdown-item" @click.stop="emit('duplicate-step', node.id); close()">Duplicate Step</button>
            <button type="button" class="dropdown-item" @click.stop="emit('remove-connections', node.id); close()">Remove Connections</button>
            <button type="button" class="dropdown-item" @click.stop="emit('delete-step', node.id); close()">Delete Step</button>
          </template>
        </StepOptionsDropdown>
      </div>
    </div>

    <div class="assistant-step-details">
      <div
        v-show="!node.detailsCollapsed"
        class="true-small text-black"
        :class="hasBranchContainer ? 'px-4 pb-4 pt-3' : 'px-2.5 py-2'"
      >
        <div v-if="isContainerStep" class="assistant-step-container-body d-flex flex-column">
          <table
            v-if="node.type === 'loop' && visibleRows.length"
            class="assistant-step-container-details table table-borderless table-sm w-100"
          >
            <tbody>
              <tr
                v-for="row in visibleRows"
                :key="row.key"
              >
                <td class="text-muted assistant-step-detail__key">
                  <span class="assistant-step-detail__key-label">
                    <span>{{ row.key }}</span>
                  </span>
                </td>
                <td class="assistant-step-detail__val">
                  <div
                    v-if="isPlaceholderStepDetailValue(row)"
                    class="text-body-tertiary"
                  >
                    &dash;
                  </div>
                  <div
                    v-else
                    class="assistant-step-detail__val-text"
                  >
                    {{ formatStepDetailValue(row) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="assistant-step-container-sections d-flex align-items-start">
            <section
              v-for="(section, sectionIndex) in containerInnerSections"
              :key="`${node.id}-container-${section.id}`"
              class="assistant-step-container-branch"
            >
              <StepOptionsDropdown
                class="assistant-step-container-branch-selector"
                placement="bottom-start"
                menu-class="assistant-step-container-menu"
                @click.stop
              >
                <template #trigger>
                  <button
                    type="button"
                    class="assistant-step-container-branch-selector__trigger assistant-step-control"
                    :aria-label="`Choose inner step for branch ${sectionIndex + 1}`"
                  >
                    <span
                      class="assistant-step-container-branch-pill true-small fw-semibold rounded-pill px-2 py-0 d-inline-flex align-items-center"
                      :class="{ 'assistant-step-container-branch-pill--placeholder': !section.type }"
                    >
                      <span>{{ section.label }}</span>
                      <img src="../../assets/arrow-down-b.svg" width="10" height="10" class="assistant-step-container-branch-pill__caret ms-1">
                    </span>
                  </button>
                </template>
                <template #menu="{ close }">
                  <AddStepMenuContent
                    :groups="addStepMenuGroups"
                    :close-menu="close"
                    @select="(item) => handleContainerSectionSelection(sectionIndex, item, close)"
                  />
                </template>
              </StepOptionsDropdown>
              <div
                class="assistant-step-container-branch-value mt-2"
                :class="{ 'assistant-step-container-branch-value--placeholder': !section.type }"
              >
                {{ section.type ? "Selected inner box" : "Select an inner box type." }}
              </div>
              <div
                v-tooltip="{ content: 'Click to remove. Drag to change.', placement: 'right' }"
                class="assistant-step-connector assistant-step-connector--parallel-branch assistant-step-control"
                :data-step-id="node.id"
                :data-connector-kind="section.connectorKind"
                role="button"
                @pointerdown.stop.prevent="handleConnectorPointerDown($event, section.connectorKind)"
                @pointerover="handleConnectorPointerHover($event, section.connectorKind)"
                @pointermove="handleConnectorPointerHover($event, section.connectorKind)"
                @pointerleave="handleConnectorPointerLeave(section.connectorKind)"
                @click.stop
              />
              <div class="assistant-step-parallel-branch-tail" aria-hidden="true">
                <span class="assistant-step-parallel-branch-tail__line" />
                <span
                  class="assistant-step-parallel-branch-tail__plus d-inline-flex align-items-center justify-content-center fw-semibold assistant-step-branch-anchor"
                  :data-step-id="node.id"
                  :data-connector-kind="section.connectorKind"
                  :data-branch-id="section.branchId"
                >+</span>
              </div>
            </section>

            <StepOptionsDropdown
              class="assistant-step-parallel-add"
              placement="bottom-start"
              menu-class="assistant-step-container-menu"
              @click.stop
            >
              <template #trigger>
                <button
                  type="button"
                  class="assistant-step-parallel-add__trigger btn btn-white border"
                  aria-label="Add inner branch"
                >
                  +
                </button>
              </template>
              <template #menu="{ close }">
                <AddStepMenuContent
                  :groups="addStepMenuGroups"
                  :close-menu="close"
                  @select="(item) => handleContainerAddSelection(item, close)"
                />
              </template>
            </StepOptionsDropdown>
          </div>
        </div>

        <div v-else-if="isSplitContainerStep" class="assistant-step-container-body d-flex flex-column">
          <div class="assistant-step-container-sections assistant-step-split-sections d-flex align-items-start">
            <template
              v-for="section in branchConditionSections"
              :key="`${node.id}-split-${section.id}`"
            >
              <section class="assistant-step-container-branch assistant-step-split-branch">
                <span class="assistant-step-container-branch-pill assistant-step-container-branch-pill--split true-small fw-semibold rounded-pill px-2 py-0 d-inline-flex align-items-center">
                  {{ section.label }}
                </span>
                <div
                  class="assistant-step-container-branch-value mt-2"
                  :class="{ 'assistant-step-container-branch-value--placeholder': isSplitConditionPlaceholder(section) }"
                >
                  {{ formatSplitConditionValue(section) }}
                </div>
              </section>
            </template>
          </div>
        </div>

        <table v-else class="w-100 table table-borderless table-sm mb-0">
          <tbody>
            <tr
              v-for="row in visibleRows"
              :key="row.key"
            >
              <td class="text-muted assistant-step-detail__key">
                <span class="assistant-step-detail__key-label">
                  <img
                    v-if="shouldShowStepRowWarning(row)"
                    v-tooltip="{ content: `Ivy: It looks like this ${row.key.toLowerCase()} won't run as intended.`, placement: 'right' }"
                    src="../../assets/warning.svg"
                    width="12"
                    height="12"
                    class="assistant-step-detail__warning"
                    alt=""
                  >
                  <span>{{ row.key }}</span>
                </span>
              </td>
              <td class="assistant-step-detail__val">
                <div
                  v-if="isPlaceholderStepDetailValue(row)"
                  class="text-body-tertiary"
                >
                  &dash;
                </div>
                <div
                  v-else
                  class="assistant-step-detail__val-text"
                >
                  {{ formatStepDetailValue(row) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="isSplitContainerStep && !node.detailsCollapsed"
      class="assistant-step-split-branch-exits"
      @click.stop
    >
      <div
        v-for="section in branchConditionSections"
        :key="`${node.id}-split-exit-${section.id}`"
        class="assistant-step-split-branch-exit"
      >
        <div
          v-tooltip="{ content: 'Click to remove. Drag to change.', placement: 'right' }"
          class="assistant-step-connector assistant-step-connector--split-branch assistant-step-control"
          :class="{
            'assistant-step-connector--active-target': isActiveConnectionDragTarget,
            'assistant-step-connector--drag-source': isActiveConnectionDragSource,
          }"
          :data-step-id="node.id"
          :data-connector-kind="section.connectorKind"
          role="button"
          @pointerdown.stop.prevent="handleConnectorPointerDown($event, section.connectorKind)"
          @pointerover="handleConnectorPointerHover($event, section.connectorKind)"
          @pointermove="handleConnectorPointerHover($event, section.connectorKind)"
          @pointerleave="handleConnectorPointerLeave(section.connectorKind)"
          @click.stop
        />
        <div v-if="!isSplitBranchConnected(section.connectorKind)" class="assistant-step-split-branch-tail">
          <span class="assistant-step-split-branch-tail__line" />
          <StepOptionsDropdown
            class="assistant-step-split-branch-add"
            placement="bottom-start"
            menu-class="assistant-step-container-menu"
            @click.stop
          >
            <template #trigger>
              <button
                type="button"
                class="assistant-step-split-branch-add__trigger assistant-step-control assistant-step-branch-anchor"
                :data-step-id="node.id"
                :data-connector-kind="section.connectorKind"
                :data-branch-id="section.branchId"
                :aria-label="`Add a step for ${section.label}`"
              >
                <img src="../../assets/plus-round.svg" width="12" height="12" class="d-block invert-to-white" alt="">
              </button>
            </template>
            <template #menu="{ close }">
              <AddStepMenuContent
                :groups="addStepMenuGroups"
                :close-menu="close"
                @select="(item) => handleSplitBranchAddSelection(section.connectorKind, item, close)"
              />
            </template>
          </StepOptionsDropdown>
        </div>
      </div>
    </div>

    <div
      v-if="!hasBranchContainer"
      v-tooltip="{ content: 'Click to remove. Drag to change.', placement: 'right' }"
      class="assistant-step-connector assistant-step-connector--bottom assistant-step-control"
      :class="{
        'assistant-step-connector--active-target': isActiveConnectionDragTarget,
        'assistant-step-connector--drag-source': isActiveConnectionDragSource,
      }"
      :data-step-id="node.id"
      data-connector-kind="bottom"
      role="button"
      @pointerdown.stop.prevent="handleConnectorPointerDown($event, 'bottom')"
      @pointerover="handleConnectorPointerHover($event, 'bottom')"
      @pointermove="handleConnectorPointerHover($event, 'bottom')"
      @pointerleave="handleConnectorPointerLeave('bottom')"
      @click.stop
    />
  </div>
</template>

<style lang="scss" scoped>
.assistant-step {
  --assistant-step-card-width: 18rem;
  --assistant-connector-node-width: 1rem;
  --assistant-connector-node-height: 0.5rem;
  --assistant-connector-plus-size: 1.25rem;
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  cursor: grab;
  margin: 0 auto;
  max-width: var(--assistant-step-card-width);
  width: var(--assistant-step-card-width);
  position: relative;
  transform: translate3d(0,0,0);
  user-select: none;
  will-change: transform;
  z-index: 2;

  &:active {
    cursor: grabbing;
  }
}

.assistant-step--container {
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  max-width: none;
  width: fit-content;

  .assistant-step-header {
    border: 0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  .assistant-step-details {
    overflow: visible;
  }
}

.assistant-step--reordering {
  transition: transform 0.18s ease-in-out;
}

.assistant-step-control {
  cursor: pointer;
}

.assistant-step-start-switcher {
  min-width: 0;
}

.assistant-step-start-switcher__trigger {
  background: transparent;
  border: 0;
  line-height: 0;
  padding: 0;
}

.assistant-step-start-switcher__pill {
  line-height: 1.2;
  min-height: 1.25rem;
}

.assistant-step-start-switcher__caret {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.assistant-step-header--collapsed {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.assistant-step-header-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 0.25rem;
  display: inline-flex;
  justify-content: center;
  line-height: 0;
  padding: 0.125rem;
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

:deep(.assistant-step-menu-panel) {
  min-width: 12.5rem;
}

:deep(.assistant-step-start-switcher-menu) {
  min-width: 11rem;
}

.assistant-step-menu-item__icon {
  height: 1.25rem;
  width: 1.25rem;
}

.assistant-step-add-menu__label {
  letter-spacing: 0.01em;
}

.assistant-step-details {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  overflow: hidden;
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
  cursor: grab;
  height: var(--assistant-connector-node-height);
  left: 50%;
  pointer-events: auto;
  position: absolute;
  transform: translateX(-50%);
  transition: opacity 120ms ease-in-out, box-shadow 120ms ease-in-out, background-color 120ms ease-in-out;
  width: var(--assistant-connector-node-width);
}

.assistant-step-connector--top {
  opacity: 0;
  pointer-events: none;
  top: 0;
  transform: translate(-50%, -50%);
}

.assistant-step-connector--bottom {
  bottom: -0.28rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.28);
}

.assistant-step:hover .assistant-step-connector--top,
.assistant-step--has-incoming .assistant-step-connector--top,
.assistant-step-connector--top.assistant-step-connector--active-target,
.assistant-step-connector--top.assistant-step-connector--drag-source {
  opacity: 1;
  pointer-events: auto;
}

.assistant-step-connector--active-target,
.assistant-step-connector--drag-source {
  background-color: #3e4756;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.24);
}

.assistant-step-connector--drag-source {
  cursor: grabbing;
}

table {
  table-layout: auto;
  width: 100%;
}

.assistant-step-detail__key {
  overflow-wrap: normal;
  word-break: normal;
  width: min-content;
}

.assistant-step-detail__key-label {
  align-items: center;
  display: inline-flex;
  gap: 0.25rem;
}

.assistant-step-detail__warning {
  display: block;
  flex: 0 0 auto;
}

.assistant-step-detail__val {
  overflow-wrap: break-word;
  vertical-align: top;
  white-space: normal;
  word-break: normal;
}

.assistant-step-detail__val-text {
  display: block;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  line-clamp: 3;
  line-height: 1.35;
  max-height: calc(1.35em * 3);
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: normal;
}

.assistant-step-split-sections {
  gap: 1rem;
}

.assistant-step-split-branch-exits {
  bottom: 0;
  display: flex;
  gap: 1rem;
  height: 0;
  left: 1.5rem;
  pointer-events: none;
  position: absolute;
  z-index: 5;
}

.assistant-step-split-branch-exit {
  flex: 0 0 var(--assistant-step-card-width);
  height: 0;
  position: relative;
  width: var(--assistant-step-card-width);
}

.assistant-step-container-sections {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  width: max-content;
}

.assistant-step-container-branch {
  background-color: white;
  border: 1px solid var(--bs-gray-300);
  border-radius: 0.5rem;
  flex: 0 0 var(--assistant-step-card-width);
  min-width: var(--assistant-step-card-width);
  padding: 0.5rem 0.6rem 1.65rem;
  position: relative;
  width: var(--assistant-step-card-width);
}

.assistant-step-container-branch-selector__trigger {
  background: transparent;
  border: 0;
  padding: 0;
}

.assistant-step-container-branch-pill {
  background-color: var(--bs-gray-200);
  color: var(--bs-gray-700);
  line-height: 1.2;
}

.assistant-step-container-branch-pill--split {
  color: var(--bs-gray-800);
}

.assistant-step-container-branch-pill--placeholder {
  background-color: var(--bs-gray-100);
  color: var(--bs-gray-600);
}

.assistant-step-container-branch-pill__caret {
  opacity: 0.55;
}

.assistant-step-container-branch-value {
  line-height: 1.35;
  min-height: 1.2rem;
}

.assistant-step-container-branch-value--placeholder {
  color: var(--bs-secondary-color);
  opacity: 0.7;
}

.assistant-step-split-branch-tail {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 50%;
  position: absolute;
  top: calc(var(--assistant-connector-node-height) + 0.08rem);
  transform: translateX(-50%);

  &__line {
    background-image: repeating-linear-gradient(
      to bottom,
      var(--bs-gray-400) 0 5px,
      transparent 5px 11px
    );
    background-position: 50% 0;
    background-repeat: repeat-y;
    background-size: 2px 11px;
    height: 2.6rem;
    pointer-events: none;
    width: 2px;
    animation: assistant-step-split-branch-flow 1.8s linear infinite;
  }
}

.assistant-step-split-branch-add {
  align-items: center;
  display: inline-flex;
  pointer-events: auto;
}

.assistant-step-split-branch-add__trigger {
  align-items: center;
  background-color: var(--bs-dark);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  color: white;
  display: inline-flex;
  height: var(--assistant-connector-plus-size);
  justify-content: center;
  line-height: 1;
  padding: 0;
  width: var(--assistant-connector-plus-size);
}

.assistant-step-split-branch-add__trigger:hover {
  background-color: #3e4756;
}

@keyframes assistant-step-split-branch-flow {
  to {
    background-position-y: 11px;
  }
}

.assistant-step-connector--parallel-branch {
  border-radius: 0.3rem;
  bottom: -0.28rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.22);
  height: var(--assistant-connector-node-height);
  left: 50%;
  right: auto;
  top: auto;
  transform: translate(-50%, 50%);
  width: var(--assistant-connector-node-width);
}

.assistant-step-connector--split-branch {
  border-radius: 0.3rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.22);
  pointer-events: auto;
  left: 50%;
  position: absolute;
  top: -0.28rem;
  transform: translateX(-50%);
}

.assistant-step-parallel-branch-tail {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: calc(100% + 0.47rem);
  transform: translateX(-50%);

  &__line {
    background-image: repeating-linear-gradient(
      to bottom,
      var(--bs-gray-400) 0 5px,
      transparent 5px 11px
    );
    background-position: 50% 0;
    background-repeat: repeat-y;
    background-size: 2px 11px;
    height: 2.6rem;
    width: 2px;
    animation: assistant-step-split-branch-flow 1.8s linear infinite;
  }

  &__plus {
    background-color: var(--bs-dark);
    border-radius: 999px;
    color: white;
    height: var(--assistant-connector-plus-size);
    line-height: 1;
    margin-top: 0.08rem;
    width: var(--assistant-connector-plus-size);
  }
}

.assistant-step-parallel-add {
  align-items: center;
  align-self: center;
  display: inline-flex;
}

.assistant-step-parallel-add__trigger {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 1rem;
  height: 1.75rem;
  justify-content: center;
  line-height: 1;
  min-width: 1.75rem;
  padding: 0;
  width: 1.75rem;
}

.assistant-step-comments {
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 1.25rem;
  max-width: 11rem;
  position: absolute;
  top: 0.5rem;
  width: 11rem;
  z-index: 3;
}

.assistant-step-comments--left {
  align-items: flex-end;
  padding-right: 1.25rem;
  right: 100%;
}

.assistant-step-comments--right {
  align-items: flex-start;
  left: 100%;
  padding-left: 1.25rem;
}

.assistant-step-comment-item {
  position: relative;
  width: 100%;
}

.assistant-step-comment-box {
  pointer-events: auto;
}

.assistant-step-comment-compose {
  pointer-events: auto;
}

.assistant-step-comment-compose__input {
  resize: none;
}

.assistant-step-comment-box__author {
  margin-right: 0.2rem;
}

.assistant-step-comment-box__body {
  line-height: 1.35;
}

.assistant-step-comment-box__meta {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transition: opacity 120ms ease-in-out;
  transform: translateY(-50%);
  white-space: nowrap;
}

.assistant-step-comment-item:hover .assistant-step-comment-box__meta {
  opacity: 0.5;
}

.assistant-step-comments--left .assistant-step-comment-box__meta {
  right: calc(100% + 0.45rem);
  text-align: right;
}

.assistant-step-comments--right .assistant-step-comment-box__meta {
  left: calc(100% + 0.45rem);
  text-align: left;
}

.assistant-step-comment-add {
  background-color: #fff;
  border: 1px solid var(--bs-gray-300);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  height: 1.5rem;
  opacity: 0;
  padding: 0;
  pointer-events: none;
  transition: opacity 120ms ease-in-out, background-color 120ms ease-in-out;
  width: 1.5rem;
}

.assistant-step-comment-add:hover {
  background-color: var(--bs-light);
}

.assistant-step-comment-add--centered {
  align-self: center;
}

.assistant-step:hover .assistant-step-comment-add,
.assistant-step-comments:hover .assistant-step-comment-add,
.assistant-step-comments--composer-open .assistant-step-comment-add {
  opacity: 1;
  pointer-events: auto;
}
</style>
