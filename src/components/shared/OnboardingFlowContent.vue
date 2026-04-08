<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { hideOnboardingNavigation } from "../../composables/useAppLayoutState";
import typewriter from "../../utils/typewriter";
import { sourceOptions } from "../assistants/stepRuntime";
import { resolveSourceIcon } from "./sourceCatalog";
import ChatBox from "./ChatBox.vue";
import OnboardingStepStatus from "./OnboardingStepStatus.vue";
import IvyTypewriterMessage from "./IvyTypewriterMessage.vue";
import SourcesIcon from "../../assets/nav-connectors.svg";
import LibraryIcon from "../../assets/nav-prompt-library.svg";
import AssistantsIcon from "../../assets/nav-resources.svg";
import IvySphere from "./IvySphere.vue";

const props = defineProps({
  alwaysShowChatBox: {
    type: Boolean,
    default: false,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
  hideNavigationOnMount: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["skip", "source-connected"]);

const router = useRouter();
const fileInputEl = ref(null);
const onboardingChatBox = ref(null);
const suggestedPromptPanelEl = ref(null);
const onboardingStep = ref("source");
const sourceSelectionConfirmed = ref(false);
const sourceDetailsSubmitted = ref(false);
const selectedSource = ref("");
const hasSelectedSourceInChatPill = ref(false);
const onboardingChatThread = ref([]);
const awaitingSuggestedPromptSubmit = ref(false);
const showSuggestedPrompts = ref(false);
const hasShownSuggestedPromptsNudge = ref(false);
const showOnboardingQuickActions = ref(false);
const showIvyThinking = ref(false);
const showPostSubmitIvyMessages = ref(false);
const showPostStep3WrapUpMessage = ref(false);
const showPostStep3WrapUpOptions = ref(false);
const showSourceSelectionUi = ref(false);
const showSourceDetailsSetupUi = ref(false);
const showSourceSelectionCallout = ref(false);
const showStep1CompletedCard = ref(false);
const showStep1DetailsIntro = ref(false);
const sampleResponseCompletionById = ref({});
const suggestedPromptSpacerHeight = ref(0);
const isSourceStepFadingOut = ref(false);
const step1CardShell = ref(null);
const step1PreviousCardHeight = ref(0);
const step1CardTone = ref("in-progress");
const step2CardShell = ref(null);
const step2PreviousCardHeight = ref(0);
const step2CardTone = ref("in-progress");
const uploadedFileName = ref("");
let activePromptTypewriterController = null;
let suggestedPromptResizeObserver = null;
let activeOnboardingThinkingTimer = null;
let activeSourceSelectionRevealTimer = null;
let activeSourceDetailsRevealTimer = null;
let activeSourceStepSwitchTimer = null;
let activeStep1DetailsIntroTimer = null;
let activePostStep3WrapUpTimer = null;
const sourceForm = reactive({
  accountEmail: "",
  apiToken: "",
  importWindow: "Last 30 days",
  notes: "",
  workspaceId: "",
});

const uploadSourceIcon = resolveSourceIcon("IT Meeting Notes");
const FORCE_COMPLETED_ONBOARDING_PREVIEW = true;
const TOTAL_ONBOARDING_STEPS = 3;
const INTERACTIVE_REVEAL_DELAY_MS = 220;
const CARD_SWAP_DURATION_MS = 200;
const POST_STEP3_WRAP_UP_DELAY_MS = 420;
const ONBOARDING_IVY_TYPING_TIMING = {
  startDelay: 80,
  minDelay: 12,
  maxDelay: 20,
  whitespaceMinDelay: 0,
  whitespaceMaxDelay: 4,
};
const ONBOARDING_SAMPLE_RESPONSE_TYPING_TIMING = {
  startDelay: 40,
  minDelay: 5,
  maxDelay: 10,
  whitespaceMinDelay: 0,
  whitespaceMaxDelay: 2,
};
const IVY_PROMPT_NUDGE_MESSAGE = "Good work. See those suggested prompts that just popped up? <strong>Try selecting a prompt</strong> and I'll give you a quick demo of what I can do.";
const IVY_WRAP_UP_MESSAGE = "Amazing work, you finished onboarding! 🎉 You synced your first source and tested a sample workflow with me. There's no more to this initial walkthrough, but <strong>pick your next move below and I’ll be ready to help with anything.</strong>";
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

const chatContainerClass = computed(() => {
  if (props.embedded) {
    return "onboarding-details-chat--embedded";
  }

  if (props.alwaysShowChatBox) {
    return "onboarding-details-chat onboarding-details-chat--container-anchored";
  }

  return "onboarding-details-chat";
});

const detailsStepClass = computed(() => (
  props.embedded ? "onboarding-details-step--embedded" : "onboarding-details-step"
));

const isSourceStepActive = computed(() => onboardingStep.value === "source");
const isDetailsStepActive = computed(() => onboardingStep.value === "details");
const hasSelection = computed(() => Boolean(selectedSource.value || uploadedFileName.value));
const step1Status = computed(() => (
  isSourceStepActive.value && !sourceSelectionConfirmed.value ? "In-Progress" : "Complete"
));
const step2Status = computed(() => (sourceDetailsSubmitted.value ? "Complete" : "In-Progress"));
const shouldShowStep2Status = computed(() => showSourceDetailsSetupUi.value || sourceDetailsSubmitted.value);
const shouldShowStep1Wrapper = computed(() => isSourceStepActive.value || showStep1CompletedCard.value);
const shouldShowStep2Wrapper = computed(() => isDetailsStepActive.value);
const shouldShowStep1InProgressCard = computed(() => isSourceStepActive.value);
const shouldShowStep1CompleteCard = computed(() => isDetailsStepActive.value && showStep1CompletedCard.value);
const shouldShowStep2InProgressCard = computed(() => isDetailsStepActive.value && showSourceDetailsSetupUi.value && !sourceDetailsSubmitted.value);
const shouldShowStep2CompleteCard = computed(() => isDetailsStepActive.value && sourceDetailsSubmitted.value);
const shouldShowStep2CardShell = computed(() => (
  isDetailsStepActive.value
  && (showSourceDetailsSetupUi.value || sourceDetailsSubmitted.value)
));

const completionActionOptions = [
  {
    description: "Connect more sources so I can combine context and give you stronger insights.",
    key: "sources",
    title: "Add Additional Sources",
    bgClass: "bg-chat-highlight",
    icon: SourcesIcon,
    iconBg: "bg-chat-gradient",
  },
  {
    description: "This is where commonly used prompts live, and I’ve already added starter ones for you.",
    key: "prompt-library",
    title: "Check Out the Prompt Library",
    bgClass: "bg-library-highlight",
    icon: LibraryIcon,
    iconBg: "bg-library-gradient",
  },
  {
    description: "Review prebuilt assistants tailored to common workflows based on your synced sources.",
    key: "assistants",
    title: "Review Templated Assistants",
    bgClass: "bg-actions-highlight",
    icon: AssistantsIcon,
    iconBg: "bg-actions-gradient",
  },
];

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

function isSampleResponseComplete(messageId) {
  return Boolean(sampleResponseCompletionById.value[messageId]);
}

function getStep3Status(messageId) {
  return isSampleResponseComplete(messageId) ? "Complete" : "In-Progress";
}

function getCardTone(status) {
  return status === "Complete" ? "complete" : "in-progress";
}

const sourceDetailsIntroMarkup = computed(() => (
  `Nice choice with ${selectedSourceLabel.value}. When you’re ready, <strong>fill in the connection details below</strong> and I’ll get your first sync prepared.`
));

const conversationLogMessages = computed(() => {
  const messages = [];

  if (sourceDetailsSubmitted.value && showPostSubmitIvyMessages.value) {
    messages.push({
      id: "ivy-source-sync",
      format: "html",
      role: "ivy",
      text: buildSourceSyncIvyMessage(selectedSourceLabel.value),
    });
  }

  if (
    sourceDetailsSubmitted.value
    && showPostSubmitIvyMessages.value
    && hasShownSuggestedPromptsNudge.value
  ) {
    messages.push({
      id: "ivy-suggested-prompts",
      format: "html",
      role: "ivy",
      text: IVY_PROMPT_NUDGE_MESSAGE,
    });
  }

  return [...messages, ...onboardingChatThread.value];
});

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

function resetPromptGuidanceState() {
  hasSelectedSourceInChatPill.value = false;
  awaitingSuggestedPromptSubmit.value = false;
  showIvyThinking.value = false;
  showPostStep3WrapUpMessage.value = false;
  showPostStep3WrapUpOptions.value = false;
  showPostSubmitIvyMessages.value = false;
  showSourceSelectionCallout.value = false;
  showSuggestedPrompts.value = false;
  hasShownSuggestedPromptsNudge.value = false;

  if (activePostStep3WrapUpTimer) {
    window.clearTimeout(activePostStep3WrapUpTimer);
    activePostStep3WrapUpTimer = null;
  }
}

function resetConversationState() {
  if (activeOnboardingThinkingTimer) {
    window.clearTimeout(activeOnboardingThinkingTimer);
    activeOnboardingThinkingTimer = null;
  }

  onboardingChatThread.value = [];
  sampleResponseCompletionById.value = {};
  resetPromptGuidanceState();
}

function continueToDashboard() {
  if (!hasSelection.value) {
    return;
  }

  sourceSelectionConfirmed.value = true;
  showStep1CompletedCard.value = false;
  showStep1DetailsIntro.value = false;
  isSourceStepFadingOut.value = true;

  if (activeSourceStepSwitchTimer) {
    window.clearTimeout(activeSourceStepSwitchTimer);
    activeSourceStepSwitchTimer = null;
  }
  if (activeSourceDetailsRevealTimer) {
    window.clearTimeout(activeSourceDetailsRevealTimer);
    activeSourceDetailsRevealTimer = null;
  }

  activeSourceStepSwitchTimer = window.setTimeout(() => {
    onboardingStep.value = "details";
    showSourceDetailsSetupUi.value = false;
    resetConversationState();
    sourceDetailsSubmitted.value = false;
    showOnboardingQuickActions.value = false;
    isSourceStepFadingOut.value = false;
    showStep1CompletedCard.value = true;

    activeSourceStepSwitchTimer = null;
  }, CARD_SWAP_DURATION_MS);
}

function backToSourceSelection() {
  if (activeSourceStepSwitchTimer) {
    window.clearTimeout(activeSourceStepSwitchTimer);
    activeSourceStepSwitchTimer = null;
  }

  onboardingStep.value = "source";
  sourceSelectionConfirmed.value = false;
  showStep1CompletedCard.value = false;
  showStep1DetailsIntro.value = false;
  showSourceDetailsSetupUi.value = false;
  isSourceStepFadingOut.value = false;
  resetPromptGuidanceState();
}

function clearSelectedSource() {
  selectedSource.value = "";
  uploadedFileName.value = "";
  sourceSelectionConfirmed.value = false;
  showStep1CompletedCard.value = false;
  showStep1DetailsIntro.value = false;
  showSourceDetailsSetupUi.value = false;
  isSourceStepFadingOut.value = false;
  resetConversationState();
}

function addAnotherSource() {
  clearSelectedSource();
  sourceDetailsSubmitted.value = false;
  onboardingStep.value = "source";
  if (activeSourceDetailsRevealTimer) {
    window.clearTimeout(activeSourceDetailsRevealTimer);
    activeSourceDetailsRevealTimer = null;
  }
  showSourceDetailsSetupUi.value = false;
  showOnboardingQuickActions.value = false;
}

function submitSourceDetails() {
  resetConversationState();
  sourceDetailsSubmitted.value = true;
  showOnboardingQuickActions.value = true;
  emit("source-connected", selectedSourceLabel.value);
}

function skipToDashboard() {
  if (props.embedded) {
    emit("skip");
    return;
  }

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

  chatInput.value = "";
  chatInput.focus();
  awaitingSuggestedPromptSubmit.value = false;
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

  awaitingSuggestedPromptSubmit.value = true;
}

async function submitOnboardingPrompt(rawPrompt) {
  if (!awaitingSuggestedPromptSubmit.value) {
    return;
  }

  const prompt = String(rawPrompt || "").trim();
  if (!prompt) {
    return;
  }

  const chatInput = onboardingChatBox.value?.chatInput;
  onboardingChatThread.value.push({
    id: `user-${Date.now()}`,
    filterSourceIcon: hasSelectedSourceInChatPill.value ? (selectedSourceIcon.value || "") : "",
    filterSourceLabel: hasSelectedSourceInChatPill.value ? selectedSourceLabel.value : "",
    format: "text",
    role: "user",
    text: prompt,
  });

  if (chatInput) {
    chatInput.value = "";
    chatInput.focus();
  }

  awaitingSuggestedPromptSubmit.value = false;
  hasSelectedSourceInChatPill.value = false;
  showSourceSelectionCallout.value = false;
  showIvyThinking.value = true;
  await new Promise((resolve) => {
    activeOnboardingThinkingTimer = window.setTimeout(resolve, 520);
  });
  activeOnboardingThinkingTimer = null;
  showIvyThinking.value = false;

  const responseMessageId = `ivy-${Date.now()}`;
  sampleResponseCompletionById.value = {
    ...sampleResponseCompletionById.value,
    [responseMessageId]: false,
  };
  onboardingChatThread.value.push({
    id: responseMessageId,
    format: "html",
    intro: buildSuggestedPromptIntro(selectedSourceLabel.value),
    kind: "sample-response",
    role: "ivy",
    sourceLabel: selectedSourceLabel.value,
    text: buildSuggestedPromptResponse(prompt, selectedSourceLabel.value),
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
  if (hasMatchingSource) {
    hasShownSuggestedPromptsNudge.value = true;
  }
}

function handleIntroTypingDone() {
  if (!isSourceStepActive.value) {
    showSourceSelectionUi.value = true;
    return;
  }

  if (activeSourceSelectionRevealTimer) {
    window.clearTimeout(activeSourceSelectionRevealTimer);
  }

  activeSourceSelectionRevealTimer = window.setTimeout(() => {
    showSourceSelectionUi.value = true;
    activeSourceSelectionRevealTimer = null;
  }, INTERACTIVE_REVEAL_DELAY_MS);
}

function handleSourceDetailsIntroTypingDone() {
  if (!isDetailsStepActive.value || sourceDetailsSubmitted.value) {
    return;
  }

  if (activeSourceDetailsRevealTimer) {
    window.clearTimeout(activeSourceDetailsRevealTimer);
  }

  activeSourceDetailsRevealTimer = window.setTimeout(() => {
    showSourceDetailsSetupUi.value = true;
    activeSourceDetailsRevealTimer = null;
  }, INTERACTIVE_REVEAL_DELAY_MS);
}

function handleStep1CompletedCardEntered() {
  if (!isDetailsStepActive.value || sourceDetailsSubmitted.value) {
    return;
  }

  if (activeStep1DetailsIntroTimer) {
    window.clearTimeout(activeStep1DetailsIntroTimer);
  }

  activeStep1DetailsIntroTimer = window.setTimeout(() => {
    showStep1DetailsIntro.value = true;
    activeStep1DetailsIntroTimer = null;
  }, 300);
}

function handleStep2CardEntered() {
  if (!sourceDetailsSubmitted.value) {
    return;
  }

  showSourceSelectionCallout.value = false;
  showPostSubmitIvyMessages.value = true;
}

function captureCardHeight(shellRef, heightRef) {
  const shell = shellRef.value;
  if (!shell) {
    return;
  }

  heightRef.value = shell.offsetHeight;
}

function runCardEnterTransition({ done, el, heightRef, shellRef, targetTone, toneRef }) {
  const shell = shellRef.value;
  if (!shell) {
    done();
    return;
  }

  toneRef.value = targetTone;

  if (!heightRef.value) {
    done();
    return;
  }

  nextTick(() => {
    const fromHeight = heightRef.value || shell.offsetHeight;
    const toHeight = shell.scrollHeight;

    el.style.opacity = "0";

    const fadeInContent = () => {
      el.style.transition = "opacity 0.2s ease-in-out";
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      });
      el.addEventListener("transitionend", () => {
        el.style.opacity = "";
        el.style.transition = "";
        done();
      }, { once: true });
    };

    if (fromHeight === toHeight) {
      fadeInContent();
      return;
    }

    shell.style.height = `${fromHeight}px`;
    shell.offsetHeight;
    shell.style.height = `${toHeight}px`;

    const handleShellTransitionEnd = (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      shell.removeEventListener("transitionend", handleShellTransitionEnd);
      shell.style.height = "";
      fadeInContent();
    };

    shell.addEventListener("transitionend", handleShellTransitionEnd);
  });
}

function handleStep1CardBeforeLeave() {
  captureCardHeight(step1CardShell, step1PreviousCardHeight);
}

function handleStep2CardBeforeLeave() {
  captureCardHeight(step2CardShell, step2PreviousCardHeight);
}

function handleStep1CardEnter(el, done) {
  runCardEnterTransition({
    done,
    el,
    heightRef: step1PreviousCardHeight,
    shellRef: step1CardShell,
    targetTone: getCardTone(step1Status.value),
    toneRef: step1CardTone,
  });
}

function handleStep2CardEnter(el, done) {
  runCardEnterTransition({
    done,
    el,
    heightRef: step2PreviousCardHeight,
    shellRef: step2CardShell,
    targetTone: getCardTone(step2Status.value),
    toneRef: step2CardTone,
  });
}

function handleSampleResponseTypingDone(messageId) {
  sampleResponseCompletionById.value = {
    ...sampleResponseCompletionById.value,
    [messageId]: true,
  };

  if (showPostStep3WrapUpMessage.value || showPostStep3WrapUpOptions.value) {
    return;
  }

  const latestSampleResponse = [...onboardingChatThread.value]
    .reverse()
    .find((message) => message.kind === "sample-response");
  if (!latestSampleResponse || latestSampleResponse.id !== messageId) {
    return;
  }

  if (activePostStep3WrapUpTimer) {
    window.clearTimeout(activePostStep3WrapUpTimer);
  }

  activePostStep3WrapUpTimer = window.setTimeout(() => {
    showPostStep3WrapUpMessage.value = true;
    activePostStep3WrapUpTimer = null;
  }, POST_STEP3_WRAP_UP_DELAY_MS);
}

function handleConversationIvyTypingDone(messageId) {
  if (messageId === "ivy-source-sync") {
    showSourceSelectionCallout.value = true;
  }
}

function handlePostStep3WrapUpTypingDone() {
  showPostStep3WrapUpOptions.value = true;
}

function handlePostStep3ActionSelect(actionKey) {
  if (actionKey === "sources") {
    router.push("/sources");
    return;
  }

  if (actionKey === "prompt-library") {
    router.push("/prompt-library");
    return;
  }

  if (actionKey === "assistants") {
    router.push("/assistants");
  }
}

function disconnectSuggestedPromptObserver() {
  if (!suggestedPromptResizeObserver) {
    return;
  }

  suggestedPromptResizeObserver.disconnect();
  suggestedPromptResizeObserver = null;
}

function syncSuggestedPromptSpacerHeight() {
  const panelEl = suggestedPromptPanelEl.value;
  if (!showSuggestedPrompts.value || !panelEl) {
    suggestedPromptSpacerHeight.value = 0;
    return;
  }

  suggestedPromptSpacerHeight.value = panelEl.offsetHeight;
}

async function connectSuggestedPromptObserver() {
  if (!showSuggestedPrompts.value) {
    disconnectSuggestedPromptObserver();
    suggestedPromptSpacerHeight.value = 0;
    return;
  }

  await nextTick();

  const panelEl = suggestedPromptPanelEl.value;
  if (!panelEl) {
    suggestedPromptSpacerHeight.value = 0;
    return;
  }

  disconnectSuggestedPromptObserver();

  suggestedPromptResizeObserver = new ResizeObserver(() => {
    syncSuggestedPromptSpacerHeight();
  });
  suggestedPromptResizeObserver.observe(panelEl);
  syncSuggestedPromptSpacerHeight();
}

function buildSourceSyncIvyMessage(source) {
  return `Great work setting up your first source! 🎉 While I'm finalizing the ${source} sync, why not explore just some of the ways I can navigate your data. <strong>Try clicking the "sources" pill highlighted below and select your newly-added ${source} app.</strong> ⬇️ ⬇️ ⬇️`;
}

function buildSuggestedPromptIntro(source) {
  return `Great prompt choice. I'll write out a sample response for <strong>${source}</strong> and I'll update this doc it with real data as soon as I can.`;
}

function buildSuggestedPromptResponse(prompt, source) {
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

function applyCompletedOnboardingPreviewState() {
  const previewPrompt = "Show me messages that include urgent security keywords.";
  const previewSampleResponseId = "ivy-preview-sample-response";

  onboardingStep.value = "details";
  selectedSource.value = "Slack";
  uploadedFileName.value = "";
  sourceSelectionConfirmed.value = true;
  sourceDetailsSubmitted.value = true;
  showSourceSelectionUi.value = true;
  showStep1CompletedCard.value = true;
  showStep1DetailsIntro.value = true;
  showSourceDetailsSetupUi.value = true;
  showPostSubmitIvyMessages.value = true;
  hasShownSuggestedPromptsNudge.value = true;
  hasSelectedSourceInChatPill.value = true;
  showSuggestedPrompts.value = true;
  showOnboardingQuickActions.value = true;
  showSourceSelectionCallout.value = false;
  showIvyThinking.value = false;
  awaitingSuggestedPromptSubmit.value = false;
  showPostStep3WrapUpMessage.value = true;
  showPostStep3WrapUpOptions.value = true;
  step1CardTone.value = "complete";
  step2CardTone.value = "complete";

  onboardingChatThread.value = [
    {
      id: "user-preview-prompt",
      filterSourceIcon: resolveSourceIcon("Slack") || "",
      filterSourceLabel: "Slack",
      format: "text",
      role: "user",
      text: previewPrompt,
    },
    {
      id: previewSampleResponseId,
      format: "html",
      intro: buildSuggestedPromptIntro("Slack"),
      kind: "sample-response",
      role: "ivy",
      sourceLabel: "Slack",
      text: buildSuggestedPromptResponse(previewPrompt, "Slack"),
    },
  ];
  sampleResponseCompletionById.value = {
    [previewSampleResponseId]: true,
  };
}

onMounted(() => {
  if (props.hideNavigationOnMount) {
    hideOnboardingNavigation();
  }

  if (FORCE_COMPLETED_ONBOARDING_PREVIEW) {
    applyCompletedOnboardingPreviewState();
    connectSuggestedPromptObserver();
    return;
  }

  showSourceSelectionUi.value = onboardingStep.value !== "source";
  showStep1CompletedCard.value = onboardingStep.value !== "source";
  showStep1DetailsIntro.value = onboardingStep.value !== "source";
  step1CardTone.value = getCardTone(step1Status.value);
  step2CardTone.value = getCardTone(step2Status.value);
  connectSuggestedPromptObserver();
});

onBeforeUnmount(() => {
  activePromptTypewriterController?.abort();
  activePromptTypewriterController = null;
  disconnectSuggestedPromptObserver();
  if (activeOnboardingThinkingTimer) {
    window.clearTimeout(activeOnboardingThinkingTimer);
    activeOnboardingThinkingTimer = null;
  }
  if (activeSourceSelectionRevealTimer) {
    window.clearTimeout(activeSourceSelectionRevealTimer);
    activeSourceSelectionRevealTimer = null;
  }
  if (activeSourceDetailsRevealTimer) {
    window.clearTimeout(activeSourceDetailsRevealTimer);
    activeSourceDetailsRevealTimer = null;
  }
  if (activeSourceStepSwitchTimer) {
    window.clearTimeout(activeSourceStepSwitchTimer);
    activeSourceStepSwitchTimer = null;
  }
  if (activeStep1DetailsIntroTimer) {
    window.clearTimeout(activeStep1DetailsIntroTimer);
    activeStep1DetailsIntroTimer = null;
  }
  if (activePostStep3WrapUpTimer) {
    window.clearTimeout(activePostStep3WrapUpTimer);
    activePostStep3WrapUpTimer = null;
  }
});

watch(showSuggestedPrompts, () => {
  connectSuggestedPromptObserver();
});

watch(suggestedPromptSpacerHeight, (nextHeight, previousHeight) => {
  if (nextHeight > previousHeight && nextHeight > 0) {
    const contentContainer = document.querySelector(".content-container");
    if (contentContainer) {
      contentContainer.scrollTop += nextHeight;
    }
  }
});
</script>

<template>
  <section class="onboarding-page" :class="{ 'onboarding-page--embedded': embedded }">
    <div class="onboarding-content">
      <IvySphere />

      <IvyTypewriterMessage
        class="ivy-chat-width mb-5"
        :markup="INTRO_MARKUP"
        :timing="ONBOARDING_IVY_TYPING_TIMING"
        :instant="FORCE_COMPLETED_ONBOARDING_PREVIEW"
        @done="handleIntroTypingDone"
      />

      <div
        v-if="shouldShowStep1Wrapper"
        class="onboarding-step-wrapper"
        :class="{
          'onboarding-sources': isSourceStepActive,
          'onboarding-sources--visible': isSourceStepActive && showSourceSelectionUi,
          'onboarding-sources--with-chat': isSourceStepActive && alwaysShowChatBox,
          'onboarding-step-state--fading-out': isSourceStepFadingOut && isSourceStepActive,
        }"
      >
        <div
          ref="step1CardShell"
          class="border rounded onboarding-step-card-shell onboarding-interactive-box"
          :class="step1CardTone === 'complete' ? 'bg-white p-3' : 'bg-light py-4 onboarding-inline-interaction'"
        >
          <Transition
            name="onboarding-card-fade"
            mode="out-in"
            @after-enter="handleStep1CompletedCardEntered"
            @before-leave="handleStep1CardBeforeLeave"
            @enter="handleStep1CardEnter"
          >
            <div
              v-if="shouldShowStep1InProgressCard"
              key="step-1-in-progress"
            >
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
                  {{ embedded ? "Close onboarding" : "Skip to dashboard" }}
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

            <div
              v-else-if="shouldShowStep1CompleteCard"
              key="step-1-complete"
            >
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
          </Transition>
        </div>

        <div class="mt-2">
          <OnboardingStepStatus
            transition-key="step-1"
            :status="step1Status"
            :step-number="1"
            :total-steps="TOTAL_ONBOARDING_STEPS"
          />
        </div>
      </div>

      <div v-if="shouldShowStep2Wrapper" :class="detailsStepClass">
        <IvyTypewriterMessage
          v-if="showStep1DetailsIntro"
          class="ivy-chat-width mt-5 mb-4"
          :markup="sourceDetailsIntroMarkup"
          :rerun-key="selectedSourceLabel"
          :timing="ONBOARDING_IVY_TYPING_TIMING"
          :instant="FORCE_COMPLETED_ONBOARDING_PREVIEW"
          @done="handleSourceDetailsIntroTypingDone"
        />

        <div class="onboarding-step-wrapper mb-5">
          <Transition name="onboarding-step-shell-fade">
            <div
              v-if="shouldShowStep2CardShell"
              ref="step2CardShell"
              class="border rounded onboarding-step-card-shell onboarding-interactive-box"
              :class="step2CardTone === 'complete' ? 'bg-white p-3' : 'bg-light py-4 onboarding-inline-interaction'"
            >
              <Transition
                mode="out-in"
                name="onboarding-card-fade"
                @after-enter="handleStep2CardEntered"
                @before-leave="handleStep2CardBeforeLeave"
                @enter="handleStep2CardEnter"
              >
                <div
                  v-if="shouldShowStep2InProgressCard"
                  key="step-2-in-progress"
                >
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
                        {{ embedded ? "Close onboarding" : "Skip to dashboard" }}
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

                <div v-else-if="shouldShowStep2CompleteCard" key="step-2-complete">
                  <div class="d-flex align-items-center gap-3 position-relative">
                    <img
                      v-if="selectedSourceIcon"
                      src="../../assets/syncing.svg"
                      width="40"
                      height="40"
                    >
                    <div class="min-w-0">
                      <div class="fw-semibold text-truncate d-flex align-items-center gap-2">
                        <img :src="selectedSourceIcon" height="16" width="16">
                        {{ selectedSourceLabel }}
                      </div>
                      <div class="smallest text-secondary">Sync status: Syncing</div>
                    </div>
                    <div class="badge text-bg-warning ms-auto fw-medium">Syncing&hellip;</div>
                  </div>
                </div>
              </Transition>
            </div>
          </Transition>

          <div
            v-if="shouldShowStep2Status"
            class="d-flex gap-2 align-items-start mt-2"
          >
            <OnboardingStepStatus
              transition-key="step-2"
              :status="step2Status"
              :step-number="2"
              :total-steps="TOTAL_ONBOARDING_STEPS"
            />
          </div>
        </div>
        <div v-if="conversationLogMessages.length || showIvyThinking" class="my-5">
          <template v-for="message in conversationLogMessages" :key="message.id">
            <article
              v-if="message.role === 'user'"
              class="user-chat-bubble rounded bg-iceberg-blue px-3 py-2 mb-4 position-relative"
            >
              <div
                v-if="message.filterSourceLabel"
                class="d-flex align-items-center mb-0"
              >
                <span class="smallest text-dark opacity-50 me-2">Source:</span>
                <img
                  v-if="message.filterSourceIcon"
                  :src="message.filterSourceIcon"
                  :alt="message.filterSourceLabel"
                  width="14"
                  height="14"
                  class="me-1"
                >
                <span class="smallest text-dark opacity-75">{{ message.filterSourceLabel }}</span>
              </div>
              <p class="mb-0" style="white-space: pre-line;">{{ message.text }}</p>
            </article>
            <div
              v-else-if="message.kind === 'sample-response'"
              class="mb-4 w-100"
            >
              <IvyTypewriterMessage
                class="assistant-chat-message ivy-chat-width"
                :markup="message.intro || ''"
                :rerun-key="`${message.id}-intro`"
                :timing="ONBOARDING_IVY_TYPING_TIMING"
                :instant="FORCE_COMPLETED_ONBOARDING_PREVIEW"
              />
              <hr class="my-4">
              <div class="position-relative onboarding-sample-response-card">
                <div class="onboarding-sample-response-note smallest text-secondary">
                  Sample data. Updates when {{ message.sourceLabel || selectedSourceLabel }} sync completes.
                </div>
                <div 
                  class="chat-document-action"
                  v-tooltip="{ content: 'Download', placement: 'bottom' }"
                >
                  <img src="../../assets/download.svg" height="20" width="20">
                </div>
                <IvyTypewriterMessage
                  class="w-100"
                  as="div"
                  :markup="`<div class='border rounded px-5 py-4 pt-5 mx-0 bg-white onboarding-interactive-box w-100'>${message.text}</div>`"
                  :rerun-key="message.id"
                  :timing="ONBOARDING_SAMPLE_RESPONSE_TYPING_TIMING"
                  :instant="FORCE_COMPLETED_ONBOARDING_PREVIEW"
                  @done="handleSampleResponseTypingDone(message.id)"
                />
              </div>
              <div class="true-small text-secondary mt-2">
                <OnboardingStepStatus
                  :transition-key="message.id"
                  :status="getStep3Status(message.id)"
                  :step-number="3"
                  :total-steps="TOTAL_ONBOARDING_STEPS"
                />
              </div>
            </div>
            <IvyTypewriterMessage
              v-else
              class="assistant-chat-message ivy-chat-width mb-4"
              :markup="message.text"
              :rerun-key="message.id"
              :timing="ONBOARDING_IVY_TYPING_TIMING"
              :instant="FORCE_COMPLETED_ONBOARDING_PREVIEW"
              @done="handleConversationIvyTypingDone(message.id)"
            />
          </template>
          <article v-if="showIvyThinking" class="assistant-chat-message ivy-chat-width mb-4">
            <span class="ivy-thinking-text">Ivy is thinking...</span>
          </article>
        </div>

        <hr class="mt-4 mb-5">

        <IvyTypewriterMessage
          v-if="showPostStep3WrapUpMessage"
          class="assistant-chat-message ivy-chat-width mb-4"
          :markup="IVY_WRAP_UP_MESSAGE"
          rerun-key="ivy-wrap-up"
          :timing="ONBOARDING_IVY_TYPING_TIMING"
          :instant="FORCE_COMPLETED_ONBOARDING_PREVIEW"
          @done="handlePostStep3WrapUpTypingDone"
        />

        <Transition name="onboarding-step-shell-fade">
          <div v-if="showPostStep3WrapUpOptions" class="mb-5">
            <div class="row g-3">
              <div
                v-for="option in completionActionOptions"
                :key="option.key"
                class="col-md-4"
              >
                <button
                  type="button"
                  class="border p-3 rounded w-100 h-100 text-start onboarding-completion-option"
                  :class="[option.bgClass]"
                  v-tooltip="{ content: option.description, placement: 'bottom' }"
                  @click="handlePostStep3ActionSelect(option.key)"
                >
                  <div class="d-flex gap-3 align-items-center">
                    <div 
                      class="p-2 rounded d-flex align-items-center justify-content-center"
                      :class="[option.iconBg]"
                    >
                      <img :src="option.icon" height="20" width="20" class="invert-to-white">
                    </div>
                    <h6 class="reduced mb-0 text-wrap-balance">{{ option.title }}</h6>
                    <img src="../../assets/arrow-right-c-dark.svg" height="14" width="14">
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <input
        ref="fileInputEl"
        type="file"
        class="d-none"
        @change="onFileChange"
      >
      <div class="suggested-prompt-chat-spacer" :style="{ height: `${suggestedPromptSpacerHeight}px` }"></div>

      <div
        v-if="alwaysShowChatBox || onboardingStep !== 'source'"
        class="mt-auto"
        :class="chatContainerClass"
      >
        <div
          v-if="sourceDetailsSubmitted && showSuggestedPrompts"
          ref="suggestedPromptPanelEl"
          class="chat-suggested-prompts p-3 bg-light rounded reduced onboarding-interactive-box"
        >
          <h6 class="border-bottom pb-2 d-flex align-items-center gap-2">
            <img src="../../assets/nav-resources-alt.svg" height="16" width="16">
            Suggested Prompts
          </h6>
          <div
            v-for="prompt in suggestedPrompts"
            :key="prompt"
            class="chat-suggested-prompt d-flex align-items-center gap-2 rounded-sm px-2 py-1"
            @click="applySuggestedPrompt(prompt)"
          >
            <span>{{ prompt }}</span>
            <img src="../../assets/arrow-right-c-dark.svg" class="ms-auto" width="14" height="14">
          </div>
        </div>

        <ChatBox
          ref="onboardingChatBox"
          class="w-100 onboarding-interactive-box"
          :show-quick-actions="alwaysShowChatBox || showOnboardingQuickActions"
          :chat-placeholder="sourceDetailsSubmitted ? 'Ask Ivy anything...' : 'Need a hand? Ask Ivy or paste your details here...'"
          :input-source-icon="hasSelectedSourceInChatPill ? (selectedSourceIcon || '') : ''"
          :input-source-label="hasSelectedSourceInChatPill ? selectedSourceLabel : ''"
          :source-options="onboardingChatSourceOptions"
          :active-sources="onboardingChatActiveSources"
          :highlight-sources-pill="sourceDetailsSubmitted && showSourceSelectionCallout && !hasSelectedSourceInChatPill"
          :sources-callout-text="sourceDetailsSubmitted && showSourceSelectionCallout && !hasSelectedSourceInChatPill ? 'Select your new source first.' : ''"
          :highlight-submit-button="awaitingSuggestedPromptSubmit"
          :submit-callout-text="awaitingSuggestedPromptSubmit ? 'Click send to run this prompt.' : ''"
          @select-source="handleOnboardingChatSourceSelect"
          @submit="submitOnboardingPrompt"
        />
      </div>
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
  padding: 5rem 0;
  position: relative;

  @media only screen and (max-height: 24rem) {
    padding-top: 3rem;
  }
}

.onboarding-page--embedded {
  min-height: calc(100vh - #{$content-inset * 2});
  padding-top: 2.5rem;
}

.onboarding-inline-interaction {
  padding-left: 2.25rem;
  padding-right: 2.25rem;
}

.onboarding-interactive-box {
  animation: onboarding-interactive-fade 0.2s ease-in-out;
}

.onboarding-step-wrapper {
  transition: opacity 0.2s ease-in-out;
}

.onboarding-step-state--fading-out {
  opacity: 0;
  pointer-events: none;
}

.onboarding-step-card-shell {
  overflow: hidden;
  transition: background-color 0.2s ease-in-out, height 0.2s ease-in-out, padding 0.2s ease-in-out;
}

.onboarding-card-fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.onboarding-card-fade-leave-to {
  opacity: 0;
}

.onboarding-step-shell-fade-enter-active {
  transition: opacity 0.2s ease-in-out;
}

.onboarding-step-shell-fade-enter-from {
  opacity: 0;
}

.onboarding-step-shell-fade-enter-to {
  opacity: 1;
}

.onboarding-completion-option {
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 1px var(--bs-primary);
  }
}

.onboarding-sample-response-card {
  position: relative;
}

.onboarding-sample-response-note {
  position: absolute;
  left: 1rem;
  text-align: right;
  top: 0.75rem;
  z-index: 2;
}

.onboarding-sources {
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.75rem);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.onboarding-sources--visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.onboarding-sources--with-chat {
  padding-bottom: 13.5rem;
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

.onboarding-details-step--embedded {
  min-height: auto;
  padding-bottom: 1rem;
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

  &:before {
    background-color: white;
    content: "";
    position: absolute;
    inset: 0 -6rem;
    z-index: -1;
  }
}

.onboarding-details-chat--container-anchored {
  bottom: $content-inset;
  left: calc(#{$left-nav-closed-width} + ((100vw - #{$left-nav-closed-width} - #{$content-inset}) / 2));
  max-width: 48rem;
  position: fixed;
  right: auto;
  transform: translateX(-50%);
  width: min(48rem, calc(100vw - #{$left-nav-closed-width} - #{$content-inset} - 6rem));

  .left-nav-open & {
    left: calc(#{$left-nav-open-width} + ((100vw - #{$left-nav-open-width} - #{$content-inset}) / 2));
    width: min(48rem, calc(100vw - #{$left-nav-open-width} - #{$content-inset} - 6rem));
  }
}

.onboarding-details-chat--embedded {
  background-color: white;
  border-top: 1px solid var(--bs-gray-200);
  margin-top: 1rem;
  padding-top: 1rem;
  position: relative;
  width: 100%;
  z-index: 1;
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

  .onboarding-sources--with-chat {
    padding-bottom: 12.5rem;
  }

  .onboarding-details-chat {
    bottom: 0.75rem;
    width: calc(100vw - 2rem);
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

.suggested-prompt-chat-spacer {
  height: 0;
  transition: height 0.2s ease-in-out;
  width: 100%;
}

@keyframes onboarding-interactive-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
