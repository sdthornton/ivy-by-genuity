<script setup>
import { computed } from "vue";
import BasicDropdown from "../../shared/BasicDropdown.vue";
import AddStepMenuContent from "../AddStepMenuContent.vue";
import {
  addContainerInnerStepSelection,
  getAddStepMenuGroups,
  getContainerInnerSections,
  setContainerInnerStepSelection,
} from "../stepRuntime";
import StepInfoDetailsTable from "./StepInfoDetailsTable.vue";
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
  showDetailsTable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "select-start-block"]);

const addStepMenuGroups = computed(() => getAddStepMenuGroups());
const containerInnerSections = computed(() => (
  getContainerInnerSections(props.activeStep?.data, props.activeStep?.type)
));

function handleContainerSectionSelect(sectionIndex, item, close) {
  setContainerInnerStepSelection(props.activeStep.data, props.activeStep.type, sectionIndex, item);
  close();
}

function handleContainerAddSelect(item, close) {
  addContainerInnerStepSelection(props.activeStep.data, props.activeStep.type, item);
  close();
}
</script>

<template>
  <StepInfoPanelBase
    :active-step="activeStep"
    :start-block-options="startBlockOptions"
    :source-options="sourceOptions"
    @close="emit('close')"
    @select-start-block="emit('select-start-block', $event)"
  >
    <template #details>
      <div class="mt-4 w-100">
        <h6 class="fw-medium mb-1">Inner Boxes</h6>
        <div class="container-inner-sections d-flex align-items-start">
          <section
            v-for="(section, sectionIndex) in containerInnerSections"
            :key="section.id"
            class="container-inner-box border rounded-sm p-2"
          >
            <BasicDropdown
              placement="bottom-start"
              menu-class="container-inner-box__menu"
            >
              <template #trigger>
                <button
                  type="button"
                  class="container-inner-box__trigger"
                  :aria-label="`Choose inner step for section ${sectionIndex + 1}`"
                >
                  <span
                    class="container-inner-box__pill true-small fw-medium rounded-pill px-2 py-0 d-inline-flex align-items-center"
                    :class="{ 'container-inner-box__pill--placeholder': !section.type }"
                  >
                    <span>{{ section.label }}</span>
                    <img src="../../../assets/arrow-down-b.svg" width="10" height="10" class="container-inner-box__caret ms-1">
                  </span>
                </button>
              </template>
              <template #menu="{ close }">
                <AddStepMenuContent
                  :groups="addStepMenuGroups"
                  :close-menu="close"
                  @select="(item) => handleContainerSectionSelect(sectionIndex, item, close)"
                />
              </template>
            </BasicDropdown>
          </section>

          <BasicDropdown
            class="container-inner-add"
            placement="bottom-start"
            menu-class="container-inner-box__menu"
          >
            <template #trigger>
              <button
                type="button"
                class="container-inner-add__trigger btn btn-white border rounded-circle"
                aria-label="Add inner box"
              >
                +
              </button>
            </template>
            <template #menu="{ close }">
              <AddStepMenuContent
                :groups="addStepMenuGroups"
                :close-menu="close"
                @select="(item) => handleContainerAddSelect(item, close)"
              />
            </template>
          </BasicDropdown>
        </div>
      </div>

      <StepInfoDetailsTable
        v-if="showDetailsTable"
        :step="activeStep"
      />
    </template>
  </StepInfoPanelBase>
</template>

<style lang="scss" scoped>
.container-inner-sections {
  gap: 0.5rem;
}

.container-inner-box {
  background-color: white;
  flex: 1 1 0;
  min-width: 0;
}

.container-inner-box__trigger {
  background: transparent;
  border: 0;
  line-height: 0;
  padding: 0;
}

.container-inner-box__pill {
  background-color: var(--bs-gray-200);
  color: var(--bs-gray-700);
}

.container-inner-box__pill--placeholder {
  background-color: var(--bs-gray-100);
  color: var(--bs-gray-600);
}

.container-inner-box__caret {
  opacity: 0.6;
}

.container-inner-add {
  align-self: center;
  display: inline-flex;
}

.container-inner-add__trigger {
  font-size: 1rem;
  height: 1.75rem;
  line-height: 1;
  min-width: 1.75rem;
  padding: 0;
  width: 1.75rem;
}
</style>
