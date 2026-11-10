/* The Collections in Action walkthrough pattern, using the current assistant journey. */
window.IvyAssistantTour={
  create({dialog,esc,icon,openDialog,onFinish}) {
    let index=0;
    const surface=(x,y,w,h)=>`<rect class="assistant-tour-surface" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
    const text=(x,y,value)=>`<text x="${x}" y="${y}">${esc(value)}</text>`;
    const toggle=(x,y,on=true)=>`<rect x="${x}" y="${y}" width="30" height="18" rx="9" class="${on?'assistant-tour-toggle':'assistant-tour-muted'}"/><circle cx="${x+(on?21:9)}" cy="${y+9}" r="6" class="assistant-tour-thumb"/>`;
    const glyph=(name,x,y)=>icon(name,'h-5 w-5').replace('<svg ',`<svg x="${x}" y="${y}" width="20" height="20" `);
    const steps=[
      {title:'Meet Your Specialists',description:'Choose from Identity & Access, Endpoint Health, Endpoint Security, Network Health, and Application & Licensing. Each investigates a focused area of your connected systems and surfaces findings and recommended next steps.',art:[['identity',28,'Identity'],['health',126,'Health'],['security',224,'Security']].map(([name,x,label])=>surface(x,24,68,52)+glyph(name,x+24,32)+text(x+9,66,label)).join('')+surface(77,92,68,52)+glyph('network',101,100)+text(86,134,'Network')+surface(175,92,68,52)+glyph('licensing',199,100)+text(182,134,'Licensing')},
      {title:'Choose What It Investigates',description:'Open a specialist to understand how it helps, then use Config to choose its sources and capabilities. A source’s sync status describes its platform connection; its switch controls whether this assistant uses it. Enable the assistant when you’re ready.',art:surface(40,14,240,134)+text(56,36,'Identity & Access')+toggle(230,23)+`<path class="assistant-tour-line" d="M56 46h208"/>`+text(56,68,'Entra ID · Synced')+toggle(230,54)+text(56,102,'Sign-In Failures')+toggle(230,88)+text(56,133,'MFA Problems')+toggle(230,119,false)},
      {title:'Set Its Routine',description:'In Schedule, choose when investigations run or use on-demand checks. Run Now starts an extra check whenever you need one. In Settings, choose notifications through In-App Alerts, Email, or both.',art:surface(32,25,140,118)+`<path d="M32 55h140M66 17v16M137 17v16"/><path class="assistant-tour-line" d="M52 75h95M52 96h95M52 117h60"/>`+`<circle class="assistant-tour-highlight" cx="229" cy="82" r="37"/><path d="M229 61v23l14 9"/>`+text(52,45,'Schedule')+text(193,140,'Run Now')},
      {title:'See What Needs Attention',description:'Overview brings important findings together across your assistants. Open an assistant for its Top Priority finding, trends, and all open findings. Recent Runs shows when checks completed and whether a run encountered an error.',art:surface(24,22,140,116)+text(39,44,'What Needs Attention')+`<rect class="assistant-tour-highlight" x="36" y="56" width="116" height="44" rx="8"/>`+text(45,74,'7 Finance users')+text(45,90,'Sign-in failures')+`<path d="M173 79h23m-7-7 7 7-7 7"/>`+surface(206,22,90,116)+text(216,44,'Overview')+`<path class="assistant-tour-line" d="M218 61h64M218 72h45"/><path d="M219 118v-19m14 19V91m14 27V105m14 13V85m14 33V96"/>`},
      {title:'Understand the Finding',description:'Open a finding to review who or what is affected, the supporting evidence, what remains uncertain, and the recommended next step. For example, seven Finance users have repeated sign-in failures—but the cause still needs investigation. Recommendations do not automatically change connected systems.',art:surface(32,12,256,138)+text(48,35,'7 Finance Users · Sign-In Failures')+`<path class="assistant-tour-line" d="M48 47h224"/>`+glyph('check',48,58)+text(78,72,'26 failed sign-ins recorded')+glyph('info',48,87)+text(78,101,'Cause not yet established')+glyph('arrow',48,116)+text(78,130,'Compare access requirements')},
      {title:'Follow What Changes',description:'Acknowledge a finding to mark it reviewed, not resolved. Repeated checks refresh an ongoing issue; meaningful deterioration brings it back to attention. Resolution needs fresh evidence. If the problem returns after resolution, History links the new occurrence to the earlier one.',art:`<path class="assistant-tour-line" d="M35 70h250"/>`+[[40,'New'],[120,'Worsened'],[200,'Resolved'],[280,'Resurfaced']].map(([x,label],i)=>`<circle class="${i===2?'assistant-tour-surface':'assistant-tour-highlight'}" cx="${x}" cy="70" r="13"/>${i===2?`<path d="m194 70 4 4 8-9"/>`:''}<text x="${x}" y="106" text-anchor="middle">${label}</text>`).join('')+`<path class="assistant-tour-line" d="M200 124v11h80v-11"/>`}
    ];
    function render(focus=false) {
      const step=steps[index];
      dialog.querySelector('[data-assistant-tour-art]').innerHTML=`<svg class="assistant-tour-illustration" viewBox="0 0 320 160">${step.art}</svg>`;
      dialog.querySelector('[data-assistant-tour-count]').textContent=`Step ${index+1} of ${steps.length}`;
      const title=dialog.querySelector('#assistant-dialog-title');title.textContent=step.title;
      dialog.querySelector('#assistant-tour-description').textContent=step.description;
      dialog.querySelector('[data-specialist-action="tour-back"]').hidden=index===0;
      dialog.querySelector('[data-specialist-action="tour-next"]').textContent=index===steps.length-1?'Explore Assistants':'Next';
      dialog.querySelectorAll('[data-tour-index]').forEach(dot=>{if(Number(dot.dataset.tourIndex)===index)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');});
      if(focus)title.focus({preventScroll:true});
    }
    function open() {
      index=0;
      openDialog(`<header class="assistant-tour-top flex items-center gap-2"><img src="../assets/ivy-stars-light.svg" width="22" height="23" alt=""/><span class="text-lg font-medium">Assistants in Action</span></header><div class="assistant-tour-body"><div class="assistant-tour-art rounded-lg" data-assistant-tour-art aria-hidden="true"></div><p class="assistant-tour-step text-xs font-semibold" data-assistant-tour-count></p><h2 id="assistant-dialog-title" class="text-2xl font-semibold" tabindex="-1"></h2><p id="assistant-tour-description" class="assistant-tour-description text-sm"></p></div><footer class="assistant-tour-footer"><nav class="assistant-tour-dots" aria-label="Walkthrough Steps">${steps.map((step,i)=>`<button type="button" data-specialist-action="tour-step" data-tour-index="${i}" aria-label="Step ${i+1}: ${esc(step.title)}"></button>`).join('')}</nav><div class="assistant-tour-actions"><button type="button" class="a-secondary" data-specialist-action="tour-back">Back</button><button type="button" class="a-primary" data-specialist-action="tour-next">Next</button></div></footer>`,false,true);
      dialog.setAttribute('aria-describedby','assistant-tour-description');
      render(true);
    }
    function handle(action,button) {
      if(!action.startsWith('tour-'))return false;
      if(action==='tour-next'&&index===steps.length-1){dialog.close();onFinish();return true;}
      if(action==='tour-next')index=Math.min(steps.length-1,index+1);
      if(action==='tour-back')index=Math.max(0,index-1);
      if(action==='tour-step')index=Number(button.dataset.tourIndex);
      render(true);return true;
    }
    return {open,handle};
  }
};
