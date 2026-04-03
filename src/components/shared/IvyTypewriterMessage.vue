<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import typewriter from "../../utils/typewriter";

const props = defineProps({
  as: {
    type: String,
    default: "div",
  },
  markup: {
    type: String,
    default: "",
  },
  rerunKey: {
    type: [Number, String],
    default: "",
  },
  timing: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["done"]);

const rootEl = ref(null);
let activeController = null;
let runCounter = 0;

async function runTypewriter() {
  const element = rootEl.value;
  if (!element) {
    return;
  }

  const runId = ++runCounter;
  const controller = new AbortController();
  activeController?.abort();
  activeController = controller;

  try {
    await typewriter(element, props.markup, {
      clearElementFirst: true,
      signal: controller.signal,
      timing: props.timing,
    });
    if (runId === runCounter) {
      emit("done");
    }
  } catch (error) {
    if (error?.name !== "AbortError") {
      throw error;
    }
  } finally {
    if (activeController === controller) {
      activeController = null;
    }
  }
}

onMounted(() => {
  runTypewriter();
});

watch(
  () => [props.markup, props.rerunKey],
  () => {
    runTypewriter();
  },
);

onBeforeUnmount(() => {
  activeController?.abort();
  activeController = null;
});
</script>

<template>
  <component :is="as" ref="rootEl"></component>
</template>
