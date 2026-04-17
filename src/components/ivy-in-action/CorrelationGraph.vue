<script setup>
import { computed } from "vue";

const DEFAULT_NODES = [
  { id: "identity", label: "Identity", shortLabel: "ID", type: "identity", x: 80, y: 42 },
  { id: "email", label: "Email", shortLabel: "Mail", type: "email", x: 220, y: 42 },
  { id: "endpoint", label: "Endpoint", shortLabel: "EDR", type: "endpoint", x: 360, y: 42 },
  { id: "user", label: "Risky User", shortLabel: "User", type: "user", x: 220, y: 126 },
];

const DEFAULT_EDGES = [
  { from: "identity", to: "user", label: "same session window" },
  { from: "email", to: "user", label: "targeted phish activity" },
  { from: "endpoint", to: "user", label: "infected device tie" },
];

const props = defineProps({
  graph: {
    type: Object,
    default: () => ({}),
  },
});

const nodes = computed(() => {
  const configuredNodes = Array.isArray(props.graph?.nodes) ? props.graph.nodes : [];
  return configuredNodes.length ? configuredNodes : DEFAULT_NODES;
});

const edges = computed(() => {
  const configuredEdges = Array.isArray(props.graph?.edges) ? props.graph.edges : [];
  return configuredEdges.length ? configuredEdges : DEFAULT_EDGES;
});

const nodeMap = computed(() => (
  Object.fromEntries(nodes.value.map((node) => [node.id, node]))
));

const edgesWithCoordinates = computed(() => (
  edges.value
    .map((edge) => {
      const from = nodeMap.value[edge.from];
      const to = nodeMap.value[edge.to];
      if (!from || !to) {
        return null;
      }

      return {
        ...edge,
        from,
        to,
      };
    })
    .filter(Boolean)
));

function nodeTypeClass(type) {
  return `what-ivy-correlation-graph__node--${type || "default"}`;
}

function nodeLabelY(node) {
  return node.type === "user" ? node.y + 31 : node.y - 26;
}
</script>

<template>
  <article class="what-ivy-correlation-graph border bg-light rounded p-3">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="fw-semibold mb-0">Signal Correlation Map</h6>
      <span class="true-small text-secondary">Sample relationship view</span>
    </div>

    <svg
      viewBox="0 0 440 170"
      class="what-ivy-correlation-graph__svg"
    >
      <g>
        <path
          v-for="(edge, edgeIndex) in edgesWithCoordinates"
          :key="`${edge.from.id}-${edge.to.id}-${edgeIndex}`"
          :d="`M ${edge.from.x} ${edge.from.y} Q ${(edge.from.x + edge.to.x) / 2} ${(edge.from.y + edge.to.y) / 2 - 18} ${edge.to.x} ${edge.to.y}`"
          class="what-ivy-correlation-graph__edge"
          :style="{ '--edge-delay': `${edgeIndex * 120}ms` }"
        />
      </g>

      <g
        v-for="node in nodes"
        :key="node.id"
        class="what-ivy-correlation-graph__node"
      >
        <circle
          :cx="node.x"
          :cy="node.y"
          r="20"
          class="what-ivy-correlation-graph__node-backdrop"
        />
        <circle
          :cx="node.x"
          :cy="node.y"
          r="19"
          class="what-ivy-correlation-graph__node-ring"
          :class="nodeTypeClass(node.type)"
        />
        <text
          :x="node.x"
          :y="node.y + 4"
          text-anchor="middle"
          class="true-small fw-semibold what-ivy-correlation-graph__node-short"
        >
          {{ node.shortLabel }}
        </text>
        <text
          :x="node.x"
          :y="nodeLabelY(node)"
          text-anchor="middle"
          class="true-small text-secondary"
        >
          {{ node.label }}
        </text>
      </g>
    </svg>
  </article>
</template>

<style scoped lang="scss">
.what-ivy-correlation-graph__edge {
  animation: what-ivy-edge-draw 0.35s ease-out forwards;
  animation-delay: var(--edge-delay, 0ms);
  fill: none;
  opacity: 0;
  stroke: #465FFF;
  stroke-dasharray: 6 6;
  stroke-width: 2;
}

.what-ivy-correlation-graph__node-backdrop {
  fill: var(--bs-light);
}

.what-ivy-correlation-graph__node-ring {
  stroke-width: 1.5;
}

.what-ivy-correlation-graph__node--default {
  fill: var(--bs-light);
  stroke: var(--bs-secondary);
}

.what-ivy-correlation-graph__node--identity {
  fill: rgba(70, 95, 255, 0.14);
  stroke: #465FFF;
}

.what-ivy-correlation-graph__node--email {
  fill: rgba(11, 165, 236, 0.14);
  stroke: #0BA5EC;
}

.what-ivy-correlation-graph__node--endpoint {
  fill: rgba(3, 152, 85, 0.14);
  stroke: #039855;
}

.what-ivy-correlation-graph__node--user {
  fill: rgba(217, 45, 32, 0.14);
  stroke: #D92D20;
}

.what-ivy-correlation-graph__node-short {
  fill: var(--bs-dark);
}

.what-ivy-correlation-graph__svg {
  display: block;
  height: 10rem;
  overflow: visible;
  width: 100%;
}

@keyframes what-ivy-edge-draw {
  from {
    opacity: 0;
    stroke-dashoffset: 24;
  }

  to {
    opacity: 0.8;
    stroke-dashoffset: 0;
  }
}
</style>
