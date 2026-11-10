/* The five built-in, read-only operational specialists. Changes stay in this mock session. */
(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const isShow=document.body?.dataset.assistantPage==='show';
  const isOnboarding=document.body?.dataset.assistantVariant==='onboarding';
  const isOnboardingPreview=isOnboarding&&document.body.dataset.assistantPreview==='no-sources';
  let showPage;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const paths={
    sparkles:'<path d="m9 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2ZM19 3v4M17 5h4M19 15v6M16 18h6"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    identity:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2M16 3l4 1v4"/>',
    health:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8M12 17v5M5 10h3l2-4 4 8 2-4h3"/>',
    security:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6ZM8 11l3 3 5-6"/>',
    network:'<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="1" y="16" width="8" height="6" rx="1"/><rect x="15" y="16" width="8" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    licensing:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="m14 18 3 3 5-7"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    alert:'<path d="m12 3 10 18H2ZM12 9v5M12 17h.01"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>'
  };
  const icon=(name,classes='h-4 w-4')=>`<svg class="${classes}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.alert}</svg>`;
  const sourceAssets={
    'Entra ID':'assistant-creation/src/assets/integrations/entra-id.png',
    'Microsoft 365':'components/assets/microsoft-365.png',Intune:'components/assets/intune.svg',Sophos:'components/assets/sophos.png',
    'Kaseya VSA':'assistant-creation/src/assets/integrations/kaseya-vsa.png',
    'Cisco Meraki':'assistant-creation/src/assets/integrations/cisco-meraki.png',
    'Cisco Umbrella':'assistant-creation/src/assets/integrations/cisco-umbrella.png'
  };
  const sourceIsConnected=name=>name!=='Intune';
  const source=(name,...options)=>{const large=options[0]==='source-card';return `<span class="specialist-source text-xs"><img class="${large?'h-5 w-5':'h-4 w-4'}" src="${sourceAssets[name]}" width="${large?20:16}" height="${large?20:16}" alt=""/>${esc(name)}</span>`;};
  const cadenceLabels={daily:'Daily',weekdays:'Weekdays',twice:'Every 12 hours',weekly:'Weekly',manual:'On demand only'};
  const timeZones={'America/Los_Angeles':'Pacific Time','America/New_York':'Eastern Time','Europe/London':'London Time',UTC:'UTC'};
  const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const runTimers=new Map();
  const capabilitySets=window.IvyAssistantCapabilities;
  const assistants=[
    {id:1,title:'Identity & Access',glyph:'identity',family:'purple',enabled:true,scope:'312 identities',last:'15m ago',sources:['Entra ID','Microsoft 365','Intune'],description:'Investigates sign-in failures, access restrictions, and identity changes across users, devices, and applications.',checks:['Authentication failures and recurring access issues','Privileged access and identity changes','Device and application context behind access problems'],coverage:'Identity records are matched across the three connected sources.'},
    {id:2,title:'Endpoint Health',glyph:'health',family:'blue',enabled:true,scope:'148 devices',last:'35m ago',sources:['Intune','Kaseya VSA'],description:'Investigates device reliability, performance, patching, and management problems before they interrupt users.',checks:['Device reliability and performance patterns','Patching and deployment failures','Management check-ins and compliance evidence'],coverage:'12 devices lack recent check-in evidence. Their current health cannot be verified.',coverageGap:true},
    {id:3,title:'Endpoint Security',glyph:'security',family:'orange',enabled:true,scope:'148 devices',last:'10m ago',sources:['Sophos','Intune'],description:'Investigates endpoint threats, protection health, encryption, and security-control failures using source evidence.',checks:['Threat detections and protection-agent health','Reported encryption and security-control state','Changes in protection coverage across devices'],coverage:'Sophos protection records are linked to the Intune device inventory.'},
    {id:4,title:'Network Health',glyph:'network',family:'teal',enabled:false,scope:'5 sites · 18 devices',last:'20m ago',sources:['Cisco Meraki','Cisco Umbrella'],description:'Investigates connectivity, infrastructure health, performance, and recurring network problems across your sites.',checks:['Offline devices and recurring connectivity failures','Infrastructure health and performance changes','DNS blocks and network-policy context'],coverage:'Five sites have recent network and DNS evidence.'},
    {id:5,title:'Application & Licensing',glyph:'licensing',family:'cyan',enabled:false,scope:null,last:null,sources:['Microsoft 365','Entra ID'],description:'Investigates application access, provisioning, and license usage to surface entitlement gaps and potential inefficiencies.',checks:['Application access and entitlement gaps','Provisioning and license-assignment problems','Usage evidence and potential licensing inefficiencies'],coverage:'Connected Microsoft 365 and Entra ID sources are ready to use.'}
  ].map(item=>({...item,cadence:'daily',selectedCapabilities:[0,1,2,3,4],selectedSources:[...item.sources],notify:true,notifyChannels:['in-app'],pending:false,startTime:'08:00',timeZone:'America/Los_Angeles',day:'Monday',running:false}));
  const findings=[
    {id:'security-threat',assistant:3,title:'Active malware detection on FIN-LT-01.',severity:'critical',change:'New',affected:'1 device',source:'Sophos',checked:'10m ago',first:'Today, 9:10 AM',acknowledged:false,evidence:'Sophos reports an active malware detection on FIN-LT-01. The device identity is matched to its Intune inventory record.',next:'Inspect the threat evidence and confirm the device’s current protection state in Sophos.',history:['First observed in the latest security check.','The source still reports the detection as active.']},
    {id:'identity-signin',assistant:1,title:'Sign-in failures are affecting more Finance users.',severity:'high',change:'Worsened',affected:'7 users',source:'Entra ID',checked:'15m ago',first:'3 days ago',acknowledged:false,evidence:'The same access problem now affects 7 Finance users, up from 4. Entra ID contains 26 failed sign-ins for the affected users. The available evidence does not yet establish a policy as the cause.',next:'Compare sign-in details, device context, and policy results for the affected users.',history:['First observed: 4 users affected.','Latest material change: affected population increased to 7.']},
    {id:'security-encryption',assistant:3,title:'Intune reports 4 devices as unencrypted.',severity:'high',change:'Ongoing',affected:'4 devices',source:'Intune',checked:'10m ago',first:'2 days ago',acknowledged:false,evidence:'Current device records report encryption as off on 4 managed devices. This finding uses reported device state, rather than the assigned encryption policy.',next:'Review the device-level encryption evidence and confirm the affected devices with their owners.',history:['First observed: 4 devices reported encryption off.','Latest check: the condition remains present; no new occurrence was created.']},
    {id:'identity-admin',assistant:1,title:'MFA registration evidence is missing for 2 privileged accounts.',severity:'medium',change:'New',affected:'2 accounts',source:'Entra ID',checked:'15m ago',first:'Today, 8:00 AM',acknowledged:false,evidence:'Two accounts with privileged role assignments have no MFA registration record in the collected evidence. Registration evidence alone does not establish effective sign-in enforcement.',next:'Check the accounts’ registration details and effective access requirements.',history:['First observed in today’s identity check.']},
    {id:'health-checkin',assistant:2,title:'3 managed devices have stopped checking in.',severity:'medium',change:'Ongoing',affected:'3 devices',source:'Intune',checked:'35m ago',first:'4 days ago',acknowledged:false,evidence:'Three managed devices have missed expected management check-ins. Their current state is unverified; missing evidence does not establish that the devices are offline or resolved.',next:'Confirm the last reported activity and investigate management connectivity for those devices.',history:['First observed: check-in evidence became stale.','Latest check: fresh verification remains unavailable.']},
    {id:'identity-inactive',assistant:1,title:'9 inactive accounts retain application access.',severity:'low',change:'Ongoing',affected:'9 accounts',source:'Microsoft 365',checked:'15m ago',first:'6 days ago',acknowledged:false,evidence:'Nine enabled accounts retain application assignments with no recent activity in the collected service evidence. The records do not establish that the account owners have left the organization.',next:'Confirm the account owners and business need before considering access changes.',history:['First observed: 9 accounts had no recent service activity.','Latest check: the same condition persists.']}
  ];
  // Condition, latest change, evidence verification, and customer review are separate states.
  const findingDetails={
    'security-threat':{reference:'F-1001',objects:[['FIN-LT-01','Device','sophos-fin-lt-01']],confirmed:['Sophos reports an active malware detection on FIN-LT-01.','The device record matches its Intune inventory identity.'],hypotheses:[],unknowns:['Whether the device is currently isolated and whether the detection has been remediated.'],observed:'10m ago'},
    'identity-signin':{reference:'F-1002',objects:['alex.morgan','jamie.lee','casey.patel','riley.chen','taylor.reed','jordan.ellis','morgan.wells'].map(name=>[name+'@example.com','User','entra-'+name]),confirmed:['26 failed sign-ins are recorded for 7 Finance users.','The affected population increased from 4 to 7 users.','A device-compliance requirement is recorded in 18 of the failed sign-in records; effective policy outcomes still need comparison.'],hypotheses:['A shared device-compliance requirement may explain the failures; policy results still need comparison.'],unknowns:['The cause is not established. Applicable policy configuration alone does not prove effective enforcement.'],observed:'15m ago'},
    'security-encryption':{reference:'F-1003',objects:['FIN-LT-04','FIN-LT-08','OPS-LT-12','OPS-LT-19'].map(name=>[name,'Device','intune-'+name.toLowerCase()]),confirmed:['The latest Intune device reports list encryption as off on these four devices.'],hypotheses:[],unknowns:['Device-owner confirmation and the reason for encryption being off are still outstanding.'],observed:'10m ago'},
    'identity-admin':{reference:'F-1004',objects:[['admin.finance@example.com','Account','entra-admin-finance'],['admin.operations@example.com','Account','entra-admin-operations']],confirmed:['Two privileged accounts have no registration record in the collected MFA evidence.'],hypotheses:[],unknowns:['Effective sign-in enforcement and the reason for the missing registration evidence are unverified.'],observed:'15m ago'},
    'health-checkin':{reference:'F-1005',verification:'unavailable',freshness:'stale',objects:['OPS-LT-07','OPS-LT-11','FIN-LT-16'].map(name=>[name,'Device','intune-'+name.toLowerCase()]),confirmed:['Three devices have missed expected management check-ins.','The last available Intune device reports are 3 days old.','Kaseya VSA reports activity 15m ago for OPS-LT-07, despite its stale Intune check-in.'],supportingSources:['Intune','Kaseya VSA'],hypotheses:['A management connection problem is one explanation to investigate.'],unknowns:['Whether the devices are currently online or healthy cannot be verified. Missing reports do not establish resolution.'],observed:'3 days ago'},
    'identity-inactive':{reference:'F-1006',objects:Array.from({length:9},(_,i)=>['review.account'+String(i+1).padStart(2,'0')+'@example.com','Account','m365-review-'+(i+1)]),confirmed:['Nine enabled accounts retain application assignments.','No recent activity appears in the collected service evidence.'],hypotheses:[],unknowns:['Whether access is still needed. Absence of recorded activity does not prove nonuse or that an employee has departed.'],observed:'15m ago'}
  };
  findings.forEach(f=>Object.assign(f,{condition:'open',verification:'verified',freshness:'fresh',conditionKey:f.id,...findingDetails[f.id]}));
  findings.push(
    {id:'network-wireless',reference:'F-1007',assistant:4,title:'Austin Wi-Fi disconnects are improving.',severity:'medium',change:'Improving',condition:'open',conditionKey:'austin-wifi-disconnects',verification:'verified',freshness:'fresh',affected:'3 access points',source:'Cisco Meraki',checked:'20m ago',observed:'20m ago',first:'5 days ago',acknowledged:true,objects:['ATX-AP-01','ATX-AP-02','ATX-AP-03'].map(name=>[name,'Access point','meraki-'+name.toLowerCase()]),evidence:'Meraki reports recurring disconnections on 3 access points, down from 12 in the prior comparison window. Failures still occur, so the condition remains open.',confirmed:['The affected access-point population decreased from 12 to 3.','Recurring disconnections are still reported on the remaining 3 access points.'],hypotheses:[],unknowns:['What caused the improvement and whether it will persist.'],next:'Continue observing the remaining access points and compare their connection evidence.',history:['First observed: 12 access points affected.','Improved: the affected population fell to 3; resolution is not yet verified.']},
    {id:'network-uplink-prior',reference:'F-1008',assistant:4,title:'Boston uplink instability was verified resolved.',severity:'high',change:'Resolved',condition:'resolved',conditionKey:'boston-uplink-instability',verification:'verified',freshness:'fresh',affected:'1 switch',source:'Cisco Meraki',checked:'2 days ago',observed:'Oct 27, 2026 · 10:00 AM Pacific',first:'Oct 24, 2026',resolvedAt:'Oct 27, 2026 · 10:00 AM Pacific',acknowledged:true,objects:[['BOS-SW-02','Switch','meraki-bos-sw-02']],evidence:'Meraki reported a stable uplink and no further uplink-flap events in two consecutive comparison windows, verifying the end of this occurrence on October 27.',confirmed:['Two consecutive checks verified a stable uplink and no continuing flap events for this occurrence.'],hypotheses:[],unknowns:[],resolution:'Stable uplink state and no new flap events in two consecutive comparison windows.',related:'network-uplink-return',next:null,history:['Oct 24: uplink instability first observed on BOS-SW-02.','Oct 27: fresh source evidence verified resolution; this occurrence was closed.']},
    {id:'network-uplink-return',reference:'F-1009',assistant:4,title:'Boston uplink instability has resurfaced.',severity:'high',change:'Resurfaced',condition:'open',conditionKey:'boston-uplink-instability',verification:'verified',freshness:'fresh',affected:'1 switch',source:'Cisco Meraki',checked:'20m ago',observed:'20m ago',first:'Today, 9:00 AM',acknowledged:false,objects:[['BOS-SW-02','Switch','meraki-bos-sw-02']],evidence:'Meraki reports 8 new uplink-flap events on BOS-SW-02 after the previous occurrence was verified resolved on October 27. This is a new occurrence of the same condition.',confirmed:['Eight new flap events are recorded for BOS-SW-02.','The previous occurrence was verified resolved before these events began.'],hypotheses:[],unknowns:['Whether the recurrence shares the earlier cause; no causal relationship to a configuration change has been established.'],related:'network-uplink-prior',next:'Compare the new uplink events with switch health and recent changes before selecting a response.',history:['Oct 27: previous occurrence F-1008 verified resolved.','Today, 9:00 AM: new occurrence F-1009 created after fresh uplink-flap events.']}
  );
  // Recommendations are deliberately curated; a finding alone does not create an action.
  const suggestionCopy={
    'security-encryption':{ready:true,title:'Verify encryption on 4 devices',reason:'Intune reports encryption off. Device-level verification will confirm which devices need follow-up.',step:'Open the four affected device records in Intune and compare their latest encryption reports. Confirm the reported state with device owners before planning a change.'},
    'health-checkin':{ready:true,title:'Check management connectivity',reason:'3 devices have stale check-ins. Confirm their last activity before treating them as offline.',step:'Compare the last Intune check-in with Kaseya activity for the three devices. Where fresh activity exists, investigate the management connection; otherwise confirm availability with the owner.'},
    'identity-inactive':{ready:true,title:'Confirm access for 9 accounts',reason:'Inactive accounts still have application access. Confirm the business need before proposing removal.',step:'Review the nine account owners and their application assignments. Ask the responsible owner to confirm whether each assignment is still needed before considering access changes.'}
  };
  const dismissedSuggestions=[];
  const sessionKey='ivy-specialist-preview-v1';
  function restoreSession() {
    try {
      const stored=JSON.parse(window.sessionStorage.getItem(sessionKey)||'null');if(!stored||![1,2].includes(stored.version))return;
      for(const a of assistants){const item=stored.assistants?.find(item=>item.id===a.id);if(!item)continue;if(typeof item.enabled==='boolean')a.enabled=item.enabled;if(Array.isArray(item.selectedSources))a.selectedSources=item.selectedSources.filter(name=>a.sources.includes(name)&&sourceIsConnected(name));if(Object.hasOwn(cadenceLabels,item.cadence))a.cadence=item.cadence;if(Array.isArray(item.selectedCapabilities))a.selectedCapabilities=item.selectedCapabilities.filter(i=>Number.isInteger(i)&&i>=0&&i<capabilitySets[a.id].length);if(typeof item.notify==='boolean')a.notify=item.notify;if(Array.isArray(item.notifyChannels))a.notifyChannels=item.notifyChannels.filter(channel=>['in-app','email'].includes(channel));if(typeof item.pending==='boolean')a.pending=item.pending;if(/^([01]\d|2[0-3]):[0-5]\d$/.test(item.startTime))a.startTime=item.startTime;if(Object.hasOwn(timeZones,item.timeZone))a.timeZone=item.timeZone;if(weekdays.includes(item.day))a.day=item.day;if(typeof item.last==='string'||item.last===null)a.last=item.last;if(stored.version===1&&[4,5].includes(a.id)){a.enabled=false;a.pending=false;}}
      for(const f of findings){const item=stored.findings?.find(item=>item.id===f.id);if(typeof item?.acknowledged==='boolean'&&f.condition!=='resolved')f.acknowledged=item.acknowledged;}
      if(Array.isArray(stored.dismissedSuggestions))dismissedSuggestions.push(...stored.dismissedSuggestions.filter(id=>suggestionCopy[id]?.ready));
    } catch (_) { /* The file preview also works when browser storage is unavailable. */ }
  }
  function saveSession() {
    try {window.sessionStorage.setItem(sessionKey,JSON.stringify({version:2,assistants:assistants.map(({id,enabled,selectedSources,selectedCapabilities,cadence,notify,notifyChannels,pending,startTime,timeZone,day,last})=>({id,enabled,selectedSources,selectedCapabilities,cadence,notify,notifyChannels,pending,startTime,timeZone,day,last})),findings:findings.map(({id,acknowledged})=>({id,acknowledged})),dismissedSuggestions}));} catch (_) { /* Optional preview persistence. */ }
  }
  restoreSession();
  assistants.forEach(a=>{a.selectedSources=a.selectedSources.filter(sourceIsConnected);});
  const rank={critical:4,high:3,medium:2,low:1};
  let view='overview',layout='grid',availability='all',findingState='all',toastTimer;
  const dialog=$('#assistant-dialog');
  const owned=a=>findings.filter(f=>f.assistant===a.id&&f.condition!=='resolved');
  const waiting=items=>items.filter(f=>f.condition!=='resolved'&&!f.acknowledged);
  function searchText() {return isOnboarding?'':$('#assistant-search').value.trim();}
  function filtered() {
    const query=searchText().toLowerCase();
    return assistants.filter(a=>(view!=='all'||availability==='all'||availability==='enabled'&&a.enabled||availability==='disabled'&&!a.enabled)&&`${a.title} ${a.description} ${a.sources.join(' ')}`.toLowerCase().includes(query));
  }
  function badge(label,tone='neutral') {return `<span class="specialist-badge text-xs" data-tone="${tone}">${esc(label)}</span>`;}
  function stateLabel(a) {return !a.enabled?'Off':a.running?'Checking now':a.pending?'First check pending':a.cadence==='manual'?'Ready to Run':a.coverageGap?'Coverage gap':'Watching';}
  function scheduleLabel(a) {
    if(a.cadence==='manual')return 'On demand · Manual trigger';
    const [hour,minute]=a.startTime.split(':').map(Number),time=`${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;
    return `${cadenceLabels[a.cadence]}${a.cadence==='weekly'?' · '+a.day:''} · ${time}`;
  }
  function cardSchedule(a) {
    let label='On demand';
    if(a.cadence!=='manual') {
      const [hour,minute]=a.startTime.split(':').map(Number),time=`${hour%12||12}${minute?':'+String(minute).padStart(2,'0'):''}${hour>=12?'pm':'am'}`;
      label=`${a.cadence==='weekly'?a.day.slice(0,3):cadenceLabels[a.cadence]}, ${time}`;
    }
    if(!a.enabled)label=(a.cadence==='manual'?'Off':'Paused')+' · '+label;
    return `<span class="specialist-card-schedule text-xs" title="${esc((a.enabled?'':'Off · Saved setting: ')+scheduleLabel(a))}">${icon('calendar','h-3 w-3')}<span>${esc(label)}</span></span>`;
  }
  function powerToggle(a) {if(isOnboarding)return '';return `<button type="button" class="specialist-power text-xs" role="switch" aria-checked="${a.enabled}" aria-label="Turn ${a.enabled?'off':'on'} ${esc(a.title)}" data-specialist-action="toggle-power" data-assistant-id="${a.id}" ${!a.enabled?'aria-haspopup="dialog"':''}><span class="specialist-power-track" aria-hidden="true"></span><span>${a.enabled?'On':'Off'}</span></button>`;}
  function stopAssistant(a) {
    clearTimeout(runTimers.get(a.id));runTimers.delete(a.id);a.running=false;a.enabled=false;a.pending=false;
    render();toast('Assistant turned off. Future checks stopped; findings and history kept.');
  }
  function runNow(a) {
    if(!a.enabled||a.running)return;
    a.running=true;render();toast('Running a preview investigation using sample evidence.');
    runTimers.set(a.id,setTimeout(()=>{if(!a.enabled)return;a.running=false;a.pending=false;a.last='Just now';runTimers.delete(a.id);render();toast('Preview check completed. Existing sample findings retained.');},2400));
  }
  function lifecycleBadges(f) {
    const changeTone=['Worsened','Resurfaced'].includes(f.change)?'warning':f.change==='Improving'?'success':f.change==='New'?'info':'neutral';
    return `${badge(f.severity,['critical','high'].includes(f.severity)?'danger':'neutral')}${f.condition==='resolved'?badge('Verified resolved','success'):badge(f.change,changeTone)}${f.verification==='unavailable'?badge('Verification unavailable','warning'):''}${f.acknowledged&&f.condition!=='resolved'?badge('Acknowledged'):''}`;
  }
  function elapsedMinutes(value) {const match=value.match(/(\d+)\s*(m|h|day)/);return match?Number(match[1])*(match[2]==='day'?1440:match[2]==='h'?60:1):0;}
  function matchesFindingState(f) {
    if(findingState==='all')return true;
    if(findingState==='open')return f.condition!=='resolved';
    if(findingState==='resolved')return f.condition==='resolved';
    if(findingState==='unavailable')return f.verification==='unavailable';
    return f.change.toLowerCase()===findingState;
  }
  function card(a) {
    const items=owned(a),needs=waiting(items).length;
    return `<article class="assistant-card p-4 specialist-card" data-specialist-action="open" data-assistant-id="${a.id}" tabindex="0" role="link" aria-labelledby="assistant-title-${a.id}" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)"><div class="specialist-card-topline">${cardSchedule(a)}</div><header class="assistant-card-header"><span class="assistant-icon h-11 w-11">${icon(a.glyph,'h-5 w-5')}</span><div class="specialist-card-heading text-base font-semibold"><h2 id="assistant-title-${a.id}" class="font-semibold"><span class="assistant-title">${esc(a.title)}</span></h2><span class="specialist-built-in text-xs">Built-in specialist</span></div>${badge(stateLabel(a),!a.enabled?'neutral':a.pending?'info':a.coverageGap?'warning':'success')}</header><p class="assistant-description text-xs">${esc(a.description)}</p><div class="specialist-source-list">${a.selectedSources.map(source).join('')}</div><div class="specialist-scope text-xs">${a.scope?`${icon('health')}${esc(a.scope)}`:!a.enabled?'Connected sources ready':a.pending?'Scope will appear after the first check':''}</div><div class="specialist-card-status">${items.length?`<strong class="text-sm font-semibold">${items.length} open ${items.length===1?'finding':'findings'}</strong><span class="text-xs">${needs?`${needs} to review`:'All acknowledged'}</span>`:a.enabled&&!a.pending&&a.last?`<strong class="text-sm font-medium">${icon('check')}No open findings</strong><span class="text-xs">From the latest available evidence</span>`:`<strong class="text-sm font-medium">${!a.enabled?'Not monitoring yet':a.pending?'Ready for the first check':'Not checked yet'}</strong><span class="text-xs">${!a.enabled?'Turn on to start proactive investigations.':a.cadence==='manual'?'Use Run Now on the assistant page.':'Findings will appear as evidence is collected.'}</span>`}</div>${a.enabled&&a.coverageGap?`<p class="specialist-coverage-note text-xs">${icon('alert')}${esc(a.coverage)}</p>`:''}<footer class="assistant-footer specialist-card-footer"><span class="specialist-check-time text-xs">${a.enabled?(a.last?`${icon('clock')}Checked ${a.last}`:'Awaiting first check'):'Off · Checks stopped'}</span><div class="specialist-card-actions">${powerToggle(a)}<button type="button" class="specialist-settings" data-specialist-action="configure" data-assistant-id="${a.id}" aria-label="Configure ${esc(a.title)}">${icon('settings')}</button><button type="button" class="specialist-open text-sm" data-specialist-action="open" data-assistant-id="${a.id}">View Assistant ${icon('arrow')}</button></div></footer></article>`;
  }
  function onboardingCard(a) {
    return `<article class="assistant-card specialist-intro-card p-4 rounded-lg" data-specialist-action="open" data-assistant-id="${a.id}" tabindex="0" role="link" aria-labelledby="assistant-title-${a.id}" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)"><span class="assistant-icon h-11 w-11">${icon(a.glyph,'h-5 w-5')}</span><div class="min-w-0 flex-1"><h2 id="assistant-title-${a.id}" class="text-sm font-semibold">${esc(a.title)}</h2><span class="specialist-intro-count text-xs">${capabilitySets[a.id].length} Capabilities</span></div><span class="specialist-intro-arrow shrink-0">${icon('arrow','h-4 w-4')}</span></article>`;
  }
  function overviewCard(a) {
    const items=owned(a),action='open';
    const state=!a.enabled?'disabled':a.pending?'pending':a.coverageGap?'gap':'watching';
    const outcome=items.length?`${items.length} open ${items.length===1?'finding':'findings'}`:!a.enabled?'Turn on to investigate':a.pending||!a.last?'Not checked yet':'No open findings';
    return `<article class="assistant-card p-4 specialist-mini-card" data-specialist-action="open" data-assistant-id="${a.id}" tabindex="0" role="link" aria-labelledby="assistant-title-${a.id}" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)"><span class="assistant-icon h-11 w-11">${icon(a.glyph,'h-5 w-5')}</span><div class="specialist-mini-copy text-sm font-semibold"><h2 id="assistant-title-${a.id}" class="font-semibold"><span class="assistant-title" title="${esc(a.title)}">${esc(a.title)}</span></h2><div class="specialist-mini-meta text-xs"><span class="specialist-mini-state" data-state="${state}"><span class="specialist-mini-dot" aria-hidden="true"></span>${esc(stateLabel(a))}</span><span class="specialist-mini-outcome">${esc(outcome)}</span></div></div><div class="specialist-mini-controls flex flex-col justify-end text-right ml-auto"><div class="specialist-card-topline" data-specialist-action="open" data-assistant-id="${a.id}">${cardSchedule(a)}</div>${powerToggle(a)}</div><button type="button" class="specialist-mini-open" data-specialist-action="${action}" data-assistant-id="${a.id}" aria-label="${action==='open'?'View':'Enable'} ${esc(a.title)}">${icon('arrow')}</button></article>`;
  }
  function assistantTable(items) {
    return `<div class="specialist-table-shell"><table class="specialist-table text-xs" aria-label="Assistants"><colgroup><col style="width:34%"><col style="width:14%"><col style="width:20%"><col style="width:22%"><col style="width:10%"></colgroup><thead><tr><th scope="col">Assistant</th><th scope="col">Status</th><th scope="col">Schedule</th><th scope="col">Findings</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>${items.map(a=>{
      const findings=owned(a),needs=waiting(findings).length,action='open';
      return `<tr data-specialist-action="${action}" data-assistant-id="${a.id}" tabindex="0"><td><div class="specialist-table-name" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)"><span class="assistant-icon h-11 w-11">${icon(a.glyph,'h-5 w-5')}</span><div class="specialist-table-copy text-sm font-semibold"><span class="assistant-title text-sm font-semibold" title="${esc(a.title)}">${esc(a.title)}</span><span class="specialist-check-time text-xs font-normal">${a.enabled?(a.last?`Checked ${a.last}`:'Awaiting first check'):'Off · Checks stopped'}</span></div></div></td><td><div class="specialist-table-state">${powerToggle(a)}</div></td><td>${cardSchedule(a)}</td><td><div class="specialist-table-findings"><span>${findings.length?`${findings.length} open`:!a.enabled?'Not monitoring':a.pending?'Awaiting first check':'No open findings'}</span>${findings.length?`<span class="specialist-check-time text-xs">${needs?`${needs} to review`:'All acknowledged'}</span>`:''}</div></td><td><div class="specialist-card-actions"><button type="button" class="specialist-settings" data-specialist-action="configure" data-assistant-id="${a.id}" aria-label="Configure ${esc(a.title)}" title="Configure">${icon('settings')}</button><button type="button" class="specialist-settings" data-specialist-action="${action}" data-assistant-id="${a.id}" aria-label="${action==='open'?'View':'Enable'} ${esc(a.title)}" title="${action==='open'?'View assistant':'Turn on to investigate'}">${icon('arrow')}</button></div></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  const findingHeadlines={
    'identity-signin':'7 Finance users face repeated sign-in failures',
    'identity-admin':'2 privileged accounts lack MFA registration evidence',
    'identity-inactive':'9 inactive accounts still have application access'
  };
  const findingEvidence={
    'identity-signin':'26 failed sign-ins; affected users increased from 4 to 7. Cause is not yet established.',
    'identity-admin':'No registration record was found in the collected evidence. Effective enforcement still needs verification.',
    'identity-inactive':'Application assignments remain, with no recent service activity recorded. Confirm whether access is still needed.'
  };
  function historyCard(f) { return findingRow(f,{history:true}); }
  function findingRow(f,options={}) {
    const a=assistants.find(a=>a.id===f.assistant),priority=options.priority===true;
    const headline=findingHeadlines[f.id]||f.title;
    const evidence=findingEvidence[f.id]||f.confirmed?.[0]||f.evidence;
    if(options.findingsTab)return `<button type="button" class="specialist-finding specialist-issue-row specialist-tab-finding p-4 rounded-lg" data-severity="${f.severity}" data-specialist-action="finding" data-finding-id="${f.id}"><span class="specialist-finding-icon" data-severity="${f.severity}">${icon('alert')}</span><span class="specialist-finding-copy"><span class="specialist-issue-top"><span class="specialist-finding-top text-xs">${lifecycleBadges(f)}<span class="border bg-gray-50 px-2 rounded-xl ml-2">${esc(a.title)}</span></span><span class="specialist-issue-time text-xs">${f.verification==='unavailable'?'Last Evidence '+esc(f.observed):'Checked '+esc(f.checked)}</span></span><strong class="text-sm font-semibold">${esc(headline)}</strong><span class="specialist-issue-evidence text-xs">${esc(evidence)}</span></span><span class="specialist-tab-finding-footer flex gap-4"><span class="specialist-issue-meta text-xs">${source(f.source)}<span aria-hidden="true">•</span><span class="inline-flex items-center gap-1">${icon('identity','h-3 w-3')}${esc(f.affected)}</span></span><span class="specialist-finding-arrow">${icon('arrow')}</span></span></button>`;

    return `<button type="button" class="specialist-finding specialist-issue-row ${options.list?'specialist-issue-list-row px-2 py-3 rounded-none':'p-4 rounded-lg'}${priority?' specialist-issue-priority':''}" data-severity="${f.severity}" data-specialist-action="finding" data-finding-id="${f.id}"${options.descriptionTooltip?` title="${esc(evidence)}"`:""}>${options.list?'':`<span class="specialist-finding-icon" data-severity="${f.severity}">${icon('alert')}</span>`}<span class="specialist-finding-copy"><span class="specialist-issue-top"><span class="specialist-finding-top text-xs">${priority?'<span class="specialist-priority-label font-medium">Top Priority</span>':''}${lifecycleBadges(f)}</span><span class="specialist-issue-time text-xs">${f.verification==='unavailable'?'Last evidence '+esc(f.observed):'Checked '+esc(f.checked)}</span></span><strong class="text-sm font-semibold">${esc(headline)}</strong>${options.descriptionTooltip?'':`<span class="specialist-issue-evidence text-xs">${esc(evidence)}</span>`}<span class="specialist-issue-meta text-xs">${options.descriptionTooltip?`${source(f.source)}<span aria-hidden="true">•</span><span class="inline-flex items-center gap-1">${icon('identity','h-3 w-3')}${esc(f.affected)}</span><span aria-hidden="true">•</span><span class="border bg-gray-50 px-2 rounded-xl">${esc(a.title)}</span>`:`<span class="inline-flex items-center gap-1">${icon('identity','h-3 w-3')}${esc(f.affected)}</span><span aria-hidden="true">•</span>${source(f.source)}<span aria-hidden="true">•</span><span>${esc(a.title)}</span>`}</span>${options.history===true?`<span class="specialist-history-events text-xs">${f.history.map(event=>`<span>${esc(event)}</span>`).join('')}</span>`:''}</span><span class="specialist-finding-arrow">${icon('arrow')}</span></button>`;
  }
  function suggestionCard(f) {
    const copy=suggestionCopy[f.id];
    return `<article class="specialist-suggestion p-4" aria-labelledby="suggestion-title-${f.id}"><div class="specialist-suggestion-heading"><h3 id="suggestion-title-${f.id}" class="text-sm font-semibold">${esc(copy.title)}</h3>${badge(f.severity,f.severity==='critical'?'danger':f.severity==='high'?'warning':'info')}</div><p class="text-xs">${esc(copy.reason)}</p><div class="specialist-suggestion-actions text-xs"><button type="button" class="specialist-suggestion-review" data-specialist-action="suggestion" data-finding-id="${f.id}" aria-label="Review ${esc(copy.title)}">${icon('arrow','h-3 w-3')}Review action</button><button type="button" class="specialist-suggestion-dismiss" data-specialist-action="dismiss-suggestion" data-finding-id="${f.id}" aria-label="Dismiss suggestion: ${esc(copy.title)}">${icon('close','h-3 w-3')}Dismiss</button></div></article>`;
  }
  function indexRecentRuns(expanded=false) {
    const latest=assistants.filter(a=>a.last).map(a=>({assistant:a,time:a.last,minutes:elapsedMinutes(a.last),count:owned(a).length})).sort((a,b)=>a.minutes-b.minutes);
    const runs=[...latest,...latest.filter(run=>run.assistant.enabled).map(run=>({...run,time:'Yesterday, 8:00 AM',error:run.assistant.id===2?'Could not access Intune. The run stopped before completing the investigation.':null}))];
    if(expanded)for(let day=2;day<8;day++)for(const run of latest.filter(run=>run.assistant.enabled))runs.push({...run,time:`${day} Days Ago, 8:00 AM`});
    const shown=expanded?runs:runs.slice(0,5);
    return `<header class="specialist-section-heading"><h2 ${expanded?'id="assistant-dialog-title"':''} class="text-sm font-medium">Recent Runs</h2>${expanded?'':'<button type="button" class="a-text" data-specialist-action="all-runs">View All</button>'}</header><div class="${expanded?'specialist-runs-scroll':''}"><ul class="specialist-index-runs">${assistants.filter(a=>a.running).map(a=>`<li><span class="specialist-index-run-icon" data-run-state="running">${icon('clock','h-3 w-3')}</span><span class="specialist-index-run-copy"><strong class="text-xs font-medium">${esc(a.title)}</strong><span class="text-xs">Running Now</span></span>${badge('In Progress','info')}</li>`).join('')}${shown.map(run=>`<li><span class="specialist-index-run-icon" data-run-state="${run.error?'error':'complete'}">${icon(run.error?'alert':'check','h-3 w-3')}</span><span class="specialist-index-run-copy"><strong class="text-xs font-medium">${esc(run.assistant.title)}</strong><span class="text-xs">${esc(run.time)}</span></span>${run.error?`<span class="specialist-index-run-error text-xs" tabindex="0" title="${esc(run.error)}">Error</span>`:`<span class="specialist-index-run-count text-xs">${run.count} ${run.count===1?'Finding':'Findings'}</span>`}</li>`).join('')}${!shown.length?'<li class="text-xs">No Recent Runs</li>':''}</ul></div>`;
  }
  function renderAttention() {
    if(isOnboarding)return;
    const attention=waiting(findings).filter(f=>['New','Worsened','Resurfaced'].includes(f.change)||f.severity==='critical').sort((a,b)=>rank[b.severity]-rank[a.severity]||Number(b.change==='Worsened')-Number(a.change==='Worsened'));
    $('#assistant-attention').hidden=view!=='overview';
    $('#assistant-attention-list').innerHTML=attention.length?attention.map(f=>findingRow(f,{descriptionTooltip:true})).join(''):'<div class="specialist-caught-up text-sm">No new, worsening, or urgent conditions to review. Ongoing findings remain available in Stream.</div>';
  }
  function render() {
    saveSession();
    if(isShow){showPage.render();return;}
    renderAttention();
    const enabled=assistants.filter(a=>a.enabled),unreviewed=waiting(findings),changed=unreviewed.filter(f=>['New','Worsened','Resurfaced'].includes(f.change)),items=filtered();
    if(!isOnboarding){
    $('#assistant-summary').innerHTML=`<div class="specialist-summary-intro"><span class="specialist-eyebrow text-xs">PROACTIVE BY DESIGN</span><h2 class="text-xl font-semibold">Specialists that discover what needs your attention.</h2><p class="text-sm">Enable a focused role, connect its evidence, and let Ivy investigate changes over time.</p></div><div class="specialist-summary-stats">${[[`${enabled.length} of 5`,'Enabled'],[unreviewed.length,'To review'],[changed.length,'New or worsened'],[assistants.filter(a=>a.enabled&&a.coverageGap).length,'Coverage gaps']].map(([value,label])=>`<div><strong class="text-2xl font-semibold">${value}</strong><span class="text-xs">${label}</span></div>`).join('')}</div>`;
    $('#assistant-recent-runs').innerHTML=indexRecentRuns();
    }
    $('#assistant-grid').innerHTML=layout==='list'?(items.length?assistantTable(items):''):items.map(isOnboarding?onboardingCard:view==='overview'?overviewCard:card).join('');
    $('#assistant-grid').dataset.layout=layout;
    if(!isOnboarding){$('#assistant-summary').hidden=view!=='overview';$('#assistant-recent-runs').hidden=view==='history';}
    $('#assistant-layout').hidden=view==='history';
    $('#assistant-catalog').hidden=isOnboardingPreview||view==='stream'||view==='history';
    if(!isOnboarding){
    $('#assistant-status-filter-wrap').hidden=view!=='all';
    $('#assistant-status-filter').value=availability;
    }
    $('#assistant-stream').hidden=view!=='stream';
    $('#assistant-layout').classList.toggle('specialist-overview-layout',view==='overview');
    $('#assistant-history').hidden=view!=='history';
    if(!isOnboarding)$('#assistant-catalog-title').textContent='Assistants';
    const queryText=searchText().toLowerCase();
    const history=findings.filter(f=>`${f.title} ${assistants.find(a=>a.id===f.assistant).title} ${f.source} ${f.history.join(' ')}`.toLowerCase().includes(queryText));
    $('#assistant-history-list').innerHTML=history.map(historyCard).join('');
    $('#assistant-history-empty').hidden=history.length>0;
    const stream=findings.filter(matchesFindingState).filter(f=>`${f.title} ${assistants.find(a=>a.id===f.assistant).title} ${f.source} ${f.evidence}`.toLowerCase().includes(queryText)).sort((a,b)=>elapsedMinutes(a.checked)-elapsedMinutes(b.checked)||rank[b.severity]-rank[a.severity]);
    $('#assistant-stream-list').innerHTML=stream.map(f=>findingRow(f,{findingsTab:true})).join('');
    $('#assistant-stream-empty').hidden=stream.length>0;
    $('#assistant-stream-count').textContent=`showing ${stream.length} of ${findings.length} findings`;
    document.querySelectorAll('[data-specialist-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.specialistLayout===layout)));
    $('#assistant-empty').hidden=items.length>0;
    if(!isOnboarding)$('#assistant-count').textContent=`showing ${items.length} of 5`;
    if(!isOnboarding){const query=searchText();$('#assistant-search-submit').disabled=!query;$('#clear-filters').hidden=!query;}
    if(!isOnboarding)$('#assistant-panel').setAttribute('aria-labelledby','tab-'+view);
    document.querySelectorAll('[data-specialist-view]').forEach(button=>{const name=button.dataset.specialistView;button.setAttribute('aria-selected',String(name===view));button.tabIndex=name===view?0:-1;const count=button.querySelector('span');if(count&&name==='all')count.textContent=assistants.length;});
  }
  function toast(text) {clearTimeout(toastTimer);$('#assistant-toast').textContent=text;$('#assistant-toast').hidden=false;toastTimer=setTimeout(()=>$('#assistant-toast').hidden=true,4000);}
  function openDialog(body,drawer=false,tour=false) {if(dialog.open)dialog.close();dialog.classList.toggle('assistant-config-drawer',drawer);dialog.classList.toggle('assistant-tour',tour);dialog.removeAttribute('aria-describedby');dialog.innerHTML=`<button type="button" class="assistant-dialog-close" data-specialist-action="close" aria-label="Close dialog">${icon('close','h-5 w-5')}</button>${body}`;dialog.showModal();}
  function allFindings() {openDialog(`<h2 id="assistant-dialog-title">Assistant findings</h2><p class="text-sm">Repeated checks refresh an ongoing finding. A return after verified resolution creates a new linked occurrence.</p><div class="specialist-dialog-findings">${findings.slice().sort((a,b)=>rank[b.severity]-rank[a.severity]).map(findingRow).join('')}</div>`);}
  function openAssistant(a) {
    saveSession();window.location.href=(isOnboarding?'assistant-show-off.html':'assistant-show.html')+'?id='+a.id;
  }
  function openSuggestion(f) {
    const copy=suggestionCopy[f.id];if(!copy?.ready||f.condition==='resolved')return;
    const a=assistants.find(a=>a.id===f.assistant);
    openDialog(`<span class="specialist-eyebrow text-xs">SUGGESTED ACTION</span><h2 id="assistant-dialog-title">${esc(copy.title)}</h2><p class="text-xs">From ${esc(a.title)}</p><h3 class="text-sm font-semibold">Why this is worth doing</h3><p class="text-sm">${esc(copy.reason)}</p><div class="specialist-next-step"><span class="text-xs">Proposed next step</span><p class="text-sm">${esc(copy.step)}</p></div><h3 class="text-sm font-semibold">Supporting evidence</h3><p class="text-sm">${esc(f.evidence)}</p><div class="specialist-source-list">${(f.supportingSources||[f.source]).map(source).join('')}</div><p class="text-xs">Reviewing this recommendation does not change connected systems. It remains available after the finding is acknowledged, until dismissed or the condition is verified resolved.</p><div class="assistant-dialog-actions"><button type="button" class="a-primary" data-specialist-action="finding" data-finding-id="${f.id}">View underlying finding</button><button type="button" class="a-secondary" data-specialist-action="dismiss-suggestion" data-finding-id="${f.id}">Dismiss suggestion</button></div>`);
  }
  function openFinding(f) {
    const a=assistants.find(a=>a.id===f.assistant),resolved=f.condition==='resolved',related=findings.find(item=>item.id===f.related);
    const list=items=>`<ul class="specialist-checks text-sm">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
    openDialog(`<div class="specialist-finding-top">${lifecycleBadges(f)}</div><p class="text-xs">${esc(f.reference)} · Sample evidence</p><h2 id="assistant-dialog-title">${esc(f.title)}</h2><p class="text-sm">${esc(a.title)} · ${esc(f.affected)}</p><dl class="specialist-evidence text-xs"><dt>Condition</dt><dd>${resolved?'Verified resolved':'Open'}</dd><dt>Latest change</dt><dd>${esc(f.change)}</dd><dt>Review status</dt><dd>${resolved?'Not required — occurrence closed':f.acknowledged?'Acknowledged':'Needs review'}</dd><dt>First observed</dt><dd>${esc(f.first)}</dd><dt>Last check</dt><dd>${esc(f.checked)}</dd><dt>Source evidence</dt><dd>${esc(f.observed)}</dd><dt>Evidence freshness</dt><dd>${f.freshness==='stale'?'Stale — current device state unverified':'Fresh at the latest evaluation'}</dd>${resolved?`<dt>Resolution verified</dt><dd>${esc(f.resolvedAt)}</dd>`:''}</dl>${f.verification==='unavailable'?'<div class="specialist-verification-note text-sm">Current state cannot be verified. The last known condition remains open; missing evidence does not establish resolution.</div>':''}${resolved?`<div class="specialist-resolution-note text-sm"><strong class="font-semibold">Why this occurrence is closed</strong><p class="text-sm">${esc(f.resolution)}</p></div>`:''}<h3 class="text-sm font-semibold">Evidence</h3><p class="text-sm">${esc(f.evidence)}</p><div class="specialist-source-list">${(f.supportingSources||[f.source]).map(source).join('')}</div><div class="specialist-assessment"><section><h3 class="text-sm font-semibold">Confirmed by evidence</h3>${list(f.confirmed)}</section><section><h3 class="text-sm font-semibold">Still uncertain</h3>${f.unknowns.length?list(f.unknowns):'<p class="text-sm">No unresolved questions about the closure of this occurrence.</p>'}</section></div>${f.hypotheses.length?`<section class="specialist-hypothesis"><h3 class="text-sm font-semibold">Supported hypotheses · not confirmed causes</h3>${list(f.hypotheses)}</section>`:''}<details class="specialist-affected" open><summary class="text-sm font-semibold">Affected objects · ${f.objects.length}</summary><div class="specialist-object-scroll"><table class="specialist-objects text-xs" aria-label="Affected objects for ${esc(f.reference)}"><thead><tr><th scope="col">Object</th><th scope="col">Type</th><th scope="col">Source record ID</th></tr></thead><tbody>${f.objects.map(([name,type,id])=>`<tr><td>${esc(name)}</td><td>${esc(type)}</td><td>${esc(id)}</td></tr>`).join('')}</tbody></table></div></details><h3 class="text-sm font-semibold">Occurrence history</h3>${list(f.history)}${related?`<div class="specialist-related"><p class="text-xs">${resolved?'This occurrence stays closed. A later recurrence has its own evidence and review status.':'New occurrence of a known condition. The earlier occurrence remains verified resolved.'}</p><button type="button" class="a-secondary" data-specialist-action="finding" data-finding-id="${related.id}">${resolved?'View new occurrence':'View previous occurrence'} · ${esc(related.reference)}</button></div>`:''}${f.next?`<div class="specialist-next-step"><span class="text-xs">Recommended next step</span><p class="text-sm">${esc(f.next)}</p></div>`:''}<p class="text-xs">${resolved?'Resolution is based on source evidence, not acknowledgment.':'Acknowledging marks this finding as reviewed. It does not resolve the condition or dismiss a suggested action.'}</p><div class="assistant-dialog-actions">${!resolved?`<button type="button" class="a-primary" data-specialist-action="acknowledge" data-finding-id="${f.id}">${f.acknowledged?'Mark as unreviewed':'Acknowledge'}</button>`:''}<button type="button" class="a-secondary" data-specialist-action="open" data-assistant-id="${a.id}">Back to assistant</button></div>`);
  }
  function configure(a,turnOn=false) {
    const activating=turnOn&&!a.enabled;
    openDialog(`<header class="assistant-config-heading flex items-start gap-3 pb-4 mb-4"><img src="assistant-creation/src/assets/nav-settings.svg" class="h-5 w-5 mt-1" alt=""/><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-5"><div><h2 id="assistant-dialog-title" class="text-base font-semibold m-0">Configure Assistant</h2><p class="text-sm">Sources, capabilities, and schedule for ${esc(a.title)}.</p></div><label class="assistant-config-power rounded-full" style="margin-right: -2.25rem; margin-top: 0.25rem;"><span class="text-xs font-medium" data-config-power-label>${a.enabled||activating?'On':'Off'}</span><span class="assistant-capability-switch"><input type="checkbox" role="switch" aria-label="Assistant Enabled" name="enabled" form="assistant-configuration" ${a.enabled||activating?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></label></div></div></header><nav class="assistants-tabs assistant-config-tabs mb-5" role="tablist" aria-label="Assistant Configuration"><button type="button" role="tab" id="assistant-config-tab-settings" data-config-tab="settings" aria-controls="assistant-config-settings" aria-selected="true" tabindex="0">Settings</button><button type="button" role="tab" id="assistant-config-tab-schedule" data-config-tab="schedule" aria-controls="assistant-config-schedule" aria-selected="false" tabindex="-1">Schedule</button></nav><form id="assistant-configuration" class="text-sm"><div class="assistant-config-fields"><section id="assistant-config-settings" role="tabpanel" aria-labelledby="assistant-config-tab-settings"><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Sources Used by This Assistant</legend><p class="assistant-source-help text-xs">Choose which connected sources this assistant can investigate.</p>${a.sources.map((name,i)=>{const connected=sourceIsConnected(name),state=!connected?'setup':name==='Microsoft 365'?'syncing':'synced',inputId=`assistant-source-${a.id}-${i}`;return `<div class="assistant-source-option" data-source-state="${state}"><label for="${inputId}" class="assistant-source-copy"><span class="assistant-source-identity flex">${source(name,'source-card')}</span><span class="assistant-source-connection text-xs">${!connected?'Not Connected':state==='syncing'?'Syncing...':'Synced'}</span></label><div class="flex items-center gap-3">${!connected?`<a href="#" class="assistant-source-setup text-xs" data-specialist-action="source-setup" data-source-name="${esc(name)}">Set up ${icon('arrow','h-3 w-3')}</a>`:''}<span class="assistant-capability-switch"><input id="${inputId}" type="checkbox" role="switch" aria-label="Use ${esc(name)} for ${esc(a.title)}" name="source" value="${esc(name)}" ${!connected?'disabled':a.selectedSources.includes(name)?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></div></div>`;}).join('')}</fieldset><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Capabilities</legend>${capabilitySets[a.id].map(([title,description],i)=>`<label class="assistant-capability-option text-sm"><span><span class="font-medium">${esc(title)}</span><span class="text-xs">${esc(description)}</span></span><span class="assistant-capability-switch"><input type="checkbox" role="switch" aria-label="${esc(title)}" name="capability" value="${i}" ${a.selectedCapabilities.includes(i)?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></label>`).join('')}</fieldset><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Notifications</legend><label class="assistant-capability-option text-sm"><span class="font-medium">Notify Me About New or Worsening Findings</span><span class="assistant-capability-switch"><input type="checkbox" role="switch" name="notify" aria-label="Notify Me About New or Worsening Findings" ${a.notify?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></label><fieldset class="assistant-notification-channels border px-4 py-0 rounded-lg" ${a.notify?'':'disabled'}><legend class="text-xs font-normal">Notify Me Via...</legend>${[['in-app','In-App Alerts'],['email','Email']].map(([value,label])=>`<label class="specialist-notifications text-sm"><input type="checkbox" name="notifyChannel" value="${value}" ${a.notifyChannels.includes(value)?'checked':''}/>${label}</label>`).join('')}</fieldset></fieldset></section><section id="assistant-config-schedule" role="tabpanel" aria-labelledby="assistant-config-tab-schedule" hidden><div class="assistant-config-schedule bg-gray-100 p-4 rounded-lg"><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Schedule</legend><label class="text-sm">Schedule or Trigger<select name="cadence" id="assistant-cadence">${Object.entries(cadenceLabels).map(([key,label])=>`<option value="${key}" ${a.cadence===key?'selected':''}>${label}</option>`).join('')}</select></label><div id="assistant-schedule-fields" ${a.cadence==='manual'?'hidden':''}><div class="specialist-schedule-fields"><label class="text-sm">Start Time<input type="time" name="startTime" value="${a.startTime}"/></label><label class="text-sm">Time Zone<select name="timeZone">${Object.entries(timeZones).map(([key,label])=>`<option value="${key}" ${a.timeZone===key?'selected':''}>${label}</option>`).join('')}</select></label></div><label class="text-sm" id="assistant-weekly-day" ${a.cadence==='weekly'?'':'hidden'}>Day<select name="day">${weekdays.map(day=>`<option ${a.day===day?'selected':''}>${day}</option>`).join('')}</select></label><p id="assistant-schedule-note" class="text-xs">${a.cadence==='twice'?'Checks start at this time and repeat every 12 hours.':'Checks use the selected local time and time zone.'}</p></div><p id="assistant-manual-help" class="text-xs" ${a.cadence==='manual'?'':'hidden'}>No automatic checks. Use Run Now on the assistant page whenever you need an investigation.</p><p class="text-xs">Turning off stops future checks. Existing findings and history stay available.</p></fieldset></div></section><p id="assistant-config-error" class="specialist-form-error text-xs" role="alert"></p></div><div class="assistant-dialog-actions justify-end"><button type="button" class="a-secondary" data-specialist-action="cancel-config">Cancel</button><button type="submit" class="a-primary">${activating?'Turn On Assistant':'Save Config'}</button></div></form>`,true);
  }
  let assistantTour;
  function about() {
    assistantTour??=window.IvyAssistantTour.create({dialog,esc,icon,openDialog,onFinish(){if(!isShow){if(!isOnboarding)view='all';render();$(isOnboardingPreview?'#assistant-preview-heading':isOnboarding?'#assistant-grid':'#tab-all').focus();}}});
    assistantTour.open();
  }
  function handleClick(event) {
    const button=event.target.closest('[data-specialist-action]');if(!button)return;
    const action=button.dataset.specialistAction;
    if(assistantTour?.handle(action,button))return;
    if(action==='close'){dialog.close();return;}
    if(action==='source-setup'){event.preventDefault();toast(`Connect ${button.dataset.sourceName} from Sources to use it with this assistant.`);return;}
    if(action==='about'){about();return;}
    if(action==='all-findings'){allFindings();return;}
    if(action==='all-runs'){openDialog(indexRecentRuns(true));return;}
    if(action==='undo-suggestion'){dismissedSuggestions.pop();saveSession();renderAttention();return;}
    if(action==='cancel-config'){dialog.close();return;}
    const f=findings.find(f=>f.id===button.dataset.findingId),a=assistants.find(a=>a.id===Number(button.dataset.assistantId));
    if(action==='dismiss-suggestion'&&f&&suggestionCopy[f.id]?.ready){if(!dismissedSuggestions.includes(f.id))dismissedSuggestions.push(f.id);if(dialog.open)dialog.close();saveSession();if(!isShow)renderAttention();toast('Suggestion dismissed. The finding remains open.');return;}
    if(action==='suggestion'&&f)openSuggestion(f);
    if(action==='finding'&&f)openFinding(f);
    if(action==='open'&&a)openAssistant(a);
    if(action==='configure'&&a){dialog.dataset.assistantId=String(a.id);configure(a);}
    if(action==='toggle-power'&&a){if(a.enabled)stopAssistant(a);else{dialog.dataset.assistantId=String(a.id);configure(a,true);}}
    if(action==='run-now'&&a)runNow(a);
    if(action==='enable-assistant'&&a){dialog.dataset.assistantId=String(a.id);configure({...a,enabled:false},true);}
    if(action==='acknowledge'&&f&&f.condition!=='resolved'){f.acknowledged=!f.acknowledged;render();openFinding(f);toast(f.acknowledged?'Finding acknowledged. Its condition remains open.':'Finding marked as unreviewed.');}
  }
  $('.assistants-content').addEventListener('click',handleClick);dialog.addEventListener('click',handleClick);
  $('.assistants-content').addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('.assistant-card[data-specialist-action="open"],tr[data-specialist-action="open"]')){event.preventDefault();handleClick(event);}});
  dialog.addEventListener('click',event=>{
    if((!dialog.classList.contains('assistant-config-drawer')&&!dialog.classList.contains('assistant-tour'))||event.target!==dialog)return;
    const bounds=dialog.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  });
  function selectConfigTab(name,focus=false) {
    dialog.querySelectorAll('[data-config-tab]').forEach(button=>{const selected=button.dataset.configTab===name;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;if(selected&&focus)button.focus();});
    dialog.querySelectorAll('[role="tabpanel"]').forEach(panel=>panel.hidden=panel.id!=='assistant-config-'+name);
    dialog.querySelector('.assistant-config-fields').scrollTop=0;
  }
  dialog.addEventListener('click',event=>{const button=event.target.closest('[data-config-tab]');if(button)selectConfigTab(button.dataset.configTab);});
  dialog.addEventListener('keydown',event=>{
    const button=event.target.closest('[data-config-tab]');if(!button)return;
    let name;if(event.key==='ArrowRight'||event.key==='ArrowLeft')name=button.dataset.configTab==='settings'?'schedule':'settings';if(event.key==='Home')name='settings';if(event.key==='End')name='schedule';
    if(name){event.preventDefault();selectConfigTab(name,true);}
  });
  dialog.addEventListener('submit',event=>{
    if(event.target.id!=='assistant-configuration')return;
    event.preventDefault();const a=assistants.find(a=>a.id===Number(dialog.dataset.assistantId));if(!a)return;
    const form=new FormData(event.target),enabled=form.has('enabled'),sources=form.getAll('source').filter(name=>a.sources.includes(name)&&sourceIsConnected(name));
    if(enabled&&!sources.length){$('#assistant-config-error').textContent='Select at least one connected source.';return;}
    const cadence=form.get('cadence');
    if(!Object.hasOwn(cadenceLabels,cadence)){$('#assistant-config-error').textContent='Choose a schedule or on-demand trigger.';return;}
    const startTime=form.get('startTime'),timeZone=form.get('timeZone'),day=form.get('day');
    if(enabled&&cadence!=='manual'&&(!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)||!Object.hasOwn(timeZones,timeZone)||cadence==='weekly'&&!weekdays.includes(day))){$('#assistant-config-error').textContent='Choose a valid time, time zone, and day for the schedule.';return;}
    const newlyEnabled=enabled&&!a.enabled;
    a.enabled=enabled;a.selectedSources=sources;a.selectedCapabilities=form.getAll('capability').map(Number);a.cadence=cadence;a.notify=form.has('notify');a.notifyChannels=[...event.target.querySelectorAll('[name="notifyChannel"]:checked')].map(input=>input.value);
    if(/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime))a.startTime=startTime;
    if(Object.hasOwn(timeZones,timeZone))a.timeZone=timeZone;
    if(weekdays.includes(day))a.day=day;
    a.pending=enabled&&cadence!=='manual'&&!a.last;
    if(!enabled){clearTimeout(runTimers.get(a.id));runTimers.delete(a.id);a.running=false;}
    dialog.close();if(enabled&&document.body?.dataset.assistantVariant==='off'){openAssistant(a);return;}render();toast(!enabled?'Assistant is off. Findings and history kept.':newlyEnabled?`Assistant turned on · ${scheduleLabel(a)}`:'Assistant settings updated in this preview.');
  });
  dialog.addEventListener('change',event=>{
    if(event.target.name==='enabled'){dialog.querySelector('[data-config-power-label]').textContent=event.target.checked?'On':'Off';return;}
    if(event.target.name==='notify'){dialog.querySelector('.assistant-notification-channels').disabled=!event.target.checked;return;}
    if(event.target.id!=='assistant-cadence')return;
    const cadence=event.target.value;
    $('#assistant-schedule-fields').hidden=cadence==='manual';$('#assistant-manual-help').hidden=cadence!=='manual';$('#assistant-weekly-day').hidden=cadence!=='weekly';
    $('#assistant-schedule-note').textContent=cadence==='twice'?'Checks start at this time and repeat every 12 hours.':'Checks use the selected local time and time zone.';
  });
  if(!isShow){
  document.querySelectorAll('[data-specialist-view]').forEach(button=>{
    button.addEventListener('click',()=>{view=button.dataset.specialistView;render();});
    button.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[data-specialist-view]')],index=tabs.indexOf(button);let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();view=tabs[next].dataset.specialistView;render();tabs[next].focus();}});
  });
  document.querySelectorAll('[data-specialist-layout]').forEach(button=>button.addEventListener('click',()=>{layout=button.dataset.specialistLayout;render();}));
  document.querySelectorAll('[data-specialist-icon]').forEach(element=>element.innerHTML=icon(element.dataset.specialistIcon));
  $('#assistant-finding-state').addEventListener('change',event=>{findingState=event.target.value;render();});
  if(!isOnboarding)$('#assistant-status-filter').addEventListener('change',event=>{availability=['all','enabled','disabled'].includes(event.target.value)?event.target.value:'all';render();});
  if(!isOnboarding){$('#assistant-search').addEventListener('input',render);$('#assistant-search-form').addEventListener('submit',event=>{event.preventDefault();render();});}
  function clearSearch() {if(!isOnboarding)$('#assistant-search').value='';render();}
  if(!isOnboarding)$('#clear-filters').addEventListener('click',clearSearch);$('#empty-clear').addEventListener('click',clearSearch);
  } else {
    showPage=window.IvyAssistantShow.create({assistants,findings,owned,waiting,esc,icon,source,badge,stateLabel,cadenceLabels,scheduleLabel,powerToggle,findingRow,historyCard,openDialog});
  }
  render();
})();
