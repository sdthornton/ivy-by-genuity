<script setup>
import { computed, onMounted, ref, watch } from "vue";
import iconClock from "../../assets/clock.svg";

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  triggerLabel: {
    type: String,
    default: "Draft, Not Scheduled",
  },
  triggerConfigured: {
    type: Boolean,
    default: false,
  },
  triggerIcon: {
    type: String,
    default: iconClock,
  },
});

const titleRef = ref(null);

const creatorInitials = computed(() => toInitials(props.settings.creator, "Y"));
const ownerInitials = computed(() => toInitials(props.settings.ownerTeam, "ST"));
const normalizedTitle = computed(() => props.settings.title?.trim() || "New Assistant");

function toInitials(value, fallback) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return fallback;
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function syncTitleSurface(value) {
  if (!titleRef.value) {
    return;
  }

  if (document.activeElement === titleRef.value) {
    return;
  }

  titleRef.value.textContent = value;
}

function normalizeTitleText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function onTitleInput(event) {
  props.settings.title = normalizeTitleText(event.currentTarget.textContent);
}

function onTitleBlur(event) {
  const nextTitle = normalizeTitleText(event.currentTarget.textContent) || "New Assistant";
  props.settings.title = nextTitle;
  event.currentTarget.textContent = nextTitle;
}

function onTitleKeydown(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  event.currentTarget.blur();
}

watch(normalizedTitle, (value) => {
  syncTitleSurface(value);
}, { immediate: true });

onMounted(() => {
  syncTitleSurface(normalizedTitle.value);
});
</script>

<template>
  <div class="assistant-settings-panel bg-light d-flex flex-column h-100 not-as-small">
    <header class="assistant-settings-header d-flex align-items-start border-bottom p-4">
      <div class="assistant-settings-heading d-flex align-items-start text-black me-4">
        <img src="../../assets/nav-settings.svg" width="20" height="20" class="me-3 opacity-75 mt-1" alt="">
        <div>
          <h4 class="fw-semibold mb-1">Assistant Settings</h4>
          <p class="text-muted not-as-small mb-0">
            Meta data and settings for this assistant.
          </p>
        </div>
      </div>
      <div class="ms-auto">
        &times;
      </div>
    </header>

    <section class="assistant-settings-body pt-4 px-2.5 mx-4">
      <div class="d-inline-flex align-items-center justify-content-start gap-2 bg-secondary-subtle rounded-pill px-2 py-1 mb-4">
        <div 
          class="d-inline-flex align-items-center rounded-pill px-2 smallest"
          :class="settings.status === 'Draft' ? 'bg-titan-white text-dark' : 'bg-success text-white'"
        >
          {{ settings.status }}
        </div>
        <span class="text-body-tertiary smallest mx-1">&bullet;</span>
        <div class="text-avatar text-avatar--small bg-schedule text-white fw-semibold rounded-circle flex-shrink-0">
          {{ creatorInitials }}
        </div>
        <span class="text-body-tertiary smallest mx-1">&bullet;</span>
        <div class="smallest text-body-secondary d-inline-flex align-items-center">
          <img src="../../assets/updated-at.svg" height="12" width="12" class="me-1">
          <span>{{ settings.updatedAt }}</span>
        </div>
        <span class="text-body-tertiary smallest mx-1">&bullet;</span>
        <div 
          class="fw-medium true-small text-black text-capitalize rounded-pill px-2 d-inline-flex"
          :class="`bg-${settings.category}`"
        >
          <div class="category-pill-content d-flex align-items-center">
            <span>{{ settings.category }}</span>
            <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-2 opacity-75">
          </div>
        </div>
      </div>

      <div class="mb-4 me-5">
        <label class="mb-1" for="assistant_settings_title">
          Title
        </label>
        <input
          ref="titleRef"
          id="assistant_settings_title"
          type="text"
          class="form-control not-as-small"
          v-model="settings.title"
        >
      </div>

      <div class="mb-4">
        <label class="mb-1" for="assistant_settings_description">
          Description
        </label>
        <textarea
          id="assistant_settings_description"
          v-model="settings.description"
          class="form-control assistant-settings-textarea not-as-small"
          rows="3"
          placeholder="Describe what this assistant should do..."
        />
      </div>

      <!-- <div class="mb-4">
        <div class="text-body-secondary mb-1">Created By</div>
      </div> -->

      <div class="mb-4">
        <div class="mb-1">
          Owned By
        </div>
        <div class="d-flex align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <div class="text-avatar bg-lookup text-white fw-semibold rounded-circle flex-shrink-0">
              {{ ownerInitials }}
            </div>
            <div class="fw-medium text-black text-truncate">{{ settings.ownerTeam }}</div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <div class="mb-1 d-flex">
          <span class="me-2">Permissions</span>
          <button class="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center p-1">
            <img src="../../assets/plus-round.svg" height="10" width="10" class="d-block invert-to-white">
          </button>
        </div>
        <div class="d-flex align-items-center justify-content-between gap-3">
          <div class="fw-medium text-black">{{ settings.permissions }}</div>
          <span class="smallest text-body-secondary border rounded-pill px-2 py-1 flex-shrink-0">
            <span>Read/Write</span>
            <img src="../../assets/arrow-down-b.svg" height="12" width="12" class="ms-1">
          </span>
        </div>
      </div>

      <!-- <div class="mb-4">
        <div class="mb-1">
          Category
        </div>
      </div> -->

      <div class="mb-0">
        <div class="mb-1">Trigger</div>
        <span
          class="assistant-settings-trigger-pill header-trigger-pill rounded-sm true-small fw-normal d-inline-flex align-items-center justify-content-center"
          :class="triggerConfigured ? 'header-trigger-pill--configured text-white' : 'header-trigger-pill--draft bg-secondary-subtle text-secondary'"
        >
          <img
            v-if="triggerConfigured"
            :src="triggerIcon || iconClock"
            width="16"
            height="16"
            class="me-1 invert-to-white header-trigger-pill__icon"
            alt=""
          >
          <span class="header-trigger-pill__label">{{ triggerLabel }}</span>
        </span>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.assistant-settings-panel {
  min-height: 0;
}

.assistant-settings-header {
  background-color: white;
  flex: 0 0 auto;
}

.assistant-settings-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.assistant-settings-title {
  display: inline-block;
  min-width: 0;
  outline: none;
  text-decoration-color: var(--bs-gray-300);
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.5rem;
}

.assistant-settings-textarea {
  resize: vertical;
}

.assistant-settings-trigger-pill {
  max-width: 100%;
  min-height: 1.75rem;
  min-width: 0;
  padding: 0.25rem 0.5rem;
}

.header-trigger-pill--configured {
  background-color: rgb(123, 104, 238);
}

.header-trigger-pill__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-pill-content {
  mix-blend-mode: darken;
  opacity: 0.65;
}

.form-control {
  --bs-border-radius: 0.5rem;
}
</style>
