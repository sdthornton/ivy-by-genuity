<script setup>

const mockAssistants = [
  {
    id: 1,
    title: "Identity Hygiene Monitor",
    description: "Finds identity risks like missing MFA, inactive users, and risky sign-ins.",
    category: "security",
    trigger: {
      type: "time-based",
      value: "Daily 9:00 AM"
    }
  },
  {
    id: 2,
    title: "Privileged Access Watch",
    description: "Detects new admin role assignments and evaluates risk context.",
    category: "access",
    trigger: {
      type: "event-based",
      value: "When a new admin role is assigned"
    }
  },
  {
    id: 3,
    title: "Endpoint Hygiene Agent",
    description: "Flags unmanaged devices, missing patches, disabled agents, or missing encryption.",
    category: "monitoring",
    trigger: {
      type: "time-based",
      value: "Daily 8:00 AM"
    }
  },
  {
    id: 4,
    title: "High-Risk Device Finder",
    description: "Correlates security signals to identify the riskiest endpoints.",
    category: "threats",
    trigger: {
      type: "manual",
      value: null
    }
  },
  {
    id: 5,
    title: "Email Threat Exposure Agent",
    description: "Tracks phishing activity and identifies users most exposed to email threats.",
    category: "threats",
    trigger: {
      type: "time-based",
      value: "Daily 10:00 AM"
    }
  },
  {
    id: 6,
    title: "High-Risk User Monitor",
    description: "Ranks users by risk using signals like phishing failures, malware exposure, and weak auth.",
    category: "security",
    trigger: {
      type: "time-based",
      value: "Daily 10:30 AM"
    }
  },
  {
    id: 7,
    title: "Network Exposure Monitor",
    description: "Detects risky network configurations, DNS threats, and unusual access patterns.",
    category: "monitoring",
    trigger: {
      type: "time-based",
      value: "Daily 7:30 AM"
    }
  },
  {
    id: 8,
    title: "Backup & Recovery Readiness Agent",
    description: "Verifies backup coverage and flags failures or protection gaps.",
    category: "backup",
    trigger: {
      type: "time-based",
      value: "Daily 6:00 AM"
    }
  },
  {
    id: 9,
    title: "Weekly Security & IT Risk Brief",
    description: "Summarizes the most important risks and changes across systems.",
    category: "activity",
    trigger: {
      type: "time-based",
      value: "Weekly Monday 8:00 AM"
    }
  }
];

import ContentHeader from "./shared/ContentHeader.vue";

</script>

<template>
  <section class="text-left w-100">
    <ContentHeader />
    <div class="mt-3 py-3 d-flex align-items-start">
      <div class="heading-icon heading-icon--workspace me-3">
        <img src="../assets/nav-collections.svg" height="24" width="24">
      </div>
      <div class="me-4">
        <h2 class="fw-bold text-left mb-1">
          Assistants
        </h2>
        <p class="mb-0 not-as-small text-body-secondary">
          Your AI agents. Build, customize, and deploy assistants that can do the work for you.
        </p>
      </div>
      <button class="ms-auto btn btn-primary rounded-sm py-2">
        Create Assistant
      </button>
    </div>
    <div class="bg-info-banner rounded-top p-4 mt-2">
      <div class="row">
        <div class="col-3">
          <h3 class="fw-bold mb-0">
            32
          </h3>
          <div class="text-dark opacity-75 reduced">
            Assistants
          </div>
        </div>
        <div class="col-3">
          <h3 class="fw-bold mb-0">
            32
          </h3>
          <div class="text-dark opacity-75 reduced">
            Assistants
          </div>
        </div>
        <div class="col-3">
          <h3 class="fw-bold mb-0">
            32
          </h3>
          <div class="text-dark opacity-75 reduced">
            Assistants
          </div>
        </div>
        <div class="col-3">
          <h3 class="fw-bold mb-0">
            32
          </h3>
          <div class="text-dark opacity-75 reduced">
            Assistants
          </div>
        </div>
      </div>
    </div>
    <div class="border-start border-end border-bottom rounded-bottom p-3 bg-white">
      <div class="row">
        <div class="col-auto">
          <input type="text" class="form-control rounded-sm py-2 px-3 reduced" placeholder="Search assistants by title, creator, category, etc..." style="min-width: 25rem;">
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-white d-inline-flex align-items-center justify-content-center py-2 px-3">
            <span>All Assistants</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-white d-inline-flex align-items-center justify-content-center py-2 px-3">
            <span>Recent</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-white d-inline-flex align-items-center justify-content-center py-2 px-3">
            <span>All Categories</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
        <div class="col-auto">
          <div class="p-2 border reduced rounded-sm bg-white d-inline-flex align-items-center justify-content-center py-2 px-3">
            <span>Any Creator</span>
            <img src="../assets/dropdown.svg" width="12" height="12" class="ms-3">
          </div>
        </div>
      </div>
    </div>

    <div class="basic-box-grid mt-4">
      <div
        v-for="assistant in mockAssistants"
        :key="assistant.id"
        class="basic-box-grid__item border bg-white pt-4 rounded d-flex flex-column overflow-hidden"
      >
        <div class="px-4 mb-4">
          <h6 class="fw-semibold mb-1 lead">
            {{ assistant.title }}
          </h6>
          <p class="text-secondary not-as-small mb-0">
            {{ assistant.description }}
          </p>
        </div>
        <div class="mt-auto bg-light px-4 py-2 border-top not-as-small">
          Creator Name
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
</style>
