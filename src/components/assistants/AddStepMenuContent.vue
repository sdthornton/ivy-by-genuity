<script setup>
const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  closeMenu: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["select"]);

function handleSelect(item) {
  try {
    emit("select", item);
  } finally {
    props.closeMenu?.();
  }
}
</script>

<template>
  <template v-for="(group, groupIndex) in groups" :key="group.key">
    <div v-if="groupIndex > 0" class="dropdown-divider my-2 mx-1 border-top border-body-subtle opacity-100" />
    <div class="label-spacing true-small text-muted px-2 pb-1">{{ group.label }}</div>
    <button
      v-for="item in group.items"
      :key="item.key"
      type="button"
      class="dropdown-item d-flex align-items-center text-start"
      @click.stop="handleSelect(item)"
    >
      <span class="assistant-step-menu-item__icon me-2 rounded-sm d-inline-flex align-items-center justify-content-center" :class="item.typeMeta.bgClass">
        <img
          :src="item.typeMeta.icon"
          width="12"
          height="12"
          class="d-block"
          :class="{ 'invert-to-white': item.typeMeta.iconInvert }"
        >
      </span>
      <span>{{ item.label }}</span>
    </button>
  </template>
</template>

<style lang="scss" scoped>
.assistant-step-menu-item__icon {
  height: 1.25rem;
  width: 1.25rem;
}
</style>
