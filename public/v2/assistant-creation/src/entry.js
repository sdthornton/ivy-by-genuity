import { createApp, h } from 'vue';
import { createRouter, createMemoryHistory, RouterView } from 'vue-router';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import Assistants from './components/Assistants.vue';
import './legacy-helpers.css';
import './compatibility.css';
import './page-adapter.css';

const indexURL = new URL('../workflows.html', window.location.href).href;
const leaveBuilder = () => { window.top.location.href = indexURL; return false; };
const history = createMemoryHistory();
history.replace('/workflows/new');
const router = createRouter({
  history,
  routes: [
    { path: '/', beforeEnter: leaveBuilder },
    { path: '/workflows', name: 'Workflows', beforeEnter: leaveBuilder },
    { path: '/workflows/new', name: 'New workflow', component: Assistants, meta: { splitContent: true } },
    { path: '/workflows/:assistantId', name: 'Workflow', component: Assistants, meta: { splitContent: true } },
  ],
});
const app = createApp({ render: () => h('main', { class: 'page-content' }, h(RouterView)) });
app.use(router).use(FloatingVue);
router.push('/workflows/new').then(() => router.isReady()).then(() => app.mount('#app'));
