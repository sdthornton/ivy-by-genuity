import { readonly, reactive } from "vue";

const state = reactive({
  dismissed: false,
  hasActiveSync: false,
  progress: 60,
  showToast: false,
  sourceLabel: "",
});

export function useOnboardingSyncToast() {
  function closeToast() {
    state.dismissed = true;
    state.showToast = false;
  }

  function startSync(sourceLabel) {
    state.dismissed = false;
    state.hasActiveSync = true;
    state.progress = 60;
    state.showToast = false;
    state.sourceLabel = sourceLabel;
  }

  function syncRouteVisibility(isOnboardingRoute) {
    if (isOnboardingRoute) {
      state.showToast = false;
      return;
    }

    if (state.hasActiveSync && !state.dismissed) {
      state.showToast = true;
    }
  }

  function showToastNow() {
    if (state.hasActiveSync && !state.dismissed) {
      state.showToast = true;
    }
  }

  return {
    closeToast,
    showToastNow,
    startSync,
    state: readonly(state),
    syncRouteVisibility,
  };
}
