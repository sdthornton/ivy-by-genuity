<script setup>
import { ref, computed } from "vue";
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import { sourceOptions, createSidebarStepMap } from "./mockSteps";

const props = defineProps({
  selectedStepId: {
    type: Number,
    default: 2,
  },
});

const emit = defineEmits(["close"]);

const showQueryWarning = ref(true);
const queryCode = ref("GET foo.bar");
const sourceSearch = ref("");

const stepMap = createSidebarStepMap();

const activeStep = computed(() => stepMap[props.selectedStepId] || stepMap[2]);

const ignoreQueryWarning = () => {
  showQueryWarning.value = false;
};

const fixQueryWarning = () => {
  queryCode.value = "SELECT [User], [AuditValue] FROM [SP GetAudit] WHERE [User] IS NOT NULL AND [AuditValue] >= DATEADD(day, -1, GETUTCDATE())";
  showQueryWarning.value = false;
};
</script>

<template>
  <div class="step2-info-panel d-flex flex-column h-100">
    <button
      type="button"
      class="step2-info-close-btn btn btn-sm btn-white d-flex align-items-center justify-content-center"
      aria-label="Close step details"
      @click="emit('close')"
    >
      &times;
    </button>

    <div class="step2-info-top d-flex flex-column">
      <div class="side-content-scroll d-flex flex-column align-items-start">
        <StepOptionsDropdown class="step-type-pill-dropdown" placement="bottom-start">
          <template #trigger>
            <div class="step-type-pill true-small fw-medium text-white d-inline-flex align-items-center rounded-pill px-2 py-0" :class="activeStep.typeMeta.bgClass">
              <img :src="activeStep.typeMeta.icon" width="16" height="16" class="d-inline-block me-1" :class="{ 'invert-to-white': activeStep.typeMeta.iconInvert }">
              <span>{{ activeStep.pill }}</span>
              <img src="../../assets/arrow-down-b.svg" width="12" height="12" class="source-pill-caret ms-1">
            </div>
          </template>
        </StepOptionsDropdown>

        <div class="d-flex align-items-center mt-2">
          <h4 class="fw-bold mb-0 me-3">{{ activeStep.title }}</h4>
          <img src="../../assets/edit.svg" height="12" width="12" class="opacity-50">
        </div>

        <div v-if="activeStep.sources.length" class="mt-4 w-100">
          <h6 class="fw-medium mb-1">Source(s)</h6>
          <div class="d-flex align-items-center">
            <div
              v-for="source in activeStep.sources"
              :key="source.label"
              class="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center px-2.5 py-2.5 me-2"
            >
              <img :src="source.icon" height="20" width="20">
            </div>
            <StepOptionsDropdown
              class="source-picker-wrap"
              placement="bottom-end"
              menu-class="source-picker-menu"
            >
              <template #trigger>
                <button
                  type="button"
                  class="source-picker-trigger rounded-circle bg-white border d-flex align-items-center justify-content-center p-3 text-white fw-bold"
                  aria-label="Add source"
                >
                  <img src="../../assets/plus-round.svg" height="14" width="14">
                </button>
              </template>
              <template #menu>
                <div class="source-picker-title true-small text-muted">Your sources.</div>
                <input
                  v-model="sourceSearch"
                  type="text"
                  class="source-picker-search form-control form-control-sm true-small"
                  placeholder="search sources"
                >
                <div class="source-picker-grid">
                  <button
                    v-for="source in sourceOptions"
                    :key="source"
                    type="button"
                    class="source-picker-item true-small"
                  >
                    {{ source }}
                  </button>
                </div>
              </template>
            </StepOptionsDropdown>
          </div>
        </div>

        <div class="mt-4 w-100">
          <h6 class="fw-medium mb-1">Details</h6>
          <table class="table table-striped w-100 not-as-small mb-0">
            <tbody>
              <tr
                v-for="row in activeStep.rows"
                :key="row.key"
              >
                <td>{{ row.key }}</td>
                <td :class="{ 'query-code-cell': row.isCode }">
                  <template v-if="row.isCode">
                    <div v-if="row.showWarning && showQueryWarning" class="query-warning-wrap">
                      <button
                        type="button"
                        class="query-warning-trigger"
                        aria-label="Ivy warning: It looks like this code won't run as intended."
                      >
                        <img src="../../assets/warning.svg" width="14" height="14" alt="">
                      </button>
                      <div class="query-warning-tooltip true-small" role="tooltip">
                        <p class="query-warning-copy mb-1">Ivy: It looks like this code won't run as intended.</p>
                        <div class="query-warning-actions mb-1">
                          <button
                            type="button"
                            class="query-warning-action query-warning-action-ignore"
                            @click.stop="ignoreQueryWarning"
                          >
                            Ignore
                          </button>
                          <button
                            type="button"
                            class="query-warning-action query-warning-action-fix"
                            @click.stop="fixQueryWarning"
                          >
                            Fix This
                          </button>
                        </div>
                      </div>
                    </div>
                    <code>{{ row.code || queryCode }}</code>
                  </template>
                  <template v-else>
                    {{ row.value }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 w-100">
          <h6 class="fw-medium mb-1">Comments</h6>
          <div class="comments-stack d-flex flex-column gap-2">
            <div
              v-for="comment in activeStep.comments"
              :key="`${comment.author}-${comment.stamp}`"
              class="comment-item bg-titan-white rounded-sm p-2"
            >
              <div class="comment-author true-small mb-1">{{ comment.author }}</div>
              <p class="comment-body not-as-small mb-0">{{ comment.body }}</p>
              <div class="comment-meta text-end">{{ comment.stamp }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ivy-says-shell pt-2 bg-white">
      <div class="ivy-says-sticky text-secondary bg-iceberg-blue p-3 rounded-sm not-as-small">
        <img src="../../assets/nav-resources-alt.svg" height="16" width="16" class="me-2">
        <strong>Ivy says:</strong> {{ activeStep.ivySays }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step2-info-panel {
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.step2-info-top {
  flex: 1;
  min-height: 0;
}

.step2-info-close-btn {
  font-size: 1.5rem;
  height: 2rem;
  line-height: 1;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  width: 2rem;
  z-index: 6;
}

.side-content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.5rem;
  width: 100%;
}

.step-type-pill {
  position: relative;
  z-index: 2;
}

.source-pill-caret {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.source-picker-wrap {
  position: relative;
}

.source-picker-trigger {
  border-color: var(--bs-gray-300) !important;
}

:deep(.source-picker-menu) {
  display: block;
  min-width: 18.5rem;
  padding: 0.6rem;
  z-index: 16;
}

:deep(.source-picker-menu) .source-picker-title {
  margin-bottom: 0.45rem;
}

:deep(.source-picker-menu) .source-picker-search {
  font-size: 0.65rem;
  margin-bottom: 0.5rem;
}

:deep(.source-picker-menu) .source-picker-grid {
  display: grid;
  gap: 0.2rem 0.45rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

:deep(.source-picker-menu) .source-picker-item {
  background: transparent;
  border: 0;
  color: var(--bs-gray-600);
  line-height: 1.25;
  padding: 0.12rem 0;
  text-align: left;
}

:deep(.source-picker-menu) .source-picker-item:hover {
  color: var(--bs-gray-900);
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
  border-color: transparent;
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
  margin-top: auto;
  padding: 0 1.5rem 1.5rem;
  width: 100%;
  z-index: 2;
}

.ivy-says-sticky {
  position: relative;
}
</style>
