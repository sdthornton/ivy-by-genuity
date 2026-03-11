<script setup>
import { computed, nextTick, ref } from "vue";
import StepOptionsDropdown from "../shared/StepOptionsDropdown.vue";
import CategoryPillDropdown from "./shared/CategoryPillDropdown.vue";
import iconClock from "../../assets/clock.svg";
import iconEyeOpen from "../../assets/eye-open.svg";
import iconEdit from "../../assets/edit.svg";

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  triggerLabel: {
    type: String,
    default: "Not Scheulded",
  },
  triggerConfigured: {
    type: Boolean,
    default: false,
  },
  triggerVariant: {
    type: String,
    default: "",
  },
  triggerIcon: {
    type: String,
    default: iconClock,
  },
  triggerOptions: {
    type: Array,
    default: () => [],
  },
  ivyContent: {
    type: Object,
    default: () => ({
      overview: "",
      issue: "",
    }),
  },
});

const emit = defineEmits(["close", "select-trigger"]);
const titleInput = ref(null);
const permissionAccessOptions = [
  "Read Only",
  "Read/Write",
  "Remove Permissions",
];
const PERMISSION_LEVEL_META = {
  "Read Only": {
    icon: iconEyeOpen,
    width: 14,
    height: 14,
    className: "",
  },
  "Read/Write": {
    icon: iconEdit,
    width: 12,
    height: 12,
    className: "opacity-75",
  },
  "Remove Permissions": {
    glyph: "×",
  },
};
const CREATOR_AVATAR_COLOR = "#3f51b5";
const DEFAULT_TEAM_AVATAR_COLOR = "#4caf50";
const permissionUsers = [
  { label: "Sarith Rigsby", initials: "SR", color: "#f44336", type: "user" },
  { label: "Keira Moss", initials: "KM", color: "#03a9f4", type: "user" },
  { label: "Jordan Lee", initials: "JL", color: "#ff9800", type: "user" },
];
const permissionTeams = [
  { label: "Workspace Editors", color: "#00bcd4", type: "team" },
  { label: "Security Team", color: "#4caf50", type: "team" },
  { label: "IT Operations", color: "#673ab7", type: "team" },
];

const creatorInitials = computed(() => toInitials(props.settings.creator, "Y"));
const creatorAvatarStyle = computed(() => ({ backgroundColor: CREATOR_AVATAR_COLOR }));
const isSavedStatus = computed(() => (
  String(props.settings.status || "").trim().toLowerCase() === "saved"
));
const statusPillClass = computed(() => (
  isSavedStatus.value ? "bg-primary text-white" : "bg-secondary-subtle text-dark"
));
const statusTooltip = computed(() => (
  isSavedStatus.value ? "no unsaved changes." : "there are unsaved changes"
));
const creatorTooltip = computed(() => {
  const creator = props.settings.creator || "Unknown";
  const createdAt = props.settings.createdAt || props.settings.updatedAt || "an unknown time";
  return `Created by ${creator} on ${createdAt}.`;
});
const lastUpdatedTooltip = computed(() => {
  const updatedAt = props.settings.updatedAtLong || props.settings.updatedAt || "an unknown time";
  return `Last updated on ${updatedAt}.`;
});
const triggerPillClass = computed(() => {
  if (!props.triggerConfigured) {
    return "header-trigger-pill--draft bg-secondary-subtle text-secondary";
  }

  if (props.triggerVariant === "event") {
    return "bg-trigger text-white";
  }

  return "header-trigger-pill--configured text-white";
});
const ownerTeamAvatarStyle = computed(() => {
  const matchingTeam = permissionTeams.find((team) => team.label === props.settings.ownerTeam);
  return {
    backgroundColor: matchingTeam?.color || DEFAULT_TEAM_AVATAR_COLOR,
  };
});
const activityLogEntries = computed(() => {
  const log = props.settings.log || {};
  const runs = Array.isArray(log.runs) ? log.runs : [];
  const runEntries = runs.map((run, index) => {
    const normalizedStatus = normalizeRunStatus(run.status);
    return {
      id: `run-${index}-${run.at || "unknown"}`,
      at: run.at || "Unknown",
      activity: "Ran",
      status: normalizedStatus,
      details: run.note || "-",
    };
  });

  const editedAt = log.editedAt || props.settings.updatedAt || "Unknown";
  const editedBy = log.editedBy || log.savedBy || props.settings.creator || "Unknown";
  const savedAt = log.savedAt || props.settings.updatedAt || "Unknown";
  const savedBy = log.savedBy || props.settings.creator || "Unknown";
  const createdAt = props.settings.createdAt || "Unknown";
  const createdBy = props.settings.creator || "Unknown";

  return [
    ...runEntries,
    {
      id: "edited",
      at: editedAt,
      activity: "Edited",
      status: "info",
      details: `Edited by ${editedBy}`,
    },
    {
      id: "saved",
      at: savedAt,
      activity: "Saved",
      status: "info",
      details: `Saved by ${savedBy}`,
    },
    {
      id: "created",
      at: createdAt,
      activity: "Created",
      status: "info",
      details: `Created by ${createdBy}`,
    },
  ];
});

function toInitials(value, fallback) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return fallback;
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function ensurePermissionEntries() {
  if (!Array.isArray(props.settings.permissionEntries)) {
    props.settings.permissionEntries = [];
  }
}

function updatePermissionEntryLevel(entryId, option, close) {
  ensurePermissionEntries();
  const entry = props.settings.permissionEntries.find((permissionEntry) => permissionEntry.id === entryId);
  if (!entry) {
    close();
    return;
  }

  entry.level = option;
  close();
}

function selectPermissionPrincipal(item, close) {
  ensurePermissionEntries();
  props.settings.permissionEntries.push({
    id: `${item.type}-${item.label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: item.label,
    level: "Read Only",
    type: item.type,
  });
  close();
}

function selectTrigger(option, close) {
  emit("select-trigger", option);
  close();
}

function getPermissionLevelMeta(level) {
  return PERMISSION_LEVEL_META[level] || PERMISSION_LEVEL_META["Read Only"];
}

function avatarStyle(color) {
  return {
    backgroundColor: color,
  };
}

function normalizeRunStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "error" || normalized === "failed" || normalized === "failure") {
    return "error";
  }
  if (normalized === "success" || normalized === "ok") {
    return "success";
  }

  return "info";
}

function getLogStatusLabel(status) {
  if (status === "success") {
    return "Success";
  }
  if (status === "error") {
    return "Error";
  }

  return "Info";
}

function getLogStatusClass(status) {
  if (status === "success") {
    return "bg-success-subtle text-success-emphasis";
  }
  if (status === "error") {
    return "bg-danger-subtle text-danger-emphasis";
  }

  return "bg-secondary-subtle text-secondary";
}

async function focusTitleInput() {
  await nextTick();
  const input = titleInput.value;
  if (!input) {
    return;
  }

  input.focus();
  input.select?.();
}

defineExpose({
  focusTitleInput,
});
</script>

<template>
  <div class="assistant-settings-panel bg-light d-flex flex-column h-100 not-as-small">
    <header class="assistant-settings-header d-flex align-items-start border-bottom p-4">
      <div class="assistant-settings-heading d-flex align-items-start text-black me-4">
        <img src="../../assets/nav-settings.svg" width="20" height="20" class="me-3 opacity-75 mt-1" alt="">
        <div>
          <h4 class="fw-semibold mb-1">Assistant Settings</h4>
          <p class="text-muted not-as-small mb-0">
            Meta data and settings for this assistant.
          </p>
        </div>
      </div>
      <button
        type="button"
        class="assistant-settings-close-btn btn btn-sm btn-white d-flex align-items-center justify-content-center ms-auto"
        aria-label="Close assistant settings"
        @click.stop.prevent="emit('close')"
      >
        &times;
      </button>
    </header>

    <div class="assistant-settings-top d-flex flex-column">
      <section class="assistant-settings-body pt-4 px-2.5 mx-4">
        <div class="d-inline-flex align-items-center justify-content-start gap-2 border rounded-pill px-2 py-1 mb-4">
          <div 
            v-tooltip="{ content: statusTooltip, placement: 'top' }"
            class="d-inline-flex align-items-center rounded-pill px-2 smallest"
            :class="statusPillClass"
          >
            {{ settings.status }}
          </div>
          <span class="text-body-tertiary smallest mx-1">&bullet;</span>
          <div
            v-tooltip="{ content: creatorTooltip, placement: 'top' }"
            class="text-avatar text-avatar--small text-white fw-semibold rounded-circle flex-shrink-0"
            :style="creatorAvatarStyle"
          >
            {{ creatorInitials }}
          </div>
          <span class="text-body-tertiary smallest mx-1">&bullet;</span>
          <div
            v-tooltip="{ content: lastUpdatedTooltip, placement: 'top' }"
            class="smallest text-body-secondary d-inline-flex align-items-center"
          >
            <img src="../../assets/updated-at.svg" height="12" width="12" class="me-1">
            <span>{{ settings.updatedAt }}</span>
          </div>
          <span class="text-body-tertiary smallest mx-1">&bullet;</span>
          <CategoryPillDropdown
            v-model="settings.category"
            tooltip="Category."
            placement="bottom-start"
          />
        </div>

        <div class="mb-4 me-5">
          <label class="mb-1" for="assistant_settings_title">
            Title
          </label>
          <input
            ref="titleInput"
            id="assistant_settings_title"
            type="text"
            class="form-control not-as-small"
            v-model="settings.title"
          >
        </div>

        <div class="mb-4">
          <label class="mb-1" for="assistant_settings_description">
            Description
          </label>
          <textarea
            id="assistant_settings_description"
            v-model="settings.description"
            class="form-control assistant-settings-textarea not-as-small"
            rows="3"
            placeholder="Describe what this assistant should do..."
          />
        </div>

        <div class="mb-4">
          <div class="mb-1">
            Owned By
          </div>
          <div class="d-flex align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2 min-w-0">
              <div
                class="text-avatar assistant-settings-team-avatar text-white fw-semibold rounded-circle flex-shrink-0"
                :style="ownerTeamAvatarStyle"
              >
                <img src="../../assets/nav-teams.svg" width="12" height="12" alt="">
              </div>
              <div class="fw-medium text-black text-truncate">{{ settings.ownerTeam }}</div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <div class="mb-1 d-flex">
            <span class="me-2">Permissions</span>
            <StepOptionsDropdown placement="bottom-start" menu-class="assistant-permission-principal-menu">
              <template #trigger>
                <button
                  type="button"
                  class="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center p-1"
                  aria-label="Add permission"
                >
                  <img src="../../assets/plus-round.svg" height="10" width="10" class="d-block invert-to-white">
                </button>
              </template>
              <template #menu="{ close }">
                <div class="assistant-permission-principal-menu__section-label smallest text-body-secondary pt-1 pb-2">
                  Users
                </div>
                <button
                  v-for="user in permissionUsers"
                  :key="user.label"
                  type="button"
                  class="dropdown-item text-start d-flex align-items-center gap-2 assistant-permission-principal-menu__item"
                  @click="selectPermissionPrincipal(user, close)"
                >
                  <span
                    class="text-avatar text-avatar--small text-white fw-semibold rounded-circle flex-shrink-0 assistant-permission-principal-menu__avatar"
                    :style="avatarStyle(user.color)"
                  >
                    {{ user.initials }}
                  </span>
                  <span class="flex-grow-1">{{ user.label }}</span>
                </button>
                <hr class="assistant-permission-principal-menu__divider my-2 mx-1 border-top border-body-subtle opacity-100">
                <div class="assistant-permission-principal-menu__section-label smallest text-body-secondary pt-2 pb-2">
                  Teams
                </div>
                <button
                  v-for="team in permissionTeams"
                  :key="team.label"
                  type="button"
                  class="dropdown-item text-start d-flex align-items-center gap-2 assistant-permission-principal-menu__item"
                  @click="selectPermissionPrincipal(team, close)"
                >
                  <span
                    class="assistant-permission-principal-menu__avatar assistant-permission-principal-menu__avatar--team rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                    :style="avatarStyle(team.color)"
                  >
                    <img src="../../assets/nav-teams.svg" width="12" height="12" alt="">
                  </span>
                  <span class="flex-grow-1">{{ team.label }}</span>
                </button>
              </template>
            </StepOptionsDropdown>
          </div>
          <div class="d-flex flex-column gap-2">
            <div
              v-for="permissionEntry in (settings.permissionEntries || [])"
              :key="permissionEntry.id"
              class="d-flex align-items-center justify-content-between gap-3"
            >
              <div class="fw-medium text-black">{{ permissionEntry.label }}</div>
              <StepOptionsDropdown placement="bottom-end" menu-class="assistant-permissions-menu">
                <template #trigger>
                  <span class="smallest text-body-secondary border rounded-pill px-2 py-1 flex-shrink-0 d-inline-flex align-items-center">
                    <img
                      v-if="getPermissionLevelMeta(permissionEntry.level).icon"
                      :src="getPermissionLevelMeta(permissionEntry.level).icon"
                      :width="getPermissionLevelMeta(permissionEntry.level).width"
                      :height="getPermissionLevelMeta(permissionEntry.level).height"
                      class="me-1 flex-shrink-0"
                      :class="getPermissionLevelMeta(permissionEntry.level).className"
                      alt=""
                    >
                    <span
                      v-else
                      class="assistant-permissions-menu__remove-icon me-1 flex-shrink-0 d-inline-flex align-items-center justify-content-center"
                      aria-hidden="true"
                    >
                      {{ getPermissionLevelMeta(permissionEntry.level).glyph }}
                    </span>
                    <span>{{ permissionEntry.level }}</span>
                    <img src="../../assets/dropdown.svg" height="12" width="12" class="ms-1">
                  </span>
                </template>
                <template #menu="{ close }">
                <button
                  v-for="option in permissionAccessOptions"
                  :key="option"
                  type="button"
                  class="dropdown-item text-start d-flex align-items-center gap-2 assistant-permissions-menu__item"
                  @click="updatePermissionEntryLevel(permissionEntry.id, option, close)"
                >
                    <img
                      v-if="getPermissionLevelMeta(option).icon"
                      :src="getPermissionLevelMeta(option).icon"
                      :width="getPermissionLevelMeta(option).width"
                      :height="getPermissionLevelMeta(option).height"
                      class="flex-shrink-0"
                      :class="getPermissionLevelMeta(option).className"
                      alt=""
                    >
                    <span
                      v-else
                      class="assistant-permissions-menu__remove-icon flex-shrink-0 d-inline-flex align-items-center justify-content-center"
                      aria-hidden="true"
                    >
                      {{ getPermissionLevelMeta(option).glyph }}
                    </span>
                    <span>{{ option }}</span>
                </button>
              </template>
            </StepOptionsDropdown>
          </div>
        </div>
        </div>

        <div class="mb-0">
          <div class="mb-1">Trigger</div>
          <StepOptionsDropdown placement="bottom-start" menu-class="assistant-trigger-menu">
            <template #trigger>
              <span
                class="assistant-settings-trigger-pill header-trigger-pill rounded-sm true-small fw-normal d-inline-flex align-items-center justify-content-center"
                :class="triggerPillClass"
              >
                <img
                  v-if="triggerConfigured"
                  :src="triggerIcon || iconClock"
                  width="16"
                  height="16"
                  class="me-1 invert-to-white header-trigger-pill__icon"
                  alt=""
                >
                <span class="header-trigger-pill__label">{{ triggerLabel }}</span>
                <img
                  src="../../assets/dropdown.svg"
                  width="12"
                  height="12"
                  class="ms-2 header-trigger-pill__arrow"
                  :class="{ 'invert-to-white': triggerConfigured }"
                  alt=""
                >
              </span>
            </template>
            <template #menu="{ close }">
              <button
                v-for="option in triggerOptions"
                :key="option.key"
                type="button"
                class="dropdown-item text-start d-flex align-items-center assistant-trigger-menu__item"
                @click="selectTrigger(option, close)"
              >
                <img
                  v-if="option.icon"
                  :src="option.icon"
                  width="14"
                  height="14"
                  class="me-2 flex-shrink-0"
                  :class="option.iconClass"
                  alt=""
                >
                <span v-else class="me-2 d-inline-block flex-shrink-0 assistant-trigger-menu__icon-spacer" aria-hidden="true" />
                <span>{{ option.label }}</span>
              </button>
            </template>
          </StepOptionsDropdown>
        </div>

        <div class="mt-4">
          <div class="mb-2">Activity Log</div>
          <div class="rounded-sm overflow-hidden mb-4">
            <table class="table table-striped not-as-small mb-0 assistant-settings-log-table">
              <thead>
                <tr class="bg-secondary-subtle">
                  <th scope="col">When</th>
                  <th scope="col">Activity</th>
                  <th scope="col">Status</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in activityLogEntries"
                  :key="entry.id"
                >
                  <td>{{ entry.at }}</td>
                  <td>{{ entry.activity }}</td>
                  <td>
                    <span class="assistant-settings-log-status smallest rounded-pill px-2 py-1 d-inline-flex align-items-center" :class="getLogStatusClass(entry.status)">
                      {{ getLogStatusLabel(entry.status) }}
                    </span>
                  </td>
                  <td>{{ entry.details }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <div class="ivy-says-shell pt-2 bg-light">
      <div class="border text-secondary bg-iceberg-blue p-3 rounded-sm not-as-small mx-4 mb-4">
        <img src="../../assets/nav-resources-alt.svg" height="16" width="16" class="me-2">
        <strong>Ivy says:</strong> {{ ivyContent.overview }}
        <div
          v-if="ivyContent.issue"
          class="assistant-settings-ivy-issue d-flex align-items-start mt-2 p-2 rounded-sm bg-warning-subtle"
        >
          <img
            src="../../assets/warning.svg"
            width="16"
            height="16"
            class="assistant-settings-ivy-issue__icon me-2 flex-shrink-0"
            alt=""
          >
          <span>
            <strong>Potential issue(s):</strong> {{ ivyContent.issue }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assistant-settings-panel {
  min-height: 0;
  overflow: hidden;
}

.assistant-settings-header {
  background-color: white;
  flex: 0 0 auto;
  position: relative;
}

.assistant-settings-close-btn {
  font-size: 1.5rem;
  height: 2rem;
  line-height: 1;
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 2rem;
  z-index: 2;
}

.assistant-settings-top {
  flex: 1;
  min-height: 0;
}

.assistant-settings-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.assistant-settings-title {
  display: inline-block;
  min-width: 0;
  outline: none;
  text-decoration-color: var(--bs-gray-300);
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.5rem;
}

.assistant-settings-textarea {
  resize: vertical;
}

.ivy-says-shell {
  flex: 0 0 auto;
}

.assistant-settings-ivy-issue__icon {
  margin-top: 0.1rem;
}

.assistant-settings-trigger-pill {
  max-width: 100%;
  min-height: 1.75rem;
  min-width: 0;
  padding: 0.25rem 0.5rem;
}

.header-trigger-pill--configured {
  background-color: rgb(123, 104, 238);
}

.header-trigger-pill__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assistant-permissions-menu__item {
  background: transparent;
  border: 0;
  width: 100%;
}

.assistant-permissions-menu__remove-icon {
  font-size: 1rem;
  line-height: 1;
  width: 14px;
}

:deep(.assistant-permissions-menu) {
  min-width: 12rem;
  padding: 0.35rem 0;
}

.assistant-permission-principal-menu__item {
  background: transparent;
  border: 0;
  width: 100%;
}

.assistant-permission-principal-menu__section-label {
  padding-left: 0.125rem;
}

.assistant-permission-principal-menu__avatar {
  height: 1.5rem;
  width: 1.5rem;
}

.assistant-settings-team-avatar,
.assistant-permission-principal-menu__avatar--team {
  align-items: center;
  display: inline-flex;
  justify-content: center;
}

.assistant-settings-team-avatar img,
.assistant-permission-principal-menu__avatar--team img {
  filter: brightness(0) invert(1);
}

:deep(.assistant-permission-principal-menu) {
  min-width: 14rem;
  padding: 0.35rem 0;
}

.assistant-trigger-menu__item {
  background: transparent;
  border: 0;
  width: 100%;
}

.assistant-settings-log-table {
  --bs-table-bg: transparent;
  --bs-table-striped-bg: rgba(0, 0, 0, 0.015);
}

.assistant-settings-log-table th,
.assistant-settings-log-table td {
  vertical-align: middle;
}

.assistant-settings-log-table th {
  color: var(--bs-secondary-color);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.assistant-settings-log-table td {
  color: var(--bs-gray-700);
}

.assistant-settings-log-status {
  font-weight: 600;
  line-height: 1;
}

.assistant-trigger-menu__icon-spacer {
  height: 14px;
  width: 14px;
}

:deep(.assistant-trigger-menu) {
  min-width: 14rem;
  padding: 0.65rem;
}

.form-control {
  --bs-border-radius: 0.5rem;
}
</style>
