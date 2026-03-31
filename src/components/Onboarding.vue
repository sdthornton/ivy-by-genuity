<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { hideOnboardingNavigation } from "../composables/useAppLayoutState";
import typewriter from "../utils/typewriter";
import { sourceOptions } from "./assistants/stepRuntime";
import { resolveSourceIcon } from "./shared/sourceCatalog";
import ChatBox from "./shared/ChatBox.vue";

const router = useRouter();
const fileInputEl = ref(null);
const introMessageEl = ref(null);
const onboardingChatBox = ref(null);
const onboardingStep = ref("source");
const sourceSelectionConfirmed = ref(false);
const sourceDetailsSubmitted = ref(false);
const selectedSource = ref("");
const hasSelectedSourceInChatPill = ref(false);
const onboardingChatThread = ref([]);
const showSuggestedPrompts = ref(false);
const showOnboardingQuickActions = ref(false);
const uploadedFileName = ref("");
let activePromptTypewriterController = null;
const sourceForm = reactive({
  accountEmail: "",
  apiToken: "",
  connectionName: "",
  importWindow: "Last 30 days",
  notes: "",
  workspaceId: "",
});

const uploadSourceIcon = resolveSourceIcon("IT Meeting Notes");
const TOTAL_ONBOARDING_STEPS = 3;
const INTRO_MARKUP = `
  <h1 class="fw-bold mb-1">Welcome, Sarith Rigsby</h1>
  <h2 class="h4 fw-bold mb-4 text-ivy-gradient d-inline-block">
    I'm Ivy, your personal IT partner.
  </h2>
  <p>Think of me as the middleman between your IT system and you - I work hard to transform fragmented data into operational intelligence (freeing you up for higher value work).</p>
  <p>I work best when I have access to your IT info (don't worry, all your data is kept completely safe and never sold). <strong>Let's get started by adding your first data source</strong>.</p>
`;

const onboardingSources = computed(() => (
  sourceOptions.filter((source) => source !== "IT Meeting Notes")
));

const onboardingChatSourceOptions = computed(() => {
  if (uploadedFileName.value) {
    return [uploadedFileName.value, ...onboardingSources.value];
  }

  return onboardingSources.value;
});

const onboardingChatActiveSources = computed(() => {
  if (selectedSource.value) {
    return [selectedSource.value];
  }

  if (uploadedFileName.value) {
    return [uploadedFileName.value];
  }

  return [];
});

const hasSelection = computed(() => Boolean(selectedSource.value || uploadedFileName.value));
const step1Status = computed(() => (
  onboardingStep.value !== "source" || sourceSelectionConfirmed.value ? "Complete" : "In-Progress"
));
const step2Status = computed(() => (sourceDetailsSubmitted.value ? "Complete" : "In-Progress"));

const selectedSourceLabel = computed(() => (
  selectedSource.value || uploadedFileName.value || "your source"
));

const selectedSourceIcon = computed(() => {
  if (selectedSource.value) {
    return resolveSourceIcon(selectedSource.value);
  }

  if (uploadedFileName.value) {
    return uploadSourceIcon;
  }

  return null;
});

const step1Label = computed(() => (
  `Step 1 of ${ TOTAL_ONBOARDING_STEPS }: ${ step1Status.value}`
));

const step2Label = computed(() => (
  `Step 2 of ${TOTAL_ONBOARDING_STEPS}: ${step2Status.value}.`
));

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

const suggestedPrompts = computed(() => {
  if (uploadedFileName.value) {
    return [
      "Summarize the top insights from my uploaded file.",
      "Highlight risks, anomalies, and anything that needs immediate action.",
      "Draft an executive-ready status summary based on this upload.",
    ];
  }

  const sourceKey = String(selectedSource.value || "").trim().toLowerCase();
  return PROMPT_SUGGESTIONS_BY_SOURCE[sourceKey] || [
    "Summarize the most important events from the last 24 hours.",
    "Highlight potential risks and what I should review first.",
    "Draft a concise daily operations brief from this source.",
  ];
});

function selectSource(source) {
  selectedSource.value = source;
  uploadedFileName.value = "";
  sourceSelectionConfirmed.value = false;
}

function openFilePicker() {
  fileInputEl.value?.click();
}

function onFileChange(event) {
  const [file] = Array.from(event.target?.files || []);
  if (!file) {
    return;
  }

  uploadedFileName.value = file.name;
  selectedSource.value = "";
  sourceSelectionConfirmed.value = false;
}

function continueToDashboard() {
  if (!hasSelection.value) {
    return;
  }

  sourceSelectionConfirmed.value = true;
  onboardingStep.value = "details";
  onboardingChatThread.value = [];
  sourceDetailsSubmitted.value = false;
  hasSelectedSourceInChatPill.value = false;
  showSuggestedPrompts.value = false;
  showOnboardingQuickActions.value = false;
}

function backToSourceSelection() {
  onboardingStep.value = "source";
  sourceSelectionConfirmed.value = false;
  hasSelectedSourceInChatPill.value = false;
  showSuggestedPrompts.value = false;
}

function clearSelectedSource() {
  selectedSource.value = "";
  uploadedFileName.value = "";
  sourceSelectionConfirmed.value = false;
  onboardingChatThread.value = [];
  hasSelectedSourceInChatPill.value = false;
  showSuggestedPrompts.value = false;
}

function addAnotherSource() {
  clearSelectedSource();
  sourceDetailsSubmitted.value = false;
  onboardingStep.value = "source";
  hasSelectedSourceInChatPill.value = false;
  showSuggestedPrompts.value = false;
  showOnboardingQuickActions.value = false;
}

function submitSourceDetails() {
  onboardingChatThread.value = [];
  sourceDetailsSubmitted.value = true;
  hasSelectedSourceInChatPill.value = false;
  showSuggestedPrompts.value = false;
  showOnboardingQuickActions.value = true;
}

function skipToDashboard() {
  router.push("/");
}

async function applySuggestedPrompt(prompt) {
  const chatInput = onboardingChatBox.value?.chatInput;
  if (!chatInput) {
    return;
  }

  const controller = new AbortController();
  activePromptTypewriterController?.abort();
  activePromptTypewriterController = controller;

  const source = selectedSourceLabel.value;
  const now = Date.now();
  chatInput.value = "";
  chatInput.focus();
  showSuggestedPrompts.value = false;

  try {
    await typewriter(chatInput, prompt, {
      clearElementFirst: true,
      signal: controller.signal,
      timing: {
        startDelay: 0,
        minDelay: 5,
        maxDelay: 11,
        whitespaceMinDelay: 0,
        whitespaceMaxDelay: 2,
      },
    });
  } catch (error) {
    if (error?.name !== "AbortError") {
      throw error;
    }
    return;
  } finally {
    if (activePromptTypewriterController === controller) {
      activePromptTypewriterController = null;
    }
  }

  onboardingChatThread.value.push({
    id: `user-${now}`,
    format: "text",
    role: "user",
    text: prompt,
  });
  onboardingChatThread.value.push({
    id: `ivy-${now}`,
    format: "html",
    role: "ivy",
    text: buildSuggestedPromptResponse(prompt, source),
  });
}

function handleOnboardingChatSourceSelect(source) {
  const selectedSourceName = String(selectedSourceLabel.value || "").trim().toLowerCase();
  const selectedFromPill = String(source || "").trim().toLowerCase();
  const hasMatchingSource = Boolean(
    sourceDetailsSubmitted.value
      && selectedSourceName
      && selectedFromPill
      && selectedSourceName === selectedFromPill
  );
  hasSelectedSourceInChatPill.value = hasMatchingSource;
  showSuggestedPrompts.value = hasMatchingSource;
}

function renderIntroMessage() {
  if (!introMessageEl.value) {
    return;
  }

  introMessageEl.value.innerHTML = INTRO_MARKUP;
}

function buildSuggestedPromptResponse(prompt, source) {
  const lowerPrompt = String(prompt || "").toLowerCase();
  const timestamp = "Mar 31, 2026 • 11:22 AM PT";

  if (lowerPrompt.includes("draft")) {
    return `
      <p>Absolutely. Here’s a full draft you could send right now. ✅</p>
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
      <p>Here’s a full summary from <strong>${source}</strong> based on the latest synced data. 👇</p>
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
      <p>Great prompt. Here are the top findings from <strong>${source}</strong> right now. 👇</p>
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
    <p>I checked <strong>${source}</strong> and put together a full first-pass analysis. ✅</p>
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

onMounted(() => {
  hideOnboardingNavigation();
  renderIntroMessage();
});

onBeforeUnmount(() => {
  activePromptTypewriterController?.abort();
  activePromptTypewriterController = null;
});
</script>

<template>
  <section class="onboarding-page">
    <div class="onboarding-content">
      <div class="ivy-chat-width mb-4">
        <div ref="introMessageEl"></div>
      </div>

      <div
        v-if="onboardingStep === 'source'"
        class="onboarding-sources"
      >
        <div class="py-4 rounded border onboarding-inline-interaction bg-light">
          <label class="mb-2 text-secondary">Choose an initial source to sync:</label>
          <div class="onboarding-source-grid text-center">
            <div
              v-for="source in onboardingSources"
              :key="source"
              class="onboarding-source-button rounded p-2"
              :class="{ 'onboarding-source-button--active': selectedSource === source }"
              @click="selectSource(source)"
            >
              <img
                v-if="resolveSourceIcon(source)"
                :src="resolveSourceIcon(source)"
                :alt="source"
                width="64"
                height="64"
              >
              <div class="smallest text-dark mt-1">{{ source }}</div>
            </div>

            <div
              class="onboarding-source-button rounded p-2"
              :class="{ 'onboarding-source-button--active': uploadedFileName }"
              @click="openFilePicker"
            >
              <img
                v-if="uploadSourceIcon"
                :src="uploadSourceIcon"
                alt="Upload file"
                width="64"
                height="64"
              >
              <div class="smallest text-dark mt-1">Upload</div>
            </div>
          </div>
          <div class="d-flex justify-content-end flex-wrap align-items-center gap-4 mt-4 pt-2.5">
            <button
              type="button"
              class="btn not-as-small text-muted"
              @click="skipToDashboard"
            >
              Skip to dashboard
            </button>
            <button
              type="button"
              class="btn btn-primary rounded-sm px-4"
              @click="continueToDashboard"
            >
              Confirm Selection
            </button>
          </div>
        </div>
        <div class="onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
          <span class="step-progress-indicator">
            <img
              src="../assets/ellipses.svg"
              class="invert-to-white"
              width="11"
              height="11"
            >
          </span>
          <span>{{ step1Label }}</span>
        </div>
      </div>

      <div v-else class="d-flex flex-column onboarding-details-step">
        <div class="border rounded p-3 mx-0 bg-white">
          <div class="d-flex align-items-center gap-3">
            <img
              v-if="selectedSourceIcon"
              :src="selectedSourceIcon"
              width="40"
              height="40"
            >
            <div class="min-w-0">
              <div class="fw-semibold text-truncate">{{ selectedSourceLabel }}</div>
              <div class="smallest text-secondary">Selected for your first sync.</div>
            </div>
            <button type="button" class="btn btn-sm btn-white border ms-auto" @click="backToSourceSelection">
              Change
            </button>
          </div>
        </div>
        <div class="ms-0 onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
          <span class="step-progress-indicator step-progress-indicator--complete">
            <img
              src="../assets/checkmark.svg"
              class="invert-to-white"
              width="11"
              height="11"
            >
          </span>
          <span>{{ step1Label }}</span>
        </div>

        <p class="ivy-chat-width mt-5 mb-4">
          Nice choice with {{ selectedSourceLabel }}. When you’re ready,
          <strong>fill in the connection details below</strong> and I’ll get your first sync prepared.
        </p>

        <div v-if="!sourceDetailsSubmitted" class="mb-5">
          <div class="border rounded py-4 onboarding-inline-interaction bg-light">
            <div class="mb-4 pt-2.5">
              <h4 class="fw-bold mb-1">
                Set up {{ selectedSourceLabel }}
              </h4>
              <label class="mb-2 text-body-secondary">
                Please enter your {{ selectedSourceLabel }} account details.
              </label>
            </div>

            <form class="row gy-3 gx-4" @submit.prevent="submitSourceDetails">
              <div class="col-md-6">
                <label class="form-label" for="accountEmail">Account Email</label>
                <input id="accountEmail" v-model="sourceForm.accountEmail" type="email" class="form-control" placeholder="name@company.com">
              </div>

              <div class="col-md-6">
                <label class="form-label" for="workspaceId">Workspace / Tenant ID</label>
                <input id="workspaceId" v-model="sourceForm.workspaceId" type="text" class="form-control" placeholder="Workspace ID">
              </div>

              <div class="col-md-6">
                <label class="form-label" for="apiToken">API Token</label>
                <input id="apiToken" v-model="sourceForm.apiToken" type="password" class="form-control" placeholder="Paste token">
              </div>

              <div class="col-md-6">
                <label class="form-label d-block w-100" for="importWindow">Initial Import Window</label>
                <select id="importWindow" v-model="sourceForm.importWindow" class="form-select" style="max-width: 16rem;">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Custom range</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label" for="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  v-model="sourceForm.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Any notes for this connection..."
                ></textarea>
              </div>

              <div class="col-12 d-flex gap-2 mt-5">
                <button
                  type="button"
                  class="btn not-as-small text-muted ms-auto"
                  @click="skipToDashboard"
                >
                  Skip to dashboard
                </button>
                <button type="button" class="btn btn-white border" @click="backToSourceSelection">
                  Back
                </button>
                <button type="submit" class="btn btn-primary rounded-sm px-4">
                  Confirm Details
                </button>
              </div>
            </form>
          </div>
          <div class="onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
            <span class="step-progress-indicator">
              <img
                src="../assets/ellipses.svg"
                class="invert-to-white"
                width="11"
                height="11"
              >
            </span>
            <span>{{ step2Label }}</span>
          </div>
        </div>

        <div 
          v-else
          class="d-flex flex-column"
        >
          <div class="border rounded p-3 mx-0 bg-white d-flex align-items-center gap-3 position-relative">
            <div class="active-sync-check">
              <img src="../assets/linked.svg" class="invert-to-white" width="12" height="12">
            </div>
            <img
              v-if="selectedSourceIcon"
              :src="selectedSourceIcon"
              :alt="selectedSourceLabel"
              width="40"
              height="40"
            >
            <div class="min-w-0">
              <div class="fw-semibold text-truncate">{{ selectedSourceLabel }}</div>
              <div class="smallest text-secondary">Sync status: Active</div>
            </div>
            <span class="badge text-bg-success ms-auto">Synced</span>
          </div>
          <div class="d-flex gap-2">
            <div class="ms-0 onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
              <span class="step-progress-indicator step-progress-indicator--complete">
                <img
                  src="../assets/checkmark.svg"
                  class="invert-to-white"
                  width="11"
                  height="11"
                >
              </span>
              <span>{{ step2Label }}</span>
            </div>
            <button type="button" class="btn btn-sm text-dark ms-auto" @click="addAnotherSource">
              + Add another source
            </button>
          </div>
        </div>

        <p v-if="sourceDetailsSubmitted" class="mb-3 mt-5 ivy-chat-width">
          Great work setting up your first source! 🎉 While I'm finalizing the {{ selectedSourceLabel }} sync, 
          why not explore just some of the ways I can navigate your data. <strong>Try clicking the "sources" pill 
          highlighted below and select your newly-added {{ selectedSourceLabel }} app.</strong>
        </p>
        <p v-if="sourceDetailsSubmitted && showSuggestedPrompts" class="mb-3 ivy-chat-width">
          Good work. See those suggested prompts that just popped up? <strong>Try selecting a prompt</strong> and I'll give you a quick demo of what I can do.
        </p>
        <div v-if="onboardingChatThread.length" class="mb-4">
          <article
            v-for="message in onboardingChatThread"
            :key="message.id"
            :class="message.role === 'user'
              ? 'user-chat-bubble rounded bg-iceberg-blue px-3 py-2 mb-4'
              : 'assistant-chat-message ivy-chat-width mb-4'"
          >
            <p v-if="message.format !== 'html'" class="mb-0" style="white-space: pre-line;">{{ message.text }}</p>
            <div v-else v-html="message.text"></div>
          </article>
        </div>

        <div class="onboarding-details-chat mt-auto">
          <div
            v-if="sourceDetailsSubmitted && showSuggestedPrompts"
            class="chat-suggested-prompts p-3 bg-light rounded reduced"
          >
            <h6 class="border-bottom pb-2 d-flex gap-2 align-items-center">
              <img src="../assets/nav-resources-alt.svg" height="16" width="16">
              Suggested Prompts
            </h6>
            <div
              v-for="prompt in suggestedPrompts"
              :key="prompt"
              class="chat-suggested-prompt d-flex gap-2 align-items-center rounded-sm py-1 px-2"
              @click="applySuggestedPrompt(prompt)"
            >
              <span>{{ prompt }}</span>
              <img src="../assets/arrow-right-c-dark.svg" class="ms-auto" width="14" height="14">
            </div>
          </div>


          <ChatBox
            ref="onboardingChatBox"
            class="w-100"
            :show-quick-actions="showOnboardingQuickActions"
            :chat-placeholder="sourceDetailsSubmitted ? 'Ask Ivy anything...' : 'Need a hand? Ask Ivy or paste your details here...'"
            :source-options="onboardingChatSourceOptions"
            :active-sources="onboardingChatActiveSources"
            :highlight-sources-pill="sourceDetailsSubmitted && !hasSelectedSourceInChatPill"
            :sources-callout-text="sourceDetailsSubmitted && !hasSelectedSourceInChatPill ? 'Select your new source first.' : ''"
            :disable-animations="true"
            @select-source="handleOnboardingChatSourceSelect"
          />
        </div>
      </div>

      <input
        ref="fileInputEl"
        type="file"
        class="d-none"
        @change="onFileChange"
      >
    </div>
  </section>
</template>

<style scoped lang="scss">
.onboarding-content {
  margin: 0 auto;
  max-width: 48rem;
  position: relative;
  width: min(100%, 48rem);
  z-index: 1;
}

.ivy-chat-width {
  max-width: 40rem;
}

.onboarding-page {
  display: flex;
  justify-content: center;
  min-height: 100%;
  overflow: hidden;
  padding: 8rem 0 5rem;
  position: relative;

  @media only screen and (max-height: 24rem) {
    padding-top: 3rem;
  }
}

.onboarding-inline-interaction {
  margin-left: -3rem;
  margin-right: -3rem;
  padding-left: 3rem;
  padding-right: 3rem;
}

.onboarding-sources {
  opacity: 1;
  pointer-events: auto;
}

.onboarding-step-note {
  line-height: 1.2;
  margin-left: -3rem;
}

.step-progress-indicator {
  align-items: center;
  background-color: $blue;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  padding: 0.125rem;

  &--complete {
    background-color: hsl(151, 65%, 48%);
  }
}

.onboarding-source-button {
  &:hover {
    background-color: $iceberg-blue;
    border-color: var(--bs-primary);
  }
}

.onboarding-source-button--active {
  background-color: var(--bs-primary-bg-subtle);
  border-color: var(--bs-primary);
  box-shadow: inset 0 0 0 1px var(--bs-primary);
}

.onboarding-source-grid {
  display: grid;
  gap: 0 0.5rem;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  line-height: 1.25;
  margin-left: -0.5rem;
  margin-right: -0.5rem;
}

.onboarding-details-step {
  min-height: calc(100vh - 18rem);
  padding-bottom: 11rem;
  position: relative;
}

.onboarding-details-chat {
  background-color: white;
  border-top-left-radius: 1.8125rem;  // Matches the rendered radius of the chat box.
  border-top-right-radius: 1.8125rem; // Matches the rendered radius of the chat box.
  bottom: $content-inset;
  left: 50%;
  max-width: 48rem;
  padding-bottom: 1.5rem;
  position: fixed;
  transform: translateX(-50%);
  width: min(48rem, calc(100vw - 8rem));
  z-index: 6;
}

.onboarding-suggested-prompts {
  display: grid;
  gap: 0.5rem;
}

.onboarding-suggested-prompts__item {
  font-size: 0.875rem;
  line-height: 1.35;
  padding: 0.625rem 0.75rem;
}

@media (max-width: 992px) {
  .onboarding-source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .onboarding-page {
    padding: 1.5rem 0;
  }

  .onboarding-details-chat {
    bottom: 0.75rem;
    width: calc(100vw - 2rem);
  }

  .onboarding-source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.chat-suggested-prompts {
  bottom: calc(100% + 1.5rem);
  left: 1.5rem;
  position: absolute;
  width: calc(100% - 3rem);

  &:before {
    background: $maastricht-blue;
    border-radius: 1rem;
    box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 1);
    content: "";
    inset: -1.5rem -1.5rem -4rem;
    opacity: 0.25;
    position: absolute;
    z-index: -1;
  }
}

.chat-suggested-prompt {
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: $iceberg-blue;
  }
}
</style>
