<script setup>
import { computed } from "vue";
import {
  getSidebarStep,
  getStartBlockOptions,
  sourceOptions,
} from "./mockSteps";
import StepInfoTypeAction from "./step-info/StepInfoTypeAction.vue";
import StepInfoTypeAlert from "./step-info/StepInfoTypeAlert.vue";
import StepInfoTypeCode from "./step-info/StepInfoTypeCode.vue";
import StepInfoTypeGeneric from "./step-info/StepInfoTypeGeneric.vue";
import StepInfoTypeLookup from "./step-info/StepInfoTypeLookup.vue";
import StepInfoTypeLoop from "./step-info/StepInfoTypeLoop.vue";
import StepInfoTypeMessage from "./step-info/StepInfoTypeMessage.vue";
import StepInfoTypeNote from "./step-info/StepInfoTypeNote.vue";
import StepInfoTypeParallel from "./step-info/StepInfoTypeParallel.vue";
import StepInfoTypeSchedule from "./step-info/StepInfoTypeSchedule.vue";
import StepInfoTypeSplit from "./step-info/StepInfoTypeSplit.vue";
import StepInfoTypeStart from "./step-info/StepInfoTypeStart.vue";
import StepInfoTypeTrigger from "./step-info/StepInfoTypeTrigger.vue";
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
  start: StepInfoTypeStart,
  schedule: StepInfoTypeSchedule,
  trigger: StepInfoTypeTrigger,
  lookup: StepInfoTypeLookup,
  code: StepInfoTypeCode,
  message: StepInfoTypeMessage,
  action: StepInfoTypeAction,
  wait: StepInfoTypeWait,
  note: StepInfoTypeNote,
  split: StepInfoTypeSplit,
  parallel: StepInfoTypeParallel,
  loop: StepInfoTypeLoop,
  alert: StepInfoTypeAlert,
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
    @select-start-block="(mode) => emit('select-start-block', mode)"
  />
</template>
