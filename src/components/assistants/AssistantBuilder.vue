// src/components/assistants/AssistantBuilder.vue

<script setup>

import interact from "interactjs";
import { onMounted, onBeforeUnmount, reactive, defineEmits, defineProps, watch, ref, nextTick, computed } from "vue";
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import { createBuilderNodeTemplates } from "./mockSteps";

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
const terminalAddControls = ref([]);
const canvasSize = reactive({ width: 0, height: 0 });
const viewportSize = reactive({ width: 0, height: 0 });
const showEditorComments = ref(true);
const hoveredConnectionKey = ref(null);
const panOffset = reactive({ x: 0, y: 0 });
const panState = reactive({ startX: 0, startY: 0, baseX: 0, baseY: 0 });
const isPanning = ref(false);
const isRecentering = ref(false);
const isReorderingNodes = ref(false);
const isDraggingStepNode = ref(false);
const DEFAULT_ZOOM = 0.875;
const zoomLevel = ref(DEFAULT_ZOOM);
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const RECENTER_TRANSITION_MS = 160;
const REORDER_TRANSITION_MS = 180;

const reorderDrag = reactive({
  active: false,
  moved: false,
  originLineKey: null,
  originConnectionSourceId: null,
  originConnectionTargetId: null,
  pointerX: 0,
  pointerY: 0,
  startX: 0,
  startY: 0,
  sourceId: null,
  sourceKind: "",
  sourceX: 0,
  sourceY: 0,
  targetId: null,
  targetKind: "",
  targetX: 0,
  targetY: 0,
});

const connectionMenu = reactive({
  open: false,
  sourceId: null,
  targetId: null,
  anchorX: 0,
  anchorY: 0,
  left: 0,
  top: 0,
});

const connectionMenuEl = ref(null);
const connectionHintTooltip = reactive({
  open: false,
  left: 0,
  top: 0,
});
const REORDER_DRAG_THRESHOLD = 8;
const CONNECTION_MENU_OFFSET = 10;
const CONNECTION_MENU_PADDING = 8;
const CONNECTION_TOOLTIP_OFFSET = 12;

const canvasPanStyle = computed(() => ({
  backgroundPosition: `${panOffset.x + 2}px ${panOffset.y + 4}px`,
}));

const sceneTranslateStyle = computed(() => ({
  transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
}));

const sceneScaleStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
}));

const areAllDetailsCollapsed = computed(() => (
  nodes.length > 0 && nodes.every((node) => node.detailsCollapsed)
));

const highlightedConnectionKey = computed(() => {
  if (hoveredConnectionKey.value) {
    return hoveredConnectionKey.value;
  }

  if (connectionMenu.open && connectionMenu.sourceId && connectionMenu.targetId) {
    return `${connectionMenu.sourceId}-${connectionMenu.targetId}`;
  }

  return null;
});

const hiddenDraggedConnectionKey = computed(() => (
  reorderDrag.active && reorderDrag.moved ? reorderDrag.originLineKey : null
));

function findNodeById(id) {
  return nodes.find(n => String(n.id) === String(id));
}

function findIncomingConnection(nodeId) {
  const selectedId = String(nodeId);
  const sourceNode = nodes.find((node) => node.connections?.some((target) => String(target) === selectedId));
  if (!sourceNode) {
    return null;
  }

  return {
    sourceId: String(sourceNode.id),
    targetId: selectedId,
  };
}

function hasIncomingConnection(nodeId) {
  return nodes.some((node) => node.connections?.some((target) => String(target) === String(nodeId)));
}

function isActiveConnectionDragSource(nodeId) {
  return reorderDrag.active
    && reorderDrag.moved
    && String(reorderDrag.sourceId) === String(nodeId);
}

function isActiveConnectionDragTarget(nodeId) {
  return reorderDrag.active
    && reorderDrag.moved
    && String(reorderDrag.targetId) === String(nodeId);
}

function toggleEditorComments() {
  showEditorComments.value = !showEditorComments.value;
}

function handleUndoClick() {
  // Placeholder until undo stack behavior is implemented.
}

function syncViewportSize() {
  viewportSize.width = window.innerWidth;
  viewportSize.height = window.innerHeight;
  positionConnectionMenu();
}

function getCanvasPaddingTop() {
  if (!canvas.value) {
    return 0;
  }

  return Number.parseFloat(window.getComputedStyle(canvas.value).paddingTop) || 0;
}

function resetCanvasToBasePoint() {
  const baseTopOffset = getCanvasPaddingTop();
  panOffset.x = 0;
  panOffset.y = baseTopOffset;
  panState.baseX = 0;
  panState.baseY = baseTopOffset;
}

let recenterTimer = 0;
function beginRecenteringTransition() {
  if (recenterTimer) {
    window.clearTimeout(recenterTimer);
  }

  isRecentering.value = true;
  recenterTimer = window.setTimeout(() => {
    isRecentering.value = false;
    recenterTimer = 0;
  }, RECENTER_TRANSITION_MS);
}

function recenterCanvas() {
  beginRecenteringTransition();
  resetCanvasToBasePoint();
  zoomLevel.value = DEFAULT_ZOOM;
  scheduleConnectionLineUpdate();
}

function setZoom(nextZoom) {
  zoomLevel.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
  scheduleConnectionLineUpdate();
}

function zoomIn() {
  setZoom(zoomLevel.value + ZOOM_STEP);
}

function zoomOut() {
  setZoom(zoomLevel.value - ZOOM_STEP);
}

function canStartCanvasPan(target) {
  if (!(target instanceof Element)) {
    return true;
  }

  return !target.closest(".assistant-step, .assistant-step-control, .assistant-step-connection-hit-area, .step-options-dropdown, .builder-zoom, .assistant-step-floating-controls, .assistant-step-connection-menu");
}

function startCanvasPan(event) {
  if (event.button !== 0) {
    return;
  }

  if (!canStartCanvasPan(event.target)) {
    return;
  }

  if (recenterTimer) {
    window.clearTimeout(recenterTimer);
    recenterTimer = 0;
  }
  isRecentering.value = false;
  isPanning.value = true;
  panState.startX = event.clientX;
  panState.startY = event.clientY;
  panState.baseX = panOffset.x;
  panState.baseY = panOffset.y;
  canvas.value?.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function moveCanvasPan(event) {
  if (!isPanning.value) {
    return;
  }

  panOffset.x = panState.baseX + (event.clientX - panState.startX);
  panOffset.y = panState.baseY + (event.clientY - panState.startY);
}

function endCanvasPan(event) {
  if (!isPanning.value) {
    return;
  }

  isPanning.value = false;

  if (canvas.value?.hasPointerCapture?.(event.pointerId)) {
    canvas.value.releasePointerCapture(event.pointerId);
  }
}

function getConnectorCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + (rect.width / 2),
    y: rect.top + (rect.height / 2),
  };
}

function getConnectorElement(nodeId, connectorKind) {
  return canvas.value?.querySelector(
    `.assistant-step-connector[data-step-id="${String(nodeId)}"][data-connector-kind="${connectorKind}"]`,
  ) || null;
}

function closeConnectionMenu() {
  connectionMenu.open = false;
  connectionMenu.sourceId = null;
  connectionMenu.targetId = null;
  hoveredConnectionKey.value = null;
  hideConnectionHintTooltip();
}

function showConnectionHintTooltip(clientX, clientY) {
  const tooltipWidth = 170;
  const tooltipHeight = 28;
  const left = Math.min(
    window.innerWidth - CONNECTION_MENU_PADDING - tooltipWidth,
    Math.max(CONNECTION_MENU_PADDING, clientX + CONNECTION_TOOLTIP_OFFSET),
  );
  const top = Math.min(
    window.innerHeight - CONNECTION_MENU_PADDING - tooltipHeight,
    Math.max(CONNECTION_MENU_PADDING, clientY - (tooltipHeight / 2)),
  );

  connectionHintTooltip.open = true;
  connectionHintTooltip.left = left;
  connectionHintTooltip.top = top;
}

function hideConnectionHintTooltip() {
  connectionHintTooltip.open = false;
}

function positionConnectionMenu() {
  if (!connectionMenu.open || !connectionMenuEl.value) {
    return;
  }

  const menuRect = connectionMenuEl.value.getBoundingClientRect();
  const maxLeft = Math.max(CONNECTION_MENU_PADDING, window.innerWidth - CONNECTION_MENU_PADDING - menuRect.width);
  const maxTop = Math.max(CONNECTION_MENU_PADDING, window.innerHeight - CONNECTION_MENU_PADDING - menuRect.height);

  connectionMenu.left = Math.min(
    maxLeft,
    Math.max(CONNECTION_MENU_PADDING, connectionMenu.anchorX + CONNECTION_MENU_OFFSET),
  );
  connectionMenu.top = Math.min(
    maxTop,
    Math.max(CONNECTION_MENU_PADDING, connectionMenu.anchorY + CONNECTION_MENU_OFFSET),
  );
}

function openConnectionMenu(sourceId, targetId, clientX, clientY) {
  if (!sourceId || !targetId) {
    return;
  }

  hideConnectionHintTooltip();
  connectionMenu.open = true;
  connectionMenu.sourceId = String(sourceId);
  connectionMenu.targetId = String(targetId);
  connectionMenu.anchorX = clientX;
  connectionMenu.anchorY = clientY;
  connectionMenu.left = clientX + CONNECTION_MENU_OFFSET;
  connectionMenu.top = clientY + CONNECTION_MENU_OFFSET;

  nextTick(() => {
    positionConnectionMenu();
    requestAnimationFrame(positionConnectionMenu);
  });
}

function openConnectionMenuForLine(event, line) {
  hoveredConnectionKey.value = line.key;
  openConnectionMenu(line.sourceId, line.targetId, event.clientX, event.clientY);
}

function getConnectionForConnector(nodeId, connectorKind) {
  if (connectorKind === "bottom") {
    const node = findNodeById(nodeId);
    const targetId = node?.connections?.[0];
    if (!targetId) {
      return null;
    }

    return {
      sourceId: String(nodeId),
      targetId: String(targetId),
    };
  }

  return findIncomingConnection(nodeId);
}

function removeConnection(sourceId, targetId) {
  const sourceNode = findNodeById(sourceId);
  if (!sourceNode) {
    return;
  }

  sourceNode.connections = (sourceNode.connections || []).filter((connectionId) => String(connectionId) !== String(targetId));
  closeConnectionMenu();
  nextTick(() => scheduleConnectionLineUpdate());
}

function setHoveredConnection(lineKey) {
  hoveredConnectionKey.value = lineKey;
}

function clearHoveredConnection(lineKey) {
  if (hoveredConnectionKey.value === lineKey) {
    hoveredConnectionKey.value = null;
  }
  hideConnectionHintTooltip();
}

function handleLinePointerHover(event, lineKey) {
  setHoveredConnection(lineKey);
  showConnectionHintTooltip(event.clientX, event.clientY);
}

function handleConnectorPointerHover(event, nodeId, connectorKind) {
  const connection = getConnectionForConnector(nodeId, connectorKind);
  if (!connection) {
    hideConnectionHintTooltip();
    return;
  }

  hoveredConnectionKey.value = `${connection.sourceId}-${connection.targetId}`;
  showConnectionHintTooltip(event.clientX, event.clientY);
}

function clearConnectorHover(nodeId, connectorKind) {
  const connection = getConnectionForConnector(nodeId, connectorKind);
  if (!connection) {
    hideConnectionHintTooltip();
    return;
  }

  clearHoveredConnection(`${connection.sourceId}-${connection.targetId}`);
}

function handleDocumentPointerDown(event) {
  hideConnectionHintTooltip();
  if (!connectionMenu.open) {
    return;
  }

  const target = event.target;
  if (connectionMenuEl.value?.contains(target)) {
    return;
  }

  closeConnectionMenu();
}

function handleWindowKeyDown(event) {
  if (event.key === "Escape") {
    closeConnectionMenu();
  }
}

function resetReorderDrag() {
  reorderDrag.active = false;
  reorderDrag.moved = false;
  reorderDrag.originLineKey = null;
  reorderDrag.originConnectionSourceId = null;
  reorderDrag.originConnectionTargetId = null;
  reorderDrag.pointerX = 0;
  reorderDrag.pointerY = 0;
  reorderDrag.startX = 0;
  reorderDrag.startY = 0;
  reorderDrag.sourceId = null;
  reorderDrag.sourceKind = "";
  reorderDrag.sourceX = 0;
  reorderDrag.sourceY = 0;
  reorderDrag.targetId = null;
  reorderDrag.targetKind = "";
  reorderDrag.targetX = 0;
  reorderDrag.targetY = 0;
}

let reorderTransitionTimer = 0;
function beginNodeReorderTransition() {
  if (reorderTransitionTimer) {
    window.clearTimeout(reorderTransitionTimer);
  }

  isReorderingNodes.value = true;
  reorderTransitionTimer = window.setTimeout(() => {
    isReorderingNodes.value = false;
    reorderTransitionTimer = 0;
  }, REORDER_TRANSITION_MS);
}

function updateReorderTarget(clientX, clientY) {
  if (!reorderDrag.active) {
    return;
  }

  const distanceFromStart = Math.hypot(clientX - reorderDrag.startX, clientY - reorderDrag.startY);
  if (!reorderDrag.moved && distanceFromStart < REORDER_DRAG_THRESHOLD) {
    reorderDrag.pointerX = clientX;
    reorderDrag.pointerY = clientY;
    return;
  }

  reorderDrag.moved = true;

  const expectedTargetKind = reorderDrag.sourceKind === "bottom" ? "top" : "bottom";
  const targetSelector = `.assistant-step-connector[data-connector-kind="${expectedTargetKind}"]`;
  const candidates = Array.from(canvas.value?.querySelectorAll(targetSelector) || []);
  const maxSnapDistance = 44;
  let closestTarget = null;

  candidates.forEach((candidate) => {
    const candidateNodeId = String(candidate.dataset.stepId || "");
    if (!candidateNodeId || candidateNodeId === String(reorderDrag.sourceId)) {
      return;
    }

    const center = getConnectorCenter(candidate);
    const distance = Math.hypot(center.x - clientX, center.y - clientY);
    if (distance > maxSnapDistance) {
      return;
    }

    if (!closestTarget || distance < closestTarget.distance) {
      closestTarget = {
        distance,
        nodeId: candidateNodeId,
        kind: expectedTargetKind,
        x: center.x,
        y: center.y,
      };
    }
  });

  reorderDrag.pointerX = clientX;
  reorderDrag.pointerY = clientY;
  reorderDrag.targetId = closestTarget?.nodeId || null;
  reorderDrag.targetKind = closestTarget?.kind || "";
  reorderDrag.targetX = closestTarget?.x || 0;
  reorderDrag.targetY = closestTarget?.y || 0;
}

function handleReorderPointerMove(event) {
  updateReorderTarget(event.clientX, event.clientY);
}

function applyNodeReorder() {
  const sourceId = String(reorderDrag.sourceId || "");
  const targetId = String(reorderDrag.targetId || "");
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }

  const orderedNodes = [...nodes];
  const slotPositions = orderedNodes.map((node, index) => ({
    x: node.x,
    y: node.y ?? (index * 60),
  }));

  const sourceIndex = orderedNodes.findIndex((node) => String(node.id) === sourceId);
  if (sourceIndex === -1) {
    return;
  }

  const [sourceNode] = orderedNodes.splice(sourceIndex, 1);
  const targetIndex = orderedNodes.findIndex((node) => String(node.id) === targetId);
  if (targetIndex === -1) {
    return;
  }

  const shouldInsertAfter = reorderDrag.sourceKind === "top" && reorderDrag.targetKind === "bottom";
  const insertionIndex = shouldInsertAfter ? targetIndex + 1 : targetIndex;
  orderedNodes.splice(insertionIndex, 0, sourceNode);

  orderedNodes.forEach((node, index) => {
    const slot = slotPositions[index] || {
      x: 0,
      y: index * 60,
    };

    node.x = slot.x;
    node.y = slot.y;
    node.connections = orderedNodes[index + 1] ? [orderedNodes[index + 1].id] : [];
  });

  beginNodeReorderTransition();
  nodes.splice(0, nodes.length, ...orderedNodes);
  nextTick(() => scheduleConnectionLineUpdate());
}

function finishReorderDrag() {
  window.removeEventListener("pointermove", handleReorderPointerMove);
  window.removeEventListener("pointerup", endReorderDrag);
  window.removeEventListener("pointercancel", endReorderDrag);
}

function endReorderDrag() {
  if (!reorderDrag.active) {
    return;
  }

  if (reorderDrag.moved && reorderDrag.targetId) {
    applyNodeReorder();
  } else if (
    reorderDrag.moved
    && reorderDrag.originConnectionSourceId
    && reorderDrag.originConnectionTargetId
  ) {
    removeConnection(reorderDrag.originConnectionSourceId, reorderDrag.originConnectionTargetId);
  } else if (!reorderDrag.moved) {
    const connection = getConnectionForConnector(reorderDrag.sourceId, reorderDrag.sourceKind);
    if (connection) {
      openConnectionMenu(connection.sourceId, connection.targetId, reorderDrag.startX, reorderDrag.startY);
    }
  }

  finishReorderDrag();
  resetReorderDrag();
}

function beginReorderDrag(event, nodeId, connectorKind, connectorEl, originLine = null) {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  if (!(connectorEl instanceof Element) || nodes.length < 2) {
    return;
  }

  const sourceCenter = getConnectorCenter(connectorEl);
  hideConnectionHintTooltip();
  closeConnectionMenu();
  reorderDrag.active = true;
  reorderDrag.moved = false;
  reorderDrag.originLineKey = originLine?.key || null;
  reorderDrag.originConnectionSourceId = originLine?.sourceId || null;
  reorderDrag.originConnectionTargetId = originLine?.targetId || null;
  reorderDrag.startX = event.clientX;
  reorderDrag.startY = event.clientY;
  reorderDrag.sourceId = String(nodeId);
  reorderDrag.sourceKind = connectorKind;
  reorderDrag.sourceX = sourceCenter.x;
  reorderDrag.sourceY = sourceCenter.y;
  reorderDrag.pointerX = sourceCenter.x;
  reorderDrag.pointerY = sourceCenter.y;
  reorderDrag.targetId = null;
  reorderDrag.targetKind = "";
  reorderDrag.targetX = 0;
  reorderDrag.targetY = 0;

  window.addEventListener("pointermove", handleReorderPointerMove);
  window.addEventListener("pointerup", endReorderDrag);
  window.addEventListener("pointercancel", endReorderDrag);
}

function startReorderDrag(event, nodeId, connectorKind) {
  beginReorderDrag(event, nodeId, connectorKind, event.currentTarget);
}

function startLineReorderDrag(event, line) {
  const lineEl = event.currentTarget;
  if (!(lineEl instanceof SVGLineElement)) {
    return;
  }

  const lineRect = lineEl.getBoundingClientRect();
  const clickedUpperHalf = event.clientY < (lineRect.top + (lineRect.height / 2));
  const nodeId = clickedUpperHalf ? line.targetId : line.sourceId;
  const connectorKind = clickedUpperHalf ? "top" : "bottom";
  const connectorEl = getConnectorElement(nodeId, connectorKind);
  if (!connectorEl) {
    return;
  }

  beginReorderDrag(event, nodeId, connectorKind, connectorEl, line);
}

function updateConnectionLines() {
  const canvasEl = canvas.value;
  if (!canvasEl) return;

  canvasSize.width = canvasEl.clientWidth;
  canvasSize.height = canvasEl.clientHeight;

  const nodeEls = Array.from(canvasEl.querySelectorAll(".assistant-step[data-step-id]"));
  const anchors = new Map();

  nodeEls.forEach((el) => {
    const nodeId = String(el.dataset.stepId || "");
    if (!nodeId) return;
    const node = findNodeById(nodeId);
    if (!node) return;

    const visualLeft = el.offsetLeft + node.x;
    const visualTop = el.offsetTop + node.y;
    anchors.set(nodeId, {
      x: visualLeft + (el.offsetWidth / 2),
      topY: visualTop,
      bottomY: visualTop + el.offsetHeight,
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
        sourceId: String(node.id),
        targetId: String(targetId),
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

  const terminalNodes = nodes.filter((node) => !(node.connections || []).length);
  terminalAddControls.value = terminalNodes
    .map((node) => {
      const anchor = anchors.get(String(node.id));
      if (!anchor) {
        return null;
      }

      const top = anchor.bottomY + 28;

      return {
        key: `terminal-add-${node.id}`,
        lineKey: `terminal-add-line-${node.id}`,
        x: anchor.x,
        top,
        x1: anchor.x,
        y1: anchor.bottomY,
        x2: anchor.x,
        y2: top,
      };
    })
    .filter(Boolean);
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

const handleWindowResize = () => {
  syncViewportSize();
  scheduleConnectionLineUpdate();
};

onMounted(() => {
  nodeInteraction = interact(".assistant-step").draggable({
    inertia: true,
    ignoreFrom: ".assistant-step-control, .assistant-step-connector",
    listeners: {
      start() {
        isDraggingStepNode.value = true;
        hideConnectionHintTooltip();
        closeConnectionMenu();
      },
      move(event) {
        const el = event.target;
        const node = findNodeById(el?.dataset?.stepId);
        if (!node) {
          return;
        }

        const scale = zoomLevel.value || 1;
        node.x += event.dx / scale;
        node.y += event.dy / scale;

        el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
        scheduleConnectionLineUpdate();
      },
      end(event) {
        isDraggingStepNode.value = false;
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

  syncViewportSize();
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  window.addEventListener("keydown", handleWindowKeyDown);
  window.addEventListener("resize", handleWindowResize);
  nextTick(() => recenterCanvas());
});

/* BEGIN MOCK DATA */

const initialNodeTemplates = createBuilderNodeTemplates();

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

function toggleAllNodeDetails() {
  const shouldCollapse = !areAllDetailsCollapsed.value;
  nodes.forEach((node) => {
    node.detailsCollapsed = shouldCollapse;
  });
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

  nextTick(() => scheduleConnectionLineUpdate());
}

watch(
  () => props.currentBuilderStep,
  (newStep) => {
    nodes.splice(0, nodes.length);
    initialNodeTemplates
      .slice(0, Math.max(0, newStep))
      .forEach((template) => nodes.push(cloneNodeTemplate(template)));

    nextTick(() => scheduleConnectionLineUpdate());
  },
  { immediate: true },
);

/* END MOCK DATA */

onBeforeUnmount(() => {
  nodeInteraction?.unset();
  nodeInteraction = null;
  isDraggingStepNode.value = false;
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  window.removeEventListener("keydown", handleWindowKeyDown);
  window.removeEventListener("resize", handleWindowResize);
  finishReorderDrag();
  if (lineRaf) cancelAnimationFrame(lineRaf);
  lineRaf = 0;
  if (recenterTimer) {
    window.clearTimeout(recenterTimer);
    recenterTimer = 0;
  }
  if (reorderTransitionTimer) {
    window.clearTimeout(reorderTransitionTimer);
    reorderTransitionTimer = 0;
  }
});

</script>

<template>
  <article
    ref="canvas"
    class="assistant-builder-canvas"
    :class="{
      'assistant-builder-canvas--panning': isPanning,
      'assistant-builder-canvas--recentering': isRecentering,
    }"
    :style="canvasPanStyle"
    @pointerdown="startCanvasPan"
    @pointermove="moveCanvasPan"
    @pointerup="endCanvasPan"
    @pointercancel="endCanvasPan"
  >
    <div
      class="assistant-builder-scene"
      :class="{ 'assistant-builder-scene--recentering': isRecentering }"
      :style="sceneTranslateStyle"
    >
      <div class="assistant-builder-scene-scale" :style="sceneScaleStyle">
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
        <Teleport to="body">
          <div
            v-if="connectionHintTooltip.open"
            class="builder-zoom-tooltip true-small assistant-step-hover-tooltip assistant-step-hover-tooltip--visible"
            :style="{ left: `${connectionHintTooltip.left}px`, top: `${connectionHintTooltip.top}px` }"
            role="tooltip"
          >
            Click to remove. Drag to change.
          </div>
        </Teleport>
        <svg
          class="assistant-step-connections"
          :class="{ 'assistant-step-connections--step-dragging': isDraggingStepNode }"
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
            @pointerdown.stop.prevent="startLineReorderDrag($event, line)"
            @pointerover="handleLinePointerHover($event, line.key)"
            @pointermove="handleLinePointerHover($event, line.key)"
            @pointerleave="clearHoveredConnection(line.key)"
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
        <Teleport to="body">
          <div
            v-if="connectionMenu.open"
            ref="connectionMenuEl"
            class="assistant-step-connection-menu dropdown-menu show"
            :style="{ left: `${connectionMenu.left}px`, top: `${connectionMenu.top}px` }"
          >
            <button
              type="button"
              class="dropdown-item"
              @click.stop="removeConnection(connectionMenu.sourceId, connectionMenu.targetId)"
            >
              Remove connection
            </button>
          </div>
        </Teleport>
	        <StepOptionsDropdown
	          v-for="line in connectionLines"
	          :key="`mid-add-${line.key}`"
	          v-show="hiddenDraggedConnectionKey !== line.key"
	          class="assistant-step-inline-add"
	          :style="{ left: `${line.midX}px`, top: `${line.midY}px` }"
	        >
	          <template #trigger="{ open }">
	            <div class="builder-zoom-tooltip-wrap assistant-step-inline-tooltip-wrap">
	              <button
	                type="button"
	                class="assistant-step-inline-add-btn d-flex align-items-center justify-content-center"
	                aria-label="Add step between connected nodes"
	              >
	                <img src="../../assets/plus-round.svg" width="12" height="12" class="d-block invert-to-white">
	              </button>
	              <div v-if="!open" class="builder-zoom-tooltip true-small" role="tooltip">Add a step here.</div>
	            </div>
	          </template>
	        </StepOptionsDropdown>

        <TransitionGroup name="nodes">
          <div
            v-for="node in nodes"
            :key="node.id"
            class="assistant-step border rounded bg-white"
            :class="{
              'assistant-step--has-incoming': hasIncomingConnection(node.id),
              'assistant-step--reordering': isReorderingNodes,
              'border-primary': isActiveConnectionDragSource(node.id) || isActiveConnectionDragTarget(node.id),
            }"
            draggable
            :data-step-id="node.id"
            :style="{ transform: `translate3d(${node.x}px, ${node.y}px, 0)`}"
            @click="toggleSidebar(node.id)"
          >
          <div
            class="assistant-step-connector assistant-step-connector--top assistant-step-control"
            :class="{
              'assistant-step-connector--active-target': reorderDrag.targetId === String(node.id) && reorderDrag.targetKind === 'top',
              'assistant-step-connector--drag-source': reorderDrag.active && reorderDrag.sourceId === String(node.id) && reorderDrag.sourceKind === 'top',
            }"
            :data-step-id="node.id"
            data-connector-kind="top"
            role="button"
            @pointerdown.stop.prevent="startReorderDrag($event, node.id, 'top')"
            @pointerover="handleConnectorPointerHover($event, node.id, 'top')"
            @pointermove="handleConnectorPointerHover($event, node.id, 'top')"
            @pointerleave="clearConnectorHover(node.id, 'top')"
            @click.stop
          />
	          <div
	            v-show="showEditorComments"
	            class="add-comment-to-step bg-white px-2.5 py-2.5 rounded-circle d-flex align-items-center justify-content-center"
	          >
	            <img src="../../assets/comment.svg" width="18" height="18" class="d-block">
	          </div>
	
	          <div class="assistant-step-header border-bottom px-2.5 py-2.5 d-flex align-items-center justify-content-start">
	            <div
	              v-if="node.typeMeta"
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
	            <h6 class="mb-0 me-2">
	              {{  node.title }}
	            </h6>
            <img src="../../assets/edit.svg" width="12" height="12" class="opacity-25 me-3">
	            <StepOptionsDropdown
	              class="assistant-step-menu ms-auto"
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
                <button type="button" class="dropdown-item" @click.stop="duplicateStep(node.id); close()">Duplicate Step</button>
                <button type="button" class="dropdown-item" @click.stop="removeAllConnections(node.id); close()">Remove Connections</button>
                <button type="button" class="dropdown-item" @click.stop="deleteStep(node.id); close()">Delete Step</button>
              </template>
            </StepOptionsDropdown>
          </div>
          <div class="assistant-step-details">
            <button
              type="button"
              class="assistant-step-details-toggle assistant-step-control px-2.5 pt-2 pb-1"
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
            <div v-show="!node.detailsCollapsed" class="assistant-step-details-content px-2.5 pb-2 not-as-small text-black">
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
          <div
            class="assistant-step-connector assistant-step-connector--bottom assistant-step-control"
            :class="{
              'assistant-step-connector--active-target': reorderDrag.targetId === String(node.id) && reorderDrag.targetKind === 'bottom',
              'assistant-step-connector--drag-source': reorderDrag.active && reorderDrag.sourceId === String(node.id) && reorderDrag.sourceKind === 'bottom',
            }"
            :data-step-id="node.id"
            data-connector-kind="bottom"
            role="button"
            @pointerdown.stop.prevent="startReorderDrag($event, node.id, 'bottom')"
            @pointerover="handleConnectorPointerHover($event, node.id, 'bottom')"
            @pointermove="handleConnectorPointerHover($event, node.id, 'bottom')"
            @pointerleave="clearConnectorHover(node.id, 'bottom')"
            @click.stop
          />
          </div>
        </TransitionGroup>

        <StepOptionsDropdown
          v-for="terminalAdd in terminalAddControls"
          :key="terminalAdd.key"
          class="assistant-step-terminal-add"
          :style="{ left: `${terminalAdd.x}px`, top: `${terminalAdd.top}px` }"
        >
          <template #trigger="{ open }">
            <div class="builder-zoom-tooltip-wrap assistant-step-inline-tooltip-wrap">
              <button
                type="button"
                class="assistant-step-inline-add-btn d-flex align-items-center justify-content-center"
                aria-label="Add step after this node"
              >
                <img src="../../assets/plus-round.svg" width="12" height="12" class="d-block invert-to-white">
              </button>
              <div v-if="!open" class="builder-zoom-tooltip true-small" role="tooltip">Add a step here.</div>
            </div>
          </template>
        </StepOptionsDropdown>

        <StepOptionsDropdown
          v-if="!nodes.length"
          class="assistant-step assistant-step--add"
        >
          <template #trigger>
            <div class="assistant-step-add-card border rounded-sm fw-medium bg-white py-2.5 px-3 reduced text-center">
              <span class="me-1">&plus;</span>
              Add Step
            </div>
          </template>
        </StepOptionsDropdown>
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
	      <div class="builder-zoom-tooltip-wrap">
	        <button
	          type="button"
	          class="builder-action--zoom-in btn btn-sm bg-white py-1 px-2.5 fw-bold"
	          aria-label="Zoom in"
	          @click.stop="zoomIn"
	        >
	          &plus;
	        </button>
	        <div class="builder-zoom-tooltip true-small" role="tooltip">Zoom In</div>
	      </div>
	      <div class="builder-zoom-tooltip-wrap border-top border-bottom">
	        <button
	          type="button"
	          class="builder-action--recenter btn btn-sm bg-white py-2 px-2.5"
	          aria-label="Reset zoom and position"
	          @click.stop="recenterCanvas"
	        >
	          <img src="../../assets/recenter.svg" width="10" height="10" class="d-block">
	        </button>
	        <div class="builder-zoom-tooltip true-small" role="tooltip">Reset zoom and position.</div>
	      </div>
	      <div class="builder-zoom-tooltip-wrap">
	        <button
	          type="button"
	          class="builder-action--zoom-out btn btn-sm bg-white py-1 px-2.5 fw-bold"
	          aria-label="Zoom out"
	          @click.stop="zoomOut"
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
	          @click.stop="handleUndoClick"
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
	          @click.stop="toggleEditorComments"
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
          @click.stop="toggleAllNodeDetails"
        >
          <img
            src="../../assets/arrow-down-b.svg"
            width="14"
            height="14"
            class="d-block assistant-step-floating-mini-btn__icon"
            :class="{ 'assistant-step-floating-mini-btn__icon--collapsed': areAllDetailsCollapsed }"
            aria-hidden="true"
          >
        </button>
        <div class="builder-zoom-tooltip true-small" role="tooltip">Toggle details</div>
      </div>
      <StepOptionsDropdown class="assistant-step-floating-add" placement="top-end">
        <template #trigger="{ open }">
          <div class="builder-zoom-tooltip-wrap assistant-step-floating-tooltip-wrap">
            <button class="add-builder-node btn btn-dark rounded-circle d-flex align-items-center justify-content-center">
              <img src="../../assets/plus-round.svg" width="20" height="20" class="d-block invert-to-white">
            </button>
            <div v-if="!open" class="builder-zoom-tooltip true-small" role="tooltip">Add Step</div>
          </div>
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
  cursor: grab;
  overflow: hidden;
  position: relative;
  touch-actions: none;
}

.assistant-builder-canvas--panning {
  cursor: grabbing;
}

.assistant-builder-canvas--recentering {
  transition: background-position 0.16s ease-in-out;
}

.assistant-builder-scene {
  inset: 0;
  position: absolute;
}

.assistant-builder-scene--recentering {
  transition: transform 0.16s ease-in-out;
}

.assistant-builder-scene-scale {
  inset: 0;
  position: absolute;
  transform-origin: center top;
  transition: transform 0.2s ease-in-out;
}

.assistant-step-connections {
  height: 100%;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  width: 100%;
  z-index: 1;
}

.assistant-step-connections--step-dragging .assistant-step-connection-line,
.assistant-step-connections--step-dragging .assistant-step-connection-hover-band,
.assistant-step-connections--step-dragging .assistant-step-connection-hit-area {
  opacity: 0;
  pointer-events: none;
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

.assistant-step-terminal-add:focus-within,
.assistant-step-terminal-add:has(.step-options-dropdown--open) {
  z-index: 40;
}

.assistant-step-add-card {
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
  cursor: pointer;
  white-space: nowrap;
}

.assistant-step-connection-menu {
  display: block;
  min-width: 11rem;
  position: fixed;
  z-index: 520;
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

.assistant-step--reordering {
  transition: transform 0.18s ease-in-out;
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

:deep(.assistant-step-menu-panel) {
  min-width: 12.5rem;
}

.assistant-step-details-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--bs-gray-600);
  display: flex;
  font-size: 0.625rem;
  font-weight: 500;
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
  cursor: grab;
  height: 0.5rem;
  left: 50%;
  pointer-events: auto;
  position: absolute;
  transform: translateX(-50%);
  transition: opacity 120ms ease-in-out, box-shadow 120ms ease-in-out, background-color 120ms ease-in-out;
  width: 1rem;
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

.assistant-step-hover-tooltip {
  left: 0;
  position: fixed;
  right: auto;
  top: 0;
  transform: none;
  white-space: nowrap;
  z-index: 540;
}

.assistant-step-hover-tooltip--visible {
  opacity: 1;
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

.assistant-step-inline-tooltip-wrap .builder-zoom-tooltip {
  bottom: auto;
  left: calc(100% + 0.5rem);
  right: auto;
  top: 50%;
  transform: translateY(-50%);
}

.builder-action--zoom-in,
.builder-action--recenter,
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

</style>
