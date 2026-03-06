import { reactive } from "vue";
import iconCalendar from "../../assets/sim-ai/calendar.svg";
import iconLookup from "../../assets/sim-ai/lookup.svg";
import iconCode from "../../assets/sim-ai/code.svg";
import iconTrigger from "../../assets/sim-ai/trigger.svg";
import iconSendMessage from "../../assets/send-message.svg";
import iconIvyAction from "../../assets/ivy-basic-icon.svg";
import iconWait from "../../assets/sim-ai/wait.svg";
import iconNote from "../../assets/sim-ai/note.svg";
import iconSplit from "../../assets/sim-ai/split.svg";
import iconParallel from "../../assets/sim-ai/parallel.svg";
import iconLoop from "../../assets/sim-ai/loop.svg";
import iconAlert from "../../assets/sim-ai/alert.svg";
import iconPlay from "../../assets/play.svg";
import sharepointLogo from "../../assets/sharepoint.png";
import { MOCK_FLOW_STEP_DATA_BY_STATE_KEY, MOCK_FLOW_STEP_STATE_ORDER } from "./mockAssistantBuildData";

export const sourceOptions = [
  "Entra ID",
  "Cisco Meraki",
  "Kaseya VSA",
  "Sophos XDR",
  "KnowBe4",
  "Avanon",
  "Cisco Umbrella",
  "Kaseya Spanning",
  "Sophos EDR",
  "SharePoint",
  "Microsoft 365",
  "Google Workspace",
  "OneLogin",
];

export const WAIT_MODE_OPTIONS = [
  { key: "duration", label: "Set duration" },
  { key: "specific-time", label: "Specific time" },
];

export const STEP_TYPE_META = {
  start: {
    bgClass: "bg-start",
    icon: iconPlay,
    iconInvert: true,
    label: "Start",
  },
  lookup: {
    bgClass: "bg-lookup",
    icon: iconLookup,
    iconInvert: false,
    label: "Lookup",
  },
  schedule: {
    bgClass: "bg-schedule",
    icon: iconCalendar,
    iconInvert: false,
    label: "Schedule",
  },
  trigger: {
    bgClass: "bg-trigger",
    icon: iconTrigger,
    iconInvert: true,
    label: "Trigger",
  },
  code: {
    bgClass: "bg-code",
    icon: iconCode,
    iconInvert: true,
    label: "Code",
  },
  wait: {
    bgClass: "bg-wait",
    icon: iconWait,
    iconInvert: true,
    label: "Wait",
  },
  note: {
    bgClass: "bg-note",
    icon: iconNote,
    iconInvert: true,
    label: "Note",
  },
  split: {
    bgClass: "bg-split",
    icon: iconSplit,
    iconInvert: true,
    label: "Split",
  },
  parallel: {
    bgClass: "bg-parallel",
    icon: iconParallel,
    iconInvert: true,
    label: "Parallel",
  },
  loop: {
    bgClass: "bg-loop",
    icon: iconLoop,
    iconInvert: true,
    label: "Loop",
  },
  alert: {
    bgClass: "bg-alert",
    icon: iconAlert,
    iconInvert: true,
    label: "Alert",
  },
  message: {
    bgClass: "bg-ivy",
    icon: iconSendMessage,
    iconInvert: true,
    label: "Send Message",
  },
  action: {
    bgClass: "bg-ivy-action",
    icon: iconIvyAction,
    iconInvert: true,
    label: "Ivy Action",
  },
};

const START_BLOCK_MODES = {
  start: "start",
  schedule: "schedule",
  trigger: "trigger",
};

const START_STATE_KEYS = {
  start: "start",
  schedule: "schedule",
  trigger: "trigger",
};

export const STEP_TYPE_DEFINITIONS = {
  start: {
    pill: "Start",
    rows: [
      { key: "Entry Point", dataKey: "entryPoint", placeholder: "Manual, scheduled, or event-based" },
    ],
    builderData: {
      entryPoint: "Manual",
    },
    ivySays: "This start block keeps the flow ready to run manually until you swap in a schedule or event trigger.",
  },
  schedule: {
    pill: "Schedule",
    rows: [
      { key: "Entry Point", dataKey: "entryPoint", placeholder: "How this flow starts" },
      { key: "Frequency", dataKey: "frequency", placeholder: "How often should this run?" },
      { key: "Time", dataKey: "time", placeholder: "When should this run?" },
      { key: "Timezone", dataKey: "timezone", placeholder: "Which timezone applies?" },
    ],
    builderData: {
      entryPoint: "Scheduled",
      frequency: "Weekdays",
      time: "09:00 am",
      timezone: "Local",
    },
    ivySays: "This step triggers the assistant based on the current schedule selection.",
  },
  trigger: {
    pill: "Trigger",
    rows: [
      { key: "Entry Point", dataKey: "entryPoint", placeholder: "How this flow starts" },
      { key: "Trigger Type", dataKey: "triggerType", placeholder: "What kind of trigger?" },
      { key: "Event", dataKey: "event", placeholder: "What event should start this?" },
    ],
    builderData: {
      entryPoint: "Event",
      triggerType: "Event-based",
      event: "When an event occurs",
    },
    ivySays: "This step starts the assistant whenever the selected event happens.",
  },
  lookup: {
    pill: "Data Source(s)",
    sources: [
      { label: "SharePoint", icon: sharepointLogo },
    ],
    rows: [
      { key: "Source", dataKey: "source", placeholder: "Pick a source system" },
      { key: "Source Table/List", dataKey: "list", placeholder: "Enter a table or list name (optional)" },
      { key: "Code", dataKey: "code", isCode: true, showWarning: true, placeholder: "Write a lookup query or filter" },
    ],
    builderData: {
      source: "",
      list: "",
      code: "",
    },
    ivySays: 'This step pulls your SharePoint data for recent users from the "SP GetAudit" list.',
  },
  code: {
    pill: "Code",
    rows: [
      { key: "Operation", dataKey: "operation", placeholder: "Describe the code action" },
      { key: "Target", dataKey: "target", placeholder: "What should this code target?" },
      { key: "Runtime", dataKey: "runtime", placeholder: "SQL, JS, Python, etc." },
      { key: "Code", dataKey: "code", isCode: true, showWarning: false, placeholder: "Write the code to run" },
    ],
    builderData: {
      operation: "",
      target: "",
      runtime: "",
      code: "",
    },
    ivySays: "This code step runs custom logic against your selected target.",
  },
  message: {
    pill: "Send Message",
    rows: [
      { key: "Action", dataKey: "action", placeholder: "What message action should happen?" },
      { key: "Destination", dataKey: "channel", placeholder: "Where should this be delivered?" },
      { key: "Recipients/Channel", dataKey: "recipients", placeholder: "Who or what channel should get this?" },
      { key: "Payload", dataKey: "payload", placeholder: "What content should be sent?" },
    ],
    builderData: {
      action: "",
      channel: "",
      recipients: "",
      payload: "",
    },
    ivySays: "This message step delivers the flow output to the selected destination and audience.",
  },
  action: {
    pill: "Ivy Action",
    rows: [
      { key: "Action", dataKey: "action", placeholder: "What should Ivy do?" },
    ],
    builderData: {
      action: "",
    },
    ivySays: "This step lets Ivy perform a general action from natural language instructions.",
  },
  wait: {
    pill: "Wait",
    rows: [
      { key: "Duration", dataKey: "duration", placeholder: "How long should it pause?", waitModes: ["duration"] },
      { key: "At what time", dataKey: "atTime", placeholder: "What time should this resume?", waitModes: ["specific-time"] },
    ],
    builderData: {
      waitMode: "duration",
      duration: "",
      atTime: "",
    },
    ivySays: "This step pauses the flow for a duration or until a specific time.",
  },
  note: {
    pill: "Note",
    rows: [
      { key: "Note", dataKey: "note", placeholder: "Let Ivy know what note to create from this flow's data." },
      { key: "Collection", dataKey: "collection", placeholder: "Should this note be added to a collection?" },
      { key: "Visibility", dataKey: "visibility", placeholder: "Who can see this note?" },
    ],
    builderData: {
      note: "",
      collection: "",
      visibility: "",
    },
    ivySays: "This step lets Ivy create a new chat/note from natural language instructions and place it in the selected collection.",
  },
  split: {
    pill: "Split",
    rows: [],
    builderData: {
      ifCondition: "",
      elseIfConditions: [],
      elseCondition: "",
      branchConnections: {},
    },
    ivySays: "This step routes execution by evaluating if/else-if/else conditions.",
  },
  parallel: {
    pill: "Parallel",
    rows: [
      { key: "Branches", dataKey: "branches", placeholder: "How many branches should run?" },
      { key: "Merge Policy", dataKey: "mergePolicy", placeholder: "How should branches rejoin?" },
      { key: "Timeout", dataKey: "timeout", placeholder: "Maximum parallel run time" },
    ],
    builderData: {
      branches: "",
      mergePolicy: "",
      timeout: "",
    },
    ivySays: "This step runs multiple branches at the same time and merges them.",
  },
  loop: {
    pill: "Loop",
    rows: [
      { key: "Loop Mode", dataKey: "loopMode", placeholder: "For each, while, or until mode" },
      { key: "Source / Condition", dataKey: "sourceOrCondition", placeholder: "What drives loop repetition?" },
      { key: "Max Iterations", dataKey: "maxIterations", placeholder: "Safety limit for loop runs" },
    ],
    builderData: {
      loopMode: "",
      sourceOrCondition: "",
      maxIterations: "",
    },
    ivySays: "This step repeats actions over a collection or while a condition remains true.",
  },
  alert: {
    pill: "Alert",
    rows: [
      { key: "Severity", dataKey: "severity", placeholder: "How severe is this alert?" },
      { key: "Condition", dataKey: "condition", placeholder: "When should this alert fire?" },
      { key: "Channels", dataKey: "channels", placeholder: "Where should alerts be sent?" },
      { key: "Recipients", dataKey: "recipients", placeholder: "Who should be notified?" },
    ],
    builderData: {
      severity: "",
      condition: "",
      channels: "",
      recipients: "",
    },
    ivySays: "This step raises notifications when defined conditions are met.",
  },
};

const BASE_FLOW_STEPS = [
  {
    id: 2,
    stateKey: "2",
    type: "lookup",
    title: "SP GetAudit Data",
    builderTitle: "Get SP Audit Data",
    sources: [{ label: "SharePoint", icon: sharepointLogo }],
    rows: [
      { key: "Source Table/List", dataKey: "list", placeholder: "Enter a table or list name (optional)" },
      { key: "Code", dataKey: "code", isCode: true, showWarning: true, placeholder: "Write a lookup query or filter" },
    ],
    comments: [
      { author: "You", body: "Confirm this should run every weekday morning.", stamp: "Feb 26, 9:05 AM" },
    ],
    detailsCollapsed: false,
    connections: [3],
    x: 0,
    y: 84,
  },
  {
    id: 3,
    stateKey: "3",
    type: "code",
    title: "Prune Audit Data",
    sources: [],
    rows: [
      { key: "Operation", dataKey: "operation", placeholder: "Describe the code action" },
      { key: "Target", dataKey: "target", placeholder: "What should this code target?" },
      { key: "Code", dataKey: "code", isCode: true, showWarning: false, placeholder: "Write the code to run" },
    ],
    comments: [
      { author: "You", body: "Delete anything older than one week.", stamp: "Feb 26, 9:06 AM" },
    ],
    ivySays: "This code step removes SharePoint audit rows older than seven days.",
    detailsCollapsed: false,
    connections: [4],
    x: 0,
    y: 168,
  },
  {
    id: 4,
    stateKey: "4",
    type: "message",
    title: "Email Audit List",
    sources: [],
    rows: [
      { key: "Action", dataKey: "action", placeholder: "What message action should happen?" },
      { key: "Destination", dataKey: "channel", placeholder: "Where should this be delivered?" },
      { key: "Recipients/Channel", dataKey: "recipients", placeholder: "Who or what channel should get this?" },
    ],
    comments: [
      { author: "You", body: "Use this as the final delivery step.", stamp: "Feb 26, 9:07 AM" },
    ],
    ivySays: "This message step sends the summarized audit result to your configured recipients.",
    detailsCollapsed: false,
    connections: [],
    x: 0,
    y: 252,
  },
];

const START_VARIANT_BASE = {
  start: {
    stateKey: START_STATE_KEYS.start,
    type: "start",
    comments: [],
  },
  schedule: {
    stateKey: START_STATE_KEYS.schedule,
    type: "schedule",
    comments: [
      { author: "You", body: "Keep this at 9:00 am local time.", stamp: "Feb 26, 8:59 AM" },
    ],
  },
  trigger: {
    stateKey: START_STATE_KEYS.trigger,
    type: "trigger",
    comments: [],
  },
};

function cloneRows(rows = []) {
  return rows.map((row) => ({ ...row }));
}

function cloneComments(comments = []) {
  return comments.map((comment) => ({ ...comment }));
}

function cloneSources(sources = []) {
  return sources.map((source) => ({ ...source }));
}

function cloneDataValue(value) {
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

function createWarningState(rows = []) {
  return rows.reduce((rowAcc, row) => {
    if (row.dataKey) {
      rowAcc[row.dataKey] = Boolean(row.showWarning);
    }
    return rowAcc;
  }, {});
}

function getResolvedTypeDefinition(type) {
  return STEP_TYPE_DEFINITIONS[type] || STEP_TYPE_DEFINITIONS.note;
}

function normalizeWaitMode(mode) {
  return mode === "specific-time" ? "specific-time" : "duration";
}

function resolveStepPill(type, pill) {
  return pill || getResolvedTypeDefinition(type).pill || getStepTypeMeta(type).label;
}

function resolveStepRows(type, rows) {
  return cloneRows(rows || getResolvedTypeDefinition(type).rows || []);
}

function resolveStepSources(type, sources) {
  return cloneSources(sources || getResolvedTypeDefinition(type).sources || []);
}

function resolveStepBuilderData(type, builderData) {
  const resolved = cloneDataValue(getResolvedTypeDefinition(type).builderData || {});
  Object.entries(builderData || {}).forEach(([key, value]) => {
    resolved[key] = cloneDataValue(value);
  });
  return resolved;
}

function resolveStepIvySays(type, ivySays) {
  return ivySays || getResolvedTypeDefinition(type).ivySays || "";
}

function resolveStepDefinition(step) {
  return {
    ...step,
    pill: resolveStepPill(step.type, step.pill),
    rows: resolveStepRows(step.type, step.rows),
    builderData: resolveStepBuilderData(step.type, step.builderData),
    ivySays: resolveStepIvySays(step.type, step.ivySays),
    comments: cloneComments(step.comments),
    sources: resolveStepSources(step.type, step.sources),
  };
}

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

export function getStepTypeMeta(type) {
  return STEP_TYPE_META[type] || STEP_TYPE_META.note;
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
    stepData.ifCondition = toNormalizedSplitConditionText(stepData.ifCondition);
  }

  stepData.elseIfConditions = toNormalizedElseIfConditions(stepData.elseIfConditions);

  if (!("elseCondition" in stepData)) {
    stepData.elseCondition = "";
  } else {
    stepData.elseCondition = toNormalizedSplitConditionText(stepData.elseCondition);
  }

  if (!stepData.branchConnections || typeof stepData.branchConnections !== "object") {
    stepData.branchConnections = {};
  }

  return stepData;
}

export function addSplitElseIfCondition(stepData = null) {
  const normalized = ensureSplitStepData(stepData);
  normalized.elseIfConditions.push("");
  return normalized.elseIfConditions.length - 1;
}

export function getSplitBranchConnectorKind(branchId) {
  return `branch:${String(branchId)}`;
}

export function getSplitBranchConnections(stepData = null) {
  return ensureSplitStepData(stepData).branchConnections;
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
