import { reactive } from "vue";
import iconCalendar from "../../assets/sim-ai/calendar.svg";
import iconLookup from "../../assets/sim-ai/lookup.svg";
import iconCode from "../../assets/sim-ai/code.svg";
import iconTrigger from "../../assets/sim-ai/trigger.svg";
import iconAction from "../../assets/sim-ai/action.svg";
import iconWait from "../../assets/sim-ai/wait.svg";
import iconNote from "../../assets/sim-ai/note.svg";
import iconSplit from "../../assets/sim-ai/split.svg";
import iconParallel from "../../assets/sim-ai/parallel.svg";
import iconLoop from "../../assets/sim-ai/loop.svg";
import iconAlert from "../../assets/sim-ai/alert.svg";
import iconPlay from "../../assets/play.svg";
import sharepointLogo from "../../assets/sharepoint.png";

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
  action: {
    bgClass: "bg-ivy",
    icon: iconAction,
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

const BASE_FLOW_STEPS = [
  {
    id: 2,
    stateKey: "2",
    type: "lookup",
    title: "SP GetAudit Data",
    builderTitle: "Get SP Audit Data",
    pill: "Data Source(s)",
    sources: [{ label: "SharePoint", icon: sharepointLogo }],
    rows: [
      { key: "Source Table/List", dataKey: "list" },
      { key: "Code", dataKey: "code", isCode: true, showWarning: true },
    ],
    comments: [
      { author: "You", body: "Confirm this should run every weekday morning.", stamp: "Feb 26, 9:05 AM" },
    ],
    ivySays: 'This step pulls your SharePoint data for recent users from the "SP GetAudit" list.',
    builderData: {
      source: "SharePoint",
      list: "SP GetAudit",
      code: "Get yesterday's SharePoint audit activity if present.",
    },
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
      { key: "Operation", dataKey: "operation" },
      { key: "Target", dataKey: "target" },
      { key: "Code", dataKey: "code", isCode: true, showWarning: false },
    ],
    comments: [
      { author: "You", body: "Delete anything older than one week.", stamp: "Feb 26, 9:06 AM" },
    ],
    ivySays: "This code step removes SharePoint audit rows older than seven days.",
    builderData: {
      operation: "Delete old audit records",
      target: "SP GetAudit",
      code: "DELETE FROM [SP GetAudit] WHERE [Created] < DATEADD(day, -7, GETUTCDATE())",
    },
    detailsCollapsed: false,
    connections: [4],
    x: 0,
    y: 168,
  },
  {
    id: 4,
    stateKey: "4",
    type: "action",
    title: "Email Audit List",
    pill: "Ivy Action",
    sources: [],
    rows: [
      { key: "Action", dataKey: "action" },
      { key: "Channel", dataKey: "channel" },
      { key: "Recipients", dataKey: "recipients" },
    ],
    comments: [
      { author: "You", body: "Use this as the final delivery step.", stamp: "Feb 26, 9:07 AM" },
    ],
    ivySays: "This action step sends the summarized audit result to your configured recipients.",
    builderData: {
      action: "Send Daily Audit Summary",
      channel: "Email",
      recipients: "Security Team",
    },
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
    pill: "Start",
    comments: [],
    rows: [
      { key: "Entry Point", dataKey: "entryPoint" },
    ],
    ivySays: "This start block keeps the flow ready to run manually until you swap in a schedule or event trigger.",
    builderData: {
      entryPoint: "Manual",
    },
  },
  schedule: {
    stateKey: START_STATE_KEYS.schedule,
    type: "schedule",
    pill: "Schedule",
    comments: [
      { author: "You", body: "Keep this at 9:00 am local time.", stamp: "Feb 26, 8:59 AM" },
    ],
    rows: [
      { key: "Entry Point", dataKey: "entryPoint" },
      { key: "Frequency", dataKey: "frequency" },
      { key: "Time", dataKey: "time" },
      { key: "Timezone", dataKey: "timezone" },
    ],
    ivySays: "This step triggers the assistant based on the current schedule selection.",
    builderData: {
      entryPoint: "Scheduled",
      frequency: "Weekdays",
      time: "09:00 am",
      timezone: "Local",
    },
  },
  trigger: {
    stateKey: START_STATE_KEYS.trigger,
    type: "trigger",
    pill: "Trigger",
    comments: [],
    rows: [
      { key: "Entry Point", dataKey: "entryPoint" },
      { key: "Trigger Type", dataKey: "triggerType" },
      { key: "Event", dataKey: "event" },
    ],
    ivySays: "This step starts the assistant whenever the selected event happens.",
    builderData: {
      entryPoint: "Event",
      triggerType: "Event-based",
      event: "When an event occurs",
    },
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

function createWarningState(rows = []) {
  return rows.reduce((rowAcc, row) => {
    if (row.dataKey) {
      rowAcc[row.dataKey] = Boolean(row.showWarning);
    }
    return rowAcc;
  }, {});
}

const sharedStepData = reactive({
  [START_STATE_KEYS.start]: { ...START_VARIANT_BASE.start.builderData },
  [START_STATE_KEYS.schedule]: { ...START_VARIANT_BASE.schedule.builderData },
  [START_STATE_KEYS.trigger]: { ...START_VARIANT_BASE.trigger.builderData },
  ...BASE_FLOW_STEPS.reduce((acc, step) => {
    acc[step.stateKey] = { ...step.builderData };
    return acc;
  }, {}),
});

const sharedStepComments = reactive({
  [START_STATE_KEYS.start]: cloneComments(START_VARIANT_BASE.start.comments),
  [START_STATE_KEYS.schedule]: cloneComments(START_VARIANT_BASE.schedule.comments),
  [START_STATE_KEYS.trigger]: cloneComments(START_VARIANT_BASE.trigger.comments),
  ...BASE_FLOW_STEPS.reduce((acc, step) => {
    acc[step.stateKey] = cloneComments(step.comments);
    return acc;
  }, {}),
});

const sharedStepWarnings = reactive({
  [START_STATE_KEYS.start]: createWarningState(START_VARIANT_BASE.start.rows),
  [START_STATE_KEYS.schedule]: createWarningState(START_VARIANT_BASE.schedule.rows),
  [START_STATE_KEYS.trigger]: createWarningState(START_VARIANT_BASE.trigger.rows),
  ...BASE_FLOW_STEPS.reduce((acc, step) => {
    acc[step.stateKey] = createWarningState(step.rows);
    return acc;
  }, {}),
});

export const MOCK_STEP_COUNT = BASE_FLOW_STEPS.length + 1;

export function getStepTypeMeta(type) {
  return STEP_TYPE_META[type] || STEP_TYPE_META.note;
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
  const variant = START_VARIANT_BASE[resolvedMode];
  const stateKey = getStartStateKey(resolvedMode);
  const typeMeta = getStepTypeMeta(variant.type);
  const hasFollowingSteps = BASE_FLOW_STEPS.length > 0;

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
    ...BASE_FLOW_STEPS.map((step) => ({
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
  const stepData = getSharedStepData(stepKey);
  if (!stepData || dataKey !== "code") {
    return false;
  }

  stepData.code = "SELECT [User], [AuditValue] FROM [SP GetAudit] WHERE [User] IS NOT NULL AND [AuditValue] >= DATEADD(day, -1, GETUTCDATE())";
  setStepWarningVisible(stepKey, dataKey, false);
  return true;
}

export function getSidebarStep(stepId, options = {}) {
  const selectedId = Number(stepId);
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
