<script setup>
import { computed } from "vue";
import StepOptionsDropdown from "../../shared/StepOptionsDropdown.vue";
import {
  getNormalizedWaitMode,
  getWaitModeOptions,
} from "../mockSteps";
import StepInfoPanelBase from "./StepInfoPanelBase.vue";
import StepInfoDetailsTable from "./StepInfoDetailsTable.vue";

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
const waitModeOptions = getWaitModeOptions();

const activeWaitMode = computed(() => getNormalizedWaitMode(props.activeStep?.data?.waitMode));
const activeWaitModeLabel = computed(() => (
  waitModeOptions.find((option) => option.key === activeWaitMode.value)?.label || waitModeOptions[0]?.label || "Set duration"
));

function selectWaitMode(waitMode, close) {
  if (!props.activeStep?.data) {
    close();
    return;
  }

  props.activeStep.data.waitMode = getNormalizedWaitMode(waitMode);
  close();
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
    <template #before-details>
      <div class="mt-4 w-100">
        <h6 class="fw-medium mb-1">Wait Type</h6>
        <StepOptionsDropdown placement="bottom-start" menu-class="wait-mode-menu">
          <template #trigger>
            <button
              type="button"
              class="wait-mode-trigger btn btn-sm btn-white border rounded-sm px-2 py-1 d-inline-flex align-items-center justify-content-between not-as-small"
              aria-label="Select wait type"
            >
              <span>{{ activeWaitModeLabel }}</span>
              <img src="../../../assets/dropdown.svg" width="12" height="12" class="ms-2 opacity-75" alt="">
            </button>
          </template>
          <template #menu="{ close }">
            <button
              v-for="option in waitModeOptions"
              :key="option.key"
              type="button"
              class="dropdown-item text-start"
              @click="selectWaitMode(option.key, close)"
            >
              {{ option.label }}
            </button>
          </template>
        </StepOptionsDropdown>
      </div>
    </template>

    <template #details>
      <StepInfoDetailsTable :step="activeStep" />
    </template>
  </StepInfoPanelBase>
</template>

<style lang="scss" scoped>
:deep(.wait-mode-menu) {
  min-width: 11rem;
}

.wait-mode-trigger {
  min-width: 11rem;
}
</style>
