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
  // Temporary alias while this mock step still uses the older "action" name.
  action: {
    bgClass: "bg-ivy",
    icon: iconAction,
    iconInvert: true,
    label: "Ivy Action",
  },
};

export function getStepTypeMeta(type) {
  return STEP_TYPE_META[type] || STEP_TYPE_META.note;
}

const stepDefinitions = [
  {
    id: 1,
    type: "schedule",
    title: "Every Morning",
    sources: [],
    rows: [
      { key: "Frequency", value: "Once Daily" },
      { key: "Time", value: "09:00 am" },
      { key: "Timezone", value: "CST" },
    ],
    comments: [
      { author: "Ivy", body: "Schedule is set for weekday mornings.", stamp: "Feb 26, 8:57 AM" },
      { author: "You", body: "Keep this at 9:00 am local time.", stamp: "Feb 26, 8:59 AM" },
    ],
    ivySays: "This step triggers the assistant each weekday morning at 9:00 am.",
    builderData: {
      frequency: "Once Daily",
      time: "09:00 am",
      timezone: "CST",
    },
    detailsCollapsed: false,
    connections: [2],
    x: 0,
    y: 0,
  },
  {
    id: 2,
    type: "lookup",
    title: "SP GetAudit Data",
    builderTitle: "Get SP Audit Data",
    pill: "Data Source(s)",
    sources: [{ label: "SharePoint", icon: sharepointLogo }],
    rows: [
      { key: "Source Table/List", value: "SP GetAudit" },
      { key: "Code", isCode: true, showWarning: true },
    ],
    comments: [
      { author: "Ivy", body: "Using the SP GetAudit list as the source.", stamp: "Feb 26, 9:02 AM" },
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
    y: 60,
  },
  {
    id: 3,
    type: "code",
    title: "Prune Audit Data",
    sources: [],
    rows: [
      { key: "Operation", value: "Delete old audit records" },
      { key: "Target", value: "SP GetAudit" },
      { key: "Code", isCode: true, code: "DELETE FROM [SP GetAudit] WHERE [Created] < DATEADD(day, -7, GETUTCDATE())", showWarning: false },
    ],
    comments: [
      { author: "Ivy", body: "This cleanup keeps the list focused on recent activity.", stamp: "Feb 26, 9:05 AM" },
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
    y: 120,
  },
  {
    id: 4,
    type: "action",
    title: "Email Audit List",
    pill: "Ivy Action",
    sources: [],
    rows: [
      { key: "Action", value: "Send Daily Audit Summary" },
      { key: "Channel", value: "Email" },
      { key: "Recipients", value: "Security Team" },
    ],
    comments: [
      { author: "Ivy", body: "This action will send an email digest.", stamp: "Feb 26, 9:06 AM" },
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
    y: 180,
  },
];

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneComments(comments) {
  return comments.map((comment) => ({ ...comment }));
}

function cloneSources(sources) {
  return sources.map((source) => ({ ...source }));
}

export const MOCK_STEP_COUNT = stepDefinitions.length;

export function createSidebarStepMap() {
  return stepDefinitions.reduce((acc, step) => {
    const typeMeta = getStepTypeMeta(step.type);
    acc[step.id] = {
      pill: step.pill || typeMeta.label,
      typeMeta,
      title: step.title,
      sources: cloneSources(step.sources),
      rows: cloneRows(step.rows),
      comments: cloneComments(step.comments),
      ivySays: step.ivySays,
    };
    return acc;
  }, {});
}

export function createBuilderNodeTemplates(stepCount = stepDefinitions.length) {
  return stepDefinitions.slice(0, stepCount).map((step) => ({
    id: step.id,
    type: step.type,
    typeMeta: getStepTypeMeta(step.type),
    title: step.builderTitle || step.title,
    data: { ...step.builderData },
    detailsCollapsed: step.detailsCollapsed,
    connections: [...step.connections],
    x: step.x,
    y: step.y,
  }));
}
