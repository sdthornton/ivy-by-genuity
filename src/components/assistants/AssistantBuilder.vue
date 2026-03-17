<script setup>

import interact from "interactjs";
import { onMounted, onBeforeUnmount, reactive, watch, ref, nextTick, computed } from "vue";
import BasicDropdown from "../shared/BasicDropdown.vue";
import AddStepMenuContent from "./AddStepMenuContent.vue";
import BuilderConnectionsLayer from "./BuilderConnectionsLayer.vue";
import BuilderFloatingControls from "./BuilderFloatingControls.vue";
import BuilderStepCard from "./BuilderStepCard.vue";
import {
  computeBuilderConnectionLayout,
  getBranchConnectorCenterInCanvas,
  getNodeHeightInCanvas,
  getNodeMetricsInCanvas,
} from "./builderConnectionLayout";
import {
  getConnectionLineKey,
  isBranchConnectorKind,
  isBranchContainerNodeType,
} from "./builderConnectionKeys";
import { useBuilderConnectionInteractions } from "./useBuilderConnectionInteractions";
import {
  createBuilderNodeTemplates,
  setLiveSidebarSteps,
} from "./mockSteps";
import {
  addContainerInnerStepSelection,
  addSplitElseIfCondition,
  ensureBranchStepData,
  ensureSplitStepData,
  getAddStepMenuGroups,
  getBranchConnections,
  getStartBlockOptions,
  getStepTypeDefinition,
  getStepTypeMeta,
  setContainerInnerStepSelection,
} from "./stepRuntime";

const emit = defineEmits(["toggleSidebar", "select-start-block", "nodes-change"]);

function toggleSidebar(nodeId) {
  selectedNodeId.value = Number(nodeId) || null;
  emit("toggleSidebar", nodeId);
}

function selectStartBlock(mode) {
  emit("select-start-block", mode);
}

function emitCurrentNodeIds() {
  emit("nodes-change", nodes.map((node) => Number(node.id)).filter((id) => Number.isFinite(id)));
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
const builderScale = ref(null);
const connectionLines = ref([]);
const terminalAddControls = ref([]);
const selectedNodeId = ref(null);
const nodes = reactive([]);
const canvasSize = reactive({ width: 0, height: 0 });
const viewportSize = reactive({ width: 0, height: 0 });
const showEditorComments = ref(true);
const panOffset = reactive({ x: 0, y: 0 });
const panState = reactive({ startX: 0, startY: 0, baseX: 0, baseY: 0 });
const isPanning = ref(false);
const isRecentering = ref(false);
const DEFAULT_ZOOM = 1;
const zoomLevel = ref(DEFAULT_ZOOM);
const ZOOM_STEP = 0.0625;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const RECENTER_TRANSITION_MS = 160;
const ZOOM_TRANSITION_MS = 200;
const DEFAULT_TERMINAL_SEGMENT_LENGTH = 42;
const START_LAYOUT_CENTERING_THRESHOLD = 1;
const INSERT_NODE_Y_SPACING = 84;
const BRANCH_INSERT_SEGMENT_LENGTH = DEFAULT_TERMINAL_SEGMENT_LENGTH;
const isZoomTransitioning = ref(false);

const canvasPanStyle = computed(() => ({
  backgroundPosition: `${panOffset.x + 2}px ${panOffset.y + 4}px`,
}));

const builderTranslateStyle = computed(() => ({
  transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
}));

const builderScaleStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
}));

const {
  reorderDrag,
  connectionMenu,
  connectionMenuEl,
  hoveredConnectionKey,
  isReorderingNodes,
  closeConnectionMenu,
  positionConnectionMenu,
  removeConnection,
  handleDocumentPointerDown,
  handleWindowKeyDown,
  handleConnectionLinePointerDown,
  handleConnectionLinePointerHover,
  handleConnectionLinePointerLeave,
  handleCardConnectorPointerDown,
  handleCardConnectorPointerHover,
  handleCardConnectorPointerLeave,
  cleanupConnectionInteractions,
} = useBuilderConnectionInteractions({
  canvas,
  nodes,
  findNodeById,
  findIncomingConnection,
  getBranchConnections,
  ensureBranchStepData,
  scheduleConnectionLineUpdate: () => scheduleConnectionLineUpdate(),
});

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
  for (const sourceNode of nodes) {
    if (sourceNode.connections?.some((target) => String(target) === selectedId)) {
      return {
        sourceId: String(sourceNode.id),
        targetId: selectedId,
        sourceConnectorKind: "bottom",
      };
    }

    if (isBranchContainerNodeType(sourceNode.type)) {
      const branchConnections = getBranchConnections(sourceNode.data, sourceNode.type);
      const branchEntry = Object.entries(branchConnections).find(([, targetId]) => String(targetId) === selectedId);
      if (branchEntry) {
        return {
          sourceId: String(sourceNode.id),
          targetId: selectedId,
          sourceConnectorKind: branchEntry[0],
        };
      }
    }
  }

  return null;
}

function hasIncomingConnection(nodeId) {
  const selectedId = String(nodeId);
  return nodes.some((node) => {
    if (node.connections?.some((target) => String(target) === selectedId)) {
      return true;
    }

    if (!isBranchContainerNodeType(node.type)) {
      return false;
    }

    const branchConnections = getBranchConnections(node.data, node.type);
    return Object.values(branchConnections).some((targetId) => String(targetId) === selectedId);
  });
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

function getAddSelectionPayload(selectionPayload) {
  if (selectionPayload?.item) {
    return {
      item: selectionPayload.item,
      context: selectionPayload.context || {},
    };
  }

  return {
    item: selectionPayload || null,
    context: {},
  };
}

function createNodeFromAddSelection(item) {
  const stepType = item?.type || item?.key;
  if (!stepType) {
    return null;
  }

  const nextId = getNextNodeId();
  const stepTypeMeta = getStepTypeMeta(stepType);
  const stepTypeDefinition = getStepTypeDefinition(stepType);

  return {
    id: nextId,
    stateKey: String(nextId),
    type: stepType,
    typeMeta: stepTypeMeta,
    title: item?.label || stepTypeMeta.label,
    pill: stepTypeDefinition.pill || stepTypeMeta.label,
    sources: (stepTypeDefinition.sources || []).map((source) => ({ ...source })),
    rows: (stepTypeDefinition.rows || []).map((row) => ({ ...row })),
    comments: [],
    ivySays: stepTypeDefinition.ivySays || "",
    data: { ...(stepTypeDefinition.builderData || {}) },
    detailsCollapsed: false,
    connections: [],
    isStartBlock: false,
    startBlockMode: null,
    x: 0,
    y: 0,
  };
}

function shiftDownstreamNodes(startNodeId, offsetY, excludedNodeIds = []) {
  if (!startNodeId || !Number.isFinite(offsetY) || offsetY === 0) {
    return;
  }

  const excludedNodeSet = new Set(excludedNodeIds.map((nodeId) => String(nodeId)));
  const visited = new Set();
  const queue = [String(startNodeId)];

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId) || excludedNodeSet.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    const node = findNodeById(currentId);
    if (!node) {
      continue;
    }

    node.y = (Number(node.y) || 0) + offsetY;

    (node.connections || []).forEach((targetId) => {
      queue.push(String(targetId));
    });

    if (isBranchContainerNodeType(node.type)) {
      const branchConnections = getBranchConnections(node.data, node.type);
      Object.values(branchConnections).forEach((targetId) => {
        if (targetId) {
          queue.push(String(targetId));
        }
      });
    }
  }
}

function insertNodeAfter(sourceNode, insertedNode, forcedTargetId = null) {
  if (!sourceNode || !insertedNode) {
    return false;
  }

  const rawTargetId = forcedTargetId || sourceNode.connections?.[0] || null;
  const existingTargetNode = rawTargetId ? findNodeById(rawTargetId) : null;
  const existingTargetId = existingTargetNode
    && String(existingTargetNode.id) !== String(insertedNode.id)
    ? existingTargetNode.id
    : null;
  const sourceX = Number(sourceNode.x) || 0;
  const sourceY = Number(sourceNode.y) || 0;
  const targetY = Number(existingTargetNode?.y);

  let insertionOffsetY = INSERT_NODE_Y_SPACING;
  if (Number.isFinite(targetY)) {
    const sourceToTargetGap = targetY - sourceY;
    if (sourceToTargetGap > 0) {
      insertionOffsetY = Math.max(INSERT_NODE_Y_SPACING, sourceToTargetGap);
    }
  }

  insertedNode.x = sourceX;
  insertedNode.y = sourceY + insertionOffsetY;

  if (existingTargetId) {
    shiftDownstreamNodes(existingTargetId, insertionOffsetY, [sourceNode.id, insertedNode.id]);
    insertedNode.connections = [existingTargetId];
  } else {
    insertedNode.connections = [];
  }

  sourceNode.connections = [insertedNode.id];
  const sourceNodeIndex = nodes.findIndex((node) => String(node.id) === String(sourceNode.id));
  const insertionIndex = sourceNodeIndex === -1 ? nodes.length : sourceNodeIndex + 1;
  nodes.splice(insertionIndex, 0, insertedNode);
  return true;
}

function getFloatingInsertionSourceNode() {
  const selectedNode = selectedNodeId.value ? findNodeById(selectedNodeId.value) : null;
  if (selectedNode && !isBranchContainerNodeType(selectedNode.type)) {
    return selectedNode;
  }

  const terminalNodes = nodes.filter((node) => (
    !isBranchContainerNodeType(node.type)
    && (!Array.isArray(node.connections) || node.connections.length === 0)
  ));
  if (terminalNodes.length) {
    return terminalNodes.reduce((lowestNode, node) => (
      (Number(node.y) || 0) > (Number(lowestNode.y) || 0) ? node : lowestNode
    ), terminalNodes[0]);
  }

  const attachableNodes = nodes.filter((node) => !isBranchContainerNodeType(node.type));
  return attachableNodes.reduce((lowestNode, node) => (
    (Number(node.y) || 0) > (Number(lowestNode.y) || 0) ? node : lowestNode
  ), attachableNodes[0] || null);
}

function handleAddStepMenuSelection(selectionPayload) {
  const { item, context } = getAddSelectionPayload(selectionPayload);

  if (item?.startBlockMode) {
    selectStartBlock(item.startBlockMode);
    return;
  }

  if (
    context.placement === "between"
    && context.sourceId
    && context.targetId
    && isBranchConnectorKind(context.sourceConnectorKind)
  ) {
    addBranchStepForNode({
      nodeId: context.sourceId,
      connectorKind: context.sourceConnectorKind,
      item,
    });
    return;
  }

  const nextNode = createNodeFromAddSelection(item);
  if (!nextNode) {
    return;
  }

  if (!nodes.length) {
    nodes.push(nextNode);
    setLiveSidebarSteps(nodes);
    emitCurrentNodeIds();
    toggleSidebar(nextNode.id);
    nextTick(() => scheduleConnectionLineUpdate());
    return;
  }

  let wasInserted = false;
  let insertionSourceId = null;
  if (context.placement === "between" && context.sourceId && context.targetId) {
    const sourceNode = findNodeById(context.sourceId);
    insertionSourceId = sourceNode?.id || null;
    wasInserted = insertNodeAfter(sourceNode, nextNode, context.targetId);
  } else if (context.placement === "after" && context.sourceId) {
    const sourceNode = findNodeById(context.sourceId);
    insertionSourceId = sourceNode?.id || null;
    wasInserted = insertNodeAfter(sourceNode, nextNode);
  } else {
    const sourceNode = getFloatingInsertionSourceNode();
    insertionSourceId = sourceNode?.id || null;
    wasInserted = insertNodeAfter(sourceNode, nextNode);
  }

  if (!wasInserted) {
    nodes.push(nextNode);
  }

  setLiveSidebarSteps(nodes);
  emitCurrentNodeIds();
  toggleSidebar(nextNode.id);
  nextTick(() => {
    if (wasInserted && insertionSourceId) {
      alignNodeToSourceBottomConnector(insertionSourceId, nextNode.id);
    }

    scheduleConnectionLineUpdate();
    requestAnimationFrame(() => scheduleConnectionLineUpdate());
  });
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
let zoomTransitionTimer = 0;
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

function finalizeZoomTransition() {
  isZoomTransitioning.value = false;
  scheduleConnectionLineUpdate();
  requestAnimationFrame(() => scheduleConnectionLineUpdate());
}

function beginZoomTransition() {
  isZoomTransitioning.value = true;
  if (zoomTransitionTimer) {
    window.clearTimeout(zoomTransitionTimer);
  }

  zoomTransitionTimer = window.setTimeout(() => {
    zoomTransitionTimer = 0;
    finalizeZoomTransition();
  }, ZOOM_TRANSITION_MS + 40);
}

function recenterCanvas() {
  beginRecenteringTransition();
  resetCanvasToBasePoint();
  if (zoomLevel.value !== DEFAULT_ZOOM) {
    zoomLevel.value = DEFAULT_ZOOM;
    beginZoomTransition();
  }
  scheduleSingleStartLayoutCentering();
}

function setZoom(nextZoom) {
  const normalizedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
  if (normalizedZoom === zoomLevel.value) {
    return;
  }

  zoomLevel.value = normalizedZoom;
  beginZoomTransition();
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

  return !target.closest(".assistant-step, .assistant-step-control, .assistant-step-connection-hit-area, .basic-dropdown, .builder-zoom, .assistant-step-floating-controls, .assistant-step-connection-menu");
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

function handleCardCommentKeydown({ event, nodeId }) {
  handleCommentComposerKeydown(event, nodeId);
}

function updateConnectionLines() {
  if (isZoomTransitioning.value) {
    return;
  }

  const canvasEl = canvas.value;
  if (!canvasEl) {
    return;
  }

  const nextLayout = computeBuilderConnectionLayout({
    canvasEl,
    zoomLevel: Number(zoomLevel.value) > 0 ? Number(zoomLevel.value) : 1,
    nodes,
    findNodeById,
    isBranchContainerNodeType,
    isBranchConnectorKind,
    getBranchConnections,
    getConnectionLineKey,
    defaultTerminalSegmentLength: DEFAULT_TERMINAL_SEGMENT_LENGTH,
  });
  if (!nextLayout) {
    return;
  }

  canvasSize.width = nextLayout.canvasWidth;
  canvasSize.height = nextLayout.canvasHeight;
  connectionLines.value = nextLayout.connectionLines;
  terminalAddControls.value = nextLayout.terminalAddControls;
}

function handleBuilderScaleTransitionEnd(event) {
  if (event?.target !== builderScale.value || event?.propertyName !== "transform") {
    return;
  }

  if (!isZoomTransitioning.value) {
    return;
  }

  if (zoomTransitionTimer) {
    window.clearTimeout(zoomTransitionTimer);
    zoomTransitionTimer = 0;
  }

  finalizeZoomTransition();
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

  const terminalCardEl = canvasEl.querySelector(".assistant-step-terminal-add--card");
  if (!(terminalCardEl instanceof HTMLElement)) {
    return;
  }

  const canvasRect = canvasEl.getBoundingClientRect();
  const terminalRect = terminalCardEl.getBoundingClientRect();
  const headerEl = document.querySelector(".assistant-page-header");
  const headerHeight = headerEl instanceof HTMLElement
    ? headerEl.getBoundingClientRect().height
    : 0;

  const targetCenterX = canvasRect.left + (canvasRect.width / 2);
  const targetCenterY = canvasRect.top + (canvasRect.height / 2) - (headerHeight / 2);
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

function handleNodesLayoutSettled() {
  scheduleConnectionLineUpdate();
  requestAnimationFrame(() => scheduleConnectionLineUpdate());
}

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

function cloneNodeDataValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneNodeDataValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneNodeDataValue(nestedValue)]),
    );
  }

  return value;
}

function cloneNodeTemplate(node, options = {}) {
  const { shareData = false, shareComments = false } = options;

  return {
    ...node,
    comments: shareComments ? node.comments : (node.comments || []).map((comment) => ({ ...comment })),
    rows: (node.rows || []).map((row) => ({ ...row })),
    data: shareData ? node.data : cloneNodeDataValue(node.data),
    detailsCollapsed: Boolean(node.detailsCollapsed),
    connections: [...(node.connections || [])],
  };
}

watch(
  () => nodes.map((node) => {
    if (isBranchContainerNodeType(node.type)) {
      const branchData = node.data || {};
      const branchConnections = getBranchConnections(branchData, node.type);
      const branchConnectionSignature = Object.entries(branchConnections)
        .map(([connectorKind, targetId]) => `${connectorKind}:${targetId || ""}`)
        .join("|");

      if (node.type === "split") {
        const elseIfSignature = Array.isArray(branchData.elseIfConditions)
          ? branchData.elseIfConditions.join("|")
          : "";

        return [
          node.id,
          node.detailsCollapsed ? 1 : 0,
          branchData.ifCondition || "",
          elseIfSignature,
          branchData.elseCondition || "",
          branchConnectionSignature,
        ].join("::");
      }

      const innerStepSignature = Array.isArray(branchData.innerSteps)
        ? branchData.innerSteps
          .map((step) => `${step?.branchId || ""}:${step?.type || ""}:${step?.label || ""}`)
          .join("|")
        : "";

      return [
        node.id,
        node.detailsCollapsed ? 1 : 0,
        innerStepSignature,
        branchConnectionSignature,
      ].join("::");
    }

    return [node.id, node.detailsCollapsed ? 1 : 0].join("::");
  }),
  () => {
    nextTick(() => scheduleConnectionLineUpdate());
  },
);

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
  setLiveSidebarSteps(nodes);
  emitCurrentNodeIds();
  nextTick(() => scheduleConnectionLineUpdate());
}

function addSplitElseIfForNode(nodeId) {
  const node = findNodeById(nodeId);
  if (!node || node.type !== "split") {
    return;
  }

  ensureSplitStepData(node.data);
  addSplitElseIfCondition(node.data);
  setLiveSidebarSteps(nodes);
  nextTick(() => scheduleConnectionLineUpdate());
}

function getBranchConnectorCenter(nodeId, connectorKind) {
  return getBranchConnectorCenterInCanvas({
    canvasEl: canvas.value,
    nodeId,
    connectorKind,
    isBranchConnectorKind,
    zoomLevel: Number(zoomLevel.value) > 0 ? Number(zoomLevel.value) : 1,
  });
}

function getNodeLocalHeight(nodeId) {
  return getNodeHeightInCanvas({
    canvasEl: canvas.value,
    nodeId,
    zoomLevel: Number(zoomLevel.value) > 0 ? Number(zoomLevel.value) : 1,
  });
}

function getNodeLocalMetrics(nodeId) {
  return getNodeMetricsInCanvas({
    canvasEl: canvas.value,
    nodeId,
    zoomLevel: Number(zoomLevel.value) > 0 ? Number(zoomLevel.value) : 1,
  });
}

function alignNodeToSourceBottomConnector(sourceNodeId, insertedNodeId) {
  const sourceMetrics = getNodeLocalMetrics(sourceNodeId);
  const insertedMetrics = getNodeLocalMetrics(insertedNodeId);
  const insertedNode = findNodeById(insertedNodeId);
  if (!sourceMetrics || !insertedMetrics || !insertedNode) {
    return;
  }

  insertedNode.x += sourceMetrics.centerX - insertedMetrics.centerX;
}

function alignBranchInsertedNodeToConnector({
  sourceNodeId,
  connectorKind,
  insertedNodeId,
  verticalOffset = BRANCH_INSERT_SEGMENT_LENGTH,
} = {}) {
  const insertedMetrics = getNodeLocalMetrics(insertedNodeId);
  const insertedNode = findNodeById(insertedNodeId);
  if (!insertedMetrics || !insertedNode) {
    return false;
  }

  const connectorCenter = getBranchConnectorCenter(sourceNodeId, connectorKind);
  const sourceX = Number(connectorCenter?.x);
  const sourceY = Number(connectorCenter?.y);
  if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) {
    return false;
  }

  const deltaX = sourceX - insertedMetrics.centerX;
  const deltaY = (sourceY + verticalOffset) - insertedMetrics.top;

  if (Math.abs(deltaX) > 0.1) {
    insertedNode.x += deltaX;
  }

  if (Math.abs(deltaY) > 0.1) {
    insertedNode.y += deltaY;
  }

  return true;
}

function addBranchStepForNode({
  nodeId,
  connectorKind,
  item,
} = {}) {
  const sourceNode = findNodeById(nodeId);
  if (!sourceNode || !isBranchConnectorKind(connectorKind) || !isBranchContainerNodeType(sourceNode.type)) {
    return;
  }

  const nextNode = createNodeFromAddSelection(item);
  if (!nextNode) {
    return;
  }

  const branchConnections = getBranchConnections(sourceNode.data, sourceNode.type);
  const rawTargetId = branchConnections[connectorKind] || null;
  const existingTargetNode = rawTargetId ? findNodeById(rawTargetId) : null;
  const existingTargetId = existingTargetNode
    && String(existingTargetNode.id) !== String(nextNode.id)
    ? existingTargetNode.id
    : null;

  const fallbackSourceNodeHeight = getNodeLocalHeight(sourceNode.id) || INSERT_NODE_Y_SPACING;
  nextNode.x = Number(sourceNode.x) || 0;
  nextNode.y = (Number(sourceNode.y) || 0) + fallbackSourceNodeHeight + BRANCH_INSERT_SEGMENT_LENGTH;

  nextNode.connections = [];
  if (existingTargetId) {
    nextNode.connections = [existingTargetId];
  }

  branchConnections[connectorKind] = nextNode.id;

  const sourceNodeIndex = nodes.findIndex((node) => String(node.id) === String(sourceNode.id));
  const insertionIndex = sourceNodeIndex === -1 ? nodes.length : sourceNodeIndex + 1;
  nodes.splice(insertionIndex, 0, nextNode);

  setLiveSidebarSteps(nodes);
  emitCurrentNodeIds();
  toggleSidebar(nextNode.id);
  scheduleConnectionLineUpdate();

  const alignBranchInsertedNode = (attempt = 0) => {
    const aligned = alignBranchInsertedNodeToConnector({
      sourceNodeId: sourceNode.id,
      connectorKind,
      insertedNodeId: nextNode.id,
      verticalOffset: BRANCH_INSERT_SEGMENT_LENGTH,
    });

    if (!aligned && attempt < 6) {
      requestAnimationFrame(() => {
        scheduleConnectionLineUpdate();
        alignBranchInsertedNode(attempt + 1);
      });
      return;
    }

    if (existingTargetId) {
      const refreshedInsertedMetrics = getNodeLocalMetrics(nextNode.id);
      const existingTargetMetrics = getNodeLocalMetrics(existingTargetId);
      if (refreshedInsertedMetrics && existingTargetMetrics) {
        const minTargetTop = refreshedInsertedMetrics.top
          + refreshedInsertedMetrics.height
          + DEFAULT_TERMINAL_SEGMENT_LENGTH;
        const shiftAmount = Math.ceil(minTargetTop - existingTargetMetrics.top);
        if (shiftAmount > 0) {
          shiftDownstreamNodes(existingTargetId, shiftAmount, [sourceNode.id, nextNode.id]);
        }
      }
    }

    setLiveSidebarSteps(nodes);
    scheduleConnectionLineUpdate();
    requestAnimationFrame(() => scheduleConnectionLineUpdate());
    window.setTimeout(() => scheduleConnectionLineUpdate(), 220);
  };

  nextTick(() => {
    alignBranchInsertedNode();
  });
}

function setInnerStepForNode({ nodeId, sectionIndex, item } = {}) {
  const node = findNodeById(nodeId);
  if (!node || (node.type !== "parallel" && node.type !== "loop")) {
    return;
  }

  const didUpdate = setContainerInnerStepSelection(node.data, node.type, sectionIndex, item);
  if (!didUpdate) {
    return;
  }

  setLiveSidebarSteps(nodes);
  nextTick(() => scheduleConnectionLineUpdate());
}

function addInnerStepForNode({ nodeId, item } = {}) {
  const node = findNodeById(nodeId);
  if (!node || (node.type !== "parallel" && node.type !== "loop")) {
    return;
  }

  addContainerInnerStepSelection(node.data, node.type, item);
  setLiveSidebarSteps(nodes);
  nextTick(() => scheduleConnectionLineUpdate());
}

function removeNodeReferencesFromNode(node, selectedId) {
  node.connections = (node.connections || []).filter((targetId) => String(targetId) !== selectedId);

  if (!isBranchContainerNodeType(node.type)) {
    return;
  }

  const branchConnections = getBranchConnections(node.data, node.type);
  Object.keys(branchConnections).forEach((connectorKind) => {
    if (String(branchConnections[connectorKind]) === selectedId) {
      delete branchConnections[connectorKind];
    }
  });
}

function clearOutgoingConnections(node) {
  node.connections = [];
  if (isBranchContainerNodeType(node.type)) {
    ensureBranchStepData(node.data, node.type);
    node.data.branchConnections = {};
  }
}

function removeAllConnections(nodeId) {
  const selectedId = String(nodeId);

  nodes.forEach((node) => {
    if (String(node.id) === selectedId) {
      clearOutgoingConnections(node);
      return;
    }

    removeNodeReferencesFromNode(node, selectedId);
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
    removeNodeReferencesFromNode(node, selectedId);
  });

  if (selectedNodeId.value && String(selectedNodeId.value) === selectedId) {
    selectedNodeId.value = null;
  }

  setLiveSidebarSteps(nodes);
  emitCurrentNodeIds();
  nextTick(() => scheduleConnectionLineUpdate());
}

function rebuildNodes() {
  const nextTemplates = createBuilderNodeTemplates(props.currentBuilderStep, {
    startBlockMode: props.startBlockMode,
    startTriggerOption: props.startTriggerOption,
  });

  nodes.splice(0, nodes.length);
  nextTemplates.forEach((template) => nodes.push(cloneNodeTemplate(template, { shareData: true, shareComments: true })));
  setLiveSidebarSteps(nodes);
  emitCurrentNodeIds();

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
  setLiveSidebarSteps([]);
  nodeInteraction?.unset();
  nodeInteraction = null;
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  window.removeEventListener("keydown", handleWindowKeyDown);
  window.removeEventListener("resize", handleWindowResize);
  canvasResizeObserver?.disconnect();
  canvasResizeObserver = null;
  cleanupConnectionInteractions();
  if (lineRaf) cancelAnimationFrame(lineRaf);
  lineRaf = 0;
  if (zoomTransitionTimer) {
    window.clearTimeout(zoomTransitionTimer);
    zoomTransitionTimer = 0;
  }
  if (recenterTimer) {
    window.clearTimeout(recenterTimer);
    recenterTimer = 0;
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
      class="assistant-builder-builder"
      :class="{ 'assistant-builder-builder--recentering': isRecentering }"
      :style="builderTranslateStyle"
    >
      <div
        ref="builderScale"
        class="assistant-builder-builder-scale"
        :style="builderScaleStyle"
        @transitionend="handleBuilderScaleTransitionEnd"
      >
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
              @click.stop="removeConnection(connectionMenu.sourceId, connectionMenu.targetId, connectionMenu.sourceConnectorKind)"
            >
              Remove connection
            </button>
          </div>
        </Teleport>
        <TransitionGroup
          name="nodes"
          @after-enter="handleNodesLayoutSettled"
          @after-leave="handleNodesLayoutSettled"
        >
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
            @add-split-else-if="addSplitElseIfForNode"
            @add-branch-step="addBranchStepForNode"
            @set-inner-step="setInnerStepForNode"
            @add-inner-step="addInnerStepForNode"
          />
        </TransitionGroup>

        <BasicDropdown
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
        </BasicDropdown>
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

.assistant-builder-builder {
  inset: 0;
  position: absolute;
}

.assistant-builder-builder--recentering {
  transition: transform 0.16s ease-in-out;
}

.assistant-builder-builder-scale {
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
