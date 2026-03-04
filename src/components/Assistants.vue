// src/components/Assistants.vue

<script setup>

import typewriter from "../utils/typewriter";
import ContentHeader from "./shared/ContentHeader.vue";
import ChatBox from "./shared/ChatBox.vue";
import StepInfo  from "./assistants/StepInfo.vue";
import AssistantBuilder from "./assistants/AssistantBuilder.vue";
import AssistantSettingsPanel from "./assistants/AssistantSettingsPanel.vue";
import StepOptionsDropdown from "./shared/StepOptionsDropdown.vue";
import iconClock from "../assets/clock.svg";
import iconStar from "../assets/star.svg";
import iconStop from "../assets/stop.svg";
import { ref, nextTick, onMounted, onBeforeUnmount, computed, reactive } from "vue";

const buildStep = ref(0);
const showSidebar = ref(false);
const selectedSidebarStepId = ref(1);
const assistantSettings = reactive({
  title: "New Assistant",
  description: "",
  creator: "You",
  ownerTeam: "Security Team",
  permissions: "Workspace editors",
  status: "Draft",
  category: "security",
  updatedAt: "Mar 3, 9:00am",
});
const conversationContent = ref(null);
const conversationScroller = ref(null);
const DEFAULT_TRIGGER_OPTION = { key: "weekdays", label: "Weekdays at 9:00 am", pillLabel: "Weekdays at 9:00am", icon: iconClock, iconClass: "opacity-50" };
const NO_TRIGGER_OPTION = { key: "none", label: "No trigger", icon: iconStop, iconClass: "opacity-50" };
const selectedHeaderTrigger = ref(null);
const conversationStageIndex = ref(0);
const isConversationBusy = ref(false);
let activeTypewriterController = null;

const headerTriggerOptions = [
  { key: "every-day", label: "Every day", pillLabel: "Every day at 9am", icon: iconClock, iconClass: "opacity-50" },
  { key: "weekdays", label: "Weekdays", pillLabel: "Weekdays at 9am", icon: iconClock, iconClass: "opacity-50" },
  { key: "every-week", label: "Every week", pillLabel: "Every week on Monday at 9am", icon: iconClock, iconClass: "opacity-50" },
  { key: "every-month", label: "Every month", pillLabel: "Every month on the 1st at 9am", icon: iconClock, iconClass: "opacity-50" },
  { key: "custom", label: "Custom Timing", pillLabel: "Custom schedule", icon: iconClock, iconClass: "opacity-50" },
  { key: "event", label: "When an event occurs", pillLabel: "When an event occurs", icon: iconStar, iconClass: "opacity-50" },
  NO_TRIGGER_OPTION,
];
const pageMoreOptions = [
  "Settings",
  "Permissions",
  "Sharing",
  "Make a Copy",
];

const assistantTitle = computed({
  get: () => assistantSettings.title || "New Assistant",
  set: (value) => {
    assistantSettings.title = value || "";
  },
});

const hasConfiguredHeaderTrigger = computed(() => (
  Boolean(selectedHeaderTrigger.value && selectedHeaderTrigger.value.key !== NO_TRIGGER_OPTION.key)
));
const headerTriggerLabel = computed(() => selectedHeaderTrigger.value?.pillLabel || "Draft, Not Scheduled");

const selectHeaderTrigger = (option, close) => {
  selectedHeaderTrigger.value = { ...option };
  close();
};

const INTRO_MESSAGE = `
  <p>Hi! I'm here to help you build your assistant. You can still build out your flow on your own, but you can also chat with me and I'll automatically build things out for you to review.</p>
`;

const conversationStages = [
  {
    user: "I want an assistant that sends a daily summary of recent SharePoint audit activity.",
    ivy: `
      <p>Good direction. I can help you build that out step by step.</p>
      <p>First, what should we call the assistant, and should it run every weekday or every single day?</p>
    `,
  },
  {
    user: "Call it SharePoint Audit and run it every weekday at 9:00 am.",
    ivy: `
      <p>Perfect. I set the assistant name and added a weekday morning schedule.</p>
      <p>Next, tell me where the audit data lives so I can wire up the lookup step.</p>
    `,
    state: {
      assistantTitle: "SharePoint Audit",
      assistantDescription: "Send a weekday summary of recent SharePoint audit activity from SharePoint.",
      buildStep: 1,
      selectedSidebarStepId: 1,
      selectedHeaderTrigger: DEFAULT_TRIGGER_OPTION,
      showSidebar: true,
    },
  },
  {
    user: 'Use the SharePoint list named "SP GetAudit".',
    ivy: `
      <p>Added. I'm pulling from the <strong>SP GetAudit</strong> list now.</p>
      <p>I also set up the lookup so we can focus the flow on recent audit activity. Do you want me to clean up anything older than a week after the lookup runs?</p>
    `,
    state: {
      buildStep: 2,
      selectedSidebarStepId: 2,
      showSidebar: true,
    },
  },
  {
    user: "Yes. Delete anything older than seven days after the lookup runs.",
    ivy: `
      <p>Done. I added a code step to prune old audit data after the lookup completes.</p>
      <p>Last piece: where should the final summary go once the list is ready?</p>
    `,
    state: {
      buildStep: 3,
      selectedSidebarStepId: 3,
      showSidebar: true,
    },
  },
  {
    user: "Email the daily audit summary to the Security Team.",
    ivy: `
      <p>Done. I added the final Ivy action to email the summary to the Security Team.</p>
      <p>Your full flow is ready for review: schedule it, pull the SharePoint audit list, prune older items, then send the summary.</p>
    `,
    state: {
      buildStep: 4,
      assistantDescription: "Build a weekday SharePoint audit summary by scheduling the flow, pulling SP GetAudit data, pruning anything older than seven days, and emailing the Security Team.",
      selectedSidebarStepId: 4,
      showSidebar: true,
    },
  },
];

function scrollConversationToBottom() {
  const scroller = conversationScroller.value;
  if (!scroller) {
    return;
  }

  scroller.scrollTop = scroller.scrollHeight;
}

function appendUserMessage(text) {
  const content = conversationContent.value;
  if (!content) {
    return;
  }

  const article = document.createElement("article");
  article.className = "user-chat-bubble rounded bg-iceberg-blue px-3 py-2 mb-4";
  article.textContent = text;
  content.appendChild(article);
  scrollConversationToBottom();
}

async function appendIvyMessage(markup) {
  const content = conversationContent.value;
  if (!content) {
    return;
  }

  const article = document.createElement("article");
  article.className = "assistant-chat-message mb-4";
  content.appendChild(article);
  scrollConversationToBottom();

  const controller = new AbortController();
  activeTypewriterController?.abort();
  activeTypewriterController = controller;

  try {
    await typewriter(article, markup, {
      clearElementFirst: true,
      onUpdate: scrollConversationToBottom,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name !== "AbortError") {
      throw error;
    }
  } finally {
    if (activeTypewriterController === controller) {
      activeTypewriterController = null;
    }
  }

  scrollConversationToBottom();
}

function applyConversationState(state = {}) {
  if (typeof state.buildStep === "number") {
    buildStep.value = state.buildStep;
  }

  if ("assistantTitle" in state) {
    assistantTitle.value = state.assistantTitle;
  }

  if ("assistantDescription" in state) {
    assistantSettings.description = state.assistantDescription;
  }

  if (typeof state.selectedSidebarStepId === "number") {
    selectedSidebarStepId.value = state.selectedSidebarStepId;
  }

  if ("showSidebar" in state) {
    showSidebar.value = state.showSidebar;
  }

  if ("selectedHeaderTrigger" in state) {
    selectedHeaderTrigger.value = state.selectedHeaderTrigger ? { ...state.selectedHeaderTrigger } : null;
  }
}

async function advanceConversation() {
  if (isConversationBusy.value || conversationStageIndex.value >= conversationStages.length) {
    return;
  }

  const stage = conversationStages[conversationStageIndex.value];
  isConversationBusy.value = true;

  try {
    appendUserMessage(stage.user);
    await appendIvyMessage(stage.ivy);
    applyConversationState(stage.state);
    conversationStageIndex.value += 1;
  } finally {
    isConversationBusy.value = false;
  }
}

async function initializeConversation() {
  await nextTick();
  await appendIvyMessage(INTRO_MESSAGE);
};

onMounted(async () => {
  await initializeConversation();
});

onBeforeUnmount(() => { 
  activeTypewriterController?.abort();
});

const onBuilderStepSelect = (nodeId) => {
  selectedSidebarStepId.value = Number(nodeId) || selectedSidebarStepId.value;
  showSidebar.value = true;
};

</script> 

<template>
  <section class="left-content d-flex flex-column">
    <div class="small-chat-header border-bottom pe-4 mb-4">
      <h5 class="mb-0 mr-2 d-flex align-items-center fw-normal lead">
        <!-- <img src="../assets/nav-chat.svg" class="me-2 opacity-50" width="16" height="16"> -->
        <span class="me-2">Ivy Builder:</span>
        <span class="fw-semibold me-2">{{ assistantTitle }}</span> 
      </h5>
      <span class="ms-auto h4 mb-0 text-body-secondary fw-normal">&times;</span>
    </div>
    <div class="conversation-outer-wrapper text-black px-4" ref="conversationScroller">
      <div class="conversation-inner-wrapper px-2.5 pt-4" ref="conversationContent" />
    </div>
    <div class="chat-box-wrapper mt-auto">
      <ChatBox 
        class="w-100"
        :show-quick-actions="false" 
        @click="advanceConversation"
      />
    </div>
  </section>
  <section class="main-content d-flex flex-column">
    <ContentHeader class="assistant-page-header">
      <div class="assistant-header-primary min-w-0 d-flex align-items-center">
        <div class="d-flex align-items-center me-4">
          <span class="mx-3 text-secondary reduced flex-shrink-0">&rsaquo;</span>
          <span class="assistant-header-title fw-medium text-truncate">{{ assistantTitle }}</span>
          <img src="../assets/edit.svg" height="12" width="12" class="assistant-header-title-edit ms-2 opacity-25 flex-shrink-0">
        </div>
        <StepOptionsDropdown class="assistant-header-trigger" placement="bottom-start" menu-class="header-trigger-menu">
          <template #trigger>
            <span
              class="header-trigger-pill rounded-sm true-small fw-normal d-inline-flex align-items-center justify-content-center"
              :class="hasConfiguredHeaderTrigger ? 'header-trigger-pill--configured text-white' : 'header-trigger-pill--draft bg-secondary-subtle text-secondary'"
            >
              <img
                v-if="hasConfiguredHeaderTrigger"
                :src="selectedHeaderTrigger?.icon || iconClock"
                width="16"
                height="16"
                class="me-1 invert-to-white header-trigger-pill__icon"
              >
              <span class="header-trigger-pill__label">{{ headerTriggerLabel }}</span>
              <img
                src="../assets/arrow-down-b.svg"
                width="12"
                height="12"
                class="ms-2 header-trigger-pill__arrow"
                :class="{ 'invert-to-white': hasConfiguredHeaderTrigger }"
              >
            </span>
          </template>
          <template #menu="{ close }">
            <button
              v-for="option in headerTriggerOptions"
              :key="option.key"
              type="button"
              class="dropdown-item text-start d-flex align-items-center"
              @click="selectHeaderTrigger(option, close)"
            >
              <img
                v-if="option.icon"
                :src="option.icon"
                width="14"
                height="14"
                class="me-2 flex-shrink-0"
                :class="option.iconClass"
              >
              <span v-else class="me-2 d-inline-block flex-shrink-0" style="width: 14px; height: 14px;" aria-hidden="true" />
              {{ option.label }}
            </button>
          </template>
        </StepOptionsDropdown>
      </div>
      <div class="assistant-header-actions d-flex align-items-center flex-shrink-0">
        <button class="assistant-header-action-btn assistant-header-action-btn--test btn btn-sm btn-white border reduced px-2.5 rounded-sm me-2 d-inline-flex align-items-center">
          <img src="../assets/test.svg" height="14" width="14" class="assistant-header-action-icon me-2 opacity-75">
          <span class="assistant-header-action-label assistant-header-action-label--test">Test & Preview</span>
        </button>
        <button class="assistant-header-action-btn assistant-header-action-btn--run btn btn-sm btn-white border reduced px-2.5 rounded-sm me-3 d-inline-flex align-items-center">
          <img src="../assets/play.svg" height="14" width="14" class="assistant-header-action-icon me-2 opacity-75">
          <span class="assistant-header-action-label assistant-header-action-label--run">Run</span>
        </button>
        <button class="assistant-header-action-btn assistant-header-action-btn--save btn btn-sm true-small btn-primary rounded-sm px-2.5 fw-medium d-inline-flex align-items-center me-2">
          <img src="../assets/checkmark.svg" height="14" width="14" class="me-2 opacity-75 invert-to-white">
          <span class="assistant-header-save-label assistant-header-save-label--long">Save Assistant</span>
          <span class="assistant-header-save-label assistant-header-save-label--short">Save</span>
        </button>
        <StepOptionsDropdown placement="bottom-end" menu-class="page-header-more-menu">
          <template #trigger>
            <button
              type="button"
              class="btn btn-sm reduced px-2.5 rounded-sm d-inline-flex align-items-center"
              style="margin-right: -1rem;"
              aria-label="More options"
            >
              <img src="../assets/ellipses.svg" height="24" width="24" style="transform: rotate(90deg);">
            </button>
          </template>
          <template #menu="{ close }">
            <button
              v-for="option in pageMoreOptions"
              :key="option"
              type="button"
              class="dropdown-item text-start"
              @click="close()"
            >
              {{ option }}
            </button>
          </template>
        </StepOptionsDropdown>
      </div>
    </ContentHeader>
      
    <div class="row mx-0 flex-grow-1 ">
      <AssistantBuilder 
        class="col p-4" 
        :current-builder-step="buildStep" 
        @toggleSidebar="onBuilderStepSelect"
      />
      <article 
        v-if="showSidebar"
        class="col-auto px-0 side-content bg-white"
      >
        <StepInfo :selected-step-id="selectedSidebarStepId" @close="showSidebar = false" />
      </article>
    </div>
  </section>
  <aside class="settings-content">
    <AssistantSettingsPanel
      :settings="assistantSettings"
      :trigger-label="headerTriggerLabel"
      :trigger-configured="hasConfiguredHeaderTrigger"
      :trigger-icon="selectedHeaderTrigger?.icon || iconClock"
    />
  </aside>
</template>

<style lang="scss" scoped>

:global(.split-content-page .page-content) {
  display: flex;
  height: 100%;
  overflow: hidden;
}

:deep(.assistant-page-header) {
  container-type: inline-size;
  flex-wrap: nowrap;
  min-width: 0;
  overflow: hidden;
}

.left-content,
.settings-content {
  background-color: white;
  box-shadow: 0 0 18px -4px rgba(0,0,0,0.15);
  height: 100%;
  position: relative;
  z-index: 2;
}

.left-content {
  border-right: 1px solid var(--bs-gray-200);
  overflow: visible;
  width: 24rem;
}

.settings-content {
  background-color: none;
  border-bottom-left-radius: 1rem;
  border-top-left-radius: 1rem;
  box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.20);
  bottom: 0;
  display: flex;
  flex-direction: column;
  max-width: 95%;
  min-width: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  width: 32rem;

  &:before {
    background-color: rgba(0,0,0,0.35);
    content: "";
    inset: 0;
    position: fixed;
    z-index: -1;
  }
}

.main-content {
  // box-shadow: 
  //   0px 0.5px 0.6px hsl(0deg 0% 0% / 0.11),
  //   0px 1.6px 1.8px -0.8px hsl(0deg 0% 0% / 0.11),
  //   0px 3.9px 4.4px -1.7px hsl(0deg 0% 0% / 0.11),
  //   0.1px 9.5px 10.7px -2.5px hsl(0deg 0% 0% / 0.11);
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.main-content > .row {
  min-height: 0;
}

.assistant-header-primary {
  flex: 1 1 auto;
  min-width: 0;
}

.assistant-header-title {
  min-width: 0;
}

.assistant-header-trigger {
  flex: 0 1 auto;
  min-width: 0;
}

.assistant-header-actions {
  margin-left: auto;
  white-space: nowrap;
}

.assistant-header-action-btn {
  flex-shrink: 0;
}

.assistant-header-save-label--short {
  display: none;
}

.right-content,
.side-content {
  box-shadow: 0 0 18px -4px rgba(0,0,0,0.15);
  width: 22rem;
  z-index: 3;
}

.side-content {
  box-shadow: none;
  border-left: 1px solid var(--bs-gray-200);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.user-chat-bubble {
  background-color: var(--bs-gray-200);
  background-color: $iceberg-blue;
  margin-left: auto;
  max-width: 84%;
  width: fit-content;
}

// Below is css that is unique to this page, and should not be moved into the global split-content component

.left-content {
  display: flex;
  flex-direction: row;
}

.small-chat-header {
  align-items: center;
  background-color: white;
  display: flex;
  height: 3.25rem;
  left: 0;
  padding-left: 4rem;
  position: absolute;
  right: 0;
  top: 0;
}

.chat-box-wrapper {
  background-color: white;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  padding: 0 0 1.5rem;
  position: absolute;
}

.conversation-outer-wrapper {
  overflow: hidden scroll;
  padding-bottom: 6.625rem; // height of the chat box + some padding 
  padding-top: 3.5rem;

  article *:last-child {
    margin-bottom: 0;
  }
}

.conversation-outer-wrapper,
.conversation-inner-wrapper {
  min-height: 100%;
  scroll-behavior: smooth;
}

.header-trigger-pill {
  cursor: pointer;
  min-height: 1.75rem;
  min-width: 0;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
}

.header-trigger-pill--configured {
  background-color: rgb(123, 104, 238);
}

.header-trigger-pill__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-trigger-pill__arrow {
  display: block;
}

:deep(.header-trigger-menu) {
  min-width: 14rem;
  padding: 0.65rem;
}

:deep(.header-trigger-menu) .dropdown-item {
  background: transparent;
  border: 0;
  width: 100%;
}

:deep(.page-header-more-menu) {
  min-width: 12rem;
  padding: 0.35rem 0;
}

:deep(.page-header-more-menu) .dropdown-item {
  background: transparent;
  border: 0;
  width: 100%;
}

@container (max-width: 70rem) {
  .assistant-header-save-label--long {
    display: none;
  }

  .assistant-header-save-label--short {
    display: inline;
  }
}

@container (max-width: 62rem) {
  .assistant-header-action-label--test,
  .assistant-header-action-label--run {
    display: none;
  }

  .assistant-header-action-btn--test,
  .assistant-header-action-btn--run {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }

  .assistant-header-action-btn--test .assistant-header-action-icon,
  .assistant-header-action-btn--run .assistant-header-action-icon {
    margin-right: 0 !important;
  }
}

@container (max-width: 56rem) {
  .header-trigger-pill {
    font-size: 0.625rem;
    min-height: 1.5rem;
    padding: 0.2rem 0.4rem;
  }

  .assistant-header-trigger {
    margin-left: 0.75rem !important;
  }

  .header-trigger-pill__icon {
    height: 14px;
    width: 14px;
  }

  .header-trigger-pill__arrow {
    height: 10px;
    margin-left: 0.35rem !important;
    width: 10px;
  }
}
</style>
