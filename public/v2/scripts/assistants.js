/* The five built-in, read-only operational specialists. Changes stay in this mock session. */
(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const isShow=document.body?.dataset.assistantPage==='show';
  const isOnboarding=document.body?.dataset.assistantVariant==='onboarding';
  const isOnboardingPreview=isOnboarding&&document.body.dataset.assistantPreview==='no-sources';
  const hasOnboardingCardLinks=isOnboarding&&document.body.hasAttribute('data-assistant-card-links');
  const hasOnboardingCardTooltips=hasOnboardingCardLinks&&document.body.dataset.assistantCardLinks==='tooltips';
  let previewAssistantCards=false;
  let historyPage=1,historyQuery='';
  let summarySlide=0,summaryAnimating=false,summaryChartObserver;
  const historyPageSize=10;
  let showPage;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const paths={
    assistants:'<path fill-rule="evenodd" clip-rule="evenodd" d="M15.375 9.99805C18.3435 9.99813 20.75 12.4046 20.75 15.373C20.75 18.3415 18.3435 20.748 15.375 20.748C12.4065 20.748 10 18.3416 10 15.373C10 12.4045 12.4065 9.99805 15.375 9.99805ZM15.375 11.498C13.2349 11.498 11.5 13.2329 11.5 15.373C11.5 17.5132 13.2349 19.248 15.375 19.248C17.515 19.248 19.25 17.5131 19.25 15.373C19.25 13.233 17.515 11.4981 15.375 11.498Z" fill="currentColor"></path><path d="M11.75 3.24805C12.9926 3.24813 14 4.25546 14 5.49805V8.63574C13.476 8.74212 12.9734 8.90778 12.5 9.12598V5.49805C12.5 5.08389 12.1641 4.74813 11.75 4.74805H5.5C5.08579 4.74805 4.75 5.08383 4.75 5.49805V11.748C4.75 12.1623 5.08579 12.498 5.5 12.498H9.12793C8.9097 12.9714 8.74408 13.474 8.6377 13.998H5.5C4.25736 13.998 3.25 12.9907 3.25 11.748V5.49805C3.25 4.25541 4.25736 3.24805 5.5 3.24805H11.75Z" fill="currentColor"></path><path d="M18.875 2.94531C19.289 2.94553 19.625 3.28123 19.625 3.69531C19.6252 4.48201 20.2631 5.11991 21.0498 5.12012C21.4638 5.12033 21.7998 5.45604 21.7998 5.87012C21.7997 6.28411 21.4638 6.6199 21.0498 6.62012C20.263 6.62033 19.625 7.25805 19.625 8.04492C19.625 8.459 19.289 8.79471 18.875 8.79492C18.4609 8.79482 18.125 8.45907 18.125 8.04492C18.125 7.25805 17.487 6.62033 16.7002 6.62012C16.286 6.62012 15.9503 6.28424 15.9502 5.87012C15.9502 5.4559 16.286 5.12012 16.7002 5.12012C17.4869 5.1199 18.1248 4.48201 18.125 3.69531C18.125 3.28116 18.4609 2.94542 18.875 2.94531Z" fill="currentColor"></path>',
    chartBars:'<rect x="3" y="10" width="4" height="11" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="17" y="14" width="4" height="7" rx="1"/>',
    play:'<path d="M7 3.5a1 1 0 0 1 1.5-.86l12 8.5a1 1 0 0 1 0 1.72l-12 8.5A1 1 0 0 1 7 20.5Z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2h14ZM20 21v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    star:'<path d="m12 3 2.8 5.7 6.3.9-4.55 4.45 1.07 6.28L12 17.36l-5.62 2.97 1.07-6.28L2.9 9.6l6.3-.9Z"/>',
    arrowUp:'<path d="M12 20V4m-5 5 5-5 5 5"/>',
    sparkles:'<path d="m9 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2ZM19 3v4M17 5h4M19 15v6M16 18h6"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    identity:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2M16 3l4 1v4"/>',
    health:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8M12 17v5M5 10h3l2-4 4 8 2-4h3"/>',
    security:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6ZM8 11l3 3 5-6"/>',
    network:'<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="1" y="16" width="8" height="6" rx="1"/><rect x="15" y="16" width="8" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    licensing:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="m14 18 3 3 5-7"/>',
    question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    alert:'<path d="m12 3 10 18H2ZM12 9v5M12 17h.01"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    eye:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    arrowLeft:'<path d="M20 12H4m6-6-6 6 6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>'
  };
  const icon=(name,classes='h-4 w-4')=>`<svg class="${classes}${name==='assistants'?' ivy-assistants-icon shrink-0':''}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.alert}</svg>`;
  const sourceAssets={
    'Entra ID':'assistant-creation/src/assets/integrations/entra-id.png',
    'Microsoft 365':'components/assets/microsoft-365.png',Intune:'components/assets/intune.svg',Sophos:'components/assets/sophos.png',
    'Kaseya VSA':'assistant-creation/src/assets/integrations/kaseya-vsa.png',
    'Cisco Meraki':'assistant-creation/src/assets/integrations/cisco-meraki.png',
    'Cisco Umbrella':'assistant-creation/src/assets/integrations/cisco-umbrella.png'
  };
  const sourceIsConnected=name=>name!=='Intune';
  const source=(name,...options)=>{
    const large=options[0]==='source-card',iconOnly=options[0]==='icon-only';
    return `<span class="specialist-source text-xs"${iconOnly?` title="${esc(name)}"`:''}><img class="${large?'h-5 w-5':'h-4 w-4'}" src="${sourceAssets[name]}" width="${large?20:16}" height="${large?20:16}" alt="${iconOnly?esc(name):''}"/>${iconOnly?'':esc(name)}</span>`;
  };
  const cadenceLabels={daily:'Daily',weekdays:'Weekdays',twice:'Every 12 hours',weekly:'Weekly',manual:'On demand only'};
  const timeZones={'America/Los_Angeles':'Pacific Time','America/New_York':'Eastern Time','Europe/London':'London Time',UTC:'UTC'};
  const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const runTimers=new Map();
  const capabilitySets=window.IvyAssistantCapabilities;
  const assistants=[
    {id:1,title:'Identity & Access',glyph:'identity',family:'purple',enabled:true,scope:'312 identities',last:'15m ago',sources:['Entra ID','Microsoft 365','Intune'],description:'Investigates sign-in failures, access restrictions, and identity changes across users, devices, and applications.',checks:['Authentication failures and recurring access issues','Privileged access and identity changes','Device and application context behind access problems'],coverage:'Identity records are matched across the three connected sources.'},
    {id:2,title:'Endpoint Health',glyph:'health',family:'blue',enabled:true,scope:'148 devices',last:'35m ago',sources:['Intune','Kaseya VSA'],description:'Investigates device reliability, performance, patching, and management problems before they interrupt users.',checks:['Device reliability and performance patterns','Patching and deployment failures','Management check-ins and compliance evidence'],coverage:'12 devices lack recent check-in evidence. Their current health cannot be verified.',coverageGap:true},
    {id:3,title:'Endpoint Security',glyph:'security',family:'orange',enabled:false,scope:'148 devices',last:'10m ago',sources:['Sophos','Intune'],description:'Investigates endpoint threats, protection health, encryption, and security-control failures using source evidence.',checks:['Threat detections and protection-agent health','Reported encryption and security-control state','Changes in protection coverage across devices'],coverage:'Sophos protection records are linked to the Intune device inventory.'},
    {id:4,title:'Network Health',glyph:'network',family:'teal',enabled:true,pending:true,scope:'5 sites · 18 devices',last:null,sources:['Cisco Meraki','Cisco Umbrella'],description:'Investigates connectivity, infrastructure health, performance, and recurring network problems across your sites.',checks:['Offline devices and recurring connectivity failures','Infrastructure health and performance changes','DNS blocks and network-policy context'],coverage:'Five sites have recent network and DNS evidence.'},
    {id:5,title:'Application & Licensing',glyph:'licensing',family:'cyan',enabled:false,scope:null,last:null,sources:['Microsoft 365','Entra ID'],description:'Investigates application access, provisioning, and license usage to surface entitlement gaps and potential inefficiencies.',checks:['Application access and entitlement gaps','Provisioning and license-assignment problems','Usage evidence and potential licensing inefficiencies'],coverage:'Connected Microsoft 365 and Entra ID sources are ready to use.'}
  ].map(item=>({...item,cadence:'daily',selectedCapabilities:[0,1,2,3,4],selectedSources:[...item.sources],notify:true,notifyChannels:['in-app'],pending:item.pending??false,startTime:'08:00',timeZone:'America/Los_Angeles',day:'Monday',running:false}));
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
    'health-checkin':{reference:'F-1005',condition:'closed',closureReason:'This finding is closed in the demo. The last observed evidence is retained.',verification:'unavailable',freshness:'stale',objects:['OPS-LT-07','OPS-LT-11','FIN-LT-16'].map(name=>[name,'Device','intune-'+name.toLowerCase()]),confirmed:['Three devices have missed expected management check-ins.','The last available Intune device reports are 3 days old.','Kaseya VSA reports activity 15m ago for OPS-LT-07, despite its stale Intune check-in.'],supportingSources:['Intune','Kaseya VSA'],hypotheses:['A management connection problem is one explanation to investigate.'],unknowns:['Whether the devices are currently online or healthy cannot be verified. Missing reports do not establish resolution.'],observed:'3 days ago'},
    'identity-inactive':{reference:'F-1006',objects:Array.from({length:9},(_,i)=>['review.account'+String(i+1).padStart(2,'0')+'@example.com','Account','m365-review-'+(i+1)]),confirmed:['Nine enabled accounts retain application assignments.','No recent activity appears in the collected service evidence.'],hypotheses:[],unknowns:['Whether access is still needed. Absence of recorded activity does not prove nonuse or that an employee has departed.'],observed:'15m ago'}
  };
  findings.forEach(f=>Object.assign(f,{condition:'open',verification:'verified',freshness:'fresh',conditionKey:f.id,...findingDetails[f.id]}));
  const networkExampleFindings=[
    {id:'network-wireless',reference:'F-1007',assistant:4,title:'Austin Wi-Fi disconnects are improving.',severity:'medium',change:'Improving',condition:'open',conditionKey:'austin-wifi-disconnects',verification:'verified',freshness:'fresh',affected:'3 access points',source:'Cisco Meraki',checked:'20m ago',observed:'20m ago',first:'5 days ago',acknowledged:true,objects:['ATX-AP-01','ATX-AP-02','ATX-AP-03'].map(name=>[name,'Access point','meraki-'+name.toLowerCase()]),evidence:'Meraki reports recurring disconnections on 3 access points, down from 12 in the prior comparison window. Failures still occur, so the condition remains open.',confirmed:['The affected access-point population decreased from 12 to 3.','Recurring disconnections are still reported on the remaining 3 access points.'],hypotheses:[],unknowns:['What caused the improvement and whether it will persist.'],next:'Continue observing the remaining access points and compare their connection evidence.',history:['First observed: 12 access points affected.','Improved: the affected population fell to 3; resolution is not yet verified.']},
    {id:'network-uplink-prior',reference:'F-1008',assistant:4,title:'Boston uplink instability was verified resolved.',severity:'high',change:'Resolved',condition:'resolved',conditionKey:'boston-uplink-instability',verification:'verified',freshness:'fresh',affected:'1 switch',source:'Cisco Meraki',checked:'2 days ago',observed:'Oct 27, 2026 · 10:00 AM Pacific',first:'Oct 24, 2026',resolvedAt:'Oct 27, 2026 · 10:00 AM Pacific',acknowledged:true,objects:[['BOS-SW-02','Switch','meraki-bos-sw-02']],evidence:'Meraki reported a stable uplink and no further uplink-flap events in two consecutive comparison windows, verifying the end of this occurrence on October 27.',confirmed:['Two consecutive checks verified a stable uplink and no continuing flap events for this occurrence.'],hypotheses:[],unknowns:[],resolution:'Stable uplink state and no new flap events in two consecutive comparison windows.',related:'network-uplink-return',next:null,history:['Oct 24: uplink instability first observed on BOS-SW-02.','Oct 27: fresh source evidence verified resolution; this occurrence was closed.']},
    {id:'network-uplink-return',reference:'F-1009',assistant:4,title:'Boston uplink instability has resurfaced.',severity:'high',change:'Resurfaced',condition:'open',conditionKey:'boston-uplink-instability',verification:'verified',freshness:'fresh',affected:'1 switch',source:'Cisco Meraki',checked:'20m ago',observed:'20m ago',first:'Today, 9:00 AM',acknowledged:false,objects:[['BOS-SW-02','Switch','meraki-bos-sw-02']],evidence:'Meraki reports 8 new uplink-flap events on BOS-SW-02 after the previous occurrence was verified resolved on October 27. This is a new occurrence of the same condition.',confirmed:['Eight new flap events are recorded for BOS-SW-02.','The previous occurrence was verified resolved before these events began.'],hypotheses:[],unknowns:['Whether the recurrence shares the earlier cause; no causal relationship to a configuration change has been established.'],related:'network-uplink-prior',next:'Compare the new uplink events with switch health and recent changes before selecting a response.',history:['Oct 27: previous occurrence F-1008 verified resolved.','Today, 9:00 AM: new occurrence F-1009 created after fresh uplink-flap events.']}
  ];
  // Recommendations are deliberately curated; a finding alone does not create an action.
  const suggestionCopy={
    'security-encryption':{ready:true,title:'Verify encryption on 4 devices',reason:'Intune reports encryption off. Device-level verification will confirm which devices need follow-up.',step:'Open the four affected device records in Intune and compare their latest encryption reports. Confirm the reported state with device owners before planning a change.'},
    'health-checkin':{ready:true,title:'Check management connectivity',reason:'3 devices have stale check-ins. Confirm their last activity before treating them as offline.',step:'Compare the last Intune check-in with Kaseya activity for the three devices. Where fresh activity exists, investigate the management connection; otherwise confirm availability with the owner.'},
    'identity-inactive':{ready:true,title:'Confirm access for 9 accounts',reason:'Inactive accounts still have application access. Confirm the business need before proposing removal.',step:'Review the nine account owners and their application assignments. Ask the responsible owner to confirm whether each assignment is still needed before considering access changes.'}
  };
  const dismissedSuggestions=[];
  const assistantRuns=[];
  let restoredRunHistory=false;
  const isOpenFinding=f=>f.condition==='open';
  const sessionKey='ivy-specialist-preview-v1';
  function restoreSession() {
    try {
      const stored=JSON.parse(window.sessionStorage.getItem(sessionKey)||'null');if(!stored||![1,2,3,4].includes(stored.version))return;
      for(const a of assistants){const item=stored.assistants?.find(item=>item.id===a.id);if(!item)continue;if(typeof item.enabled==='boolean')a.enabled=item.enabled;if(Array.isArray(item.selectedSources))a.selectedSources=item.selectedSources.filter(name=>a.sources.includes(name)&&sourceIsConnected(name));if(Object.hasOwn(cadenceLabels,item.cadence))a.cadence=item.cadence;if(Array.isArray(item.selectedCapabilities))a.selectedCapabilities=item.selectedCapabilities.filter(i=>Number.isInteger(i)&&i>=0&&i<capabilitySets[a.id].length);if(typeof item.notify==='boolean')a.notify=item.notify;if(Array.isArray(item.notifyChannels))a.notifyChannels=item.notifyChannels.filter(channel=>['in-app','email'].includes(channel));if(typeof item.pending==='boolean')a.pending=item.pending;if(/^([01]\d|2[0-3]):[0-5]\d$/.test(item.startTime))a.startTime=item.startTime;if(Object.hasOwn(timeZones,item.timeZone))a.timeZone=item.timeZone;if(weekdays.includes(item.day))a.day=item.day;if(typeof item.last==='string'||item.last===null)a.last=item.last;if(stored.version===1&&[4,5].includes(a.id)){a.enabled=false;a.pending=false;}}
      const security=assistants.find(a=>a.id===3);
      const network=assistants.find(a=>a.id===4);
      // Replace the legacy demo defaults while keeping completed user-initiated checks.
      const legacyNetwork=stored.version<3&&network.last==='20m ago';
      if(stored.version<3&&security.last==='10m ago'){security.enabled=false;security.pending=false;}
      if(legacyNetwork)network.last=null;
      if(stored.version<4&&!network.last){network.enabled=true;network.pending=true;}
      if(network.last)findings.push(...networkExampleFindings);
      for(const f of findings){const item=stored.findings?.find(item=>item.id===f.id);if(typeof item?.acknowledged==='boolean'&&isOpenFinding(f))f.acknowledged=item.acknowledged;if(item?.condition==='closed'&&isOpenFinding(f))f.condition='closed';if(typeof item?.dismissed==='boolean')f.dismissed=item.dismissed;if(Number.isFinite(item?.alertAt))f.alertAt=item.alertAt;}
      if(Array.isArray(stored.runs)){
        const validRuns=stored.runs.filter(run=>typeof run.id==='string'&&assistants.some(a=>a.id===run.assistantId)&&Number.isFinite(run.startedAt)&&Array.isArray(run.findings)&&Array.isArray(run.sources)&&['Completed','Incomplete','Running','Cancelled'].includes(run.status));
        assistantRuns.push(...validRuns.filter(run=>!legacyNetwork||run.assistantId!==network.id));
        restoredRunHistory=true;
        for(const run of assistantRuns){
          if(run.status==='Running'){
            run.status='Incomplete';
            run.error='The preview was closed before this check finished.';
            run.finishedAt=Date.now();
          }
        }
      }
      if(Array.isArray(stored.dismissedSuggestions))dismissedSuggestions.push(...stored.dismissedSuggestions.filter(id=>suggestionCopy[id]?.ready));
    } catch (_) { /* The file preview also works when browser storage is unavailable. */ }
  }
  function saveSession() {
    try {window.sessionStorage.setItem(sessionKey,JSON.stringify({version:4,assistants:assistants.map(({id,enabled,selectedSources,selectedCapabilities,cadence,notify,notifyChannels,pending,startTime,timeZone,day,last})=>({id,enabled,selectedSources,selectedCapabilities,cadence,notify,notifyChannels,pending,startTime,timeZone,day,last})),findings:findings.map(({id,condition,acknowledged,dismissed,alertAt})=>({id,condition,acknowledged,dismissed,alertAt})),dismissedSuggestions,runs:assistantRuns}));} catch (_) { /* Optional preview persistence. */ }
  }
  restoreSession();
  assistants.forEach(a=>{a.selectedSources=a.selectedSources.filter(sourceIsConnected);});
  if(!restoredRunHistory)seedAssistantRuns();
  const rank={critical:4,high:3,medium:2,low:1};
  let view='overview',layout='grid',availability='all',findingState='all',findingsView='cards',toastTimer;
  const dialog=$('#assistant-dialog');
  const attentionRail=$('#assistant-attention-list');
  const attentionScrollbar=$('#assistant-attention-scrollbar');
  const highlightsToggle=$('#assistants-highlights-toggle');
  let indexHighlightsHidden=false;
  const owned=a=>findings.filter(f=>f.assistant===a.id&&isOpenFinding(f));
  const waiting=items=>items.filter(f=>isOpenFinding(f)&&!f.acknowledged&&!f.dismissed);
  function searchText() {return isOnboarding?'':$('#assistant-search').value.trim();}
  function filtered() {
    const query=searchText().toLowerCase();
    return assistants.filter(a=>(view!=='all'||availability==='all'||availability==='enabled'&&a.enabled||availability==='disabled'&&!a.enabled)&&`${a.title} ${a.description} ${a.sources.join(' ')}`.toLowerCase().includes(query));
  }
  function badge(label,tone='neutral') {return `<span class="specialist-badge text-xs" data-tone="${tone}"${String(label).toLowerCase()==='critical'?' data-priority="critical"':''}>${esc(label)}</span>`;}
  function stateLabel(a) {return a.enabled?'Enabled':'Off';}
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
  function cancelAssistantRun(a) {
    clearTimeout(runTimers.get(a.id));
    runTimers.delete(a.id);
    const run=assistantRuns.find(item=>item.assistantId===a.id&&item.status==='Running');
    if(run){
      run.status='Cancelled';
      run.finishedAt=Date.now();
      run.error='The assistant was turned off before the check finished.';
    }
    a.running=false;
    return run;
  }
  function stopAssistant(a) {
    const run=cancelAssistantRun(a);
    a.enabled=false;
    a.pending=false;
    render();
    if(run&&dialog.open&&dialog.dataset.runId===run.id)openRunResult(run);
    toast('Assistant turned off. Future checks stopped; findings and history kept.');
  }
  function runNow(a) {
    if(!a.enabled||a.running)return;
    const number=Math.max(0,...getAssistantRuns(a.id).map(run=>run.number))+1;
    const startedAt=Date.now();
    const run={id:`assistant-${a.id}-run-${number}`,number,assistantId:a.id,startedAt,finishedAt:null,status:'Running',trigger:'On Demand',sources:[...a.selectedSources],findings:[],error:null,illustrative:true};
    assistantRuns.push(run);
    a.running=true;
    render();
    toast('Running a preview investigation using sample evidence.');
    runTimers.set(a.id,setTimeout(()=>{
      if(!a.enabled)return;
      run.status='Completed';
      run.finishedAt=Date.now();
      if(a.id===4&&!a.last)findings.push(...networkExampleFindings);
      run.findings=snapshotFindings(owned(a));
      for(const f of run.findings)f.checked='Just Now';
      a.running=false;
      a.pending=false;
      a.last='Just now';
      runTimers.delete(a.id);
      render();
      if(dialog.open&&dialog.dataset.runId===run.id)openRunResult(run);
      toast('Preview check completed.');
    },2400));
  }
  function lifecycleBadges(f,showReviewState=true) {
    const changeTone=['Worsened','Resurfaced'].includes(f.change)?'warning':f.change==='Improving'?'success':f.change==='New'?'info':'neutral';
    return `${badge(f.severity,['critical','high'].includes(f.severity)?'danger':'neutral')}${f.condition==='resolved'?badge('Verified resolved','success'):f.condition==='closed'?badge('Closed'):badge(f.change,changeTone)}${showReviewState&&f.verification==='unavailable'?badge('Verification unavailable','warning'):''}${showReviewState&&f.dismissed?badge('Dismissed'):''}${showReviewState&&f.acknowledged&&!f.dismissed&&isOpenFinding(f)?badge('Acknowledged'):''}`;
  }
  function elapsedMinutes(value) {const match=value.match(/(\d+)\s*(m|h|day)/);return match?Number(match[1])*(match[2]==='day'?1440:match[2]==='h'?60:1):0;}
  function matchesFindingState(f) {
    if(findingState==='all')return true;
    if(findingState==='open')return isOpenFinding(f);
    if(findingState==='resolved')return f.condition==='resolved';
    if(findingState==='unavailable')return f.verification==='unavailable';
    return f.change.toLowerCase()===findingState;
  }
  function assistantEvidence(a) {
    const sources=a.selectedSources.map(name=>source(name,'icon-only')).join('');
    return `<div class="specialist-card-evidence text-xs">
      ${sources?`<span class="specialist-source-list" role="group" aria-label="Selected Sources">${sources}</span>`:''}
      ${sources&&a.scope?'<span aria-hidden="true">•</span>':''}
      ${a.scope?`<span>${esc(a.scope)}</span>`:''}
    </div>`;
  }
  function card(a) {
    const items=owned(a);
    const outcome=items.length
      ? `${items.length} Open ${items.length===1?'Finding':'Findings'}`
      : a.enabled&&a.last?'No Open Findings':a.enabled?'Awaiting First Check':'Not Monitoring Yet';
    const checked=a.running?'Checking Now':a.last?`Checked ${a.last}`:a.enabled?'Awaiting First Check':'No Checks Yet';
    return `<article class="assistant-card p-4 specialist-card" data-specialist-action="open" data-assistant-id="${a.id}" tabindex="0" role="link" aria-labelledby="assistant-title-${a.id}" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">
      <header class="assistant-card-header">
        <span class="assistant-icon h-11 w-11">${icon(a.glyph,'h-5 w-5')}</span>
        <div class="specialist-card-heading text-base font-semibold">
          <h2 id="assistant-title-${a.id}" class="font-semibold"><span class="assistant-title">${esc(a.title)}</span></h2>
          <div class="specialist-mini-meta text-xs">
            <span class="specialist-mini-state" data-state="${a.enabled?'watching':'disabled'}"><span class="specialist-mini-dot" aria-hidden="true"></span>${esc(stateLabel(a))}</span>
            <span class="specialist-mini-outcome">${esc(outcome)}</span>
          </div>
        </div>
        <span class="specialist-card-schedule-top">${cardSchedule(a)}</span>
      </header>
      <p class="assistant-description text-xs">${esc(a.description)}</p>
      ${assistantEvidence(a)}
      <footer class="assistant-footer specialist-card-footer">
        <span class="specialist-check-time text-xs">${icon('clock')}${esc(checked)}</span>
        ${powerToggle(a)}
      </footer>
    </article>`;
  }
  function onboardingCard(a) {
    const action=isOnboardingPreview?'open':'preview-assistant';
    const recommendedSources=isOnboardingPreview?'':`<div class="flex flex-wrap items-center gap-2 mt-1.5" role="group" aria-label="Recommended Sources">
      ${a.sources.map(name=>`<img class="h-4 w-4 object-contain" src="${sourceAssets[name]}" width="16" height="16" alt="${esc(name)}" title="${esc(name)}"/>`).join('')}
    </div>`;
    const titleId=`assistant-title-${a.id}`;
    const tooltipId=`assistant-action-${a.id}`;
    const actionLabel=previewAssistantCards?'Preview Assistant':'View Assistant';
    const tooltip=hasOnboardingCardTooltips?`<span class="specialist-intro-tooltip" id="${tooltipId}" role="tooltip">${actionLabel}</span>`:'';
    const tooltipAttributes=hasOnboardingCardTooltips?` aria-describedby="${tooltipId}"`:hasOnboardingCardLinks?` title="${actionLabel}"`:'';
    const iconColors=`--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)`;
    const actionIcon=hasOnboardingCardLinks&&previewAssistantCards?'eye':'arrow';
    const indicator=`<span class="specialist-intro-arrow shrink-0">${icon(actionIcon,'h-4 w-4')}</span>`;
    const content=`
      <span class="assistant-icon h-10 w-10">${icon(a.glyph,'h-4 w-4')}</span>
      <div class="min-w-0 flex-1">
        <h2 id="${titleId}" class="text-sm font-normal">${esc(a.title)}</h2>
        <span class="specialist-intro-count text-xs"${isOnboardingPreview?'':' hidden'}>${capabilitySets[a.id].length} Capabilities</span>
        ${recommendedSources}
      </div>`;
    if(hasOnboardingCardLinks&&!previewAssistantCards){
      return `<article class="assistant-card specialist-intro-card rounded-lg hover:shadow-md focus-within:shadow-md" style="${iconColors}">
        <a class="specialist-intro-link p-4" href="${assistantShowHref(a)}" aria-labelledby="${titleId}"${tooltipAttributes}>${content}${indicator}</a>
        ${tooltip}
      </article>`;
    }
    return `<article class="assistant-card specialist-intro-card p-4 rounded-lg${isOnboardingPreview?'':' hover:shadow-md focus-within:shadow-md'}" data-specialist-action="${action}" data-assistant-id="${a.id}" tabindex="0" role="${isOnboardingPreview?'link':'button'}" ${isOnboardingPreview?'':'aria-haspopup="dialog"'} aria-labelledby="${titleId}"${tooltipAttributes} style="${iconColors}">
      ${content}
      ${indicator}
      ${tooltip}
    </article>`;
  }
  function overviewCard(a) {
    const items=owned(a),action='open';
    const state=a.enabled?'watching':'disabled';
    const outcome=items.length?`${items.length} open ${items.length===1?'finding':'findings'}`:!a.enabled?'Turn on to investigate':a.pending||!a.last?'Not checked yet':'No open findings';
    return `<article class="assistant-card p-4 specialist-mini-card" data-specialist-action="open" data-assistant-id="${a.id}" tabindex="0" role="link" aria-labelledby="assistant-title-${a.id}" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)"><span class="assistant-icon h-11 w-11">${icon(a.glyph,'h-5 w-5')}</span><div class="specialist-mini-copy text-sm font-semibold"><h2 id="assistant-title-${a.id}" class="font-semibold"><span class="assistant-title" title="${esc(a.title)}">${esc(a.title)}</span></h2><div class="specialist-mini-meta text-xs"><span class="specialist-mini-state" data-state="${state}"><span class="specialist-mini-dot" aria-hidden="true"></span>${esc(stateLabel(a))}</span><span class="specialist-mini-outcome">${esc(outcome)}</span></div>${assistantEvidence(a)}</div><div class="specialist-mini-controls flex flex-col justify-end text-right ml-auto"><div class="specialist-card-topline" data-specialist-action="open" data-assistant-id="${a.id}">${cardSchedule(a)}</div>${powerToggle(a)}</div><button type="button" class="specialist-mini-open" data-specialist-action="${action}" data-assistant-id="${a.id}" aria-label="${action==='open'?'View':'Enable'} ${esc(a.title)}">${icon('arrow')}</button></article>`;
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
  const findingReviewActions={
    'acknowledge-open':{label:'Acknowledge for Later',glyph:'check'},
    'dismiss-finding':{label:'Dismiss',glyph:'close'},
    'schedule-finding-alert':{label:'Schedule an Alert',glyph:'calendar'},
    'chat-finding':{label:'Start a Chat',glyph:'sparkles'}
  };
  function findingReviewControl(f,{modal=false}={}) {
    const disabled=action=>modal&&((action==='acknowledge-open'&&f.acknowledged)||(!isOpenFinding(f)&&action!=='chat-finding'));
    return `<span class="as-finding-split-action">
        <button type="button" class="as-finding-icon-button" data-finding-primary data-specialist-action="acknowledge-open" data-finding-id="${f.id}" aria-label="Acknowledge for Later" title="Acknowledge for Later"${disabled('acknowledge-open')?' disabled':''}>${icon('check')}<span>Acknowledge</span></button>
        <details class="as-finding-action-menu"><summary aria-label="Choose Finding Action" title="Choose Finding Action"><svg class="as-finding-dropdown-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
          <span class="as-finding-action-options">${Object.entries(findingReviewActions).map(([action,{label,glyph}])=>`<button type="button" data-specialist-action="choose-finding-action" data-finding-action="${action}"${disabled(action)?' disabled':''}>${icon(glyph)}${label}</button>`).join('')}</span>
        </details>
      </span>`;
  }
  function findingRow(f,options={}) {
    const a=assistants.find(a=>a.id===f.assistant),priority=options.priority===true;
    const headline=findingHeadlines[f.id]||f.title;
    const evidence=findingEvidence[f.id]||f.confirmed?.[0]||f.evidence;
    const checkedTime=`<span class="specialist-issue-time text-xs">${f.verification==='unavailable'?'Last evidence '+esc(f.observed):'Checked '+esc(f.checked)}</span>`;
    const findingActions=`<span class="as-finding-actions">
      <button type="button" class="as-finding-icon-button" data-specialist-action="finding" data-finding-id="${f.id}" aria-label="View More" title="View More">${icon('arrow')}</button>

    </span>`;
    const recommendation=options.recommendation
      ? `<span class="specialist-finding-aside">${checkedTime}<span class="specialist-finding-recommendation"><strong class="text-xs font-medium">${icon('sparkles')}Ivy recommends...</strong><span class="text-xs">${esc(suggestionCopy[f.id]?.ready?suggestionCopy[f.id].title:f.next||'No recommendation available.')}</span></span></span>${findingActions}`
      : `<span class="specialist-finding-arrow">${icon('arrow')}</span>`;
    if(options.findingsTab)return `<button type="button" class="specialist-finding specialist-issue-row specialist-tab-finding p-4 rounded-lg" data-severity="${f.severity}" data-specialist-action="finding" data-finding-id="${f.id}"><span class="specialist-finding-icon" data-severity="${f.severity}">${icon('alert')}</span><span class="specialist-finding-copy"><span class="specialist-issue-top"><span class="specialist-finding-top text-xs">${lifecycleBadges(f)}<span class="specialist-finding-assistant ml-2">${icon('assistants')}${esc(a.title)}</span></span><span class="specialist-issue-time text-xs">${f.verification==='unavailable'?'Last Evidence '+esc(f.observed):'Checked '+esc(f.checked)}</span></span><strong class="text-sm font-semibold">${esc(headline)}</strong><span class="specialist-issue-evidence text-xs">${esc(evidence)}</span></span><span class="specialist-tab-finding-footer flex gap-4"><span class="specialist-issue-meta text-xs">${source(f.source)}<span aria-hidden="true">•</span><span class="inline-flex items-center gap-1">${icon('identity','h-3 w-3')}${esc(f.affected)}</span></span><span class="specialist-finding-arrow">${icon('arrow')}</span></span></button>`;

    return `<${options.recommendation?'article':'button type="button"'} class="specialist-finding specialist-issue-row${options.recommendation?' specialist-finding-with-recommendation':''} ${options.list?'specialist-issue-list-row px-2 py-3 rounded-none':'p-4 rounded-lg'}${priority?' specialist-issue-priority':''}" data-severity="${f.severity}"${options.recommendation?'':` data-specialist-action="finding" data-finding-id="${f.id}"`}${options.descriptionTooltip?` title="${esc(evidence)}"`:""}>${options.list?'':`<span class="specialist-finding-icon" data-severity="${f.severity}">${icon('alert')}</span>`}<span class="specialist-finding-copy"><span class="specialist-issue-top"><span class="specialist-finding-top text-xs">${priority?'<span class="specialist-priority-label font-medium">Top Priority</span>':''}${lifecycleBadges(f,!options.preview)}</span>${options.recommendation?'':checkedTime}</span><strong class="text-sm font-semibold">${esc(headline)}</strong>${options.preview||options.descriptionTooltip?'':`<span class="specialist-issue-evidence text-xs">${esc(evidence)}</span>`}<span class="specialist-issue-meta text-xs">${options.descriptionTooltip?`${source(f.source)}<span aria-hidden="true">•</span><span class="inline-flex items-center gap-1">${icon('identity','h-3 w-3')}${esc(f.affected)}</span><span aria-hidden="true">•</span><span class="specialist-finding-assistant">${icon('assistants')}${esc(a.title)}</span>`:`<span class="inline-flex items-center gap-1">${icon('identity','h-3 w-3')}${esc(f.affected)}</span><span aria-hidden="true">•</span>${source(f.source)}<span aria-hidden="true">•</span><span class="specialist-finding-assistant">${icon('assistants')}${esc(a.title)}</span>`}</span>${options.history===true?`<span class="specialist-history-events text-xs">${f.history.map(event=>`<span>${esc(event)}</span>`).join('')}</span>`:''}</span>${recommendation}</${options.recommendation?'article':'button'}>`;
  }
  function findingsTable(items,{includeAssistant=false}={}) {
    const widths=includeAssistant?[30,18,10,15,14,13]:[38,12,18,17,15];
    return `<div class="specialist-table-shell"><table class="specialist-table as-findings-table${includeAssistant?' specialist-cross-assistant-table':''} text-xs" aria-label="All Findings">
      <colgroup>${widths.map(width=>`<col style="width:${width}%">`).join('')}</colgroup>
      <thead><tr><th scope="col">Finding</th>${includeAssistant?'<th scope="col">Assistant</th>':''}<th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Source</th><th scope="col">Last Checked</th></tr></thead>
      <tbody>${items.map(f=>{
        const status=f.condition==='resolved'?'Resolved':f.condition==='closed'?'Closed':f.dismissed?'Dismissed':f.acknowledged?'Acknowledged':f.change||'Open';
        const tone=f.condition==='resolved'?'success':['Worsened','Resurfaced'].includes(status)?'warning':status==='New'?'info':'neutral';
        return `<tr data-specialist-action="finding" data-finding-id="${f.id}">
          <td><button type="button" class="as-finding-table-open" data-specialist-action="finding" data-finding-id="${f.id}">${esc(f.title)}</button><span class="as-finding-table-affected">${esc(f.affected)}</span></td>
          ${includeAssistant?`<td>${esc(assistants.find(a=>a.id===f.assistant).title)}</td>`:''}
          <td>${badge(f.severity,['high','critical'].includes(f.severity)?'danger':'neutral')}</td>
          <td>${badge(status,tone)}</td>
          <td>${source(f.source)}</td>
          <td>${esc(f.verification==='unavailable'?f.observed:f.checked)}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  }
  function suggestionCard(f) {
    const copy=suggestionCopy[f.id];
    return `<article class="specialist-suggestion p-4" aria-labelledby="suggestion-title-${f.id}"><div class="specialist-suggestion-heading"><h3 id="suggestion-title-${f.id}" class="text-sm font-semibold">${esc(copy.title)}</h3>${badge(f.severity,f.severity==='critical'?'danger':f.severity==='high'?'warning':'info')}</div><p class="text-xs">${esc(copy.reason)}</p><div class="specialist-suggestion-actions text-xs"><button type="button" class="specialist-suggestion-review" data-specialist-action="suggestion" data-finding-id="${f.id}" aria-label="Review ${esc(copy.title)}">${icon('arrow','h-3 w-3')}Review action</button><button type="button" class="specialist-suggestion-dismiss" data-specialist-action="dismiss-suggestion" data-finding-id="${f.id}" aria-label="Dismiss suggestion: ${esc(copy.title)}">${icon('close','h-3 w-3')}Dismiss</button></div></article>`;
  }
  function snapshotFindings(items) {
    return JSON.parse(JSON.stringify(items));
  }
  function seedAssistantRuns() {
    const now=Date.now();
    for(const a of assistants.filter(item=>item.last)){
      const current=findings.filter(f=>f.assistant===a.id&&isOpenFinding(f));
      for(let day=0;day<14;day++){
        const startedAt=now-(day?day*86400000:elapsedMinutes(a.last)*60000);
        const error=day===2&&a.id===2?'Could not access Intune. The run stopped before completing the investigation.':null;
        const count=day?Math.max(0,current.length-(day%3)):current.length;
        const snapshots=snapshotFindings(error?[]:current.slice(0,count));
        if(day)for(const f of snapshots){
          f.acknowledged=false;
          f.dismissed=false;
          f.checked=new Date(startedAt).toLocaleString();
          f.change='Ongoing';
        }
        assistantRuns.push({
          id:`assistant-${a.id}-run-${14-day}`,number:14-day,assistantId:a.id,
          startedAt,finishedAt:startedAt+34000,status:error?'Incomplete':'Completed',
          trigger:a.cadence==='manual'?'On Demand':'Scheduled',sources:[...a.selectedSources],
          findings:snapshots,error,illustrative:true
        });
      }
    }
  }
  function getAssistantRuns(assistantId) {
    return assistantRuns.filter(run=>assistantId===undefined||run.assistantId===assistantId)
      .sort((a,b)=>b.startedAt-a.startedAt||b.number-a.number);
  }
  function runStatus(run) {
    return badge(run.status,run.status==='Completed'?'success':run.status==='Running'?'info':run.status==='Incomplete'?'warning':'neutral');
  }
  function runTime(run) {
    return new Date(run.startedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }
  function runDuration(run) {
    return run.finishedAt?`${Math.max(0,Math.round((run.finishedAt-run.startedAt)/1000))}s`:'—';
  }
  function runCount(run) {
    return run.status==='Completed'?String(run.findings.length):'—';
  }
  function runList(assistantId,limit=5,sampleRuns) {
    const runs=(sampleRuns??getAssistantRuns(assistantId)).slice(0,limit);
    return `<ul class="specialist-index-runs specialist-clickable-runs">${runs.map(run=>{
      const a=assistants.find(item=>item.id===run.assistantId);
      return `<li>${sampleRuns?'<div class="specialist-run-link">':`<button type="button" class="specialist-run-link" data-specialist-action="run-result" data-run-id="${esc(run.id)}" aria-label="View Run ${run.number} for ${esc(a.title)}">`}
        <span class="specialist-index-run-icon" data-run-state="${run.status==='Completed'?'complete':run.status==='Running'?'running':'error'}">${icon(run.status==='Completed'?'check':run.status==='Running'?'clock':'alert')}</span>
        <span class="specialist-index-run-copy">${assistantId===undefined?`<strong class="text-xs font-medium">${esc(a.title)}</strong>`:''}<span class="text-xs">#${run.number} · ${esc(runTime(run))}</span></span>
        ${run.status==='Completed'?`<span class="specialist-index-run-count text-xs">${runCount(run)} ${run.findings.length===1?'Finding':'Findings'}</span>`:runStatus(run)}
      ${sampleRuns?'</div>':'</button>'}</li>`;
    }).join('')}${!runs.length?'<li class="text-xs">No Runs Yet</li>':''}</ul>`;
  }
  function runHistoryTable(runs,{includeAssistant=false}={}) {
    if(!runs.length)return '<p class="specialist-inline-empty text-sm">No runs have been recorded yet.</p>';
    return `<div class="specialist-table-shell"><table class="specialist-table specialist-run-table text-xs" aria-label="Run History">
      <thead><tr><th scope="col">Run</th>${includeAssistant?'<th scope="col">Assistant</th>':''}<th scope="col">Started</th><th scope="col">Status</th><th scope="col">Findings</th><th scope="col">Duration</th><th scope="col">Trigger</th></tr></thead>
      <tbody>${runs.map(run=>`<tr data-specialist-action="run-result" data-run-id="${esc(run.id)}">
        <td><button type="button" class="as-finding-table-open" data-specialist-action="run-result" data-run-id="${esc(run.id)}" aria-label="View Run ${run.number}">#${run.number}</button></td>
        ${includeAssistant?`<td>${esc(assistants.find(a=>a.id===run.assistantId).title)}</td>`:''}
        <td>${esc(runTime(run))}</td><td>${runStatus(run)}</td><td>${runCount(run)}</td><td>${runDuration(run)}</td><td>${run.trigger}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }
  function historyPagination(totalPages) {
    const button=(page,label,content,disabled=false)=>`<button type="button" data-specialist-action="history-page" data-history-page="${page}" aria-label="${label}"${disabled?' disabled':''}${page===historyPage&&label.startsWith('Page ')?' aria-current="page"':''}>${content}</button>`;
    const pages=Array.from({length:totalPages},(_,i)=>i+1).filter(page=>totalPages<=7||page<=3||page>totalPages-3||Math.abs(page-historyPage)<=1);
    let previous=0;
    return button(historyPage-1,'Previous Page',icon('arrowLeft'),historyPage===1)+pages.map(page=>{
      const gap=previous&&page>previous+1?'<span aria-hidden="true">…</span>':'';
      previous=page;
      return gap+button(page,`Page ${page}`,page);
    }).join('')+button(historyPage+1,'Next Page',icon('arrow'),historyPage===totalPages);
  }
  function openRunResult(run) {
    const a=assistants.find(item=>item.id===run.assistantId);
    openDialog(`<div class="specialist-run-heading">${runStatus(run)}<span class="text-xs">Run #${run.number}</span></div>
      <h2 id="assistant-dialog-title">${esc(a.title)}</h2>
      <dl class="specialist-run-metadata text-xs">
        <div><dt>Started</dt><dd>${esc(new Date(run.startedAt).toLocaleString())}</dd></div>
        <div><dt>Duration</dt><dd>${runDuration(run)}</dd></div>
        <div><dt>Trigger</dt><dd>${run.trigger}</dd></div>
        <div><dt>Findings</dt><dd>${runCount(run)}</dd></div>
      </dl>
      <div class="specialist-source-list">${run.sources.map(source).join('')}</div>
      ${run.error?`<p class="specialist-verification-note text-sm">${esc(run.error)}</p>`:''}
      <h3 class="text-sm font-medium">Findings From This Run</h3>
      <div class="specialist-run-findings">${run.findings.length?run.findings.map(f=>`<details class="specialist-run-finding">
        <summary><span class="specialist-finding-top">${lifecycleBadges(f)}</span><strong class="text-sm font-medium">${esc(findingHeadlines[f.id]||f.title)}</strong></summary>
        <p class="text-sm">${esc(f.evidence)}</p><div class="specialist-issue-meta text-xs">${source(f.source)}<span>·</span>${esc(f.affected)}</div>
        ${f.next?`<div class="specialist-next-step"><strong class="text-xs">Suggested Next Step</strong><p class="text-sm">${esc(f.next)}</p></div>`:''}
      </details>`).join(''):`<p class="specialist-inline-empty text-sm">${run.status==='Running'?'This check is still running.':run.status==='Completed'?'No findings were returned by this run.':'This run did not finish, so no finding results are available.'}</p>`}</div>
      ${run.illustrative?'<p class="text-xs">Illustrative Run History</p>':''}`);
    dialog.dataset.runId=run.id;
  }
  function indexRecentRuns(expanded=false) {
    return `<header class="specialist-section-heading"><h2 ${expanded?'id="assistant-dialog-title"':''} class="text-sm font-medium${expanded?'':' flex items-center gap-2'}">${expanded?'Run History':icon('clock')+'Recent Runs'}</h2>${expanded?'':'<button type="button" class="a-text" data-specialist-action="all-runs">View All</button>'}</header>
      ${expanded?runHistoryTable(getAssistantRuns(),{includeAssistant:true}):runList()}`;
  }
  function updateAttentionScrollbar() {
    const {clientWidth,scrollLeft,scrollWidth}=attentionRail;
    const overflow=clientWidth?Math.max(0,scrollWidth-clientWidth):0;
    attentionScrollbar.max=String(overflow);
    attentionScrollbar.disabled=overflow===0;
    attentionScrollbar.value=String(Math.max(0,Math.min(scrollLeft,overflow)));
    attentionScrollbar.style.setProperty('--attention-thumb-width',overflow?`${100*clientWidth/scrollWidth}%`:'100%');
  }
  function renderAttention() {
    if(!attentionRail)return;
    const attention=waiting(findings).filter(f=>['New','Worsened','Resurfaced'].includes(f.change)||f.severity==='critical').sort((a,b)=>rank[b.severity]-rank[a.severity]||Number(b.change==='Worsened')-Number(a.change==='Worsened'));
    $('#assistant-attention').hidden=view!=='overview';
    const {critical,nonCritical}=openFindingCounts();
    $('#assistant-attention-count').textContent=`${attention.length} of ${critical+nonCritical} open findings.`;
    const cards=attention.length?attention.map(f=>findingRow(f,{descriptionTooltip:true})).join(''):'<div class="specialist-caught-up text-sm">No new, worsening, or urgent conditions to review. Ongoing findings remain available in Stream.</div>';
    attentionRail.innerHTML=`${cards}<button type="button" class="specialist-attention-all" data-specialist-action="all-findings">
      <strong class="text-sm font-medium">+${nonCritical} open non-critical ${nonCritical===1?'finding':'findings'}</strong>
      <span class="text-xs">View all ${icon('arrow','h-3 w-3')}</span>
    </button>`;
    updateAttentionScrollbar();
  }
  function openFindingCounts() {
    const open=findings.filter(f=>isOpenFinding(f));
    return {critical:open.filter(f=>f.severity==='critical').length,nonCritical:open.filter(f=>f.severity!=='critical').length};
  }
  function summaryFindingStatus(enabled) {
    const {critical,nonCritical}=openFindingCounts();
    return `<div class="specialist-summary-statuses"><div class="specialist-summary-status"><strong>${enabled.length} of ${assistants.length}</strong><span>Assistants Enabled</span></div><div class="specialist-summary-status"><strong>${critical}</strong><span>Open Critical Findings</span></div><div class="specialist-summary-status"><strong>${nonCritical}</strong><span>Open Non-Critical Findings</span></div></div>`;
  }
  function findingsTrendChart(width=390,graphicOnly=false) {
    const {critical,nonCritical}=openFindingCounts();
    const series=[
      {label:'Critical',color:'var(--ivy-color-error-500)',values:[3,2,4,3,1,2,3,2,2,1,2,critical]},
      {label:'Non-Critical',color:'var(--ivy-color-gray-400)',values:[14,12,15,11,13,10,12,11,9,10,9,nonCritical]}
    ];
    const point=(value,index)=>[8+index*(width-16)/11,98-value/20*84];
    const marks=[...series].reverse().map(({label,color,values})=>{
      const points=values.map(point);
      const line=points.reduce((path,[x,y],index)=>{
        if(!index)return `M ${x} ${y}`;
        const [px,py]=points[index-1],middle=(px+x)/2;
        return `${path} C ${middle} ${py}, ${middle} ${y}, ${x} ${y}`;
      },'');
      const gradientId=`specialist-weekly-${label.toLowerCase()}-fill`;
      const area=`<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${color}" stop-opacity="0.12"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
        <path d="${line} L ${width-8} 98 L 8 98 Z" style="fill:url(#${gradientId});stroke:none;pointer-events:none" aria-hidden="true"/>`;
      return `${area}<path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke"${label==='Non-Critical'?' stroke-dasharray="5 6"':''}/>${points.map(([x,y],i)=>`<g class="specialist-weekly-point" tabindex="0" aria-label="${i===11?'This Week':`${11-i} Weeks Ago`}: ${values[i]} ${label} Findings"><title>${i===11?'This Week':`${11-i} Weeks Ago`}: ${values[i]} ${label} Findings</title><circle cx="${x}" cy="${y}" r="10" fill="transparent" style="pointer-events:all"/><circle class="specialist-weekly-point-dot" cx="${x}" cy="${y}" r="3" fill="${color}"/></g>`).join('')}`;
    }).join('');
    const grid=[0,10,20].map(value=>`<line x1="8" x2="${width-8}" y1="${98-value/20*84}" y2="${98-value/20*84}" stroke="var(--ivy-color-indigo-100)"/>`).join('');
    const graphic=grid+marks;
    if(graphicOnly)return graphic;
    return `<figure class="specialist-resolution-trend"><figcaption><span class="specialist-weekly-heading">Findings per Week<span class="specialist-weekly-key">${series.map(({label,color})=>`<span><i style="border-color:${color}"${label==='Non-Critical'?' class="is-dashed"':''}></i>${label}</span>`).join('')}</span></span><span>Last 12 Weeks</span></figcaption>
      <div class="specialist-weekly-plot"><div class="specialist-weekly-y-axis" aria-hidden="true">${[20,10,0].map(value=>`<span style="top:${(98-value/20*84)/112*100}%">${value}</span>`).join('')}</div><svg class="specialist-resolution-line" viewBox="0 0 ${width} 112" role="img" aria-label="Illustrative weekly finding counts. ${series.map(item=>item.label+': '+item.values.join(', ')).join('. ')}. Oldest to newest." style="stroke:none">
        ${graphic}
      </svg></div><div class="specialist-resolution-axis"><span>12 Weeks Ago</span><span>This Week</span></div></figure>`;
  }
  function observeSummaryChart() {
    if(summaryChartObserver)summaryChartObserver.disconnect();
    const chart=$('#assistant-summary .specialist-resolution-line');
    if(!chart)return;
    summaryChartObserver=new ResizeObserver(entries=>{
      const width=entries[0].contentRect.width;
      if(width<=0)return;
      chart.setAttribute('viewBox',`0 0 ${width} 112`);
      chart.innerHTML=findingsTrendChart(width,true);
    });
    summaryChartObserver.observe(chart);
  }
  function summaryMetricChart(key,color,values) {
    const maximum=Math.max(...values,1);
    const points=values.map((value,index)=>[8+index*28,60-value/maximum*44]);
    const line=points.reduce((path,[x,y],index)=>{
      if(!index)return `M ${x} ${y}`;
      const [px,py]=points[index-1],middle=(px+x)/2;
      return `${path} C ${middle} ${py}, ${middle} ${y}, ${x} ${y}`;
    },'');
    return `<svg class="specialist-summary-sparkline" viewBox="0 0 212 68" preserveAspectRatio="none" aria-hidden="true" style="stroke:none"><defs><linearGradient id="summary-fill-${key}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--ivy-color-${color}-100)"/><stop offset="1" stop-color="var(--ivy-color-brand-25)"/></linearGradient></defs><path d="${line} L 204 68 L 8 68 Z" fill="url(#summary-fill-${key})"/><path d="${line}" fill="none" stroke="var(--ivy-color-${color}-500)" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  async function selectSummarySlide(next) {
    if(next===summarySlide||summaryAnimating||![0,1].includes(next))return;
    const root=$('#assistant-summary');
    const slides=[...root.querySelectorAll('.specialist-summary-slide')];
    const outgoing=slides[summarySlide],incoming=slides[next];
    summaryAnimating=true;
    const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:240;
    try {
      await outgoing.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(16px)'}],{duration,easing:'ease-in'}).finished;
      outgoing.setAttribute('aria-hidden','true');outgoing.inert=true;
      incoming.setAttribute('aria-hidden','false');incoming.inert=false;
      summarySlide=next;
      root.querySelectorAll('[data-summary-slide]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.summarySlide)===next)));
      await incoming.animate([{opacity:0,transform:'translateX(-16px)'},{opacity:1,transform:'translateX(0)'}],{duration,easing:'ease-out'}).finished;
    } finally {summaryAnimating=false;}
  }
  function render() {
    for(const f of findings){
      if(isOpenFinding(f)&&!assistants.find(a=>a.id===f.assistant).enabled){
        f.condition='closed';
        delete f.alertAt;
      }
    }
    saveSession();
    if(isShow){showPage.render();return;}
    if(isOnboardingPreview)document.querySelectorAll('[data-preview-finding]').forEach(slide=>{
      const finding=[...findings,...networkExampleFindings].find(item=>item.id===slide.dataset.previewFinding);
      if(finding)slide.innerHTML=findingRow(finding,{preview:true});
    });
    renderAttention();
    const enabled=assistants.filter(a=>a.enabled),unreviewed=waiting(findings),changed=unreviewed.filter(f=>['New','Worsened','Resurfaced'].includes(f.change)),items=filtered();
    if(!isOnboarding){
    const resolvedCount=findings.filter(f=>f.condition==='resolved').length;
    const coverageCount=assistants.filter(a=>a.enabled&&a.coverageGap).length;
    const summaryMetrics=[
      ['review',unreviewed.length,'To Review','blue',[11,9,10,8,9,8,7,unreviewed.length]],
      ['changed',changed.length,'New or Worsened','purple',[2,4,3,5,3,6,5,changed.length]],
      ['resolved',resolvedCount,'Findings Resolved','teal',[0,0,1,1,0,2,1,resolvedCount]],
      ['coverage',coverageCount,'Coverage Gaps','orange',[3,3,2,3,2,2,1,coverageCount]]
    ].map(([key,value,label,color,values])=>`<article class="specialist-metric-card" style="--metric-color:var(--ivy-color-${color}-500)"><h3>${label}</h3><strong>${value}</strong><span class="specialist-metric-caption">${key==='coverage'?'Enabled Assistants':key==='resolved'?'Verified Resolved':'Open Findings'}</span>${summaryMetricChart(key,color,values)}<div class="specialist-summary-metric-axis" aria-hidden="true"><span>8 Weeks Ago</span><span>This Week</span></div></article>`).join('');
    $('#assistant-summary').innerHTML=`<div class="specialist-summary-heading"><span class="specialist-summary-pill text-xs"><svg class="h-4 w-4" style="fill:currentColor;stroke:none" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 3 2.2 5.8L17 11l-5.8 2.2L9 19l-2.2-5.8L1 11l5.8-2.2Z M19 13l1.1 2.9L23 17l-2.9 1.1L19 21l-1.1-2.9L15 17l2.9-1.1Z"/></svg>Proactive by Design</span></div><div class="specialist-summary-stage">
      <div id="assistant-summary-proactive" class="specialist-summary-slide specialist-summary-proactive" role="group" aria-roledescription="slide" aria-label="1 of 2: Proactive by Design" aria-hidden="${summarySlide!==0}" ${summarySlide!==0?'inert':''}>
        <div class="specialist-summary-intro"><h2 class="text-display-sm font-bold">Discover what needs your attention.</h2><p class="text-gray-500">Enable a focused role, connect relevant sources, and let Ivy investigate changes over time.</p>${summaryFindingStatus(enabled)}</div>
        ${findingsTrendChart()}
      </div>
      <div id="assistant-summary-metrics" class="specialist-summary-slide specialist-summary-metrics" role="group" aria-roledescription="slide" aria-label="2 of 2: Assistant Overview" aria-hidden="${summarySlide!==1}" ${summarySlide!==1?'inert':''}>${summaryMetrics}</div>
    </div><nav class="specialist-summary-controls" aria-label="Assistant Highlights Slides">${['Proactive by Design','Assistant Overview'].map((label,index)=>`<button type="button" data-specialist-action="summary-slide" data-summary-slide="${index}" aria-label="Show ${label}" aria-controls="assistant-summary-${index===0?'proactive':'metrics'}" aria-pressed="${summarySlide===index}"></button>`).join('')}</nav>`;
    observeSummaryChart();
    $('#assistant-recent-runs').innerHTML=indexRecentRuns();
    }
    $('#assistant-grid').innerHTML=layout==='list'?(items.length?assistantTable(items):''):items.map(isOnboarding?onboardingCard:view==='overview'?overviewCard:card).join('');
    $('#assistant-grid').dataset.layout=layout;
    if(!isOnboarding){$('#assistant-summary').hidden=view!=='overview'||indexHighlightsHidden;$('#assistant-recent-runs').hidden=view==='history';}
    if(highlightsToggle)highlightsToggle.hidden=view!=='overview';
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
    const history=getAssistantRuns().filter(run=>`${assistants.find(a=>a.id===run.assistantId).title} ${run.number} ${run.status} ${run.trigger} ${run.sources.join(' ')}`.toLowerCase().includes(queryText));
    const historyNav=$('#assistant-history-pagination');
    if(queryText!==historyQuery){historyPage=1;historyQuery=queryText;}
    const historyPages=Math.max(1,Math.ceil(history.length/historyPageSize));
    historyPage=Math.max(1,Math.min(historyPage,historyPages));
    if(historyNav)historyNav.innerHTML=historyPagination(historyPages);
    const visibleHistory=historyNav?history.slice((historyPage-1)*historyPageSize,historyPage*historyPageSize):history;
    $('#assistant-history-list').innerHTML=history.length?runHistoryTable(visibleHistory,{includeAssistant:true}):'';
    $('#assistant-history-empty').hidden=history.length>0;
    const stream=findings.filter(matchesFindingState).filter(f=>`${f.title} ${assistants.find(a=>a.id===f.assistant).title} ${f.source} ${f.evidence}`.toLowerCase().includes(queryText)).sort((a,b)=>elapsedMinutes(a.checked)-elapsedMinutes(b.checked)||rank[b.severity]-rank[a.severity]);
    $('#assistant-stream-list').classList.toggle('specialist-findings-card-grid',findingsView==='cards');
    $('#assistant-stream-list').innerHTML=findingsView==='table'&&stream.length?findingsTable(stream,{includeAssistant:true}):stream.map(f=>findingRow(f,{descriptionTooltip:true})).join('');
    document.querySelectorAll('[data-findings-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.findingsView===findingsView)));
    $('#assistant-stream-empty').hidden=stream.length>0;
    $('#assistant-stream-count').textContent=`Showing ${stream.length} of ${findings.length}`;
    document.querySelectorAll('[data-specialist-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.specialistLayout===layout)));
    $('#assistant-empty').hidden=items.length>0;
    if(!isOnboarding)$('#assistant-count').textContent=`showing ${items.length} of 5`;
    if(!isOnboarding){const query=searchText();$('#assistant-search-submit').disabled=!query;$('#clear-filters').hidden=!query;}
    if(!isOnboarding)$('#assistant-panel').setAttribute('aria-labelledby','tab-'+view);
    document.querySelectorAll('[data-specialist-view]').forEach(button=>{const name=button.dataset.specialistView;button.setAttribute('aria-selected',String(name===view));button.tabIndex=name===view?0:-1;const count=button.querySelector('span');if(count&&name==='all')count.textContent=assistants.length;});
  }
  function toast(text) {clearTimeout(toastTimer);$('#assistant-toast').textContent=text;$('#assistant-toast').hidden=false;toastTimer=setTimeout(()=>$('#assistant-toast').hidden=true,4000);}
  function openDialog(body,drawer=false,tour=false) {if(dialog.open)dialog.close();delete dialog.dataset.runId;dialog.classList.toggle('assistant-config-drawer',drawer);dialog.classList.toggle('assistant-tour',tour);dialog.removeAttribute('aria-describedby');dialog.innerHTML=`<button type="button" class="assistant-dialog-close" data-specialist-action="close" aria-label="Close dialog">${icon('close','h-5 w-5')}</button>${body}`;dialog.showModal();}
  function allFindings() {openDialog(`<h2 id="assistant-dialog-title">Assistant findings</h2><p class="text-sm">Repeated checks refresh an ongoing finding. A return after verified resolution creates a new linked occurrence.</p><div class="specialist-dialog-findings">${findings.slice().sort((a,b)=>rank[b.severity]-rank[a.severity]).map(findingRow).join('')}</div>`);}
  function assistantShowHref(a) {return (isOnboarding?'assistant-show-off.html':'assistant-show.html')+'?id='+a.id;}
  function openAssistant(a) {
    saveSession();window.location.href=assistantShowHref(a);
  }
  const additionalPreviewFindings={
    1:[{title:'An Unexpected Sign-In Was Followed by a Global Admin Role Grant',evidence:'Entra ID recorded a sign-in from an unfamiliar location shortly before the account gained the Global Administrator role.',source:'Entra ID',affected:'1 account',severity:'critical'}],
    2:[
      {title:'18 Dispatch Workstations Are Stuck Restarting After an Update',evidence:'Intune recorded repeated restarts on the same workstations after the latest update.',source:'Intune',affected:'18 devices',severity:'critical'},
      {title:'6 Devices Repeatedly Failed the Same Update',evidence:'Kaseya VSA recorded the same install error on all six devices across multiple attempts.',source:'Kaseya VSA',affected:'6 devices'}
    ],
    4:[{title:'Both Internet Uplinks Are Down at the Boston Office',evidence:'Meraki reports that the primary and backup uplinks are both unavailable.',source:'Cisco Meraki',affected:'1 site',severity:'critical'}],
    5:[
      {title:'A License Change Removed Email Access for 42 Support Staff',evidence:'Microsoft 365 records show the accounts lost their Exchange Online entitlement after a group license change.',source:'Microsoft 365',affected:'42 accounts',severity:'critical'},
      {title:'4 New Hires Are Missing Required App Licenses',evidence:'Entra ID shows all four accounts in the onboarding group, with the required licenses still unassigned.',source:'Entra ID',affected:'4 accounts'},
      {title:'12 Assigned Licenses Show No Recent Activity',evidence:'Microsoft 365 recorded no activity for these assignments in the past 30 days.',source:'Microsoft 365',affected:'12 licenses'}
    ]
  };
  const previewIntroductions={
    1:'Connect the dots between sign-in failures, device health, and access changes.',
    2:'Catch recurring device and update problems before they disrupt someone’s day.',
    3:'Find gaps in protection and see which threats still need attention.',
    4:'Trace recurring connection problems across devices and sites.',
    5:'Find out what’s blocking app access and where licenses may be going unused.'
  };
  function previewFindingCard(f) {
    const severity=f.severity||'low';
    const label=severity[0].toUpperCase()+severity.slice(1);
    const tone=['critical','high'].includes(severity)?'danger':'neutral';
    return `<article class="specialist-finding specialist-issue-row p-4 rounded-lg shadow-md" data-severity="${severity}">
      <span class="specialist-finding-icon" data-severity="${severity}" aria-hidden="true">${icon('alert')}</span>
      <div class="specialist-finding-copy">
        <div class="specialist-finding-top">${badge(label,tone)}</div>
        <strong class="text-sm font-semibold">${esc(findingHeadlines[f.id]||f.title)}</strong>
        <span class="specialist-issue-evidence text-xs">${esc(findingEvidence[f.id]||f.confirmed?.[0]||f.evidence)}</span>
        <div class="specialist-issue-meta text-xs">${source(f.source)}<span aria-hidden="true">•</span><span>${esc(f.affected)}</span></div>
      </div>
    </article>`;
  }
  function previewFindingCarousel(examples) {
    const findingCards=examples.map(f=>`<li class="assistant-preview-finding-card">${previewFindingCard(f)}</li>`);
    const cards=findingCards.join('');
    // Keep each half of the loop wider than the carousel on desktop.
    const repeat=examples.length<3?`<ul class="assistant-preview-finding-group" aria-hidden="true" inert>${cards}</ul>`:'';
    const cardCount=examples.length*(repeat?2:1);
    return `<section data-preview-finding-carousel tabindex="0" role="group" aria-label="Example Findings" aria-roledescription="carousel">
      <div class="assistant-preview-finding-track" style="--finding-loop-duration:${cardCount*7.5}s">
        <ul class="assistant-preview-finding-group assistant-preview-finding-peek" aria-hidden="true" inert>${findingCards.at(-1)}</ul>
        <ul class="assistant-preview-finding-group">${cards}</ul>${repeat}
        <ul class="assistant-preview-finding-group" aria-hidden="true" inert>${cards}</ul>${repeat}
      </div>
    </section>`;
  }
  let assistantPreview;
  const inlineDetails=$('[data-assistant-inline-details]');
  let inlinePreview;
  function previewFindings(a) {
    const examples=a.id===4&&!a.last?networkExampleFindings.filter(isOpenFinding):findings.filter(f=>f.assistant===a.id&&f.condition!=='resolved');
    return [...examples,...(additionalPreviewFindings[a.id]||[])]
      .sort((first,second)=>Number(second.severity==='critical')-Number(first.severity==='critical'));
  }
  function showInlineAssistant(a) {
    const {situationCards,capabilityRows}=window.IvyAssistantShow;
    inlinePreview={assistant:a,selectedCapability:null};
    inlineDetails.innerHTML=`
      <header class="assistant-preview-heading flex items-start gap-3">
        <span class="assistant-icon h-10 w-10" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">${icon(a.glyph)}</span>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl font-semibold" tabindex="-1">${esc(a.title)}</h2>
          <p class="text-sm">${esc(previewIntroductions[a.id])}</p>
        </div>
        <button type="button" class="a-text inline-flex shrink-0 items-center gap-1" data-specialist-action="inline-explore">${icon('arrowLeft')} Explore other Assistants</button>
      </header>
      ${situationCards(a,{esc,icon})}
      <section class="assistant-inline-section" aria-labelledby="inline-capabilities-title">
        <header class="as-section-heading">
          <h3 id="inline-capabilities-title" class="text-base font-semibold">Built-In Capabilities</h3>
          <p class="text-sm">Each built-in capability shows what the assistant checks and which sources it uses.</p>
        </header>
        <div class="as-capabilities-grid" id="as-capability-grid">${capabilityRows(a,null,{esc,icon,source})}</div>
      </section>
      <section class="assistant-inline-section" aria-labelledby="inline-findings-title">
        <header class="as-section-heading">
          <h3 id="inline-findings-title" class="text-base font-semibold">Spot What Needs Attention</h3>
          <p class="text-sm">Findings show what the assistant flags, who or what is affected, and where the signal came from.</p>
        </header>
        ${previewFindingCarousel(previewFindings(a))}
      </section>
      <footer class="assistant-inline-actions flex flex-wrap items-center gap-3">
        <button type="button" class="a-secondary" data-specialist-action="inline-explore">Explore More</button>
        <button type="button" class="a-primary gap-2" data-specialist-action="open" data-assistant-id="${a.id}">Continue to Assistant ${icon('arrow')}</button>
      </footer>`;
    $('[data-assistant-choices]').hidden=true;
    inlineDetails.hidden=false;
    inlineDetails.querySelector('h2').focus();
  }
  function openAssistantPreview(a) {
    const slides=[
      {title:`Meet Your ${a.title} Assistant`,subtitle:previewIntroductions[a.id]},
      {title:'See What It Can Investigate',subtitle:'Each built-in capability shows what the assistant checks and which sources it uses.'},
      {title:'Spot What Needs Attention',subtitle:'Findings show what the assistant flags, who or what is affected, and where the signal came from.'}
    ];
    assistantPreview={assistant:a,index:0,selectedCapability:null,hasExploredCapabilities:false,visitedSlides:new Set(),slides};
    openDialog(`
      <header class="assistant-tour-top flex items-center gap-2">
        <span class="assistant-icon h-7 w-7" style="--icon-bg:var(--ivy-color-${a.family}-100);--icon-border:var(--ivy-color-${a.family}-200)">${icon(a.glyph,'h-4 w-4')}</span>
        <span class="font-medium">${esc(a.title)}</span>
      </header>
      <div class="assistant-tour-body as-content" data-onboarding-preview-slide><h2 id="assistant-dialog-title" class="font-semibold">${esc(slides[0].title)}</h2></div>
      <footer class="assistant-tour-footer">
        <nav class="assistant-tour-dots" aria-label="Walkthrough Steps">
          ${slides.map(({title},index)=>`<button type="button" data-specialist-action="preview-step" data-preview-index="${index}" aria-label="Step ${index+1}: ${esc(title)}"></button>`).join('')}
        </nav>
        <div class="assistant-tour-actions flex-wrap items-center" data-onboarding-preview-actions></div>
      </footer>`,false,true);
    renderAssistantPreview(true);
  }
  function renderAssistantPreview(opening=false) {
    const preview=assistantPreview;
    const {assistant:a,index,selectedCapability,slides}=preview;
    const {title,subtitle}=slides[index];
    const {situationCards,capabilityRows}=window.IvyAssistantShow;
    const last=index===slides.length-1;
    let body;
    if(index===0){
      body=situationCards(a,{esc,icon});
    }else if(last){
      body=previewFindingCarousel(previewFindings(a));
    }else{
      const helpers={esc,icon,source};
      // Overlap each expanded layout so the tallest one sets the available height.
      const expandedLayouts=capabilitySets[a.id].map((_,capabilityIndex)=>`
        <div class="as-capabilities-grid assistant-preview-capability-sizing" inert aria-hidden="true">
          ${capabilityRows(a,capabilityIndex,helpers,`preview-sizing-${capabilityIndex}`)}
        </div>`).join('');
      body=`<div class="assistant-preview-capabilities">
        <div class="as-capabilities-grid" id="as-capability-grid">${capabilityRows(a,selectedCapability,helpers)}</div>
        ${expandedLayouts}
      </div>`;
    }
    const slide=dialog.querySelector('[data-onboarding-preview-slide]');
    const firstVisit=!preview.visitedSlides.has(index);
    preview.visitedSlides.add(index);
    slide.toggleAttribute('data-preview-enter',firstVisit);
    slide.toggleAttribute('data-preview-opening',opening);
    slide.innerHTML=`
      <header class="assistant-preview-heading">
        <h2 id="assistant-dialog-title" class="font-semibold" tabindex="-1">${esc(title)}</h2>
        <p>${esc(subtitle)}</p>
      </header>
      <div class="assistant-preview-content">${body}</div>`;
    const capabilityGrid=slide.querySelector('#as-capability-grid');
    if(firstVisit&&capabilityGrid){
      const tiles=[...capabilityGrid.querySelectorAll('.as-capability-tile')];
      tiles.forEach((tile,tileIndex)=>{
        tile.classList.add('assistant-preview-capability-enter');
        tile.style.setProperty('--preview-capability-index',tileIndex);
      });
      const [firstTile]=tiles;
      if(firstTile&&!preview.hasExploredCapabilities){
        firstTile.addEventListener('animationstart',()=>{
          window.setTimeout(()=>{
            if(!dialog.open||!dialog.contains(firstTile)||preview.hasExploredCapabilities||capabilityGrid.contains(document.activeElement))return;
            preview.hasExploredCapabilities=true;
            preview.selectedCapability=0;
            const expanded=document.createElement('template');
            expanded.innerHTML=capabilityRows(a,0,{esc,icon,source});
            // Update the first tile in place so its fade can continue.
            firstTile.setAttribute('aria-expanded','true');
            firstTile.classList.replace('rounded-lg','rounded-t-lg');
            capabilityGrid.querySelector('.as-capability-expanded').replaceWith(
              expanded.content.querySelector('.as-capability-expanded:not([hidden])'));
            animatePreviewCapabilityPanel(capabilityGrid);
          },70);
        },{once:true});
      }
    }
    dialog.querySelector('[data-onboarding-preview-actions]').innerHTML=`
      ${last?'<a class="a-text text-sm mr-4" href="#assistant-catalog" data-specialist-action="preview-explore">Explore other Assistants</a>':''}
      ${index?'<button type="button" class="a-secondary" data-specialist-action="preview-back">Back</button>':''}
      ${last?`<button type="button" class="a-primary gap-2" data-specialist-action="open" data-assistant-id="${a.id}">View Assistant ${icon('arrow')}</button>`
        :'<button type="button" class="a-primary" data-specialist-action="preview-next">Next</button>'}`;
    dialog.querySelectorAll('[data-preview-index]').forEach(dot=>{
      if(Number(dot.dataset.previewIndex)===index)dot.setAttribute('aria-current','step');
      else dot.removeAttribute('aria-current');
    });
    dialog.scrollTop=0;
    dialog.querySelector('#assistant-dialog-title').focus({preventScroll:true});
  }
  function animatePreviewCapabilityPanel(grid) {
    const panel=grid.querySelector('.as-capability-expanded:not([hidden])');
    if(!panel)return;
    const panelHeight=panel.getBoundingClientRect().height;
    panel.style.setProperty('--preview-panel-height',`${panelHeight}px`);
    panel.setAttribute('data-preview-border-pending','');
    panel.addEventListener('animationend',()=>panel.removeAttribute('data-preview-border-pending'),{once:true});
    panel.classList.add('assistant-preview-panel-enter');
  }
  function openSuggestion(f) {
    const copy=suggestionCopy[f.id];if(!copy?.ready||!isOpenFinding(f))return;
    const a=assistants.find(a=>a.id===f.assistant);
    openDialog(`<span class="specialist-eyebrow text-xs">SUGGESTED ACTION</span><h2 id="assistant-dialog-title">${esc(copy.title)}</h2><p class="text-xs">From ${esc(a.title)}</p><h3 class="text-sm font-semibold">Why this is worth doing</h3><p class="text-sm">${esc(copy.reason)}</p><div class="specialist-next-step"><span class="text-xs">Proposed next step</span><p class="text-sm">${esc(copy.step)}</p></div><h3 class="text-sm font-semibold">Supporting evidence</h3><p class="text-sm">${esc(f.evidence)}</p><div class="specialist-source-list">${(f.supportingSources||[f.source]).map(source).join('')}</div><p class="text-xs">Reviewing this recommendation does not change connected systems. It remains available after the finding is acknowledged, until dismissed or the condition is verified resolved.</p><div class="assistant-dialog-actions"><button type="button" class="a-primary" data-specialist-action="finding" data-finding-id="${f.id}">View underlying finding</button><button type="button" class="a-secondary" data-specialist-action="dismiss-suggestion" data-finding-id="${f.id}">Dismiss suggestion</button></div>`);
  }
  function scheduleFindingAlert(f) {
    const reminder=new Date(Date.now()+60*60*1000);
    const localTime=new Date(reminder.getTime()-reminder.getTimezoneOffset()*60000).toISOString().slice(0,16);
    openDialog(`<h2 id="assistant-dialog-title">Schedule an Alert</h2><p>${esc(f.title)}</p>
      <form data-finding-alert-form data-finding-id="${f.id}">
        <label>Remind Me At<input type="datetime-local" name="remindAt" value="${localTime}" required></label>
        <p class="text-xs">Bring this finding back for review at the selected time.</p>
        <div class="assistant-dialog-actions"><button type="button" class="a-secondary" data-specialist-action="close">Cancel</button><button type="submit" class="a-primary">Schedule Alert</button></div>
      </form>`);
  }
  function startFindingChat(f) {
    delete f.alertAt;
    f.acknowledged=true;
    f.dismissed=false;
    render();
    openDialog(`<h2 id="assistant-dialog-title">Chat About This Finding</h2><p>${esc(f.title)}</p>
      <div class="as-finding-chat-log" role="log" aria-label="Finding Conversation">
        <p><strong>Ivy</strong><br>${esc(f.evidence)}</p>
      </div>
      <form data-finding-chat-form data-finding-id="${f.id}">
        <label>Your Message<textarea name="message" rows="3" required placeholder="Ask about this finding…"></textarea></label>
        <div class="assistant-dialog-actions"><span class="text-xs">Sample Chat</span><button type="submit" class="a-primary">Send</button></div>
      </form>`);
    dialog.querySelector('textarea').focus();
  }
  function checkFindingAlerts() {
    const due=findings.filter(f=>isOpenFinding(f)&&f.alertAt&&f.alertAt<=Date.now());
    if(!due.length)return;
    for(const f of due){delete f.alertAt;f.acknowledged=false;f.dismissed=false;}
    render();
    toast(due.length===1?`Reminder: ${due[0].title}`:`${due.length} findings are ready for review.`);
  }
  function openFinding(f) {
    const a=assistants.find(a=>a.id===f.assistant),resolved=f.condition==='resolved',closed=f.condition==='closed',related=findings.find(item=>item.id===f.related);
    const changeTone=['Worsened','Resurfaced'].includes(f.change)?'warning':f.change==='Improving'?'success':f.change==='New'?'info':'neutral';
    const reviewStatus=!isOpenFinding(f)?'Not Required':f.dismissed?'Dismissed':f.acknowledged?'Acknowledged':'Needs Review';
    const list=items=>`<ul class="specialist-checks text-sm">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
    const evidenceList=(items,glyph)=>`<ul class="specialist-checks specialist-evidence-list text-sm">${items.map(item=>`<li>${icon(glyph)}<span>${esc(item)}</span></li>`).join('')}</ul>`;
    openDialog(`<header class="specialist-finding-modal-header"><h2 id="assistant-dialog-title" class="font-bold">${esc(f.title)}</h2><div class="specialist-finding-context"><p class="specialist-finding-context-summary text-sm"><span class="specialist-finding-assistant-label bg-bluegray-100 rounded-sm hover:shadow-xs">${icon('assistants')}<span>${esc(a.title)}</span></span><span>· ${esc(f.affected)}</span></p><dl class="specialist-finding-timing text-xs"><div><dt>First Observed</dt><dd>${esc(f.first)}</dd></div><div><dt>Last Check</dt><dd>${esc(f.checked)}</dd></div></dl></div></header><div class="specialist-finding-modal-body"><div class="specialist-finding-statuses">${badge(f.severity,['critical','high'].includes(f.severity)?'danger':'neutral')}${badge(resolved?'Verified Resolved':closed?'Closed':'Open',resolved?'success':closed?'neutral':'info')}${badge(f.change,changeTone)}${badge(reviewStatus,isOpenFinding(f)&&!f.acknowledged&&!f.dismissed?'review':'neutral')}</div>${isOpenFinding(f)&&f.verification==='unavailable'?'<div class="specialist-verification-note text-sm">Current state cannot be verified. The last known condition remains open; missing evidence does not establish resolution.</div>':''}${closed?`<div class="specialist-resolution-note text-sm">${esc(f.closureReason||'This finding was closed when the assistant was turned off.')}</div>`:''}${resolved?`<div class="specialist-resolution-note text-sm"><strong class="font-semibold">Why this occurrence is closed</strong><p class="text-sm">${esc(f.resolution)}</p></div>`:''}<h3 class="specialist-finding-evidence-heading text-sm font-semibold"><span class="specialist-source-list">${(f.supportingSources||[f.source]).map(source).join('')}</span><span>Evidence</span></h3><p class="text-sm">${esc(f.evidence)}</p><div class="specialist-assessment"><section class="specialist-assessment-confirmed px-6 py-4"><h3 class="text-sm font-semibold">Confirmed</h3>${evidenceList(f.confirmed,'info')}</section><section class="px-6 py-4"><h3 class="text-sm font-semibold">Still uncertain</h3>${f.unknowns.length?evidenceList(f.unknowns,'question'):'<p class="text-sm">No unresolved questions about the closure of this occurrence.</p>'}</section></div>${f.hypotheses.length?`<section class="specialist-hypothesis"><h3 class="text-sm font-semibold">Supported hypotheses · not confirmed causes</h3>${list(f.hypotheses)}</section>`:''}<details class="specialist-affected" open><summary class="text-sm font-semibold">Affected objects · ${f.objects.length}</summary><div class="specialist-object-scroll"><table class="specialist-objects text-xs" aria-label="Affected objects for ${esc(f.reference)}"><thead><tr><th scope="col">Object</th><th scope="col">Type</th><th scope="col">Source record ID</th></tr></thead><tbody>${f.objects.map(([name,type,id])=>`<tr><td>${esc(name)}</td><td>${esc(type)}</td><td>${esc(id)}</td></tr>`).join('')}</tbody></table></div></details><h3 class="text-sm font-semibold">Occurrence History</h3>${list(f.history)}${related?`<div class="specialist-related"><p class="text-xs">${resolved?'This occurrence stays closed. A later recurrence has its own evidence and review status.':'New occurrence of a known condition. The earlier occurrence remains verified resolved.'}</p><button type="button" class="a-secondary" data-specialist-action="finding" data-finding-id="${related.id}">${resolved?'View new occurrence':'View previous occurrence'} · ${esc(related.reference)}</button></div>`:''}${f.next?`<div class="specialist-next-step"><span class="specialist-next-step-heading text-xs"><img src="../assets/ivy-stars-light.svg" width="20" height="21" alt=""/>Recommended next step</span><p class="text-sm">${esc(f.next)}</p></div>`:''}<p class="text-xs">${resolved?'Resolution is based on source evidence, not acknowledgment.':closed?'':'Acknowledging marks this finding as reviewed. It does not resolve the condition.'}</p></div><footer class="specialist-finding-modal-footer">
      <button type="button" class="a-secondary gap-2" data-specialist-action="${isShow?'close':'open'}" data-assistant-id="${a.id}" aria-label="${isShow?'Back to Assistant':'View Assistant'}">${isShow?`Back ${icon('arrow')}`:`${icon('arrow')} View Assistant`}</button>
      ${findingReviewControl(f,{modal:true})}
    </footer>`);
  }
  function configure(a,turnOn=false) {
    const activating=turnOn&&!a.enabled;
    openDialog(`<header class="assistant-config-heading flex items-start gap-3 pb-4 mb-4"><img src="assistant-creation/src/assets/nav-settings.svg" class="h-5 w-5 mt-1" alt=""/><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-5"><div><h2 id="assistant-dialog-title" class="text-base font-semibold m-0">Configure Assistant</h2><p class="text-sm">Sources, capabilities, and schedule for ${esc(a.title)}.</p></div><label class="assistant-config-power rounded-full" style="margin-right: -2.25rem; margin-top: 0.25rem;"><span class="text-xs font-medium" data-config-power-label>${a.enabled||activating?'On':'Off'}</span><span class="assistant-capability-switch"><input type="checkbox" role="switch" aria-label="Assistant Enabled" name="enabled" form="assistant-configuration" ${a.enabled||activating?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></label></div></div></header><nav class="assistants-tabs assistant-config-tabs mb-5" role="tablist" aria-label="Assistant Configuration"><button type="button" role="tab" id="assistant-config-tab-settings" data-config-tab="settings" aria-controls="assistant-config-settings" aria-selected="true" tabindex="0">Settings</button><button type="button" role="tab" id="assistant-config-tab-schedule" data-config-tab="schedule" aria-controls="assistant-config-schedule" aria-selected="false" tabindex="-1">Schedule</button></nav><form id="assistant-configuration" class="text-sm"><div class="assistant-config-fields"><section id="assistant-config-settings" role="tabpanel" aria-labelledby="assistant-config-tab-settings"><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Sources Used by This Assistant</legend><p class="assistant-source-help text-xs">Choose which connected sources this assistant can investigate.</p>${a.sources.map((name,i)=>{const connected=sourceIsConnected(name),state=!connected?'setup':name==='Microsoft 365'?'syncing':'synced',inputId=`assistant-source-${a.id}-${i}`;return `<div class="assistant-source-option" data-source-state="${state}"><label for="${inputId}" class="assistant-source-copy"><span class="assistant-source-identity flex">${source(name,'source-card')}</span><span class="assistant-source-connection text-xs">${!connected?'Not Connected':state==='syncing'?'Syncing...':'Synced'}</span></label><div class="flex items-center gap-3">${!connected?`<a href="#" class="assistant-source-setup text-xs" data-specialist-action="source-setup" data-source-name="${esc(name)}">Set up ${icon('arrow','h-3 w-3')}</a>`:''}<span class="assistant-capability-switch"><input id="${inputId}" type="checkbox" role="switch" aria-label="Use ${esc(name)} for ${esc(a.title)}" name="source" value="${esc(name)}" ${!connected?'disabled':a.selectedSources.includes(name)?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></div></div>`;}).join('')}</fieldset><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Capabilities</legend>${capabilitySets[a.id].map(([title,description],i)=>`<label class="assistant-capability-option text-sm"><span><span class="font-medium">${esc(title)}</span><span class="text-xs">${esc(description)}</span></span><span class="assistant-capability-switch"><input type="checkbox" role="switch" aria-label="${esc(title)}" name="capability" value="${i}" ${a.selectedCapabilities.includes(i)?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></label>`).join('')}</fieldset><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Notifications</legend><label class="assistant-capability-option text-sm"><span class="font-medium">Notify Me About New or Worsening Findings</span><span class="assistant-capability-switch"><input type="checkbox" role="switch" name="notify" aria-label="Notify Me About New or Worsening Findings" ${a.notify?'checked':''}/><span class="specialist-power-track" aria-hidden="true"></span></span></label><fieldset class="assistant-notification-channels border px-4 py-0 rounded-lg" ${a.notify?'':'disabled'}><legend class="text-xs font-normal">Notify Me Via...</legend>${[['in-app','In-App Alerts'],['email','Email']].map(([value,label])=>`<label class="specialist-notifications text-sm"><input type="checkbox" name="notifyChannel" value="${value}" ${a.notifyChannels.includes(value)?'checked':''}/>${label}</label>`).join('')}</fieldset></fieldset></section><section id="assistant-config-schedule" role="tabpanel" aria-labelledby="assistant-config-tab-schedule" hidden><div class="assistant-config-schedule bg-gray-100 p-4 rounded-lg"><fieldset class="assistant-config-section"><legend class="text-sm font-semibold">Schedule</legend><label class="text-sm">Schedule or Trigger<select name="cadence" id="assistant-cadence">${Object.entries(cadenceLabels).map(([key,label])=>`<option value="${key}" ${a.cadence===key?'selected':''}>${label}</option>`).join('')}</select></label><div id="assistant-schedule-fields" ${a.cadence==='manual'?'hidden':''}><div class="specialist-schedule-fields"><label class="text-sm">Start Time<input type="time" name="startTime" value="${a.startTime}"/></label><label class="text-sm">Time Zone<select name="timeZone">${Object.entries(timeZones).map(([key,label])=>`<option value="${key}" ${a.timeZone===key?'selected':''}>${label}</option>`).join('')}</select></label></div><label class="text-sm" id="assistant-weekly-day" ${a.cadence==='weekly'?'':'hidden'}>Day<select name="day">${weekdays.map(day=>`<option ${a.day===day?'selected':''}>${day}</option>`).join('')}</select></label><p id="assistant-schedule-note" class="text-xs">${a.cadence==='twice'?'Checks start at this time and repeat every 12 hours.':'Checks use the selected local time and time zone.'}</p></div><p id="assistant-manual-help" class="text-xs" ${a.cadence==='manual'?'':'hidden'}>No automatic checks. Use Run Now on the assistant page whenever you need an investigation.</p><p class="text-xs">Turning off stops future checks. Existing findings and history stay available.</p></fieldset></div></section><p id="assistant-config-error" class="specialist-form-error text-xs" role="alert"></p></div><div class="assistant-dialog-actions justify-end"><button type="button" class="a-secondary" data-specialist-action="cancel-config">Cancel</button><button type="submit" class="a-primary">${activating?'Turn On Assistant':'Save Config'}</button></div></form>`,true);
  }
  let assistantTour;
  function about(inAction=false) {
    const heading=document.body.dataset.assistantTourHeading??
      (isOnboardingPreview&&!inAction?'How Assistants Work':'Assistants in Action');
    assistantTour=window.IvyAssistantTour.create({dialog,esc,icon,openDialog,inAction,heading,onFinish(){
      if(inAction||isShow)return;
      if(!isOnboarding)view='all';
      render();
      $(isOnboardingPreview?'#assistant-preview-heading':isOnboarding?'#assistant-grid':'#tab-all').focus();
    }});
    assistantTour.open();
  }
  function handleClick(event) {
    const capability=event.target.closest('[data-show-capability]');
    const preview=event.currentTarget===dialog?assistantPreview:inlinePreview;
    const grid=capability?.closest('#as-capability-grid');
    if(grid&&preview){
      const {assistant,selectedCapability}=preview;
      if(preview===assistantPreview)preview.hasExploredCapabilities=true;
      preview.selectedCapability=window.IvyAssistantShow.toggleCapability(
        grid,assistant,Number(capability.dataset.showCapability),selectedCapability,{esc,icon,source});
      if(selectedCapability===null)animatePreviewCapabilityPanel(grid);
      return;
    }
    const button=event.target.closest('[data-specialist-action]');if(!button)return;
    const action=button.dataset.specialistAction;
    if(action==='summary-slide'){selectSummarySlide(Number(button.dataset.summarySlide));return;}
    if(action==='history-page'){historyPage=Number(button.dataset.historyPage);render();$('#assistant-history-pagination [aria-current="page"]')?.focus({preventScroll:true});return;}
    if(action==='choose-finding-action'){
      const option=findingReviewActions[button.dataset.findingAction];
      const menu=button.closest('.as-finding-action-menu');
      const primary=menu.parentElement.querySelector('[data-finding-primary]');
      primary.dataset.specialistAction=button.dataset.findingAction;
      const currentFinding=findings.find(item=>item.id===primary.dataset.findingId);
      primary.disabled=Boolean(button.closest('.specialist-finding-modal-footer')&&((button.dataset.findingAction==='acknowledge-open'&&currentFinding.acknowledged)||(!isOpenFinding(currentFinding)&&button.dataset.findingAction!=='chat-finding')));
      primary.setAttribute('aria-label',option.label);
      primary.title=option.label;
      primary.innerHTML=icon(option.glyph)+`<span>${button.dataset.findingAction==='acknowledge-open'?'Acknowledge':option.label}</span>`;
      menu.open=false;
      primary.focus();
      return;
    }
    if(assistantTour?.handle(action,button))return;
    if(action==='toggle-card-preview'){
      previewAssistantCards=!previewAssistantCards;
      button.setAttribute('aria-checked',String(previewAssistantCards));
      render();
      return;
    }
    if(action==='close'){dialog.close();return;}
    if(action==='preview-explore'){event.preventDefault();dialog.close();return;}
    if(action==='inline-explore'&&inlinePreview){
      const {assistant}=inlinePreview;
      inlineDetails.hidden=true;
      inlineDetails.replaceChildren();
      inlinePreview=undefined;
      $('[data-assistant-choices]').hidden=false;
      $(`#assistant-title-${assistant.id}`).closest('.assistant-card').focus();
      return;
    }
    if(['preview-back','preview-next','preview-step'].includes(action)){
      assistantPreview.index=action==='preview-step'?Number(button.dataset.previewIndex):
        assistantPreview.index+(action==='preview-next'?1:-1);
      renderAssistantPreview();
      return;
    }
    if(action==='source-setup'){event.preventDefault();toast(`Connect ${button.dataset.sourceName} from Sources to use it with this assistant.`);return;}
    if(action==='about'||action==='about-action'){about(action==='about-action');return;}
    if(action==='identity-demo'){window.IvyIdentityDemo.open({dialog,openDialog,icon,source,badge});return;}
    if(action==='all-findings'){allFindings();return;}
    if(action==='run-result'){
      const run=assistantRuns.find(item=>item.id===button.dataset.runId);
      if(run)openRunResult(run);
      return;
    }
    if(action==='all-runs'){openDialog(indexRecentRuns(true));return;}
    if(action==='undo-suggestion'){dismissedSuggestions.pop();saveSession();renderAttention();return;}
    if(action==='cancel-config'){dialog.close();return;}
    const f=findings.find(f=>f.id===button.dataset.findingId),a=assistants.find(a=>a.id===Number(button.dataset.assistantId));
    if(action==='dismiss-suggestion'&&f&&suggestionCopy[f.id]?.ready){if(!dismissedSuggestions.includes(f.id))dismissedSuggestions.push(f.id);if(dialog.open)dialog.close();saveSession();if(!isShow)renderAttention();toast('Suggestion dismissed. The finding remains open.');return;}
    if(action==='suggestion'&&f)openSuggestion(f);
    if(action==='finding'&&f)openFinding(f);
    if(action==='preview-assistant'&&a){
      if(inlineDetails)showInlineAssistant(a);
      else openAssistantPreview(a);
    }
    if(action==='open'&&a)openAssistant(a);
    if(action==='configure'&&a){dialog.dataset.assistantId=String(a.id);configure(a);}
    if(action==='toggle-power'&&a){if(a.enabled)stopAssistant(a);else{dialog.dataset.assistantId=String(a.id);configure(a,true);}}
    if(action==='run-now'&&a)runNow(a);
    if(action==='enable-assistant'&&a){dialog.dataset.assistantId=String(a.id);configure({...a,enabled:false},true);}
    if(action==='dismiss-finding'&&f&&isOpenFinding(f)){
      if(button.closest('.specialist-finding-modal-footer'))dialog.close();
      delete f.alertAt;
      f.dismissed=true;
      render();
      document.querySelector('[data-finding-primary], [data-open-findings-empty]')?.focus({preventScroll:true});
      toast('Finding dismissed.');
      return;
    }
    if(action==='schedule-finding-alert'&&f&&isOpenFinding(f)){scheduleFindingAlert(f);return;}
    if(action==='chat-finding'&&f){startFindingChat(f);return;}
    if(action==='acknowledge-open'&&f&&isOpenFinding(f)){
      if(button.closest('.specialist-finding-modal-footer'))dialog.close();
      delete f.alertAt;
      f.acknowledged=true;
      f.dismissed=false;
      render();
      document.querySelector('[data-finding-primary], [data-open-findings-empty]')?.focus({preventScroll:true});
      toast('Finding acknowledged.');
      return;
    }
    if(action==='acknowledge'&&f&&isOpenFinding(f)){delete f.alertAt;f.dismissed=false;f.acknowledged=!f.acknowledged;render();openFinding(f);toast(f.acknowledged?'Finding acknowledged. Its condition remains open.':'Finding marked as unreviewed.');}
  }
  $('.assistants-content').addEventListener('click',handleClick);dialog.addEventListener('click',handleClick);
  $('.assistants-content').addEventListener('keydown',event=>{
    const preview=event.target.matches('.assistant-card[data-specialist-action="preview-assistant"]');
    const open=event.target.matches('.assistant-card[data-specialist-action="open"],tr[data-specialist-action="open"]');
    if((event.key==='Enter'&&(preview||open))||(event.key===' '&&preview)){
      event.preventDefault();
      handleClick(event);
    }
  });
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
    const form=event.target;
    if(!form.matches('[data-finding-alert-form], [data-finding-chat-form]'))return;
    event.preventDefault();
    const f=findings.find(item=>item.id===form.dataset.findingId);
    if(!f)return;
    if(form.matches('[data-finding-alert-form]')){
      const input=form.elements.remindAt;
      const alertAt=new Date(input.value).getTime();
      input.setCustomValidity(Number.isFinite(alertAt)&&alertAt>Date.now()?'':'Choose a time in the future.');
      if(!input.reportValidity())return;
      f.alertAt=alertAt;
      f.acknowledged=true;
      f.dismissed=false;
      dialog.close();
      render();
      toast('Alert scheduled for '+new Date(alertAt).toLocaleString()+'.');
      return;
    }
    const message=form.elements.message.value.trim();
    if(!message)return;
    const log=dialog.querySelector('.as-finding-chat-log');
    log.insertAdjacentHTML('beforeend',`<p><strong>You</strong><br>${esc(message)}</p><p><strong>Ivy</strong><br>${esc(f.next||'Review the source evidence and affected objects for this finding.')}</p>`);
    form.reset();
    form.elements.message.focus();
    log.scrollTop=log.scrollHeight;
  });
  dialog.addEventListener('input',event=>{
    if(event.target.name==='remindAt')event.target.setCustomValidity('');
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
    if(!enabled)cancelAssistantRun(a);
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
  document.querySelectorAll('[data-findings-view]').forEach(button=>button.addEventListener('click',()=>{
    findingsView=button.dataset.findingsView==='table'?'table':'cards';
    render();
  }));
  document.querySelectorAll('[data-specialist-layout]').forEach(button=>button.addEventListener('click',()=>{layout=button.dataset.specialistLayout;render();}));
  document.querySelectorAll('[data-specialist-icon]').forEach(element=>element.innerHTML=icon(element.dataset.specialistIcon));
  $('#assistant-finding-state').addEventListener('change',event=>{findingState=event.target.value;render();});
  if(!isOnboarding)$('#assistant-status-filter').addEventListener('change',event=>{availability=['all','enabled','disabled'].includes(event.target.value)?event.target.value:'all';render();});
  if(!isOnboarding){$('#assistant-search').addEventListener('input',render);$('#assistant-search-form').addEventListener('submit',event=>{event.preventDefault();render();});}
  function clearSearch() {if(!isOnboarding)$('#assistant-search').value='';render();}
  if(!isOnboarding)$('#clear-filters').addEventListener('click',clearSearch);$('#empty-clear').addEventListener('click',clearSearch);
  } else {
    showPage=window.IvyAssistantShow.create({assistants,findings,owned,waiting,esc,icon,source,badge,stateLabel,cadenceLabels,scheduleLabel,powerToggle,findingRow,findingsTable,findingReviewControl,getAssistantRuns,runList,runHistoryTable,openDialog,previewFindings,previewFindingCard});
  }
  if(highlightsToggle){
    highlightsToggle.addEventListener('click',()=>{
      indexHighlightsHidden=!indexHighlightsHidden;
      $('#assistant-summary').hidden=indexHighlightsHidden;
      highlightsToggle.setAttribute('aria-expanded',String(!indexHighlightsHidden));
      highlightsToggle.querySelector('span').textContent=indexHighlightsHidden?'Show highlights':'Hide highlights';
    });
  }
  if(attentionRail){
    let scrollIdleTimer;
    attentionRail.addEventListener('scroll',()=>{
      attentionScrollbar.value=String(attentionRail.scrollLeft);
      attentionScrollbar.setAttribute('data-scrolling','');
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer=setTimeout(()=>attentionScrollbar.removeAttribute('data-scrolling'),150);
    },{passive:true});
    attentionScrollbar.addEventListener('input',()=>{
      attentionRail.scrollLeft=attentionScrollbar.valueAsNumber;
    });
    new ResizeObserver(updateAttentionScrollbar).observe(attentionRail);
  }
  render();
  checkFindingAlerts();
  setInterval(checkFindingAlerts,30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkFindingAlerts();});
  document.addEventListener('click',event=>{
    document.querySelectorAll('.as-finding-action-menu[open]').forEach(menu=>{
      if(!menu.parentElement.contains(event.target))menu.open=false;
    });
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    document.querySelectorAll('.as-finding-action-menu[open]').forEach(menu=>{
      menu.open=false;
      menu.querySelector('summary').focus();
      event.preventDefault();
      event.stopPropagation();
    });
  },true);
})();
