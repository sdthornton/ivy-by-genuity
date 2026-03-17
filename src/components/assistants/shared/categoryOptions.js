export const CATEGORY_OPTIONS = [
  "security",
  "threats",
  "activity",
  "monitoring",
  "backup",
  "sync",
  "operations",
  "compliance",
  "access",
];

export function formatCategoryLabel(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

