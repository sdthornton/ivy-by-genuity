<script setup>
import { computed } from "vue";
import {
  addSplitElseIfCondition,
  ensureSplitStepData,
  getSplitConditionSections,
  setSplitConditionValue,
} from "../mockSteps";
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

function addSplitElseIf() {
  ensureSplitStepData(props.activeStep.data);
  addSplitElseIfCondition(props.activeStep.data);
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
        <div class="split-condition-stack d-flex flex-column gap-2">
          <section
            v-for="section in splitConditionSections"
            :key="section.id"
            class="split-condition-section border rounded-sm p-2"
          >
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
            type="button"
            class="split-condition-add btn btn-sm btn-white border rounded-sm align-self-start"
            @click="addSplitElseIf"
          >
            + Else If
          </button>
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
  background-color: white;
}

.split-condition-add {
  min-height: 1.75rem;
}
</style>
