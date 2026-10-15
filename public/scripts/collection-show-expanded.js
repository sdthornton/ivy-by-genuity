/* Expanded presentation shares the same item data as Compact and List. */
(() => {
  const descriptions = {
    'Access reviews': 'Review account access and identify permissions that need attention.',
    'Account cleanup': 'Find inactive accounts and resolve ownership gaps before the next review.',
    'Review guidance': 'Keep review decisions consistent with clear policies and practical guidance.',
    'Licensing': 'Find unused licenses and opportunities to reduce unnecessary costs.',
    'Reports': 'Summarize review findings, decisions, and supporting evidence.',
    'User inventory': 'Explore account records and ownership details across your organization.',
    'Endpoint protection': 'Identify protection gaps and keep your endpoints secure.',
    'Backup readiness': 'Review recovery coverage and confirm critical work can be restored.',
    'External sharing': 'Check external access and keep shared information in the right hands.',
    'Mailbox protection': 'Find risky forwarding rules and review mailbox security settings.',
    'Domain filtering': 'Review domain exceptions and investigate potentially unsafe web access.',
    'Security awareness': 'Coordinate follow-up actions that help people work more securely.',
    'Service requests': 'Track open requests and assign the next steps to the right team.',
    'Review coordination': 'Capture review discussions, decisions, and follow-up actions.',
    'Device health': 'Identify missing patches and devices that need attention.',
    'Network access': 'Review remote connections and investigate network access risks.'
  };
  const chart = '<svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="17" y="8" width="4" height="13" rx="1"/></svg>';
  const clock = '<svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6h5"/></svg>';
  const owners = [['Steve', 'SJ'], ['Sarah', 'SC'], ['John', 'JD']];
  function render(card) {
    if (card.querySelector('.expanded-item-content')) return;
    const title = card.querySelector('h2').textContent.trim();
    const type = card.dataset.itemType;
    const seed = [...title].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const [name, initials] = owners[seed % owners.length];
    const description = descriptions[card.dataset.itemCategory] || 'Keep useful work close at hand for your next investigation.';
    const count = card.querySelector('[data-item-usage]')?.textContent.match(/[\d,]+/)?.[0] || '0';
    const content = document.createElement('div');
    content.className = 'expanded-item-content flex h-full min-w-0 flex-col';
    content.innerHTML = `<div class="flex items-center gap-2 mb-4"><span class="expanded-type-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"></span><span class="expanded-type-label text-xs"></span><div class="expanded-usage ml-auto flex shrink-0 items-center gap-1 text-xs font-normal">${chart}<span></span></div>${card.dataset.itemVisibility === 'Private' ? '<span class="expanded-private text-xs">Private</span>' : ''}</div><h3 class="text-sm font-semibold mb-1"></h3><p class="expanded-description text-xs mb-4"></p><footer class="expanded-item-footer flex flex-wrap items-center gap-3 border-t pt-3 mt-auto text-xs font-medium"><span class="flex min-w-0 items-center gap-1.5"><span class="expanded-owner-avatar inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs"></span><span class="expanded-owner"></span></span><span class="expanded-time flex items-center gap-1 whitespace-nowrap">${clock}<span></span></span><button type="button" class="expanded-action ml-auto rounded-lg border px-2 py-0.5 text-xs font-medium"></button></footer>`;
    const icon = content.querySelector('.expanded-type-icon');
    icon.append(card.firstElementChild.querySelector('svg').cloneNode(true));
    IvyItemColors.apply(icon, type);
    content.querySelector('.expanded-type-label').textContent = type;
    content.querySelector('h3').textContent = title;
    content.querySelector('.expanded-description').textContent = description;
    content.querySelector('.expanded-usage span').textContent = `${count} uses`;
    const avatar = content.querySelector('.expanded-owner-avatar');
    const photos = document.querySelectorAll('#collection-stream-panel img[src^="data:"]');
    const photo = photos[seed % owners.length];
    if (photo) {
      const img = document.createElement('img'); img.src = photo.src; img.alt = ''; img.className = 'h-full w-full object-cover'; avatar.append(img);
    } else avatar.textContent = initials;
    content.querySelector('.expanded-owner').textContent = name;
    const time = content.querySelector('.expanded-time');
    time.querySelector('span').textContent = ['2h ago', '5h ago', '1d ago'][seed % 3];
    time.title = `Updated ${card.dataset.itemUpdated}`;
    const action = content.querySelector('button');
    action.textContent = ['Assistant', 'Prompt'].includes(type) ? 'Run' : 'View';
    action.setAttribute('aria-label', `${action.textContent} ${title}`);
    action.addEventListener('click', () => {
      const dialog = document.createElement('dialog');
      dialog.className = 'expanded-preview rounded-xl border p-6';
      const heading = document.createElement('h2'); heading.className = 'text-lg font-semibold mb-2'; heading.textContent = title;
      const copy = document.createElement('p'); copy.className = 'text-sm mb-4'; copy.textContent = description;
      const note = document.createElement('p'); note.className = 'text-xs mb-4'; note.textContent = 'Offline preview — opening and running items will be connected in the live app.';
      const close = document.createElement('button'); close.className = 'expanded-action rounded-lg border px-3 py-1'; close.textContent = 'Close'; close.onclick = () => dialog.close();
      dialog.append(heading, copy, note, close); document.body.append(dialog); dialog.addEventListener('close', () => { dialog.remove(); action.focus(); }); dialog.showModal();
    });
    const header = content.firstElementChild;
    const corner = document.createElement('div');
    corner.className = 'expanded-card-corner relative ml-auto flex items-center justify-end';
    const metadata = document.createElement('div');
    metadata.className = 'expanded-card-metadata flex items-center gap-2';
    metadata.append(content.querySelector('.expanded-usage'));
    const privacy = content.querySelector('.expanded-private');
    if (privacy) metadata.append(privacy);
    corner.append(metadata, listActions(card, true));
    header.append(corner);
    card.append(content);
  }
  let menuId = 0;
  function listActions(card, cardMode = false) {
    const title = card.querySelector('h2').textContent.trim();
    const wrap = document.createElement('div');
    wrap.className = 'flex items-center justify-end gap-2';
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'expanded-more flex h-7 w-7 shrink-0 items-center justify-center rounded-lg';
    more.setAttribute('aria-label', `More actions for ${title}`);
    more.setAttribute('aria-haspopup', 'menu');
    more.setAttribute('aria-expanded', 'false');
    more.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>';
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'expanded-action rounded-lg border px-2 py-0.5 text-xs font-medium';
    action.textContent = ['Assistant', 'Prompt'].includes(card.dataset.itemType) ? 'Run' : 'View';
    action.setAttribute('aria-label', `${action.textContent} ${title}`);
    const preview = () => {
      card.querySelector('.expanded-action').click();
      document.querySelector('.expanded-preview')?.addEventListener('close', () => (cardMode ? more : action).focus(), {once: true});
    };
    action.addEventListener('click', preview);
    const menu = document.createElement('div');
    menu.id = `item-actions-${++menuId}`;
    menu.className = 'item-actions-menu rounded-lg border p-1';
    menu.setAttribute('popover', 'auto');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', `Actions for ${title}`);
    more.setAttribute('aria-controls', menu.id);
    for (const [label, handler] of [
      ['View details', preview],
      ['Show in card view', () => {
        document.getElementById('card_view').click();
        card.scrollIntoView({block: 'center', behavior: 'smooth'});
        card.querySelector('.expanded-action').focus({preventScroll: true});
      }]
    ]) {
      const option = document.createElement('button');
      option.type = 'button'; option.className = 'block w-full rounded px-3 py-2 text-left text-xs';
      option.setAttribute('role', 'menuitem'); option.textContent = label;
      option.addEventListener('click', () => { menu.hidePopover(); handler(); });
      menu.append(option);
    }
    more.addEventListener('click', () => {
      if (menu.matches(':popover-open')) { menu.hidePopover(); return; }
      menu.showPopover();
      const rect = more.getBoundingClientRect();
      menu.style.left = `${Math.max(8, Math.min(rect.right - menu.offsetWidth, innerWidth - menu.offsetWidth - 8))}px`;
      menu.style.top = `${rect.bottom + menu.offsetHeight + 8 > innerHeight ? rect.top - menu.offsetHeight - 4 : rect.bottom + 4}px`;
      menu.firstElementChild.focus();
    });
    menu.addEventListener('toggle', () => more.setAttribute('aria-expanded', String(menu.matches(':popover-open'))));
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') more.focus();
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        const options = [...menu.children];
        options[(options.indexOf(document.activeElement) + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
      }
    });
    if (cardMode) {
      wrap.className = 'expanded-card-actions absolute flex items-center gap-2';
      more.className = 'expanded-more expanded-card-button flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white-100';
      more.querySelector('svg').style.transform = 'rotate(90deg)';
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'expanded-pin expanded-card-button flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white-100';
      pin.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14.25 4.25 5.5 5.5-2 2-1.25-1.25-3.5 3.5.25 2.25-1.5 1.5-5.5-5.5 1.5-1.5 2.25.25 3.5-3.5-1.25-1.25 2-2ZM9 15l-5 5"/></svg>';
      pin.setAttribute('aria-label', `Pin ${title}`);
      pin.setAttribute('aria-pressed', 'false');
      pin.addEventListener('click', () => window.IvyCollectionPins?.toggle(card));
      menu.lastElementChild.remove();
      wrap.append(pin, more, menu);
    } else wrap.append(action, more, menu);
    return wrap;
  }
  window.IvyExpandedItems = {render, listActions};
})();
