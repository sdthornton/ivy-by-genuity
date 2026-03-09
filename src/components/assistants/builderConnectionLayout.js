function getElementLocalMetrics(element, rootRect, zoom = 1) {
  if (
    !(element instanceof HTMLElement)
    || !rootRect
    || typeof rootRect.left !== "number"
    || typeof rootRect.top !== "number"
  ) {
    return null;
  }

  const safeZoom = Number(zoom) > 0 ? Number(zoom) : 1;
  const rect = element.getBoundingClientRect();
  if (!rect || typeof rect.left !== "number" || typeof rect.top !== "number") {
    return null;
  }

  const left = (rect.left - rootRect.left) / safeZoom;
  const top = (rect.top - rootRect.top) / safeZoom;
  const width = rect.width / safeZoom;
  const height = rect.height / safeZoom;

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    centerX: left + (width / 2),
    centerY: top + (height / 2),
  };
}

function getSceneRoot(canvasEl) {
  if (!(canvasEl instanceof HTMLElement)) {
    return null;
  }

  const sceneScaleEl = canvasEl.querySelector(".assistant-builder-scene-scale");
  if (!(sceneScaleEl instanceof HTMLElement)) {
    return null;
  }

  return sceneScaleEl;
}

export function getBranchConnectorCenterInCanvas({
  canvasEl,
  nodeId,
  connectorKind,
  isBranchConnectorKind,
  zoomLevel = 1,
} = {}) {
  
  console.log(isBranchConnectorKind(connectorKind));

  if (typeof isBranchConnectorKind !== "function" || !isBranchConnectorKind(connectorKind)) {
    return null;
  }

  const sceneScaleEl = getSceneRoot(canvasEl);
  if (!sceneScaleEl) {
    return null;
  }
  const sceneRect = sceneScaleEl.getBoundingClientRect();
  console.log(sceneScaleEl);
  console.log(sceneRect);

  const sourceEl = canvasEl.querySelector(`.assistant-step[data-step-id="${String(nodeId)}"]`);
  if (!(sourceEl instanceof HTMLElement)) {
    return null;
  }

  const connectorEl = sourceEl.querySelector(
    `.assistant-step-connector[data-connector-kind="${String(connectorKind)}"]`,
  );
  const fallbackAnchorEl = sourceEl.querySelector(
    `[data-connector-kind="${String(connectorKind)}"].assistant-step-branch-anchor`,
  );
  const resolvedEl = connectorEl instanceof HTMLElement ? connectorEl : fallbackAnchorEl;
  if (!(resolvedEl instanceof HTMLElement)) {
    return null;
  }

  const metrics = getElementLocalMetrics(resolvedEl, sceneRect, zoomLevel);
  if (!metrics) {
    return null;
  }

  return {
    x: metrics.centerX,
    y: metrics.centerY,
  };
}

export function getNodeHeightInCanvas({
  canvasEl,
  nodeId,
  zoomLevel = 1,
} = {}) {
  const metrics = getNodeMetricsInCanvas({
    canvasEl,
    nodeId,
    zoomLevel,
  });
  return metrics ? metrics.height : null;
}

export function getNodeWidthInCanvas({
  canvasEl,
  nodeId,
  zoomLevel = 1,
} = {}) {
  const metrics = getNodeMetricsInCanvas({
    canvasEl,
    nodeId,
    zoomLevel,
  });
  return metrics ? metrics.width : null;
}

export function getNodeMetricsInCanvas({
  canvasEl,
  nodeId,
  zoomLevel = 1,
} = {}) {
  const sceneScaleEl = getSceneRoot(canvasEl);
  if (!sceneScaleEl) {
    return null;
  }

  const sceneRect = sceneScaleEl.getBoundingClientRect();
  const nodeEl = canvasEl.querySelector(`.assistant-step[data-step-id="${String(nodeId)}"]`);
  if (!(nodeEl instanceof HTMLElement)) {
    return null;
  }

  return getElementLocalMetrics(nodeEl, sceneRect, zoomLevel);
}

function collectAnchors({
  canvasEl,
  nodes,
  findNodeById,
  sceneRect,
  zoomLevel,
} = {}) {
  const anchors = new Map();
  const branchAnchors = new Map();
  const nodeEls = Array.from(canvasEl.querySelectorAll(".assistant-step[data-step-id]"));

  nodeEls.forEach((el) => {
    const nodeId = String(el.dataset.stepId || "");
    if (!nodeId || !findNodeById(nodeId)) {
      return;
    }

    const nodeMetrics = getElementLocalMetrics(el, sceneRect, zoomLevel);
    if (!nodeMetrics) {
      return;
    }

    anchors.set(nodeId, {
      x: nodeMetrics.centerX,
      topY: nodeMetrics.top,
      bottomY: nodeMetrics.bottom,
    });

    const connectorEls = Array.from(
      el.querySelectorAll('.assistant-step-connector[data-connector-kind^="branch:"]'),
    );
    connectorEls.forEach((connectorEl) => {
      if (!(connectorEl instanceof HTMLElement)) {
        return;
      }

      const connectorKind = String(connectorEl.dataset.connectorKind || "");
      if (!connectorKind || branchAnchors.has(`${nodeId}|${connectorKind}`)) {
        return;
      }

      const connectorMetrics = getElementLocalMetrics(connectorEl, sceneRect, zoomLevel);
      if (!connectorMetrics) {
        return;
      }

      branchAnchors.set(`${nodeId}|${connectorKind}`, {
        x: connectorMetrics.centerX,
        y: connectorMetrics.centerY,
      });
    });

    const branchAnchorEls = Array.from(
      el.querySelectorAll('[data-connector-kind^="branch:"].assistant-step-branch-anchor'),
    );
    branchAnchorEls.forEach((anchorEl) => {
      if (!(anchorEl instanceof HTMLElement)) {
        return;
      }

      const connectorKind = String(anchorEl.dataset.connectorKind || "");
      if (!connectorKind || branchAnchors.has(`${nodeId}|${connectorKind}`)) {
        return;
      }

      const anchorMetrics = getElementLocalMetrics(anchorEl, sceneRect, zoomLevel);
      if (!anchorMetrics) {
        return;
      }

      branchAnchors.set(`${nodeId}|${connectorKind}`, {
        x: anchorMetrics.centerX,
        y: anchorMetrics.centerY,
      });
    });
  });

  return { anchors, branchAnchors };
}

function buildConnectionLines({
  nodes,
  anchors,
  branchAnchors,
  isBranchContainerNodeType,
  isBranchConnectorKind,
  getBranchConnections,
  getConnectionLineKey,
} = {}) {
  const lines = [];

  nodes.forEach((node) => {
    const source = anchors.get(String(node.id));
    if (!source) {
      return;
    }

    (node.connections || []).forEach((targetId) => {
      const target = anchors.get(String(targetId));
      if (!target) {
        return;
      }

      lines.push({
        key: getConnectionLineKey(node.id, targetId, "bottom"),
        sourceId: String(node.id),
        targetId: String(targetId),
        sourceConnectorKind: "bottom",
        x1: source.x,
        y1: source.bottomY,
        x2: target.x,
        y2: target.topY,
        midX: (source.x + target.x) / 2,
        midY: (source.bottomY + target.topY) / 2,
        showInlineAdd: true,
      });
    });

    if (!isBranchContainerNodeType(node.type)) {
      return;
    }

    const branchConnections = getBranchConnections(node.data, node.type);
    Object.entries(branchConnections).forEach(([connectorKind, targetId]) => {
      if (!isBranchConnectorKind(connectorKind) || !targetId) {
        return;
      }

      const branchSource = branchAnchors.get(`${String(node.id)}|${connectorKind}`);
      const target = anchors.get(String(targetId));
      if (!branchSource || !target) {
        return;
      }

      lines.push({
        key: getConnectionLineKey(node.id, targetId, connectorKind),
        sourceId: String(node.id),
        targetId: String(targetId),
        sourceConnectorKind: connectorKind,
        x1: branchSource.x,
        y1: branchSource.y,
        x2: target.x,
        y2: target.topY,
        midX: (branchSource.x + target.x) / 2,
        midY: (branchSource.y + target.topY) / 2,
        showInlineAdd: true,
      });
    });
  });

  return lines;
}

function buildTerminalAddControls({
  nodes,
  anchors,
  lines,
  isBranchContainerNodeType,
  defaultTerminalSegmentLength = 42,
} = {}) {
  const terminalSegmentLength = lines.length
    ? lines.reduce((sum, line) => sum + Math.abs(line.midY - line.y1), 0) / lines.length
    : defaultTerminalSegmentLength;

  return nodes
    .filter((node) => (
      !isBranchContainerNodeType(node.type)
      && !(node.connections || []).some((targetId) => anchors.has(String(targetId)))
    ))
    .map((node) => {
      const anchor = anchors.get(String(node.id));
      if (!anchor) {
        return null;
      }

      const top = anchor.bottomY + terminalSegmentLength;
      return {
        key: `terminal-add-${node.id}`,
        lineKey: `terminal-add-line-${node.id}`,
        sourceId: String(node.id),
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

export function computeBuilderConnectionLayout({
  canvasEl,
  zoomLevel = 1,
  nodes = [],
  findNodeById,
  isBranchContainerNodeType,
  isBranchConnectorKind,
  getBranchConnections,
  getConnectionLineKey,
  defaultTerminalSegmentLength = 42,
} = {}) {
  const sceneScaleEl = getSceneRoot(canvasEl);
  if (!sceneScaleEl) {
    return null;
  }

  const sceneRect = sceneScaleEl.getBoundingClientRect();
  const { anchors, branchAnchors } = collectAnchors({
    canvasEl,
    nodes,
    findNodeById,
    sceneRect,
    zoomLevel,
  });

  const connectionLines = buildConnectionLines({
    nodes,
    anchors,
    branchAnchors,
    isBranchContainerNodeType,
    isBranchConnectorKind,
    getBranchConnections,
    getConnectionLineKey,
  });

  const terminalAddControls = buildTerminalAddControls({
    nodes,
    anchors,
    lines: connectionLines,
    isBranchContainerNodeType,
    defaultTerminalSegmentLength,
  });

  return {
    canvasWidth: canvasEl.clientWidth,
    canvasHeight: canvasEl.clientHeight,
    connectionLines,
    terminalAddControls,
  };
}
