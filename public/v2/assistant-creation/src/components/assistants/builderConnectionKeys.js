export function isBranchConnectorKind(connectorKind) {
  return String(connectorKind || "").startsWith("branch:");
}

export function isBranchContainerNodeType(nodeType) {
  return nodeType === "split" || nodeType === "parallel" || nodeType === "loop";
}

export function getConnectionLineKey(sourceId, targetId, sourceConnectorKind = "bottom") {
  if (isBranchConnectorKind(sourceConnectorKind)) {
    return `${sourceId}-${sourceConnectorKind}-${targetId}`;
  }

  return `${sourceId}-${targetId}`;
}
