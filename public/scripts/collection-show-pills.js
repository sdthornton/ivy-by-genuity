/* Preserve specific item labels as tags alongside the approved category pills. */
(() => {
  const labels = {
    'Access reviews': ['Identity', 'violet'],
    'Account cleanup': ['Identity', 'coral'],
    'Review guidance': ['Governance & Policy', 'stone'],
    'Licensing': ['Application Management', 'cyan'],
    'Reports': ['Governance & Policy', 'slate'],
    'User inventory': ['Identity', 'midnight'],
    'Endpoint protection': ["Endpoint Security", "coral"],
    'Backup readiness': ["Backup & Recovery", "yellow"],
    'External sharing': ["Collaboration", "cyan"],
    'Mailbox protection': ["Email Security", "emerald"],
    'Domain filtering': ["DNS / Web Security", "maroon"],
    'Security awareness': ["Human Risk", "magenta"],
    'Service requests': ["Ticketing / ITSM", "brown"],
    'Review coordination': ["Operations", "stone"],
    'Device health': ["Endpoint Management", "midnight"],
    'Network access': ["Network", "teal"],
  };
  function create(label) {
    const [category, family] = labels[label] || ['Operations', 'stone'];
    const pills = document.createElement('div');
    pills.className = 'collection-item-pills flex min-w-0 flex-wrap items-center gap-2';
    const tag = document.createElement('span');
    tag.className = 'ivy-tag-pill inline-flex max-w-full items-center gap-1 rounded-full border bg-transparent px-2 font-body text-xs font-normal leading-text-xs text-gray-600 h-[22px]';
    tag.setAttribute('aria-label', `Tag: ${label}`);
    const dot = document.createElement('span');
    dot.className = 'h-1.5 w-1.5 shrink-0 rounded-full';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.backgroundColor = `var(--ivy-color-${family}-500)`;
    const text = document.createElement('span');
    text.className = 'min-w-0 truncate';
    text.textContent = label;
    tag.append(dot, text);
    pills.append(IvyCategories.createPill(category), tag);
    return pills;
  }
  window.IvyShowPills = { create };
})();
