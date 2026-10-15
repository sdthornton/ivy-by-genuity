/* Keep recommendation content and actions in the shared item-card layout. */
(() => {
  const panel = document.getElementById('collection-recommendations-panel');
  if (!panel) return;
  panel.querySelectorAll('.rec-card').forEach(card => {
    const icon = card.querySelector('.rec-type-icon');
    const label = card.querySelector('.rec-type-label');
    const status = card.querySelector('.rec-status');
    const title = card.querySelector('h3');
    const description = card.querySelector('.rec-description');
    const reason = card.querySelector('.rec-reason');
    const owner = card.querySelector('.rec-owner');
    const action = card.querySelector('.rec-action');
    card.className = 'rec-card rec-item-card flex min-w-0 flex-col rounded-xl border bg-white-100 p-4';
    const header = document.createElement('header');
    header.className = 'flex items-center gap-2 mb-4';
    icon.className = 'expanded-type-icon flex h-7 w-7 shrink-0 items-center justify-center rounded';
    IvyItemColors.apply(icon, card.dataset.recType);
    label.className = 'expanded-type-label text-xs';
    status.className = 'rec-status ml-auto text-xs text-right';
    header.append(icon, label, status);
    title.className = 'text-sm font-semibold mb-1';
    description.className = 'rec-description text-xs mb-4';
    reason.className = 'rec-reason rounded-lg p-2 mb-4 text-xs';
    reason.querySelector('span').className = 'flex items-center gap-1 text-xs font-medium';
    reason.querySelector('p').className = 'mt-1 text-xs';
    const footer = document.createElement('footer');
    footer.className = 'expanded-item-footer flex flex-wrap items-center gap-3 border-t pt-3 mt-auto text-xs font-medium';
    owner.className = 'rec-owner flex min-w-0 items-center gap-1.5 text-xs';
    action.className = 'rec-action expanded-action inline-flex items-center justify-center gap-1 ml-auto rounded-lg border px-2 py-0.5 text-xs font-medium';
    footer.append(owner, action);
    card.replaceChildren(header, title, description, reason, footer);
  });
})();
