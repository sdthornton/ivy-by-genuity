export const IVY_WRAP_UP_MESSAGE = "And with that, you’re done with onboarding. Nice work. ✨ <strong>Ivy works best with synced data, and your first source is already on its way.</strong> Your next move is simple: check out what Ivy can do with curated sample data, or jump straight into the rest of the platform.";

export const INTRO_MARKUP = `
  <h1 class="fw-bold mb-1">Welcome, Sarith Rigsby</h1>
  <h2 class="h4 fw-bold mb-4 text-ivy-gradient d-inline-block">
    I'm Ivy, your personal IT partner.
  </h2>
  <p>Think of me as the middleman between your IT system and you - I work hard to transform fragmented data into operational intelligence (freeing you up for higher value work).</p>
  <p>I work best when I have access to your IT info (don't worry, all your data is kept completely safe and never sold). <strong>Let's get started by adding your first data source</strong>.</p>
`;

const DEFAULT_SUGGESTED_PROMPTS = [
  "Summarize the most important events from the last 24 hours.",
  "Highlight potential risks and what I should review first.",
  "Draft a concise daily operations brief from this source.",
];

const UPLOADED_FILE_SUGGESTED_PROMPTS = [
  "Summarize the top insights from my uploaded file.",
  "Highlight risks, anomalies, and anything that needs immediate action.",
  "Draft an executive-ready status summary based on this upload.",
];

const PROMPT_SUGGESTIONS_BY_SOURCE = {
  "avanon": [
    "Show me the top phishing and malware detections from the last 24 hours.",
    "Summarize unusual outbound email behavior by user.",
    "Draft a daily email security brief I can share with leadership.",
  ],
  "azure": [
    "Summarize new high-severity Azure alerts from the last day.",
    "Show me failed sign-in spikes and likely root causes.",
    "Draft a daily cloud security status update for my team.",
  ],
  "cisco meraki": [
    "Show me devices that went offline in the last 24 hours.",
    "Summarize critical Meraki alerts and recommended next actions.",
    "Create a morning network health report for branch locations.",
  ],
  "cisco umbrella": [
    "Show me the top blocked domains and categories from the last day.",
    "Summarize users with unusual DNS activity.",
    "Draft a daily secure web activity summary for my security team.",
  ],
  "dropbox": [
    "Show me newly shared external links from the last 24 hours.",
    "Summarize large file movements and ownership changes.",
    "Draft a collaboration risk summary based on recent Dropbox activity.",
  ],
  "entra id": [
    "Show me high-risk sign-ins from the last 24 hours.",
    "Summarize new privileged role assignments.",
    "Draft a daily identity risk brief with priority follow-ups.",
  ],
  "google": [
    "Summarize recent admin and account security events.",
    "Show me suspicious login patterns by user and location.",
    "Draft a daily Google environment health summary.",
  ],
  "kaseya spanning": [
    "Show me failed backup jobs from the last 24 hours.",
    "Summarize backup coverage gaps across monitored workloads.",
    "Draft a daily backup integrity report with action items.",
  ],
  "kaseya vsa": [
    "Show me endpoints with critical patching issues.",
    "Summarize devices with repeated agent or policy failures.",
    "Draft a daily endpoint operations summary for my team.",
  ],
  "knowbe4": [
    "Summarize phishing campaign results from the most recent run.",
    "Show me users with repeated risky training outcomes.",
    "Draft a weekly security awareness progress recap.",
  ],
  "microsoft 365": [
    "Show me unusual sign-ins and mailbox rule changes from the last 24 hours.",
    "Summarize high-priority M365 security events that need review.",
    "Draft a daily Microsoft 365 security operations brief.",
  ],
  "onelogin": [
    "Show me authentication anomalies from the last 24 hours.",
    "Summarize newly granted high-privilege access.",
    "Draft a daily identity access review summary.",
  ],
  "sharepoint": [
    "Show me SharePoint audit activity from the last 24 hours with key anomalies.",
    "Summarize permission and sharing changes made yesterday.",
    "Draft a daily SharePoint risk and usage summary.",
  ],
  "slack": [
    "Summarize critical incidents mentioned in channels over the last day.",
    "Show me messages that include urgent security keywords.",
    "Draft a daily operations recap from Slack conversations.",
  ],
  "sophos": [
    "Show me high-severity Sophos detections from the last 24 hours.",
    "Summarize endpoints with unresolved threats.",
    "Draft a daily endpoint threat posture brief.",
  ],
};

export function getSuggestedPrompts(selectedSource, uploadedFileName) {
  if (uploadedFileName) {
    return UPLOADED_FILE_SUGGESTED_PROMPTS;
  }

  const sourceKey = String(selectedSource || "").trim().toLowerCase();
  return PROMPT_SUGGESTIONS_BY_SOURCE[sourceKey] || DEFAULT_SUGGESTED_PROMPTS;
}

export function buildSourceSyncIvyMessage(source) {
  return `Great setup. I’m now syncing <strong>${source}</strong> and I’ll keep you posted on status changes as the sync completes.`;
}

export function buildSuggestedPromptIntro(source) {
  return `Great prompt choice. I'll write out a sample response for <strong>${source}</strong> and I'll update this doc it with real data as soon as I can.`;
}

export function buildSuggestedPromptResponse(prompt, source) {
  const lowerPrompt = String(prompt || "").toLowerCase();
  const timestamp = "Mar 31, 2026 • 11:22 AM PT";

  if (lowerPrompt.includes("draft")) {
    return `
      <p><strong>📄 Daily ${source} Ops Brief</strong><br><span class="text-secondary">🕒 Generated: ${timestamp}</span></p>
      <p><strong>1) Executive Summary</strong></p>
      <ul>
        <li>✅ Environment health is stable overall with no confirmed critical incidents.</li>
        <li>⚠️ 3 items need same-day review based on recent activity and risk profile.</li>
        <li>💡 2 workflow improvements were detected that could reduce manual follow-up this week.</li>
      </ul>
      <p><strong>2) Top Findings</strong></p>
      <ul>
        <li>📈 Elevated activity spike in one monitored segment compared to the prior 24 hours.</li>
        <li>🔐 New permission/configuration changes were identified and should be validated.</li>
        <li>🔁 One recurring medium-severity issue appears in multiple records and is trending upward.</li>
      </ul>
      <p><strong>3) Recommended Actions (Priority)</strong></p>
      <ol>
        <li>Validate the high-variance activity source and confirm expected behavior.</li>
        <li>Review recent policy/permission changes and verify approver intent.</li>
        <li>Assign owner for recurring issue and schedule corrective follow-up.</li>
      </ol>
      <p><strong>4) Suggested Owner Routing</strong></p>
      <ul>
        <li>🛡️ Security Operations: variance validation and escalation decision.</li>
        <li>🧰 Systems Admin: configuration and permission verification.</li>
        <li>👤 Team Lead: confirm remediation owner and deadline.</li>
      </ul>
      <p>I can also convert this into <strong>✂️ a shorter leadership summary</strong> or <strong>🧾 a technical handoff version</strong>.</p>
    `;
  }

  if (lowerPrompt.includes("summarize") || lowerPrompt.includes("summary")) {
    return `
      <p><strong>🗓️ Summary Window</strong></p>
      <ul>
        <li>Last 24 hours (rolling)</li>
        <li>Snapshot generated: ${timestamp}</li>
      </ul>
      <p><strong>🔍 What changed</strong></p>
      <ul>
        <li>Activity volume increased moderately vs the previous day.</li>
        <li>Most records are normal, but a small subset is outside baseline patterns.</li>
        <li>Recent changes cluster around access/configuration events.</li>
      </ul>
      <p><strong>🚦 Risk snapshot</strong></p>
      <ul>
        <li><strong>Critical:</strong> 0 confirmed ✅</li>
        <li><strong>High:</strong> 1 needs triage ⚠️</li>
        <li><strong>Medium:</strong> 3 need review 🟡</li>
        <li><strong>Low:</strong> several informational items only ℹ️</li>
      </ul>
      <p><strong>🎯 What to review first</strong></p>
      <ol>
        <li>The high-priority outlier tied to unusual behavior.</li>
        <li>Recent configuration/permission modifications.</li>
        <li>Repeated medium-priority signals appearing across multiple entries.</li>
      </ol>
      <p><strong>🧠 Bottom line:</strong> No broad incident signal right now, but there are enough high/medium indicators to justify focused review today.</p>
    `;
  }

  if (lowerPrompt.includes("show me") || lowerPrompt.includes("highlight")) {
    return `
      <p><strong>🔎 Top Findings</strong></p>
      <ol>
        <li>
          <strong>Highest-impact alert</strong>
          <ul>
            <li><strong>Severity:</strong> High 🔴</li>
            <li><strong>Why it matters:</strong> Pattern is outside expected baseline and affects a high-value workflow.</li>
            <li><strong>Next step:</strong> Validate source context and confirm whether this behavior is expected.</li>
          </ul>
        </li>
        <li>
          <strong>Most active entity in the last 24h</strong>
          <ul>
            <li>Activity is materially above normal trend 📈</li>
            <li>This can be legitimate, but the volume shift warrants a quick verification pass.</li>
          </ul>
        </li>
        <li>
          <strong>Recurring issue cluster</strong>
          <ul>
            <li>Similar medium-priority events are repeating across multiple records 🔁</li>
            <li>This usually indicates a process gap, stale policy, or unresolved upstream condition.</li>
          </ul>
        </li>
      </ol>
      <p><strong>⚙️ Recommended immediate sequence</strong></p>
      <ol>
        <li>First 15 minutes: triage the high-impact signal.</li>
        <li>Next 20 minutes: validate top actor context.</li>
        <li>Final 15 minutes: decide whether to open remediation tasks for the recurring cluster.</li>
      </ol>
      <p>If helpful, I can turn this into an owner-tagged checklist for your team. ✅</p>
    `;
  }

  return `
    <p><strong>📍 Current State</strong></p>
    <ul>
      <li>Environment appears operational with no confirmed outage indicators.</li>
      <li>A few items need review for risk reduction and data hygiene.</li>
    </ul>
    <p><strong>📈 Key Trend</strong></p>
    <ul>
      <li>Signal volume is trending slightly upward in a way that is usually manageable but worth monitoring.</li>
    </ul>
    <p><strong>⚠️ Most Relevant Risk</strong></p>
    <ul>
      <li>One event grouping is repeatedly showing up across records, suggesting an unresolved root cause.</li>
    </ul>
    <p><strong>🛠️ Recommended Next Step</strong></p>
    <ul>
      <li>Run a focused review on the repeated grouping, assign an owner, and confirm expected policy/config state.</li>
    </ul>
    <p>I can continue by generating either <strong>📋 a remediation plan with owners and due dates</strong> or <strong>🧭 a concise leadership update</strong>.</p>
  `;
}
