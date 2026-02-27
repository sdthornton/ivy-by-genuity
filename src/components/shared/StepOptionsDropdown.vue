<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const isOpen = ref(false);
const rootEl = ref(null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const onPointerDown = (event) => {
  if (!rootEl.value?.contains(event.target)) closeMenu();
};

const onKeyDown = (event) => {
  if (event.key === "Escape") closeMenu();
};

onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div
    ref="rootEl"
    class="step-options-dropdown"
    :class="{ 'step-options-dropdown--open': isOpen }"
  >
    <div
      class="step-options-trigger"
      role="button"
      tabindex="0"
      @click="toggleMenu"
      @keydown.enter.prevent="toggleMenu"
      @keydown.space.prevent="toggleMenu"
    >
      <slot name="trigger" :open="isOpen" />
    </div>

    <div v-if="isOpen" class="step-options-menu dropdown-menu show">
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-lookup me-2 p-1">
          <img src="../../assets/sim-ai/lookup.svg" height="12" width="12" class="d-block">
        </div>
        <span>Data Source(s)</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-trigger me-2 p-1">
          <img src="../../assets/sim-ai/trigger.svg" height="12" width="12" class="invert-to-white d-block">
        </div>
        <span>Trigger</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-schedule me-2 p-1">
          <img src="../../assets/sim-ai/calendar.svg" height="12" width="12" class="d-block">
        </div>
        <span>Schedule</span>
      </a>
      <hr class="my-2 mx-1 border-top border-body-subtle opacity-100">
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-split me-2 p-1">
          <img src="../../assets/sim-ai/split.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Conditional Split</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-parallel me-2 p-1">
          <img src="../../assets/sim-ai/parallel.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Parallel Steps</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-wait me-2 p-1">
          <img src="../../assets/sim-ai/wait.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Wait/Delay</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-loop me-2 p-1">
          <img src="../../assets/sim-ai/loop.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Loop</span>
      </a>
      <hr class="my-2 mx-1 border-top border-body-subtle opacity-100">
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-primary me-2 p-1">
          <img src="../../assets/sim-ai/action.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Ivy Action</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-code me-2 p-1">
          <img src="../../assets/sim-ai/code.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Run Code</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-note me-2 p-1">
          <img src="../../assets/sim-ai/note.svg" height="12" width="12" class="d-block">
        </div>
        <span>Create Note</span>
      </a>
      <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="closeMenu">
        <div style="border-radius: 0.25rem;" class="bg-alert me-2 p-1">
          <img src="../../assets/sim-ai/alert.svg" height="12" width="12" class="d-block invert-to-white">
        </div>
        <span>Set Alert</span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step-options-dropdown {
  display: inline-block;
  position: relative;
}

.step-options-dropdown--open {
  z-index: 300;
}

.step-options-trigger {
  cursor: pointer;
}

.step-options-menu {
  display: block;
  left: 0;
  margin-top: 0.35rem;
  min-width: 12rem;
  top: 100%;
  z-index: 301;
}
</style>
