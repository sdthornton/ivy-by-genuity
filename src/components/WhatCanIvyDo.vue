<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChatBox from "./shared/ChatBox.vue";
import IvyTypewriterMessage from "./shared/IvyTypewriterMessage.vue";
import UserChatMessage from "./shared/UserChatMessage.vue";
import typewriter from "../utils/typewriter";
import ContentHeader from "./shared/ContentHeader.vue";
import CursorClickIcon from "../assets/cursor-click.svg";
import ChevronDownIcon from "../assets/chevron-down.svg";
import RiskScoreCard from "./ivy-in-action/RiskScoreCard.vue";
import CorrelationGraph from "./ivy-in-action/CorrelationGraph.vue";
import ExecutionStepper from "./ivy-in-action/ExecutionStepper.vue";
import AttackTimeline from "./ivy-in-action/AttackTimeline.vue";
import RiskDeltaPanel from "./ivy-in-action/RiskDeltaPanel.vue";
import {
  ivyInActionDefaultScenario,
  ivyInActionScenarioByKey,
  ivyInActionScenarioList,
} from "./ivy-in-action/scenarios";

const typingTiming = {
  maxDelay: 22,
  minDelay: 14,
  whitespaceMaxDelay: 4,
  whitespaceMinDelay: 0,
};
const introTypingTiming = {
  startDelay: 80,
  minDelay: 12,
  maxDelay: 20,
  whitespaceMinDelay: 0,
  whitespaceMaxDelay: 4,
};
const DEMO_CURSOR_MOVE_DURATION_MS = 920;
const DEMO_CURSOR_SIZE_PX = 28;
const HIDE_REAL_CURSOR_CLASS = "ivy-in-action-hide-cursor";

const props = defineProps({
  autoStartScenario: {
    type: Boolean,
    default: false,
  },
  scenarioKey: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const launcherEl = useTemplateRef("launcherEl");
const topPromptChatBox = useTemplateRef("topPromptChatBox");
const selectedQuery = ref("");
const phase = ref("entry");
const discoveryStep = ref(0);
const assistantStep = ref(0);
const selectedActions = ref([]);
const executionProgress = ref(0);
const showReasoningTrail = ref(false);
const selectedFollowUpResponses = ref({
  correlate: "",
  email: "",
  endpoints: "",
  remediation: "",
});
const selectedAssistantResponses = ref({
  confirm: "",
  intro: "",
  plan: "",
  run: "",
});
const expandedTableRows = ref({
  adminRisk: false,
  assistantTargets: false,
});
const hasShownSourcesDetails = ref(false);
const hasShownFirstPassDetails = ref(false);
const hasShownEmailDetails = ref(false);
const hasShownEndpointDetails = ref(false);
const hasShownCorrelationDetails = ref(false);
const hasShownAssistantIntroDetails = ref(false);
const hasShownAssistantPlanDetails = ref(false);
const hasShownAssistantRunDetails = ref(false);
const hasShownAssistantCompleteDetails = ref(false);
const hasShownAssistantOutroDetails = ref(false);
const showDemoCursor = ref(false);
const demoCursorVisible = ref(false);
const demoCursorMoving = ref(false);
const demoCursorFading = ref(false);
const forceSubmitHover = ref(false);
const forceSubmitActive = ref(false);
const demoCursorStartX = ref(0);
const demoCursorStartY = ref(0);
const demoCursorEndX = ref(0);
const demoCursorEndY = ref(0);
const lastPromptClickClientX = ref(null);
const lastPromptClickClientY = ref(null);
let launchTimer = null;
let thinkingTimer = null;
let activePromptTypewriterController = null;
let activeDemoCursorAnimationId = 0;
const executionTimers = [];
const IVY_IN_ACTION_ENTRY_BG_CLASS = "ivy-in-action-entry";
const queryOptions = ivyInActionScenarioList;
const scenario = computed(() => (
  ivyInActionScenarioByKey[props.scenarioKey] || ivyInActionDefaultScenario
));
const activeScenarioKey = computed(() => props.scenarioKey || "");
const shouldAutoStartScenario = computed(() => (
  Boolean(props.autoStartScenario && props.scenarioKey)
));
const scenarioData = computed(() => scenario.value.data);
const scenarioMessages = computed(() => scenario.value.messages);
const scenarioToggleText = computed(() => scenario.value.toggleText);
const scenarioUserActions = computed(() => scenario.value.userActions);
let isScenarioSelectionInProgress = false;

const showDiscoveryContent = computed(() => phase.value === "discovery");
const showInitialIvyResponse = computed(() => (
  phase.value === "query" || phase.value === "thinking" || phase.value === "discovery"
));
const showThinkingIvyResponse = computed(() => (
  phase.value === "discovery"
));
const completedActionsCount = computed(() => (
  selectedActions.value.filter(Boolean).length
));
const visibleExecutionLines = computed(() => (
  scenarioData.value.executionLines.slice(0, executionProgress.value)
));
const demoCursorStyle = computed(() => ({
  "--demo-cursor-end-x": `${demoCursorEndX.value}px`,
  "--demo-cursor-end-y": `${demoCursorEndY.value}px`,
  "--demo-cursor-start-x": `${demoCursorStartX.value}px`,
  "--demo-cursor-start-y": `${demoCursorStartY.value}px`,
}));

const adminRiskRowsDisplay = computed(() => (
  buildExpandableRows(
    scenarioData.value.adminRiskRows,
    scenarioData.value.adminRiskRowsMore,
    "adminRisk",
    "account",
  )
));

const assistantAccountTargetsDisplay = computed(() => (
  buildExpandableRows(
    scenarioData.value.assistantAccountTargets,
    scenarioData.value.assistantAccountTargetsMore,
    "assistantTargets",
    "account",
  )
));

function waitForDuration(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isSummaryToggleRow(row, keyField) {
  const rowLabel = String(row?.[keyField] || "");
  return rowLabel.startsWith("+");
}

function buildExpandableRows(baseRows, expandedRows, tableKey, keyField) {
  const baseList = Array.isArray(baseRows) ? baseRows : [];
  const extraList = Array.isArray(expandedRows) ? expandedRows : [];
  const summaryIndex = baseList.findIndex((row) => isSummaryToggleRow(row, keyField));
  if (summaryIndex < 0) {
    return baseList;
  }

  const prefixRows = baseList.slice(0, summaryIndex);
  const summaryRow = baseList[summaryIndex];
  const isExpanded = Boolean(expandedTableRows.value[tableKey]);
  const toggleRow = {
    ...summaryRow,
    __isToggle: true,
    __isExpanded: isExpanded,
  };

  if (!isExpanded) {
    return [...prefixRows, toggleRow];
  }

  return [...prefixRows, ...extraList, toggleRow];
}

function toggleExpandableRows(tableKey) {
  expandedTableRows.value = {
    ...expandedTableRows.value,
    [tableKey]: !expandedTableRows.value[tableKey],
  };
}

function setRealCursorHidden(hidden) {
  document.body.classList.toggle(HIDE_REAL_CURSOR_CLASS, hidden);
}

function getTopPromptInputElement() {
  const chatBoxComponent = topPromptChatBox.value;
  if (!chatBoxComponent) {
    return null;
  }

  const exposedInput = chatBoxComponent.chatInput;
  if (!exposedInput) {
    return null;
  }

  if (typeof HTMLInputElement !== "undefined" && exposedInput instanceof HTMLInputElement) {
    return exposedInput;
  }

  const maybeInput = exposedInput.value;
  if (typeof HTMLInputElement !== "undefined" && maybeInput instanceof HTMLInputElement) {
    return maybeInput;
  }

  return null;
}

function getTopPromptSubmitButtonElement() {
  const chatBoxComponent = topPromptChatBox.value;
  if (!chatBoxComponent) {
    return null;
  }

  const exposedButton = chatBoxComponent.submitButton;
  if (!exposedButton) {
    return null;
  }

  if (typeof HTMLButtonElement !== "undefined" && exposedButton instanceof HTMLButtonElement) {
    return exposedButton;
  }

  const maybeButton = exposedButton.value;
  if (typeof HTMLButtonElement !== "undefined" && maybeButton instanceof HTMLButtonElement) {
    return maybeButton;
  }

  return null;
}

async function fillTopPromptInput(prompt) {
  await nextTick();
  const inputElement = getTopPromptInputElement();
  if (!inputElement) {
    return;
  }

  const controller = new AbortController();
  activePromptTypewriterController?.abort();
  activePromptTypewriterController = controller;

  inputElement.focus();

  try {
    await typewriter(inputElement, prompt, {
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
  } finally {
    if (activePromptTypewriterController === controller) {
      activePromptTypewriterController = null;
    }
  }
}

function clearDemoCursorState() {
  showDemoCursor.value = false;
  demoCursorVisible.value = false;
  demoCursorMoving.value = false;
  demoCursorFading.value = false;
  forceSubmitHover.value = false;
  forceSubmitActive.value = false;
}

function cancelDemoCursorAnimation() {
  activeDemoCursorAnimationId += 1;
  clearDemoCursorState();
}

async function playDemoCursorAnimation() {
  await nextTick();
  const launcherElement = launcherEl.value;
  const inputElement = getTopPromptInputElement();
  const submitButton = getTopPromptSubmitButtonElement();
  if (!launcherElement || !inputElement || !submitButton) {
    return;
  }

  const launcherRect = launcherElement.getBoundingClientRect();
  const inputRect = inputElement.getBoundingClientRect();
  const submitRect = submitButton.getBoundingClientRect();
  const hasPromptClickOrigin = (
    typeof lastPromptClickClientX.value === "number"
    && typeof lastPromptClickClientY.value === "number"
  );

  demoCursorStartX.value = hasPromptClickOrigin
    ? Math.round(lastPromptClickClientX.value - launcherRect.left - (DEMO_CURSOR_SIZE_PX / 2))
    : Math.round(inputRect.left - launcherRect.left + 16);
  demoCursorStartY.value = hasPromptClickOrigin
    ? Math.round(lastPromptClickClientY.value - launcherRect.top - (DEMO_CURSOR_SIZE_PX / 2))
    : Math.round(inputRect.top - launcherRect.top + (inputRect.height * 0.5) - (DEMO_CURSOR_SIZE_PX / 2));
  demoCursorEndX.value = Math.round(submitRect.left - launcherRect.left + (submitRect.width * 0.5) - (DEMO_CURSOR_SIZE_PX / 2));
  demoCursorEndY.value = Math.round(submitRect.top - launcherRect.top + (submitRect.height * 0.5) - (DEMO_CURSOR_SIZE_PX / 2));

  const animationId = activeDemoCursorAnimationId + 1;
  activeDemoCursorAnimationId = animationId;
  clearDemoCursorState();
  showDemoCursor.value = true;

  await nextTick();
  if (animationId !== activeDemoCursorAnimationId) {
    return;
  }

  demoCursorVisible.value = true;
  await waitForDuration(120);
  if (animationId !== activeDemoCursorAnimationId) {
    return;
  }

  demoCursorMoving.value = true;
  await waitForDuration(DEMO_CURSOR_MOVE_DURATION_MS);
  if (animationId !== activeDemoCursorAnimationId) {
    return;
  }

  forceSubmitHover.value = true;
  await waitForDuration(110);
  if (animationId !== activeDemoCursorAnimationId) {
    return;
  }

  forceSubmitActive.value = true;
  await waitForDuration(130);
  if (animationId !== activeDemoCursorAnimationId) {
    return;
  }

  forceSubmitActive.value = false;
  await waitForDuration(70);
  if (animationId !== activeDemoCursorAnimationId) {
    return;
  }

  demoCursorFading.value = true;
  window.setTimeout(() => {
    if (animationId === activeDemoCursorAnimationId) {
      clearDemoCursorState();
    }
  }, 170);
  await waitForDuration(40);
}

async function chooseQuery(queryOption, event) {
  if (isScenarioSelectionInProgress) {
    return;
  }

  isScenarioSelectionInProgress = true;
  if (event) {
    lastPromptClickClientX.value = event.clientX;
    lastPromptClickClientY.value = event.clientY;
  } else {
    lastPromptClickClientX.value = null;
    lastPromptClickClientY.value = null;
  }

  try {
    if (route.path !== queryOption.path) {
      await router.push(queryOption.path);
    }

    selectedQuery.value = queryOption.query;
    setRealCursorHidden(true);
    await fillTopPromptInput(queryOption.query);
    await playDemoCursorAnimation();
    startDemo(queryOption.query);
  } finally {
    setRealCursorHidden(false);
    lastPromptClickClientX.value = null;
    lastPromptClickClientY.value = null;
    isScenarioSelectionInProgress = false;
  }
}

function clearLaunchTimer() {
  if (!launchTimer) {
    return;
  }

  window.clearTimeout(launchTimer);
  launchTimer = null;
}

function clearThinkingTimer() {
  if (!thinkingTimer) {
    return;
  }

  window.clearTimeout(thinkingTimer);
  thinkingTimer = null;
}

function clearExecutionTimers() {
  while (executionTimers.length) {
    const timer = executionTimers.pop();
    window.clearTimeout(timer);
  }
}

function queueExecutionTimers() {
  scenarioData.value.executionLines.forEach((_, index) => {
    const timer = window.setTimeout(() => {
      executionProgress.value = index + 1;
      if (index === scenarioData.value.executionLines.length - 1) {
        assistantStep.value = 5;
      }
    }, 620 * (index + 1));
    executionTimers.push(timer);
  });
}

function resetFlowState() {
  discoveryStep.value = 0;
  assistantStep.value = 0;
  executionProgress.value = 0;
  showReasoningTrail.value = false;
  hasShownSourcesDetails.value = false;
  hasShownFirstPassDetails.value = false;
  hasShownEmailDetails.value = false;
  hasShownEndpointDetails.value = false;
  hasShownCorrelationDetails.value = false;
  hasShownAssistantIntroDetails.value = false;
  hasShownAssistantPlanDetails.value = false;
  hasShownAssistantRunDetails.value = false;
  hasShownAssistantCompleteDetails.value = false;
  hasShownAssistantOutroDetails.value = false;
  selectedFollowUpResponses.value = {
    correlate: "",
    email: "",
    endpoints: "",
    remediation: "",
  };
  selectedAssistantResponses.value = {
    confirm: "",
    intro: "",
    plan: "",
    run: "",
  };
  expandedTableRows.value = {
    adminRisk: false,
    assistantTargets: false,
  };
  selectedActions.value = scenarioData.value.actionPlanRows.map((row) => row.selected);
}

function clearPromptInput() {
  const inputElement = getTopPromptInputElement();
  if (!inputElement) {
    return;
  }

  inputElement.value = "";
}

function resetToEntryState() {
  clearLaunchTimer();
  clearThinkingTimer();
  clearExecutionTimers();
  activePromptTypewriterController?.abort();
  activePromptTypewriterController = null;
  cancelDemoCursorAnimation();
  resetFlowState();
  selectedQuery.value = "";
  phase.value = "entry";
  nextTick(() => {
    clearPromptInput();
  });
  setRealCursorHidden(false);
}

function startDemo(overridePrompt = "") {
  const promptFromInput = getTopPromptInputElement()?.value?.trim() || "";
  const nextPrompt = (overridePrompt || promptFromInput || selectedQuery.value).trim();
  if (!nextPrompt) {
    return;
  }

  selectedQuery.value = nextPrompt;

  clearLaunchTimer();
  clearThinkingTimer();
  clearExecutionTimers();
  resetFlowState();

  phase.value = "launching";
  launchTimer = window.setTimeout(() => {
    phase.value = "query";
    launchTimer = null;
  }, 420);
}

function handleQueryTypedDone() {
  if (phase.value !== "query") {
    return;
  }

  phase.value = "thinking";
  thinkingTimer = window.setTimeout(() => {
    phase.value = "discovery";
    discoveryStep.value = 1;
    thinkingTimer = null;
  }, 1000);
}

function advanceDiscovery() {
  discoveryStep.value = Math.min(4, discoveryStep.value + 1);
}

function toggleReasoningTrail() {
  showReasoningTrail.value = !showReasoningTrail.value;
}

function startAssistantMode() {
  assistantStep.value = 1;
}

function continueAssistantIntro() {
  selectedAssistantResponses.value.intro = "Build action plan";
  assistantStep.value = 2;
}

function toggleAssistantAction(index) {
  selectedActions.value[index] = !selectedActions.value[index];
}

function continueToAssistantConfirm() {
  selectedAssistantResponses.value.plan = "Review and confirm";
  assistantStep.value = 3;
}

function runAssistantPlan() {
  selectedAssistantResponses.value.confirm = "Apply Selected";
  assistantStep.value = 4;
  executionProgress.value = 0;
  clearExecutionTimers();
  queueExecutionTimers();
}

function reviewAssistantPlan() {
  selectedAssistantResponses.value.confirm = "Review First";
  assistantStep.value = 2;
}

function skipExecutionToResult() {
  selectedAssistantResponses.value.run = "Run all now";
  clearExecutionTimers();
  executionProgress.value = scenarioData.value.executionLines.length;
  assistantStep.value = 5;
}

function handleSourcesIntroDone() {
  hasShownSourcesDetails.value = true;
}

function handleFirstPassDone() {
  hasShownFirstPassDetails.value = true;
}

function handleEmailDone() {
  hasShownEmailDetails.value = true;
}

function handleEndpointDone() {
  hasShownEndpointDetails.value = true;
}

function handleCorrelationDone() {
  hasShownCorrelationDetails.value = true;
}

function handleAssistantIntroDone() {
  hasShownAssistantIntroDetails.value = true;
}

function handleAssistantPlanDone() {
  hasShownAssistantPlanDetails.value = true;
}

function handleAssistantRunDone() {
  hasShownAssistantRunDetails.value = true;
}

function handleAssistantCompleteDone() {
  hasShownAssistantCompleteDetails.value = true;
}

function handleAssistantDemoOutroDone() {
  hasShownAssistantOutroDetails.value = true;
}

function selectEmailFollowUp() {
  selectedFollowUpResponses.value.email = scenarioUserActions.value.email;
  advanceDiscovery();
}

function selectEndpointsFollowUp() {
  selectedFollowUpResponses.value.endpoints = scenarioUserActions.value.endpoints;
  advanceDiscovery();
}

function selectCorrelateFollowUp() {
  selectedFollowUpResponses.value.correlate = scenarioUserActions.value.correlate;
  advanceDiscovery();
}

function selectRemediationFollowUp() {
  selectedFollowUpResponses.value.remediation = scenarioUserActions.value.remediation;
  startAssistantMode();
}

function syncEntryBackgroundClass() {
  const isEntryPhase = phase.value === "entry";
  document.body.classList.toggle(IVY_IN_ACTION_ENTRY_BG_CLASS, isEntryPhase);
}

onMounted(() => {
  if (shouldAutoStartScenario.value) {
    startDemo(scenario.value.query);
  } else {
    resetToEntryState();
  }
  syncEntryBackgroundClass();
});

watch(phase, () => {
  syncEntryBackgroundClass();
});

watch(() => [props.scenarioKey, props.autoStartScenario], () => {
  if (isScenarioSelectionInProgress) {
    return;
  }

  if (!shouldAutoStartScenario.value) {
    resetToEntryState();
    return;
  }

  startDemo(scenario.value.query);
});

onBeforeUnmount(() => {
  document.body.classList.remove(IVY_IN_ACTION_ENTRY_BG_CLASS);
  setRealCursorHidden(false);
  activePromptTypewriterController?.abort();
  activePromptTypewriterController = null;
  cancelDemoCursorAnimation();
  clearLaunchTimer();
  clearThinkingTimer();
  clearExecutionTimers();
});
</script>

<template>
  <ContentHeader 
    v-if="phase !== 'entry'"
  >
    <div 
      class="rounded-pill bg-primary-subtle text-dark px-2 true-small ms-auto me-3"
      v-tooltip="'This chat uses a curated set of sample data and is for demo purposes only. It does not interact with any of your real data.'"
    >
      Curated Sample Data
    </div>
    <RouterLink to="/ivy-in-action" class="close-demo-btn btn btn-link h4 fw-medium text-dark mb-0">
      &times;
    </RouterLink>
  </ContentHeader>
  <section class="what-ivy-page">
    <div v-if="phase !== 'entry' && phase !== 'launching'" class="chat-content what-ivy-chat-flow">
      <UserChatMessage :text="selectedQuery" />

      <IvyTypewriterMessage
        v-if="showInitialIvyResponse"
        class="assistant-chat-message ivy-chat-width mb-4"
        :markup="scenarioMessages.initial"
        :rerun-key="selectedQuery"
        :timing="introTypingTiming"
        @done="handleQueryTypedDone"
      />

      <IvyTypewriterMessage
        v-if="showThinkingIvyResponse"
        class="assistant-chat-message ivy-chat-width mb-4"
        :markup="scenarioMessages.analysis"
        :timing="typingTiming"
        @done="handleSourcesIntroDone"
      />

      <article v-if="phase === 'thinking'" class="assistant-chat-message ivy-chat-width mb-4">
        <span class="ivy-thinking-text">Ivy is thinking...</span>
      </article>

      <div v-if="showDiscoveryContent">
        <div v-if="hasShownSourcesDetails" class="d-flex flex-wrap gap-2 mb-3">
          <div
            v-for="(source, sourceIndex) in scenarioData.sourceChips"
            :key="source.label"
            class="d-inline-flex align-items-center rounded-pill border bg-light px-2 py-1 what-ivy-source-chip"
            :style="{ '--chip-delay': `${sourceIndex * 90}ms` }"
          >
            <img :src="source.icon" :alt="source.label" width="16" height="16" class="me-2">
            <span class="true-small">{{ source.label }}</span>
          </div>
        </div>

        <IvyTypewriterMessage
          v-if="hasShownSourcesDetails"
          class="assistant-chat-message ivy-chat-width mb-3"
          :markup="scenarioMessages.firstPass"
          rerun-key="discovery-identity"
          :timing="typingTiming"
          @done="handleFirstPassDone"
        />

        <div 
          v-if="hasShownFirstPassDetails"
          class="px-4 pb-4 pt-3 bg-light rounded mb-4"
        >
          <RiskScoreCard class="mb-4" :score-card="scenarioData.riskScoreCard" />
          <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
            <thead>
              <tr>
                <th scope="col">Account</th>
                <th scope="col">Role</th>
                <th scope="col" class="text-end">MFA</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in adminRiskRowsDisplay"
                :key="`${row.account}-${rowIndex}`"
                class="what-ivy-table__row"
                :style="{ '--row-delay': `${rowIndex * 90}ms` }"
              >
                <td>
                  <button
                    v-if="row.__isToggle"
                    type="button"
                    class="btn btn-link py-0 px-1 d-inline-flex align-items-center gap-1 text-decoration-none text-muted what-ivy-table-toggle"
                    @click="toggleExpandableRows('adminRisk')"
                  >
                    <span>{{ row.__isExpanded ? "Show less" : row.account }}</span>
                    <img
                      :src="ChevronDownIcon"
                      alt=""
                      width="10"
                      height="10"
                      class="what-ivy-inline-toggle__icon opacity-75"
                      :class="{ 'what-ivy-inline-toggle__icon--expanded': row.__isExpanded }"
                    >
                  </button>
                  <span v-else>{{ row.account }}</span>
                </td>
                <td>{{ row.__isToggle && row.__isExpanded ? "" : row.role }}</td>
                <td class="text-end">{{ row.__isToggle && row.__isExpanded ? "" : row.mfa }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="hasShownFirstPassDetails" class="assistant-chat-message ivy-chat-width what-ivy-inline-question">
          <strong>{{ scenarioMessages.messagingQuestion }}</strong>
        </p>
        <div v-if="hasShownFirstPassDetails" class="mb-2">
          <div
            v-if="!selectedFollowUpResponses.email && discoveryStep === 1"
            class="d-flex justify-content-end"
          >
            <button type="button" class="btn btn-white border rounded px-3 py-2 what-ivy-user-action what-ivy-followup-option" @click="selectEmailFollowUp">
              {{ scenarioUserActions.email }}
            </button>
          </div>
          <UserChatMessage v-else-if="selectedFollowUpResponses.email" :text="selectedFollowUpResponses.email" />
        </div>

        <template v-if="discoveryStep >= 2">
          <hr class="my-4">
          <IvyTypewriterMessage
            class="assistant-chat-message ivy-chat-width mb-3"
            :markup="scenarioMessages.emailFinding"
            rerun-key="discovery-email"
            :timing="typingTiming"
            @done="handleEmailDone"
          />

          <div 
            v-if="hasShownEmailDetails"
            class="px-4 pb-4 pt-3 bg-light rounded mb-4"
          >
            <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
              <thead>
                <tr>
                  <th scope="col">Mailbox</th>
                  <th scope="col">External Destination</th>
                  <th scope="col" class="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in scenarioData.forwardingRiskRows"
                  :key="row.mailbox"
                  class="what-ivy-table__row"
                  :style="{ '--row-delay': `${rowIndex * 90}ms` }"
                >
                  <td>{{ row.mailbox }}</td>
                  <td>{{ row.destination }}</td>
                  <td class="text-end">{{ row.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="hasShownEmailDetails" class="assistant-chat-message ivy-chat-width what-ivy-inline-question">
            <strong>{{ scenarioMessages.endpointsQuestion }}</strong>
          </p>
          <div v-if="hasShownEmailDetails" class="mb-2">
            <div
              v-if="!selectedFollowUpResponses.endpoints && discoveryStep === 2"
              class="d-flex justify-content-end"
            >
              <button type="button" class="btn btn-white border rounded px-3 py-2 what-ivy-user-action what-ivy-followup-option" @click="selectEndpointsFollowUp">
                {{ scenarioUserActions.endpoints }}
              </button>
            </div>
            <UserChatMessage v-else-if="selectedFollowUpResponses.endpoints" :text="selectedFollowUpResponses.endpoints" />
          </div>
        </template>

        <template v-if="discoveryStep >= 3">
          <hr class="my-4">
          <IvyTypewriterMessage
            class="assistant-chat-message ivy-chat-width mb-3"
            :markup="scenarioMessages.endpointFinding"
            rerun-key="discovery-endpoint"
            :timing="typingTiming"
            @done="handleEndpointDone"
          />

          <div 
            v-if="hasShownEndpointDetails"
            class="px-4 pb-4 pt-3 bg-light rounded mb-4"
          >
            <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
              <thead>
                <tr>
                  <th scope="col">Device</th>
                  <th scope="col">Detection</th>
                  <th scope="col" class="text-end">State</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in scenarioData.endpointRiskRows"
                  :key="row.device"
                  class="what-ivy-table__row"
                  :style="{ '--row-delay': `${rowIndex * 90}ms` }"
                >
                  <td>{{ row.device }}</td>
                  <td>{{ row.alert }}</td>
                  <td class="text-end">{{ row.state }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="hasShownEndpointDetails" class="assistant-chat-message ivy-chat-width what-ivy-inline-question">
            <strong>{{ scenarioMessages.correlateQuestion }}</strong>
          </p>
          <div v-if="hasShownEndpointDetails" class="mb-2">
            <div
              v-if="!selectedFollowUpResponses.correlate && discoveryStep === 3"
              class="d-flex justify-content-end"
            >
              <button type="button" class="btn btn-white border rounded px-3 py-2 what-ivy-user-action what-ivy-followup-option" @click="selectCorrelateFollowUp">
                {{ scenarioUserActions.correlate }}
              </button>
            </div>
            <UserChatMessage v-else-if="selectedFollowUpResponses.correlate" :text="selectedFollowUpResponses.correlate" />
          </div>
        </template>

        <template v-if="discoveryStep >= 4">
          <hr class="my-4">
          <IvyTypewriterMessage
            class="assistant-chat-message ivy-chat-width mb-3"
            :markup="scenarioMessages.correlation"
            rerun-key="discovery-correlation"
            :timing="typingTiming"
            @done="handleCorrelationDone"
          />

          <div 
            v-if="hasShownCorrelationDetails"
            class="px-4 pb-4 pt-3 bg-light rounded mb-4"
          >
            <AttackTimeline class="mb-4" :events="scenarioData.attackTimelineEvents" />
            <CorrelationGraph class="mb-4" :graph="scenarioData.correlationGraph" />
            <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
              <thead>
                <tr>
                  <th scope="col">Signal</th>
                  <th scope="col">Related Activity</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in scenarioData.correlationRows"
                  :key="row.signal"
                  class="what-ivy-table__row"
                  :style="{ '--row-delay': `${rowIndex * 90}ms` }"
                >
                  <td>{{ row.signal }}</td>
                  <td>{{ row.relationship }}</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-1">
              <button
                type="button"
                class="btn btn-link py-0 px-1 text-muted not-as-small d-inline-flex align-items-center gap-1 what-ivy-inline-toggle"
                @click="toggleReasoningTrail"
              >
                <span>{{ showReasoningTrail ? scenarioToggleText.hideReasoning : scenarioToggleText.showReasoning }}</span>
                <img
                  :src="ChevronDownIcon"
                  alt=""
                  width="10"
                  height="10"
                  class="what-ivy-inline-toggle__icon opacity-75"
                  :class="{ 'what-ivy-inline-toggle__icon--expanded': showReasoningTrail }"
                >
              </button>
            </div>
            <p v-if="showReasoningTrail" class="true-small text-secondary mt-1 mb-0">
              {{ scenarioMessages.reasoningTrail }}
            </p>
          </div>

          <div 
            v-if="hasShownCorrelationDetails"
            class="px-4 pb-4 pt-3 bg-light rounded mb-4"
          >
            <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
              <thead>
                <tr>
                  <th scope="col">Impacted Asset</th>
                  <th scope="col">Current Exposure</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in scenarioData.impactRows"
                  :key="row.asset"
                  class="what-ivy-table__row"
                  :style="{ '--row-delay': `${rowIndex * 90}ms` }"
                >
                  <td>{{ row.asset }}</td>
                  <td>{{ row.exposure }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="hasShownCorrelationDetails" class="assistant-chat-message ivy-chat-width what-ivy-inline-question">
            <strong>{{ scenarioMessages.remediationQuestion }}</strong>
          </p>
          <div v-if="hasShownCorrelationDetails">
            <div
              v-if="!selectedFollowUpResponses.remediation && assistantStep === 0"
              class="d-flex justify-content-end"
            >
              <button type="button" class="btn btn-white border rounded px-3 py-2 what-ivy-user-action what-ivy-followup-option" @click="selectRemediationFollowUp">
                {{ scenarioUserActions.remediation }}
              </button>
            </div>
            <UserChatMessage v-else-if="selectedFollowUpResponses.remediation" :text="selectedFollowUpResponses.remediation" />
          </div>
        </template>

        <section v-if="assistantStep > 0" class="mt-4">
          <hr class="my-4">

          <template v-if="assistantStep >= 1">
            <IvyTypewriterMessage
              class="assistant-chat-message ivy-chat-width mb-3"
              :markup="scenarioMessages.assistantIntro"
              rerun-key="assistant-intro"
              :timing="typingTiming"
              @done="handleAssistantIntroDone"
            />

            <div 
              v-if="hasShownAssistantIntroDetails"
              class="px-4 pb-4 pt-3 bg-light rounded mb-4"
            >
              <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
                <thead>
                  <tr>
                    <th scope="col">Account</th>
                    <th scope="col">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in assistantAccountTargetsDisplay"
                    :key="`${row.account}-${rowIndex}`"
                    class="what-ivy-table__row"
                    :style="{ '--row-delay': `${rowIndex * 90}ms` }"
                  >
                    <td>
                      <button
                        v-if="row.__isToggle"
                        type="button"
                        class="btn btn-link py-0 px-1 d-inline-flex align-items-center gap-1 text-decoration-none text-muted what-ivy-table-toggle"
                        @click="toggleExpandableRows('assistantTargets')"
                      >
                        <span>{{ row.__isExpanded ? "Show less" : row.account }}</span>
                        <img
                          :src="ChevronDownIcon"
                          alt=""
                          width="10"
                          height="10"
                          class="what-ivy-inline-toggle__icon opacity-75"
                          :class="{ 'what-ivy-inline-toggle__icon--expanded': row.__isExpanded }"
                        >
                      </button>
                      <span v-else>{{ row.account }}</span>
                    </td>
                    <td>{{ row.__isToggle && row.__isExpanded ? "" : row.reason }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-if="hasShownAssistantIntroDetails" class="assistant-chat-message ivy-chat-width what-ivy-inline-question">
              <strong>{{ scenarioMessages.actionPlanQuestion }}</strong>
            </p>
            <div v-if="hasShownAssistantIntroDetails && assistantStep === 1" class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-white border rounded px-3 py-2 what-ivy-user-action"
                @click="continueAssistantIntro"
              >
                Build action plan
              </button>
            </div>
            <UserChatMessage
              v-else-if="hasShownAssistantIntroDetails && selectedAssistantResponses.intro"
              :text="selectedAssistantResponses.intro"
            />
          </template>

          <template v-if="assistantStep >= 2">
            <hr class="my-4">
            <IvyTypewriterMessage
              class="assistant-chat-message ivy-chat-width mb-3"
              :markup="scenarioMessages.assistantPlan"
              rerun-key="assistant-plan"
              :timing="typingTiming"
              @done="handleAssistantPlanDone"
            />

            <div 
              v-if="hasShownAssistantPlanDetails"
              class="px-4 pb-4 pt-3 bg-light rounded mb-4"
            >
              <table class="table table-light not-as-small align-middle mb-0 what-ivy-table">
                <thead>
                  <tr>
                    <th scope="col">Run</th>
                    <th scope="col">Action</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in scenarioData.actionPlanRows"
                    :key="row.label"
                    class="what-ivy-table__row"
                    :style="{ '--row-delay': `${index * 90}ms` }"
                  >
                    <td>
                      <input
                        type="checkbox"
                        :checked="selectedActions[index]"
                        @change="toggleAssistantAction(index)"
                      >
                    </td>
                    <td>{{ row.label }}</td>
                    <td>{{ row.details }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="hasShownAssistantPlanDetails && assistantStep === 2" class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-white border rounded px-3 py-2 what-ivy-user-action"
                @click="continueToAssistantConfirm"
              >
                Review and confirm
              </button>
            </div>
            <UserChatMessage
              v-else-if="hasShownAssistantPlanDetails && selectedAssistantResponses.plan"
              :text="selectedAssistantResponses.plan"
            />
          </template>

          <template v-if="assistantStep >= 3">
            <p class="assistant-chat-message ivy-chat-width what-ivy-inline-question">
              <strong>Apply the selected actions now?</strong>
            </p>
            <div v-if="assistantStep === 3" class="d-flex justify-content-end flex-wrap gap-2">
              <button type="button" class="btn btn-white border rounded px-3 py-2 what-ivy-user-action" @click="runAssistantPlan">
                Apply Selected
              </button>
              <button type="button" class="btn btn-white border rounded px-3 py-2 what-ivy-user-action" @click="reviewAssistantPlan">
                Review First
              </button>
            </div>
            <UserChatMessage
              v-else-if="selectedAssistantResponses.confirm"
              :text="selectedAssistantResponses.confirm"
            />
          </template>

          <template v-if="assistantStep >= 4">
            <hr class="my-4">
            <IvyTypewriterMessage
              class="assistant-chat-message ivy-chat-width mb-3"
              :markup="scenarioMessages.assistantRun"
              rerun-key="assistant-run"
              :timing="typingTiming"
              @done="handleAssistantRunDone"
            />

            <div 
              v-if="hasShownAssistantRunDetails"
              class="px-4 pb-4 pt-3 bg-light rounded mb-4"
            >
              <ExecutionStepper
                :completed-count="executionProgress"
                :steps="scenarioData.executionLines"
              />
            </div>

            <div v-if="hasShownAssistantRunDetails && assistantStep === 4" class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-white border rounded px-3 py-2 what-ivy-user-action"
                @click="skipExecutionToResult"
              >
                Run all now
              </button>
            </div>
            <UserChatMessage
              v-else-if="hasShownAssistantRunDetails && selectedAssistantResponses.run"
              :text="selectedAssistantResponses.run"
            />
          </template>

          <template v-if="assistantStep >= 5">
            <hr class="my-4">
            <IvyTypewriterMessage
              class="assistant-chat-message ivy-chat-width mb-3"
              :markup="scenarioMessages.assistantComplete"
              rerun-key="assistant-complete"
              :timing="typingTiming"
              @done="handleAssistantCompleteDone"
            />
            <RiskDeltaPanel
              v-if="hasShownAssistantCompleteDetails"
              class="mb-3"
              :summary="scenarioData.riskDeltaSummary"
            />
            <p v-if="hasShownAssistantCompleteDetails" class="text-secondary true-small mb-3">
              {{ completedActionsCount }} action{{ completedActionsCount === 1 ? "" : "s" }} completed successfully.
            </p>
            <template v-if="hasShownAssistantCompleteDetails">
              <hr class="my-4">
              <IvyTypewriterMessage
                class="assistant-chat-message ivy-chat-width mb-0"
                :markup="scenarioMessages.demoOutro"
                rerun-key="assistant-demo-outro"
                :timing="typingTiming"
                @done="handleAssistantDemoOutroDone"
              />
            </template>
            <div v-if="hasShownAssistantOutroDetails" class="row g-3 mt-1">
              <div class="col-sm-6">
                <RouterLink
                  to="/"
                  class="d-block text-decoration-none text-dark bg-light border p-3 rounded d-flex align-items-center"
                >
                  <h6 class="mb-1">Take Me Home</h6>
                  <img src="../assets/arrow-right-c-dark.svg" height="16" width="16" class="opacity-75 ms-auto">
                </RouterLink>
              </div>
              <div class="col-sm-6">
                <RouterLink
                  to="/ivy-in-action"
                  class="d-block text-decoration-none text-dark bg-light border p-3 rounded d-flex align-items-center"
                >
                  <h6 class="mb-1">Try another demo prompt</h6>
                  <img src="../assets/arrow-right-c-dark.svg" height="16" width="16" class="opacity-75 ms-auto">
                </RouterLink>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>

    <Transition name="what-ivy-launcher-fade-slide">
      <div v-if="phase === 'entry'" ref="launcherEl" class="what-ivy-chat-launcher">
        <div class="chat-content">
          <div class="mb-5 text-center">
            <h2 class="fw-semibold mb-1">
              Ivy <span class="text-primary">in Action</span>
            </h2>
            <h5 class="fw-normal mb-0 d-flex align-items-center justify-content-center">
              <span>Explore Ivy with some curated</span>
              <img src="../assets/sample-flask.svg" height="40" width="40" class="sample-flask">
              <span>sample data.</span>
            </h5>
          </div>

          <ChatBox
            ref="topPromptChatBox"
            class="w-100"
            :show-quick-actions="false"
            submit-label="Run Demo"
            disable-input-mouse-interactions
            input-disabled-tooltip="This chat is for demonstration purposes. Please select a prompt below to see Ivy in action."
            chat-placeholder="Select a prompt below to see Ivy in action..."
            :force-submit-active="forceSubmitActive"
            :force-submit-hover="forceSubmitHover"
            @submit="startDemo"
          >
            <template #below-content>
              <Transition name="what-ivy-choice-fade">
                <div class="mt-4 mb-5">
                  <div class="row g-3 mb-3">
                    <div 
                      v-for="queryOption in queryOptions"
                      :key="queryOption.key"
                      class="col-4"
                    >
                      <div 
                        class="rounded border cursor-pointer p-4 bg-chat-highlight h-100 d-flex justify-content-start align-items-center"
                        :class="{ 'what-ivy-query-option--active': activeScenarioKey === queryOption.key }"
                        @click="chooseQuery(queryOption, $event)"
                      >
                        <h6 class="fw-medium mb-0 text-start">
                          {{ queryOption.query }}
                        </h6>
                        <!-- <img src="../assets/arrow-right-c-dark.svg" height="16" width="16" class="opacity-75"> -->
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </template>
          </ChatBox>
        </div>
        <img
          v-if="showDemoCursor"
          :src="CursorClickIcon"
          alt=""
          class="what-ivy-demo-cursor"
          :class="{
            'what-ivy-demo-cursor--fading': demoCursorFading,
            'what-ivy-demo-cursor--moving': demoCursorMoving,
            'what-ivy-demo-cursor--visible': demoCursorVisible,
          }"
          :style="demoCursorStyle"
        >
      </div>
    </Transition>
  </section>
</template>

<style scoped lang="scss">
.what-ivy-page {
  min-height: calc(100vh - 2rem);
  padding-bottom: 11rem;
  padding-top: 2rem;
}

.what-ivy-chat-flow {
  padding-top: 1rem;
}

.what-ivy-chat-launcher {
  left: calc(#{$left-nav-closed-width} + ((100vw - #{$left-nav-closed-width} - #{$content-inset}) / 2));
  max-width: 52rem;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.35s ease-in-out;
  width: min(52rem, calc(100vw - #{$left-nav-closed-width} - #{$content-inset} - 6rem));
  z-index: 15;

  .left-nav-open & {
    left: calc(#{$left-nav-open-width} + ((100vw - #{$left-nav-open-width} - #{$content-inset}) / 2));
    width: min(52rem, calc(100vw - #{$left-nav-open-width} - #{$content-inset} - 6rem));
  }
}

.what-ivy-demo-cursor {
  height: 28px;
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translate(var(--demo-cursor-start-x), var(--demo-cursor-start-y));
  transition: opacity 0.17s ease-in-out, transform 0.92s ease-in-out;
  width: 28px;
  z-index: 20;
}

.what-ivy-demo-cursor--visible {
  opacity: 1;
}

.what-ivy-demo-cursor--moving {
  transform: translate(var(--demo-cursor-end-x), var(--demo-cursor-end-y));
}

.what-ivy-demo-cursor--fading {
  opacity: 0;
}

.what-ivy-inline-question {
  margin-bottom: 0.75rem;
}

.what-ivy-followup-option {
  font-size: 0.9375rem;
  max-width: 84%;
  text-align: left;
}

.what-ivy-inline-toggle {
  text-decoration: none;
}

.what-ivy-inline-toggle:hover {
  color: var(--bs-gray-600) !important;
}

.what-ivy-inline-toggle__icon {
  transition: transform 0.2s ease-in-out;
}

.what-ivy-inline-toggle__icon--expanded {
  transform: rotate(180deg);
}

.what-ivy-table-toggle {
  font-size: 0.875rem;
  line-height: 1.2;

  &:hover {
    color: var(--bs-secondary-color) !important;
  }
}

.what-ivy-query-option--active {
  border-color: #465FFF !important;
  box-shadow: inset 0 0 0 1px #465FFF;
}

.what-ivy-user-action {
  background-color: var(--bs-white);
}

.what-ivy-table__row {
  animation: what-ivy-row-in 0.22s ease-out forwards;
  animation-delay: var(--row-delay, 0ms);
  opacity: 0;
  transform: translateY(4px);
}

.what-ivy-source-chip {
  animation: what-ivy-chip-in 0.22s ease-out forwards;
  animation-delay: var(--chip-delay, 0ms);
  opacity: 0;
  transform: translateY(4px);
}

.what-ivy-choice-fade-enter-active,
.what-ivy-choice-fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.what-ivy-choice-fade-enter-from,
.what-ivy-choice-fade-leave-to {
  opacity: 0;
}

.what-ivy-launcher-fade-slide-enter-active,
.what-ivy-launcher-fade-slide-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.35s ease-in-out;
}

.what-ivy-launcher-fade-slide-enter-from,
.what-ivy-launcher-fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -35%);
}

.what-ivy-launcher-fade-slide-enter-to,
.what-ivy-launcher-fade-slide-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}

@keyframes what-ivy-row-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes what-ivy-chip-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .what-ivy-chat-launcher {
    left: 50%;
    max-width: none;
    width: calc(100vw - 2rem);
  }
}

.sample-flask {
  margin-bottom: -0.25rem;
  margin-left: -0.125rem;
  margin-right: -0.125rem;
  margin-top: -0.25rem;
}

.close-demo-btn {
  align-items: center;
  display: flex;
  height: 2.5rem;
  justify-content: center;
  margin-right: -1rem;
  line-height: 2.5rem;
}
</style>
