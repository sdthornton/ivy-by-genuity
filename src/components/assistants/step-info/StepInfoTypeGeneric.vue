<script setup>
import StepInfoPanelBase from "./StepInfoPanelBase.vue";
import StepInfoDetailsTable from "./StepInfoDetailsTable.vue";

defineProps({
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
      <StepInfoDetailsTable :step="activeStep" />
    </template>
  </StepInfoPanelBase>
</template>
