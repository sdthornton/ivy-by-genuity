<script setup>
import { computed } from "vue";
import {
  addSplitElseIfCondition,
  getSplitConditionSections,
  setSplitConditionValue,
} from "../stepRuntime";
import StepInfoPanelBase from "./StepInfoPanelBase.vue";

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

const splitConditionSections = computed(() => getSplitConditionSections(props.activeStep?.data));

function handleSplitConditionInput(branchId, event) {
  setSplitConditionValue(props.activeStep.data, branchId, event?.target?.value ?? "");
}

function addSplitElseIf(insertAfterSectionIndex) {
  addSplitElseIfCondition(props.activeStep.data, insertAfterSectionIndex);
}
</script>

<template>
  <StepInfoPanelBase
    :active-step="activeStep"
    :start-block-options="startBlockOptions"
    :source-options="sourceOptions"
    @close="emit('close')"
    @select-start-block="(mode) => emit('select-start-block', mode)"
  >
    <template #details>
      <div class="mt-4 w-100">
        <div class="split-condition-stack d-flex flex-column">
          <template
            v-for="(section, sectionIndex) in splitConditionSections"
            :key="section.id"
          >
            <section class="split-condition-section py-1">
              <div class="split-condition-label true-small text-muted fw-semibold mb-1">
                {{ section.label }}
              </div>
              <input
                type="text"
                class="form-control form-control-sm not-as-small"
                :placeholder="section.placeholder"
                :value="section.value"
                @input="handleSplitConditionInput(section.branchId, $event)"
              >
            </section>
            <button
              v-if="sectionIndex < splitConditionSections.length - 1"
              type="button"
              class="split-condition-separator"
              aria-label="Add Else If condition"
              @click="addSplitElseIf(sectionIndex)"
            >
              <span class="split-condition-separator__line" />
              <span class="split-condition-separator__plus d-inline-flex align-items-center justify-content-center">+</span>
            </button>
          </template>
        </div>
      </div>
    </template>
  </StepInfoPanelBase>
</template>

<style lang="scss" scoped>
.split-condition-label {
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.split-condition-section {
  padding-inline: 0.1rem;
}

.split-condition-separator {
  background: transparent;
  border: 0;
  cursor: pointer;
  display: block;
  height: 1.15rem;
  margin: 0.2rem 0;
  padding: 0;
  position: relative;
  width: 100%;

  &__line {
    border-top: 1px solid var(--bs-gray-200);
    left: 0;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    transition: border-color 120ms ease-in-out;
  }

  &__plus {
    background-color: white;
    border: 1px solid var(--bs-gray-300);
    border-radius: 999px;
    color: var(--bs-gray-600);
    font-size: 0.95rem;
    height: 1.15rem;
    left: 50%;
    line-height: 1;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: border-color 120ms ease-in-out, color 120ms ease-in-out;
    width: 1.15rem;
  }

  &:hover,
  &:focus-visible {
    .split-condition-separator__line {
      border-color: var(--bs-gray-400);
    }

    .split-condition-separator__plus {
      border-color: var(--bs-gray-500);
      color: var(--bs-gray-800);
    }
  }
}
</style>
