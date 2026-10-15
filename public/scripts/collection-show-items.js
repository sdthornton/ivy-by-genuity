/* Shared item-type treatment for every collection preview. */
(() => {
  function typeOf(type) {
    if (/assistant/i.test(type)) return 'assistant';
    if (/prompt/i.test(type)) return 'prompt';
    if (/chat|conversation/i.test(type)) return 'chat';
    return 'file';
  }
  function apply(element, type) {
    element.classList.add('collection-type-surface');
    element.dataset.resourceType = typeOf(type);
  }
  function refresh() {
    document.querySelectorAll('.pinned-item-link').forEach(item => {
      const icon = item.querySelector('.pinned-item-icon');
      if (icon) apply(icon, item.querySelector('.pinned-item-content span')?.textContent || item.textContent);
    });
    document.querySelectorAll('.recently-used-resource-icon').forEach(icon => {
      let parent = icon.parentElement;
      for (let i = 0; i < 3 && parent; i++, parent = parent.parentElement) {
        const text = parent.textContent;
        if (/assistant|chat|prompt|PDF|file/i.test(text)) { apply(icon, text); break; }
      }
    });
    document.querySelectorAll('[class*="rec-type-"]').forEach(el => {
      for (const type of ['chat', 'prompt', 'assistant']) if (el.classList.contains('rec-type-' + type)) apply(el, type);
    });
  }
  window.IvyItemColors = {apply, refresh};
})();
