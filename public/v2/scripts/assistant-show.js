/* Detail layout for the five built-in specialists. Shared findings/settings live in assistants.js. */
window.IvyAssistantShow=(()=>{
  const situations={
    1:[
      ['Troubleshoot Repeated Sign-In Failures','Tie sign-in errors to device and access requirements to identify affected users, shared conditions, & supported explanations.','identity'],
      ['Discover Growing Access Problems','Compare failures over time to see which users and applications are affected and whether the problem is spreading.','network'],
      ['Review Access after Security Changes','Review policy, account, device, & assignment changes alongside failures to identify new questions & potential solutions.','clock']
    ],
    2:[
      ['Unreliable Devices','Connect recurring errors, restarts, and performance evidence to identify affected devices and shared reliability problems.','health'],
      ['Update & Management Failures','Find persistent patching and management failures, missed check-ins, and the next checks needed to investigate them.','settings'],
      ['Device Health Patterns','Compare device history across systems, models, and sites to spot emerging problems and decide where to focus.','network']
    ],
    3:[
      ['Protection Gaps','Compare inventory and agent health to separate confirmed protection gaps from cases that still need verification.','security'],
      ['Unresolved Threats','Review recurring detections, affected devices, and remediation evidence to understand what remains unresolved and why it matters.','alert'],
      ['Encryption Problems','Compare reported encryption state with policy evidence to identify affected devices and the checks needed before making changes.','health']
    ],
    4:[
      ['Recurring Connection Problems','Compare availability and connection history to see where failures recur and which devices or sites are affected.','network'],
      ['Wireless Performance','Compare access-point load and connection evidence to identify possible bottlenecks and what still needs verification.','search'],
      ['Problems After Network Changes','Review firmware, configuration, and DNS-policy changes alongside symptoms to identify relevant changes and supported explanations.','clock']
    ],
    5:[
      ['Application Access Gaps','Connect account, assignment, licensing, and provisioning evidence to find missing entitlements or failed assignments that may block access.','identity'],
      ['Potential License Underuse','Compare license assignments with recorded activity and business need to identify accounts and subscriptions worth reviewing.','licensing'],
      ['Application Access Changes','Track provisioning and assignment problems across users and groups to understand affected populations, relevant changes, and next steps.','network']
    ]
  };
  function situationIllustration(glyph,index,icon) {
    const symbol=(x,y)=>icon(glyph,'h-6 w-6').replace('<svg ',`<svg x="${x}" y="${y}" width="24" height="24" `);
    const scenes=[
      `<circle cx="203" cy="132" r="66" fill="var(--as-art-soft)"/>
       <g transform="rotate(-7 115 71)" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"><rect x="49" y="25" width="139" height="87" rx="10"/></g>
       <rect x="29" y="42" width="140" height="90" rx="10" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <path d="M39 42h120a10 10 0 0 1 10 10v10H29V52a10 10 0 0 1 10-10Z" fill="var(--as-art-main)"/>
       <circle cx="41" cy="52" r="2.5" fill="var(--ivy-color-warning-400)"/><circle cx="51" cy="52" r="2.5" fill="var(--ivy-color-gray-25)"/><circle cx="61" cy="52" r="2.5" fill="var(--as-art-mid)"/>
       <rect x="42" y="75" width="39" height="39" rx="9" fill="var(--as-art-soft)"/>
       <g style="color:var(--as-art-main)">${symbol(49,82)}</g>
       <path d="M93 82h49M93 94h35M43 121h59" stroke="var(--as-art-mid)" stroke-width="5" stroke-linecap="round"/>
       <path d="m180 121 19 19" stroke="var(--as-art-ink)" stroke-width="8" stroke-linecap="round"/>
       <path d="m180 121 19 19" stroke="var(--as-art-main)" stroke-width="4" stroke-linecap="round"/>
       <circle cx="162" cy="103" r="28" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <circle cx="162" cy="103" r="19" fill="var(--as-art-soft)"/>
       <path d="M151 107h6l4-11 5 15 4-8h5" fill="none" stroke="var(--as-art-main)" stroke-width="2.5"/>`,
      `<circle cx="46" cy="131" r="62" fill="var(--as-art-soft)"/>
       <path d="M43 58v23h36M174 30v17M174 30h22" fill="none" stroke="var(--as-art-mid)" stroke-width="2" stroke-dasharray="4 5"/>
       <rect x="64" y="39" width="143" height="94" rx="10" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <path d="M77 55h53" stroke="var(--as-art-mid)" stroke-width="5" stroke-linecap="round"/>
       <rect x="82" y="96" width="20" height="23" rx="4" fill="var(--as-art-mid)"/><rect x="115" y="81" width="20" height="38" rx="4" fill="var(--as-art-mid)"/><rect x="148" y="66" width="20" height="53" rx="4" fill="var(--as-art-main)"/>
       <path d="m84 83 33-19 26 8 33-31" fill="none" stroke="var(--as-art-main)" stroke-width="2.5"/>
       <circle cx="84" cy="83" r="4" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-main)" stroke-width="2"/><circle cx="117" cy="64" r="4" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-main)" stroke-width="2"/>
       <rect x="20" y="23" width="48" height="48" rx="12" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <g style="color:var(--as-art-main)">${symbol(32,35)}</g>
       <circle cx="196" cy="27" r="13" fill="var(--as-art-main)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <path d="M190 27h12m-6-6v12" stroke="var(--ivy-color-gray-25)" stroke-width="2"/>`,
      `<circle cx="194" cy="136" r="65" fill="var(--as-art-soft)"/>
       <rect x="42" y="31" width="105" height="108" rx="9" transform="rotate(-8 94 85)" fill="var(--as-art-mid)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <rect x="60" y="20" width="105" height="117" rx="9" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <rect x="73" y="33" width="28" height="28" rx="7" fill="var(--as-art-soft)"/>
       <g style="color:var(--as-art-main)">${symbol(75,35)}</g>
       <path d="M111 40h39M111 52h27M74 75h62M74 89h41M74 121h43" stroke="var(--as-art-mid)" stroke-width="4" stroke-linecap="round"/>
       <rect x="125" y="83" width="25" height="13" rx="6.5" fill="var(--as-art-main)"/><circle cx="143" cy="89.5" r="4" fill="var(--ivy-color-gray-25)"/>
       <path d="m174 76 24 9v19c0 17-24 31-24 31s-24-14-24-31V85Z" fill="var(--ivy-color-gray-25)" stroke="var(--as-art-ink)" stroke-width="2"/>
       <path d="m174 84 16 6v14c0 10-16 21-16 21s-16-11-16-21V90Z" fill="var(--as-art-main)"/>
       <path d="m165 103 6 6 12-13" fill="none" stroke="var(--ivy-color-gray-25)" stroke-width="2.5"/>
       <circle cx="197" cy="41" r="6" fill="var(--ivy-color-warning-400)" stroke="var(--as-art-ink)" stroke-width="2"/>`
    ];
    return `<figure class="as-off-illustration" aria-hidden="true"><svg class="as-off-art" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">${scenes[index]}</svg></figure>`;
  }
  function situationCards(a,{esc,icon}) {
    const cards=situations[a.id].map(([title,description,glyph],index)=>{
      const headingId=`as-situation-title-${a.id}-${index}`;
      return `<article class="as-off-situation p-4 rounded-lg" data-situation="${index}" aria-labelledby="${headingId}">
        <header class="flex items-center gap-3"><h3 class="text-md font-medium" id="${headingId}">${esc(title)}</h3></header>
        <p class="text-xs text-gray-500">${esc(description)}</p>
        ${situationIllustration(glyph,index,icon)}
      </article>`;
    });
    return `<div class="as-off-situations gap-4">${cards.join('')}</div>`;
  }
  function capabilityRows(a,selectedCapability,{esc,icon,source},idPrefix='as-capability') {
    const items=window.IvyAssistantCapabilities[a.id];
    return Array.from({length:Math.ceil(items.length/3)},(_,row)=>{
      const first=row*3,selected=selectedCapability!==null&&Math.floor(selectedCapability/3)===row?selectedCapability:null;
      const cards=items.slice(first,first+3).map(([title],column)=>{
        const index=first+column;
        return `<button type="button" class="as-capability-tile p-4 ${selected===index?'rounded-t-lg':'rounded-lg'}" style="--capability-column:${column+1}" data-show-capability="${index}" aria-expanded="${selected===index}" aria-controls="${idPrefix}-panel-${a.id}-${row}"><span class="as-capability-number text-xs">${index+1}</span><span class="text-sm font-medium" id="${idPrefix}-label-${a.id}-${index}">${esc(title)}</span><span class="as-capability-chevron" aria-hidden="true">${icon('chevron','h-4 w-4')}</span></button>`;
      }).join('');
      let body='',style='',label='';
      if(selected!==null){
        const [,description,detail,sources]=items[selected],column=selected%3+1,available=sources;
        style=`--capability-column:${column}`;
        label=`aria-labelledby="${idPrefix}-label-${a.id}-${selected}"`;
        body=`<div class="as-capability-expanded-layout grid gap-6"><div class="as-capability-expanded-copy"><p class="text-xs text-gray-500">${esc(description)}</p><p class="text-sm">${esc(detail)}</p></div><aside class="as-capability-sources"><h3 class="text-xs font-medium">Recommended Sources</h3><ul class="as-capability-source-list">${available.length?available.map(name=>`<li>${source(name)}</li>`).join(''):'<li class="text-xs">No source selected for this capability.</li>'}</ul></aside></div>`;
      }
      return `<div class="as-capability-row">${cards}<section class="as-capability-expanded p-5 pt-6 rounded-b-lg ${selected===null?'':selected%3===0?'rounded-tr-lg':selected%3===2?'rounded-tl-lg':'rounded-t-lg'}" id="${idPrefix}-panel-${a.id}-${row}" role="region" ${label} style="${style}" ${selected===null?'hidden':''}>${body}</section></div>`;
    }).join('');
  }
  function toggleCapability(grid,a,index,selected,helpers) {
    const items=window.IvyAssistantCapabilities[a.id];
    if(!Number.isInteger(index)||index<0||index>=items.length)return selected;
    const next=selected===index?null:index;
    grid.innerHTML=capabilityRows(a,next,helpers);
    grid.querySelector(`[data-show-capability="${index}"]`).focus();
    return next;
  }
  function create({assistants,findings,owned,waiting,esc,icon,source,badge,stateLabel,cadenceLabels,scheduleLabel,powerToggle,findingRow,findingsTable,findingReviewControl,getAssistantRuns,runList,runHistoryTable,openDialog}) {
    const root=document.querySelector('#assistant-show');
    const offVariant=document.body?.dataset.assistantVariant==='off';
    const id=Number(new URLSearchParams(window.location.search).get('id')||1);
    const assistant=assistants.find(a=>a.id===id);
    let tab='overview',selectedCapability=null;
    let highlightsHidden=false,openFindingIndex=0,allFindingsView='cards';
    const capabilitySets=window.IvyAssistantCapabilities;
    const tabs=[['overview','Overview'],['findings','Findings'],['history','History']];
    function capabilities(a) {
      return `<header class="as-section-heading"><h2 class="text-base font-semibold">Built-In Capabilities</h2><p class="text-xs">Select a capability to explore what it investigates and the evidence it uses.</p></header><div class="as-capabilities-grid" id="as-capability-grid">${capabilityRows(a,selectedCapability,{esc,icon,source})}</div>`;
    }
    function how(a) {
      const steps=[['Gather Relevant Evidence',`Inspect available records from ${a.selectedSources.join(', ')||'the sources you select'}. Check permissions, scope, and freshness before drawing conclusions.`],['Connect the Context','Match supported user, device, application, or site records. Compare affected populations, history, and relevant changes.'],['Investigate & Explain','Test possible explanations. Separate confirmed conditions, supported hypotheses, and unanswered questions.'],['Keep Findings Current','Refresh ongoing findings, surface material changes, and verify resolution from fresh evidence. A recurrence after resolution gets a new linked occurrence.']];
      return `<header class="as-section-heading"><h2 class="text-base font-semibold">How This Assistant Investigates</h2><p class="text-xs">A built-in investigation process, applied to each supported capability.</p></header><ol class="as-investigation">${steps.map(([title,description],i)=>`<li><span class="as-process-number text-xs">${i+1}</span><div class="as-process-card p-4"><span class="as-field-label text-xs">Step ${i+1}</span><h3 class="text-sm font-semibold">${title}</h3><p class="text-sm">${esc(description)}</p></div></li>`).join('')}</ol>`;
    }
    // Illustrative daily history for the seven days ending today.
    const highlightHistory={
      1:{raised:[2,3,1,4,3,5,4],resolved:[1,2,0,3,2,1,4],reviewHours:[6.2,5.8,6.1,4.9,4.3,4.6,3.4]},
      2:{raised:[3,2,5,4,2,3,2],resolved:[1,3,2,4,1,3,2],reviewHours:[8.1,7.2,7.6,6.4,5.9,5.1,4.8]},
      3:{raised:[1,2,1,3,2,1,2],resolved:[0,1,2,1,2,1,3],reviewHours:[4.5,3.8,4.1,3.2,2.8,3.1,2.2]},
      4:{raised:[2,1,3,2,4,2,1],resolved:[1,0,2,3,1,2,2],reviewHours:[7.4,6.8,7.1,5.6,5.2,4.8,4.1]},
      5:{raised:[1,2,2,1,3,2,2],resolved:[0,1,1,2,1,2,3],reviewHours:[9.2,8.4,8.8,7.1,6.6,5.9,5.4]}
    };
    function highlights(a) {
      const history=highlightHistory[a.id];
      const series=[
        {key:'raised',title:'New Findings',description:'First-time findings, by day',color:'blue',type:'line'},
        {key:'resolved',title:'Findings Resolved',description:'Verified resolutions, by day',color:'purple',type:'bars'},
        {key:'reviewHours',title:'Time to Acknowledge',description:'Average hours to acknowledge',color:'orange',type:'line'}
      ];
      const dates=Array.from({length:7},(_,i)=>{
        const date=new Date();
        date.setDate(date.getDate()-6+i);
        return date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      });
      return series.map(metric=>{
        const values=history[metric.key];
        const total=values.reduce((sum,value)=>sum+value,0);
        const value=metric.key==='reviewHours'?(total/values.length).toFixed(1)+'h':total;
        const peak=Math.max(...values,1)*1.15;
        const points=values.map((n,i)=>[8+i*224/6,76-n/peak*64]);
        const line=points.reduce((path,[x,y],i)=>{
          if(!i)return `M ${x} ${y}`;
          const [previousX,previousY]=points[i-1];
          const midpoint=(previousX+x)/2;
          return path+` C ${midpoint} ${previousY}, ${midpoint} ${y}, ${x} ${y}`;
        },'');
        const gradient=`as-history-${a.id}-${metric.key}`;
        const marks=metric.type==='bars'
          ? points.map(([x,y],i)=>`<rect x="${x-7}" y="${y}" width="14" height="${76-y}" rx="3" fill="currentColor"><title>${dates[i]}: ${values[i]}</title></rect>`).join('')
          : `<defs><linearGradient id="${gradient}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--ivy-color-${metric.color}-100)"/><stop offset="1" stop-color="var(--ivy-color-gray-25)"/></linearGradient></defs>
            <path d="${line} L 232 80 L 8 80 Z" fill="url(#${gradient})"/>
            <path d="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            ${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="3" fill="currentColor"><title>${dates[i]}: ${values[i]}${metric.key==='reviewHours'?' hours':''}</title></circle>`).join('')}`;
        return `<article class="as-history-highlight" style="--history-accent:var(--ivy-color-${metric.color}-600)">
          <header><h2 class="text-sm font-medium">${metric.title}</h2><p class="text-xs">${metric.description}</p></header>
          <div class="as-history-value">${value}</div><span class="as-history-period text-xs">Last 7 Days</span>
          <svg class="as-history-chart" viewBox="0 0 240 84" role="img" aria-label="${metric.title}. ${values.map((n,i)=>dates[i]+': '+n).join(', ')}" style="stroke:none">${marks}</svg>
          <div class="as-history-dates text-xs" aria-hidden="true"><span>${dates[0]}</span><span>${dates[6]}</span></div>
        </article>`;
      }).join('');
    }
    function overview(a) {
      const open=owned(a);
      const rank={critical:4,high:3,medium:2,low:1};
      const allOpen=open.slice().sort((x,y)=>rank[y.severity]-rank[x.severity]);
      const summary=`<section id="as-highlights" class="as-history-highlights" aria-label="Finding Trends Over the Last Seven Days"${highlightsHidden?' hidden':''}>${highlights(a)}</section>`;
      const empty=`<section class="as-panel p-4 rounded-lg"><h2 class="text-base font-medium">${!a.enabled?'Assistant Is Off':a.pending?'First Check Pending':!a.last?'Ready for the First Check':'No Open Findings'}</h2><p class="text-sm">${!a.enabled?'Turn on this assistant to resume investigations. Previous findings and history stay available.':!a.last?'Findings will appear after the first investigation. Use Run Now to start a preview check.':'No open conditions in the available source evidence. Check source coverage for any gaps.'}</p></section>`;
      return `<div class="as-overview">${summary}${allOpen.length?`<section aria-labelledby="as-all-findings-heading"><header class="as-overview-section-header"><h2 id="as-all-findings-heading" class="text-base font-medium">Recent Findings</h2><button type="button" class="a-text" data-show-tab="findings">View all</button></header><ul class="as-open-findings-grid grid gap-4${highlightsHidden?' as-open-findings-full-width':''}">${allOpen.map(f=>`<li>${findingRow(f)}</li>`).join('')}</ul></section>`:empty}</div>`;
    }
    function openFindingsCarousel(items) {
      if(!items.length)return '<p class="specialist-inline-empty text-sm" tabindex="-1" data-open-findings-empty>No findings waiting for review.</p>';
      openFindingIndex=Math.min(openFindingIndex,items.length-1);
      const finding=items[openFindingIndex];
      return `<section class="as-open-carousel" role="region" aria-roledescription="carousel" aria-label="Open Findings">
        <div role="group" aria-roledescription="slide" aria-label="${openFindingIndex+1} of ${items.length}">${findingRow(finding,{recommendation:true})}</div>
        <div class="as-open-carousel-controls">
          <div class="as-open-carousel-navigation">
            <button type="button" class="as-open-carousel-arrow" data-open-finding-direction="-1" aria-label="Previous Open Finding"${items.length===1?' disabled':''}>${icon('arrowLeft')}</button>
            <div class="as-open-carousel-dots" role="group" aria-label="Choose Open Finding">${items.map((item,i)=>`<button type="button" data-open-finding-index="${i}" aria-label="Finding ${i+1}: ${esc(item.title)}"${i===openFindingIndex?' aria-current="true"':''}></button>`).join('')}</div>
            <button type="button" class="as-open-carousel-arrow" data-open-finding-direction="1" aria-label="Next Open Finding"${items.length===1?' disabled':''}>${icon('arrow')}</button>
          </div>
          <span class="as-open-carousel-count text-xs" role="status">${openFindingIndex+1} of ${items.length}</span>
          ${findingReviewControl(finding)}
        </div>
      </section>`;
    }
    function allFindingsSection(items) {
      const viewIcons={
        cards:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        table:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
      };
      return `<section class="as-all-findings-section" aria-labelledby="as-findings-all-heading">
        <header class="as-section-heading as-all-findings-header"><h2 id="as-findings-all-heading" class="text-base font-semibold">All Findings</h2>
          <div class="specialist-layout-toggle" role="group" aria-label="All Findings View">
            ${['cards','table'].map(view=>`<button type="button" data-all-findings-view="${view}" aria-label="${view==='cards'?'Card View':'Table View'}" title="${view==='cards'?'Card View':'Table View'}" aria-pressed="${allFindingsView===view}"><svg viewBox="0 0 24 24" aria-hidden="true">${viewIcons[view]}</svg></button>`).join('')}
          </div>
        </header>
        ${items.length?(allFindingsView==='table'?findingsTable(items):`<ul class="as-open-findings-grid grid gap-4">${items.map(f=>`<li>${findingRow(f)}</li>`).join('')}</ul>`):'<p class="specialist-inline-empty text-sm">No findings have been recorded yet.</p>'}
      </section>`;
    }
    function content(a) {
      const open=owned(a),all=findings.filter(f=>f.assistant===a.id);
      if(tab==='findings')return `<section class="specialist-suggestions as-open-findings-panel" aria-labelledby="as-open-findings-heading"><header class="as-section-heading"><div class="as-open-findings-title"><h2 id="as-open-findings-heading" class="text-base font-semibold">Open Findings</h2><span class="text-xs">${waiting(open).length} to review</span></div></header>${openFindingsCarousel(waiting(open))}</section>
        ${allFindingsSection(all)}`;
      if(tab==='history')return `<header class="as-section-heading"><h2 class="text-base font-semibold">Run History</h2></header>${runHistoryTable(getAssistantRuns(a.id))}`;
      return overview(a);
    }
    function systemRows(a) {
      return a.sources.map(name=>{
        const state=name==='Intune'?'setup':name==='Microsoft 365'?'syncing':'synced';
        const status=state==='setup'?`<button type="button" class="as-source-status" data-sync-state="setup" aria-label="Set up ${esc(name)}">Set up ${icon('arrow','h-3 w-3')}</button>`:`<span class="as-source-status" data-sync-state="${state}">${state==='syncing'?'Syncing...':'Synced'}</span>`;
        return `<div class="as-system-row text-xs"><span class="as-system-identity" ${state==='setup'?'data-setup="missing"':''}>${source(name,'source-card')}</span>${status}</div>`;
      }).join('');
    }
    function recentRuns(a) {
      return `<section class="as-panel as-recent-runs p-5 rounded-lg" aria-labelledby="as-recent-runs-heading">
        <header class="flex items-center justify-between gap-3 mb-4"><h2 id="as-recent-runs-heading" class="flex items-center gap-2 text-md font-medium !mb-0">${icon('clock','h-4 w-4')}Recent Runs</h2><button type="button" class="a-text" data-show-tab="history">View All</button></header>
        ${runList(a.id)}
      </section>`;
    }
    function sidebar(a) {
      const useful=`<section class="as-panel as-deliverables p-4"><h2 class="text-sm font-semibold">Useful for...</h2><ul class="text-sm">${['Findings and meaningful changes','Affected users, devices, apps, or sites','Source evidence and its limitations','Recommended next steps'].map(text=>`<li>${icon('check')}${text}</li>`).join('')}</ul></section>`;
      const open=owned(a),affected=new Set(open.flatMap(f=>(f.objects||[]).map(object=>object[2]))).size;
      const glance=`<section class="as-glance border p-5 rounded-lg" aria-labelledby="as-glance-heading"><div class="flex items-center justify-between gap-3 mb-4"><h2 id="as-glance-heading" class="flex items-center gap-2 text-md font-medium !mb-0">${icon('info','h-4 w-4')}At a Glance</h2><span class="text-xs text-gray-600 text-right">${esc(a.scope||'Scope available after the first check')}</span></div><dl class="as-glance-stats grid grid-cols-3 border rounded-lg">${[[open.filter(f=>['high','critical'].includes(f.severity)).length,'High Priority'],[open.length,'Total Findings'],[affected,'Affected Objects']].map(([value,label])=>`<div class="px-3 py-2"><dd class="text-xl font-semibold">${value}</dd><dt class="text-xs">${label}</dt></div>`).join('')}</dl><dl class="as-glance-details text-xs">${[['Last Check',a.running?'Checking Now':a.pending?'First Check Pending':a.last||'Not Checked Yet'],['Capabilities',`${a.enabled?a.selectedCapabilities.length:0} of ${capabilitySets[a.id].length} On`]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>`;
      const sources=`<section class="as-panel p-4"><h2 class="text-sm font-semibold">Recommended Sources</h2><div class="as-system-list">${systemRows(a)}</div></section>`;
      return `<aside class="as-sidebar">${offVariant?useful:glance+recentRuns(a)}${sources}</aside>`;
    }
    function offOverview(a) {
      return `<header class="as-section-heading"><h2 class="text-base font-semibold">How This Assistant Helps</h2></header>${situationCards(a,{esc,icon})}<section class="as-off-capability-details" aria-label="Built-In Capabilities"><div class="as-off-capability-details-body">${capabilities(a)}</div></section>`;
    }
    function renderOff(a) {
      const recommended={...a,selectedSources:[...a.sources]};
      document.title=a.title+' | Enable Assistant | Ivy';document.querySelector('#assistant-show-breadcrumb').textContent=a.title;
      root.innerHTML=`<header class="as-header"><div class="as-heading mb-6"><span class="assistant-icon h-11 w-11" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">${icon(a.glyph,'h-5 w-5')}</span><div><div class="as-title-row"><h1>${esc(a.title)}</h1><span class="as-title-status">${badge('Off')}</span></div><p class="text-sm">${esc(a.description)}</p></div></div><div class="as-header-action"><button type="button" class="a-primary" data-specialist-action="enable-assistant" data-assistant-id="${a.id}">Enable Assistant</button><p class="as-off-enable-help text-xs">Choose sources and a schedule, or run on demand.</p></div></header><hr class="as-off-divider"/><div class="as-layout"><section class="as-content" id="as-content">${offOverview(recommended)}</section>${sidebar(recommended)}</div><dialog id="assistant-how-dialog" class="assistant-dialog specialist-dialog as-how-dialog text-sm ivy-modal px-4 py-5 sm:px-6 sm:py-6 2xl:px-12 2xl:py-12" aria-labelledby="assistant-how-title"><button type="button" class="assistant-dialog-close" data-show-close-how aria-label="Close How It Works">${icon('close','h-5 w-5')}</button>${how(recommended).replace('<h2 class="text-base font-semibold">','<h2 id="assistant-how-title" class="text-base font-semibold">')}</dialog>`;
    }
    function render() {
      if(!assistant){root.innerHTML='<div class="as-panel p-4"><h1 class="text-xl font-semibold">Assistant Not Found</h1><p class="text-sm">Choose one of the five built-in assistants from the index.</p><a class="a-secondary" href="assistants.html">Back to Assistants</a></div>';return;}
      if(offVariant){renderOff(assistant);return;}
      const a=assistant,open=owned(a);
      document.title=a.title+' | Assistants | Ivy';document.querySelector('#assistant-show-breadcrumb').textContent=a.title;
      root.innerHTML=`<header class="as-header"><div class="as-heading mb-6"><span class="assistant-icon h-11 w-11" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">${icon(a.glyph,'h-5 w-5')}</span><div><div class="as-title-row"><h1>${esc(a.title)}</h1><span class="as-title-status">${badge(a.enabled?'Enabled':'Off',a.enabled?'success':'neutral')}</span></div><p class="text-sm">${esc(a.description)}</p></div></div><div class="as-header-action"><span class="inline-flex items-center gap-2 text-xs text-gray-500">${a.enabled?a.selectedCapabilities.length:0} of ${capabilitySets[a.id].length} Capabilities On</span>${a.enabled?`<span class="text-xs text-gray-500" aria-hidden="true">•</span><span class="inline-flex items-center gap-2 text-xs text-gray-500 mr-3">${icon('calendar')}${esc(scheduleLabel(a))}</span>`:`<button type="button" class="a-primary" data-specialist-action="enable-assistant" data-assistant-id="${a.id}">Enable Assistant</button>`}<button type="button" class="a-secondary as-header-config border" data-specialist-action="configure" data-assistant-id="${a.id}">${icon('settings')} Config</button>${a.enabled?`<button type="button" class="a-secondary" data-specialist-action="run-now" data-assistant-id="${a.id}" ${a.running?'disabled aria-busy="true"':''}>${icon('arrow')}${a.running?'Checking…':'Run Now'}</button>`:''}</div></header><nav class="as-highlights-nav as-tabs-toolbar" aria-label="Assistant Navigation"><div class="assistants-tabs as-tabs" role="tablist" aria-label="Assistant Details">${tabs.map(([key,label])=>`<button type="button" role="tab" id="as-tab-${key}" aria-controls="as-content" aria-selected="${tab===key}" tabindex="${tab===key?0:-1}" data-show-tab="${key}">${label}${key==='findings'?` <span>${open.length}</span>`:''}</button>`).join('')}</div><button type="button" class="as-nav-configuration" data-specialist-action="configure" data-assistant-id="${a.id}" aria-haspopup="dialog">Configuration</button><button type="button" class="as-highlights-toggle" data-show-highlights="" aria-controls="as-highlights" aria-expanded="${!highlightsHidden}" style="margin-left: auto;"${tab==='overview'?'':' hidden'}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18M9 4v6M15 4v6"></path></svg><span style="background: none; font-size: 12px; font-weight: 400; padding: 0;">${highlightsHidden?'Show highlights':'Hide highlights'}</span></button></nav><div class="as-layout"><section class="as-content" id="as-content" role="tabpanel" aria-labelledby="as-tab-${tab}" tabindex="0">${content(a)}</section>${sidebar(a)}</div>`;
    }
    root.addEventListener('click',event=>{
      const toggle=event.target.closest('[data-show-highlights]');
      if(!toggle)return;
      highlightsHidden=!highlightsHidden;
      root.querySelector('#as-highlights').hidden=highlightsHidden;
      root.querySelector('.as-open-findings-grid')?.classList.toggle('as-open-findings-full-width',highlightsHidden);
      toggle.setAttribute('aria-expanded',String(!highlightsHidden));
      toggle.querySelector('span').textContent=highlightsHidden?'Show highlights':'Hide highlights';
    });
    root.addEventListener('click',event=>{
      const control=event.target.closest('[data-open-finding-direction], [data-open-finding-index]');
      if(!control)return;
      const count=root.querySelectorAll('[data-open-finding-index]').length;
      openFindingIndex=control.hasAttribute('data-open-finding-index')
        ? Number(control.dataset.openFindingIndex)
        : (openFindingIndex+Number(control.dataset.openFindingDirection)+count)%count;
      root.querySelector('#as-content').innerHTML=content(assistant);
      const selector=control.hasAttribute('data-open-finding-index')
        ? `[data-open-finding-index="${openFindingIndex}"]`
        : `[data-open-finding-direction="${control.dataset.openFindingDirection}"]`;
      root.querySelector(selector).focus({preventScroll:true});
    });
    root.addEventListener('click',event=>{
      const toggle=event.target.closest('[data-all-findings-view]');
      if(!toggle)return;
      allFindingsView=toggle.dataset.allFindingsView==='table'?'table':'cards';
      root.querySelector('.as-all-findings-section').outerHTML=allFindingsSection(findings.filter(f=>f.assistant===assistant.id));
      root.querySelector(`[data-all-findings-view="${allFindingsView}"]`).focus({preventScroll:true});
    });
    root.addEventListener('click',event=>{const capability=event.target.closest('[data-show-capability]');if(capability){selectedCapability=toggleCapability(root.querySelector('#as-capability-grid'),assistant,Number(capability.dataset.showCapability),selectedCapability,{esc,icon,source});return;}if(event.target.closest('[data-show-close-how]')){document.querySelector('#assistant-how-dialog').close();return;}const button=event.target.closest('[data-show-tab]');if(button){tab=button.dataset.showTab;render();root.querySelector('#as-tab-'+tab).focus();}});
    root.addEventListener('keydown',event=>{const button=event.target.closest('[data-show-tab]');if(!button)return;const index=tabs.findIndex(([key])=>key===button.dataset.showTab);let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tab=tabs[next][0];render();root.querySelector('#as-tab-'+tab).focus();}});
    return {render};
  }
  return {create,situationCards,capabilityRows,toggleCapability};
})();
