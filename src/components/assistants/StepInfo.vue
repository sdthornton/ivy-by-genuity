<script setup>
import { computed } from "vue";
import {
  getSidebarStep,
} from "./mockSteps";
import {
  getStartBlockOptions,
  sourceOptions,
} from "./stepRuntime";
import StepInfoTypeGeneric from "./step-info/StepInfoTypeGeneric.vue";
import StepInfoTypeLoop from "./step-info/StepInfoTypeLoop.vue";
import StepInfoTypeParallel from "./step-info/StepInfoTypeParallel.vue";
import StepInfoTypeSplit from "./step-info/StepInfoTypeSplit.vue";
import StepInfoTypeWait from "./step-info/StepInfoTypeWait.vue";

const props = defineProps({
  selectedStepId: {
    type: Number,
    default: 2,
  },
  startBlockMode: {
    type: String,
    default: "start",
  },
  startTriggerOption: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "select-start-block"]);

const activeStep = computed(() => getSidebarStep(props.selectedStepId, {
  startBlockMode: props.startBlockMode,
  startTriggerOption: props.startTriggerOption,
}));

const startBlockOptions = computed(() => getStartBlockOptions());

const STEP_INFO_COMPONENT_BY_TYPE = {
  start: StepInfoTypeGeneric,
  schedule: StepInfoTypeGeneric,
  trigger: StepInfoTypeGeneric,
  lookup: StepInfoTypeGeneric,
  code: StepInfoTypeGeneric,
  message: StepInfoTypeGeneric,
  action: StepInfoTypeGeneric,
  wait: StepInfoTypeWait,
  note: StepInfoTypeGeneric,
  split: StepInfoTypeSplit,
  parallel: StepInfoTypeParallel,
  loop: StepInfoTypeLoop,
  alert: StepInfoTypeGeneric,
};

const activeStepComponent = computed(() => (
  STEP_INFO_COMPONENT_BY_TYPE[activeStep.value?.type] || StepInfoTypeGeneric
));
</script>

<template>
  <component
    :is="activeStepComponent"
    :active-step="activeStep"
    :start-block-options="startBlockOptions"
    :source-options="sourceOptions"
    @close="emit('close')"
    @select-start-block="emit('select-start-block', $event)"
  />
</template>
