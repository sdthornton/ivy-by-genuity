<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: "Modal",
  },
  closeLabel: {
    type: String,
    default: "Close modal",
  },
  maxWidth: {
    type: String,
    default: "42rem",
  },
  panelClasses: {
    type: String,
    default: "p-5",
  },
});

defineEmits(["close"]);
</script>

<template>
  <Teleport to="body">
    <Transition name="centered-modal-backdrop">
      <button
        v-if="props.open"
        type="button"
        class="centered-modal-backdrop"
        :aria-label="props.closeLabel"
        @click="$emit('close')"
      />
    </Transition>
    <Transition name="centered-modal-panel">
      <aside
        v-if="props.open"
        class="centered-modal bg-white rounded"
        role="dialog"
        aria-modal="true"
        :aria-label="props.ariaLabel"
        :style="{ maxWidth: `min(${props.maxWidth}, calc(100vw - 2rem))` }"
      >
        <button
          type="button"
          class="centered-modal__close btn btn-sm btn-white d-flex align-items-center justify-content-center"
          :aria-label="props.closeLabel"
          @click.stop.prevent="$emit('close')"
        >
          &times;
        </button>
        <div :class="props.panelClasses">
          <slot />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.centered-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.35);
  border: 0;
  inset: 0;
  padding: 0;
  position: fixed;
  z-index: 60;
}

.centered-modal {
  box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.20);
  left: 50%;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  z-index: 61;
}

.centered-modal__close {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
}

.centered-modal-backdrop-enter-active,
.centered-modal-backdrop-leave-active,
.centered-modal-panel-enter-active,
.centered-modal-panel-leave-active {
  transition: all 0.2s ease-in-out;
}

.centered-modal-backdrop-enter-from,
.centered-modal-backdrop-leave-to {
  opacity: 0;
}

.centered-modal-backdrop-enter-to,
.centered-modal-backdrop-leave-from {
  opacity: 1;
}

.centered-modal-panel-enter-from,
.centered-modal-panel-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 1rem));
}

.centered-modal-panel-enter-to,
.centered-modal-panel-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}
</style>
