// src/components/Assistants.vue

<script setup>

import typewriter from "../utils/typewriter";
import ContentHeader from "./shared/ContentHeader.vue";
import ChatBox from "./shared/ChatBox.vue";
import AssistantBuilder from "./assistants/AssistantBuilder.vue";
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";

// Most of this is mock work to demo the chat response and scroll functionality

const PREVIEW_ALL_MESSAGES = true; // temporary visual-tuning mode
const buildStep = ref(PREVIEW_ALL_MESSAGES ? 3 : 0);
const showSidebar = ref(PREVIEW_ALL_MESSAGES);
const assistantTitle = ref(PREVIEW_ALL_MESSAGES ? "SharePoint Audit" : "New Assistant");
const chatContent = ref(null);
const conversationContent = ref(null);
const conversationScroller = ref(null);
const userStep1 = ref(null);
const ivyStep1 = ref(null);
const userStep2 = ref(null);
const ivyStep2 = ref(null);
const showQueryWarning = ref(true);
const queryCode = ref("GET foo.bar");

const ignoreQueryWarning = () => {
  showQueryWarning.value = false;
};

const fixQueryWarning = () => {
  queryCode.value = "SELECT [User], [AuditValue] FROM [SP GetAudit] WHERE [User] IS NOT NULL AND [AuditValue] >= DATEADD(day, -1, GETUTCDATE())";
  showQueryWarning.value = false;
};

watch(buildStep, async (newStep) => {
  if (PREVIEW_ALL_MESSAGES) return;

  if (newStep === 0) {
    assistantTitle.value = "New Assistant";
  } else if (newStep >= 1) {
    assistantTitle.value = "SharePoint Audit";
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
      <span 
        v-if="buildStep < 1"
        class="mx-3 badge bg-secondary-subtle text-secondary true-small fw-normal px-2.5"
      >
        Draft, Not Scheduled
      </span>
      <span 
        v-else
        class="mx-4 rounded-sm text-white h6 mb-0 py-1 px-2 true-small fw-normal d-flex align-items-center justify-content-center"
        style="background-color: rgb(123, 104, 238);"
      >
        <img src="../assets/clock.svg" width="16" height="16" class="me-1 invert-to-white">
        Weekdays at 9:00 am
      </span>
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
        class="col p-5" 
        :current-builder-step="buildStep" 
        @toggleSidebar="!PREVIEW_ALL_MESSAGES && (showSidebar = !showSidebar)"
      />
      <article 
        v-if="showSidebar"
        class="col-auto side-content bg-white"
      >
        <div class="side-content-scroll d-flex flex-column align-items-start">
          <div class="bg-lookup py-0 px-2 true-small fw-medium text-white d-inline-flex align-items-center rounded-pill mb-2">
            <img src="../assets/sim-ai/lookup.svg" width="16" height="16" class="d-inline-block me-1">
            Data Source(s)
          </div>
          <div class="d-flex align-items-center">
            <h4 class="fw-bold mb-0 me-3">SP GetAudit Data</h4>
            <img src="../assets/edit.svg" height="12" width="12" class="opacity-50">
          </div>
          <div class="mt-4">
            <h6 class="fw-medium mb-1">Source(s)</h6>
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center px-2.5 py-2.5 me-2">
                <img src="../assets/sharepoint.png" height="20" width="20">
              </div>
              <div class="rounded-circle bg-white border d-flex align-items-center justify-content-center p-3 text-white fw-bold">
                <img src="../assets/plus-round.svg" height="14" width="14">
              </div>
            </div>
          </div>
          <div class="mt-4 w-100">
            <h6 class="fw-medium mb-1">Query</h6>
            <table class="table table-striped w-100 not-as-small">
              <tbody>
                <tr>
                  <td>Source Table/List</td>
                  <td>SP GetAudit</td>
                </tr>
              <tr>
                <td>Code</td>
                <td class="query-code-cell">
                  <div v-if="showQueryWarning" class="query-warning-wrap">
                    <button
                      type="button"
                      class="query-warning-trigger"
                      aria-label="Ivy warning: It looks like this code won't run as intended."
                    >
                      <img src="../assets/warning.svg" width="14" height="14" alt="">
                    </button>
                    <div class="query-warning-tooltip true-small" role="tooltip">
                      <p class="query-warning-copy mb-2">Ivy: It looks like this code won't run as intended.</p>
                      <div class="query-warning-actions">
                        <button
                          type="button"
                          class="query-warning-action query-warning-action-fix"
                          @click.stop="fixQueryWarning"
                        >
                          Fix This
                        </button>
                        <button
                          type="button"
                          class="query-warning-action query-warning-action-ignore"
                          @click.stop="ignoreQueryWarning"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                  <code>{{ queryCode }}</code>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 w-100">
            <h6 class="fw-medium mb-1">Comments</h6>
            <div class="comments-stack d-flex flex-column gap-2">
              <div class="comment-item bg-titan-white rounded-sm p-2">
                <div class="comment-author true-small mb-1">Ivy</div>
                <p class="comment-body not-as-small mb-0">
                  Using the SP GetAudit list as the source.
                </p>
                <div class="comment-meta text-end">Feb 26, 9:02 AM</div>
              </div>
              <div class="comment-item bg-titan-white rounded-sm p-2">
                <div class="comment-author true-small mb-1">You</div>
                <p class="comment-body not-as-small mb-0">
                  Confirm this should run every weekday morning.
                </p>
                <div class="comment-meta text-end">Feb 26, 9:05 AM</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ivy-says-shell pt-2 bg-white">
          <div class="ivy-says-sticky text-secondary bg-iceberg-blue p-3 rounded-sm not-as-small">
            <img src="../assets/nav-resources-alt.svg" height="16" width="16" class="me-2">
            <strong>Ivy says:</strong> This step takes a look at your <span>SharePoint</span> data for any new users in the "SP GetAudit" list that have been added since the last time this assistant was run.
          </div>
        </div>
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

.side-content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.5rem 1.5rem 9rem;
  width: 100%;
}

.comments-stack {
  width: 100%;
}

.comment-item {
  border: 1px solid var(--bs-gray-200);
}

.comment-author {
  color: var(--bs-gray-600);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.comment-body {
  color: var(--bs-gray-700);
  line-height: 1.4;
}

.comment-meta {
  color: var(--bs-gray-500);
  font-size: 0.625rem;
  line-height: 1.1;
  margin-top: 0.35rem;
}

.query-code-cell {
  position: relative;
}

.query-warning-wrap {
  position: absolute;
  right: 0.45rem;
  top: 0.45rem;
  z-index: 6;
}

.query-warning-trigger {
  background: transparent;
  border: 0;
  display: inline-flex;
  line-height: 0;
  padding: 0;
}

.query-warning-tooltip {
  background-color: #1b2434;
  border-radius: 0.35rem;
  color: #fff;
  line-height: 1.3;
  min-width: 13.5rem;
  opacity: 0;
  padding: 0.35rem 0.5rem;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 100%;
  transform: translateY(-2px);
  transition: opacity 120ms ease, transform 120ms ease;
  white-space: nowrap;
  z-index: 6;
}

.query-warning-copy {
  margin: 0;
  white-space: normal;
}

.query-warning-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

.query-warning-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  color: #fff;
  font-size: 0.625rem;
  line-height: 1;
  padding: 0.2rem 0.45rem;
}

.query-warning-action-fix {
  background: rgba(150, 210, 255, 0.25);
}

.query-warning-action-ignore {
  background: transparent;
}

.query-warning-wrap:hover .query-warning-tooltip,
.query-warning-wrap:focus-within .query-warning-tooltip,
.query-warning-tooltip:hover,
.query-warning-tooltip:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.ivy-says-shell {
  bottom: 0;
  left: 0;
  padding: 0 1.5rem 1.5rem;
  position: absolute;
  right: 0;
  z-index: 2;
}

.ivy-says-sticky {
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
</style>
