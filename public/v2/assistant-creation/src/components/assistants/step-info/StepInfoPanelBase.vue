<script setup>
import { computed } from "vue";
import BasicDropdown from "../../shared/BasicDropdown.vue";
import SourceSelectorDropdown from "../../shared/SourceSelectorDropdown.vue";
import { resolveSourceIcon } from "../../shared/sourceCatalog";

const props = defineProps({
  activeStep: {
    type: Object,
    required: true,
  },
  startBlockOptions: {
    type: Array,
    default: () => [],
  },
  sourceOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "select-start-block"]);

const isLookupStep = computed(() => props.activeStep?.type === "lookup");
const displayedSources = computed(() => {
  const explicitSources = Array.isArray(props.activeStep?.sources)
    ? props.activeStep.sources.filter((source) => source?.label)
    : [];
  if (explicitSources.length) {
    return explicitSources;
  }

  if (!isLookupStep.value) {
    return [];
  }

  const selectedSource = String(props.activeStep?.data?.source || "").trim();
  if (!selectedSource) {
    return [];
  }

  return [{ label: selectedSource, icon: resolveSourceIcon(selectedSource) }];
});

const hasSourceSection = computed(() => isLookupStep.value || displayedSources.value.length > 0);

function selectSource(source) {
  if (props.activeStep?.data && typeof props.activeStep.data === "object") {
    props.activeStep.data.source = source;
  }

  if (!Array.isArray(props.activeStep?.sources)) {
    props.activeStep.sources = [];
  }

  const existingSource = props.activeStep.sources.find((entry) => (
    String(entry?.label || "").trim().toLowerCase() === String(source).trim().toLowerCase()
  ));

  if (!existingSource) {
    props.activeStep.sources.push({
      label: source,
      icon: resolveSourceIcon(source),
    });
  } else if (!existingSource.icon) {
    existingSource.icon = resolveSourceIcon(source);
  }
}

function connectSource() {
  alert('Normally this would show the connector modal, possibly with a note that "You will need to connect or reactivate this app before using it as a data source."');
}
</script>

<template>
  <div class="step-info-panel d-flex flex-column h-100">
    <button
      type="button"
      class="step-info-close-btn btn btn-sm btn-white rounded-circle d-flex align-items-center justify-content-center"
      aria-label="Close step details"
      @click="emit('close')"
    >
      &times;
    </button>

    <div class="step-info-top d-flex flex-column">
      <div class="side-content-scroll d-flex flex-column align-items-start">
        <BasicDropdown
          v-if="activeStep.isStartBlock"
          placement="bottom-start"
          @click.stop
        >
          <template #trigger>
            <div class="step-type-pill true-small fw-medium text-white d-inline-flex align-items-center rounded-pill px-2 py-0" :class="activeStep.typeMeta.bgClass">
              <img :src="activeStep.typeMeta.icon" width="16" height="16" class="d-inline-block me-1" :class="{ 'invert-to-white': activeStep.typeMeta.iconInvert }">
              <span>{{ activeStep.pill }}</span>
              <img src="../../../assets/dropdown.svg" width="12" height="12" class="source-pill-caret ms-1">
            </div>
          </template>
          <template #menu="{ close }">
            <div class="label-spacing true-small text-muted px-2 pb-1">Starting Blocks</div>
            <button
              v-for="option in startBlockOptions"
              :key="option.key"
              type="button"
              class="dropdown-item d-flex align-items-center text-start"
              @click.stop="emit('select-start-block', option.key); close()"
            >
              <span class="step-type-pill-dropdown__icon me-2 rounded-sm d-inline-flex align-items-center justify-content-center" :class="option.typeMeta.bgClass">
                <img
                  :src="option.typeMeta.icon"
                  width="12"
                  height="12"
                  class="d-block"
                  :class="{ 'invert-to-white': option.typeMeta.iconInvert }"
                >
              </span>
              <span>{{ option.label }}</span>
            </button>
          </template>
        </BasicDropdown>
        <div
          v-else
          class="step-type-pill true-small fw-medium text-white d-inline-flex align-items-center rounded-pill px-2 py-0"
          :class="activeStep.typeMeta.bgClass"
        >
          <img :src="activeStep.typeMeta.icon" width="16" height="16" class="d-inline-block me-1" :class="{ 'invert-to-white': activeStep.typeMeta.iconInvert }">
          <span>{{ activeStep.pill }}</span>
        </div>

        <div class="d-flex align-items-center mt-2">
          <h4 class="fw-bold mb-0 me-3">{{ activeStep.title }}</h4>
          <img src="../../../assets/edit.svg" height="12" width="12" class="opacity-50">
        </div>

        <div v-if="hasSourceSection" class="mt-4 w-100">
          <h6 class="fw-medium mb-1">Source(s)</h6>
          <div class="d-flex align-items-center">
            <div
              v-for="source in displayedSources"
              :key="source.label"
              class="d-flex align-items-center justify-content-center me-2"
            >
              <img 
                v-if="source.icon" 
                v-tooltip="source.label"
                :src="source.icon" 
                height="48" 
                width="48" 
                :alt="source.label"
              >
            </div>
            <SourceSelectorDropdown
              :source-options="sourceOptions"
              @select-source="selectSource"
              @connect-source="connectSource"
            />
          </div>
        </div>

        <slot name="before-details" />
        <slot name="details" />

        <div class="mt-4 w-100">
          <h6 class="fw-medium mb-1">Comments</h6>
          <div class="comments-stack d-flex flex-column gap-2">
            <template v-if="activeStep.comments.length">
              <div
                v-for="comment in activeStep.comments"
                :key="`${comment.author}-${comment.stamp}`"
                class="comment-item bg-titan-white rounded-sm p-2"
              >
                <div class="comment-author true-small mb-1">{{ comment.author }}</div>
                <p class="comment-body not-as-small mb-0">{{ comment.body }}</p>
                <div class="comment-meta text-end">{{ comment.stamp }}</div>
              </div>
            </template>
            <p v-else class="not-as-small text-secondary mb-0">No comments.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="ivy-says-shell pt-2 bg-white">
      <div class="border position-relative text-secondary bg-iceberg-blue p-3 rounded-sm not-as-small">
        <img src="../../../assets/nav-resources-alt.svg" height="16" width="16" class="me-2">
        <strong>Ivy says:</strong> {{ activeStep.ivySays }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step-info-panel {
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.step-info-top {
  flex: 1;
  min-height: 0;
}

.step-info-close-btn {
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

.step-type-pill-dropdown__icon {
  height: 1.25rem;
  width: 1.25rem;
}

.source-pill-caret {
  filter: brightness(0) invert(1);
  opacity: 0.8;
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
  margin-top: 0.375rem;
}

.ivy-says-shell {
  margin-top: auto;
  padding: 0 1.5rem 1.5rem;
  width: 100%;
  z-index: 2;
}
</style>
