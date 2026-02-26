// src/components/LeftNav.vue

<script setup>

import { onBeforeMount, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const toggleLeftNav = () => {
  document.body.classList.toggle('left-nav-open');
}

const viewportSize = {
  width: null,
  height: null,
};

const fixedHeightObserver = new ResizeObserver(entries => {
  if (window.innerWidth === viewportSize.width && window.innerHeight === viewportSize.height) {
    return;
  }

  for (let entry of entries) {
    if (entry.target.classList.contains('fixed-height-set')) {
      return;
    }
    const fixedHeight = entry.contentRect.height;
    entry.target.style.height = `${fixedHeight}px`;
    entry.target.classList.add('fixed-height-set');
  }
  viewportSize.width = window.innerWidth;
  viewportSize.height = window.innerHeight;
});

const leftNavSubLinks = ref([]);
const setSubLinkRef = el => {
  if (el) {
    leftNavSubLinks.value.push(el);
  }
}

const route = useRoute();
onBeforeMount(() => {
  if (!route.meta?.splitContent) {
    document.body.classList.add('left-nav-open');
  }
});

onMounted(() => {
  leftNavSubLinks.value.forEach(el => {
    el.style.height = "auto";
    fixedHeightObserver.observe(el);
  });
});

watch(route, to => {
  if (to.meta?.splitContent) {
    document.body.classList.remove('left-nav-open');
    document.body.classList.add('split-content-page');
  } else {
    document.body.classList.add('left-nav-open');
    document.body.classList.remove('split-content-page');
  }
});

onBeforeUnmount(() => {
  fixedHeightObserver.disconnect()
});
</script>

<template>
  <a href="#" class="toggle-left-nav" @click.prevent.stop="toggleLeftNav">
    <img src="../assets/toggle-left-nav-box.svg" class="toggle-left-nav__box">
    <img src="../assets/toggle-left-nav-line.svg" class="toggle-left-nav__line">
    <img src="../assets/toggle-left-nav-arrow.svg" class="toggle-left-nav__arrow">
  </a>
  <div class="left-nav pt-3 d-flex flex-column">
    
    <div class="company-drawer">
      <div class="company-drawer__logo" style="background-image: url('https://s3.amazonaws.com/nulodgic-static-assets/images/location_defaults/default5_thumbnail.png');"></div>
      <div class="company-drawer__info ms-md-2 w-100">
        <div class="d-flex align-items-center">
          <h6 class="company-drawer__name fw-bold not-as-small mb-0 me-2 text-white">The Jedi Enclave</h6>
          <img src="../assets/arrow-down-b.svg" width="12" height="12" class="opacity-50 invert-to-white">
        </div>
      </div>
    </div>

    <div class="left-nav-inner-wrap mt-3">
      <RouterLink to="/" class="left-nav-link left-nav-link--home">
        <img src="../assets/nav-resources-nav.svg" width="24" height="24" />
        <span class="left-nav-link-text">Ivy</span>
      </RouterLink>
      <RouterLink to="/chat" class="left-nav-link d-flex">
        <img src="../assets/nav-chat.svg" width="18" height="18" />
        <span class="left-nav-link-text me-2">Chat</span>
      </RouterLink>
      <RouterLink to="/prompt-library" class="left-nav-link d-flex">
        <img src="../assets/nav-prompt-library.svg" width="18" height="18" />
        <span class="left-nav-link-text">Prompt Library</span>
        <!-- <img src="./assets/arrow-down-b.svg" width="12" height="12" class="ms-auto opacity-50"> -->
      </RouterLink>
      <!-- <span class="left-nav-sub-links" :ref="setSubLinkRef">
        <a href="#" class="left-nav-sub-link">
          My Prompts
        </a>
        <a href="#" class="left-nav-sub-link">
          Shared Prompts
        </a>
        <a href="#" class="left-nav-sub-link">
          Recommended Prompts
        </a>
      </span> -->
      <RouterLink to="/assistants" class="left-nav-link">
        <img src="../assets/nav-resources.svg" width="18" height="18" />
        <span class="left-nav-link-text">Assistants</span>
      </RouterLink>
      <RouterLink to="/collections" class="left-nav-link">
        <img src="../assets/nav-collections.svg" width="18" height="18" />
        <span class="left-nav-link-text">Collections</span>
      </RouterLink>
      <a href="#" class="left-nav-link">
        <img src="../assets/nav-connectors.svg" width="18" height="18" />
        <span class="left-nav-link-text">Sources</span>
      </a>
      <a href="#" class="left-nav-link d-flex">
        <img src="../assets/history.svg" width="18" height="18" />
        <span class="left-nav-link-text">History</span>
      </a>
      <!-- <span class="left-nav-sub-links" :ref="setSubLinkRef">
        <a href="#" class="left-nav-sub-link">
          Cloud-Based Savings
        </a>
        <a href="#" class="left-nav-sub-link">
          IT Environment Report
        </a>
        <a href="#" class="left-nav-sub-link">
          New Security Risks
        </a>
        <a href="#" class="left-nav-sub-link">
          Application Usage Report
        </a>
        <a href="#" class="left-nav-sub-link">
          Summary of IT Dependencies
        </a>
      </span> -->
    </div>
    <div class="mt-auto left-nav__bottom">
      <a href="#" class="left-nav-link">
        <img src="../assets/nav-reporting.svg" width="18" height="18" />
        <span class="left-nav-link-text">Analytics</span>
      </a>
      <a href="#" class="left-nav-link">
        <img src="../assets/nav-teams.svg" width="18" height="18" />
        <span class="left-nav-link-text">Teams</span>
      </a>
      <a href="#" class="left-nav-link">
        <img src="../assets/nav-settings.svg" width="18" height="18" />
        <span class="left-nav-link-text">Settings</span>
      </a>
    </div>
    <div class="left-nav__profile">
      <div class="profile-menu-toggle">
        <div class="row align-items-center flex-nowrap">
          <div class="col-auto pe-1">
            <div class="user__text-avatar" style="background-color: #009688;">SR</div>
          </div>
          <div class="col-auto d-none d-lg-inline-block ps-2 pe-0 text-nowrap">
            <div class="text-white fw-bold not-as-small flatten-line-height">Sarith Rigsby</div>
            <div class="text-white opacity-75 smallest flatten-line-height mt-1">sarith@jeditemple.com</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";

.toggle-left-nav {
  background-color: transparent;
  border-radius: 50%;
  display: block;
  height: 2.5rem;
  left: $left-nav-open-width + 0.4375rem;
  opacity: 0.8;
  padding: 0.5rem;
  position: fixed;
  top: $content-inset + 0.4375rem;
  transform: translateX(#{$left-nav-closed-width - $left-nav-open-width});
  transition: all 0.2s ease-in-out;
  width: 2.5rem;
  will-change: transform, background-color, opacity;
  z-index: 99;

  &:hover {
    background-color: var(--bs-gray-400);
    opacity: 1;
  }

  .left-nav-open & {
    transform: translateX(0);
  }
}

.toggle-left-nav__arrow {
  opacity: 0;

  .toggle-left-nav:hover & {
    opacity: 1;
  }
}

.toggle-left-nav__box,
.toggle-left-nav__line,
.toggle-left-nav__arrow {
  inset: 0.75rem;
  position: absolute;
  transition: all 0.1s ease-in;
}

.left-nav-open {
  .toggle-left-nav__line {
    transform: translateX(15.625%);
  }

  .toggle-left-nav__arrow {
    transform: scaleX(-1);
  }
}

.company-drawer {
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-wrap: nowrap;
  margin-top: 0;
  padding: 0.3125rem;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  width: 3rem;
  z-index: 2;
  will-change: margin-left, margin-top, width, padding;

  .left-nav-open & {
    padding: 0.5rem;
    width: $left-nav-open-width - ($content-inset * 2);
  }
}

.company-drawer__logo {
  background-color: white;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  display: block;
  flex-shrink: 0;
  height: 1.5rem;
  object-fit: cover;
  width: 1.5rem;
}

.company-drawer__name {
  opacity: 0;
  transition: all 0.2s ease-in-out;
  will-change: opacity;

  .left-nav-open & {
    opacity: 1;
  }
}

.left-nav {
  background-color: $left-nav-background;
  background: transparent;
  height: 100vh;
  left: 0;
  letter-spacing: 0.25px;
  overflow: auto;
  opacity: 1;
  padding-left: $content-inset;
  padding-right: $content-inset;
  position: fixed;
  top: 0;
  transition: all 0.2s ease-out;
  width: $left-nav-closed-width;
  will-change: width, background-color;

  .left-nav-open & {
    transition-timing-function: ease-in;
    width: $left-nav-open-width;
  }
}

.left-nav-link {
  align-items: center;
  border-radius: 0.5rem;
  display: flex;
  letter-spacing: 0.25px;
  justify-content: start;
  margin-top: 0.25rem;
  width: 2.375rem;
  padding: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s ease-in-out;
  white-space: nowrap;

  &:hover {
    background-color: rgba(255,255,255,0.15);
  }

  .left-nav-open & {
    width: 100%;
  }

  img {
    transition: all 0.2s ease-in-out;
    transform: translateX(0.125rem);
  }

  &:not(.left-nav-link--home) img {
    filter: invert(1) brightness(2);
    opacity: 1;
  }

  .left-nav-open & {
    &:not(.left-nav-link--home) img {
      opacity: 0.75;
    }

    img {
      transform: translateX(0);
    }
  }
}

.left-nav-link--home {
  padding: 0.3125rem;
}

.left-nav-sub-links {
  display: flex;
  flex-direction: column;
  height: 0;
  padding-bottom: 0.25rem;
  opacity: 0;
  transition: 
    height 0.2s ease-out, 
    opacity 0.1s ease-out;
  will-change: height;

  .left-nav-open & {
    height: auto;
    opacity: 1;
    transition: 
      height 0.2s ease-in, 
      opacity 0.1s 0.1s ease-in;
  }
}

body:not(.left-nav-open) .left-nav-sub-links {
  height: 0 !important;
}

.left-nav-sub-link {
  border-radius: 0.5rem;
  // color: var(--bs-gray-700);
  color: white;
  display: inline-block;
  font-size: 0.875rem;
  margin: 0 1.5rem;
  opacity: 0.5;
  overflow: hidden;
  padding: 0.25rem 0.75rem;
  padding-left: 1.5rem;
  text-decoration: none;
  text-overflow: ellipsis;
  text-wrap: nowrap;

  &:hover {
    background-color: color.mix($left-nav-background, #020D1C, 92.5%);
  }
}

.left-nav-link-text {
  // color: var(--bs-dark);
  color: white;
  font-size: 0.875rem;
  margin-left: 0.75rem;
  opacity: 0;
  transition: all 0.2s ease-in-out;

  .left-nav-open & {
    opacity: 1;
  }
}

.left-nav__bottom {
  padding-bottom: 5.75rem;
}

.left-nav__profile {
  bottom: 0;
  left: 0;
  padding: $content-inset;
  padding-left: 1rem;
  position: fixed;
  transform: translateX(-12px);
  width: $left-nav-open-width;

  .left-nav-open & {
    transform: translateX(0);
  }
}

.profile-menu-toggle {
  background: rgba(255,255,255,0.075);
  // background: rgba(0,0,0,0.075);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.user__text-avatar {
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.65);
  display: block;
  font-weight: bold;
  height: 2.25rem;
  line-height: 2.25rem;
  text-align: center;
  width: 2.25rem;
}
</style>
