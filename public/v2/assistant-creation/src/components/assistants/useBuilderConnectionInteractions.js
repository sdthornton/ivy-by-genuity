import { nextTick, reactive, ref } from "vue";
import {
  getConnectionLineKey,
  isBranchConnectorKind,
} from "./builderConnectionKeys";

const REORDER_DRAG_THRESHOLD = 8;
const CONNECTION_MENU_OFFSET = 10;
const CONNECTION_MENU_PADDING = 8;
const REORDER_TRANSITION_MS = 180;

export function useBuilderConnectionInteractions({
  canvas,
  nodes,
  findNodeById,
  findIncomingConnection,
  getBranchConnections,
  ensureBranchStepData,
  scheduleConnectionLineUpdate,
}) {
  const reorderDrag = reactive({
    active: false,
    moved: false,
    originLineKey: null,
    originConnectionSourceId: null,
    originConnectionTargetId: null,
    originConnectionSourceKind: "bottom",
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
    sourceConnectorKind: "bottom",
    anchorX: 0,
    anchorY: 0,
    left: 0,
    top: 0,
  });

  const hoveredConnectionKey = ref(null);
  const connectionMenuEl = ref(null);
  const isReorderingNodes = ref(false);

  let reorderTransitionTimer = 0;

  function requestLineUpdate() {
    if (typeof scheduleConnectionLineUpdate === "function") {
      scheduleConnectionLineUpdate();
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
    connectionMenu.sourceConnectorKind = "bottom";
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

  function openConnectionMenu(sourceId, targetId, clientX, clientY, sourceConnectorKind = "bottom") {
    if (!sourceId || !targetId) {
      return;
    }

    connectionMenu.open = true;
    connectionMenu.sourceId = String(sourceId);
    connectionMenu.targetId = String(targetId);
    connectionMenu.sourceConnectorKind = sourceConnectorKind;
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
    if (isBranchConnectorKind(connectorKind)) {
      const node = findNodeById(nodeId);
      const branchConnections = getBranchConnections(node?.data, node?.type);
      const targetId = branchConnections?.[connectorKind];
      if (!targetId) {
        return null;
      }

      return {
        sourceId: String(nodeId),
        targetId: String(targetId),
        sourceConnectorKind: connectorKind,
      };
    }

    if (connectorKind === "bottom") {
      const node = findNodeById(nodeId);
      const targetId = node?.connections?.[0];
      if (!targetId) {
        return null;
      }

      return {
        sourceId: String(nodeId),
        targetId: String(targetId),
        sourceConnectorKind: "bottom",
      };
    }

    return findIncomingConnection(nodeId);
  }

  function removeConnection(sourceId, targetId, sourceConnectorKind = "bottom") {
    const sourceNode = findNodeById(sourceId);
    if (!sourceNode) {
      return;
    }

    if (isBranchConnectorKind(sourceConnectorKind)) {
      const branchConnections = getBranchConnections(sourceNode.data, sourceNode.type);
      if (String(branchConnections[sourceConnectorKind]) === String(targetId)) {
        delete branchConnections[sourceConnectorKind];
      }
    } else {
      sourceNode.connections = (sourceNode.connections || []).filter((connectionId) => String(connectionId) !== String(targetId));
    }

    closeConnectionMenu();
    nextTick(() => requestLineUpdate());
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

    hoveredConnectionKey.value = getConnectionLineKey(
      connection.sourceId,
      connection.targetId,
      connection.sourceConnectorKind,
    );
  }

  function clearConnectorHover(nodeId, connectorKind) {
    const connection = getConnectionForConnector(nodeId, connectorKind);
    if (!connection) {
      return;
    }

    clearHoveredConnection(getConnectionLineKey(
      connection.sourceId,
      connection.targetId,
      connection.sourceConnectorKind,
    ));
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
    reorderDrag.originConnectionSourceKind = "bottom";
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

    const expectedTargetKind = isBranchConnectorKind(reorderDrag.sourceKind)
      ? "top"
      : reorderDrag.sourceKind === "bottom"
        ? "top"
        : "bottom";
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

  function applyBranchConnectionDrag() {
    const sourceId = String(reorderDrag.sourceId || "");
    const sourceKind = String(reorderDrag.sourceKind || "");
    const targetId = String(reorderDrag.targetId || "");
    if (!sourceId || !targetId || !isBranchConnectorKind(sourceKind) || sourceId === targetId) {
      return;
    }

    const sourceNode = findNodeById(sourceId);
    if (!sourceNode) {
      return;
    }

    ensureBranchStepData(sourceNode.data, sourceNode.type);
    sourceNode.data.branchConnections[sourceKind] = targetId;
    nextTick(() => requestLineUpdate());
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
    nextTick(() => requestLineUpdate());
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

    const isBranchDrag = isBranchConnectorKind(reorderDrag.sourceKind);
    if (reorderDrag.moved && reorderDrag.targetId) {
      if (isBranchDrag) {
        applyBranchConnectionDrag();
      } else {
        applyNodeReorder();
      }
    } else if (
      reorderDrag.moved
      && reorderDrag.originConnectionSourceId
      && reorderDrag.originConnectionTargetId
    ) {
      removeConnection(
        reorderDrag.originConnectionSourceId,
        reorderDrag.originConnectionTargetId,
        reorderDrag.originConnectionSourceKind,
      );
    } else if (!reorderDrag.moved) {
      if (reorderDrag.originConnectionSourceId && reorderDrag.originConnectionTargetId) {
        openConnectionMenu(
          reorderDrag.originConnectionSourceId,
          reorderDrag.originConnectionTargetId,
          reorderDrag.startX,
          reorderDrag.startY,
          reorderDrag.originConnectionSourceKind,
        );
      } else {
        const connection = getConnectionForConnector(reorderDrag.sourceId, reorderDrag.sourceKind);
        if (connection) {
          openConnectionMenu(
            connection.sourceId,
            connection.targetId,
            reorderDrag.startX,
            reorderDrag.startY,
            connection.sourceConnectorKind,
          );
        }
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
    reorderDrag.originConnectionSourceKind = originLine?.sourceConnectorKind || "bottom";
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
      key: getConnectionLineKey(
        originConnection.sourceId,
        originConnection.targetId,
        originConnection.sourceConnectorKind,
      ),
      sourceId: originConnection.sourceId,
      targetId: originConnection.targetId,
      sourceConnectorKind: originConnection.sourceConnectorKind,
    } : null;

    beginReorderDrag(event, nodeId, connectorKind, event.currentTarget, originLine);
  }

  function startLineReorderDrag(event, line) {
    if (isBranchConnectorKind(line.sourceConnectorKind)) {
      const connectorEl = getConnectorElement(line.sourceId, line.sourceConnectorKind);
      if (!connectorEl) {
        return;
      }

      beginReorderDrag(event, line.sourceId, line.sourceConnectorKind, connectorEl, line);
      return;
    }

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

  function cleanupConnectionInteractions() {
    finishReorderDrag();
    if (reorderTransitionTimer) {
      window.clearTimeout(reorderTransitionTimer);
      reorderTransitionTimer = 0;
    }
  }

  return {
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
  };
}
