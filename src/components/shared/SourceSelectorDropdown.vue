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
});

const emit = defineEmits(["select-source", "connect-source"]);

const sourceSearch = ref("");
const normalizedQuery = computed(() => sourceSearch.value.trim().toLowerCase());

const activeSources = computed(() => (
  props.sourceOptions.filter((source) => MOCK_ACTIVE_SOURCES.includes(source))
));

const inactiveSources = computed(() => (
  props.sourceOptions.filter((source) => MOCK_INACTIVE_SOURCES.includes(source))
));

const filteredActiveSources = computed(() => {
  if (!normalizedQuery.value) {
    return activeSources.value;
  }

  return activeSources.value.filter((source) => String(source).toLowerCase().includes(normalizedQuery.value));
});

const filteredInactiveSources = computed(() => {
  if (!normalizedQuery.value) {
    return inactiveSources.value;
  }

  return inactiveSources.value.filter((source) => String(source).toLowerCase().includes(normalizedQuery.value));
});

function selectSource(source, close) {
  emit("select-source", source);
  sourceSearch.value = "";
  close();
}

function connectSource(source) {
  emit("connect-source", source);
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
          v-model="sourceSearch"
          type="text"
          class="form-control form-control-sm mb-3 rounded-sm"
          placeholder="Search all sources..."
        >

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
            @click.stop="connectSource(source)"
          >
            <div class="btn btn-white p-1 d-flex gap-2 align-items-center justify-content-start text-start">
              <img :src="resolveSourceIcon(source)" class="inactive-source-icon" height="32" width="32" :alt="source">
              <span class="text-dark smallest">{{ source }}</span>
            </div>
          </div>
        </div>
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

