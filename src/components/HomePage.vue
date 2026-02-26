<script setup>
import { useTemplateRef } from 'vue';
import typewriter from '../utils/typewriter';
import ChatBox from './shared/ChatBox.vue';

const chatBox = useTemplateRef('chatBox');
</script>

<template>
  <section class="my-5 py-5">
    <div class="text-center mb-4 pb-3">
      <!-- <img src="./assets/ivy-logo-no-padding.svg" width="160" height="160" class="mb-4"> -->
      <h2 class="fw-bold mb-1">Good afternoon!</h2>
      <h5 class="mb-0">How can I help your IT work today, Sarith?</h5>
    </div>

    <ChatBox ref="chatBox" class="mb-5" />

    <h6 class="mb-2 not-as-small fw-bold">
      Quick Actions
    </h6>
    <div class="row g-3 mb-3">
      <!-- <div class="col">
        <div class="rounded border p-4 bg-library-highlight h-100 d-flex flex-column align-items-start">
          <div class="position-relative rounded-circle bg-chat-gradient p-2 d-inline-flex align-items-center justify-content-center mb-4">
            <img src="./assets/nav-chat.svg" width="16" height="16" class="invert-to-white">
          </div>
          <div class="position-relative">
            <h6 class="fw-bold">
              What's new in my IT environment?
            </h6>
            <p class="mb-0 true-small text-dark pretty-overflow">
              Are there any issues or risks I should know about today?
            </p>
          </div>
        </div>
      </div> -->
      <div class="col-6">
        <div class="rounded border cursor-pointer p-4 bg-chat-highlight h-100 d-flex flex-column align-items-start">
          <div class="d-flex position-relative align-items-center mb-3 gap-3">
            <div class="rounded bg-chat-gradient  p-2 d-inline-flex align-items-center justify-content-center">
              <img src="../assets/nav-collections.svg" width="16" height="16" class="invert-to-white">
            </div>
            <div>
              <h6 class="fw-bold mb-0">Daily Tasks</h6>
              <div class="smallest text-muted">for January 14, 2026</div>
            </div>
          </div>
          <div class="position-relative true-small ps-2">
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="todo_1">
              <label class="form-check-label" for="todo_1">
                Run the "Monthly Security Audit."
              </label>
            </div>
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="todo_2">
              <label class="form-check-label nowrap" for="todo_2">
                Respond to the high priority ticket from Jane.
              </label>
            </div>
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="todo_3">
              <label class="form-check-label" for="todo_3">
                Onboarding: Finish setting up data connections.
              </label>
            </div>
          </div>
          <img src="../assets/pin.svg" width="16" height="16" class="toggle-tasks-icon position-absolute top-0 end-0 me-3 mt-3">
        </div>
      </div>
      <div class="col">
        <div class="rounded border cursor-pointer p-4 bg-library-highlight h-100 d-flex flex-column align-items-start" @click="typewriter(chatBox.chatInput, '<p>Show me my <strong>unused and underused</strong> licenses.</p>')">
          <div class="position-relative rounded bg-library-gradient p-2 d-inline-flex align-items-center justify-content-center mb-4">
            <img src="../assets/nav-prompt-library.svg" width="16" height="16" class="invert-to-white">
          </div>
          <div class="position-relative mt-auto">
            <h6 class="fw-bold mb-0">
              Show me any underused or unused licenses.
            </h6>
            <!-- <p class="mb-0 true-small text-dark pretty-overflow">
              Make recommendations to optimize costs.
            </p> -->
          </div>
        </div>
      </div>
      <div class="col">
        <div class="rounded border cursor-pointer p-4 bg-actions-highlight h-100 d-flex flex-column align-items-start" @click='typewriter(chatBox.chatInput, `Run "Daily IT Health Check."`)'>
          <div class="position-relative rounded bg-actions-gradient p-2 d-inline-flex align-items-center justify-content-center mb-4">
            <img src="../assets/nav-resources.svg" width="16" height="16" class="invert-to-white">
          </div>
          <div class="position-relative mt-auto">
            <h6 class="fw-bold mb-0">
              Run "Daily IT Health Check."
            </h6>
            <!-- <p class="mb-0 true-small text-dark pretty-overflow">
              Show me the results in a PDF when complete.
            </p> -->
          </div>
        </div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-4">
        <div class="rounded border cursor-pointer px-3 py-2.5 h-100 d-flex align-items-start gap-3 bg-white">
          <div class="position-relative p-2 rounded bg-secondary-subtle d-inline-flex align-items-center justify-content-center">
            <img src="../assets/history.svg" width="16" height="16">
          </div>
          <div class="position-relative">
            <div class="fw-bold mb-0 reduced">
              Cloud-Based Savings
            </div>
            <div class="smallest text-muted">
              Yesterday, 4:05 pm
            </div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="rounded border cursor-pointer px-3 py-2.5 h-100 d-flex align-items-start gap-3 bg-white">
          <div class="position-relative p-2 rounded bg-secondary-subtle d-inline-flex align-items-center justify-content-center">
            <img src="../assets/history.svg" width="16" height="16">
          </div>
          <div class="position-relative">
            <div class="fw-bold mb-0 reduced">
              IT Environment Report
            </div>
            <div class="smallest text-muted">
              Yesterday, 3:45 pm
            </div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="rounded border cursor-pointer px-3 py-2.5 h-100 d-flex align-items-start gap-3 bg-white">
          <div class="position-relative p-2 rounded bg-secondary-subtle d-inline-flex align-items-center justify-content-center">
            <img src="../assets/history.svg" width="16" height="16">
          </div>
          <div class="position-relative">
            <div class="fw-bold mb-0 reduced">
              New Security Risks
            </div>
            <div class="smallest text-muted">
              Yesterday, 10:30 am
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <h6 class="mt-4 mb-2 not-as-small">
      <img src="../assets/nav-connectors.svg" width="16" height="16" class="me-1 opacity-50">
      Integrations
    </h6>
    <div class="row">
      <div class="col-auto d-flex">
        <a href="#" class="d-block bg-light rounded border p-2">
          <img src="../assets/integrations/microsoft-entra.svg" height="32" width="32" class="d-block">
        </a>
      </div>
      <div class="col-auto d-flex">
        <a href="#" class="d-block bg-light rounded border p-2">
          <img src="../assets/integrations/azure.svg" height="32" width="32" class="d-block">
        </a>
      </div>
      <div class="col-auto d-flex">
        <a href="#" class="d-block bg-light rounded border p-2">
          <img src="../assets/integrations/google.svg" height="32" width="32" class="d-block">
        </a>
      </div>
      <div class="col-auto d-flex">
        <a href="#" class="d-block bg-light rounded border p-2">
          <img src="../assets/integrations/onelogin.svg" height="32" width="32" class="d-block">
        </a>
      </div>
      <div class="col-auto d-flex">
        <a href="#" class="d-block bg-light rounded border p-2">
          <img src="../assets/integrations/dropbox.svg" height="32" width="32" class="d-block">
        </a>
      </div>
    </div> -->
  </section>
</template>

<style lang="scss" scoped>
@use "sass:color";

.form-check {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0;
  max-width: 100%;
  overflow: hidden;
}

.form-check-input {
  margin-top: 0;
}

.form-check-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: -webkit-fill-available;
}

.toggle-tasks-icon {
  opacity: 0.325;
}
</style>
