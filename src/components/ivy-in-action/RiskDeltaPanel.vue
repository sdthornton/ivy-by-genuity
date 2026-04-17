<script setup>
import { computed } from "vue";

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  subtitle: {
    type: String,
    default: "Projected impact after running the selected plan.",
  },
  title: {
    type: String,
    default: "Before vs After",
  },
});

const beforeScore = computed(() => Number(props.summary?.beforeScore || 0));
const afterScore = computed(() => Number(props.summary?.afterScore || 0));
const protectedAccounts = computed(() => Number(props.summary?.protectedAccounts || 0));
const policiesApplied = computed(() => Number(props.summary?.policiesApplied || 0));

const scoreDrop = computed(() => Math.max(beforeScore.value - afterScore.value, 0));
const scoreReductionPercent = computed(() => (
  beforeScore.value > 0
    ? Math.round((scoreDrop.value / beforeScore.value) * 100)
    : 0
));

function getBarWidth(scoreValue) {
  const normalizedScore = Math.max(0, Math.min(100, Number(scoreValue || 0)));
  return `${normalizedScore}%`;
}
</script>

<template>
  <article class="what-ivy-risk-delta border bg-light rounded p-3">
    <h6 class="fw-semibold mb-1">{{ title }}</h6>
    <p class="true-small text-secondary mb-3">{{ subtitle }}</p>

    <div class="row g-3 mb-3">
      <div class="col-sm-6">
        <div class="true-small text-secondary mb-1">Before</div>
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="fw-semibold">Risk Score</span>
          <span class="badge what-ivy-risk-delta__badge--before">{{ beforeScore }}</span>
        </div>
        <div class="progress">
          <div class="progress-bar what-ivy-risk-delta__bar--before" :style="{ width: getBarWidth(beforeScore) }"></div>
        </div>
      </div>

      <div class="col-sm-6">
        <div class="true-small text-secondary mb-1">After</div>
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="fw-semibold">Risk Score</span>
          <span class="badge what-ivy-risk-delta__badge--after">{{ afterScore }}</span>
        </div>
        <div class="progress">
          <div class="progress-bar what-ivy-risk-delta__bar--after" :style="{ width: getBarWidth(afterScore) }"></div>
        </div>
      </div>
    </div>

    <div class="d-flex flex-wrap gap-2">
      <div class="rounded-pill border bg-white px-2 py-1 true-small text-secondary">
        <strong class="text-dark me-1">{{ scoreDrop }}-point drop</strong>
        in overall risk.
      </div>
      <div class="rounded-pill border bg-white px-2 py-1 true-small text-secondary">
        <strong class="text-dark me-1">{{ scoreReductionPercent }}%</strong>
        projected reduction.
      </div>
      <div class="rounded-pill border bg-white px-2 py-1 true-small text-secondary">
        <strong class="text-dark me-1">{{ protectedAccounts }}</strong>
        accounts secured.
      </div>
      <div class="rounded-pill border bg-white px-2 py-1 true-small text-secondary">
        <strong class="text-dark me-1">{{ policiesApplied }}</strong>
        baseline policy applied.
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.what-ivy-risk-delta__badge--after {
  background-color: rgba(3, 152, 85, 0.15);
  color: #039855;
}

.what-ivy-risk-delta__badge--before {
  background-color: rgba(217, 45, 32, 0.16);
  color: #D92D20;
}

.what-ivy-risk-delta__bar--after {
  background-color: #039855;
}

.what-ivy-risk-delta__bar--before {
  background-color: #D92D20;
}
</style>
