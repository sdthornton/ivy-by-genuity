<script setup>
import { computed } from "vue";
import EditableDetailValue from "../../shared/EditableDetailValue.vue";
import {
  getVisibleStepRows,
} from "../stepRuntime";
import {
  applyStepWarningFix,
  isStepWarningVisible,
  setStepWarningVisible,
} from "../mockSteps";

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
});

const rows = computed(() => (
  getVisibleStepRows(props.step).filter((row) => !row?.hideInStepInfo)
));

function hasDetailValue(value) {
  return String(value ?? "").trim().length > 0;
}

function isRowWarningVisible(row) {
  if (!row?.isCode || !hasDetailValue(props.step?.data?.[row.dataKey])) {
    return false;
  }

  return isStepWarningVisible(
    props.step.stateKey || props.step.id,
    row.dataKey,
    row.showWarning,
  );
}

function ignoreQueryWarning() {
  setStepWarningVisible(props.step.stateKey || props.step.id, "code", false);
}

function fixQueryWarning() {
  const stepKey = props.step.stateKey || props.step.id;
  applyStepWarningFix(stepKey, "code");
}
</script>

<template>
  <div class="mt-4 w-100">
    <h6 class="fw-medium mb-2">Details/Config</h6>
    <table class="table table-striped w-100 not-as-small mb-0 step-info-details-table">
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.key"
        >
          <td class="query-key-cell">
            <span class="query-key-label">
              <VDropdown
                v-if="isRowWarningVisible(row)"
                class="query-warning-wrap"
                placement="bottom-start"
                :distance="6"
                :auto-hide="true"
              >
                <button
                  type="button"
                  class="query-warning-trigger"
                  aria-label="Ivy warning: It looks like this code won't run as intended."
                >
                  <img src="../../../assets/warning.svg" width="20" height="20" alt="Ivy found an issue in how this might run.">
                </button>
                <template #popper>
                  <div class="query-warning-tooltip true-small">
                    <p class="query-warning-copy mb-1">Ivy: It looks like this code won't run as intended.</p>
                    <div class="query-warning-actions mb-1">
                      <button
                        type="button"
                        class="query-warning-action query-warning-action-ignore"
                        @click.stop="ignoreQueryWarning"
                      >
                        Ignore
                      </button>
                      <button
                        type="button"
                        class="query-warning-action query-warning-action-fix"
                        @click.stop="fixQueryWarning"
                      >
                        Fix This
                      </button>
                    </div>
                  </div>
                </template>
              </VDropdown>
              <span>{{ row.key }}</span>
            </span>
          </td>
          <td :class="{ 'query-code-cell': row.isCode }">
            <EditableDetailValue
              v-model="step.data[row.dataKey]"
              align="start"
              :multiline="row.isCode"
              :empty-label="row.placeholder || '-'"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.step-info-details-table td {
  vertical-align: top;
  white-space: normal;
}

.step-info-details-table td:first-child {
  overflow-wrap: normal;
  word-break: normal;
  width: min-content;
}

.step-info-details-table td:last-child {
  overflow-wrap: break-word;
  word-break: normal;
}

.query-key-cell {
  white-space: nowrap;
}

.query-key-label {
  align-items: center;
  display: inline-flex;
  gap: 0.25rem;
}

.query-warning-wrap {
  display: inline-flex;
  line-height: 0;
}

.query-warning-trigger {
  background: transparent;
  border: 0;
  display: inline-flex;
  line-height: 0;
  padding: 0;
}

.query-warning-tooltip {
  background-color: #1b2434;
  border-radius: 0.375rem;
  color: #fff;
  line-height: 1.3;
  min-width: 13.5rem;
  padding: 0.375rem 0.5rem;
  white-space: normal;
}

.query-warning-copy {
  margin: 0;
  white-space: normal;
}

.query-warning-actions {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
}

.query-warning-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  color: #fff;
  font-size: 0.625rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}

.query-warning-action-fix {
  background: rgba(150, 210, 255, 0.25);
}

.query-warning-action-ignore {
  background: transparent;
  border-color: transparent;
}
</style>
