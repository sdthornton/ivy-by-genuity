<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue";

const props = defineProps({
  placement: {
    type: String,
    default: "bottom-end",
  },
  offset: {
    type: Number,
    default: 6,
  },
  viewportPadding: {
    type: Number,
    default: 8,
  },
  menuClass: {
    type: String,
    default: "",
  },
});

const isOpen = ref(false);
const rootEl = ref(null);
const triggerEl = ref(null);
const menuEl = ref(null);
const menuStyle = ref({});

const menuClasses = computed(() => [
  "step-options-menu",
  "dropdown-menu",
  "show",
  props.menuClass,
].filter(Boolean));

const isAlignEnd = computed(() => props.placement.endsWith("end"));
const prefersTop = computed(() => props.placement.startsWith("top"));

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const updateMenuPosition = () => {
  if (!isOpen.value || !triggerEl.value || !menuEl.value) {
    return;
  }

  const triggerRect = triggerEl.value.getBoundingClientRect();
  const menuRect = menuEl.value.getBoundingClientRect();
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const pad = props.viewportPadding;
  const offset = props.offset;
  const minUsableSpace = 160;

  const spaceBelow = viewH - triggerRect.bottom - offset - pad;
  const spaceAbove = triggerRect.top - offset - pad;

  let showAbove = prefersTop.value;
  if (!prefersTop.value && spaceBelow < minUsableSpace && spaceAbove > spaceBelow) {
    showAbove = true;
  } else if (prefersTop.value && spaceAbove < minUsableSpace && spaceBelow > spaceAbove) {
    showAbove = false;
  }

  const availableHeight = Math.max(120, showAbove ? spaceAbove : spaceBelow);
  const maxHeight = Math.max(120, Math.min(availableHeight, viewH - pad * 2));

  const constrainedHeight = Math.min(menuRect.height, maxHeight);
  let top = showAbove
    ? triggerRect.top - offset - constrainedHeight
    : triggerRect.bottom + offset;

  let left = isAlignEnd.value
    ? triggerRect.right - menuRect.width
    : triggerRect.left;

  top = Math.min(Math.max(pad, top), viewH - pad - constrainedHeight);
  left = Math.min(Math.max(pad, left), viewW - pad - menuRect.width);

  const maxWidth = Math.max(180, viewW - pad * 2);

  menuStyle.value = {
    left: `${left}px`,
    maxHeight: `${maxHeight}px`,
    maxWidth: `${maxWidth}px`,
    overflowY: "auto",
    position: "fixed",
    top: `${top}px`,
  };
};

const onViewportChange = () => {
  updateMenuPosition();
};

const onPointerDown = (event) => {
  if (!isOpen.value) {
    return;
  }

  const target = event.target;
  if (rootEl.value?.contains(target) || menuEl.value?.contains(target)) {
    return;
  }

  closeMenu();
};

const onKeyDown = (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
};

watch(isOpen, async (open) => {
  if (!open) {
    return;
  }

  await nextTick();
  updateMenuPosition();
  requestAnimationFrame(updateMenuPosition);
});

onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("scroll", onViewportChange, true);
  window.addEventListener("resize", onViewportChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("scroll", onViewportChange, true);
  window.removeEventListener("resize", onViewportChange);
});
</script>

<template>
  <div
    ref="rootEl"
    class="step-options-dropdown"
    :class="{ 'step-options-dropdown--open': isOpen }"
  >
    <div
      ref="triggerEl"
      class="step-options-trigger"
      role="button"
      tabindex="0"
      @click="toggleMenu"
      @keydown.enter.prevent="toggleMenu"
      @keydown.space.prevent="toggleMenu"
    >
      <slot name="trigger" :open="isOpen" :close="closeMenu" />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="menuEl"
        :class="menuClasses"
        :style="menuStyle"
      >
        <slot name="menu" :close="closeMenu">
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
        </slot>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.step-options-dropdown {
  display: inline-block;
}

.step-options-dropdown--open {
  z-index: 300;
}

.step-options-trigger {
  cursor: pointer;
}

.step-options-menu {
  display: block;
  min-width: 12rem;
  z-index: 1200;
}
</style>
