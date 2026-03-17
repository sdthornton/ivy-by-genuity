<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import ContentHeader from "./shared/ContentHeader.vue";
import BasicDropdown from "./shared/BasicDropdown.vue";
import { CATEGORY_OPTIONS, formatCategoryLabel } from "./assistants/shared/categoryOptions";
import iconIvyCreator from "../assets/nav-resources-nav.svg";
import iconCalendar from "../assets/calendar.svg";
import iconStop from "../assets/stop.svg";

const DEFAULT_ASSISTANT_CREATOR = "Ivy";
const IVY_CREATOR_NAME = "Ivy";
const IVY_CREATOR_BG = "var(--bs-gray-200)";
const AVATAR_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffc107",
  "#ff9800",
  "#ff5722",
];

const mockAssistants = ref([
  {
    id: 1,
    title: "Identity Hygiene Monitor",
    description: "Finds identity risks like missing MFA, inactive users, and risky sign-ins.",
    category: "security",
    trigger: {
      type: "time-based",
      value: "Daily 9:00 AM"
    }
  },
  {
    id: 2,
    title: "Privileged Access Watch",
    description: "Detects new admin role assignments and evaluates risk context.",
    category: "access",
    trigger: {
      type: "event-based",
      value: "When a new admin role is assigned"
    }
  },
  {
    id: 3,
    title: "Endpoint Hygiene Agent",
    description: "Flags unmanaged devices, missing patches, disabled agents, or missing encryption.",
    category: "monitoring",
    trigger: {
      type: "time-based",
      value: "Daily 8:00 AM"
    }
  },
  {
    id: 4,
    title: "High-Risk Device Finder",
    description: "Correlates security signals to identify the riskiest endpoints.",
    category: "threats",
    trigger: {
      type: "manual",
      value: null
    }
  },
  {
    id: 5,
    title: "Email Threat Exposure Agent",
    description: "Tracks phishing activity and identifies users most exposed to email threats.",
    category: "threats",
    trigger: {
      type: "time-based",
      value: "Daily 10:00 AM"
    }
  },
  {
    id: 6,
    title: "High-Risk User Monitor",
    description: "Ranks users by risk using signals like phishing failures, malware exposure, and weak auth.",
    category: "security",
    trigger: {
      type: "time-based",
      value: "Daily 10:30 AM"
    }
  },
  {
    id: 7,
    title: "Network Exposure Monitor",
    description: "Detects risky network configurations, DNS threats, and unusual access patterns.",
    category: "monitoring",
    trigger: {
      type: "time-based",
      value: "Daily 7:30 AM"
    }
  },
  {
    id: 8,
    title: "Backup & Recovery Readiness",
    description: "Verifies backup coverage and flags failures or protection gaps.",
    category: "backup",
    trigger: {
      type: "time-based",
      value: "Daily 6:00 AM"
    }
  },
  {
    id: 9,
    title: "Weekly Security & IT Risk Brief",
    description: "Summarizes the most important risks and changes across systems.",
    category: "activity",
    trigger: {
      type: "time-based",
      value: "Weekly Monday 8:00 AM"
    }
  }
].map((assistant) => ({
  ...assistant,
  created_by: DEFAULT_ASSISTANT_CREATOR,
  createdBy: DEFAULT_ASSISTANT_CREATOR,
})));
const showCreateAssistantModal = ref(false);
const createAssistantPrompt = ref("");
const createAssistantPromptInput = ref(null);
const createAssistantPromptExamples = [
  "Pull yesterday's failed sign-ins and send a daily summary to Security.",
  "Every weekday at 8am, list unmanaged devices and post results to Teams.",
  "When a new admin is added, notify IT Ops and create an audit note.",
  "Run daily and flag users with no MFA who had risky sign-ins in 24 hours.",
];
const createAssistantPromptExampleIndex = ref(0);
const createAssistantPromptPlaceholder = computed(() => (
  createAssistantPromptExamples[createAssistantPromptExampleIndex.value] || ""
));
const hasCreateAssistantPrompt = computed(() => createAssistantPrompt.value.length > 0);
let createAssistantPlaceholderTimer = null;

function rotateCreateAssistantPromptExample() {
  const count = createAssistantPromptExamples.length;
  if (count <= 1) {
    createAssistantPromptExampleIndex.value = 0;
    return;
  }

  const current = createAssistantPromptExampleIndex.value;
  let next = Math.floor(Math.random() * count);
  if (next === current) {
    next = (current + 1) % count;
  }
  createAssistantPromptExampleIndex.value = next;
}

function startCreateAssistantPlaceholderRotation() {
  if (createAssistantPlaceholderTimer || createAssistantPromptExamples.length <= 1) {
    return;
  }

  createAssistantPlaceholderTimer = window.setInterval(() => {
    rotateCreateAssistantPromptExample();
  }, 2600);
}

function stopCreateAssistantPlaceholderRotation() {
  if (!createAssistantPlaceholderTimer) {
    return;
  }

  window.clearInterval(createAssistantPlaceholderTimer);
  createAssistantPlaceholderTimer = null;
}

watch(
  () => [showCreateAssistantModal.value, createAssistantPrompt.value.trim()],
  ([isOpen, prompt]) => {
    if (isOpen && !prompt) {
      startCreateAssistantPlaceholderRotation();
      return;
    }

    stopCreateAssistantPlaceholderRotation();
  },
);

async function openCreateAssistantModal() {
  rotateCreateAssistantPromptExample();
  showCreateAssistantModal.value = true;
  await nextTick();
  createAssistantPromptInput.value?.focus();
}

function closeCreateAssistantModal() {
  showCreateAssistantModal.value = false;
}

onBeforeUnmount(() => {
  stopCreateAssistantPlaceholderRotation();
});

function getCreatorName(assistant) {
  const creator = String(assistant?.created_by || assistant?.createdBy || "").trim();
  return creator || DEFAULT_ASSISTANT_CREATOR;
}

function isIvyCreator(name) {
  return String(name || "").trim().toLowerCase() === IVY_CREATOR_NAME.toLowerCase();
}

function getCreatorInitials(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return "?";
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function getCreatorAvatarStyle(name) {
  if (isIvyCreator(name)) {
    return { backgroundColor: IVY_CREATOR_BG };
  }

  const key = String(name || "").trim();
  const seed = key
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = AVATAR_COLORS[seed % AVATAR_COLORS.length] || AVATAR_COLORS[4];
  return { backgroundColor: color };
}

function isAssistantScheduled(assistant) {
  return String(assistant?.trigger?.type || "").toLowerCase() === "time-based";
}

function getAssistantScheduleLabel(assistant) {
  return isAssistantScheduled(assistant) ? "Scheduled" : "Unscheduled";
}

function getAssistantSchedulePillClass(assistant) {
  return isAssistantScheduled(assistant)
    ? "assistant-index-schedule-pill--scheduled text-white"
    : "bg-secondary-subtle text-secondary";
}

function getAssistantScheduleIcon(assistant) {
  return isAssistantScheduled(assistant) ? iconCalendar : iconStop;
}

function getAssistantCategory(assistant) {
  return String(assistant?.category || "").trim() || "security";
}

function selectAssistantCategory(assistant, category, close) {
  if (!assistant) {
    close();
    return;
  }

  assistant.category = category;
  close();
}

</script>

<template>
  <section class="text-left w-100 pb-5">
    <ContentHeader />
    <div class="mt-3 py-3 d-flex align-items-start">
      <div class="me-4">
        <h2 class="fw-bold text-left mb-1">
          Ivy Assistants
        </h2>
        <p class="mb-0 reduced text-body-secondary">
          Your AI agents. Build, customize, and deploy assistants that do the work for you.
        </p>
      </div>
      <button
        class="ms-auto btn btn-primary rounded-sm py-2"
        @click="openCreateAssistantModal"
      >
        Create Assistant
      </button>
    </div>
    <div class="bg-info-banner position-relative rounded-top p-3 mt-2">
      <img src="../assets/bg-grid-effect.svg" width="200" height="200" class="bg-grid-effect">
      <div class="row position-relative justify-content-around">
        <div class="col">
          <a
            href="#"
            class="btn btn-link d-block p-2 text-start"
            @click.prevent=""
          >
            <h3 class="fw-bold mb-0">
              32
            </h3>
            <div class="text-dark opacity-75 reduced">
              Total Assistants
            </div>
          </a>
        </div>
        <div class="col">
          <a
            href="#"
            class="btn btn-link d-block p-2 text-start"
            @click.prevent=""
          >
            <h3 class="fw-bold mb-0">
              14
            </h3>
            <div class="text-dark opacity-75 reduced">
              Active 
            </div>
          </a>
        </div>
        <div class="col">
          <a
            href="#"
            class="btn btn-link d-block p-2 text-start"
            @click.prevent=""
          >
            <h3 class="fw-bold mb-0">
              8
            </h3>
            <div class="text-dark opacity-75 reduced">
              Scheduled
            </div>
          </a>
        </div>
        <div class="col">
          <a
            href="#"
            class="btn btn-link d-block p-2 text-start"
            @click.prevent=""
          >
            <h3 class="fw-bold mb-0">
              20
            </h3>
            <div class="text-dark opacity-75 reduced">
              Run This Week
            </div>
          </a>
        </div>
        <div class="col">
          <a
            href="#"
            class="btn btn-link d-block p-2 text-start"
            @click.prevent=""
          >
            <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
              <img src="../assets/ivy-basic-icon.svg" height="24" width="24">
              <span>4</span>
            </h3>
            <div class="text-dark opacity-75 reduced">
              Assistant Insights
            </div>
          </a>
        </div>
      </div>
    </div>

    <div class="border-start border-end border-bottom rounded-bottom p-3 bg-white">
      <div class="row">
        <div class="col-auto">
          <div class="position-relative">
            <img src="../assets/magnifying-glass.svg" height="14" width="14" class="position-absolute opacity-50 ms-3 top-50 start-0 translate-middle-y">
            <input type="text" class="assistant-search form-control rounded-sm py-2 pe-3" placeholder="Search assistants by title, creator, category, etc...">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-light d-inline-flex align-items-center justify-content-center py-2 px-3 reduced">
            <span>All Assistants</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-light d-inline-flex align-items-center justify-content-center py-2 px-3 reduced">
            <span>Recent</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-light d-inline-flex align-items-center justify-content-center py-2 px-3 reduced">
            <span>All Categories</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-light d-inline-flex align-items-center justify-content-center py-2 px-3 reduced">
            <span>Any Creator</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-2 mt-4 mb-3 align-items-start not-as-small fw-normal">
      <span class="border-bottom border-primary-subtle fw-medium px-1" style="border-bottom-width: 2px !important;">
        All Assistants
      </span>
      <span class="px-1">Active</span>
      <span class="px-1">Inactive</span>
      <span class="px-1">Drafts</span>
      <span class="px-1">Scheduled</span>
      <span class="px-1">Unscheduled</span>
    </div>

    <div class="basic-box-grid">
      <div
        v-for="assistant in mockAssistants"
        :key="assistant.id"
        class="basic-box-grid__item border bg-white pt-4 rounded d-flex flex-column overflow-hidden"
      >
        <div class="px-4 mb-4">
          <div class="d-flex align-items-start gap-2 mb-2">
            <h6 class="fw-medium mb-0 lead">
              {{ assistant.title }}
            </h6>
            <div class="ms-auto d-flex gap-2 align-items-center" style="margin-top: -0.75rem; margin-right: -0.75rem;">
              <div 
                v-tooltip="'Last ran on March 10, at 4pm.'"
                class="rounded-circle bg-secondary-subtle p-1 ms-auto" 
              >
                <img src="../assets/last-ran.svg" class="d-block" width="14" height="14">
              </div>
              <div class="dropdown">
                <img src="../assets/ellipses.svg" class="d-block" height="16" width="16" style="transform: rotate(90deg);">
              </div>
            </div>
          </div>
          <p class="text-secondary not-as-small mb-0">
            {{ assistant.description }}
          </p>
        </div>

        <div class="d-flex align-items-center true-small gap-3 mt-auto mb-3 px-4">
          <BasicDropdown menu-class="assistant-category-menu">
            <template #trigger>
              <div
                class="assistant-category-pill fw-medium true-small text-black text-capitalize rounded-pill px-2 d-inline-flex"
                :class="`bg-category-${getAssistantCategory(assistant)}`"
              >
                <div class="assistant-category-pill__content d-flex align-items-center">
                  <span>{{ formatCategoryLabel(getAssistantCategory(assistant)) }}</span>
                  <img src="../assets/dropdown.svg" height="10" width="10" class="ms-2 opacity-75">
                </div>
              </div>
            </template>
            <template #menu="{ close }">
              <button
                v-for="category in CATEGORY_OPTIONS"
                :key="category"
                type="button"
                class="dropdown-item d-flex align-items-center justify-content-between gap-3 text-start assistant-category-menu__item"
                @click="selectAssistantCategory(assistant, category, close)"
              >
                <span class="d-inline-flex align-items-center gap-2">
                  <span
                    class="assistant-category-menu__swatch rounded-pill"
                    :class="`bg-category-${category}`"
                  />
                  <span>{{ formatCategoryLabel(category) }}</span>
                </span>
                <span
                  v-if="getAssistantCategory(assistant) === category"
                  class="assistant-category-menu__selected text-body-secondary"
                >
                  Current
                </span>
              </button>
            </template>
          </BasicDropdown>
          <span
            v-tooltip="'This should show when or what triggers the assistant to run.'"
            class="assistant-index-schedule-pill d-inline-flex align-items-center rounded-sm fw-normal ms-auto"
            :class="getAssistantSchedulePillClass(assistant)"
          >
            <img
              :src="getAssistantScheduleIcon(assistant)"
              width="12"
              height="12"
              class="assistant-index-schedule-pill__icon"
              :class="{ 'assistant-index-schedule-pill__icon--invert': isAssistantScheduled(assistant) }"
              alt=""
            >
            <span>{{ getAssistantScheduleLabel(assistant) }}</span>
          </span>
        </div>

        <div class="bg-light px-3 py-2 border-top not-as-small d-flex align-items-center gap-3">
          <div class="d-flex gap-2">
            <span
              class="text-avatar text-avatar--small text-white fw-semibold rounded-circle flex-shrink-0"
              :style="getCreatorAvatarStyle(getCreatorName(assistant))"
            >
              <img
                v-if="isIvyCreator(getCreatorName(assistant))"
                :src="iconIvyCreator"
                width="12"
                height="12"
              >
              <template v-else>
                {{ getCreatorInitials(getCreatorName(assistant)) }}
              </template>
            </span>
            <span class="text-body-secondary">{{ getCreatorName(assistant) }}</span>
          </div>
          <div class="rounded-pill d-flex gap-2 align-items-center px-2 ms-auto" style="background-color: var(--bs-gray-150);">
            <img 
              src="../assets/globe.svg"
              width="12"
              height="12"
            >
            <span class="text-body-secondary">
              Public
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <Teleport to="body">
    <Transition name="assistant-create-backdrop">
      <button
        v-if="showCreateAssistantModal"
        type="button"
        class="assistant-create-modal-backdrop"
        aria-label="Close create assistant modal"
        @click="closeCreateAssistantModal"
      />
    </Transition>
    <Transition name="assistant-create-modal">
      <aside
        v-if="showCreateAssistantModal"
        class="assistant-create-modal bg-white rounded p-5"
        role="dialog"
        aria-modal="true"
        aria-label="Create assistant"
      >
        <button
          type="button"
          class="assistant-create-modal__close btn btn-sm btn-white d-flex align-items-center justify-content-center"
          aria-label="Close create assistant modal"
          @click.stop.prevent="closeCreateAssistantModal"
        >
          &times;
        </button>

        <h3 class="fw-semibold mb-1">Let's Build Your Assistant</h3>
        <p class="text-secondary not-as-small mb-4">
          Describe any automated workflow and watch Ivy create your assistant in seconds.
        </p>

        <div class="ivy-chat-highlight-shadow position-relative">
          <textarea
            ref="createAssistantPromptInput"
            v-model="createAssistantPrompt"
            class="assistant-create-modal__prompt-input form-control reduced p-3"
            rows="4"
            placeholder=" "
          />
          <div
            v-show="!hasCreateAssistantPrompt"
            class="assistant-create-modal__prompt-placeholder opacity-50 position-absolute start-0 top-0 d-flex align-items-start px-3 pt-3 pe-4 text-body-secondary reduced"
            @click="createAssistantPromptInput?.focus()"
          >
            <div class="d-flex align-items-start min-w-0">
              <span class="me-1 flex-shrink-0">e.g.</span>
              <Transition name="assistant-create-placeholder-swap" mode="out-in">
                <span :key="createAssistantPromptPlaceholder">{{ createAssistantPromptPlaceholder }}</span>
              </Transition>
            </div>
          </div>
        </div>

        <div class="assistant-create-modal__or-divider position-relative my-4 py-2">
          <hr class="my-0">
          <span class="assistant-create-modal__or-label px-2 smallest text-body-tertiary bg-white">or</span>
        </div>

        <div class="text-center">
          <router-link
            to="/assistants/new"
            class="btn btn-outline-light border mx-auto d-inline-block text-dark px-5"
            @click="closeCreateAssistantModal"
          >
            Build from Scratch
        </router-link>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.assistant-create-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.35);
  border: 0;
  inset: 0;
  padding: 0;
  position: fixed;
  z-index: 60;
}

.assistant-create-modal {
  box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.20);
  left: 50%;
  max-width: min(42rem, calc(100vw - 2rem));
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  z-index: 61;
}

.assistant-create-modal__close {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
}

.assistant-create-modal__prompt-input {
  padding: 1rem;
  resize: none;
}

.assistant-create-modal__prompt-placeholder {
  cursor: text;
  line-height: 1.3;
  pointer-events: auto;
  white-space: normal;
  width: 100%;
  overflow-wrap: break-word;
  word-break: normal;
  z-index: 2;
}

.assistant-create-modal__prompt-input:not(:placeholder-shown) + .assistant-create-modal__prompt-placeholder {
  opacity: 0 !important;
  pointer-events: none;
}

.assistant-create-placeholder-swap-enter-active,
.assistant-create-placeholder-swap-leave-active {
  transition: all 0.2s ease-in-out;
}

.assistant-create-placeholder-swap-enter-from,
.assistant-create-placeholder-swap-leave-to {
  opacity: 0;
  transform: translateY(0.25rem);
}

.assistant-create-placeholder-swap-enter-to,
.assistant-create-placeholder-swap-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.assistant-create-modal__or-divider {
  position: relative;
}

.assistant-create-modal__or-label {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.assistant-create-backdrop-enter-active,
.assistant-create-backdrop-leave-active,
.assistant-create-modal-enter-active,
.assistant-create-modal-leave-active {
  transition: all 0.2s ease-in-out;
}

.assistant-create-backdrop-enter-from,
.assistant-create-backdrop-leave-to {
  opacity: 0;
}

.assistant-create-backdrop-enter-to,
.assistant-create-backdrop-leave-from {
  opacity: 1;
}

.assistant-create-modal-enter-from,
.assistant-create-modal-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 1rem));
}

.assistant-create-modal-enter-to,
.assistant-create-modal-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.assistant-index-schedule-pill {
  border-radius: 0.375rem;
  gap: 0.25rem;
  padding: 0 0.5rem;
}

.assistant-index-schedule-pill--scheduled {
  background-color: rgb(123, 104, 238);
}

.assistant-index-schedule-pill__icon {
  flex-shrink: 0;
}

.assistant-index-schedule-pill__icon--invert {
  filter: brightness(0) invert(1);
}

.assistant-search {
  min-width: 28rem;
  padding-left: 2.5rem;
}

.assistant-category-pill {
  text-transform: capitalize;
}

.assistant-category-pill__content {
  mix-blend-mode: darken;
  opacity: 0.65;
}

.assistant-category-menu__item {
  background: transparent;
  border: 0;
  width: 100%;
}

.assistant-category-menu__selected {
  font-size: 0.75rem;
}

.assistant-category-menu__swatch {
  display: inline-block;
  height: 0.875rem;
  width: 1.5rem;
}

:deep(.assistant-category-menu) {
  min-width: 12rem;
  padding: 0.375rem 0;
}
</style>
