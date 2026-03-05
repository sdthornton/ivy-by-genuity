<script setup>

import interact from "interactjs";
import { onMounted, onBeforeUnmount, reactive, watch, ref, nextTick, computed } from "vue";
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import AddStepMenuContent from "./AddStepMenuContent.vue";
import BuilderConnectionsLayer from "./BuilderConnectionsLayer.vue";
import BuilderFloatingControls from "./BuilderFloatingControls.vue";
import BuilderStepCard from "./BuilderStepCard.vue";
import {
  createBuilderNodeTemplates,
  getAddStepMenuGroups,
  getStartBlockOptions,
} from "./mockSteps";

const emit = defineEmits(["toggleSidebar", "select-start-block"]);

function toggleSidebar(nodeId) {
  emit("toggleSidebar", nodeId);
}

function selectStartBlock(mode) {
  emit("select-start-block", mode);
}

const props = defineProps({
  currentBuilderStep: {
    type: Number,
    required: false,
    default: 0,
  },
  startBlockMode: {
    type: String,
    default: "start",
  },
  startTriggerOption: {
    type: Object,
    default: null,
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
const DEFAULT_ZOOM = 1;
const zoomLevel = ref(DEFAULT_ZOOM);
const ZOOM_STEP = 0.0625;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const RECENTER_TRANSITION_MS = 160;
const REORDER_TRANSITION_MS = 180;
const DEFAULT_TERMINAL_SEGMENT_LENGTH = 42;
const START_LAYOUT_CENTERING_THRESHOLD = 1;

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
const REORDER_DRAG_THRESHOLD = 8;
const CONNECTION_MENU_OFFSET = 10;
const CONNECTION_MENU_PADDING = 8;

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
const addStepMenuGroups = computed(() => getAddStepMenuGroups());
const startBlockOptions = computed(() => getStartBlockOptions());
const shouldShowFullTerminalAddCard = computed(() => (
  nodes.length === 1 && Boolean(nodes[0]?.isStartBlock)
));
const singleStartTerminalAddControl = computed(() => (
  shouldShowFullTerminalAddCard.value ? terminalAddControls.value[0] || null : null
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

const commentComposer = reactive({
  nodeId: null,
  text: "",
});

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
  if (!showEditorComments.value) {
    closeCommentComposer();
  }
}

function handleAddStepMenuSelection(item) {
  if (item?.startBlockMode) {
    selectStartBlock(item.startBlockMode);
  }
}

function handleUndoClick() {
  // Placeholder until undo stack behavior is implemented.
}

function formatCommentStamp(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function openCommentComposer(nodeId) {
  commentComposer.nodeId = String(nodeId);
  commentComposer.text = "";
}

function closeCommentComposer() {
  commentComposer.nodeId = null;
  commentComposer.text = "";
}

function saveComment(nodeId) {
  const node = findNodeById(nodeId);
  const nextBody = commentComposer.text.trim();
  if (!node || !nextBody) {
    return;
  }

  if (!Array.isArray(node.comments)) {
    node.comments = [];
  }

  node.comments.push({
    author: "You",
    body: nextBody,
    stamp: formatCommentStamp(),
  });

  closeCommentComposer();
}

function handleCommentComposerKeydown(event, nodeId) {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    saveComment(nodeId);
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeCommentComposer();
  }
}

function handleCommentComposerTextUpdate(value) {
  commentComposer.text = value;
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
  scheduleSingleStartLayoutCentering();
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
}

function handleLinePointerHover(_, lineKey) {
  setHoveredConnection(lineKey);
}

function handleConnectorPointerHover(_, nodeId, connectorKind) {
  const connection = getConnectionForConnector(nodeId, connectorKind);
  if (!connection) {
    return;
  }

  hoveredConnectionKey.value = `${connection.sourceId}-${connection.targetId}`;
}

function clearConnectorHover(nodeId, connectorKind) {
  const connection = getConnectionForConnector(nodeId, connectorKind);
  if (!connection) {
    return;
  }

  clearHoveredConnection(`${connection.sourceId}-${connection.targetId}`);
}

function handleDocumentPointerDown(event) {
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
  const originConnection = getConnectionForConnector(nodeId, connectorKind);
  const originLine = originConnection ? {
    key: `${originConnection.sourceId}-${originConnection.targetId}`,
    sourceId: originConnection.sourceId,
    targetId: originConnection.targetId,
  } : null;

  beginReorderDrag(event, nodeId, connectorKind, event.currentTarget, originLine);
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

function handleConnectionLinePointerDown({ event, line }) {
  startLineReorderDrag(event, line);
}

function handleConnectionLinePointerHover({ event, lineKey }) {
  handleLinePointerHover(event, lineKey);
}

function handleConnectionLinePointerLeave({ lineKey }) {
  clearHoveredConnection(lineKey);
}

function handleCardConnectorPointerDown({ event, nodeId, connectorKind }) {
  startReorderDrag(event, nodeId, connectorKind);
}

function handleCardConnectorPointerHover({ event, nodeId, connectorKind }) {
  handleConnectorPointerHover(event, nodeId, connectorKind);
}

function handleCardConnectorPointerLeave({ nodeId, connectorKind }) {
  clearConnectorHover(nodeId, connectorKind);
}

function handleCardCommentKeydown({ event, nodeId }) {
  handleCommentComposerKeydown(event, nodeId);
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

    (node.connections || []).forEach((targetId) => {
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

  const terminalSegmentLength = lines.length
    ? lines.reduce((sum, line) => sum + Math.abs(line.midY - line.y1), 0) / lines.length
    : DEFAULT_TERMINAL_SEGMENT_LENGTH;

  const terminalNodes = nodes.filter((node) => (
    !(node.connections || []).some((targetId) => anchors.has(String(targetId)))
  ));
  terminalAddControls.value = terminalNodes
    .map((node) => {
      const anchor = anchors.get(String(node.id));
      if (!anchor) {
        return null;
      }

      const top = anchor.bottomY + terminalSegmentLength;

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

function centerSingleStartBlankLayout() {
  if (!shouldShowFullTerminalAddCard.value) {
    return;
  }

  const canvasEl = canvas.value;
  const startNode = nodes[0];
  if (!canvasEl || !startNode) {
    return;
  }

  const nodeEl = canvasEl.querySelector(`.assistant-step[data-step-id="${String(startNode.id)}"]`);
  const terminalCardEl = canvasEl.querySelector(".assistant-step-terminal-add--card");
  if (!(nodeEl instanceof HTMLElement) || !(terminalCardEl instanceof HTMLElement)) {
    return;
  }

  const canvasRect = canvasEl.getBoundingClientRect();
  const terminalRect = terminalCardEl.getBoundingClientRect();

  const targetCenterX = canvasRect.left + (canvasRect.width / 2);
  const targetCenterY = canvasRect.top + (canvasRect.height / 2);
  const currentCenterX = terminalRect.left + (terminalRect.width / 2);
  const currentCenterY = terminalRect.top + (terminalRect.height / 2);

  const deltaX = targetCenterX - currentCenterX;
  const deltaY = targetCenterY - currentCenterY;
  const scale = zoomLevel.value || 1;

  if (
    Math.abs(deltaX) < START_LAYOUT_CENTERING_THRESHOLD
    && Math.abs(deltaY) < START_LAYOUT_CENTERING_THRESHOLD
  ) {
    return;
  }

  startNode.x += deltaX / scale;
  startNode.y += deltaY / scale;
  scheduleConnectionLineUpdate();
}

function scheduleSingleStartLayoutCentering() {
  if (!shouldShowFullTerminalAddCard.value) {
    return;
  }

  requestAnimationFrame(() => {
    nextTick(() => {
      centerSingleStartBlankLayout();
    });
  });
}

let lineRaf = 0;
const scheduleConnectionLineUpdate = () => {
  if (lineRaf) cancelAnimationFrame(lineRaf);
  lineRaf = requestAnimationFrame(() => {
    lineRaf = 0;
    updateConnectionLines();
  });
};

let canvasResizeObserver = null;

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
  if (typeof ResizeObserver !== "undefined" && canvas.value) {
    canvasResizeObserver = new ResizeObserver(() => {
      scheduleConnectionLineUpdate();
    });
    canvasResizeObserver.observe(canvas.value);
  }
  nextTick(() => recenterCanvas());
});

/* BEGIN MOCK DATA */

const nodes = reactive([]);

function cloneNodeTemplate(node, options = {}) {
  const { shareData = false, shareComments = false } = options;

  return {
    ...node,
    comments: shareComments ? node.comments : (node.comments || []).map((comment) => ({ ...comment })),
    rows: (node.rows || []).map((row) => ({ ...row })),
    data: shareData ? node.data : { ...node.data },
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
  const node = findNodeById(selectedId);
  if (!node) return;

  if (node.isStartBlock) {
    if (props.startBlockMode !== "start") {
      selectStartBlock("start");
    }
    return;
  }

  const index = nodes.findIndex((currentNode) => String(currentNode.id) === selectedId);
  if (index === -1) return;

  nodes.splice(index, 1);
  nodes.forEach((node) => {
    node.connections = (node.connections || []).filter((targetId) => String(targetId) !== selectedId);
  });

  nextTick(() => scheduleConnectionLineUpdate());
}

function rebuildNodes() {
  const nextTemplates = createBuilderNodeTemplates(props.currentBuilderStep, {
    startBlockMode: props.startBlockMode,
    startTriggerOption: props.startTriggerOption,
  });

  nodes.splice(0, nodes.length);
  nextTemplates.forEach((template) => nodes.push(cloneNodeTemplate(template, { shareData: true, shareComments: true })));

  nextTick(() => {
    scheduleConnectionLineUpdate();
    scheduleSingleStartLayoutCentering();
  });
}

watch(
  () => [props.currentBuilderStep, props.startBlockMode, props.startTriggerOption?.key, props.startTriggerOption?.label, props.startTriggerOption?.pillLabel],
  rebuildNodes,
  { immediate: true },
);

/* END MOCK DATA */

onBeforeUnmount(() => {
  nodeInteraction?.unset();
  nodeInteraction = null;
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  window.removeEventListener("keydown", handleWindowKeyDown);
  window.removeEventListener("resize", handleWindowResize);
  canvasResizeObserver?.disconnect();
  canvasResizeObserver = null;
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
        <BuilderConnectionsLayer
          :viewport-size="viewportSize"
          :reorder-drag="reorderDrag"
          :canvas-size="canvasSize"
          :connection-lines="connectionLines"
          :terminal-add-controls="terminalAddControls"
          :highlighted-connection-key="highlightedConnectionKey"
          :hidden-dragged-connection-key="hiddenDraggedConnectionKey"
          :add-step-menu-groups="addStepMenuGroups"
          :should-show-full-terminal-add-card="shouldShowFullTerminalAddCard"
          :single-start-terminal-add-control="singleStartTerminalAddControl"
          @line-pointerdown="handleConnectionLinePointerDown"
          @line-pointerhover="handleConnectionLinePointerHover"
          @line-pointerleave="handleConnectionLinePointerLeave"
          @add-step-select="handleAddStepMenuSelection"
        />
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
        <TransitionGroup name="nodes">
          <BuilderStepCard
            v-for="(node, nodeIndex) in nodes"
            :key="node.id"
            :node="node"
            :node-index="nodeIndex"
            :show-editor-comments="showEditorComments"
            :is-composer-open="commentComposer.nodeId === String(node.id)"
            :comment-composer-text="commentComposer.text"
            :start-block-options="startBlockOptions"
            :is-reordering-nodes="isReorderingNodes"
            :has-incoming-connection="hasIncomingConnection(node.id)"
            :is-active-connection-drag-source="isActiveConnectionDragSource(node.id)"
            :is-active-connection-drag-target="isActiveConnectionDragTarget(node.id)"
            @select-step="toggleSidebar"
            @open-comment-composer="openCommentComposer"
            @close-comment-composer="closeCommentComposer"
            @update-comment-text="handleCommentComposerTextUpdate"
            @save-comment="saveComment"
            @comment-keydown="handleCardCommentKeydown"
            @connector-pointerdown="handleCardConnectorPointerDown"
            @connector-pointerhover="handleCardConnectorPointerHover"
            @connector-pointerleave="handleCardConnectorPointerLeave"
            @toggle-node-details="toggleNodeDetails"
            @duplicate-step="duplicateStep"
            @remove-connections="removeAllConnections"
            @delete-step="deleteStep"
            @select-start-block="selectStartBlock"
          />
        </TransitionGroup>

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
          <template #menu="{ close }">
            <AddStepMenuContent
              :groups="addStepMenuGroups"
              :close-menu="close"
              @select="handleAddStepMenuSelection"
            />
          </template>
        </StepOptionsDropdown>
      </div>
    </div>

    <BuilderFloatingControls
      :show-editor-comments="showEditorComments"
      :are-all-details-collapsed="areAllDetailsCollapsed"
      :add-step-menu-groups="addStepMenuGroups"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @undo="handleUndoClick"
      @toggle-editor-comments="toggleEditorComments"
      @toggle-all-node-details="toggleAllNodeDetails"
      @add-step-select="handleAddStepMenuSelection"
    />
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
