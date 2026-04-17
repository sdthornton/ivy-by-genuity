<script setup>
import { computed } from "vue";

const props = defineProps({
  completedCount: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Array,
    default: () => [],
  },
});

const totalCount = computed(() => props.steps.length);
const progressPercent = computed(() => {
  if (!totalCount.value) {
    return 0;
  }

  return Math.round((Math.min(props.completedCount, totalCount.value) / totalCount.value) * 100);
});

const displaySteps = computed(() => (
  props.steps.map((step, index) => {
    const isComplete = index < props.completedCount;
    const isCurrent = index === props.completedCount;

    return {
      index,
      isComplete,
      isCurrent,
      label: step,
    };
  })
));
</script>

<template>
  <article class="what-ivy-execution-stepper border bg-light rounded p-3">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="fw-semibold mb-0">Execution Progress</h6>
      <span class="true-small text-secondary">{{ completedCount }}/{{ totalCount }} complete</span>
    </div>

    <div class="progress mb-3 what-ivy-execution-stepper__bar" role="progressbar" aria-label="Execution progress">
      <div class="progress-bar" :style="{ width: `${progressPercent}%` }"></div>
    </div>

    <ol class="list-unstyled mb-0">
      <li
        v-for="step in displaySteps"
        :key="step.label"
        class="what-ivy-execution-stepper__item d-flex gap-3"
      >
        <div
          class="what-ivy-execution-stepper__marker d-flex align-items-center justify-content-center true-small fw-semibold"
          :class="{
            'what-ivy-execution-stepper__marker--complete': step.isComplete,
            'what-ivy-execution-stepper__marker--current': step.isCurrent && !step.isComplete,
          }"
        >
          <span v-if="step.isComplete">&#10003;</span>
          <span v-else>{{ step.index + 1 }}</span>
        </div>
        <div class="pb-3 w-100">
          <div class="not-as-small">{{ step.label }}</div>
          <div class="true-small text-secondary">
            {{ step.isComplete ? "Done" : (step.isCurrent ? "In progress..." : "Queued") }}
          </div>
        </div>
      </li>
    </ol>
  </article>
</template>

<style scoped lang="scss">
.what-ivy-execution-stepper__bar {
  height: 0.4rem;

  .progress-bar {
    background-color: #465FFF;
  }
}

.what-ivy-execution-stepper__item {
  position: relative;

  &:not(:last-child):after {
    background-color: var(--bs-gray-300);
    content: "";
    left: 0.62rem;
    position: absolute;
    top: 1.625rem;
    width: 1px;
    bottom: 0.125rem;
  }
}

.what-ivy-execution-stepper__marker {
  background-color: var(--bs-gray-200);
  border-radius: 50%;
  color: var(--bs-gray-700);
  flex-shrink: 0;
  height: 1.25rem;
  margin-top: 0.1rem;
  width: 1.25rem;
}

.what-ivy-execution-stepper__marker--complete {
  background-color: rgba(3, 152, 85, 0.16);
  color: #039855;
}

.what-ivy-execution-stepper__marker--current {
  animation: what-ivy-current-pulse 1s ease-in-out infinite;
  background-color: rgba(70, 95, 255, 0.15);
  color: #465FFF;
}

@keyframes what-ivy-current-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(70, 95, 255, 0.3);
  }

  70% {
    box-shadow: 0 0 0 0.4rem rgba(70, 95, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(70, 95, 255, 0);
  }
}
</style>
