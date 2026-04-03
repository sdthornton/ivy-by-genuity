<script setup>
import { computed } from "vue";
import checkmarkIcon from "../../assets/checkmark.svg";
import ellipsesIcon from "../../assets/ellipses.svg";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  stepNumber: {
    type: Number,
    required: true,
  },
  totalSteps: {
    type: Number,
    required: true,
  },
  transitionKey: {
    type: String,
    default: "",
  },
});

const statusIcon = computed(() => (
  props.status === "Complete" ? checkmarkIcon : ellipsesIcon
));

const transitionSeed = computed(() => (
  props.transitionKey || `step-${props.stepNumber}`
));
</script>

<template>
  <div class="onboarding-step-status true-small text-secondary d-flex align-items-center gap-2">
    <Transition name="onboarding-step-note-swap" mode="out-in">
      <span
        :key="`${transitionSeed}-icon-${status}`"
        class="step-progress-indicator"
        :class="{ 'step-progress-indicator--complete': status === 'Complete' }"
      >
        <img
          :src="statusIcon"
          class="invert-to-white"
          width="11"
          height="11"
        >
      </span>
    </Transition>
    <span>Step {{ stepNumber }} of {{ totalSteps }}:</span>
    <Transition name="onboarding-step-note-swap" mode="out-in">
      <span :key="`${transitionSeed}-status-${status}`">{{ status }}.</span>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.onboarding-step-status {
  line-height: 1.2;
}

.step-progress-indicator {
  align-items: center;
  background-color: $blue;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  padding: 0.125rem;

  &--complete {
    background-color: hsl(151, 65%, 48%);
  }
}

.onboarding-step-note-swap-enter-active,
.onboarding-step-note-swap-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.onboarding-step-note-swap-enter-from,
.onboarding-step-note-swap-leave-to {
  opacity: 0;
}
</style>
