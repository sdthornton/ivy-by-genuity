<script setup>
import StepInfoTypeGeneric from "./StepInfoTypeGeneric.vue";

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
</script>

<template>
  <StepInfoTypeGeneric
    :active-step="props.activeStep"
    :start-block-options="props.startBlockOptions"
    :source-options="props.sourceOptions"
    @close="emit('close')"
    @select-start-block="(mode) => emit('select-start-block', mode)"
  />
</template>
