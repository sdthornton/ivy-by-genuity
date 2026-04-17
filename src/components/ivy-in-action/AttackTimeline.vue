<script setup>
const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  subtitle: {
    type: String,
    default: "How this risk escalated across connected sources.",
  },
  title: {
    type: String,
    default: "Attack Timeline",
  },
});

function getSeverityClass(severity = "") {
  const normalized = String(severity).toLowerCase();
  if (normalized === "critical") {
    return "what-ivy-attack-timeline__severity--critical";
  }

  if (normalized === "high") {
    return "what-ivy-attack-timeline__severity--high";
  }

  if (normalized === "medium") {
    return "what-ivy-attack-timeline__severity--medium";
  }

  return "what-ivy-attack-timeline__severity--default";
}
</script>

<template>
  <article class="what-ivy-attack-timeline border bg-white rounded p-3">
    <h6 class="fw-semibold mb-1">{{ title }}</h6>
    <p class="true-small text-secondary mb-3">{{ subtitle }}</p>

    <div class="d-flex align-items-stretch flex-wrap gap-2">
      <template v-for="(event, index) in props.events" :key="`${event.time}-${event.title}`">
        <div class="what-ivy-attack-timeline__event border rounded bg-light p-2">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="true-small text-secondary">{{ event.time }}</span>
            <span class="badge true-small what-ivy-attack-timeline__severity" :class="getSeverityClass(event.severity)">
              {{ event.severity }}
            </span>
          </div>
          <p class="mb-1 fw-semibold true-small">{{ event.title }}</p>
          <p class="mb-0 true-small text-secondary">{{ event.detail }}</p>
        </div>
        <div
          v-if="index < props.events.length - 1"
          class="what-ivy-attack-timeline__arrow text-secondary d-flex align-items-center justify-content-center"
        >
          <span aria-hidden="true">→</span>
        </div>
      </template>
    </div>
  </article>
</template>

<style scoped lang="scss">
.what-ivy-attack-timeline__arrow {
  min-width: 1.25rem;
}

.what-ivy-attack-timeline__event {
  flex: 1 1 11rem;
  min-width: 10rem;
}

.what-ivy-attack-timeline__severity {
  border: 1px solid transparent;
}

.what-ivy-attack-timeline__severity--critical {
  background-color: rgba(217, 45, 32, 0.15);
  border-color: rgba(217, 45, 32, 0.24);
  color: #D92D20;
}

.what-ivy-attack-timeline__severity--default {
  background-color: rgba(70, 95, 255, 0.14);
  border-color: rgba(70, 95, 255, 0.25);
  color: #465FFF;
}

.what-ivy-attack-timeline__severity--high {
  background-color: rgba(217, 45, 32, 0.11);
  border-color: rgba(217, 45, 32, 0.18);
  color: #B42318;
}

.what-ivy-attack-timeline__severity--medium {
  background-color: rgba(11, 165, 236, 0.14);
  border-color: rgba(11, 165, 236, 0.24);
  color: #0BA5EC;
}
</style>
