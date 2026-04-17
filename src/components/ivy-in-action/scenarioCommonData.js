import EntraIcon from "../../assets/integrations/entra-id.png";
import M365Icon from "../../assets/integrations/microsoft-365.png";
import SophosIcon from "../../assets/integrations/sophos.png";
import MerakiIcon from "../../assets/integrations/cisco-meraki.png";

const sourceChips = [
  { icon: EntraIcon, label: "Entra ID" },
  { icon: M365Icon, label: "Microsoft 365" },
  { icon: SophosIcon, label: "Sophos" },
  { icon: MerakiIcon, label: "Meraki" },
];

const riskScoreCard = {
  score: 88,
  series: [54, 57, 60, 63, 67, 72, 79, 88],
  subtitle: "Identity exposure has the strongest upward trend in this scan.",
  title: "Identity Risk Score",
  trendDelta: 18,
  trendLabel: "from the last 24 hours",
};

const adminRiskRows = [
  { account: "John Sullivan", role: "Global Admin", mfa: "Disabled" },
  { account: "svc-azure-sync@acme.com", role: "Privileged Service", mfa: "Disabled" },
  { account: "Emily Carter", role: "User Admin", mfa: "Disabled" },
  { account: "Raj Patel", role: "Security Admin", mfa: "Disabled" },
  { account: "+4 more", role: "Privileged Accounts", mfa: "Disabled" },
];

const adminRiskRowsMore = [
  { account: "Dana Morales", role: "Billing Admin", mfa: "Disabled" },
  { account: "Victor Chen", role: "Exchange Admin", mfa: "Disabled" },
  { account: "Olivia Brooks", role: "Compliance Admin", mfa: "Disabled" },
  { account: "svc-legacy-auth@acme.com", role: "Privileged Service", mfa: "Disabled" },
];

const forwardingRiskRows = [
  { mailbox: "finance.ap@acme.com", destination: "gmail.com", status: "Forwarding enabled" },
  { mailbox: "hr@acme.com", destination: "yahoo.com", status: "Forwarding enabled" },
  { mailbox: "ceo.office@acme.com", destination: "outlook.com", status: "Forwarding enabled" },
];

const endpointRiskRows = [
  { device: "LAPTOP-ACME-332", alert: "Credential-stealing trojan", state: "Active" },
  { device: "HR-LAPTOP-22", alert: "Persistence behavior", state: "Active" },
];

const correlationRows = [
  {
    signal: "Daniel Jenkins (Sales)",
    relationship: "Failed phishing simulation -> tied to LAPTOP-ACME-332",
  },
  {
    signal: "Priya Shah (Finance)",
    relationship: "Targeted by phishing -> mailbox not backed up",
  },
];

const correlationGraph = {
  nodes: [
    { id: "identity", label: "Identity", shortLabel: "ID", type: "identity", x: 76, y: 42 },
    { id: "email", label: "Email", shortLabel: "Mail", type: "email", x: 220, y: 42 },
    { id: "endpoint", label: "Endpoint", shortLabel: "EDR", type: "endpoint", x: 364, y: 42 },
    { id: "user", label: "Risky User", shortLabel: "User", type: "user", x: 220, y: 126 },
  ],
  edges: [
    { from: "identity", to: "user", label: "session tie" },
    { from: "email", to: "user", label: "phish tie" },
    { from: "endpoint", to: "user", label: "device tie" },
  ],
};

const attackTimelineEvents = [
  {
    detail: "A high-volume external message bypassed baseline filtering.",
    severity: "Medium",
    time: "09:04",
    title: "Suspicious email delivered",
  },
  {
    detail: "User clicked a credential-harvest link from the same thread.",
    severity: "High",
    time: "09:11",
    title: "Credential phish clicked",
  },
  {
    detail: "Anomalous sign-in matched impossible-travel behavior.",
    severity: "Critical",
    time: "09:14",
    title: "Impossible travel sign-in",
  },
  {
    detail: "Endpoint alert tied to the same user/session timeline.",
    severity: "Critical",
    time: "09:17",
    title: "Endpoint compromise signal",
  },
];

const impactRows = [
  { asset: "Priya Shah mailbox", exposure: "No backup / retention policy" },
  { asset: "Rachel Kim mailbox", exposure: "No backup / retention policy" },
  { asset: "Finance Shared (SharePoint)", exposure: "No backup / retention policy" },
];

const assistantAccountTargets = [
  { account: "John Sullivan", reason: "Global Admin without MFA" },
  { account: "Emily Carter", reason: "User Admin without MFA" },
  { account: "Raj Patel", reason: "Security Admin without MFA" },
  { account: "svc-azure-sync", reason: "Privileged service account without MFA" },
  { account: "+4 more", reason: "Privileged accounts without MFA" },
];

const assistantAccountTargetsMore = [
  { account: "Dana Morales", reason: "Billing Admin without MFA" },
  { account: "Victor Chen", reason: "Exchange Admin without MFA" },
  { account: "Olivia Brooks", reason: "Compliance Admin without MFA" },
  { account: "svc-legacy-auth", reason: "Legacy privileged service account without MFA" },
];

const actionPlanRows = [
  { details: "Enable MFA for 7 admin accounts", label: "Enable MFA", selected: true },
  { details: "Disable legacy-admin@acme.com", label: "Disable stale account", selected: true },
  { details: "Apply conditional access baseline policy", label: "Apply policy", selected: true },
];

const executionLines = [
  "Enforcing MFA for selected admin accounts...",
  "Disabling legacy-admin@acme.com...",
  "Applying conditional access policy...",
];

const riskDeltaSummary = {
  afterScore: 34,
  beforeScore: 88,
  policiesApplied: 1,
  protectedAccounts: 7,
};

const sharedMessages = {
  analysis: "Looking across your environment...",
  assistantComplete: "<strong>Done.</strong> Those admin accounts are now protected with MFA and baseline policies.",
  demoOutro: "If this were live data, this is where I&apos;d ask if you want me to take any further action, like locking risky accounts, isolating flagged devices, or kicking off guided remediation. <strong>For now, this is where the demo ends.</strong> <br><br>Hopefully you got a good feel for how I can help! The next steps are totally up to you. Try another prompt or just start exploring!",
  assistantIntro: "I&apos;ll start by <strong>securing these privileged accounts.</strong>",
  assistantPlan: "<strong>Here&apos;s the plan.</strong> Uncheck anything you don&apos;t want to run.",
  assistantRun: "<strong>Applying changes now...</strong>",
  correlation: "<strong>These events are related</strong> across identity, endpoint, and email behavior.",
  emailFinding: "I also found <strong>external forwarding rules</strong> that should be reviewed.",
  endpointFinding: "Endpoint telemetry confirms <strong>active compromise on two devices.</strong>",
  firstPass: "First pass: <strong>identity access is the highest risk right now.</strong>",
  initial: "Great prompt. I&apos;ll run a quick <strong>cross-source scan using sample data.</strong>",
  remediationQuestion: "I can draft a remediation plan from this. Want me to prepare it?",
  messagingQuestion: "Want me to check messaging anomalies next?",
  endpointsQuestion: "Should I add endpoint context too?",
  correlateQuestion: "Want me to correlate these signals and estimate impact?",
  actionPlanQuestion: "Ready for the action plan?",
  reasoningTrail: "Sign-in anomalies, phishing indicators, and malware detections occurred in the same user/session windows.",
};

const sharedUserActions = {
  correlate: "Yes, correlate risks",
  email: "Yes, show messaging risks",
  endpoints: "Yes, check endpoints",
  remediation: "Yes, build remediation plan",
};

const sharedToggleText = {
  hideReasoning: "Hide why this is related",
  showReasoning: "Show why this is related",
};

const sharedData = {
  actionPlanRows,
  attackTimelineEvents,
  adminRiskRows,
  adminRiskRowsMore,
  assistantAccountTargets,
  assistantAccountTargetsMore,
  correlationGraph,
  correlationRows,
  endpointRiskRows,
  executionLines,
  forwardingRiskRows,
  impactRows,
  riskDeltaSummary,
  riskScoreCard,
  sourceChips,
};

export function createIvyInActionScenario({ key, path, query, messages = {} }) {
  return {
    key,
    path,
    query,
    data: sharedData,
    messages: {
      ...sharedMessages,
      ...messages,
    },
    userActions: sharedUserActions,
    toggleText: sharedToggleText,
  };
}
