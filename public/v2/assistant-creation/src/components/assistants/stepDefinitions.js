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

export const sourceOptions = [
  "Avanon",
  "Azure",
  "Cisco Meraki",
  "Cisco Umbrella",
  "Dropbox",
  "Entra ID",
  "Google",
  "Kaseya Spanning",
  "Kaseya VSA",
  "KnowBe4",
  "Microsoft 365",
  "OneLogin",
  "SharePoint",
  "Slack",
  "Sophos",
  "IT Meeting Notes", 
];

export const WAIT_MODE_OPTIONS = [
  { key: "duration", label: "Set duration" },
  { key: "specific-time", label: "Specific time" },
];

export const START_BLOCK_MODES = {
  start: "start",
  schedule: "schedule",
  trigger: "trigger",
};

export const START_STATE_KEYS = {
  start: "start",
  schedule: "schedule",
  trigger: "trigger",
};

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
    sources: [],
    rows: [
      { key: "Source", dataKey: "source", placeholder: "Select a source system", hideInStepInfo: true },
      { key: "Source Table/List", dataKey: "list", placeholder: "Enter a table or list name (optional)" },
      { key: "Code", dataKey: "code", isCode: true, showWarning: true, placeholder: "Write a lookup query or filter (optional)" },
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
      { key: "Target", dataKey: "target", placeholder: "Where should this code run?" },
      { key: "Runtime", dataKey: "runtime", placeholder: "SQL, JS, Python, etc. (optional)" },
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
      { key: "Message", dataKey: "action", placeholder: "What message/data would you like to send?" },
      { key: "Destination", dataKey: "channel", placeholder: "Where should this be delivered?" },
      { key: "Recipients or Channel", dataKey: "recipients", placeholder: "Who or what channel should get this?" },
      { key: "Additional Payload", dataKey: "payload", placeholder: "Any additional content that should be sent? (optional)" },
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
      { key: "Collection", dataKey: "collection", placeholder: "Should this note be added to a collection? (optional)" },
      { key: "Visibility", dataKey: "visibility", placeholder: "Who can see this note? (optional)" },
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
    rows: [],
    builderData: {
      innerSteps: [
        { branchId: "parallel-a", type: "", label: "Choose block" },
        { branchId: "parallel-b", type: "", label: "Choose block" },
      ],
      branchConnections: {},
    },
    ivySays: "This step runs selected branches in parallel and merges the results.",
  },
  loop: {
    pill: "Loop",
    rows: [
      { key: "Loop Mode", dataKey: "loopMode", placeholder: "For each, while, or until mode" },
      { key: "Source / Condition", dataKey: "sourceOrCondition", placeholder: "What drives loop repetition?" },
      { key: "Max Iterations", dataKey: "maxIterations", placeholder: "Safety limit for loop runs" },
    ],
    builderData: {
      innerSteps: [
        { branchId: "loop-a", type: "", label: "Choose block" },
        { branchId: "loop-b", type: "", label: "Choose block" },
      ],
      branchConnections: {},
      loopMode: "",
      sourceOrCondition: "",
      maxIterations: "",
    },
    ivySays: "This step repeats actions over a collection or while a condition remains true.",
  },
  alert: {
    pill: "Alert",
    rows: [
      { key: "Additional Conditions", dataKey: "condition", placeholder: "When should this alert fire? (optional)" },
      { key: "Severity", dataKey: "severity", placeholder: "How severe is this alert?" },
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
