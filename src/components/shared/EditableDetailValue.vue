<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  align: {
    type: String,
    default: "end",
  },
  multiline: {
    type: Boolean,
    default: false,
  },
  emptyLabel: {
    type: String,
    default: "-",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editableEl = ref(null);
const isFocused = ref(false);

const isEmpty = computed(() => !hasValue(props.modelValue));

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

function normalizeValue(value) {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "")
    .trim();
}

function setEditableText(value) {
  if (!editableEl.value) {
    return;
  }

  const nextValue = normalizeValue(value);
  if (editableEl.value.innerText !== nextValue) {
    editableEl.value.innerText = nextValue;
  }
}

function readEditableText() {
  if (!editableEl.value) {
    return "";
  }

  return normalizeValue(editableEl.value.innerText);
}

function focusEditableSurface() {
  editableEl.value?.focus();

  const selection = window.getSelection();
  if (!selection || !editableEl.value) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(editableEl.value);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function commitEdit() {
  const nextValue = readEditableText();
  emit("update:modelValue", nextValue);
  nextTick(() => setEditableText(nextValue));
}

function revertEdit() {
  setEditableText(props.modelValue);
}

function clearValue() {
  emit("update:modelValue", "");
  nextTick(() => {
    setEditableText("");
    focusEditableSurface();
  });
}

function handleFocus() {
  isFocused.value = true;
  if (!hasValue(props.modelValue)) {
    setEditableText("");
  }
}

function handleBlur() {
  isFocused.value = false;
  commitEdit();
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    revertEdit();
    editableEl.value?.blur();
    return;
  }

  if (!props.multiline && event.key === "Enter") {
    event.preventDefault();
    editableEl.value?.blur();
  }
}

function handlePaste(event) {
  const pastedText = event.clipboardData?.getData("text/plain");
  if (typeof pastedText !== "string") {
    return;
  }

  event.preventDefault();
  document.execCommand("insertText", false, pastedText);
}

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!isFocused.value) {
      setEditableText(nextValue);
    }
  },
  { immediate: true },
);

onMounted(() => {
  setEditableText(props.modelValue);
});
</script>

<template>
  <div
    class="editable-detail-value assistant-step-control"
    :class="{ 'editable-detail-value--focused': isFocused }"
    @click.stop
  >
    <div
      ref="editableEl"
      class="editable-detail-value__surface assistant-step-control true-small"
      :class="{
        'text-end': align === 'end',
        'editable-detail-value__surface--multiline': multiline,
        'editable-detail-value__surface--empty': isEmpty && !isFocused,
      }"
      :data-empty-label="emptyLabel"
      contenteditable="true"
      role="textbox"
      spellcheck="false"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @paste="handlePaste"
    />
    <button
      type="button"
      class="editable-detail-value__clear btn btn-sm btn-white border rounded-circle assistant-step-control"
      aria-label="Set no value"
      @pointerdown.prevent
      @click.stop="clearValue"
    >
      &times;
    </button>
  </div>
</template>

<style scoped>
.editable-detail-value {
  margin-right: -1.75rem;
  min-width: 0;
  padding-right: 1.75rem;
  position: relative;
  width: 100%;
}

.editable-detail-value__surface {
  cursor: text;
  min-height: 1.25rem;
  min-width: 0;
  overflow-wrap: break-word;
  user-select: text;
  white-space: pre-wrap;
  width: 100%;
  word-break: normal;
}

.editable-detail-value__surface--empty::before {
  content: attr(data-empty-label);
  opacity: 0.55;
}

.editable-detail-value__surface--multiline {
  min-height: 2.5rem;
}

.editable-detail-value__clear {
  align-items: center;
  display: inline-flex;
  height: 1.25rem;
  justify-content: center;
  line-height: 1;
  min-width: 1.25rem;
  opacity: 0;
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 120ms ease-in-out;
  width: 1.25rem;
}

.editable-detail-value:hover .editable-detail-value__clear,
.editable-detail-value:focus-within .editable-detail-value__clear,
.editable-detail-value__clear:hover {
  opacity: 1;
  pointer-events: auto;
}
</style>
