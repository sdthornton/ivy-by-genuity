<script setup>
import StepInfoTypeContainer from "./StepInfoTypeContainer.vue";

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
  <StepInfoTypeContainer
    :active-step="activeStep"
    :start-block-options="startBlockOptions"
    :source-options="sourceOptions"
    @close="emit('close')"
    @select-start-block="emit('select-start-block', $event)"
  />
</template>
