import { reactive } from "vue";
import { MOCK_FLOW_STEP_DATA_BY_STATE_KEY, MOCK_FLOW_STEP_STATE_ORDER } from "./mockAssistantBuildData";
import { BASE_FLOW_STEPS, START_VARIANT_BASE } from "./mockStepSeeds";
import {
  START_BLOCK_MODES,
  START_STATE_KEYS,
  cloneComments,
  cloneDataValue,
  cloneRows,
  cloneSources,
  createWarningState,
  getStepTypeMeta,
  resolveStepBuilderData,
  resolveStepDefinition,
  resolveStepIvySays,
  resolveStepPill,
  resolveStepRows,
  resolveStepSources,
} from "./stepRuntime";

const resolvedStartVariants = Object.fromEntries(
  Object.entries(START_VARIANT_BASE).map(([mode, step]) => [mode, resolveStepDefinition(step)]),
);

const resolvedBaseFlowSteps = BASE_FLOW_STEPS.map((step) => resolveStepDefinition(step));

const sharedStepData = reactive({
  [START_STATE_KEYS.start]: { ...resolvedStartVariants.start.builderData },
  [START_STATE_KEYS.schedule]: { ...resolvedStartVariants.schedule.builderData },
  [START_STATE_KEYS.trigger]: { ...resolvedStartVariants.trigger.builderData },
  ...resolvedBaseFlowSteps.reduce((acc, step) => {
    acc[step.stateKey] = { ...step.builderData };
    return acc;
  }, {}),
});

const sharedStepComments = reactive({
  [START_STATE_KEYS.start]: cloneComments(resolvedStartVariants.start.comments),
  [START_STATE_KEYS.schedule]: cloneComments(resolvedStartVariants.schedule.comments),
  [START_STATE_KEYS.trigger]: cloneComments(resolvedStartVariants.trigger.comments),
  ...resolvedBaseFlowSteps.reduce((acc, step) => {
    acc[step.stateKey] = cloneComments(step.comments);
    return acc;
  }, {}),
});

const sharedStepWarnings = reactive({
  [START_STATE_KEYS.start]: createWarningState(resolvedStartVariants.start.rows),
  [START_STATE_KEYS.schedule]: createWarningState(resolvedStartVariants.schedule.rows),
  [START_STATE_KEYS.trigger]: createWarningState(resolvedStartVariants.trigger.rows),
  ...resolvedBaseFlowSteps.reduce((acc, step) => {
    acc[step.stateKey] = createWarningState(step.rows);
    return acc;
  }, {}),
});

const initialSharedStepDataByStateKey = Object.fromEntries(
  Object.entries(sharedStepData).map(([stateKey, value]) => [stateKey, cloneDataValue(value)]),
);

const liveSidebarSteps = reactive({});

export const MOCK_STEP_COUNT = resolvedBaseFlowSteps.length + 1;

function resetStepDataByStateKey(stateKey) {
  const defaults = cloneDataValue(initialSharedStepDataByStateKey[stateKey]);
  if (!defaults) {
    return;
  }

  if (!sharedStepData[stateKey]) {
    sharedStepData[stateKey] = reactive({ ...defaults });
    return;
  }

  Object.keys(sharedStepData[stateKey]).forEach((key) => {
    delete sharedStepData[stateKey][key];
  });
  Object.assign(sharedStepData[stateKey], defaults);
}

export function resetMockFlowStepData() {
  MOCK_FLOW_STEP_STATE_ORDER.forEach((stateKey) => {
    resetStepDataByStateKey(stateKey);
  });
}

export function applyMockFlowStepDataForBuildStep(buildStep = 0) {
  resetMockFlowStepData();

  const resolvedBuildStep = Math.max(0, Number(buildStep) || 0);
  const visibleFlowStepCount = Math.max(0, resolvedBuildStep - 1);
  for (let index = 0; index < visibleFlowStepCount; index += 1) {
    const stateKey = MOCK_FLOW_STEP_STATE_ORDER[index];
    const mockValues = MOCK_FLOW_STEP_DATA_BY_STATE_KEY[stateKey];
    if (!stateKey || !mockValues || !sharedStepData[stateKey]) {
      continue;
    }

    Object.assign(sharedStepData[stateKey], mockValues);
  }
}

function getNormalizedStartBlockMode(startBlockMode) {
  if (startBlockMode === START_BLOCK_MODES.schedule || startBlockMode === START_BLOCK_MODES.trigger) {
    return startBlockMode;
  }

  return START_BLOCK_MODES.start;
}

function getStartStateKey(startBlockMode) {
  return START_STATE_KEYS[getNormalizedStartBlockMode(startBlockMode)];
}

function resolveStepStateKey(stepKey) {
  return String(stepKey);
}

function getScheduleLabel(triggerOption) {
  if (!triggerOption) {
    return "Schedule";
  }

  if (triggerOption.key === "weekdays") {
    return "Every Morning";
  }

  return triggerOption.label || "Schedule";
}

function getScheduleFrequency(triggerOption) {
  switch (triggerOption?.key) {
    case "every-day":
      return "Every day";
    case "every-week":
      return "Every week";
    case "every-month":
      return "Every month";
    case "custom":
      return "Custom";
    case "weekdays":
    default:
      return "Weekdays";
  }
}

function getScheduleTime(triggerOption) {
  return triggerOption?.key === "custom" ? "Custom" : "09:00 am";
}

function getScheduleTimezone(triggerOption) {
  return triggerOption?.key === "custom" ? "Custom" : "Local";
}

function getTriggerLabel(triggerOption) {
  return triggerOption?.label || "When an event occurs";
}

export function syncStartStepDataFromTrigger(triggerOption) {
  sharedStepData[START_STATE_KEYS.schedule].frequency = getScheduleFrequency(triggerOption);
  sharedStepData[START_STATE_KEYS.schedule].time = getScheduleTime(triggerOption);
  sharedStepData[START_STATE_KEYS.schedule].timezone = getScheduleTimezone(triggerOption);
  sharedStepData[START_STATE_KEYS.trigger].triggerType = "Event-based";
  sharedStepData[START_STATE_KEYS.trigger].event = getTriggerLabel(triggerOption);
}

function createStartStepDefinition(startBlockMode = START_BLOCK_MODES.start, triggerOption = null) {
  const resolvedMode = getNormalizedStartBlockMode(startBlockMode);
  const variant = resolvedStartVariants[resolvedMode];
  const stateKey = getStartStateKey(resolvedMode);
  const typeMeta = getStepTypeMeta(variant.type);
  const hasFollowingSteps = resolvedBaseFlowSteps.length > 0;

  return {
    id: 1,
    stateKey,
    type: variant.type,
    typeMeta,
    isStartBlock: true,
    startBlockMode: resolvedMode,
    title: resolvedMode === START_BLOCK_MODES.start
      ? "Start"
      : resolvedMode === START_BLOCK_MODES.schedule
        ? getScheduleLabel(triggerOption)
        : getTriggerLabel(triggerOption),
    builderTitle: resolvedMode === START_BLOCK_MODES.start
      ? "Start"
      : resolvedMode === START_BLOCK_MODES.schedule
        ? getScheduleLabel(triggerOption)
        : "Event Trigger",
    pill: variant.pill || typeMeta.label,
    sources: [],
    rows: cloneRows(variant.rows),
    comments: getSharedStepComments(stateKey),
    ivySays: variant.ivySays,
    data: getSharedStepData(stateKey),
    detailsCollapsed: false,
    connections: hasFollowingSteps ? [2] : [],
    x: 0,
    y: 0,
  };
}

function getResolvedStepDefinitions(options = {}) {
  const startBlockMode = getNormalizedStartBlockMode(options.startBlockMode);
  const triggerOption = options.startTriggerOption || null;

  return [
    createStartStepDefinition(startBlockMode, triggerOption),
    ...resolvedBaseFlowSteps.map((step) => ({
      ...step,
      typeMeta: getStepTypeMeta(step.type),
      isStartBlock: false,
      startBlockMode: null,
      sources: cloneSources(step.sources),
      rows: cloneRows(step.rows),
      comments: getSharedStepComments(step.stateKey),
      data: getSharedStepData(step.stateKey),
    })),
  ];
}

export function getSharedStepData(stepKey) {
  return sharedStepData[resolveStepStateKey(stepKey)] || null;
}

export function getSharedStepComments(stepKey) {
  return sharedStepComments[resolveStepStateKey(stepKey)] || [];
}

export function isStepWarningVisible(stepKey, dataKey, fallback = false) {
  if (!dataKey) {
    return false;
  }

  const warningState = sharedStepWarnings[resolveStepStateKey(stepKey)];
  if (warningState && dataKey in warningState) {
    return Boolean(warningState[dataKey]);
  }

  return Boolean(fallback);
}

export function setStepWarningVisible(stepKey, dataKey, visible) {
  if (!dataKey) {
    return;
  }

  const resolvedKey = resolveStepStateKey(stepKey);
  if (!sharedStepWarnings[resolvedKey]) {
    sharedStepWarnings[resolvedKey] = reactive({});
  }

  sharedStepWarnings[resolvedKey][dataKey] = Boolean(visible);
}

export function applyStepWarningFix(stepKey, dataKey) {
  const resolvedStepKey = resolveStepStateKey(stepKey);
  const stepData = getSharedStepData(stepKey) || liveSidebarSteps[resolvedStepKey]?.data;
  if (!stepData || dataKey !== "code") {
    return false;
  }

  stepData.code = "SELECT [User], [AuditValue] FROM [SP GetAudit] WHERE [User] IS NOT NULL AND [AuditValue] >= DATEADD(day, -1, GETUTCDATE())";
  setStepWarningVisible(stepKey, dataKey, false);
  return true;
}

export function setLiveSidebarSteps(steps = []) {
  Object.keys(liveSidebarSteps).forEach((id) => {
    delete liveSidebarSteps[id];
  });

  steps.forEach((step) => {
    if (!step?.id) {
      return;
    }

    const resolvedType = step.type || "note";
    const typeMeta = step.typeMeta || getStepTypeMeta(resolvedType);
    const resolvedRows = Array.isArray(step.rows) && step.rows.length
      ? step.rows
      : resolveStepRows(resolvedType);

    liveSidebarSteps[String(step.id)] = {
      ...step,
      stateKey: step.stateKey || String(step.id),
      type: resolvedType,
      typeMeta,
      pill: step.pill || resolveStepPill(resolvedType),
      rows: resolvedRows,
      data: step.data || resolveStepBuilderData(resolvedType),
      comments: Array.isArray(step.comments) ? step.comments : [],
      sources: resolveStepSources(resolvedType, step.sources),
      ivySays: step.ivySays || resolveStepIvySays(resolvedType),
      isStartBlock: Boolean(step.isStartBlock),
      startBlockMode: step.startBlockMode || null,
    };
  });
}

export function getSidebarStep(stepId, options = {}) {
  const selectedId = Number(stepId);
  const liveStep = liveSidebarSteps[String(selectedId)];
  if (liveStep) {
    return {
      id: liveStep.id,
      stateKey: liveStep.stateKey,
      pill: liveStep.pill || liveStep.typeMeta.label,
      typeMeta: liveStep.typeMeta,
      type: liveStep.type,
      title: liveStep.title,
      sources: liveStep.sources,
      rows: liveStep.rows,
      data: liveStep.data,
      comments: liveStep.comments,
      ivySays: liveStep.ivySays,
      isStartBlock: Boolean(liveStep.isStartBlock),
      startBlockMode: liveStep.startBlockMode,
    };
  }

  const stepDefinitions = getResolvedStepDefinitions(options);
  const step = stepDefinitions.find((definition) => definition.id === selectedId) || stepDefinitions[0];

  return {
    id: step.id,
    stateKey: step.stateKey,
    pill: step.pill || step.typeMeta.label,
    typeMeta: step.typeMeta,
    type: step.type,
    title: step.title,
    sources: cloneSources(step.sources),
    rows: cloneRows(step.rows),
    data: getSharedStepData(step.stateKey),
    comments: getSharedStepComments(step.stateKey),
    ivySays: step.ivySays,
    isStartBlock: Boolean(step.isStartBlock),
    startBlockMode: step.startBlockMode,
  };
}

export function createBuilderNodeTemplates(stepCount = MOCK_STEP_COUNT, options = {}) {
  const stepDefinitions = getResolvedStepDefinitions(options);
  const normalizedCount = stepCount == null
    ? stepDefinitions.length
    : Math.max(1, Math.min(stepDefinitions.length, Number(stepCount) || 0));

  return stepDefinitions.slice(0, normalizedCount).map((step) => ({
    id: step.id,
    stateKey: step.stateKey,
    type: step.type,
    typeMeta: step.typeMeta,
    title: step.builderTitle || step.title,
    comments: getSharedStepComments(step.stateKey),
    rows: cloneRows(step.rows),
    data: getSharedStepData(step.stateKey),
    detailsCollapsed: Boolean(step.detailsCollapsed),
    connections: [...(step.connections || [])],
    isStartBlock: Boolean(step.isStartBlock),
    startBlockMode: step.startBlockMode,
    x: step.x,
    y: step.y,
  }));
}
