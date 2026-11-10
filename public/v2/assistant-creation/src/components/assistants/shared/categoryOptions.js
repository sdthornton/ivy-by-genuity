// Current workspace taxonomy; legacy IDs are accepted only when opening source mock flows.
const categories = window.IvyCategories.categories;
const legacy = { security: 'endpoint-security', threats: 'endpoint-security', activity: 'operations', monitoring: 'endpoint-management', backup: 'backup-recovery', sync: 'collaboration', compliance: 'governance-policy', access: 'identity' };
export const CATEGORY_OPTIONS = categories.map(category => category.id);
export function categoryId(value) {
  const key = String(value || '').trim();
  return categories.find(category => category.id === key || category.name === key)?.id || legacy[key] || 'operations';
}
export function formatCategoryLabel(value) {
  return categories.find(category => category.id === categoryId(value))?.name || 'Operations';
}
