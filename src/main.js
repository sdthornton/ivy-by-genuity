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
import Onboarding from "./components/Onboarding.vue";
import IntegratedOnboarding from "./components/IntegratedOnboarding.vue";
import OnboardingChat from "./components/OnboardingChat.vue";

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
  { path: "/onboarding", component: Onboarding, name: "Onboarding", meta: { hideLeftNav: true } },
  { path: "/chats/ivy-onboarding", component: OnboardingChat, name: "Onboarding Chat" },
  { path: "/integrated-onboarding", component: IntegratedOnboarding, name: "Integrated Onboarding", meta: { homeLayout: true } },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

createApp(App)
  .use(router)
  .use(FloatingVue)
  .mount('#app')
