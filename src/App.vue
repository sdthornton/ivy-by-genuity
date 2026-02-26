// src/App.vue

<script setup>
import LeftNav from "./components/LeftNav.vue";
</script>

<template>
  <LeftNav />  
  <div 
    class="content-container d-flex justify-content-center bg-titan-white"
    :class="{ 'px-0': $route.meta.splitContent }"
  >
    <main 
      class="page-content"
      :class="$route.name === 'Home' ? 'my-auto text-content-wrap' : 'w-100'"
    >
      <RouterView />
    </main>
  </div>
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

.flatten-line-height {
  line-height: 1rem;
}

.bg-iceberg-blue {
  background-color: $iceberg-blue;
}

.bg-lighter {
  background-color: #f8f9fa;
}

.bg-maastricht-blue {
  background-color: $maastricht-blue;
}

.bg-dark-blue {
  background-color: $dark-blue;
}

.bg-titan-white {
  background-color: $titan-white;
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

/* 
 * Begin New CSS 
 */

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
  // background-color: var(--bs-gray-100);
  // background-color: $titan-white;
  background-color: white;
  overflow: hidden;
  position: relative;

  &:before {
    content: "";
    inset: 0;
    opacity: 0.15;
    position: absolute;
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

body {
  background: $left-nav-background;
  // background-image: linear-gradient(45deg, $left-nav-background, $biscay-blue, $maastricht-blue);
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

</style>

<style scoped lang="scss">
@use "sass:color";

.content-container {
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px -4px rgba(0,0,0,0.15);
  height: calc(100vh - #{$content-inset * 2});
  inset: $content-inset;
  left: $left-nav-closed-width;
  overflow: scroll;
  padding-left: 4.5rem;
  padding-right: 4.5rem;
  position: fixed;
  transition: left 0.2s ease-in-out;

  .left-nav-open & {
    left: $left-nav-open-width;
  }

  // &:before {
  //   background-image: 
  //     linear-gradient(
  //       25deg,
  //       hsl(0deg 0% 100%) 0%,
  //       hsl(300deg 100% 100%) 34%,
  //       hsl(300deg 100% 100%) 54%,
  //       hsl(239deg 100% 94%) 71%,
  //       hsl(233deg 100% 80%) 86%,
  //       hsl(216deg 98% 52%) 100%
  //     );
  //   content: "";
  //   filter: blur(10px);
  //   inset: 0;
  //   opacity: 0.1;
  //   pointer-events: none;
  //   position: absolute;
  //   z-index: -1;
  // }
}

.text-content-wrap {
  max-width: 52rem;
  width: 100%;
}

// .footer-line {
//   background-color: $left-nav-background;
//   background: linear-gradient(to right, $left-nav-background 5%, #ced4da 45%);
//   bottom: 0;
//   height: 0.5rem;
//   left: 4rem;
//   right: 0;
//   position: fixed;
//   transition: all 0.2s ease-in-out;
//   z-index: 41;

//   &:before {
//     background-color: transparent;
//     border-bottom-left-radius: 1rem;
//     bottom: 0.5rem;
//     box-shadow: 0 1.5rem 0 0 $left-nav-background;
//     content: "";
//     position: absolute;
//     height: 3rem;
//     width: 1.5rem;
//   }

//   .left-nav-open & {
//     left: 15rem;
//   }
// }
</style>
