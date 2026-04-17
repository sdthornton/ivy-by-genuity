<script setup>
import { computed } from "vue";

const CHART_HEIGHT = 76;
const CHART_WIDTH = 300;
const CHART_PADDING = 8;

const props = defineProps({
  scoreCard: {
    type: Object,
    default: () => ({}),
  },
});

const score = computed(() => Number(props.scoreCard?.score || 0));
const title = computed(() => props.scoreCard?.title || "Risk Score");
const subtitle = computed(() => (
  props.scoreCard?.subtitle || "Highest-risk signal from current scan"
));
const trendDelta = computed(() => Number(props.scoreCard?.trendDelta || 0));
const trendLabel = computed(() => props.scoreCard?.trendLabel || "vs previous period");
const series = computed(() => {
  const values = Array.isArray(props.scoreCard?.series) ? props.scoreCard.series : [];
  if (!values.length) {
    return [55, 58, 62, 64, 66, 70, 74, 78];
  }
  return values;
});

const trendPrefix = computed(() => (trendDelta.value >= 0 ? "+" : ""));
const trendClass = computed(() => (
  trendDelta.value >= 0
    ? "what-ivy-risk-score-card__trend--up"
    : "what-ivy-risk-score-card__trend--down"
));

const scoreBadgeClass = computed(() => {
  if (score.value >= 80) {
    return "what-ivy-risk-score-card__badge--high";
  }

  if (score.value >= 60) {
    return "what-ivy-risk-score-card__badge--medium";
  }

  return "what-ivy-risk-score-card__badge--low";
});

const seriesMin = computed(() => Math.min(...series.value));
const seriesMax = computed(() => Math.max(...series.value));
const seriesRange = computed(() => Math.max(seriesMax.value - seriesMin.value, 1));

const chartPoints = computed(() => (
  series.value.map((value, index) => {
    const x = CHART_PADDING + ((index / Math.max(series.value.length - 1, 1)) * (CHART_WIDTH - (CHART_PADDING * 2)));
    const y = CHART_PADDING + (((seriesMax.value - value) / seriesRange.value) * (CHART_HEIGHT - (CHART_PADDING * 2)));
    return { x, y };
  })
));

const sparklinePoints = computed(() => (
  chartPoints.value.map(({ x, y }) => `${x},${y}`).join(" ")
));

const sparklineAreaPath = computed(() => {
  if (!chartPoints.value.length) {
    return "";
  }

  const firstPoint = chartPoints.value[0];
  const lastPoint = chartPoints.value[chartPoints.value.length - 1];
  const linePath = chartPoints.value.map((point, index) => (
    `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
  )).join(" ");

  return `${linePath} L ${lastPoint.x} ${CHART_HEIGHT - CHART_PADDING} L ${firstPoint.x} ${CHART_HEIGHT - CHART_PADDING} Z`;
});
</script>

<template>
  <article class="what-ivy-risk-score-card border bg-light rounded p-3">
    <div class="d-flex align-items-start gap-2 mb-3">
      <div>
        <h6 class="fw-semibold mb-1">{{ title }}</h6>
        <p class="true-small text-secondary mb-0">{{ subtitle }}</p>
      </div>
      <div class="ms-auto d-flex align-items-center gap-1">
        <span class="smallest text-secondary">Risk Score</span>
        <span class="badge" :class="scoreBadgeClass">{{ score }}</span>
      </div>
    </div>

    <div class="d-flex align-items-center mb-2">
      <span class="true-small me-2 text-secondary">Trend</span>
      <span class="true-small fw-semibold" :class="trendClass">
        {{ `${trendPrefix}${trendDelta}%` }}
      </span>
      <span class="true-small text-secondary ms-1">{{ trendLabel }}</span>
    </div>

    <svg
      :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
      preserveAspectRatio="none"
      class="what-ivy-risk-score-card__sparkline"
    >
      <defs>
        <linearGradient id="what-ivy-score-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(70, 95, 255, 0.35)" />
          <stop offset="100%" stop-color="rgba(70, 95, 255, 0.02)" />
        </linearGradient>
      </defs>
      <path
        :d="sparklineAreaPath"
        fill="url(#what-ivy-score-gradient)"
      />
      <polyline
        class="what-ivy-risk-score-card__line"
        :points="sparklinePoints"
        fill="none"
        stroke-linecap="round"
        stroke-width="2.5"
      />
    </svg>
  </article>
</template>

<style scoped lang="scss">
.what-ivy-risk-score-card__badge--high {
  background-color: rgba(217, 45, 32, 0.16);
  color: #D92D20;
}

.what-ivy-risk-score-card__badge--low {
  background-color: rgba(3, 152, 85, 0.15);
  color: #039855;
}

.what-ivy-risk-score-card__badge--medium {
  background-color: rgba(11, 165, 236, 0.16);
  color: #0BA5EC;
}

.what-ivy-risk-score-card__line {
  stroke: #465FFF;
}

.what-ivy-risk-score-card__sparkline {
  display: block;
  height: 4.25rem;
  max-width: 40rem; // matches ivy text max-width
  width: 100%;
}

.what-ivy-risk-score-card__trend--down {
  color: #039855;
}

.what-ivy-risk-score-card__trend--up {
  color: #D92D20;
}
</style>
