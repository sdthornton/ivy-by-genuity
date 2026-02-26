// src/main.js

import { createApp } from 'vue'
import './style.css'

import { createWebHistory, createRouter } from 'vue-router';
import App from "./App.vue";
import HomePage from "./components/HomePage.vue";
import Chat from "./components/Chat.vue";
import PromptLibrary from "./components/PromptLibrary.vue";
import Assistants from "./components/Assistants.vue";
import Collections from "./components/Collections.vue";

const routes = [
  { path: "/", component: HomePage, name: "Home" },
  { path: "/chat", component: Chat, name: "Chat" },
  { path: "/prompt-library", component: PromptLibrary, name: "Prompt Library" },
  { path: "/assistants", component: Assistants, name: "Assistants", meta: { splitContent: true } },
  { path: "/collections", component: Collections, name: "Collections" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount('#app')
