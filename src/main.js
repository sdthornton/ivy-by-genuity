import { createApp } from 'vue'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import './style.css'

import { createWebHashHistory, createRouter } from 'vue-router';
import App from "./App.vue";
import HomePage from "./components/HomePage.vue";
import Chat from "./components/Chat.vue";
import PromptLibrary from "./components/PromptLibrary.vue";
import Assistants from "./components/Assistants.vue";
import AssistantsIndex from "./components/AssistantsIndex.vue";
import Collections from "./components/Collections.vue";
import Sources from "./components/Sources.vue";
import OnboardingChat from "./components/OnboardingChat.vue";
import WhatCanIvyDo from "./components/WhatCanIvyDo.vue";
import { ivyInActionScenarioList } from "./components/ivy-in-action/scenarios";

const routes = [
  { path: "/", component: HomePage, name: "Home", meta: { homeLayout: true } },
  { path: "/chat", component: Chat, name: "Chat" },
  { path: "/prompt-library", component: PromptLibrary, name: "Prompt Library" },
  { path: "/assistants", component: AssistantsIndex, name: "Assistants" },
  { path: "/assistants/new", component: Assistants, name: "Assistant Builder", meta: { splitContent: true } },
  { path: "/assistants/:assistantId", component: Assistants, name: "Assistant", meta: { splitContent: true } },
  { path: "/assistants-index", redirect: "/assistants" },
  { path: "/collections", component: Collections, name: "Collections" },
  { path: "/sources", component: Sources, name: "Sources" },
  {
    path: "/ivy-in-action",
    component: WhatCanIvyDo,
    name: "Ivy in Action",
    props: { autoStartScenario: false, scenarioKey: "" },
  },
  { path: "/what-can-ivy-do", redirect: "/ivy-in-action" },
  { path: "/chats/ivy-in-action", redirect: "/ivy-in-action" },
  { path: "/chats/see-what-ivy-can-do", redirect: "/ivy-in-action" },
  ...ivyInActionScenarioList.map((scenario) => ({
    path: scenario.path,
    component: WhatCanIvyDo,
    name: scenario.query,
    props: { autoStartScenario: true, scenarioKey: scenario.key },
  })),
  { path: "/chats/ivy-onboarding", component: OnboardingChat, name: "Onboarding Chat" },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
  routes,
});

createApp(App)
  .use(router)
  .use(FloatingVue)
  .mount('#app')
