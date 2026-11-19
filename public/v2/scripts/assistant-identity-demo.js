window.IvyIdentityDemo={
  open({dialog,openDialog,icon,source,badge}) {
    const records=[
      ['Entra ID','Sign-In Logs','Alex Morgan · Sign-In Failed'],
      ['Microsoft 365','Application Activity','Alex Morgan · Exchange Online'],
      ['Intune','Device Inventory','FIN-LT-04 · Assigned to Alex Morgan']
    ];
    const sourceCards=()=>records.map(([name,label,detail])=>`
      <div class="identity-demo-card">
        ${source(name,'source-card')}
        <strong>${label}</strong>
        <small>${detail}</small>
        <span class="identity-demo-connector-anchor" aria-hidden="true"></span>
      </div>`).join('');
    const scenes=[
      {
        shot:'intro',
        title:'What Can Assistants<br>Do for You?',
        duration:2350
      },
      {
        shot:'setup',
        description:'Let’s follow an issue from the first report to a clear next step.',
        duration:3300
      },
      {
        shot:'sources',
        title:'Say Your Finance Team Can’t Sign In…',
        description:'But the clues are spread across three systems.',
        titleDuration:3100,
        keepTitle:true,
        duration:8950,
        art:`<div class="identity-demo-connection-copy" aria-hidden="true">
            <h2 class="font-semibold">Ivy Connects the Evidence</h2>
            <p>One user across three sources.</p>
          </div>
          <div class="identity-demo-source-flow">
            <svg class="identity-demo-connectors" aria-hidden="true" focusable="false">
              ${records.map(()=>'<path pathLength="1"/>').join('')}
            </svg>
            <div class="identity-demo-sources identity-demo-connected">${sourceCards()}</div>
            <div class="identity-demo-match-slot">
              <div class="identity-demo-callout identity-demo-match" aria-hidden="true">${icon('sparkles')} Alex Morgan · Exchange Online · FIN-LT-04</div>
            </div>
          </div>`
      },
      {
        shot:'schedule',
        title:'What Changed Overnight?',
        keepTitle:true,
        description:'At 8:00 AM, Ivy checks again.',
        duration:7650,
        art:`<div class="identity-demo-sources">
            <div class="identity-demo-card"><strong>Monday</strong><b class="identity-demo-count">4</b><small>Finance Users Affected</small></div>
            <div class="identity-demo-card"><strong>Tuesday</strong><b class="identity-demo-count">7</b><small>Finance Users Affected</small></div>
            <div class="identity-demo-card"><strong>Check Complete</strong><span class="identity-demo-count">${icon('check')}</span><small>Finding Updated</small></div>
          </div>
          <div class="identity-demo-callout">${icon('calendar')} Daily at 8:00 AM</div>`
      },
      {
        shot:'result',
        title:'Ivy Empowers Your Next Steps',
        titleDuration:1900,
        keepTitle:true,
        description:'Ivy brings the evidence and a suggested next step together.',
        duration:10200,
        art:`<div class="identity-demo-result">
          <article class="specialist-finding specialist-issue-row rounded-lg p-4 shadow-sm" data-severity="high">
            <span class="specialist-finding-icon" aria-hidden="true">${icon('alert')}</span>
            <div class="specialist-finding-copy">
              <div class="specialist-finding-top">${badge('High','danger')}${badge('Worsened','warning')}</div>
              <strong>7 Finance Users Face Repeated Sign-In Failures</strong>
              <small>26 failed sign-ins. 18 mention device compliance. The cause is still unconfirmed.</small>
              <span class="specialist-issue-meta">${source('Entra ID')}<span>·</span>${source('Intune')}</span>
            </div>
          </article>
          <div class="identity-demo-next-step">
            <strong>${icon('sparkles')} Suggested Next Step</strong>
            <small>Compare the failed sign-ins’ Conditional Access results with the affected devices’ Intune compliance records.</small>
          </div>
        </div>`
      }
    ];
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const defaultTitleDuration=2400;
    const exitDuration=460;
    const openingDuration=scenes[0].duration+scenes[1].duration;
    const stepStarts=scenes.map((_,i)=>i).filter(i=>i!==1);
    const playbackIcons={
      pause:'<path d="M9 5v14m6-14v14"/>',
      play:'<path d="m9 5 11 7-11 7z"/>',
      replay:'<path d="M4 11a8 8 0 1 1 2 6m-2-6V4m0 7h7"/>'
    };
    openDialog(`
      <div class="identity-demo" style="--demo-exit-duration: ${exitDuration}ms">
        <span id="assistant-dialog-title" class="sr-only">Assistants in Action · Identity &amp; Access Case Study</span>
        <div class="identity-demo-scenes">
          <div class="identity-demo-grid" aria-hidden="true"></div>
          <div class="identity-demo-tint" data-demo-shot="intro" aria-hidden="true"></div>
          <p class="identity-demo-label" hidden>Identity Case Study: Sign In Failures</p>
          ${scenes.map(scene=>`<section class="identity-demo-scene" data-demo-shot="${scene.shot}" inert aria-hidden="true">
            <div class="identity-demo-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="identity-demo-copy" data-demo-beat="title">
              ${scene.title?`<h2 class="font-semibold">${scene.title}</h2>`:''}
              ${scene.description?`<p>${scene.description}</p>`:''}
              ${scene.shot==='intro'?`<span class="identity-demo-opening-symbol">${icon('sparkles','h-8 w-8')}</span>`:''}
            </div>
            ${scene.art?`<div class="identity-demo-art" data-demo-beat="visual">${scene.art}</div>`:''}
          </section>`).join('')}
          ${reducedMotion?'':'<div class="identity-demo-progress" aria-hidden="true"><div class="identity-demo-progress-fill"></div></div>'}
        </div>
        ${reducedMotion?'':`<div class="identity-demo-navigation" role="group" aria-label="Animation Steps">
          <button type="button" class="identity-demo-step-button" data-demo-previous aria-label="Previous Step">${icon('arrowLeft')}</button>
          <button type="button" class="identity-demo-step-button" data-demo-next aria-label="Next Step">${icon('arrow')}</button>
          <span class="identity-demo-step-count" role="status"></span>
        </div>`}
        ${reducedMotion?'':'<button type="button" class="identity-demo-playback"></button>'}
      </div>`,false,true);
    const player=dialog.querySelector('.identity-demo');
    const stage=player.querySelector('.identity-demo-scenes');
    const tint=stage.querySelector('.identity-demo-tint');
    const playback=player.querySelector('.identity-demo-playback');
    const previousButton=player.querySelector('[data-demo-previous]');
    const nextButton=player.querySelector('[data-demo-next]');
    const stepCount=player.querySelector('.identity-demo-step-count');
    const progressFill=stage.querySelector('.identity-demo-progress-fill');
    const sections=[...player.querySelectorAll('.identity-demo-scene')];
    const titles=sections.map(section=>section.querySelector('[data-demo-beat="title"]'));
    const caseStudyLabel=player.querySelector('.identity-demo-label');
    const connection=player.querySelector('.identity-demo-connection-copy');
    const match=player.querySelector('.identity-demo-match');
    const flow=player.querySelector('.identity-demo-source-flow');
    const connectors=flow.querySelector('.identity-demo-connectors');
    const anchors=[...flow.querySelectorAll('.identity-demo-connector-anchor')];
    const matchSlot=match.parentElement;
    let index=0;
    let stepIndex=0;
    let elapsed=0;
    let previousTime;
    let frame;
    let playbackAction;

    function drawConnections() {
      const bounds=connectors.getBoundingClientRect();
      const target=matchSlot.getBoundingClientRect();
      const endY=target.top-bounds.top;
      const points=anchors.map(anchor=>{
        const point=anchor.getBoundingClientRect();
        return [point.left-bounds.left,point.top-bounds.top];
      });
      const stacked=Math.abs(points[0][0]-points[2][0])<24;
      // The angled center card shifts its anchor off the layout midpoint.
      const endX=stacked?target.left+target.width/2-bounds.left:points[1][0];
      const cardBounds=anchors.map(anchor=>anchor.parentElement.getBoundingClientRect());
      const lowestCardEdge=Math.max(...cardBounds.map(card=>card.bottom))-bounds.top;
      const junctionY=(lowestCardEdge+endY)/2;
      const railX=Math.max(...cardBounds.map(card=>card.right))-bounds.left+8;
      connectors.querySelectorAll('path').forEach((path,i)=>{
        const [x,y]=points[i];
        path.setAttribute('d',stacked
          ? `M ${x} ${y} H ${railX} V ${junctionY} H ${endX} V ${endY}`
          : `M ${x} ${y} V ${junctionY} H ${endX} V ${endY}`);
      });
    }
    function positionTitle() {
      if(!scenes[index].keepTitle)return;
      const section=sections[index];
      const title=titles[index];
      const titleCenter=title.offsetTop+title.offsetHeight/2;
      const targetCenter=scenes[index].shot==='sources'
        ? connection.parentElement.offsetTop+connection.offsetTop+connection.offsetHeight/2
        : section.clientHeight/2;
      title.style.setProperty('--demo-title-offset',`${targetCenter-titleCenter}px`);
    }
    const resizeObserver=new ResizeObserver(()=>{
      drawConnections();
      if(!reducedMotion)positionTitle();
    });
    resizeObserver.observe(flow);
    if(!reducedMotion){
      resizeObserver.observe(stage);
      resizeObserver.observe(connection);
      titles.forEach(title=>resizeObserver.observe(title));
    }
    dialog.addEventListener('close',()=>{
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
    },{once:true});
    if(reducedMotion){
      player.setAttribute('data-demo-still','');
      sections.find(section=>section.dataset.demoShot==='sources').before(caseStudyLabel);
      caseStudyLabel.hidden=false;
      connection.removeAttribute('aria-hidden');
      match.removeAttribute('aria-hidden');
      for(const section of sections){
        section.inert=false;
        section.removeAttribute('aria-hidden');
      }
      drawConnections();
      return;
    }
    function show(next) {
      for(const panel of sections[index].querySelectorAll('[data-demo-beat]')){
        panel.setAttribute('aria-hidden','true');
      }
      index=next;
      elapsed=0;
      player.removeAttribute('data-demo-linking');
      player.removeAttribute('data-demo-matched');
      connection.setAttribute('aria-hidden','true');
      match.setAttribute('aria-hidden','true');
      tint.dataset.demoShot=scenes[index].shot;
      stepIndex=stepStarts.findLastIndex(start=>start<=index);
      const count=`Step ${stepIndex+1} of ${stepStarts.length}`;
      if(stepCount.textContent!==count)stepCount.textContent=count;
      previousButton.disabled=stepIndex===0;
      nextButton.disabled=stepIndex===stepStarts.length-1;
      updateProgress();
      caseStudyLabel.hidden=index<2;
      sections.forEach((section,sceneIndex)=>{
        const active=sceneIndex===index;
        section.inert=!active;
        section.setAttribute('aria-hidden',String(!active));
      });
      setBeat('title');
      positionTitle();
    }
    function updateProgress() {
      const sceneDuration=scenes[index].duration;
      const offset=index===1?scenes[0].duration:0;
      const duration=(index<2?openingDuration:sceneDuration)-(index<scenes.length-1?exitDuration:0);
      const progress=(offset+Math.min(elapsed,sceneDuration))/duration;
      progressFill.style.transform=`scaleX(${Math.min(progress,1)})`;
    }
    function setBeat(beat) {
      player.removeAttribute('data-demo-exiting');
      player.dataset.beat=beat;
      for(const panel of sections[index].querySelectorAll('[data-demo-beat]')){
        const visible=panel.dataset.demoBeat===beat ||
          (scenes[index].keepTitle&&panel.dataset.demoBeat==='title');
        panel.setAttribute('aria-hidden',String(!visible));
      }
    }
    function setPlaybackAction(action) {
      playbackAction=action;
      const label={pause:'Pause Animation',play:'Play Animation',replay:'Replay Animation'}[action];
      playback.setAttribute('aria-label',label);
      playback.title=label;
      playback.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${playbackIcons[action]}</svg>`;
    }
    function start() {
      show(0);
      stage.querySelector('.identity-demo-grid').getAnimations().forEach(animation=>{
        animation.currentTime=0;
        animation.play();
      });
      resumePlayback();
    }
    function pauseStageAnimations() {
      stage.getAnimations({subtree:true})
        .filter(animation=>animation.playState==='running')
        .forEach(animation=>animation.pause());
    }
    function resumePlayback() {
      stage.getAnimations({subtree:true})
        .filter(animation=>animation.playState==='paused')
        .forEach(animation=>animation.play());
      setPlaybackAction('pause');
      previousTime=undefined;
      frame=window.requestAnimationFrame(tick);
    }
    function goToStep(offset) {
      const next=stepStarts[stepIndex+offset];
      if(next===undefined)return;
      show(next);
      previousTime=undefined;
      if(playbackAction==='play'){
        for(const animation of [...titles[index].getAnimations({subtree:true}),...tint.getAnimations()]){
          animation.finish();
        }
        pauseStageAnimations();
      }
      if(playbackAction==='replay')resumePlayback();
    }
    previousButton.addEventListener('click',()=>goToStep(-1));
    nextButton.addEventListener('click',()=>goToStep(1));
    playback.addEventListener('click',()=>{
      if(playbackAction==='replay'){
        start();
      }else if(playbackAction==='pause'){
        window.cancelAnimationFrame(frame);
        pauseStageAnimations();
        setPlaybackAction('play');
      }else{
        resumePlayback();
      }
    });
    function tick(time) {
      if(!dialog.open||!dialog.contains(player))return;
      if(previousTime!==undefined&&!document.hidden)elapsed+=Math.min(time-previousTime,100);
      previousTime=time;
      const scene=scenes[index];
      updateProgress();
      const titleDuration=scene.titleDuration??defaultTitleDuration;
      if(scene.art&&player.dataset.beat==='title'&&elapsed>=titleDuration)setBeat('visual');
      if(scene.shot==='sources'){
        const sourcesShiftAt=titleDuration+1600;
        const sourcesConnectAt=sourcesShiftAt+430;
        if(elapsed>=sourcesShiftAt&&!player.hasAttribute('data-demo-linking')){
          player.setAttribute('data-demo-linking','');
          titles[index].setAttribute('aria-hidden','true');
          connection.removeAttribute('aria-hidden');
        }
        if(elapsed>=sourcesConnectAt&&!player.hasAttribute('data-demo-matched')){
          drawConnections();
          player.setAttribute('data-demo-matched','');
          match.removeAttribute('aria-hidden');
        }
      }
      const titleIsLeaving=player.dataset.beat==='title'&&scene.art&&!scene.keepTitle;
      const beatEnd=titleIsLeaving?titleDuration:scene.duration;
      if((titleIsLeaving||index<scenes.length-1)&&elapsed>=beatEnd-exitDuration){
        player.setAttribute('data-demo-exiting','');
      }
      if(elapsed>=scene.duration){
        if(index===scenes.length-1){
          setPlaybackAction('replay');
          return;
        }
        show(index+1);
      }
      frame=window.requestAnimationFrame(tick);
    }
    start();
  }
};
