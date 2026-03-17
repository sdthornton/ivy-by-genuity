import { ref } from "vue";

const onboardingNavStage = ref("hidden");

function withDocument(callback) {
  if (typeof document === "undefined") {
    return;
  }

  callback(document);
}

export function useAppLayoutState() {
  return {
    onboardingNavStage,
  };
}

function setOnboardingNavigationStage(stage = "hidden") {
  onboardingNavStage.value = stage;

  withDocument((doc) => {
    doc.body.classList.remove("left-nav-open");
    doc.body.classList.remove("split-content-page");
  });
}

function openOnboardingNavigation(stage = "full") {
  onboardingNavStage.value = stage;

  withDocument((doc) => {
    doc.body.classList.remove("split-content-page");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        doc.body.classList.add("left-nav-open");
      });
    });
  });
}

export function hideOnboardingNavigation() {
  setOnboardingNavigationStage("hidden");
}

export function revealOnboardingProfileNavigation() {
  setOnboardingNavigationStage("profile");
}

export function revealOnboardingCompanyNavigation() {
  setOnboardingNavigationStage("company");
}

export function revealOnboardingMainNavigation() {
  openOnboardingNavigation("main");
}

export function revealOnboardingNavigation() {
  openOnboardingNavigation("full");
}

export function resetOnboardingNavigationRevealState() {
  setOnboardingNavigationStage("hidden");
}
