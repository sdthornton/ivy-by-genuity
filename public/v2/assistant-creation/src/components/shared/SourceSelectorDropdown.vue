<script setup>
import { computed, ref } from "vue";
import BasicDropdown from "./BasicDropdown.vue";
import {
  MOCK_ACTIVE_SOURCES,
  MOCK_INACTIVE_SOURCES,
  resolveSourceIcon,
} from "./sourceCatalog";

const props = defineProps({
  sourceOptions: {
    type: Array,
    default: () => [],
  },
  activeSourceOptions: {
    type: Array,
    default: null,
  },
  inactiveSourceOptions: {
    type: Array,
    default: null,
  },
  placement: {
    type: String,
    default: "bottom-end",
  },
  menuClass: {
    type: String,
    default: "source-picker-menu",
  },
  title: {
    type: String,
    default: "Select Your Source(s)",
  },
  triggerAriaLabel: {
    type: String,
    default: "Add source",
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select-source", "connect-source"]);

const sourceSearch = ref("");
const normalizedQuery = computed(() => sourceSearch.value.trim().toLowerCase());

const allSourceOptions = computed(() => (
  props.sourceOptions
    .map((source) => String(source || "").trim())
    .filter(Boolean)
));

const activeSources = computed(() => (
  Array.isArray(props.activeSourceOptions)
    ? props.activeSourceOptions
      .map((source) => String(source || "").trim())
      .filter(Boolean)
    : allSourceOptions.value.filter((source) => MOCK_ACTIVE_SOURCES.includes(source))
));

const inactiveSources = computed(() => (
  Array.isArray(props.inactiveSourceOptions)
    ? props.inactiveSourceOptions
      .map((source) => String(source || "").trim())
      .filter(Boolean)
    : props.activeSourceOptions
      ? allSourceOptions.value.filter((source) => !activeSources.value.includes(source))
      : allSourceOptions.value.filter((source) => MOCK_INACTIVE_SOURCES.includes(source))
));

const filteredActiveSources = computed(() => {
  if (!props.showSearch || !normalizedQuery.value) {
    return activeSources.value;
  }

  return activeSources.value.filter((source) => String(source).toLowerCase().includes(normalizedQuery.value));
});

const filteredInactiveSources = computed(() => {
  if (!props.showSearch || !normalizedQuery.value) {
    return inactiveSources.value;
  }

  return inactiveSources.value.filter((source) => String(source).toLowerCase().includes(normalizedQuery.value));
});

function selectSource(source, close) {
  emit("select-source", source);
  sourceSearch.value = "";
  close();
}

function connectSource(source, close) {
  emit("connect-source", source);
  if (typeof close === "function") {
    close();
  }
}
</script>

<template>
  <BasicDropdown
    :placement="placement"
    :menu-class="menuClass"
  >
    <template #trigger>
      <slot name="trigger">
        <button
          type="button"
          class="source-selector-trigger rounded bg-white border d-flex align-items-center justify-content-center p-3 text-white fw-bold"
          :aria-label="triggerAriaLabel"
        >
          <img src="../../assets/plus-round.svg" height="14" width="14">
        </button>
      </slot>
    </template>

    <template #menu="{ close }">
      <div class="source-selector-menu p-2">
        <h5 class="fw-normal lead mb-2">
          {{ title }}
        </h5>
        <input
          v-if="showSearch"
          v-model="sourceSearch"
          type="text"
          class="form-control form-control-sm mb-3 rounded-sm"
          placeholder="Search all sources..."
        >

        <template v-if="compact">
          <div class="true-small text-muted mb-1">Active Sources</div>
          <button
            v-for="source in filteredActiveSources"
            :key="`compact-active-${source}`"
            type="button"
            class="dropdown-item d-flex align-items-center gap-2 rounded-sm"
            @click.stop="selectSource(source, close)"
          >
            <img v-if="resolveSourceIcon(source)" :src="resolveSourceIcon(source)" height="16" width="16" :alt="source">
            <span class="smallest text-dark">{{ source }}</span>
            <span class="badge bg-success-subtle text-success-emphasis ms-auto">Active</span>
          </button>

          <div class="true-small text-muted mt-2 mb-1">Other Sources</div>
          <button
            v-for="source in filteredInactiveSources"
            :key="`compact-inactive-${source}`"
            type="button"
            class="dropdown-item d-flex align-items-center gap-2 rounded-sm"
            @click.stop="connectSource(source, close)"
          >
            <img v-if="resolveSourceIcon(source)" :src="resolveSourceIcon(source)" height="16" width="16" :alt="source">
            <span class="smallest text-dark">{{ source }}</span>
          </button>
        </template>

        <template v-else>
          <div class="label-spacing true-small text-muted mb-1">Active Sources</div>
          <div class="source-selector-grid row">
            <div
              v-for="source in filteredActiveSources"
              :key="`active-${source}`"
              class="col-4 mb-1"
              @click.stop="selectSource(source, close)"
            >
              <div class="btn btn-white p-1 d-flex gap-2 align-items-center justify-content-start text-start">
                <img :src="resolveSourceIcon(source)" height="32" width="32" :alt="source">
                <span class="text-dark smallest">{{ source }}</span>
              </div>
            </div>
          </div>

          <div class="label-spacing true-small text-muted mb-1 mt-3">Inactive Sources</div>
          <div class="source-selector-grid row">
            <div
              v-for="source in filteredInactiveSources"
              :key="`inactive-${source}`"
              class="col-4 mb-1"
              @click.stop="connectSource(source, close)"
            >
              <div class="btn btn-white p-1 d-flex gap-2 align-items-center justify-content-start text-start">
                <img :src="resolveSourceIcon(source)" class="inactive-source-icon" height="32" width="32" :alt="source">
                <span class="text-dark smallest">{{ source }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </BasicDropdown>
</template>

<style lang="scss" scoped>
.source-selector-trigger {
  border-color: var(--bs-gray-300) !important;
}

.source-selector-grid {
  width: 28rem;
}
</style>
