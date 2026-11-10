/* Portable, data-only selection and rendering for index and home-screen placement. */
window.IvyWorkflowActivity=(()=>{
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const svg=(name,classes='h-4 w-4')=>`<svg class="${classes}" viewBox="0 0 24 24" aria-hidden="true">${name==='undo'?'<path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12"/>':name==='close'?'<path d="m6 6 12 12M18 6 6 18"/>':name==='arrow'?'<path d="M4 12h16m-6-6 6 6-6 6"/>':name==='running'?'<path d="M12 3a9 9 0 1 1-9 9M3 5v5h5"/>':name==='serviceDesk'?'<path d="M4 13v-1a8 8 0 0 1 16 0v1M20 17v1a3 3 0 0 1-3 3h-3"/><rect x="3" y="11" width="4" height="7" rx="2"/><rect x="17" y="11" width="4" height="7" rx="2"/>':'<path d="m12 3 10 18H2ZM12 9v5M12 17h.01"/>'}</svg>`;
  const assetBase=typeof document!=='undefined'&&document.currentScript?.src?new URL('./assets/',document.currentScript.src).href:'components/assets/';
  const integrations='../../assistant-creation/src/assets/integrations/';
  const sourceLogos={
    Sophos:'sophos.png',
    Intune:'intune.svg',
    'Microsoft 365':'microsoft-365.png',
    'Entra ID':integrations+'entra-id.png',
    Meraki:integrations+'cisco-meraki.png',
    SharePoint:integrations+'sharepoint.png',
    'Kaseya Spanning':integrations+'kaseya-spanning.png',
    'Kaseya VSA':integrations+'kaseya-vsa.png',
    KnowBe4:integrations+'knowbe4.png'
  };
  const sourceLabel=source=>`<span class="iwa-source">${sourceLogos[source]?`<img class="h-4 w-4" src="${esc(assetBase+sourceLogos[source])}" alt="" width="16" height="16"/>`:source==='Service desk'?svg('serviceDesk'):''}${esc(source)}</span>`;
  const ago=at=>{const mins=Math.max(0,Math.floor((Date.now()-at)/60000));return mins<1?'Just now':mins<60?`${mins}m ago`:mins<1440?`${Math.floor(mins/60)}h ago`:`${Math.floor(mins/1440)}d ago`;};
  function select({reviewItems=[],runningRuns=[]}={}) {
    const candidates=reviewItems.map(item=>({
      ...item,
      rank:item.severity==='critical'?100:item.severity==='high'?90:item.kind==='Run issue'&&item.run.status==='Failed'?80:item.kind==='Run issue'?60:item.kind==='Finding'?50:20
    }));
    const running=runningRuns.map(item=>({...item,kind:'Running',title:item.workflow.title,rank:70,foundAt:item.run.at,sourceSystems:item.output?.sources||[],recommendedAction:item.run.progress.stepName}));
    const primary=candidates.sort((a,b)=>b.rank-a.rank||(b.foundAt||b.run.at)-(a.foundAt||a.run.at))[0]||running.sort((a,b)=>b.run.at-a.run.at)[0]||null;
    return {primary,secondary:primary&&primary.kind!=='Running'?running.sort((a,b)=>b.run.at-a.run.at)[0]||null:null};
  }
  const open=item=>`data-workflow-activity-open data-workflow-id="${item.workflow.id}" data-run-id="${esc(item.run.id)}"`;
  const activityMeta=item=>{
    const at=item.foundAt||item.run.at;
    return `<span class="iwa-timestamp-sources text-xs"><time class="iwa-timestamp" datetime="${new Date(at).toISOString()}">${ago(at)}</time>${item.sourceSystems?.length?`<span class="iwa-meta-bullet" aria-hidden="true">·</span><span class="iwa-sources">${item.sourceSystems.map(sourceLabel).join('')}</span>`:''}</span>`;
  };
  function progress(item) {
    const {step,total,stepName}=item.run.progress;
    return `<span class="iwa-progress-track" role="progressbar" aria-label="${esc(stepName)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${step}"><span style="width:${step/total*100}%"></span></span><span class="iwa-stage text-xs">${esc(stepName)}</span>`;
  }
  function runningCard(item,secondary) {
    const {step,total}=item.run.progress;
    return `<button type="button" class="${secondary?'iwa-secondary':'iwa-primary'} iwa-running-card" ${open(item)} aria-label="View progress for ${esc(item.workflow.title)}"><span class="iwa-card-top"><span class="iwa-secondary-label text-xs font-semibold"><span class="iwa-live-dot"></span>Active workflow</span>${activityMeta(item)}</span><span class="iwa-running-heading"><span class="iwa-primary-title text-lg font-semibold" title="${esc(item.workflow.title)}">${esc(item.workflow.title)}</span><span class="iwa-progress-meta text-xs"><span>Step ${step} of ${total}</span></span></span>${progress(item)}</button>`;
  }
  function resultCard(item) {
    const critical=item.severity==='critical';
    const attention=critical||item.kind==='Run issue';
    const label=critical?'Critical workflow result':item.severity==='high'?'High priority workflow result':item.kind==='Run issue'?(item.run.status==='Failed'?'Workflow run failed':'Workflow needs attention'):item.kind==='Recommendation'?'Workflow recommendation':'Workflow finding';
    return `<span class="iwa-result-shell" data-review-item-key="${esc(`${item.run.id}:${item.kind}:${item.title}`)}"><button type="button" class="iwa-primary iwa-result-card" data-tone="${attention?'attention':'finding'}" ${open(item)} aria-label="Open result: ${esc(item.title)}"><span class="iwa-card-top"><span class="iwa-eyebrow text-xs font-semibold">${svg('alert')}${label}</span>${activityMeta(item)}</span><span class="iwa-result-body"><span class="iwa-result-summary"><span class="iwa-primary-title text-lg font-semibold">${esc(item.title)}</span><span class="iwa-workflow-pill text-xs" title="${esc(item.workflow.title)}">${esc(item.workflow.title)}</span></span><span class="iwa-next-action"><span class="iwa-stage-label text-xs">Next step</span><span class="iwa-detail text-sm">${esc(item.recommendedAction)}</span></span></span></button><button type="button" class="iwa-dismiss" data-workflow-activity-dismiss data-review-key="${esc(`${item.run.id}:${item.kind}:${item.title}`)}" aria-label="Dismiss ${esc(item.title)}">${svg('close','h-3 w-3 text-gray-800')}<span class="iwa-dismiss-tooltip text-xs" role="tooltip">Dismiss this</span></button></span>`;
  }
  function render({primary,secondary,canUndo=false}={}) {
    if(!primary)return '';
    return `<section class="ivy-workflow-activity" aria-label="Priority workflow activity"><header class="iwa-heading text-xs"><h2 class="text-base font-semibold">Here’s what to know</h2>${canUndo?`<button type="button" class="iwa-undo text-xs" data-workflow-activity-undo>${svg('undo','h-3 w-3')}Undo dismissal</button>`:''}</header><div class="iwa-layout">${secondary?runningCard(secondary,true):''}${primary.kind==='Running'?runningCard(primary,false):resultCard(primary)}</div></section>`;
  }
  return {select,render,sourceLabel};
})();
