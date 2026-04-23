<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { sourceOptions } from "../assistants/stepRuntime";
import { useOnboardingSyncToast } from "../../composables/onboardingSyncToast";
import { resolveSourceIcon } from "./sourceCatalog";
import ChatBox from "./ChatBox.vue";
import OnboardingStepStatus from "./OnboardingStepStatus.vue";
import IvyTypewriterMessage from "./IvyTypewriterMessage.vue";
import SourcesIcon from "../../assets/nav-connectors.svg";
import LibraryIcon from "../../assets/nav-prompt-library.svg";
import AssistantsIcon from "../../assets/nav-resources.svg";
import SampleIcon from "../../assets/nav-resources-alt.svg";
import {
  buildSourceSyncIvyMessage,
  INTRO_MARKUP,
  IVY_WRAP_UP_MESSAGE,
} from "./onboardingFlowContentData";

const router = useRouter();
const { showToastNow, startSync } = useOnboardingSyncToast();

const fileInputEl = ref(null);
const onboardingStep = ref("source");
const sourceSelectionConfirmed = ref(false);
const sourceDetailsSubmitted = ref(false);
const showAllOnboardingSources = ref(false);
const selectedSource = ref("");
const selectedChatSource = ref("");
const showPostSubmitIvyMessage = ref(false);
const showSourceDetailsSetupUi = ref(false);
const showSourceSelectionUi = ref(false);
const showStep1CompletedCard = ref(false);
const showStep1DetailsIntro = ref(false);
const showStep3WrapUpMessage = ref(false);
const showStep3WrapUpOptions = ref(false);
const isSourceStepFadingOut = ref(false);
const step1CardShell = ref(null);
const step1CardTone = ref("in-progress");
const step1PreviousCardHeight = ref(0);
const step2CardShell = ref(null);
const step2CardTone = ref("in-progress");
const step2PreviousCardHeight = ref(0);
const uploadedFileName = ref("");
const flowTimers = {
  sourceDetailsReveal: null,
  sourceSelectionReveal: null,
  sourceStepSwitch: null,
  step1DetailsIntro: null,
  step3WrapUpReveal: null,
};

const sourceForm = reactive({
  accountEmail: "",
  apiToken: "",
  importWindow: "Last 30 days",
  notes: "",
  workspaceId: "",
});

const uploadSourceIcon = resolveSourceIcon("IT Meeting Notes");
const TOTAL_ONBOARDING_STEPS = 3;
const INTERACTIVE_REVEAL_DELAY_MS = 220;
const CARD_SWAP_DURATION_MS = 200;
const SOURCE_SYNC_TO_WRAP_UP_DELAY_MS = 320;
const ONBOARDING_IVY_TYPING_TIMING = {
  startDelay: 80,
  minDelay: 12,
  maxDelay: 20,
  whitespaceMinDelay: 0,
  whitespaceMaxDelay: 4,
};
const IDENTITY_FIRST_SOURCE_OPTIONS = ["EntraID", "Google", "Okta", "OneLogin"];
const SOURCE_ALIAS_MAP = {
  "Entra ID": "EntraID",
  "Google": "Google",
};

const onboardingSources = computed(() => (
  Array.from(
    new Set([
      ...sourceOptions
        .filter((source) => source !== "IT Meeting Notes")
        .map((source) => SOURCE_ALIAS_MAP[source] || source),
      "Okta",
    ]),
  )
));

const orderedOnboardingSources = computed(() => {
  const prioritizedSources = IDENTITY_FIRST_SOURCE_OPTIONS.filter((source) => (
    onboardingSources.value.includes(source)
  ));
  const remainingSources = onboardingSources.value.filter((source) => (
    !prioritizedSources.includes(source)
  ));
  return [...prioritizedSources, ...remainingSources];
});

const visibleOnboardingSources = computed(() => (
  showAllOnboardingSources.value
    ? orderedOnboardingSources.value
    : IDENTITY_FIRST_SOURCE_OPTIONS
));

const hasAdditionalOnboardingSources = computed(() => (
  orderedOnboardingSources.value.length > IDENTITY_FIRST_SOURCE_OPTIONS.length
));

const onboardingChatSourceOptions = computed(() => {
  if (uploadedFileName.value) {
    return [uploadedFileName.value, ...onboardingSources.value];
  }

  return onboardingSources.value;
});

const onboardingChatActiveSources = computed(() => {
  if (!selectedChatSource.value) {
    return [];
  }

  return [selectedChatSource.value];
});

const isSourceStepActive = computed(() => onboardingStep.value === "source");
const isDetailsStepActive = computed(() => onboardingStep.value === "details");
const hasSelection = computed(() => Boolean(selectedSource.value || uploadedFileName.value));
const step1Status = computed(() => (
  isSourceStepActive.value && !sourceSelectionConfirmed.value ? "In-Progress" : "Complete"
));
const step2Status = computed(() => (sourceDetailsSubmitted.value ? "Complete" : "In-Progress"));
const step3Status = computed(() => (showStep3WrapUpOptions.value ? "Complete" : "In-Progress"));
const shouldShowStep2Status = computed(() => showSourceDetailsSetupUi.value || sourceDetailsSubmitted.value);
const shouldShowStep3Status = computed(() => (
  sourceDetailsSubmitted.value && (showStep3WrapUpMessage.value || showStep3WrapUpOptions.value)
));
const shouldShowStep1Wrapper = computed(() => isSourceStepActive.value || showStep1CompletedCard.value);
const shouldShowStep1InProgressCard = computed(() => isSourceStepActive.value);
const shouldShowStep1CompleteCard = computed(() => isDetailsStepActive.value && showStep1CompletedCard.value);
const shouldShowStep2InProgressCard = computed(() => isDetailsStepActive.value && showSourceDetailsSetupUi.value && !sourceDetailsSubmitted.value);
const shouldShowStep2CompleteCard = computed(() => isDetailsStepActive.value && sourceDetailsSubmitted.value);
const shouldShowStep2CardShell = computed(() => (
  isDetailsStepActive.value
  && (showSourceDetailsSetupUi.value || sourceDetailsSubmitted.value)
));

const nextPathPrimaryOption = {
  bgClass: "bg-chat-highlight",
  description: "Run an interactive guided demo using curated sample data.",
  icon: SampleIcon,
  key: "ivy-in-action",
  title: "See Ivy in Action",
};

const completionActionOptions = [
  {
    bgClass: "bg-chat-highlight",
    description: "Connect more sources so I can combine context and give you stronger insights.",
    icon: SourcesIcon,
    iconBg: "bg-chat-gradient",
    key: "sources",
    title: "Add Additional Sources",
  },
  {
    bgClass: "bg-library-highlight",
    description: "This is where commonly used prompts live, and I’ve already added starter ones for you.",
    icon: LibraryIcon,
    iconBg: "bg-library-gradient",
    key: "prompt-library",
    title: "Check Out the Prompt Library",
  },
  {
    bgClass: "bg-actions-highlight",
    description: "Review prebuilt assistants tailored to common workflows based on your synced sources.",
    icon: AssistantsIcon,
    iconBg: "bg-actions-gradient",
    key: "assistants",
    title: "Review Templated Assistants",
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

const sourceDetailsIntroMarkup = computed(() => (
  `Nice choice with ${selectedSourceLabel.value}. When you’re ready, <strong>fill in the connection details below</strong> and I’ll get your first sync prepared.`
));

const sourceSyncMessageMarkup = computed(() => (
  buildSourceSyncIvyMessage(selectedSourceLabel.value)
));

const chatInputSourceLabel = computed(() => selectedChatSource.value || "");
const chatInputSourceIcon = computed(() => (
  selectedChatSource.value ? resolveSourceIcon(selectedChatSource.value) : ""
));
const step3ActionRoutes = {
  "assistants": "/assistants",
  "ivy-in-action": "/ivy-in-action",
  "prompt-library": "/prompt-library",
  "sources": "/sources",
};

function clearFlowTimer(timerKey) {
  if (!flowTimers[timerKey]) {
    return;
  }

  window.clearTimeout(flowTimers[timerKey]);
  flowTimers[timerKey] = null;
}

function clearAllFlowTimers() {
  Object.keys(flowTimers).forEach((timerKey) => {
    clearFlowTimer(timerKey);
  });
}

function setFlowTimer(timerKey, callback, delayMs) {
  clearFlowTimer(timerKey);
  flowTimers[timerKey] = window.setTimeout(() => {
    callback();
    flowTimers[timerKey] = null;
  }, delayMs);
}

function getCardTone(status) {
  return status === "Complete" ? "complete" : "in-progress";
}

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

function clearStep3FlowState() {
  selectedChatSource.value = "";
  showPostSubmitIvyMessage.value = false;
  showStep3WrapUpMessage.value = false;
  showStep3WrapUpOptions.value = false;
  clearFlowTimer("step3WrapUpReveal");
}

function showAllSourceOptions() {
  showAllOnboardingSources.value = true;
}

function continueToDashboard() {
  if (!hasSelection.value) {
    return;
  }

  sourceSelectionConfirmed.value = true;
  showStep1CompletedCard.value = false;
  showStep1DetailsIntro.value = false;
  isSourceStepFadingOut.value = true;
  clearFlowTimer("sourceDetailsReveal");
  setFlowTimer("sourceStepSwitch", () => {
    onboardingStep.value = "details";
    showSourceDetailsSetupUi.value = false;
    clearStep3FlowState();
    sourceDetailsSubmitted.value = false;
    isSourceStepFadingOut.value = false;
    showStep1CompletedCard.value = true;
  }, CARD_SWAP_DURATION_MS);
}

function backToSourceSelection() {
  clearFlowTimer("sourceStepSwitch");

  onboardingStep.value = "source";
  sourceSelectionConfirmed.value = false;
  showAllOnboardingSources.value = false;
  showStep1CompletedCard.value = false;
  showStep1DetailsIntro.value = false;
  showSourceDetailsSetupUi.value = false;
  isSourceStepFadingOut.value = false;
  clearStep3FlowState();
}

function submitSourceDetails() {
  clearStep3FlowState();
  sourceDetailsSubmitted.value = true;
  startSync(selectedSourceLabel.value);
}

function skipToDashboard() {
  router.push("/");
}

function submitOnboardingPrompt(rawPrompt) {
  const prompt = String(rawPrompt || "").trim();
  if (!prompt) {
    return;
  }

  selectedChatSource.value = "";
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
  selectedChatSource.value = hasMatchingSource ? source : "";
}

function handleIntroTypingDone() {
  if (!isSourceStepActive.value) {
    showSourceSelectionUi.value = true;
    return;
  }

  setFlowTimer("sourceSelectionReveal", () => {
    showSourceSelectionUi.value = true;
  }, INTERACTIVE_REVEAL_DELAY_MS);
}

function handleSourceDetailsIntroTypingDone() {
  if (!isDetailsStepActive.value || sourceDetailsSubmitted.value) {
    return;
  }

  setFlowTimer("sourceDetailsReveal", () => {
    showSourceDetailsSetupUi.value = true;
  }, INTERACTIVE_REVEAL_DELAY_MS);
}

function handleStep1CompletedCardEntered() {
  if (!isDetailsStepActive.value || sourceDetailsSubmitted.value) {
    return;
  }

  setFlowTimer("step1DetailsIntro", () => {
    showStep1DetailsIntro.value = true;
  }, 300);
}

function handleSourceSyncMessageDone() {
  if (!sourceDetailsSubmitted.value) {
    return;
  }

  setFlowTimer("step3WrapUpReveal", () => {
    showStep3WrapUpMessage.value = true;
  }, SOURCE_SYNC_TO_WRAP_UP_DELAY_MS);
}

function handleStep2CardEntered() {
  if (!sourceDetailsSubmitted.value) {
    return;
  }

  showPostSubmitIvyMessage.value = true;
}

function handleStep3WrapUpTypingDone() {
  showStep3WrapUpOptions.value = true;
}

function handlePostStep3ActionSelect(actionKey) {
  const targetPath = step3ActionRoutes[actionKey];
  if (targetPath) {
    router.push(targetPath);
  }
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

onBeforeRouteLeave(() => {
  if (sourceDetailsSubmitted.value) {
    showToastNow();
  }
});

onBeforeUnmount(() => {
  clearAllFlowTimers();
});
</script>

<template>
  <section class="onboarding-page">
    <div class="chat-content">
      <IvyTypewriterMessage
        class="ivy-chat-width mb-4"
        :markup="INTRO_MARKUP"
        :timing="ONBOARDING_IVY_TYPING_TIMING"
        @done="handleIntroTypingDone"
      />

      <div
        v-if="shouldShowStep1Wrapper"
        class="onboarding-step-wrapper"
        :class="{
          'onboarding-sources': isSourceStepActive,
          'onboarding-sources--visible': isSourceStepActive && showSourceSelectionUi,
          'onboarding-sources--with-chat': isSourceStepActive,
          'onboarding-step-state--fading-out': isSourceStepFadingOut && isSourceStepActive,
        }"
      >
        <div
          ref="step1CardShell"
          class="border rounded onboarding-step-card-shell"
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
                  v-for="source in visibleOnboardingSources"
                  :key="source"
                  class="onboarding-source-button rounded p-2"
                  :class="{ 'onboarding-source-button--active': selectedSource === source }"
                  @click="selectSource(source)"
                >
                  <img
                    v-if="resolveSourceIcon(source)"
                    :src="resolveSourceIcon(source)"
                    :alt="source"
                    width="56"
                    height="56"
                  >
                  <div class="smallest text-dark mt-1">{{ source }}</div>
                </div>

                <button
                  v-if="!showAllOnboardingSources && hasAdditionalOnboardingSources"
                  type="button"
                  class="btn btn-link mb-4 h5 text-muted true-small text-decoration-none p-0 d-flex align-items-center justify-content-start onboarding-source-view-all"
                  @click="showAllSourceOptions"
                >
                  View all sources
                </button>

                <!--
                <button
                  v-if="showAllOnboardingSources"
                  type="button"
                  class="onboarding-source-button onboarding-source-button--disabled rounded p-2 border-0"
                  disabled
                >
                  <img
                    v-if="uploadSourceIcon"
                    :src="uploadSourceIcon"
                    alt="Upload file"
                    width="64"
                    height="64"
                  >
                  <div class="smallest text-dark mt-1">Upload</div>
                </button>
                -->
              </div>
              <div class="d-flex justify-content-end flex-wrap align-items-center gap-4 mt-4 pt-2.5">
                <button
                  type="button"
                  class="btn not-as-small text-muted"
                  v-tooltip="{ content: 'You can revisit this onboarding chat at any time.', placement: 'top' }"
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

      <div v-if="isDetailsStepActive" class="onboarding-details-step">
        <IvyTypewriterMessage
          v-if="showStep1DetailsIntro"
          class="ivy-chat-width mt-5 mb-4"
          :markup="sourceDetailsIntroMarkup"
          :rerun-key="selectedSourceLabel"
          :timing="ONBOARDING_IVY_TYPING_TIMING"
          @done="handleSourceDetailsIntroTypingDone"
        />

        <div class="onboarding-step-wrapper mb-5">
          <Transition name="onboarding-step-shell-fade">
            <div
              v-if="shouldShowStep2CardShell"
              ref="step2CardShell"
              class="border rounded onboarding-step-card-shell"
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
                        v-tooltip="{ content: 'You can revisit this onboarding chat at any time.', placement: 'top' }"
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

        <div v-if="showPostSubmitIvyMessage" class="my-5">
          <IvyTypewriterMessage
            class="assistant-chat-message ivy-chat-width mb-4"
            :markup="sourceSyncMessageMarkup"
            rerun-key="ivy-source-sync"
            :timing="ONBOARDING_IVY_TYPING_TIMING"
            @done="handleSourceSyncMessageDone"
          />
        </div>

        <div v-if="showStep3WrapUpMessage || showStep3WrapUpOptions" class="onboarding-step-wrapper mb-5">
          <hr class="mt-4 mb-5">

          <IvyTypewriterMessage
            v-if="showStep3WrapUpMessage"
            class="assistant-chat-message ivy-chat-width mb-4"
            :markup="IVY_WRAP_UP_MESSAGE"
            rerun-key="ivy-wrap-up"
            :timing="ONBOARDING_IVY_TYPING_TIMING"
            @done="handleStep3WrapUpTypingDone"
          />

          <Transition name="onboarding-step-shell-fade">
            <div v-if="showStep3WrapUpOptions" class="mb-4">
              <button
                type="button"
                class="border p-4 rounded w-100 text-start mb-3 onboarding-completion-option"
                :class="nextPathPrimaryOption.bgClass"
                @click="handlePostStep3ActionSelect(nextPathPrimaryOption.key)"
              >
                <div class="d-flex gap-3 align-items-center position-relative">
                  <img :src="nextPathPrimaryOption.icon" height="28" width="28">
                  <div>
                    <h6 class=" mb-0 text-wrap-balance">{{ nextPathPrimaryOption.title }}</h6>
                    <p class="not-as-small text-secondary mb-0">{{ nextPathPrimaryOption.description }}</p>
                  </div>
                  <img src="../../assets/arrow-right-c-dark.svg" height="14" width="14" class="ms-auto">
                </div>
              </button>

              <div class="row g-3">
                <div
                  v-for="option in completionActionOptions"
                  :key="option.key"
                  class="col-md-4"
                >
                  <button
                    type="button"
                    class="border p-3 rounded w-100 h-100 text-start onboarding-completion-option"
                    :class="option.bgClass"
                    v-tooltip="{ content: option.description, placement: 'bottom' }"
                    @click="handlePostStep3ActionSelect(option.key)"
                  >
                    <div class="d-flex gap-3 align-items-center position-relative">
                      <div
                        class="p-2 rounded d-flex align-items-center justify-content-center"
                        :class="option.iconBg"
                      >
                        <img :src="option.icon" height="16" width="16" class="invert-to-white">
                      </div>
                      <h6 class="reduced mb-0 text-wrap-balance">{{ option.title }}</h6>
                      <img src="../../assets/arrow-right-c-dark.svg" height="14" width="14" class="ms-auto">
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <div v-if="shouldShowStep3Status" class="mt-2">
            <OnboardingStepStatus
              transition-key="step-3"
              :status="step3Status"
              :step-number="3"
              :total-steps="TOTAL_ONBOARDING_STEPS"
            />
          </div>
        </div>
      </div>

      <input
        ref="fileInputEl"
        type="file"
        class="d-none"
        @change="onFileChange"
      >

      <div class="mt-auto onboarding-details-chat onboarding-details-chat--container-anchored">
        <ChatBox
          class="w-100"
          show-quick-actions
          :chat-placeholder="sourceDetailsSubmitted ? 'Ask Ivy anything...' : 'Need a hand? Ask Ivy or just enter your source details here...'"
          :input-source-icon="chatInputSourceIcon"
          :input-source-label="chatInputSourceLabel"
          :source-options="onboardingChatSourceOptions"
          :active-sources="onboardingChatActiveSources"
          :show-generic-onboarding="false"
          @select-source="handleOnboardingChatSourceSelect"
          @submit="submitOnboardingPrompt"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
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

.onboarding-inline-interaction {
  padding-left: 2.25rem;
  padding-right: 2.25rem;
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

.onboarding-source-button--disabled {
  cursor: not-allowed;
  opacity: 0.45;

  &:hover {
    background-color: transparent;
    border-color: transparent;
  }
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
  border-top-left-radius: 1.8125rem;
  border-top-right-radius: 1.8125rem;
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
    inset: 0 -6rem;
    position: absolute;
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
</style>
