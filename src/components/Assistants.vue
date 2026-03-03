// src/components/Assistants.vue

<script setup>

import typewriter from "../utils/typewriter";
import ContentHeader from "./shared/ContentHeader.vue";
import ChatBox from "./shared/ChatBox.vue";
import Step2Info  from "./assistants/step2Info.vue";
import AssistantBuilder from "./assistants/AssistantBuilder.vue";
import StepOptionsDropdown from "./shared/StepOptionsDropdown.vue";
import iconClock from "../assets/clock.svg";
import iconStar from "../assets/star.svg";
import iconStop from "../assets/stop.svg";
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from "vue";

const buildStep = ref(0);
const showSidebar = ref(false);
const selectedSidebarStepId = ref(1);
const assistantTitle = ref("New Assistant");
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
  "Clone",
];

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
    <ContentHeader>
      <span class="mx-3 text-secondary reduced">&rsaquo;</span>
      <span class="fw-medium">{{ assistantTitle }}</span>
      <img src="../assets/edit.svg" height="12" width="12" class="ms-2 opacity-25">
      <StepOptionsDropdown class="mx-4" placement="bottom-start" menu-class="header-trigger-menu">
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
              class="me-1 invert-to-white"
            >
            <span>{{ headerTriggerLabel }}</span>
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
      <span class="ms-auto">
        <button class="btn btn-sm reduced px-2.5 rounded-sm me-2 d-inline-flex align-items-center">
          <img src="../assets/test.svg" height="12" width="12" class="me-2 opacity-50">
          Test & Preview
        </button>
        <button class="btn btn-sm reduced bg-dark-subtle px-2.5 rounded-sm me-3 d-inline-flex align-items-center">
          <img src="../assets/play.svg" height="12" width="12" class="me-2 opacity-50">
          Run
        </button>
        <button class="btn btn-sm reduced btn-primary rounded-sm px-3 fw-medium d-inline-flex align-items-center me-2">
          <img src="../assets/checkmark.svg" height="14" width="14" class="me-2 opacity-5 invert-to-white">
          Save Assistant
        </button>
        <StepOptionsDropdown placement="bottom-end" menu-class="page-header-more-menu">
          <template #trigger>
            <button
              type="button"
              class="btn btn-sm reduced px-2.5 rounded-sm d-inline-flex align-items-center"
              style="margin-right: -0.5rem;"
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
      </span>
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
        <Step2Info :selected-step-id="selectedSidebarStepId" @close="showSidebar = false" />
      </article>
    </div>
  </section>
</template>

<style lang="scss" scoped>

:global(.split-content-page .page-content) {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.left-content {
  background-color: white;
  box-shadow: 0 0 18px -4px rgba(0,0,0,0.15);
  border-right: 1px solid var(--bs-gray-200);
  height: 100%;
  overflow: visible;
  position: relative;
  width: 24rem;
  z-index: 2;
}

.main-content {
  // box-shadow: 
  //   0px 0.5px 0.6px hsl(0deg 0% 0% / 0.11),
  //   0px 1.6px 1.8px -0.8px hsl(0deg 0% 0% / 0.11),
  //   0px 3.9px 4.4px -1.7px hsl(0deg 0% 0% / 0.11),
  //   0.1px 9.5px 10.7px -2.5px hsl(0deg 0% 0% / 0.11);
  flex: 1;
  z-index: 1;
}

.main-content > .row {
  min-height: 0;
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
  padding: 0.25rem 0.5rem;
}

.header-trigger-pill--configured {
  background-color: rgb(123, 104, 238);
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
</style>
