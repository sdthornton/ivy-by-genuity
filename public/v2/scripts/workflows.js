(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const paths = {
    sparkleTwo: '<path d="m9 3 2.5 5.5L17 11l-5.5 2.5L9 19l-2.5-5.5L1 11l5.5-2.5ZM19 2l1.2 2.8L23 6l-2.8 1.2L19 10l-1.2-2.8L15 6l2.8-1.2Z"/>',
    moreVertical: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    undo: '<path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    arrowRight: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
    manual: '<path d="m8 4 12 8-12 8Z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    user: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="3"/><path d="M6 18a6 6 0 0 1 12 0"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="1.5"/><path d="M8 22h8M12 17v5"/>',
    users: '<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2ZM17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/>',
    shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6ZM8 11l3 3 5-6"/>',
    backup: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7M12 7v5l3 2"/>',
    file: '<path d="M14 2H5v20h14V7ZM14 2v6h5M8 12h8M8 16h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    runs: '<rect x="3" y="12" width="3" height="9" rx="1"/><rect x="10" y="4" width="3" height="17" rx="1"/><rect x="17" y="8" width="3" height="13" rx="1"/>',
    star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    completed: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
    failed: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
    incomplete: '<path d="m12 3 10 18H2ZM12 9v5M12 17h.01"/>',
    running: '<path d="M12 3a9 9 0 1 1-9 9M3 5v5h5"/>',
    sparkle: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>'
  };
  const icon = (name, classes = '') => `<svg${classes ? ` class="${classes}"` : ''} viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.shield}</svg>`;
  const tags = {
    Agents: 'orange', Authentication: 'coral', Compliance: 'indigo', Connectivity: 'success', Coverage: 'warning', Delivery: 'bluegray', Discovery: 'cyan', Executive: 'purple', Evidence: 'slate', Alerts: 'slate', Onboarding: 'teal', Reporting: 'blue', Licensing: 'cyan', Review: 'violet', Security: 'error', Access: 'purple'
  };
  const assistants = [];
  function add(title, description, category, labels, owner, family, glyph, visibility, runs, hours, schedule = 'Every week', status = 'active', recommended = false) {
    const id = assistants.length + 1;
    assistants.push({id, title, description, category, tags: labels, owner, family, glyph, visibility, runs, hours, schedule, status, recommended, saved: false, added: 100-id, created: status === 'draft' ? 'Oct 20, 2026' : 'Oct 12, 2026'});
  }
  add('Review privileged account activity', 'Gather privileged accounts, recent sign-ins, and administrative changes into a summary for an access review.', 'Endpoint Security', ['Agents','Access','Review','Security'], 'Jackson Fox', 'success', 'lock', 'Private', 264, 2);
  add('Gather context on recent access issues', 'Collect sign-in failures, device compliance details, and recent access changes to help the team investigate reported login problems.', 'Identity', ['Authentication','Access'], 'Brooklyn', 'indigo', 'user', 'Shared', 264, 2);
  add('Compile endpoint security evidence', 'Gather protection status, encryption coverage, and recent detections into an evidence summary for a security review.', 'Endpoint Security', ['Compliance','Security'], 'Wade Warren', 'orange', 'monitor', 'Public', 288, 1);
  add('Collect information for a new office opening', 'Bring together network configuration, connectivity details, device readiness, and outstanding setup tickets for the office launch.', 'Network', ['Connectivity','Review'], 'Dianne Russell', 'bluegray', 'users', 'Private', 196, 6);
  add('Summarize mailbox security activity', 'Collect phishing reports, quarantine events, and delivery issues into a summary for the support team.', 'Email Security', ['Coverage','Security'], 'Jenny Wilson', 'warning', 'mail', 'Shared', 159, 12);
  add('Summarize changes since last week', 'Gather recent account, device, and sharing changes across connected systems into a team update.', 'Collaboration', ['Delivery','Access'], 'Jerome Bell', 'stone', 'shield', 'Shared', 132, .5);
  add('Prepare a backup readiness summary', 'Gather backup results, failed jobs, retention settings, and recovery coverage for an operations review.', 'Backup & Recovery', ['Discovery','Coverage'], 'Cameron', 'cyan', 'backup', 'Private', 125, 2, 'Every day');
  add('Prepare for our quarterly IT review', 'Gather account activity, device health, licensing usage, and recent system changes into a briefing for the IT team.', 'Governance & Policy', ['Executive','Compliance'], 'Leslie Alexander', 'purple', 'file', 'Public', 94, 2, 'Every month');
  add('Summarize phishing and training results', 'Collect training completion, phishing simulation results, and relevant support activity for a team briefing.', 'Human Risk', ['Evidence','Coverage'], 'Esther Howard', 'pink', 'users', 'Private', 58, 5);
  add('New hire access check', 'Review account setup, group memberships, and application access before a new teammate’s first day.', 'Identity', ['Onboarding','Access'], 'Samuel Thornton', 'teal', 'user', 'Shared', 42, 24, null);
  add('License optimization review', 'Find unassigned licenses and underused subscriptions to prepare your next Microsoft 365 renewal.', 'Application Management', ['Licensing','Reporting'], 'Sarah Chen', 'cyan', 'file', 'Shared', 37, 48, null);
  add('Service desk triage', 'Summarize incoming tickets, spot recurring issues, and suggest the next step for your support team.', 'Ticketing / ITSM', ['Review','Delivery'], 'Samuel Thornton', 'brown', 'users', 'Private', 86, 3, null);
  add('External sharing review', 'Find externally shared files and guest access that may need an owner’s review across Microsoft 365.', 'Collaboration', ['Access','Review'], 'Ivy', 'bluegray', 'globe', 'Public', 73, 8, null, 'active', true);
  add('Recovery readiness review', 'Bring backup failures, recovery coverage, and outstanding follow-ups into one practical readiness report.', 'Backup & Recovery', ['Coverage','Reporting'], 'Ivy', 'orange', 'backup', 'Public', 61, 24, null, 'active', true);
  add('Monthly security briefing', 'Turn signals from your connected systems into an executive summary with prioritized security actions.', 'Governance & Policy', ['Executive','Evidence'], 'Steve Jackson', 'violet', 'shield', 'Shared', 48, 48, null, 'active', true);
  add("Alert What's New", 'This just alerts me that something is new.', 'Governance & Policy', ['Alerts'], 'Samuel Thornton', 'purple', 'lock', 'Private', 0, null, null, 'draft');
  assistants.at(-1).created = 'Jul 22, 2026';
  add('Quarterly access review', 'Prepare a review of privileged access, inactive accounts, and owners who still need to sign off.', 'Identity', ['Access','Review'], 'Samuel Thornton', 'indigo', 'user', 'Private', 0, null, null, 'draft');
  add('Endpoint health digest', 'Collect device health, patch coverage, and unresolved alerts into a weekly team digest.', 'Endpoint Management', ['Alerts','Coverage'], 'Samuel Thornton', 'orange', 'monitor', 'Private', 0, null, null, 'draft');
  // Sample latest-run states, separate from the workflow's active/draft lifecycle.
  assistants.find(a=>a.id===4).latestRunStatus='Failed';
  assistants.find(a=>a.id===6).latestRunStatus='Incomplete';
  assistants.find(a=>a.id===12).latestRunStatus='Running';
  let view = 'overview', page = 1, toastTimer;
  const state = () => ({view, query: $('#assistant-search').value.trim().toLowerCase(), mode: $('#run-mode').value, sort: $('#assistant-sort').value, creator: $('#assistant-creator').value, category: $('#assistant-category').value, tag: $('#assistant-tag').value, size: Number($('#page-size').value)});
  function filtered(s = state()) {
    return assistants.filter(a => {
      if (a.archived) return false;
      if (s.view === 'drafts' ? a.status !== 'draft' : a.status === 'draft') return false;
      if (s.view === 'scheduled' && !a.schedule) return false;
      if (s.view === 'recommended' && !a.recommended) return false;
      if (s.mode === 'manual' && a.schedule || s.mode === 'scheduled' && !a.schedule) return false;
      if (s.creator !== 'all' && a.owner !== s.creator) return false;
      if (s.category !== 'all' && a.category !== s.category) return false;
      if (s.tag !== 'all' && !a.tags.includes(s.tag)) return false;
      return `${a.title} ${a.description} ${a.category} ${a.tags.join(' ')}`.toLowerCase().includes(s.query);
    }).sort((a,b) => s.sort === 'runs' ? b.runs-a.runs : s.sort === 'title' ? a.title.localeCompare(b.title) : b.added-a.added);
  }
  function pill(name) { return IvyCategories.createPill(name).outerHTML; }
  function tag(name) { return `<span class="assistant-tag" aria-label="Tag: ${esc(name)}"><span class="assistant-tag-dot" style="--tag-dot:var(--ivy-color-${tags[name] || 'slate'}-500)" aria-hidden="true"></span><span>${esc(name)}</span></span>`; }
  const elapsed = hours => hours === null ? 'Not run yet' : hours < 1 ? `${Math.round(hours*60)}m ago` : hours < 24 ? `${hours}h ago` : `${Math.floor(hours/24)}d ago`;
  function executionIndicator(a) {
    const execution=workflowActions.execution(a);
    const glyph={Completed:'completed',Failed:'failed',Incomplete:'incomplete',Running:'running'}[execution.status] || 'clock';
    const label=execution.status+(execution.time?' '+execution.time:'');
    return `<button type="button" class="workflow-execution text-xs" data-action="results" data-id="${a.id}" data-execution-status="${execution.status}" aria-label="${esc(label)}. View results for ${esc(a.title)}" title="${esc(execution.reason || 'View latest run results')}">${icon(glyph,'h-4 w-4')}<span class="text-xs">${esc(label)}</span></button>`;
  }
  function card(a) {
    const initials = a.owner.split(' ').map(n=>n[0]).slice(0,2).join('');
    const more = (type,items) => items.length > 1 ? `<button type="button" class="assistant-more-pills" data-action="${type}" data-id="${a.id}" aria-label="Show ${items.length-1} more ${type} for ${esc(a.title)}" title="${esc(items.slice(1).join(', '))}">+${items.length-1}</button>` : '';
    return `<article class="assistant-card p-4" data-assistant-id="${a.id}" aria-labelledby="assistant-title-${a.id}" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">
      <header class="assistant-card-header"><span class="assistant-icon h-11 w-11">${icon(a.glyph, 'h-5 w-5')}</span><div class="assistant-card-heading"><h2 id="assistant-title-${a.id}"><span class="assistant-title" title="${esc(a.title)}">${esc(a.title)}</span></h2>${executionIndicator(a)}</div>
      <div class="assistant-actions"><button type="button" class="assistant-icon-button assistant-star" data-action="save" data-id="${a.id}" aria-label="${a.saved?'Unsave':'Save'} ${esc(a.title)}" aria-pressed="${a.saved}">${icon('star')}</button><button type="button" class="assistant-icon-button" data-action="actions" data-id="${a.id}" aria-label="More actions for ${esc(a.title)}" aria-haspopup="menu" aria-controls="workflow-card-menu" aria-expanded="false">${icon('more')}</button></div></header>
      <p class="assistant-description text-xs" title="${esc(a.description)}">${esc(a.description)}</p>
      <div class="assistant-pills"><div class="assistant-pill-group">${pill(a.category)}</div><div class="assistant-pill-group">${tag(a.tags[0])}${more('tags',a.tags)}</div></div>
      <footer class="assistant-footer"><div class="assistant-meta"><span>${icon(a.visibility==='Private'?'lock':a.visibility==='Public'?'globe':'users')}${esc(a.visibility)}</span>${a.status==='draft' ? `<span class="assistant-draft-badge">Draft</span>` : `<span>${icon('runs')}${a.runs} runs</span>`}<span>${icon(a.schedule ? 'calendar' : 'manual')}${esc(a.schedule || 'Manual')}</span></div><span class="assistant-owner" title="${esc(a.owner)}"><span class="assistant-avatar" aria-hidden="true">${initials}</span><span>${esc(a.owner)}</span></span></footer>
    </article>`;
  }
  function render() {
    workflowActions?.close();
    const s=state(), items=filtered(s), pages=Math.max(1, Math.ceil(items.length/s.size));
    const isOverview=view==='overview';
    $('#assistant-panel').hidden=isOverview;
    $('.assistants-toolbar').hidden=isOverview;
    $('#workflow-overview-panel').hidden=!isOverview;
    $('#workflow-highlights-toggle').hidden=!isOverview;
    $('#assistant-search').placeholder=isOverview?'Search workflow outcomes, sources, or next steps…':'Search workflows by title, description, category, or tags…';
    $('#assistant-search').setAttribute('aria-label',isOverview?'Search workflow outcomes':'Search workflows');
    if(isOverview)workflowOverview.render(s.query);
    $('#assistant-search-submit').disabled=!s.query;
    page=Math.min(page,pages);
    $('#assistant-grid').innerHTML=items.slice((page-1)*s.size,page*s.size).map(card).join('');
    $('#assistant-empty').hidden=items.length>0;
    $('#assistant-count').textContent=items.length ? `Showing ${(page-1)*s.size+1}–${Math.min(page*s.size,items.length)} of ${items.length}` : 'Showing 0 of 0';
    $('#assistant-panel').setAttribute('aria-labelledby', `tab-${view}`);
    const note=$('#assistant-view-note');
    note.hidden=!['recommended','drafts'].includes(view);
    note.textContent=view==='recommended' ? 'Recommended by Ivy and your team. Explore a workflow to see its details and schedule.' : 'Work in progress. Drafts stay private until you’re ready to share them.';
    document.querySelectorAll('[data-view]').forEach(button=>{
      const selected=button.dataset.view===view;
      button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      const name=button.dataset.view;
      if(name==='overview')return;
      button.querySelector('span').textContent=assistants.filter(a=>!a.archived && (name==='drafts'?a.status==='draft':a.status!=='draft'&&(name==='all'||name==='scheduled'&&a.schedule||name==='recommended'&&a.recommended))).length;
    });
    $('#run-mode').disabled=view==='scheduled'||view==='drafts';
    $('#clear-filters').hidden=!(s.query||s.mode!=='all'||s.creator!=='all'||s.category!=='all'||s.tag!=='all');
    $('#assistant-pagination').hidden=pages<=1;
    $('#assistant-pagination').innerHTML=`<button type="button" data-page="${page-1}" ${page===1?'disabled':''}>Previous</button>${Array.from({length:pages},(_,i)=>`<button type="button" data-page="${i+1}" ${page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')}<button type="button" data-page="${page+1}" ${page===pages?'disabled':''}>Next</button>`;
  }
  function switchView(name) { view=name;page=1;$('#run-mode').value='all';render(); }
  function clearFilters() { $('#assistant-search').value=''; ['run-mode','assistant-creator','assistant-category','assistant-tag'].forEach(id=>$('#'+id).value='all'); page=1;render(); }
  function toast(message) { clearTimeout(toastTimer);$('#assistant-toast').textContent=message;$('#assistant-toast').hidden=false;toastTimer=setTimeout(()=>$('#assistant-toast').hidden=true,3000); }
  const dialog=$('#assistant-dialog');
  function openDialog(content) { dialog.innerHTML=`<button type="button" class="assistant-dialog-close" aria-label="Close dialog">×</button>${content}`;dialog.showModal();dialog.querySelector('.assistant-dialog-close').addEventListener('click',()=>dialog.close()); }
  function details(a,type='details') {
    const categoryMarkup=pill(a.category), tagMarkup=a.tags.map(tag).join(' ');
    openDialog(`<h2 id="assistant-dialog-title">${esc(a.title)}</h2><p>${esc(a.description)}</p><dl><dt>Run mode</dt><dd>${esc(a.schedule||'Manual')}${a.schedule?' · 9:00 AM · Pacific time':''}</dd><dt>Visibility</dt><dd>${esc(a.visibility)}</dd><dt>Created by</dt><dd>${esc(a.owner)}</dd><dt>${a.status==='draft'?'Status':'Usage'}</dt><dd>${a.status==='draft'?'Draft · Not run yet':`${a.runs} runs · ${elapsed(a.hours)}`}</dd></dl><p>Category</p><div class="assistant-pill-group">${categoryMarkup}</div><p>Tags</p><div class="assistant-pill-group">${tagMarkup}</div><div class="assistant-dialog-actions"><button type="button" class="a-primary" id="dialog-primary">${a.status==='draft'?'Edit draft':a.schedule?'Pause schedule':'Schedule weekly'}</button><button type="button" class="a-secondary" id="dialog-duplicate">Duplicate as draft</button></div>`);
    $('#dialog-primary').addEventListener('click',()=>{
      dialog.close();
      if(a.status==='draft') return edit(a);
      a.schedule=a.schedule?null:'Every week';render();toast(a.schedule?'Weekly schedule set for Monday at 9:00 AM Pacific.':'Schedule paused. This workflow now runs manually.');
    });
    $('#dialog-duplicate').addEventListener('click',()=>{
      const copy={...a,id:Math.max(...assistants.map(a=>a.id))+1,title:a.title+' (copy)',status:'draft',schedule:null,runs:0,hours:null,owner:'Samuel Thornton',visibility:'Private',recommended:false,saved:false,added:Date.now(),created:'Oct 22, 2026'};
      assistants.push(copy);dialog.close();clearFilters();switchView('drafts');toast('Created a private draft copy.');
    });
  }
  function edit() {
    window.location.href='workflow-new.html';
  }
  function refreshOptions() {
    const options=(selector,values,label)=>{
      const select=$(selector), current=select.value;
      select.innerHTML=`<option value="all">${label}</option>`+[...new Set(values)].sort().map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
      if([...select.options].some(o=>o.value===current))select.value=current;
    };
    options('#assistant-category',IvyCategories.categories.map(c=>c.name),'All categories');
    options('#assistant-tag',assistants.flatMap(a=>a.tags),'All tags');
    options('#assistant-creator',assistants.map(a=>a.owner),'Anyone');
  }
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  document.querySelectorAll('[data-view]').forEach(button=>{
    button.addEventListener('click',()=>switchView(button.dataset.view));
    button.addEventListener('keydown',event=>{
      const buttons=[...document.querySelectorAll('[data-view]')],i=buttons.indexOf(button);
      let next;
      if(event.key==='ArrowRight')next=(i+1)%buttons.length;
      if(event.key==='ArrowLeft')next=(i+buttons.length-1)%buttons.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=buttons.length-1;
      if(next!==undefined){event.preventDefault();switchView(buttons[next].dataset.view);buttons[next].focus();}
    });
  });
  $('#assistant-search').addEventListener('input',()=>{page=1;render();});
  $('#assistant-search-form').addEventListener('submit',event=>{event.preventDefault();page=1;render();});
  document.querySelectorAll('.assistants-toolbar select').forEach(select=>select.addEventListener('change',()=>{page=1;render();}));
  $('#clear-filters').addEventListener('click',clearFilters);$('#empty-clear').addEventListener('click',clearFilters);
  $('#new-assistant').addEventListener('click',()=>{ window.location.href='workflow-new.html'; });
  $('#assistant-grid').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const a=assistants.find(a=>a.id===Number(button.dataset.id));if(!a)return;
    if(button.dataset.action==='save'){a.saved=!a.saved;button.setAttribute('aria-pressed',a.saved);button.setAttribute('aria-label',`${a.saved?'Unsave':'Save'} ${a.title}`);toast(a.saved?'Workflow saved.':'Workflow removed from saved.');return;}
    if(button.dataset.action==='actions'){workflowActions.toggle(a,button);return;}
    if(button.dataset.action==='results'){workflowActions.results(a);return;}
    details(a,button.dataset.action);
  });
  $('#assistant-pagination').addEventListener('click',event=>{const button=event.target.closest('[data-page]');if(!button||button.disabled)return;page=Number(button.dataset.page);render();$('#assistant-panel').focus({preventScroll:true});$('#assistant-panel').scrollIntoView({block:'start'});});
  const workflowActions=window.IvyWorkflowActions.init({workflows:assistants,details,edit,render});
  const workflowOverview=window.IvyWorkflowOverview.init({workflows:assistants,actions:workflowActions,icon,showAll:()=>switchView('all')});
  refreshOptions();render();
})();
