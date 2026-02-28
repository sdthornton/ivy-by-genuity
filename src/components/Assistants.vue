// src/components/Assistants.vue

<script setup>

import typewriter from "../utils/typewriter";
import ContentHeader from "./shared/ContentHeader.vue";
import ChatBox from "./shared/ChatBox.vue";
import Step2Info  from "./assistants/step2Info.vue";
import AssistantBuilder from "./assistants/AssistantBuilder.vue";
import StepOptionsDropdown from "./shared/StepOptionsDropdown.vue";
import { MOCK_STEP_COUNT } from "./assistants/mockSteps";
import iconClock from "../assets/clock.svg";
import iconStar from "../assets/star.svg";
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from "vue";

// Most of this is mock work to demo the chat response and scroll functionality

const PREVIEW_ALL_MESSAGES = true; // temporary visual-tuning mode
const buildStep = ref(PREVIEW_ALL_MESSAGES ? MOCK_STEP_COUNT : 0);
const showSidebar = ref(PREVIEW_ALL_MESSAGES);
const selectedSidebarStepId = ref(2);
const assistantTitle = ref(PREVIEW_ALL_MESSAGES ? "SharePoint Audit" : "New Assistant");
const chatContent = ref(null);
const conversationContent = ref(null);
const conversationScroller = ref(null);
const userStep1 = ref(null);
const ivyStep1 = ref(null);
const userStep2 = ref(null);
const ivyStep2 = ref(null);
const DEFAULT_TRIGGER_OPTION = { key: "weekdays", label: "Weekdays at 9:00 am", pillLabel: "Weekdays at 9:00 am", icon: iconClock, iconClass: "opacity-50" };
const selectedHeaderTrigger = ref(PREVIEW_ALL_MESSAGES ? { ...DEFAULT_TRIGGER_OPTION } : null);

const headerTriggerOptions = [
  { key: "every-day", label: "Every day", pillLabel: "Every day at 9:00 am", icon: iconClock, iconClass: "opacity-50" },
  { key: "every-week", label: "Every week", pillLabel: "Every week on Monday", icon: iconClock, iconClass: "opacity-50" },
  { key: "every-month", label: "Every month", pillLabel: "Every month on the 1st", icon: iconClock, iconClass: "opacity-50" },
  { key: "custom", label: "Custom Timing", pillLabel: "Custom schedule", icon: iconClock, iconClass: "opacity-50" },
  { key: "event", label: "When an event occurs", pillLabel: "When an event occurs", icon: iconStar, iconClass: "" },
];

const hasConfiguredHeaderTrigger = computed(() => Boolean(selectedHeaderTrigger.value));
const headerTriggerLabel = computed(() => selectedHeaderTrigger.value?.pillLabel || "Draft, Not Scheduled");

const selectHeaderTrigger = (option, close) => {
  selectedHeaderTrigger.value = { ...option };
  close();
};

watch(buildStep, async (newStep) => {
  if (PREVIEW_ALL_MESSAGES) return;

  if (newStep === 0) {
    assistantTitle.value = "New Assistant";
  } else if (newStep >= 1) {
    assistantTitle.value = "SharePoint Audit";
    if (!selectedHeaderTrigger.value) {
      selectedHeaderTrigger.value = { ...DEFAULT_TRIGGER_OPTION };
    }
  }

  if (newStep === 1) {
    await nextTick();
    
    const userChat = userStep1.value.cloneNode(true);
    userChat.classList.remove("d-none");
    conversationContent.value.appendChild(userChat);
    
    await nextTick();

    const ivyChat = ivyStep1.value.cloneNode(true);
    const ivyChatContent = ivyChat.innerHTML;
    ivyChat.innerHTML = "";
    ivyChat.classList.remove("d-none");
    conversationContent.value.appendChild(ivyChat);
    await typewriter(ivyChat, ivyChatContent);
  }

  if (newStep === 2) {
    const { paddingTop, paddingBottom } = getComputedStyle(conversationScroller.value);
    const extraHeight = chatContent.value.offsetHeight - parseInt(paddingBottom, 10) - parseInt(paddingTop, 10);
    conversationContent.value.style.minHeight = `${conversationContent.value.offsetHeight + extraHeight}px`;

    await nextTick();

    const userChat = userStep2.value.cloneNode(true);
    userChat.classList.remove("d-none");
    conversationContent.value.appendChild(userChat);
    
    await nextTick();

    const ivyChat = ivyStep2.value.cloneNode(true);
    const ivyChatContent = ivyChat.innerHTML;
    ivyChat.innerHTML = "";
    ivyChat.classList.remove("d-none");
    conversationContent.value.appendChild(ivyChat);
    await typewriter(ivyChat, ivyChatContent);
  }
});


let chatScrollEl, scrollObserver;

const appendAllMessages = () => {
  const content = conversationContent.value;
  if (!content) return;

  [userStep1, ivyStep1, userStep2, ivyStep2].forEach((tpl) => {
    if (!tpl?.value) return;
    const message = tpl.value.cloneNode(true);
    message.classList.remove("d-none");
    content.appendChild(message);
  });
};

onMounted(async () => {
  if (PREVIEW_ALL_MESSAGES) {
    await nextTick();
    appendAllMessages();
    return;
  }

  chatScrollEl = conversationScroller.value;
  scrollObserver = new MutationObserver(() => {
    chatScrollEl.scrollTop = chatScrollEl.scrollHeight;
  });
  scrollObserver.observe(chatScrollEl, { childList: true, subtree: true });
});

onBeforeUnmount(() => { 
  scrollObserver?.disconnect();
});

const onBuilderStepSelect = (nodeId) => {
  selectedSidebarStepId.value = Number(nodeId) || selectedSidebarStepId.value;
  showSidebar.value = true;
};

</script> 

<template>
  <section class="left-content d-flex flex-column" ref="chatContent">
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
        @click="!PREVIEW_ALL_MESSAGES && (buildStep += 1)"
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
              :src="option.icon"
              width="14"
              height="14"
              class="me-2 flex-shrink-0"
              :class="option.iconClass"
            >
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
        <button class="btn btn-sm reduced px-2.5 rounded-sm d-inline-flex align-items-center" style="margin-right: -0.5rem;">
          <img src="../assets/ellipses.svg" height="24" width="24">
        </button>
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
        class="col-auto side-content bg-white"
      >
        <Step2Info :selected-step-id="selectedSidebarStepId" @close="showSidebar = false" />
      </article>
    </div>
  </section>

  <!-- A bunch of mock content templates below -->
  <article ref="userStep1" class="d-none user-chat-bubble rounded px-3 py-2 reduced mb-4">
    I'd like to make an assistant that sends me a daily list of my SharePoint audit items.
  </article>

  <article ref="ivyStep1" class="d-none">
    <p>Got it — you want an automation that, <strong>every day</strong>, sends you a list of <strong>any SharePoint audit items</strong>. Let’s make it happen.</p>
    <p>First, I want to make sure we’re talking about the same “audit items.”</p>
    <h5 class="fw-semibold">Where do these audit items live?</h5>
    <p>Are your “audit items”:</p>
    <ul>
      <li>A <strong>SharePoint List</strong> named something like Audit (custom list your org uses), or</li>
      <li>A <strong>Microsoft 365 audit log</strong> (that’s a different connector/path), or</li>
      <li>A <strong>Document Library</strong> where “audit items” are files?</li>
    </ul>
    <p>If it’s a SharePoint list, tell me the list name (even roughly), and I’ll assume we’re pulling list rows.</p>
  </article>

  <article ref="userStep2" class="d-none user-chat-bubble rounded px-3 py-2 reduced my-4">
    It's a SharePoint list called "SP GetAudit".
  </article>

  <article ref="ivyStep2" class="d-none">
    <p>Great! I'll adjust the builder to pull from the "SP GetAudit" list. I'll also set it to pull any items created yesterday, since you mentioned you want a daily list. Does that sound right?</p>
  </article>
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
  height: calc(3.5rem + 1px);
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
</style>
