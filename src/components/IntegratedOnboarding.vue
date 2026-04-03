<script setup>
import { ref } from "vue";
import HomeScreenContent from "./shared/HomeScreenContent.vue";
import OnboardingFlowContent from "./shared/OnboardingFlowContent.vue";

const showOnboardingFlow = ref(false);
const hasConnectedSource = ref(false);

function openOnboardingFlow() {
  showOnboardingFlow.value = true;
}

function closeOnboardingFlow() {
  showOnboardingFlow.value = false;
}

function handleSourceConnected() {
  hasConnectedSource.value = true;
}
</script>

<template>
  <section class="integrated-onboarding-page">
    <HomeScreenContent
      :integrated-mode="true"
      :source-connected="hasConnectedSource"
      @start-onboarding="openOnboardingFlow"
    />
    <Teleport to="body">
      <Transition name="integrated-onboarding-backdrop">
        <button
          v-if="showOnboardingFlow"
          type="button"
          class="integrated-onboarding-backdrop"
          aria-label="Close onboarding"
          @click="closeOnboardingFlow"
        />
      </Transition>
      <Transition name="integrated-onboarding-panel">
        <aside
          v-if="showOnboardingFlow"
          class="integrated-onboarding-panel bg-white"
          role="dialog"
          aria-modal="true"
          aria-label="Integrated onboarding"
        >
          <button
            type="button"
            class="integrated-onboarding-panel__close btn btn-sm btn-white d-flex align-items-center justify-content-center"
            aria-label="Close onboarding"
            @click.stop.prevent="closeOnboardingFlow"
          >
            &times;
          </button>
          <div class="integrated-onboarding-panel__content">
            <OnboardingFlowContent
              embedded
              :hide-navigation-on-mount="false"
              @skip="closeOnboardingFlow"
              @source-connected="handleSourceConnected"
            />
          </div>
        </aside>
      </Transition>
    </Teleport>
  </section>
</template>

<style lang="scss" scoped>
.integrated-onboarding-page {
  min-height: 100%;
}

.integrated-onboarding-backdrop {
  background-color: rgba(0, 0, 0, 0.35);
  border: 0;
  inset: 0;
  padding: 0;
  position: fixed;
  z-index: 60;
}

.integrated-onboarding-panel {
  border-bottom-left-radius: 1rem;
  border-top-left-radius: 1rem;
  bottom: 0;
  box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.20);
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 2rem);
  min-width: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  width: min(62rem, calc(100vw - 2rem));
  z-index: 61;
}

.integrated-onboarding-panel__close {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 1;
}

.integrated-onboarding-panel__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 3rem;
}

.integrated-onboarding-backdrop-enter-active,
.integrated-onboarding-backdrop-leave-active,
.integrated-onboarding-panel-enter-active,
.integrated-onboarding-panel-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.4s ease-in-out;
}

.integrated-onboarding-backdrop-enter-from,
.integrated-onboarding-backdrop-leave-to {
  opacity: 0;
}

.integrated-onboarding-backdrop-enter-to,
.integrated-onboarding-backdrop-leave-from {
  opacity: 1;
}

.integrated-onboarding-panel-enter-from,
.integrated-onboarding-panel-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.integrated-onboarding-panel-enter-to,
.integrated-onboarding-panel-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
