<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import typewriter from "../utils/typewriter";
import {
  hideOnboardingNavigation,
  revealOnboardingCompanyNavigation,
  revealOnboardingMainNavigation,
  revealOnboardingNavigation,
  revealOnboardingProfileNavigation,
} from "../composables/useAppLayoutState";
import { sourceOptions } from "./assistants/stepRuntime";

const router = useRouter();
const threadEl = ref(null);
const chatInput = ref(null);
const chatDraft = ref("");
const sourceSearch = ref("");
const stage = ref("name");
const messages = ref([]);
const isIvyTyping = ref(false);
const ivyMessageElementMap = new Map();

const profile = reactive({
  name: "",
  email: "",
  company: "",
  source: "",
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
let nextMessageId = 1;
const ivyTypingQueue = [];
let activeTypewriterController = null;
let isIvyQueueRunning = false;

const filteredSources = computed(() => {
  const query = sourceSearch.value.trim().toLowerCase();
  if (!query) {
    return sourceOptions;
  }

  return sourceOptions.filter((source) => source.toLowerCase().includes(query));
});

const canSend = computed(() => (
  stage.value !== "done"
  && stage.value !== "navigation"
  && !isIvyTyping.value
  && chatDraft.value.trim().length > 0
));

const inputPlaceholder = computed(() => {
  if (stage.value === "name") {
    return "Type your name";
  }

  if (stage.value === "email") {
    return "Type your work email";
  }

  if (stage.value === "company") {
    return "Type your company name";
  }

  if (stage.value === "source") {
    return "Type a source name, or type \"skip\"";
  }

  if (stage.value === "navigation") {
    return "Ivy is showing you where to navigate next";
  }

  return "Onboarding complete";
});

const stageHint = computed(() => {
  if (stage.value === "name") {
    return "Step 1 of 5: Your name.";
  }

  if (stage.value === "email") {
    return "Step 2 of 5: Your work email.";
  }

  if (stage.value === "company") {
    return "Step 3 of 5: Your company.";
  }

  if (stage.value === "source") {
    return "Step 5 of 5: Pick your first source (or skip).";
  }

  if (stage.value === "navigation") {
    return "Step 4 of 5: Navigation overview.";
  }

  return "Setup complete.";
});

function scrollToBottom() {
  nextTick(() => {
    if (!threadEl.value) {
      return;
    }
    threadEl.value.scrollTop = threadEl.value.scrollHeight;
  });
}

function pushMessage(role, text, options = {}) {
  const message = {
    id: nextMessageId,
    role,
    text,
    isComplete: role !== "ivy",
    kind: options.kind || "text",
    payload: options.payload || {},
  };

  messages.value.push(message);
  if (role === "ivy") {
    ivyTypingQueue.push(message.id);
    runIvyTypewriter();
  }

  nextMessageId += 1;
}

function setIvyMessageElementRef(messageId, element) {
  if (!messageId) {
    return;
  }

  if (element) {
    ivyMessageElementMap.set(messageId, element);
    return;
  }

  ivyMessageElementMap.delete(messageId);
}

async function typeIvyMessage(message) {
  if (!message || message.role !== "ivy" || message.isComplete) {
    return;
  }

  await nextTick();
  let targetElement = ivyMessageElementMap.get(message.id);

  if (!targetElement) {
    await nextTick();
    targetElement = ivyMessageElementMap.get(message.id);
  }

  if (!targetElement) {
    message.isComplete = true;
    return;
  }

  const controller = new AbortController();
  activeTypewriterController?.abort();
  activeTypewriterController = controller;

  try {
    await typewriter(targetElement, message.text, {
      clearElementFirst: true,
      onUpdate: scrollToBottom,
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

  message.isComplete = true;
}

async function runIvyTypewriter() {
  if (isIvyQueueRunning || !ivyTypingQueue.length) {
    return;
  }

  isIvyQueueRunning = true;
  isIvyTyping.value = true;

  try {
    while (ivyTypingQueue.length) {
      const nextMessageIdInQueue = ivyTypingQueue.shift();
      if (!nextMessageIdInQueue) {
        continue;
      }

      const message = messages.value.find((entry) => entry.id === nextMessageIdInQueue);
      if (!message || message.isComplete || message.role !== "ivy") {
        continue;
      }

      await typeIvyMessage(message);
      scrollToBottom();
    }
  } finally {
    isIvyQueueRunning = false;
    isIvyTyping.value = false;
  }

  if (ivyTypingQueue.length) {
    runIvyTypewriter();
  }
}

function beginProfileCollection() {
  stage.value = "name";
  pushMessage("ivy", "To get started, why don't I collect a few details from you? First off, <strong>what is your full name?</strong>");
}

function startOnboardingConversation() {
  pushMessage("ivy", "Hi, I'm Ivy! Your personal helper for managing IT. Most of what you can do on this platform can be done just like this: by chatting with me.");
  beginProfileCollection();
}

function resolveSourceInput(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const exactMatch = sourceOptions.find((source) => source.toLowerCase() === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  return sourceOptions.find((source) => (
    source.toLowerCase().includes(normalized) || normalized.includes(source.toLowerCase())
  )) || null;
}

function beginSourceStage() {
  stage.value = "source";
  sourceSearch.value = "";
  pushMessage("ivy", "Ivy works best when you connect multiple data sources. <strong>Which source should we start with?</strong> You can skip this for now.", { kind: "source-picker" });
}

function sleep(ms = 0) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForIvyQueueToDrain() {
  while (isIvyTyping.value || ivyTypingQueue.length || isIvyQueueRunning) {
    // Wait for the queued typewriter messages to complete before advancing nav stages.
    // This keeps the narration synchronized with UI changes.
    await sleep(24);
  }
}

async function startNavigationWalkthrough(companyName = "") {
  stage.value = "navigation";

  const normalizedCompanyName = String(companyName || "").trim();
  if (normalizedCompanyName) {
    pushMessage("ivy", `Great, ${normalizedCompanyName}.`);
  }

  revealOnboardingMainNavigation();
  pushMessage("ivy", "Most of what you can do is accessible through the main navigation on the left.");
  await waitForIvyQueueToDrain();

  revealOnboardingNavigation();
  pushMessage("ivy", "The lower section includes your workspace controls, including Settings.");
  await waitForIvyQueueToDrain();

  beginSourceStage();
}

function completeSourceSelection(source = "") {
  profile.source = source;
  if (source) {
    pushMessage("ivy", `Perfect. We'll start with ${source}.`);
  } else {
    pushMessage("ivy", "No problem. You can connect one anytime.");
  }
  finishOnboarding();
}

function handleSourceSelect(source) {
  if (stage.value !== "source") {
    return;
  }

  pushMessage("user", source);
  completeSourceSelection(source);
}

function skipSourceSelection() {
  if (stage.value !== "source") {
    return;
  }

  pushMessage("user", "Skip source for now");
  completeSourceSelection("");
}

function finishOnboarding() {
  if (stage.value === "done") {
    return;
  }

  stage.value = "done";
  pushMessage("ivy", "You're all set. <strong>Where do you want to go next?</strong>", {
    kind: "summary",
  });
}

function openRoute(path) {
  router.push(path);
}

function handleChatSend() {
  const text = chatDraft.value.trim();
  if (!text || stage.value === "done") {
    return;
  }

  chatDraft.value = "";
  pushMessage("user", text);

  if (stage.value === "name") {
    if (text.length < 2) {
      pushMessage("ivy", "<strong>Could you share the name you'd like me to use?</strong>");
      return;
    }

    profile.name = text;
    stage.value = "email";
    pushMessage("ivy", `Nice to meet you, ${profile.name}. <strong>What's your work email?</strong>`);
    return;
  }

  if (stage.value === "email") {
    if (!emailPattern.test(text)) {
      pushMessage("ivy", "That email looks off. Try something like name@company.com.");
      return;
    }

    profile.email = text.toLowerCase();
    revealOnboardingProfileNavigation();
    stage.value = "company";
    pushMessage("ivy", `Okay, that's ${profile.email}. Now, <strong>what's the company name you're signing up as?</strong>`);
    return;
  }

  if (stage.value === "company") {
    if (text.length < 2) {
      pushMessage("ivy", "<strong>Could you share your company name?</strong>");
      return;
    }

    profile.company = text;
    revealOnboardingCompanyNavigation();
    startNavigationWalkthrough(profile.company);
    return;
  }

  if (stage.value === "source") {
    if (/\b(skip|later)\b/i.test(text)) {
      completeSourceSelection("");
      return;
    }

    const matchedSource = resolveSourceInput(text);
    if (!matchedSource) {
      pushMessage("ivy", "I couldn't find that source. <strong>Which source should I use?</strong> Pick one below or type \"skip\".", {
        kind: "source-picker",
      });
      return;
    }

    completeSourceSelection(matchedSource);
    return;
  }
}

watch(() => messages.value.length, scrollToBottom);

onMounted(() => {
  hideOnboardingNavigation();
  startOnboardingConversation();
  nextTick(() => {
    chatInput.value?.focus();
  });
});

onBeforeUnmount(() => {
  activeTypewriterController?.abort();
  ivyTypingQueue.length = 0;
  ivyMessageElementMap.clear();
  isIvyTyping.value = false;
  messages.value = [];
});
</script>

<template>
  <section class="onboarding-page d-flex flex-column py-4">
    <div class="onboarding-shell d-flex flex-column border rounded-sm bg-white">
      <header class="onboarding-shell__header d-flex align-items-center justify-content-between border-bottom px-4 py-3">
        <div>
          <h4 class="mb-1 fw-semibold">Welcome to Ivy</h4>
          <p class="mb-0 text-secondary">Quick setup, then you're in.</p>
        </div>
      </header>

      <div ref="threadEl" class="onboarding-thread flex-grow-1 px-4 py-3">
        <article
          v-for="message in messages"
          :key="message.id"
          class="onboarding-message d-flex mb-3"
          :class="message.role === 'user' ? 'justify-content-end' : 'justify-content-start'"
        >
          <div
            class="onboarding-message-content"
            :class="message.role === 'user' ? 'onboarding-message-content--user rounded bg-iceberg-blue px-3 py-2' : 'onboarding-message-content--ivy'"
          >
            <p
              v-if="message.role === 'ivy'"
              :ref="(element) => setIvyMessageElementRef(message.id, element)"
              class="mb-0"
            ></p>
            <p v-else class="mb-0">{{ message.text }}</p>

            <div
              v-if="message.kind === 'source-picker' && message.isComplete"
              class="onboarding-interactive-card border rounded-sm p-3 bg-white"
            >
              <input
                v-model="sourceSearch"
                type="text"
                class="form-control mb-3"
                placeholder="Search sources..."
              >
              <div class="onboarding-source-grid">
                <button
                  v-for="source in filteredSources"
                  :key="source"
                  type="button"
                  class="onboarding-source-chip btn btn-sm btn-white border text-start"
                  @click="handleSourceSelect(source)"
                >
                  {{ source }}
                </button>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-line text-dark mt-3"
                @click="skipSourceSelection"
              >
                Skip for now
              </button>
            </div>

            <div
              v-if="message.kind === 'summary' && message.isComplete"
              class="onboarding-interactive-card border rounded-sm p-3 bg-white"
            >
              <ul class="mb-3 ps-3">
                <li><strong>Name:</strong> {{ profile.name || "-" }}</li>
                <li><strong>Email:</strong> {{ profile.email || "-" }}</li>
                <li><strong>Company:</strong> {{ profile.company || "-" }}</li>
                <li><strong>Source:</strong> {{ profile.source || "Skipped for now" }}</li>
              </ul>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" class="btn btn-sm btn-primary" @click="openRoute('/')">
                  Go to Home
                </button>
                <button type="button" class="btn btn-sm btn-white border" @click="openRoute('/chat')">
                  Open Chat
                </button>
                <button type="button" class="btn btn-sm btn-white border" @click="openRoute('/assistants')">
                  Open Assistants
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <footer class="onboarding-shell__footer border-top px-4 py-3 bg-light">
        <div class="position-relative">
          <input
            ref="chatInput"
            v-model="chatDraft"
            type="text"
            class="onboarding-chat-input form-control rounded-pill pe-5"
            :placeholder="inputPlaceholder"
            :disabled="stage === 'done' || stage === 'navigation' || isIvyTyping"
            @keydown.enter.prevent="handleChatSend"
          >
          <button
            type="button"
            class="onboarding-send btn btn-primary btn-sm rounded-pill d-flex align-items-center justify-content-center"
            :disabled="!canSend"
            @click="handleChatSend"
          >
            <img src="../assets/arrow-right-c.svg" width="18" height="18" alt="">
          </button>
        </div>
        <p class="text-secondary mb-0 mt-2">{{ stageHint }}</p>
      </footer>
    </div>
  </section>
</template>

<style scoped lang="scss">
.onboarding-page {
  min-height: 100%;
}

.onboarding-shell {
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.12);
  height: calc(100vh - 8rem);
  max-height: 48rem;
}

.onboarding-shell__header,
.onboarding-shell__footer {
  flex: 0 0 auto;
}

.onboarding-thread {
  flex: 1;
  overflow-y: auto;
}

.onboarding-message {
  width: 100%;
}

.onboarding-message-content {
  max-width: min(44rem, 92%);

  &--ivy {
    width: 100%;
  }

  &--user {
    max-width: min(32rem, 84%);
  }
}

.onboarding-interactive-card {
  margin-top: 0.625rem;
  width: fit-content;
}

.onboarding-source-grid {
  display: grid;
  gap: 0.45rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.onboarding-source-chip {
  justify-content: flex-start;
  min-height: 2rem;
  white-space: normal;
}

.onboarding-chat-input {
  min-height: 2.75rem;
  padding-left: 1rem;
  padding-right: 3.25rem;
}

.onboarding-send {
  height: 2rem;
  min-width: 2rem;
  padding: 0;
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
}

.onboarding-send:disabled {
  opacity: 0.45;
}

@media (max-width: 768px) {
  .onboarding-shell {
    height: calc(100vh - 6rem);
  }

  .onboarding-source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
