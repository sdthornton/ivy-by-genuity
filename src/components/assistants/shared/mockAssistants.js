export const DEFAULT_ASSISTANT_CREATOR = "Ivy Template";

export const mockAssistants = [
  {
    id: 1,
    title: "Identity Hygiene Monitor",
    description: "Finds identity risks like missing MFA, inactive users, and risky sign-ins.",
    category: "security",
    trigger: {
      type: "time-based",
      value: "Daily 9:00 AM",
    },
  },
  {
    id: 2,
    title: "Privileged Access Watch",
    description: "Detects new admin role assignments and evaluates risk context.",
    category: "access",
    trigger: {
      type: "event-based",
      value: "When a new admin role is assigned",
    },
  },
  {
    id: 3,
    title: "Endpoint Hygiene Agent",
    description: "Flags unmanaged devices, missing patches, disabled agents, or missing encryption.",
    category: "monitoring",
    trigger: {
      type: "time-based",
      value: "Daily 8:00 AM",
    },
  },
  {
    id: 4,
    title: "High-Risk Device Finder",
    description: "Correlates security signals to identify the riskiest endpoints.",
    category: "threats",
    trigger: {
      type: "manual",
      value: null,
    },
  },
  {
    id: 5,
    title: "Email Threat Exposure Agent",
    description: "Tracks phishing activity and identifies users most exposed to email threats.",
    category: "threats",
    trigger: {
      type: "time-based",
      value: "Daily 10:00 AM",
    },
  },
  {
    id: 6,
    title: "High-Risk User Monitor",
    description: "Ranks users by risk using signals like phishing failures, malware exposure, and weak auth.",
    category: "security",
    trigger: {
      type: "time-based",
      value: "Daily 10:30 AM",
    },
  },
  {
    id: 7,
    title: "Network Exposure Monitor",
    description: "Detects risky network configurations, DNS threats, and unusual access patterns.",
    category: "monitoring",
    trigger: {
      type: "time-based",
      value: "Daily 7:30 AM",
    },
  },
  {
    id: 8,
    title: "Backup & Recovery Readiness",
    description: "Verifies backup coverage and flags failures or protection gaps.",
    category: "backup",
    trigger: {
      type: "time-based",
      value: "Daily 6:00 AM",
    },
  },
  {
    id: 9,
    title: "Weekly Security & IT Risk Brief",
    description: "Summarizes the most important risks and changes across systems.",
    category: "activity",
    trigger: {
      type: "time-based",
      value: "Weekly Monday 8:00 AM",
    },
  },
].map((assistant) => ({
  ...assistant,
  created_by: DEFAULT_ASSISTANT_CREATOR,
  createdBy: DEFAULT_ASSISTANT_CREATOR,
}));

export function getMockAssistantById(assistantId) {
  const normalizedId = String(assistantId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return mockAssistants.find((assistant) => String(assistant.id) === normalizedId) || null;
}
