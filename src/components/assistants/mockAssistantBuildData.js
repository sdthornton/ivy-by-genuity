export const MOCK_FLOW_STEP_DATA_BY_STATE_KEY = {
  "2": {
    source: "SharePoint",
    list: "SP GetAudit",
    code: "Get yesterday's SharePoint audit activity if present.",
  },
  "3": {
    operation: "Delete old audit records",
    target: "SP GetAudit",
    runtime: "SQL",
    code: "DELETE FROM [SP GetAudit] WHERE [Created] < DATEADD(day, -7, GETUTCDATE())",
  },
  "4": {
    action: "Send Daily Audit Summary",
    channel: "Email",
    recipients: "Security Team",
    payload: "Daily audit summary template",
  },
};

export const MOCK_FLOW_STEP_STATE_ORDER = ["2", "3", "4"];
