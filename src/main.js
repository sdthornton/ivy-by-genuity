import { createApp } from 'vue'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import './style.css'

import { createWebHistory, createRouter } from 'vue-router';
import App from "./App.vue";
import HomePage from "./components/HomePage.vue";
import Chat from "./components/Chat.vue";
import PromptLibrary from "./components/PromptLibrary.vue";
import Assistants from "./components/Assistants.vue";
import AssistantsIndex from "./components/AssistantsIndex.vue";
import Collections from "./components/Collections.vue";
import Onboarding from "./components/Onboarding.vue";

const routes = [
  { path: "/", component: HomePage, name: "Home" },
  { path: "/chat", component: Chat, name: "Chat" },
  { path: "/prompt-library", component: PromptLibrary, name: "Prompt Library" },
  { path: "/assistants", component: Assistants, name: "Assistants", meta: { splitContent: true } },
  { path: "/assistants-index", component: AssistantsIndex, name: "Assistants Index" },
  { path: "/collections", component: Collections, name: "Collections" },
  { path: "/onboarding", component: Onboarding, name: "Onboarding", meta: { hideLeftNav: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(router)
  .use(FloatingVue)
  .mount('#app')
