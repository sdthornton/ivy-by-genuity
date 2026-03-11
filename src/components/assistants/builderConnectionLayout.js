function getSafeZoom(zoomLevel = 1) {
  const parsedZoom = Number(zoomLevel);
  return parsedZoom > 0 ? parsedZoom : 1;
}

function getBuilderRoot(canvasEl) {
  if (!(canvasEl instanceof HTMLElement)) {
    return null;
  }

  const builderScaleEl = canvasEl.querySelector(".assistant-builder-builder-scale");
  return builderScaleEl instanceof HTMLElement ? builderScaleEl : null;
}

function getLayoutContext(canvasEl, zoomLevel = 1) {
  const builderRootEl = getBuilderRoot(canvasEl);
  if (!builderRootEl) {
    return null;
  }

  return {
    canvasEl,
    zoomLevel: getSafeZoom(zoomLevel),
    rootRect: builderRootEl.getBoundingClientRect(),
  };
}

function getElementLocalMetrics(element, context) {
  if (!(element instanceof HTMLElement) || !context?.rootRect) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const { left: rootLeft, top: rootTop } = context.rootRect;
  const zoom = context.zoomLevel;

  const left = (rect.left - rootLeft) / zoom;
  const top = (rect.top - rootTop) / zoom;
  const width = rect.width / zoom;
  const height = rect.height / zoom;

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

function createCachedMeasurer(context) {
  const cache = new WeakMap();

  return (element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    if (cache.has(element)) {
      return cache.get(element);
    }

    const metrics = getElementLocalMetrics(element, context);
    cache.set(element, metrics);
    return metrics;
  };
}

function getStepElement(canvasEl, nodeId) {
  const stepEl = canvasEl?.querySelector?.(`.assistant-step[data-step-id="${String(nodeId)}"]`);
  return stepEl instanceof HTMLElement ? stepEl : null;
}

function getBranchAnchorElement(stepEl, connectorKind) {
  if (!(stepEl instanceof HTMLElement)) {
    return null;
  }

  const connectorSelector = `.assistant-step-connector[data-connector-kind="${String(connectorKind)}"]`;
  const connectorEl = stepEl.querySelector(connectorSelector);
  if (connectorEl instanceof HTMLElement) {
    return connectorEl;
  }

  const fallbackSelector = `[data-connector-kind="${String(connectorKind)}"].assistant-step-branch-anchor`;
  const fallbackEl = stepEl.querySelector(fallbackSelector);
  return fallbackEl instanceof HTMLElement ? fallbackEl : null;
}

export function getBranchConnectorCenterInCanvas({
  canvasEl,
  nodeId,
  connectorKind,
  isBranchConnectorKind,
  zoomLevel = 1,
} = {}) {
  if (typeof isBranchConnectorKind !== "function" || !isBranchConnectorKind(connectorKind)) {
    return null;
  }

  const context = getLayoutContext(canvasEl, zoomLevel);
  if (!context) {
    return null;
  }

  const stepEl = getStepElement(canvasEl, nodeId);
  if (!stepEl) {
    return null;
  }

  const branchAnchorEl = getBranchAnchorElement(stepEl, connectorKind);
  if (!branchAnchorEl) {
    return null;
  }

  const metrics = getElementLocalMetrics(branchAnchorEl, context);
  if (!metrics) {
    return null;
  }

  return {
    x: metrics.centerX,
    y: metrics.centerY,
  };
}

export function getNodeMetricsInCanvas({
  canvasEl,
  nodeId,
  zoomLevel = 1,
} = {}) {
  const context = getLayoutContext(canvasEl, zoomLevel);
  if (!context) {
    return null;
  }

  const nodeEl = getStepElement(canvasEl, nodeId);
  if (!nodeEl) {
    return null;
  }

  return getElementLocalMetrics(nodeEl, context);
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

function collectAnchors({
  canvasEl,
  findNodeById,
  measureElementLocal,
} = {}) {
  const anchors = new Map();
  const branchAnchors = new Map();
  const nodeEls = Array.from(canvasEl.querySelectorAll(".assistant-step[data-step-id]"));

  nodeEls.forEach((nodeEl) => {
    const nodeId = String(nodeEl.dataset.stepId || "");
    if (!nodeId || !findNodeById(nodeId)) {
      return;
    }

    const nodeMetrics = measureElementLocal(nodeEl);
    if (!nodeMetrics) {
      return;
    }

    anchors.set(nodeId, {
      x: nodeMetrics.centerX,
      topY: nodeMetrics.top,
      bottomY: nodeMetrics.bottom,
    });

    const bestByConnectorKind = new Map();
    const branchElements = Array.from(
      nodeEl.querySelectorAll('[data-connector-kind^="branch:"]'),
    );

    branchElements.forEach((branchElement) => {
      if (!(branchElement instanceof HTMLElement)) {
        return;
      }

      const connectorKind = String(branchElement.dataset.connectorKind || "");
      if (!connectorKind) {
        return;
      }

      const isConnectorNode = branchElement.classList.contains("assistant-step-connector");
      const isFallbackAnchor = branchElement.classList.contains("assistant-step-branch-anchor");
      if (!isConnectorNode && !isFallbackAnchor) {
        return;
      }

      const priority = isConnectorNode ? 1 : 2;
      const currentBest = bestByConnectorKind.get(connectorKind);
      if (currentBest && currentBest.priority <= priority) {
        return;
      }

      const metrics = measureElementLocal(branchElement);
      if (!metrics) {
        return;
      }

      bestByConnectorKind.set(connectorKind, {
        priority,
        x: metrics.centerX,
        y: metrics.centerY,
      });
    });

    bestByConnectorKind.forEach((anchor, connectorKind) => {
      branchAnchors.set(`${nodeId}|${connectorKind}`, {
        x: anchor.x,
        y: anchor.y,
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
  const context = getLayoutContext(canvasEl, zoomLevel);
  if (!context) {
    return null;
  }

  const measureElementLocal = createCachedMeasurer(context);
  const { anchors, branchAnchors } = collectAnchors({
    canvasEl,
    findNodeById,
    measureElementLocal,
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
