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
        <slot name="menu" :close="closeMenu" />
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

.step-options-menu {
  display: block;
  min-width: 12rem;
  z-index: 1200;
}
</style>
