/* Detail layout for the five built-in specialists. Shared findings/settings live in assistants.js. */
window.IvyAssistantShow={
  create({assistants,findings,owned,waiting,esc,icon,source,badge,stateLabel,cadenceLabels,scheduleLabel,powerToggle,findingRow,historyCard,openDialog}) {
    const root=document.querySelector('#assistant-show');
    const offVariant=document.body?.dataset.assistantVariant==='off';
    const id=Number(new URLSearchParams(window.location.search).get('id')||1);
    const assistant=assistants.find(a=>a.id===id);
    let tab='overview',selectedCapability=null,accessCategory=null,accessDays=7;
    const capabilitySets=window.IvyAssistantCapabilities;
    const tabs=[['overview','Overview'],['findings','Findings'],['history','History'],['configuration','Configuration']];
    function capabilityRows(a) {
      const items=capabilitySets[a.id];
      return Array.from({length:Math.ceil(items.length/3)},(_,row)=>{
        const first=row*3,selected=selectedCapability!==null&&Math.floor(selectedCapability/3)===row?selectedCapability:null;
        const cards=items.slice(first,first+3).map(([title],column)=>{
          const index=first+column;
          return `<button type="button" class="as-capability-tile p-4 ${selected===index?'rounded-t-lg':'rounded-lg'}" style="--capability-column:${column+1}" data-show-capability="${index}" aria-expanded="${selected===index}" aria-controls="as-capability-panel-${a.id}-${row}"><span class="as-capability-number text-xs">${index+1}</span><span class="text-sm font-medium" id="as-capability-label-${a.id}-${index}">${esc(title)}</span><span class="as-capability-chevron" aria-hidden="true">${icon('chevron','h-4 w-4')}</span></button>`;
        }).join('');
        let body='',style='',label='';
        if(selected!==null){
          const [,description,detail,sources]=items[selected],column=selected%3+1,available=sources;
          style=`--capability-column:${column}`;
          label=`aria-labelledby="as-capability-label-${a.id}-${selected}"`;
          body=`<div class="as-capability-expanded-layout grid gap-6"><div class="as-capability-expanded-copy"><p class="text-xs text-gray-500">${esc(description)}</p><p class="text-sm">${esc(detail)}</p></div><aside class="as-capability-sources"><h3 class="text-xs font-medium">Recommended Sources</h3><ul class="as-capability-source-list">${available.length?available.map(name=>`<li>${source(name)}</li>`).join(''):'<li class="text-xs">No source selected for this capability.</li>'}</ul></aside></div>`;
        }
        return `<div class="as-capability-row">${cards}<section class="as-capability-expanded p-5 pt-6 rounded-b-lg ${selected===null?'':selected%3===0?'rounded-tr-lg':selected%3===2?'rounded-tl-lg':'rounded-t-lg'}" id="as-capability-panel-${a.id}-${row}" role="region" ${label} style="${style}" ${selected===null?'hidden':''}>${body}</section></div>`;
      }).join('');
    }
    function capabilities(a) {
      return `<header class="as-section-heading"><h2 class="text-base font-semibold">Built-In Capabilities</h2><p class="text-xs">Select a capability to explore what it investigates and the evidence it uses.</p></header><div class="as-capabilities-grid" id="as-capability-grid">${capabilityRows(a)}</div>`;
    }
    function how(a) {
      const steps=[['Gather Relevant Evidence',`Inspect available records from ${a.selectedSources.join(', ')||'the sources you select'}. Check permissions, scope, and freshness before drawing conclusions.`],['Connect the Context','Match supported user, device, application, or site records. Compare affected populations, history, and relevant changes.'],['Investigate & Explain','Test possible explanations. Separate confirmed conditions, supported hypotheses, and unanswered questions.'],['Keep Findings Current','Refresh ongoing findings, surface material changes, and verify resolution from fresh evidence. A recurrence after resolution gets a new linked occurrence.']];
      return `<header class="as-section-heading"><h2 class="text-base font-semibold">How This Assistant Investigates</h2><p class="text-xs">A built-in investigation process, applied to each supported capability.</p></header><ol class="as-investigation">${steps.map(([title,description],i)=>`<li><span class="as-process-number text-xs">${i+1}</span><div class="as-process-card p-4"><span class="as-field-label text-xs">Step ${i+1}</span><h3 class="text-sm font-semibold">${title}</h3><p class="text-sm">${esc(description)}</p></div></li>`).join('')}</ol>`;
    }
    function configuration(a) {
      return `<section class="as-panel p-4"><header class="as-section-heading"><h2 class="text-base font-semibold">Current Configuration</h2><p class="text-xs">Settings apply to this preview session.</p></header><dl class="as-settings text-sm"><dt>Assistant</dt><dd>${powerToggle(a)}</dd><dt>Schedule or Trigger</dt><dd>${esc(scheduleLabel(a))}${!a.enabled?'<p class="text-xs">Saved configuration. Automatic checks are stopped while this assistant is off.</p>':''}</dd><dt>Selected Sources</dt><dd><div class="specialist-source-list">${a.selectedSources.map(source).join('')||'None selected'}</div></dd><dt>Notifications</dt><dd>${a.notify?'New or materially worse findings':'Off'}</dd></dl><button type="button" class="a-primary" data-specialist-action="configure" data-assistant-id="${a.id}">Edit Settings</button></section>`;
    }
    const accessCategories=['Sign-In Failures','Conditional Access','MFA Problems','Other Access Issues'];
    // Thirty days of illustrative occurrence history, separate from the current open findings.
    const accessDaily=[[1,0,1,0],[2,1,0,0],[0,0,1,0],[1,1,0,1],[0,0,0,0],[3,0,1,0],[1,1,0,0],[0,2,0,1],[2,0,1,0],[1,0,0,0],[0,1,1,0],[2,1,0,1],[1,0,0,0],[0,0,0,0],[1,2,1,0],[3,0,0,1],[1,1,1,0],[0,1,0,0],[2,0,1,1],[1,0,0,0],[0,0,0,0],[2,1,0,0],[1,0,2,0],[3,1,0,1],[1,0,1,0],[0,2,0,0],[2,0,1,1],[1,1,0,0],[2,0,0,1],[1,0,1,0]];
    function accessHistory() {
      return accessDaily.flatMap((counts,day)=>counts.flatMap((count,category)=>Array.from({length:count},(_,n)=>({day,category,recurring:(day+category+n)%4===0,resolved:day<24&&(day+category+n)%3===0,reviewed:(day+category+n)%3===1,object:`identity-${(day*3+category+n)%36}`})))).filter(record=>record.day>=accessDaily.length-accessDays);
    }
    function overviewMetrics(a) {
      if(a.id===1){
        const records=accessHistory(),open=records.filter(r=>!r.resolved);
        return [[open.length,'Open Findings'],[open.filter(r=>!r.reviewed).length,'To Review'],[new Set(open.map(r=>r.object)).size,'Affected Objects'],[open.filter(r=>!r.recurring).length,'New or Worsened']];
      }
      const open=owned(a);
      return [[open.length,'Open Findings'],[waiting(open).length,'To Review'],[new Set(open.flatMap(f=>(f.objects||[]).map(o=>o[2]))).size,'Affected Objects'],[open.filter(f=>['New','Worsened','Resurfaced'].includes(f.change)).length,'New or Worsened']];
    }
    function metricsMarkup(a) {
      return `<dl class="as-overview-metrics py-5${a.id===1?' as-overview-metrics-divided flex justify-around':''}">${overviewMetrics(a).map(([value,label])=>`<div><dt class="text-xs">${label}</dt><dd class="text-2xl font-medium">${value}</dd></div>`).join('')}</dl>`;
    }
    function accessChart() {
      const colors=['error-400','indigo-400','indigo-300','indigo-200'];
      const offset=accessDaily.length-accessDays,days=accessDaily.slice(offset),groupSize=accessDays===30?3:1;
      const records=accessHistory();
      const recurring=records.filter(r=>r.recurring).length,resolved=records.filter(r=>r.resolved).length;
      const end=new Date();end.setHours(12,0,0,0);
      const date=day=>{const d=new Date(end);d.setDate(d.getDate()-29+day);return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});};
      const groups=Array.from({length:Math.ceil(days.length/groupSize)},(_,i)=>days.slice(i*groupSize,(i+1)*groupSize).reduce((sum,row)=>sum.map((n,c)=>n+row[c]),[0,0,0,0]));
      const peak=Math.max(1,...groups.map(counts=>Math.max(counts[0],counts.slice(1).reduce((a,b)=>a+b,0))));
      const tickStep=Math.max(1,Math.ceil(peak/6)),ceiling=Math.ceil(peak/tickStep)*tickStep;
      const ticks=Array.from({length:ceiling/tickStep+1},(_,i)=>ceiling-i*tickStep);
      const bars=groups.map((counts,i)=>{
        const from=offset+i*groupSize,to=Math.min(29,from+groupSize-1),range=from===to?date(from):date(from)+'–'+date(to);
        const segment=(count,category)=>count?`<button type="button" class="as-access-segment" data-access-category="${category}" style="flex:${count};background:var(--ivy-color-${colors[category]})" title="${range} · ${accessCategories[category]}: ${count} ${count===1?'finding':'findings'}" aria-label="${range}: ${count} ${accessCategories[category]}. View current findings."></button>`:'';
        return `<div class="as-access-column"><div class="as-access-stack rounded-lg" style="height:${counts[0]/ceiling*100}%">${segment(counts[0],0)}</div><div class="as-access-stack rounded-lg" style="height:${counts.slice(1).reduce((a,b)=>a+b,0)/ceiling*100}%">${counts.slice(1).map((count,c)=>segment(count,c+1)).join('')}</div></div>`;
      }).join('');
      return `<section class="as-access-chart" aria-labelledby="as-access-chart-title"><header class="as-overview-section-header"><div class="flex items-center flex-wrap gap-6"><h2 id="as-access-chart-title" class="text-base font-medium">Access Issues Over Time</h2><div class="as-access-summary inline-flex items-center gap-3 text-xs"><span>${records.length-recurring} New Findings</span><span aria-hidden="true">•</span><span>${recurring} Recurring</span><span aria-hidden="true">•</span><span>${resolved} Resolved</span></div></div><select class="as-access-period text-xs" data-access-days aria-label="Chart Timeframe">${[7,14,30].map(n=>`<option value="${n}" ${n===accessDays?'selected':''}>Last ${n} Days</option>`).join('')}</select></header><div class="as-access-plot"><div class="as-access-scale text-xs" aria-hidden="true">${ticks.map(n=>`<span>${n}</span>`).join('')}</div><div class="as-access-graph"><div class="as-access-grid" aria-hidden="true">${ticks.map(()=>'<span></span>').join('')}</div><div class="as-access-bars" style="grid-template-columns:repeat(${groups.length},minmax(0,1fr))" role="group" aria-label="Finding occurrences over the last ${accessDays} days, grouped into ${groupSize}-day totals. Select a segment to see current findings of that type.">${bars}</div><div class="as-access-axis text-xs" aria-hidden="true"><span>${date(offset)}</span><span>${date(offset+Math.floor((accessDays-1)/2))}</span><span>${date(29)}</span></div></div></div><footer class="as-access-footer"><div class="as-access-key text-xs">${accessCategories.map((label,i)=>`<button type="button" data-access-category="${i}"><span class="rounded-sm" style="background:var(--ivy-color-${colors[i]})"></span>${label}</button>`).join('')}</div><span class="text-xs">${groupSize===1?'Daily Totals':'3-Day Totals'}</span></footer></section>`;
    }
    function findingCategory(f) {return f.id==='identity-signin'?0:f.id==='identity-admin'?2:3;}
    function overview(a) {
      const open=owned(a),unreviewed=waiting(open);
      const rank={critical:4,high:3,medium:2,low:1};
      const ordered=open.slice().sort((x,y)=>rank[y.severity]-rank[x.severity]);
      const priority=waiting(ordered)[0]||ordered[0];
      const allOpen=priority?[priority,...ordered.filter(f=>f!==priority)]:[];
      const summary=`<section class="as-panel as-overview-summary rounded-lg overflow-hidden p-5" aria-label="Finding Activity Summary">${a.id===1?accessChart():''}${metricsMarkup(a)}</section>`;
      const featured=priority?findingRow(priority,{priority:true}):`<section class="as-panel p-4 rounded-lg"><h2 class="text-base font-medium">${!a.enabled?'Assistant Is Off':a.pending?'First Check Pending':!a.last?'Ready for the First Check':'No Open Findings'}</h2><p class="text-sm">${!a.enabled?'Turn on this assistant to resume investigations. Previous findings and history stay available.':!a.last?'Findings will appear after the first investigation. Use Run Now to start a preview check.':'No open conditions in the available source evidence. Check source coverage for any gaps.'}</p></section>`;
      return `<div class="as-overview">${featured}${summary}${allOpen.length?`<section aria-labelledby="as-all-findings-heading"><header class="as-overview-section-header"><h2 id="as-all-findings-heading" class="text-base font-medium">All Open Findings</h2><button type="button" class="a-text" data-show-tab="findings">View All Findings</button></header><ul class="as-open-findings-grid grid gap-4">${allOpen.map(f=>`<li>${findingRow(f)}</li>`).join('')}</ul></section>`:''}</div>`;
    }
    function content(a) {
      const open=owned(a).filter(f=>a.id!==1||accessCategory===null||findingCategory(f)===accessCategory),all=findings.filter(f=>f.assistant===a.id);
      if(tab==='configuration')return configuration(a);
      if(tab==='findings')return `<header class="as-section-heading"><h2 class="text-base font-semibold">${accessCategory===null?'Open Findings':esc(accessCategories[accessCategory])}</h2>${accessCategory!==null?'<button type="button" class="a-text" data-access-category="all">Show All Findings</button>':''}<p class="text-xs">${open.length} open · ${waiting(open).length} to review. Acknowledgment does not resolve a condition.</p></header><div class="specialist-findings">${open.length?open.map(findingRow).join(''):`<div class="specialist-inline-empty text-sm">${!a.enabled?'Turn on this assistant to start receiving findings.':!a.last?'No checks yet. Use Run Now to start the first investigation.':'No open findings in the available evidence.'}</div>`}</div>`;
      if(tab==='history')return `<header class="as-section-heading"><h2 class="text-base font-semibold">Finding History</h2><p class="text-xs">Occurrences and meaningful changes, including verified resolutions.</p></header><div class="specialist-findings">${all.length?all.map(historyCard).join(''):'<p class="specialist-inline-empty text-sm">No findings have been recorded yet.</p>'}</div>`;
      return overview(a);
    }
    function systemRows(a) {
      return a.sources.map(name=>{
        const state=name==='Intune'?'setup':name==='Microsoft 365'?'syncing':'synced';
        const status=state==='setup'?`<button type="button" class="as-source-status" data-sync-state="setup" aria-label="Set up ${esc(name)}">Set up ${icon('arrow','h-3 w-3')}</button>`:`<span class="as-source-status" data-sync-state="${state}">${state==='syncing'?'Syncing...':'Synced'}</span>`;
        return `<div class="as-system-row text-xs"><span class="as-system-identity" ${state==='setup'?'data-setup="missing"':''}>${source(name,'source-card')}</span>${status}</div>`;
      }).join('');
    }
    function recentRuns(a,expanded=false) {
      const latest=owned(a).length;
      const runs=a.last?[[a.last,latest],['Yesterday, 8:00 AM',latest],['2 Days Ago, 8:00 AM',null,`Could not access ${a.sources.includes('Microsoft 365')?'Microsoft 365':a.sources[0]}. The run stopped before completing the investigation.`],['3 Days Ago, 8:00 AM',Math.max(0,latest-1)],['4 Days Ago, 8:00 AM',Math.max(0,latest-2)]]:[];
      if(expanded&&a.last)for(let day=5;day<14;day++)runs.push([`${day} Days Ago, 8:00 AM`,Math.max(0,latest-day%3)]);
      return `<section class="${expanded?'as-recent-runs':'as-panel as-recent-runs p-5 rounded-lg'}" aria-labelledby="${expanded?'assistant-dialog-title':'as-recent-runs-heading'}"><header class="flex items-center justify-between gap-3 mb-4"><h2 id="${expanded?'assistant-dialog-title':'as-recent-runs-heading'}" class="flex items-center gap-2 text-md font-medium !mb-0">${icon('clock','h-4 w-4')}Recent Runs</h2>${expanded?'':'<button type="button" class="a-text" data-show-all-runs>View All</button>'}</header><div class="${expanded?'as-recent-runs-scroll':''}"><ul class="as-recent-run-list text-xs">${a.running?`<li><span class="inline-flex items-center gap-2">${icon('clock','h-3 w-3')}Running Now</span>${badge('In Progress','info')}</li>`:''}${runs.map(([time,count,error])=>`<li data-run-state="${error?'error':'complete'}"><span class="inline-flex items-center gap-2">${icon(error?'alert':'check','h-3 w-3')}<span>${esc(time)}</span></span>${error?`<span class="as-run-error" tabindex="0" title="${esc(error)}" aria-label="Run Error: ${esc(error)}">Error</span>`:`<span class="as-run-findings">${count} ${count===1?'Finding':'Findings'}</span>`}</li>`).join('')}${!runs.length&&!a.running?'<li>No runs yet</li>':''}</ul></div></section>`;
    }
    function sidebar(a) {
      const useful=`<section class="as-panel as-deliverables p-4"><h2 class="text-sm font-semibold">Useful for...</h2><ul class="text-sm">${['Findings and meaningful changes','Affected users, devices, apps, or sites','Source evidence and its limitations','Recommended next steps'].map(text=>`<li>${icon('check')}${text}</li>`).join('')}</ul></section>`;
      const open=owned(a),affected=new Set(open.flatMap(f=>(f.objects||[]).map(object=>object[2]))).size;
      const glance=`<section class="as-glance border p-5 rounded-lg" aria-labelledby="as-glance-heading"><div class="flex items-center justify-between gap-3 mb-4"><h2 id="as-glance-heading" class="flex items-center gap-2 text-md font-medium !mb-0">${icon('info','h-4 w-4')}At a Glance</h2><span class="text-xs text-gray-600 text-right">${esc(a.scope||'Scope available after the first check')}</span></div><dl class="as-glance-stats grid grid-cols-3 border rounded-lg">${[[open.filter(f=>['high','critical'].includes(f.severity)).length,'High Priority'],[open.length,'Total Findings'],[affected,'Affected Objects']].map(([value,label])=>`<div class="px-3 py-2"><dd class="text-xl font-semibold">${value}</dd><dt class="text-xs">${label}</dt></div>`).join('')}</dl><dl class="as-glance-details text-xs">${[['Last Check',a.running?'Checking Now':a.pending?'First Check Pending':a.last||'Not Checked Yet'],['Capabilities',`${a.enabled?a.selectedCapabilities.length:0} of ${capabilitySets[a.id].length} On`]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section>`;
      const sources=`<section class="as-panel p-4"><h2 class="text-sm font-semibold">Recommended Sources</h2><div class="as-system-list">${systemRows(a)}</div></section>`;
      return `<aside class="as-sidebar">${offVariant?useful:glance+recentRuns(a)}${sources}</aside>`;
    }
    function situationIllustration(glyph,index) {
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
    function offOverview(a) {
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
      return `<header class="as-section-heading"><h2 class="text-base font-semibold">How This Assistant Helps</h2></header><div class="as-off-situations gap-4">${situations[a.id].map(([title,subheading,glyph],i)=>`<article class="as-off-situation p-4 rounded-lg" aria-labelledby="as-situation-title-${a.id}-${i}"><header class="flex items-center gap-3"><h3 class="text-md font-medium" id="as-situation-title-${a.id}-${i}">${esc(title)}</h3></header><p class="text-xs text-gray-500">${esc(subheading)}</p>${situationIllustration(glyph,i)}</article>`).join('')}</div><section class="as-off-capability-details" aria-label="Built-In Capabilities"><div class="as-off-capability-details-body">${capabilities(a)}</div></section>`;
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
      root.innerHTML=`<header class="as-header"><div class="as-heading mb-6"><span class="assistant-icon h-11 w-11" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">${icon(a.glyph,'h-5 w-5')}</span><div><div class="as-title-row"><h1>${esc(a.title)}</h1><span class="as-title-status">${badge(a.enabled?'Enabled':'Off',a.enabled?'success':'neutral')}</span></div><p class="text-sm">${esc(a.description)}</p></div></div><div class="as-header-action"><span class="inline-flex items-center gap-2 text-xs text-gray-500">${a.enabled?a.selectedCapabilities.length:0} of ${capabilitySets[a.id].length} Capabilities On</span>${a.enabled?`<span class="text-xs text-gray-500" aria-hidden="true">•</span><span class="inline-flex items-center gap-2 text-xs text-gray-500 mr-3">${icon('calendar')}${esc(scheduleLabel(a))}</span>`:`<button type="button" class="a-primary" data-specialist-action="enable-assistant" data-assistant-id="${a.id}">Enable Assistant</button>`}<button type="button" class="a-secondary as-header-config border" data-specialist-action="configure" data-assistant-id="${a.id}">${icon('settings')} Config</button>${a.enabled?`<button type="button" class="a-secondary" data-specialist-action="run-now" data-assistant-id="${a.id}" ${a.running?'disabled aria-busy="true"':''}>${icon('arrow')}${a.running?'Checking…':'Run Now'}</button>`:''}</div></header><nav class="assistants-tabs as-tabs" role="tablist" aria-label="Assistant Details">${tabs.map(([key,label])=>`<button type="button" role="tab" id="as-tab-${key}" aria-controls="as-content" aria-selected="${tab===key}" tabindex="${tab===key?0:-1}" data-show-tab="${key}">${label}${key==='findings'?` <span>${open.length}</span>`:''}</button>`).join('')}</nav><div class="as-layout"><section class="as-content" id="as-content" role="tabpanel" aria-labelledby="as-tab-${tab}" tabindex="0">${content(a)}</section>${sidebar(a)}</div>`;
    }
    root.addEventListener('change',event=>{if(event.target.matches('[data-access-days]')){accessDays=Number(event.target.value);root.querySelector('.as-access-chart').outerHTML=accessChart();root.querySelector('.as-overview-metrics').outerHTML=metricsMarkup(assistant);root.querySelector('[data-access-days]').focus();}});
    root.addEventListener('click',event=>{if(event.target.closest('[data-show-all-runs]')){openDialog(recentRuns(assistant,true));return;}const segment=event.target.closest('[data-access-category]');if(segment){accessCategory=segment.dataset.accessCategory==='all'?null:Number(segment.dataset.accessCategory);tab='findings';render();root.querySelector('#as-tab-findings').focus();return;}const capability=event.target.closest('[data-show-capability]');if(capability){const index=Number(capability.dataset.showCapability);if(Number.isInteger(index)&&index>=0&&index<capabilitySets[assistant.id].length){selectedCapability=selectedCapability===index?null:index;document.querySelector('#as-capability-grid').innerHTML=capabilityRows({...assistant,selectedSources:[...assistant.sources]});root.querySelector('[data-show-capability="'+index+'"]').focus();}return;}if(event.target.closest('[data-show-close-how]')){document.querySelector('#assistant-how-dialog').close();return;}const button=event.target.closest('[data-show-tab]');if(button){tab=button.dataset.showTab;render();root.querySelector('#as-tab-'+tab).focus();}});
    root.addEventListener('keydown',event=>{const button=event.target.closest('[data-show-tab]');if(!button)return;const index=tabs.findIndex(([key])=>key===button.dataset.showTab);let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tab=tabs[next][0];render();root.querySelector('#as-tab-'+tab).focus();}});
    return {render};
  }
};
