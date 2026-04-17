<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import LeftNav from "./components/LeftNav.vue";
import { useOnboardingSyncToast } from "./composables/onboardingSyncToast";
import { resolveSourceIcon } from "./components/shared/sourceCatalog";

const route = useRoute();
const { closeToast, state: onboardingSyncToastState, syncRouteVisibility } = useOnboardingSyncToast();
const isChatRoute = computed(() => (
  route.path === "/chat"
  || route.path.includes("/chats/")
  || route.path.startsWith("/ivy-in-action/")
));
const isSplitContent = computed(() => Boolean(route.meta?.splitContent));
const isHomePage = computed(() => Boolean(route.meta?.homeLayout));
const isOnboardingChatRoute = computed(() => route.path === "/chats/ivy-onboarding");
const syncToastSourceIcon = computed(() => (
  resolveSourceIcon(onboardingSyncToastState.sourceLabel)
));

watch(() => route.path, () => {
  syncRouteVisibility(isOnboardingChatRoute.value);
}, { immediate: true });
</script>

<template>
  <LeftNav />
  <div 
    class="content-container d-flex justify-content-center"
    :class="[
      isChatRoute ? 'bg-white' : 'bg-titan-white',
      { 'px-0': isSplitContent },
    ]"
  >
    <main 
      class="page-content"
      :class="isHomePage ? 'my-auto text-content-wrap' : 'w-100'"
    >
      <RouterView />
    </main>
  </div>

  <Transition name="sync-toast-fade">
    <aside
      v-if="onboardingSyncToastState.showToast"
      class="onboarding-sync-toast bg-white rounded p-3"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        class="btn lead fw-medium border-0 p-1 onboarding-sync-toast__dismiss"
        v-tooltip="'Feel free to dismiss this. Ivy will let you know when the sync is finished.'"
        @click="closeToast"
      >
        &times;
      </button>
      <div class="d-flex align-items-start gap-3">
        <div class="rounded border p-2 d-flex align-items-center justify-content-center onboarding-sync-toast__icon-wrap">
          <img src="./assets/syncing.svg" width="20" height="20" alt="">
        </div>
        <div class="min-w-0 pe-4">
          <h6 class="fw-semibold mb-1 d-flex align-items-center gap-1">
            <img
              v-if="syncToastSourceIcon"
              :src="syncToastSourceIcon"
              :alt="`${onboardingSyncToastState.sourceLabel} icon`"
              width="16"
              height="16"
            >
            <span class="text-truncate">Syncing {{ onboardingSyncToastState.sourceLabel }}&hellip;</span>
          </h6>
          <p class="mb-2 text-secondary not-as-small">
            Ivy is still importing your source data in the background.
          </p>
          <div class="progress" role="progressbar" aria-label="sync progress">
            <div class="progress-bar" :style="{ width: `${onboardingSyncToastState.progress}%` }"></div>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style lang="scss">
.reduced {
  font-size: 0.9375rem;
}

.not-as-small {
  font-size: 0.875rem;
}

.true-small {
  font-size: 0.8125rem;
}

.smallest {
  font-size: 0.75rem;
}

.tiny {
  font-size: 0.6875rem;
}

.flatten-line-height {
  line-height: 1rem;
}

.bg-iceberg-blue {
  background-color: $iceberg-blue !important;
}

.bg-lighter {
  background-color: #f8f9fa !important;
}

.bg-maastricht-blue {
  background-color: $maastricht-blue !important;
}

.bg-dark-blue {
  background-color: $dark-blue !important;
}

.bg-titan-white {
  background-color: $titan-white !important;
}

body.ivy-in-action-entry .content-container {
  background-color: $titan-white !important;
}

body.ivy-in-action-hide-cursor .content-container,
body.ivy-in-action-hide-cursor .content-container * {
  cursor: none !important;
}

.bg-ivy-accent {
  background-color: #161950 !important;
}

.text-dark-blue {
  color: #1C2D45;
}

.text-biscay-blue {
  color: $biscay-blue;
}

.cursor-pointer {
  cursor: pointer;
}

.py-2\.5,
.pt-2\.5 {
  padding-top: 0.75rem;
}

.py-2\.5,
.pb-2\.5 {
  padding-bottom: 0.75rem;
}

.px-2\.5,
.ps-2\.5 {
  padding-left: 0.75rem;
}

.px-2\.5,
.pe-2\.5 {
  padding-right: 0.75rem;
}

.bg-chat-gradient {
  background-color: $azure-blue;
  background-image: linear-gradient(to right, $azure-blue, $blue);
}

.bg-library-gradient {
  background-color: $blue-oblivion;
  background-image: linear-gradient(to right, $blue-oblivion, $biscay-blue);
}

.bg-actions-gradient {
  background-color: $orange;
  background-image: linear-gradient(to right, $yellow, $orange);
}

.bg-chat-highlight,
.bg-library-highlight,
.bg-actions-highlight {
  background-color: white;
  overflow: hidden;
  position: relative;

  &:before {
    content: "";
    inset: 0;
    opacity: 0.15;
    position: absolute;
    pointer-events: none;
  }
}

.bg-chat-highlight:before {
  background-image: 
    linear-gradient(
      45deg,
      hsl(0deg 0% 100%) 14%,
      hsl(240deg 100% 97%) 53%,
      hsl(239deg 100% 94%) 68%,
      hsl(238deg 100% 91%) 78%,
      hsl(236deg 100% 87%) 86%,
      hsl(235deg 100% 84%) 91%,
      hsl(233deg 100% 80%) 95%,
      hsl(231deg 100% 76%) 98%,
      hsl(228deg 99% 71%) 101%,
      hsl(224deg 99% 65%) 102%,
      hsl(216deg 98% 52%) 101%
    );
}

.bg-library-highlight:before {
  background-image: 
    linear-gradient(
      45deg,
      hsl(0deg 0% 100%) 14%,
      hsl(238deg 29% 94%) 53%,
      hsl(237deg 29% 87%) 68%,
      hsl(236deg 29% 81%) 78%,
      hsl(236deg 29% 75%) 86%,
      hsl(234deg 29% 69%) 91%,
      hsl(233deg 29% 63%) 95%,
      hsl(232deg 29% 56%) 98%,
      hsl(230deg 29% 50%) 101%,
      hsl(227deg 39% 43%) 102%,
      hsl(223deg 56% 36%) 101%
    );
}

.bg-actions-highlight:before {
  background-image: 
    linear-gradient(
      45deg,
      hsl(0deg 0% 100%) 14%,
      hsl(26deg 100% 95%) 53%,
      hsl(26deg 100% 91%) 68%,
      hsl(26deg 100% 87%) 78%,
      hsl(26deg 100% 82%) 86%,
      hsl(26deg 100% 78%) 91%,
      hsl(26deg 100% 74%) 95%,
      hsl(26deg 100% 69%) 98%,
      hsl(26deg 100% 65%) 101%,
      hsl(26deg 100% 60%) 102%,
      hsl(27deg 98% 54%) 101%
    );
}

.invert-to-white {
  filter: invert(1) brightness(2);
}

.rounded-sm {
  border-radius: 0.5rem;
}

.pretty-overflow {
  text-wrap: pretty;
}

.ivy-thinking-text {
  background-image: linear-gradient(100deg, #9aa4b2 20%, #e5e7eb 45%, #9aa4b2 70%);
  background-size: 220% 100%;
  background-position: 100% 0;
  background-clip: text;
  color: var(--bs-gray-500);
  display: inline-block;
  font-size: 0.9375rem;
  font-weight: 500;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ivy-thinking-shimmer 1.05s linear infinite;
}

@keyframes ivy-thinking-shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

body {
  background: $left-nav-background;
  height: 100vh;
  width: 100vw;
}

.heading-icon {
  align-items: center;
  border-radius: 1rem;
  display: flex;
  height: 3rem;
  justify-content: center;
  width: 3rem;
}

.heading-icon--workspace {
  background-image: linear-gradient(in oklab to bottom right, $yellow, $orange);
}

.chat-document-action {
  align-items: center;
  background-color: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  position: absolute;
  right: 0.75rem;
  top: 0.5rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: var(--bs-gray-200);
  }
}

</style>

<style scoped lang="scss">
.content-container {
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.15);
  height: calc(100vh - #{$content-inset * 2});
  inset: $content-inset;
  left: $left-nav-closed-width;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: none !important;
  padding-left: 3rem;
  padding-right: 3rem;
  position: fixed;
  scroll-behavior: smooth;
  transition: background-color 0.35s ease-in-out, left 0.2s ease-in-out;

  .left-nav-open & {
    left: $left-nav-open-width;
  }
}

.text-content-wrap {
  max-width: 48rem;
  width: 100%;
}

.onboarding-sync-toast {
  bottom: 1rem + $content-inset;
  box-shadow: 0 10px 28px -12px rgba(15, 23, 42, 0.45);
  box-shadow: 0 16px 24px 2px rgba(0,0,0,0.14), 0 6px 30px 5px rgba(0,0,0,0.12), 0 8px 10px -5px rgba(0,0,0,0.20);
  max-width: 30rem;
  position: fixed;
  right: 1rem + $content-inset;
  width: calc(100vw - 3rem);
  z-index: 1250;
}

.onboarding-sync-toast__dismiss {
  color: var(--bs-secondary-color);
  line-height: 1;
  position: absolute;
  right: 0.5rem;
  top: 0.375rem;
}

.onboarding-sync-toast__icon-wrap {
  width: 2.5rem;
}

.sync-toast-fade-enter-active,
.sync-toast-fade-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.sync-toast-fade-enter-from,
.sync-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
