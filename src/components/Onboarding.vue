<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { hideOnboardingNavigation } from "../composables/useAppLayoutState";
import { sourceOptions } from "./assistants/stepRuntime";
import { resolveSourceIcon } from "./shared/sourceCatalog";
import ChatBox from "./shared/ChatBox.vue";

const router = useRouter();
const fileInputEl = ref(null);
const introMessageEl = ref(null);
const showSourceOptions = ref(false);
const onboardingStep = ref("source");
const sourceSelectionConfirmed = ref(false);
const sourceDetailsSubmitted = ref(false);
const selectedSource = ref("");
const showOnboardingQuickActions = ref(false);
const uploadedFileName = ref("");
const sourceForm = reactive({
  accountEmail: "",
  apiToken: "",
  connectionName: "",
  importWindow: "Last 30 days",
  notes: "",
  workspaceId: "",
});

const uploadSourceIcon = resolveSourceIcon("IT Meeting Notes");
const TOTAL_ONBOARDING_STEPS = 3;
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

const hasSelection = computed(() => Boolean(selectedSource.value || uploadedFileName.value));
const step1Status = computed(() => (
  onboardingStep.value !== "source" || sourceSelectionConfirmed.value ? "Complete" : "In-Progress"
));
const step2Status = computed(() => (sourceDetailsSubmitted.value ? "Complete" : "In-Progress"));

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

const step1Label = computed(() => (
  `Step 1 of ${ TOTAL_ONBOARDING_STEPS }: ${ step1Status.value}`
));

const step2Label = computed(() => (
  `Step 2 of ${TOTAL_ONBOARDING_STEPS}: ${step2Status.value}.`
));

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

function continueToDashboard() {
  if (!hasSelection.value) {
    return;
  }

  sourceSelectionConfirmed.value = true;
  onboardingStep.value = "details";
  sourceDetailsSubmitted.value = false;
  showOnboardingQuickActions.value = false;
}

function backToSourceSelection() {
  onboardingStep.value = "source";
  sourceSelectionConfirmed.value = false;
}

function clearSelectedSource() {
  selectedSource.value = "";
  uploadedFileName.value = "";
  sourceSelectionConfirmed.value = false;
}

function addAnotherSource() {
  clearSelectedSource();
  sourceDetailsSubmitted.value = false;
  onboardingStep.value = "source";
  showOnboardingQuickActions.value = false;
}

function submitSourceDetails() {
  sourceDetailsSubmitted.value = true;
  showOnboardingQuickActions.value = true;
}

function skipToDashboard() {
  router.push("/");
}

function renderIntroMessage() {
  if (!introMessageEl.value) {
    return;
  }

  introMessageEl.value.innerHTML = INTRO_MARKUP;
  showSourceOptions.value = true;
}

onMounted(() => {
  hideOnboardingNavigation();
  renderIntroMessage();
});
</script>

<template>
  <section class="onboarding-page">
    <div class="onboarding-content">
      <div class="position-relative mb-4">
        <p class="ivy-chat-width onboarding-intro--sizer mb-0" v-html="INTRO_MARKUP" aria-hidden="true"></p>
        <p ref="introMessageEl" class="ivy-chat-width onboarding-intro--typing mb-0"></p>
      </div>

      <div
        v-if="onboardingStep === 'source'"
        class="onboarding-sources"
        :class="{ 'onboarding-sources--visible': showSourceOptions }"
      >
        <div class="py-4 rounded border onboarding-inline-interaction bg-light">
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
        <div class="onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
          <span class="step-progress-indicator">
            <img
              src="../assets/ellipses.svg"
              class="invert-to-white"
              width="11"
              height="11"
            >
          </span>
          <span>{{ step1Label }}</span>
        </div>
      </div>

      <div v-else class="mt-5 d-flex flex-column onboarding-details-step">
        <div class="border rounded p-3 mx-0 bg-white">
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
        <div class="ms-0 onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
          <span class="step-progress-indicator step-progress-indicator--complete">
            <img
              src="../assets/checkmark.svg"
              class="invert-to-white"
              width="11"
              height="11"
            >
          </span>
          <span>{{ step1Label }}</span>
        </div>

        <p class="ivy-chat-width mt-5 mb-4">
          Nice choice with {{ selectedSourceLabel }}. When you’re ready,
          <strong>fill in the connection details below</strong> and I’ll get your first sync prepared.
        </p>

        <div v-if="!sourceDetailsSubmitted" class="mb-5">
          <div class="border rounded py-4 onboarding-inline-interaction bg-light">
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
          <div class="onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
            <span class="step-progress-indicator">
              <img
                src="../assets/ellipses.svg"
                class="invert-to-white"
                width="11"
                height="11"
              >
            </span>
            <span>{{ step2Label }}</span>
          </div>
        </div>

        <div 
          v-else
          class="d-flex flex-column"
        >
          <div class="border rounded p-3 mx-0 bg-white d-flex align-items-center gap-3 position-relative">
            <div class="active-sync-check">
              <img src="../assets/linked.svg" class="invert-to-white" width="12" height="12">
            </div>
            <img
              v-if="selectedSourceIcon"
              :src="selectedSourceIcon"
              :alt="selectedSourceLabel"
              width="40"
              height="40"
            >
            <div class="min-w-0">
              <div class="fw-semibold text-truncate">{{ selectedSourceLabel }}</div>
              <div class="smallest text-secondary">Sync status: Active</div>
            </div>
            <span class="badge text-bg-success ms-auto">Synced</span>
          </div>
          <div class="d-flex gap-2">
            <div class="ms-0 onboarding-step-note d-flex align-items-center gap-2 true-small text-secondary mt-2">
              <span class="step-progress-indicator step-progress-indicator--complete">
                <img
                  src="../assets/checkmark.svg"
                  class="invert-to-white"
                  width="11"
                  height="11"
                >
              </span>
              <span>{{ step2Label }}</span>
            </div>
            <button type="button" class="btn btn-sm text-dark ms-auto" @click="addAnotherSource">
              + Add another source
            </button>
          </div>
        </div>

        <p v-if="sourceDetailsSubmitted" class="mb-4 mt-5 ivy-chat-width">
          Great work syncing that! Now that you have a data source I can provide you with even more help and insights.
          Why don't I just show you? <strong>Take a look at the sources option in the chat dialog and try selecting your newly added source</strong>.
        </p>

        <ChatBox
          class="w-100"
          :show-quick-actions="showOnboardingQuickActions"
          chat-placeholder="Need a hand? Ask Ivy or paste your details here."
          :source-options="onboardingChatSourceOptions"
          :active-sources="onboardingChatActiveSources"
          :highlight-sources-pill="sourceDetailsSubmitted"
          sources-callout-text="Try the Sources option next"
        />
      </div>

      <input
        ref="fileInputEl"
        type="file"
        class="d-none"
        @change="onFileChange"
      >
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

.onboarding-intro--sizer {
  opacity: 0;
  pointer-events: none;
}

.onboarding-intro--typing {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.onboarding-page {
  display: flex;
  justify-content: center;
  min-height: 100%;
  overflow: hidden;
  padding: 8rem 0 5rem;
  position: relative;

  @media only screen and (max-height: 24rem) {
    padding-top: 3rem;
  }
}

.onboarding-inline-interaction {
  margin-left: -3rem;
  margin-right: -3rem;
  padding-left: 3rem;
  padding-right: 3rem;
}

.onboarding-sources {
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.375rem);
  transition: none;
}

.onboarding-sources--visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.onboarding-step-note {
  line-height: 1.2;
  margin-left: -3rem;
}

.step-progress-indicator {
  align-items: center;
  background-color: $blue;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  padding: 0.125rem;

  &--complete {
    background-color: hsl(151, 65%, 48%);
  }
}

.onboarding-source-button {
  transition: all 0.2s ease-in-out;

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

@media (max-width: 992px) {
  .onboarding-source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .onboarding-page {
    padding: 1.5rem 0;
  }

  .onboarding-source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
