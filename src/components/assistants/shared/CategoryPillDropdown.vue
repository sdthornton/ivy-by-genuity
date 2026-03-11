<script setup>
import { computed } from "vue";
import StepOptionsDropdown from "../../shared/StepOptionsDropdown.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "security",
  },
  options: {
    type: Array,
    default: () => [
      "security",
      "threats",
      "activity",
      "monitoring",
      "backup",
      "sync",
      "operations",
      "compliance",
      "access",
    ],
  },
  placement: {
    type: String,
    default: "bottom-start",
  },
  tooltip: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const resolvedCategory = computed(() => String(props.modelValue || "").trim() || "security");

const menuClass = computed(() => "assistant-category-menu");

function formatCategoryLabel(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function selectCategory(category, close) {
  emit("update:modelValue", category);
  close();
}
</script>

<template>
  <StepOptionsDropdown :placement="placement" :menu-class="menuClass">
    <template #trigger>
      <div
        v-tooltip="{ content: tooltip || '', placement: 'top', disabled: !tooltip }"
        class="assistant-category-pill fw-medium true-small text-black text-capitalize rounded-pill px-2 d-inline-flex"
        :class="`bg-category-${resolvedCategory}`"
      >
        <div class="assistant-category-pill__content d-flex align-items-center">
          <span>{{ formatCategoryLabel(resolvedCategory) }}</span>
          <img src="../../../assets/dropdown.svg" height="10" width="10" class="ms-2 opacity-75">
        </div>
      </div>
    </template>
    <template #menu="{ close }">
      <button
        v-for="category in options"
        :key="category"
        type="button"
        class="dropdown-item d-flex align-items-center justify-content-between gap-3 text-start assistant-category-menu__item"
        @click="selectCategory(category, close)"
      >
        <span class="d-inline-flex align-items-center gap-2">
          <span
            class="assistant-category-menu__swatch rounded-pill"
            :class="`bg-category-${category}`"
          />
          <span>{{ formatCategoryLabel(category) }}</span>
        </span>
        <span
          v-if="resolvedCategory === category"
          class="assistant-category-menu__selected text-body-secondary"
        >
          Current
        </span>
      </button>
    </template>
  </StepOptionsDropdown>
</template>

<style lang="scss" scoped>
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
  padding: 0.35rem 0;
}
</style>
