import {
  sourceOptions,
  START_BLOCK_MODES,
  START_STATE_KEYS,
  STEP_TYPE_DEFINITIONS,
  STEP_TYPE_META,
  WAIT_MODE_OPTIONS,
} from "./stepDefinitions";

export {
  sourceOptions,
  START_BLOCK_MODES,
  START_STATE_KEYS,
  STEP_TYPE_DEFINITIONS,
  STEP_TYPE_META,
  WAIT_MODE_OPTIONS,
};

export function cloneRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}

export function cloneComments(comments = []) {
  return comments.map((comment) => ({ ...comment }));
}

export function cloneSources(sources = []) {
  return sources.map((source) => ({ ...source }));
}

export function cloneDataValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDataValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneDataValue(nestedValue)]),
    );
  }

  return value;
}

export function createWarningState(rows = []) {
  return rows.reduce((rowAcc, row) => {
    if (row.dataKey) {
      rowAcc[row.dataKey] = Boolean(row.showWarning);
    }
    return rowAcc;
  }, {});
}

export function getResolvedTypeDefinition(type) {
  return STEP_TYPE_DEFINITIONS[type] || STEP_TYPE_DEFINITIONS.note;
}

function normalizeWaitMode(mode) {
  return mode === "specific-time" ? "specific-time" : "duration";
}

export function getStepTypeMeta(type) {
  return STEP_TYPE_META[type] || STEP_TYPE_META.note;
}

export function resolveStepPill(type, pill) {
  return pill || getResolvedTypeDefinition(type).pill || getStepTypeMeta(type).label;
}

function resolveStepRowsByKeys(type, rowKeys = []) {
  const definitionRows = getResolvedTypeDefinition(type).rows || [];
  const rowByKey = new Map(
    definitionRows.map((row) => [row.key, row]),
  );

  return rowKeys
    .map((rowKey) => rowByKey.get(rowKey))
    .filter(Boolean)
    .map((row) => ({ ...row }));
}

export function resolveStepRows(type, rows, rowKeys = []) {
  if (Array.isArray(rows) && rows.length) {
    return cloneRows(rows);
  }

  if (Array.isArray(rowKeys) && rowKeys.length) {
    return resolveStepRowsByKeys(type, rowKeys);
  }

  return cloneRows(getResolvedTypeDefinition(type).rows || []);
}

export function resolveStepSources(type, sources) {
  return cloneSources(sources || getResolvedTypeDefinition(type).sources || []);
}

export function resolveStepBuilderData(type, builderData) {
  const resolved = cloneDataValue(getResolvedTypeDefinition(type).builderData || {});
  Object.entries(builderData || {}).forEach(([key, value]) => {
    resolved[key] = cloneDataValue(value);
  });
  return resolved;
}

export function resolveStepIvySays(type, ivySays) {
  return ivySays || getResolvedTypeDefinition(type).ivySays || "";
}

export function resolveStepDefinition(step = {}) {
  return {
    ...step,
    pill: resolveStepPill(step.type, step.pill),
    rows: resolveStepRows(step.type, step.rows, step.rowKeys),
    builderData: resolveStepBuilderData(step.type, step.builderData),
    ivySays: resolveStepIvySays(step.type, step.ivySays),
    comments: cloneComments(step.comments),
    sources: resolveStepSources(step.type, step.sources),
  };
}

export function getStepTypeDefinition(type) {
  return {
    ...getResolvedTypeDefinition(type),
    sources: resolveStepSources(type),
    rows: resolveStepRows(type),
    builderData: resolveStepBuilderData(type),
  };
}

function toNormalizedSplitConditionText(value) {
  return String(value ?? "");
}

function toNormalizedElseIfConditions(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((condition) => toNormalizedSplitConditionText(condition));
}

function hasSameStringArrayValues(current = [], next = []) {
  if (!Array.isArray(current) || !Array.isArray(next) || current.length !== next.length) {
    return false;
  }

  for (let index = 0; index < current.length; index += 1) {
    if (String(current[index] ?? "") !== String(next[index] ?? "")) {
      return false;
    }
  }

  return true;
}

export function ensureSplitStepData(stepData = null) {
  if (!stepData || typeof stepData !== "object") {
    return {
      ifCondition: "",
      elseIfConditions: [],
      elseCondition: "",
      branchConnections: {},
    };
  }

  if (!("ifCondition" in stepData)) {
    stepData.ifCondition = "";
  } else {
    const normalizedIfCondition = toNormalizedSplitConditionText(stepData.ifCondition);
    if (stepData.ifCondition !== normalizedIfCondition) {
      stepData.ifCondition = normalizedIfCondition;
    }
  }

  const normalizedElseIfConditions = toNormalizedElseIfConditions(stepData.elseIfConditions);
  if (
    !Array.isArray(stepData.elseIfConditions)
    || !hasSameStringArrayValues(stepData.elseIfConditions, normalizedElseIfConditions)
  ) {
    stepData.elseIfConditions = normalizedElseIfConditions;
  }

  if (!("elseCondition" in stepData)) {
    stepData.elseCondition = "";
  } else {
    const normalizedElseCondition = toNormalizedSplitConditionText(stepData.elseCondition);
    if (stepData.elseCondition !== normalizedElseCondition) {
      stepData.elseCondition = normalizedElseCondition;
    }
  }

  if (!stepData.branchConnections || typeof stepData.branchConnections !== "object") {
    stepData.branchConnections = {};
  }

  return stepData;
}

export function addSplitElseIfCondition(stepData = null, insertIndex = null) {
  const normalized = ensureSplitStepData(stepData);
  if (Number.isFinite(insertIndex)) {
    const boundedIndex = Math.max(
      0,
      Math.min(Math.trunc(insertIndex), normalized.elseIfConditions.length),
    );
    normalized.elseIfConditions.splice(boundedIndex, 0, "");
    return boundedIndex;
  }

  normalized.elseIfConditions.push("");
  return normalized.elseIfConditions.length - 1;
}

export function getSplitBranchConnectorKind(branchId) {
  return `branch:${String(branchId)}`;
}

const DEFAULT_CONTAINER_BRANCH_COUNT = 2;

function getContainerBranchPrefix(containerType = "") {
  const prefix = String(containerType || "branch").trim().toLowerCase();
  return prefix || "branch";
}

function toNormalizedInnerStep(step = {}, index = 0, branchPrefix = "branch") {
  const normalizedBranchId = String(step?.branchId || "").trim() || `${branchPrefix}-${index + 1}`;
  const normalizedType = String(step?.type || "").trim();
  const normalizedLabel = String(step?.label || "").trim() || "Choose block";

  return {
    branchId: normalizedBranchId,
    type: normalizedType,
    label: normalizedLabel,
  };
}

function getDefaultContainerInnerSteps(branchPrefix = "branch", count = DEFAULT_CONTAINER_BRANCH_COUNT) {
  return Array.from({ length: count }, (_, index) => toNormalizedInnerStep({}, index, branchPrefix));
}

function resolveContainerSelection(item = null) {
  const type = String(item?.type || item?.key || "").trim();
  const label = String(item?.label || "").trim();

  return {
    type,
    label: label || "Choose block",
  };
}

function getUniqueContainerBranchId(innerSteps = [], branchPrefix = "branch") {
  const existingIds = new Set(
    innerSteps.map((step) => String(step?.branchId || "").trim()).filter(Boolean),
  );

  let index = Math.max(1, existingIds.size + 1);
  while (existingIds.has(`${branchPrefix}-${index}`)) {
    index += 1;
  }

  return `${branchPrefix}-${index}`;
}

export function ensureContainerStepData(stepData = null, containerType = "branch") {
  const branchPrefix = getContainerBranchPrefix(containerType);
  if (!stepData || typeof stepData !== "object") {
    return {
      innerSteps: getDefaultContainerInnerSteps(branchPrefix),
      branchConnections: {},
    };
  }

  if (!stepData.branchConnections || typeof stepData.branchConnections !== "object") {
    stepData.branchConnections = {};
  }

  const currentInnerSteps = Array.isArray(stepData.innerSteps) ? stepData.innerSteps : [];
  if (!currentInnerSteps.length) {
    stepData.innerSteps = getDefaultContainerInnerSteps(branchPrefix);
    return stepData;
  }

  const normalizedInnerSteps = currentInnerSteps.map((step, index) => (
    toNormalizedInnerStep(step, index, branchPrefix)
  ));

  const hasInnerStepChanges = normalizedInnerSteps.some((normalizedStep, index) => {
    const currentStep = currentInnerSteps[index] || {};
    return (
      String(currentStep?.branchId || "").trim() !== normalizedStep.branchId
      || String(currentStep?.type || "").trim() !== normalizedStep.type
      || String(currentStep?.label || "").trim() !== normalizedStep.label
    );
  });

  if (hasInnerStepChanges) {
    stepData.innerSteps = normalizedInnerSteps;
  }

  return stepData;
}

export function getContainerInnerSections(stepData = null, containerType = "branch") {
  const normalized = ensureContainerStepData(stepData, containerType);

  return normalized.innerSteps.map((step, index) => ({
    id: `${step.branchId}-${index}`,
    branchId: step.branchId,
    connectorKind: getSplitBranchConnectorKind(step.branchId),
    label: step.label || "Choose block",
    type: step.type || "",
  }));
}

export function setContainerInnerStepSelection(stepData = null, containerType = "branch", sectionIndex = -1, item = null) {
  const normalized = ensureContainerStepData(stepData, containerType);
  const targetIndex = Number(sectionIndex);
  if (!Number.isFinite(targetIndex) || targetIndex < 0 || targetIndex >= normalized.innerSteps.length) {
    return false;
  }

  const currentStep = toNormalizedInnerStep(
    normalized.innerSteps[targetIndex],
    targetIndex,
    getContainerBranchPrefix(containerType),
  );
  const selection = resolveContainerSelection(item);

  normalized.innerSteps[targetIndex] = {
    ...currentStep,
    type: selection.type,
    label: selection.label,
  };

  return true;
}

export function addContainerInnerStepSelection(stepData = null, containerType = "branch", item = null) {
  const normalized = ensureContainerStepData(stepData, containerType);
  const branchPrefix = getContainerBranchPrefix(containerType);
  const selection = resolveContainerSelection(item);
  const branchId = getUniqueContainerBranchId(normalized.innerSteps, branchPrefix);

  normalized.innerSteps.push({
    branchId,
    type: selection.type,
    label: selection.label,
  });

  return branchId;
}

export function getSplitBranchConnections(stepData = null) {
  return ensureSplitStepData(stepData).branchConnections;
}

export function ensureBranchStepData(stepData = null, nodeType = "split") {
  if (nodeType === "split") {
    return ensureSplitStepData(stepData);
  }

  return ensureContainerStepData(stepData, nodeType);
}

export function getBranchConnections(stepData = null, nodeType = "split") {
  return ensureBranchStepData(stepData, nodeType).branchConnections;
}

export function getSplitConditionSections(stepData = null) {
  const normalized = ensureSplitStepData(stepData);
  const sections = [
    {
      id: "if",
      branchId: "if",
      connectorKind: getSplitBranchConnectorKind("if"),
      label: "If",
      value: normalized.ifCondition,
      placeholder: "Condition to evaluate first",
    },
  ];

  normalized.elseIfConditions.forEach((condition, index) => {
    const branchId = `else-if-${index}`;
    sections.push({
      id: branchId,
      branchId,
      connectorKind: getSplitBranchConnectorKind(branchId),
      label: "Else If",
      value: condition,
      placeholder: "Additional condition",
    });
  });

  sections.push({
    id: "else",
    branchId: "else",
    connectorKind: getSplitBranchConnectorKind("else"),
    label: "Else",
    value: normalized.elseCondition,
    placeholder: "Fallback branch",
  });

  return sections;
}

export function setSplitConditionValue(stepData = null, branchId = "", value = "") {
  const normalized = ensureSplitStepData(stepData);
  const nextValue = toNormalizedSplitConditionText(value);

  if (branchId === "if") {
    normalized.ifCondition = nextValue;
    return;
  }

  if (branchId === "else") {
    normalized.elseCondition = nextValue;
    return;
  }

  const branchMatch = String(branchId).match(/^else-if-(\d+)$/);
  if (!branchMatch) {
    return;
  }

  const elseIfIndex = Number(branchMatch[1]);
  if (!Number.isFinite(elseIfIndex) || elseIfIndex < 0) {
    return;
  }

  while (normalized.elseIfConditions.length <= elseIfIndex) {
    normalized.elseIfConditions.push("");
  }

  normalized.elseIfConditions[elseIfIndex] = nextValue;
}

export function getWaitModeOptions() {
  return WAIT_MODE_OPTIONS.map((option) => ({ ...option }));
}

export function getNormalizedWaitMode(mode) {
  return normalizeWaitMode(mode);
}

export function getVisibleStepRows(step = null) {
  const rows = Array.isArray(step?.rows) ? step.rows : [];
  if (step?.type !== "wait") {
    return rows;
  }

  const waitMode = normalizeWaitMode(step?.data?.waitMode);
  return rows.filter((row) => {
    if (!Array.isArray(row?.waitModes) || !row.waitModes.length) {
      return true;
    }

    return row.waitModes.includes(waitMode);
  });
}

export function getStartBlockOptions() {
  return [
    { key: START_BLOCK_MODES.start, label: "Start", type: "start" },
    { key: START_BLOCK_MODES.schedule, label: "Schedule", type: "schedule" },
    { key: START_BLOCK_MODES.trigger, label: "Trigger", type: "trigger" },
  ].map((option) => ({
    ...option,
    typeMeta: getStepTypeMeta(option.type),
  }));
}

export function getAddStepMenuGroups() {
  return [
    {
      key: "data",
      label: "Data",
      items: [
        { key: "lookup", label: "Data Source(s)", type: "lookup" },
      ],
    },
    {
      key: "logic",
      label: "Logic",
      items: [
        { key: "split", label: "Conditional Split", type: "split" },
        { key: "parallel", label: "Parallel Steps", type: "parallel" },
        { key: "wait", label: "Wait/Delay", type: "wait" },
        { key: "loop", label: "Loop", type: "loop" },
      ],
    },
    {
      key: "actions",
      label: "Actions",
      items: [
        { key: "message", label: "Send Message", type: "message" },
        { key: "action", label: "Ivy Action", type: "action" },
        { key: "code", label: "Run Code", type: "code" },
        { key: "note", label: "Create Note", type: "note" },
        { key: "alert", label: "Set Alert", type: "alert" },
      ],
    },
  ].map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      typeMeta: getStepTypeMeta(item.type),
    })),
  }));
}
