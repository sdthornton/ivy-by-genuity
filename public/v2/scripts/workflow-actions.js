/* Card menu and sample run results, isolated to the Workflows index. */
window.IvyWorkflowActions = (() => {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glyphs = {
    run: '<path d="m8 4 12 8-12 8Z"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15Z"/>',
    details: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    results: '<path d="M14 3H5v18h14V8ZM14 3v5h5M8 12h8M8 16h6"/>',
    archive: '<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>',
    delete: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>'
  };
  const icon = key => `<svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">${glyphs[key]}</svg>`;
  // Representative outputs for the index's custom requests; these are offline sample runs.
  const profiles = {
    1: [['Entra ID','Microsoft 365'], 'Privileged account activity collected for the access review.', [['Privileged accounts reviewed','32'],['Accounts with recent administrative changes','7'],['Sign-in records included','186']]],
    2: [['Entra ID','Intune'], 'Sign-in and device context assembled for the reported access issues.', [['Affected accounts in the request','8'],['Sign-in failures collected','24'],['Relevant device records','8']]],
    3: [['Sophos','Intune'], 'Protection, encryption, and detection evidence assembled for the security review.', [['Device records included','148'],['Encryption records included','141'],['Recent detections included','6']]],
    4: [['Meraki','Intune','Service desk'], 'Office-opening information gathered into a launch-readiness briefing.', [['Network configurations reviewed','4'],['Devices included','36'],['Open setup tickets','5']]],
    5: [['Microsoft 365'], 'Mailbox security activity collected for the support team.', [['Phishing reports included','12'],['Quarantine events included','47'],['Delivery issues included','3']]],
    6: [['Entra ID','Intune','SharePoint'], 'Recent account, device, and sharing changes collected into the team update.', [['Account changes included','18'],['Device changes included','26'],['Sharing changes included','9']]],
    7: [['Kaseya Spanning','Kaseya VSA'], 'Backup results and recovery coverage gathered for the operations review.', [['Backup jobs included','84'],['Failed jobs requiring review','3'],['Recovery coverage records','21']]],
    8: [['Entra ID','Intune','Microsoft 365'], 'Account activity, device health, licensing usage, and system changes gathered into the IT review briefing.', [['Account records included','284'],['Device records included','148'],['License assignments included','306']]],
    9: [['KnowBe4','Service desk'], 'Training and phishing results collected for the team briefing.', [['Training records included','218'],['Simulation responses included','64'],['Related support tickets','7']]],
    10: [['Entra ID','Microsoft 365'], 'Account setup, group membership, and application assignments collected for the new hire access check.', [['Accounts included','4'],['Group assignments included','12'],['Application assignments included','16']]],
    11: [['Microsoft 365','Entra ID'], 'License assignments and available usage evidence gathered for the renewal review.', [['Assignments included','306'],['Subscriptions included','8'],['Assignments needing usage review','19']]],
    12: [['Microsoft 365'], 'Incoming requests from Microsoft 365 grouped into a support-team triage summary.', [['Tickets included','42'],['Recurring topics grouped','6'],['Tickets awaiting more information','8']]],
    13: [['SharePoint','Microsoft 365'], 'External sharing and guest access records assembled for owner review.', [['Shared items included','67'],['Guest accounts included','23'],['Items with external links','14']]],
    14: [['Kaseya Spanning','Kaseya VSA'], 'Backup outcomes and recovery coverage combined into a readiness report.', [['Backup jobs included','84'],['Recovery records included','21'],['Outstanding follow-ups','4']]],
    15: [['Entra ID','Sophos','Intune'], 'Connected-system evidence gathered into the monthly security briefing.', [['Source systems included','3'],['Evidence records summarized','186'],['Items for team review','11']]]
  };
  function init({ workflows, details, edit, render }) {
    const menu = document.getElementById('workflow-card-menu');
    const dialog = document.getElementById('workflow-results-dialog');
    const notice = document.getElementById('workflow-action-notice');
    const histories = new WeakMap();
    let trigger = null, menuWorkflow = null, selectedWorkflow = null, selectedRun = 0, noticeTimer;
    const date = timestamp => new Intl.DateTimeFormat('en-US', { timeZone:'America/Los_Angeles', month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }).format(new Date(timestamp))+' PT';
    function profile(a) { return profiles[a.id] || [[a.category], a.description, [['Request',a.title],['Category',a.category],['Output','Information summary']]]; }
    // Fixed daily demo clock keeps refreshes from reshuffling the chart's history.
    const mockDay=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()));
    const mockHistoryTime=new Date(mockDay+'T18:00:00Z').getTime();
    function makeRun(a, number, index = 0, forcedStatus = null) {
      const referenceTime=forcedStatus?Date.now():mockHistoryTime;
      // Seeded variation keeps the offline history stable while making days distinct.
      const sample=salt=>{
        let value=(Math.imul(a.id,73856093)^Math.imul(number,19349663)^Math.imul(salt,83492791))>>>0;
        value=Math.imul(value^(value>>>16),0x45d9f3b);
        return ((value^(value>>>16))>>>0)/4294967296;
      };
      // Include ad-hoc runs between scheduled runs, with irregular but ordered gaps.
      let ageHours=a.hours || 0;
      for(let slot=1;slot<=index;slot++)ageHours+=10+Math.floor(((Math.imul(a.id+slot,2654435761)>>>0)%101)/101*45);
      const day=Math.floor(ageHours/24)%7;
      const errorChance=[0.10,0.58,0.05,0.08,0.50,0.12,0.20][day];
      const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short'}).format(new Date(referenceTime-ageHours*3600000));
      const outcome=sample(1);
      const status=forcedStatus || (index===0?a.latestRunStatus || 'Completed':weekday==='Sun'&&[1,6,9].includes(a.id)?'Failed':outcome<errorChance*0.55?'Failed':outcome<errorChance?'Incomplete':'Completed');
      const findingBurst=[1,0.4,2.2,0.5,0.4,1.5,3][day];
      const recommendationBurst=[1,0,0,3,0,4,1][day];
      const steps=a.id===12
        ? ['Read request settings','Connect to service desk','Gather incoming requests','Group related tickets','Classify incoming requests','Build triage summary','Save results']
        : a.id===6
          ? ['Read review settings','Gather changes from connected systems','Compare with last week','Summarize changes','Save results']
          : ['Read request settings','Gather source information','Review gathered records','Build summary','Save results'];
      const step=status==='Completed'?steps.length:status==='Running'?5:2;
      return {
        id:`${a.id}-${number}`, number,
        progress:{step,total:steps.length,stepName:steps[step-1]},
        at:status==='Running'?Date.now()-2*60000:referenceTime-ageHours*3600000,
        duration:28+(a.id*7+index*11)%70,
        status,
        variation:0,
        resultScale:weekday==='Mon'&&a.id===5?3:index===0?1:(0.5+sample(2)*2.6)*([3,5,7].includes(a.id)?findingBurst:1),
        recommendationBoost:['Thu','Fri'].includes(weekday),
        recommendationCount:weekday==='Thu'?2:weekday==='Fri'?4:weekday==='Mon'&&[12,14].includes(a.id)?4:index===0?1:Math.floor(sample(3)*(recommendationBurst+1))
      };
    }
    function history(a) {
      if(!histories.has(a)) {
        const runs=Array.from({length:Math.min(a.runs,5)},(_,index)=>makeRun(a,a.runs-index,index));
        // Extra failed attempts vary Sunday's run-issue series without replacing outputs.
        if([1,6,9].includes(a.id)&&a.runs>5){
          const sunday=runs.find(run=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short'}).format(new Date(run.at))==='Sun');
          if(sunday){
            const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(sunday.at));
            runs.push({...makeRun(a,a.runs-5,5,'Failed'),at:new Date(day+'T20:00:00Z').getTime()+a.id*60000});
            runs.sort((left,right)=>right.at-left.at);
          }
        }
        histories.set(a,runs);
      }
      return histories.get(a);
    }
    function execution(a) {
      const run=history(a)[0];
      if(!run)return {status:'Not run yet',time:'',reason:''};
      const minutes=Math.max(0,Math.floor((Date.now()-run.at)/60000));
      const ago=minutes<1?'just now':minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`;
      return {status:run.status,time:run.status==='Running'?`Started ${ago}`:ago,reason:run.status==='Failed'?`${profile(a)[0][0]} did not respond. No completed report was produced.`:run.status==='Incomplete'?`${profile(a)[0].at(-1)} did not return all requested records.`:''};
    }
    function report(a, run) {
      const [sources,summary,originalRows]=profile(a);
      const rows=originalRows.map(([label,value])=>[label,/^\d+$/.test(value)?String(Math.max(0,Math.round(Number(value)*(run.resultScale || 1))-run.variation)):value]);
      const value=index=>rows[index]?.[1] || '0';
      const headlines={
        1:`${value(1)} accounts had administrative changes`,
        2:`Access context gathered for ${value(0)} accounts`,
        3:`${value(2)} detections included in the evidence packet`,
        4:`${value(2)} office setup tickets remain open`,
        5:`${value(2)} delivery issues included in the mailbox summary`,
        6:'Recent system changes summarized for the team',
        7:`${value(1)} failed backup jobs need review`,
        8:'Your quarterly IT review briefing is ready',
        9:'Training and phishing results are ready',
        10:`Access records collected for ${value(0)} accounts`,
        11:`${value(2)} license assignments need usage review`,
        12:`${value(0)} tickets grouped for triage`,
        13:`${value(2)} external links ready for owner review`,
        14:`${value(2)} recovery follow-ups collected`,
        15:`${value(2)} items collected for the security team`
      };
      const suggestions={
        1:[`Review the ${value(1)} accounts with administrative changes`,'Confirm the recorded changes with the account owners before deciding whether follow-up is needed.',['Entra ID']],
        2:[`Review the access evidence for ${value(0)} accounts`,'Compare sign-in failures with the device and policy context in the briefing.',['Entra ID','Intune']],
        3:[`Review the ${value(2)} detections in the evidence packet`,'Check their current state and source evidence to decide which require further investigation.',['Sophos']],
        4:[`Review the ${value(2)} open setup tickets`,'Confirm owners and dependencies before the new office opens.',['Service desk']],
        5:[`Review the ${value(2)} delivery issues`,'Use the collected mailbox evidence to choose the next investigation.'],
        7:[`Review the ${value(1)} failed backup jobs`,'Check the job details and recovery coverage before planning corrective work.'],
        11:[`Check usage evidence for ${value(2)} assignments`,'Validate usage and contract commitments before making licensing changes or estimating savings.',['Microsoft 365']],
        12:['Review the grouped service desk requests','Use the triage summary to assign follow-ups to the appropriate team.',['Microsoft 365']],
        13:[`Confirm ownership of ${value(2)} external links`,'Review who needs access before proposing any sharing changes.',['SharePoint']],
        14:[`Review the ${value(2)} recovery follow-ups`,'Confirm backup and recovery evidence with the responsible owners.'],
        15:[`Review the ${value(2)} items in the security briefing`,'Use the source evidence to prioritize the next investigations.']
      };
      if(run.status==='Running')return {sources,rows:[],headline:'Information is still being gathered',summary:`The workflow is gathering information from ${sources.join(', ')}. A completed output is not available yet.`,actions:[]};
      if(run.status==='Failed')return {sources,rows:[],issues:[{title:'Source connection error',count:1}],headline:'The run could not finish',summary:`${sources[0]} did not respond. No completed report was produced.`,actions:[]};
      if(run.status==='Incomplete')return {sources,rows,issues:[{title:'Incomplete source records',count:1}],headline:'Partial output needs a source check',summary:`${sources.at(-1)} did not return all requested records. The output includes only the evidence available for this run.`,actions:[{title:`Check ${sources.at(-1)} before using this output`,description:'Review the missing source information and rerun the request when the source is available.'}]};
      const issueRows={
        3:[2,'Security detections','Sophos'],
        5:[2,'Mail delivery issues','Microsoft 365'],
        7:[1,'Failed backup jobs','Kaseya Spanning']
      };
      const issue=issueRows[a.id];
      const issues=issue?[{title:issue[1],count:Number(value(issue[0]))}]:[];
      const findings=issues.flatMap(group=>Array.from({length:group.count},(_,index)=>({
        id:`${run.id}-finding-${index+1}`,
        sourceSystems:[issue[2]],
        severity:a.id===3&&index===0?'critical':null, // Explicit severity for one illustrative mock detection.
        recommendedAction:a.id===3?'Investigate the detection and confirm the endpoint’s protection state.':null,
        title:a.id===3?`Malware detected on ${['FIN-LT-01','OPS-LT-02','HR-DT-03','ENG-LT-04','SALES-LT-05','OPS-DT-06'][index] || `ENDPOINT-${index+1}`}.`:a.id===5?`Message delivery failed for ${['alex','morgan','jordan','taylor','casey','riley'][index] || `user${index+1}`}@example.com.`:`Backup failed for ${['FIN-SRV-01','OPS-SRV-02','FILES-SRV-03'][index] || `SERVER-${index+1}`}.`
      })));
      const suggestion=suggestions[a.id] || (run.recommendationBoost?[`Check the collected ${sources[0]} evidence`,'Confirm the expected records are present before using this briefing.',[sources[0]]]:null);
      const actionOptions=suggestion?[{title:suggestion[0],description:suggestion[1],sourceSystems:suggestion[2]},
        {title:`Confirm ${sources[0]} coverage with the workflow owner`,description:'Check that the collected evidence covers the scope the team needs.',sourceSystems:[sources[0]]},
        {title:'Share the evidence with the responsible team',description:'Send the collected context to the owners who will decide the next action.'},
        {title:'Plan the next follow-up check',description:'Agree when to repeat this information-gathering workflow and compare its output.'}
      ]:[];
      return {sources,rows,headline:headlines[a.id] || 'The requested information is ready',summary,issues,findings,actions:actionOptions.slice(0,run.recommendationCount ?? 1)};
    }
    function closeMenu(restore = false) {
      menu.hidden=true;
      if(trigger){trigger.setAttribute('aria-expanded','false');if(restore && trigger.isConnected)trigger.focus();}
      menuWorkflow=null;
    }
    function notify(message, undo) {
      clearTimeout(noticeTimer);notice.textContent=message;notice.hidden=false;
      if(undo){const button=document.createElement('button');button.type='button';button.className='text-sm';button.textContent='Undo';button.addEventListener('click',()=>{undo();notice.hidden=true;render();});notice.append(button);}
      noticeTimer=setTimeout(()=>notice.hidden=true,8000);
    }
    function toggle(a, button) {
      if(!menu.hidden && trigger===button){closeMenu(true);return;}
      closeMenu();trigger=button;menuWorkflow=a;
      const item=(action,label,extra='')=>`<button class="workflow-menu-item text-sm ${extra}" type="button" role="menuitem" data-workflow-action="${action}">${icon(action)}<span>${label}</span></button>`;
      menu.innerHTML=item('run','Run now')+item('edit','Edit')+item('details','Details')+item('results','View results')+'<div class="workflow-menu-divider" role="separator"></div>'+item('archive','Archive')+item('delete','Delete','workflow-menu-danger');
      menu.hidden=false;button.setAttribute('aria-expanded','true');
      const rect=button.getBoundingClientRect(), bounds=menu.getBoundingClientRect();
      menu.style.left=Math.max(8,Math.min(rect.right-bounds.width,window.innerWidth-bounds.width-8))+'px';
      menu.style.top=Math.max(8,rect.bottom+bounds.height+8>window.innerHeight?rect.top-bounds.height-8:rect.bottom+8)+'px';
      menu.querySelector('[role=menuitem]').focus();
    }
    function open(content) {
      if(dialog.open)dialog.close();
      dialog.innerHTML=`<button type="button" class="assistant-dialog-close" aria-label="Close dialog" data-result-action="close">×</button>${content}`;
      dialog.showModal();
    }
    function runView(a) {
      selectedWorkflow=a;
      const sources=profile(a)[0];
      open(`<h2 id="workflow-results-title">${esc(a.title)}</h2><p>${esc(a.description)}</p><dl><dt>Sources</dt><dd>${sources.map(esc).join(', ')}</dd><dt>Run mode</dt><dd>${esc(a.schedule || 'Manual')}</dd><dt>Visibility</dt><dd>${esc(a.visibility)}</dd></dl><small class="workflow-results-hint text-xs">Offline preview · Runs generate sample results in this session.</small><div class="assistant-dialog-actions">${a.status==='draft'?'<button type="button" class="a-primary" data-result-action="edit">Continue editing</button>':'<button type="button" class="a-primary" data-result-action="run">Run workflow</button>'}${a.runs?'<button type="button" class="a-secondary" data-result-action="results">View results</button>':''}</div>`);
    }
    function results(a, runId = null) {
      selectedWorkflow=a;selectedRun=runId?Math.max(0,history(a).findIndex(run=>run.id===runId)):0;
      const runs=history(a);
      if(!runs.length){
        open(`<h2 id="workflow-results-title">Results</h2><p>${esc(a.title)}</p><div class="workflow-results-empty p-4"><h3 class="text-base">No runs yet</h3><p>Results will appear here after this workflow has run.</p></div><div class="assistant-dialog-actions"><button type="button" class="a-primary" data-result-action="${a.status==='draft'?'edit':'run'}">${a.status==='draft'?'Continue editing':'Run workflow'}</button></div>`);
        return;
      }
      open(`<h2 id="workflow-results-title">Results</h2><p class="workflow-results-name">${esc(a.title)}</p><div class="workflow-run-picker text-sm"><label for="workflow-run-selection">Run</label><select id="workflow-run-selection" class="text-sm" aria-label="Select a run to view">${runs.map((run,index)=>`<option value="${index}" ${index===selectedRun?'selected':''}>${index===0?'Latest · ':''}${esc(date(run.at))} · ${run.status}</option>`).join('')}</select></div><div id="workflow-selected-result" aria-live="polite"></div><small class="workflow-results-hint text-xs">Showing ${runs.length} recent ${runs.length===1?'run':'runs'} of ${a.runs} total · Sample results</small>`);
      drawResult();
    }
    function drawResult() {
      const a=selectedWorkflow, run=history(a)[selectedRun], output=report(a,run), {sources,summary,rows}=output;
      const body=document.getElementById('workflow-selected-result');
      body.innerHTML=`<div class="workflow-result-meta text-xs"><span class="workflow-result-status" data-status="${run.status}">${run.status}</span><span>Run #${run.number}</span><span>${esc(date(run.at))}</span><span>${run.status==='Running'?'In progress':run.duration+'s'}</span>${selectedRun===0?'<span>Latest run</span>':''}</div>${run.status==='Running'?`<div class="workflow-result-callout p-4"><h3 class="text-base">Run in progress</h3><p>Gathering information from ${sources.map(esc).join(', ')}. The completed output will appear when the run finishes.</p><ol class="text-sm"><li>Request prepared</li><li>Source information is being gathered</li><li>Summary pending</li></ol></div>`:run.status==='Failed'?`<div class="workflow-result-callout p-4"><h3 class="text-base">The run could not finish</h3><p>${esc(sources[0])} did not respond. No completed report was produced for this run.</p><p>Check source access, then try the workflow again. Earlier results are available in the run selector above.</p></div>`:`${run.status==='Incomplete'?'<div class="workflow-result-callout p-4"><strong>Partial output</strong><p>${esc(sources.at(-1))} did not return all requested records. This summary includes only the evidence available for this run.</p></div>':''}<section class="workflow-result-report text-sm"><h3 class="text-base">Summary</h3><p>${esc(summary)}</p>${output.findings?.length?`<section><h3 class="text-base">Issues found</h3><ul>${output.findings.map(finding=>`<li>${esc(finding.title)}</li>`).join('')}</ul></section>`:''}<table class="text-sm"><caption class="text-xs">Information gathered for this run</caption><thead><tr><th scope="col">Included in the output</th><th scope="col">Result</th></tr></thead><tbody>${rows.map(([label,value])=>`<tr><td>${esc(label)}</td><td>${esc(value)}</td></tr>`).join('')}</tbody></table><div class="workflow-result-sources"><h3 class="text-base">Sources</h3><div>${sources.map(source=>`<span class="text-xs">${esc(source)}</span>`).join('')}</div></div>${output.actions.length?`<section class="workflow-result-recommendations"><h3 class="text-base">Recommended next steps</h3>${output.actions.map(action=>`<div class="workflow-result-callout p-4"><strong>${esc(action.title)}</strong><p>${esc(action.description)}</p></div>`).join('')}</section>`:''}</section>`}`;
    }
    menu.addEventListener('click',event=>{
      const button=event.target.closest('[data-workflow-action]');if(!button || !menuWorkflow)return;
      const a=menuWorkflow,action=button.dataset.workflowAction;closeMenu(true);
      if(action==='run')runView(a);
      if(action==='edit')edit(a);
      if(action==='details')details(a);
      if(action==='results')results(a);
      if(action==='archive'){a.archived=true;render();notify('Workflow archived.',()=>{a.archived=false;});}
      if(action==='delete'){const index=workflows.indexOf(a);if(index>=0){workflows.splice(index,1);render();notify('Workflow deleted from this mock.',()=>workflows.splice(index,0,a));}}
    });
    menu.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();closeMenu(true);return;}
      if(event.key==='Tab'){closeMenu();return;}
      const items=[...menu.querySelectorAll('[role=menuitem]')],current=items.indexOf(document.activeElement);
      const next=event.key==='ArrowDown'?(current+1)%items.length:event.key==='ArrowUp'?(current+items.length-1)%items.length:event.key==='Home'?0:event.key==='End'?items.length-1:null;
      if(next!==null){event.preventDefault();items[next].focus();}
    });
    document.addEventListener('pointerdown',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!trigger?.contains(event.target))closeMenu();});
    document.addEventListener('scroll',event=>{if(!menu.hidden&&!menu.contains(event.target))closeMenu();},true);
    window.addEventListener('resize',()=>closeMenu());
    dialog.addEventListener('change',event=>{if(event.target.id==='workflow-run-selection'){selectedRun=Number(event.target.value);drawResult();}});
    dialog.addEventListener('click',event=>{
      const action=event.target.closest('[data-result-action]')?.dataset.resultAction;
      if(!action)return;
      if(action==='close'){dialog.close();return;}
      const a=selectedWorkflow;
      if(action==='edit'){dialog.close();edit(a);}
      if(action==='results')results(a);
      if(action==='run' && a.status!=='draft'){
        const runs=history(a);a.runs+=1;a.hours=0;
        runs.unshift(makeRun(a,a.runs,0,'Completed'));if(runs.length>5)runs.pop();
        render();results(a);
      }
    });
    return {toggle,close:closeMenu,results,history,runView,execution,report};
  }
  return {init};
})();
