<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  showBreadcrumb: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const router = useRouter();

function formatSegmentLabel(segment) {
  const decodedSegment = decodeURIComponent(String(segment || ""));
  return decodedSegment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRouteLabel(path) {
  const resolvedRoute = router.resolve(path);
  const matchedRoute = resolvedRoute.matched[resolvedRoute.matched.length - 1];
  const breadcrumbLabel = matchedRoute?.meta?.breadcrumbLabel;

  if (typeof breadcrumbLabel === "string" && breadcrumbLabel.length > 0) {
    return breadcrumbLabel;
  }

  if (typeof matchedRoute?.name === "string" && matchedRoute.name.length > 0) {
    return matchedRoute.name;
  }

  if (typeof resolvedRoute.name === "string" && resolvedRoute.name.length > 0) {
    return resolvedRoute.name;
  }

  return "";
}

const breadcrumbItems = computed(() => {
  const routePath = String(route.path || "/");
  const pathSegments = routePath.split("/").filter(Boolean);
  const items = [{ label: "Ivy", to: "/" }];

  if (!pathSegments.length) {
    items.push({ label: "Home", to: "/" });
    return items;
  }

  pathSegments.forEach((segment, index) => {
    const to = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const isLast = index === pathSegments.length - 1;
    const label = getRouteLabel(to) || formatSegmentLabel(segment);
    items.push({ label, to: isLast ? "" : to });
  });

  return items;
});
</script>

<template>
  <div class="content-header-spacer" />
  <div 
    v-if="showBreadcrumb"
    class="content-header-info reduced pe-4 d-flex align-items-center"
    :class="{ 'is-split-content ps-4': $route.meta.splitContent }"
  >
    <template v-for="(item, index) in breadcrumbItems" :key="`${item.label}-${index}`">
      <RouterLink
        v-if="item.to && index < breadcrumbItems.length - 1"
        :to="item.to"
        class="content-header-breadcrumb-link text-secondary"
      >
        {{ item.label }}
      </RouterLink>
      <span
        v-else
        class="text-secondary"
        :class="{ 'fw-medium': index === breadcrumbItems.length - 1 }"
      >
        {{ item.label }}
      </span>
      <span v-if="index < breadcrumbItems.length - 1" class="mx-3 text-secondary reduced">&rsaquo;</span>
    </template>
    <slot />
  </div>
  <div
    v-else
    class="content-header-info reduced pe-4 d-flex align-items-center"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
$header-height: 3.5rem;

.content-header-info {
  background-color: var(--bs-gray-150);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: $shadow-header;
  display: flex;
  align-items: center;
  height: $header-height;
  left: $left-nav-closed-width;
  padding-left: 4.5rem;
  position: fixed;
  top: $content-inset;
  transition: all 0.2s ease-in-out;
  width: calc(100% - $left-nav-closed-width - $content-inset);
  z-index: 999;

  &.is-split-content {
    border-top-left-radius: 0rem;
    margin-left: 0;
    margin-right: 0;
    left: calc($left-nav-closed-width + var(--user-width, 24rem));
    width: calc(100% - $left-nav-closed-width - $content-inset - var(--user-width, 24rem));
  }

  .left-nav-open &.is-split-content {
    left: calc($left-nav-open-width + var(--user-width, 24rem));
    width: calc(100% - $left-nav-open-width - $content-inset - var(--user-width, 24rem));
  }

  .left-nav-open & {
    left: $left-nav-open-width;
    width: calc(100% - $left-nav-open-width - $content-inset);
  }
}

.content-header-spacer {
  position: relative;
  height: $header-height;
  top: 0;
}

.content-header-breadcrumb-link {
  text-decoration: none;
}

.content-header-breadcrumb-link:hover {
  color: var(--bs-gray-700) !important;
}

</style>
