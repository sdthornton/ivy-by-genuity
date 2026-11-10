/* Overview reads the same run records and outputs as the workflow results modal. */
window.IvyWorkflowOverview = (() => {
  const esc = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function init({workflows,actions,icon,showAll}) {
    const root=document.getElementById('workflow-overview-panel');
    let period=168,query='',reviewQueue=[],lastDismissed=null,dismissing=false,reviewType=null,activeSlide=0,slideAnimating=false,slideVersion=0,highlightsHidden=false;
    let selectedReviewKey=null,recentRuns=[];
    const dismissed=new Set();
    const highlightsToggle=document.getElementById('workflow-highlights-toggle');
    highlightsToggle.addEventListener('click',()=>{
      highlightsHidden=!highlightsHidden;
      const banner=root.querySelector('#workflow-highlights');
      if(banner)banner.hidden=highlightsHidden;
      highlightsToggle.setAttribute('aria-expanded',String(!highlightsHidden));
      highlightsToggle.querySelector('span').textContent=highlightsHidden?'Show highlights':'Hide highlights';
      hideChartTooltip();
    });
    const reviewDialog=document.createElement('dialog');
    reviewDialog.id='workflow-review-dialog';
    reviewDialog.className='wo-review-dialog ivy-modal px-4 py-5 sm:px-6 sm:py-6 2xl:px-12 2xl:py-12';
    reviewDialog.setAttribute('aria-labelledby','workflow-review-modal-heading');
    document.querySelector('body').append(reviewDialog);
    const when=run=>{
      const minutes=Math.max(0,Math.floor((Date.now()-run.at)/60000));
      return minutes<1?'just now':minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`;
    };
    const status=run=>`<span class="workflow-result-status text-xs${run.status==='Incomplete'?' bg-danger-50':''}" data-status="${run.status}">${run.status}</span>`;
    const sourceLine=(a,run)=>`<span>${esc(a.title)}</span><span aria-hidden="true">·</span><span>${when(run)}</span>`;
    const findingTypes=[
      ['source-connection','Source connection failures'],['missing-records','Missing source records'],
      ['endpoint-detection','Endpoint detections'],['email-delivery','Email delivery failures'],
      ['backup-failure','Failed backups'],['access-sharing','Access and sharing checks'],
      ['license-usage','License usage checks'],['recovery-followup','Recovery follow-ups'],
      ['security-followup','Security follow-ups']
    ];
    function describeReviewItem(item) {
      const type=item.kind==='Run issue'?(item.run.status==='Failed'?'source-connection':'missing-records'):
        ({1:'access-sharing',2:'access-sharing',3:'endpoint-detection',5:'email-delivery',7:'backup-failure',11:'license-usage',13:'access-sharing',14:'recovery-followup',15:'security-followup'}[item.workflow.id]||'security-followup');
      const sourceSystems=item.sourceSystems??item.action?.sourceSystems??[];
      const recommendations=item.kind==='Run issue'?item.output.actions:
        item.action?[item.action]:item.recommendedAction?[{title:item.recommendedAction}]:[];
      return {...item,findingType:type,sourceSystems,recommendations,foundAt:item.run.at,severity:item.severity??null,recommendedAction:item.recommendedAction||item.action?.title||item.output.actions[0]?.title||'Check source access and retry the workflow.'};
    }
    const reviewKey=item=>`${item.run.id}:${item.kind}:${item.title}`;
    const reviewItem=(item,inQueue=false)=>{
      const {workflow:a,run,kind,title}=item;
      const emphasis=kind==='Run issue'?'blocked':kind==='Finding'?'finding':'suggestion';
      const key=reviewKey(item);
      const kindLabel=item.severity==='critical'?'Critical Finding':kind==='Run issue'?'Run Issue':kind;
      const open=inQueue
        ? `data-overview-action="select-review" aria-controls="workflow-run-context" aria-pressed="${selectedReviewKey===key}" aria-label="${esc(title)}, ${kindLabel}"`
        : `data-overview-action="result" data-workflow-id="${a.id}" data-run-id="${run.id}" aria-label="Open ${esc(title)} for ${esc(a.title)}" title="Open result"`;
      const context=inQueue
        ? `<span class="wo-review-kind text-xs" data-kind="${kindLabel}">${kindLabel}</span>`
        : `<p class="wo-review-workflow text-xs"><a class="wo-review-workflow-name" href="#" target="_blank" rel="noopener" title="${esc(a.title)}">${esc(a.title)}</a><span class="wo-review-bullet" aria-hidden="true">&bull;</span><time datetime="${new Date(run.at).toISOString()}" title="${esc(new Date(run.at).toLocaleString())}">${when(run)}</time></p>`;
      const sources=item.sourceSystems.length
        ? `<span aria-hidden="true">&middot;</span><span class="iwa-sources">${item.sourceSystems.map(window.IvyWorkflowActivity.sourceLabel).join('')}</span>`
        : '';
      return `<li class="wo-review-item" data-emphasis="${emphasis}" data-review-item-key="${esc(key)}" data-finding-type="${item.findingType}">
        <div class="wo-review-item-content">
          <div class="wo-review-copy">
            <div class="flex gap-3 items-center">
              <div class="wo-review-icon">${icon(kind==='Recommendation'?'sparkleTwo':'incomplete','h-4 w-4')}</div>
              <div class="wo-review-text">
                <h4 class="text-sm font-semibold mb-0" title="${esc(title)}">
                  <button type="button" class="wo-review-open" ${open}><span class="wo-review-title-label">${esc(title)}</span></button>
                </h4>
                <div class="wo-review-meta text-xs">${context}${sources}</div>
              </div>
            </div>
          </div>
          <div class="wo-review-controls">
            <button type="button" class="wo-run-action wo-status-tooltip" data-overview-action="result" data-workflow-id="${a.id}" data-run-id="${esc(run.id)}" aria-label="View Full Results for ${esc(title)}">
              ${icon('arrowRight','h-4 w-4')}<span class="wo-tooltip text-xs" role="tooltip">View Full Results</span>
            </button>
            <button type="button" class="wo-run-action wo-status-tooltip" data-overview-action="dismiss" data-review-key="${esc(key)}" aria-label="Dismiss ${esc(title)}">
              ${icon('close','h-4 w-4')}<span class="wo-tooltip text-xs" role="tooltip">Dismiss</span>
            </button>
          </div>
        </div>
      </li>`;
    };
    function relatedRun(item) {
      const {workflow,run}=item;
      const date=new Date(run.at);
      return `<p class="wo-related-workflow text-sm font-medium">${esc(workflow.title)}</p>
        <p class="wo-related-meta wo-related-run-meta text-xs">
          ${status(run)}
          <span>Run #${run.number}</span><span aria-hidden="true">&middot;</span><time datetime="${date.toISOString()}">${esc(date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}))}</time>
        </p>
        <button type="button" class="wo-result-link text-sm font-medium" data-overview-action="result" data-workflow-id="${workflow.id}" data-run-id="${esc(run.id)}">View Run Results ${icon('arrowRight','h-4 w-4')}</button>`;
    }
    function runContext(item,hasReviewItems) {
      if(!item)return `${hasReviewItems?`<div class="wo-context-section">
        <h4 class="mb-1 text-sm font-semibold">Select a Review Item</h4>
        <p class="wo-related-meta text-sm">Select an item to see its related run and Ivy recommendations.</p>
      </div>`:''}
      <div class="wo-context-section">
        <h4 class="text-sm font-semibold">Recent Runs</h4>
        ${recentRuns.length?`<ul class="wo-recent-list">${recentRuns.map(({workflow,run})=>`<li>
          <button type="button" class="wo-recent-run" data-overview-action="result" data-workflow-id="${workflow.id}" data-run-id="${esc(run.id)}">
            <span class="wo-recent-run-name"><span class="text-sm font-medium">${esc(workflow.title)}</span>
            <time class="wo-related-meta text-xs" datetime="${new Date(run.at).toISOString()}">${when(run)}</time></span>
            ${status(run)}
          </button>
        </li>`).join('')}</ul>`:'<p class="wo-related-meta text-sm">No recent runs in this view.</p>'}
      </div>`;
      return `<div class="wo-context-section">
        <h4 class="text-sm font-semibold">Reviewing</h4>
        <p class="wo-related-workflow text-sm font-medium">${esc(item.title)}</p>
      </div>
      <div class="wo-context-section">
        <h4 class="flex items-center gap-2 text-sm font-semibold"><svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><use href="#workflows-nav-glyph"></use></svg>Related Run</h4>
        <div class="wo-related-run-content">${relatedRun(item)}</div>
      </div>
      <div class="wo-context-section">
        <h4 class="flex items-center gap-2 text-sm font-semibold"><img class="h-4 w-4 shrink-0" src="../assets/ivy-stars-light.svg" alt=""/>Ivy Recommendations</h4>
        ${item.recommendations.length?`<ul class="wo-context-recommendations">${item.recommendations.map(({title,description})=>`<li class="iwa-next-action">
          <p class="text-sm font-medium">${esc(title)}</p>
          ${description?`<p class="wo-related-meta text-xs">${esc(description)}</p>`:''}
        </li>`).join('')}</ul>`:'<p class="wo-related-meta text-sm">Nothing to recommend for this item.</p>'}
      </div>`;
    }
    const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'});
    const dayKey=at=>dayFormat.format(new Date(at));
    function periodDayKeys() {
      const today=dayKey(Date.now()),count=period===336?14:7;
      return Array.from({length:count},(_,index)=>new Date(new Date(today+'T12:00:00Z').getTime()-(count-1-index)*86400000).toISOString().slice(0,10));
    }
    function collect() {
      const dayKeys=new Set(periodDayKeys());
      return workflows.filter(a=>!a.archived&&a.status!=='draft').flatMap(a=>actions.history(a).filter(run=>dayKeys.has(dayKey(run.at))).map(run=>({workflow:a,run,output:actions.report(a,run)}))).filter(item=>`${item.workflow.title} ${item.workflow.description} ${item.workflow.category} ${item.workflow.tags.join(' ')} ${item.output.headline} ${item.output.summary} ${item.output.sources.join(' ')} ${item.output.actions.map(a=>a.title+' '+a.description).join(' ')}`.toLowerCase().includes(query)).sort((a,b)=>b.run.at-a.run.at);
    }
    function lineChartData(runs) {
      const days=periodDayKeys().map(key=>{
        const at=new Date(key+'T12:00:00Z');
        return {key,label:new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:'UTC'}).format(at),date:new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(at),values:[0,0,0]};
      });
      const included=runs.filter(item=>days.some(day=>day.key===dayKey(item.run.at)));
      included.forEach(({run,output})=>{
        const day=days.find(day=>day.key===dayKey(run.at));
        day.values[0]+= ['Failed','Incomplete'].includes(run.status)?1:0;
        day.values[1]+=(output.findings||[]).length;
        day.values[2]+=output.actions.length;
      });
      const series=[['Run issues','error-400'],['Findings','indigo-300'],['Recommendations','blue-600']].map(([label,color],index)=>({label,color,index,total:days.reduce((sum,day)=>sum+day.values[index],0)}));
      return {days,series,workflows:new Set(included.filter(item=>['Failed','Incomplete'].includes(item.run.status)||item.output.findings?.length||item.output.actions.length).map(item=>item.workflow.id)).size};
    }
    // Monotone cubic interpolation stays between each pair of daily values.
    function smoothLine(points) {
      const slopes=points.slice(1).map((point,index)=>(point[1]-points[index][1])/(point[0]-points[index][0]));
      const tangents=points.map((point,index)=>index===0?slopes[0]:index===points.length-1?slopes.at(-1):slopes[index-1]*slopes[index]<=0?0:(slopes[index-1]+slopes[index])/2);
      slopes.forEach((slope,index)=>{
        if(!slope){tangents[index]=0;tangents[index+1]=0;return;}
        const magnitude=Math.hypot(tangents[index]/slope,tangents[index+1]/slope);
        if(magnitude>3){const limit=3/magnitude;tangents[index]*=limit;tangents[index+1]*=limit;}
      });
      return `M ${points[0].join(' ')} `+points.slice(1).map((point,index)=>{
        const previous=points[index],third=(point[0]-previous[0])/3;
        const slope=slopes[index],roundness=1;
        const startSlope=slope+(tangents[index]-slope)*roundness;
        const endSlope=slope+(tangents[index+1]-slope)*roundness;
        return `C ${previous[0]+third} ${previous[1]+startSlope*third}, ${point[0]-third} ${point[1]-endSlope*third}, ${point.join(' ')}`;
      }).join(' ');
    }
    const lineChartLegend=series=>`<div class="wo-line-legend text-xs">${series.map(item=>`<span><i style="background:var(--ivy-color-${item.color})"></i>${item.label}<strong class="font-semibold">${item.total}</strong></span>`).join('')}</div>`;
    function lineChartMarkup({days,series}) {
      const step=Math.max(1,Math.ceil(Math.max(1,...days.flatMap(day=>day.values))/4)),max=step*4;
      const plotLeft=28,plotRight=608;
      const x=index=>plotLeft+index*(plotRight-plotLeft)/(days.length-1),y=value=>204-value/max*172;
      const ticks=Array.from({length:5},(_,index)=>index*step);
      const curves=series.map(item=>smoothLine(days.map((day,index)=>[x(index),y(day.values[item.index])])));
      const gradientDefs=`<defs>${series.map(item=>`<linearGradient id="wo-line-fill-${item.index}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style="stop-color:var(--ivy-color-${item.color})" stop-opacity="0.05"/><stop offset="100%" style="stop-color:var(--ivy-color-${item.color})" stop-opacity="0"/></linearGradient>`).join('')}</defs>`;
      const areas=[...series].reverse().map(item=>`<path class="wo-line-area" d="${curves[item.index]} L ${x(days.length-1)} ${y(0)} L ${x(0)} ${y(0)} Z" style="fill:url(#wo-line-fill-${item.index});stroke:none;pointer-events:none"/>`).join('');
      return `<div class="wo-line-scroll"><svg class="wo-line-chart" viewBox="0 0 640 260" role="img" aria-labelledby="wo-line-title wo-line-description"><title id="wo-line-title">Findings by day</title><desc id="wo-line-description">${days.map(day=>`${day.date}: ${series.map(item=>`${day.values[item.index]} ${item.label.toLowerCase()}`).join(', ')}`).join('; ')}. Includes dismissed items.</desc>${gradientDefs}${areas}${ticks.map(value=>`<line x1="${plotLeft}" x2="${plotRight}" y1="${y(value)}" y2="${y(value)}" style="stroke:var(--ivy-color-gray-200);stroke-width:1"/><text x="${plotLeft-8}" y="${y(value)+4}" text-anchor="end" class="text-xs" style="fill:var(--ivy-color-gray-500);stroke:none">${value}</text>`).join('')}${days.map((day,index)=>`<text x="${x(index)}" y="228" text-anchor="middle" class="text-xs" style="fill:var(--ivy-color-gray-500);stroke:none">${day.label}</text>`).join('')}${series.map(item=>`<path class="wo-line-series" d="${curves[item.index]}" style="fill:none;stroke:var(--ivy-color-${item.color});stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>${days.map((day,index)=>`<g class="wo-line-dot" tabindex="0" aria-label="${day.date} — ${item.label}: ${day.values[item.index]}" data-chart-tooltip="${day.date} — ${item.label}: ${day.values[item.index]}"><circle cx="${x(index)}" cy="${y(day.values[item.index])}" r="3.5" style="fill:var(--ivy-color-${item.color});stroke:var(--ivy-color-gray-25);stroke-width:1.5"/></g>`).join('')}`).join('')}</svg></div><div id="wo-chart-point-tooltip" class="wo-chart-point-tooltip text-xs" role="tooltip" hidden></div>`;
    }
    function metricChart(values,bars,key,color,days,label) {
      const max=Math.max(1,...values);
      const points=values.map((value,index)=>[4+index*232/(values.length-1),59-value/max*51]);
      const path=smoothLine(points),id=`wo-metric-gradient-${key}`;
      const drawing=bars?points.map(([x,y],index)=>`<rect x="${x-7}" y="${y}" width="14" height="${60-y}" rx="3" style="fill:var(--ivy-color-${color});stroke:none"><title>${days[index].date}: ${values[index]} ${label}</title></rect>`).join(''):`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop style="stop-color:var(--ivy-color-${color})" stop-opacity="0.12"/><stop offset="1" style="stop-color:var(--ivy-color-${color})" stop-opacity="0"/></linearGradient></defs><path d="${path} L236 62 L4 62Z" style="fill:url(#${id});stroke:none"/><path d="${path}" style="fill:none;stroke:var(--ivy-color-${color});stroke-width:2.2;stroke-linecap:round"/>`;
      return `<svg class="wo-metric-chart" viewBox="0 0 240 64" role="img" aria-label="${esc(label)} by day: ${days.map((day,index)=>`${day.date}: ${values[index]}`).join(', ')}">${drawing}</svg><div class="wo-metric-axis text-xs" aria-hidden="true"><span>${days[0].date}</span><span>${days.at(-1).date}</span></div>`;
    }
    function render(search=query) {
      slideVersion++;slideAnimating=false;
      const nextQuery=search.trim().toLowerCase();
      query=nextQuery;
      const runs=collect(),byWorkflow=new Map();
      recentRuns=runs.slice(0,4);
      runs.forEach(item=>{if(!byWorkflow.has(item.workflow.id))byWorkflow.set(item.workflow.id,item);});
      const latest=[...byWorkflow.values()];
      const recommendations=latest.flatMap(item=>item.output.actions.map(action=>({...item,action})));
      const attention=latest.filter(item=>['Failed','Incomplete'].includes(item.run.status));
      const issueIds=new Set(attention.map(item=>item.workflow.id));
      const allReviewItems=[
        ...attention.map(item=>{
          const failed=item.run.status==='Failed';
          const source=failed?item.output.sources[0]:item.output.sources.at(-1);
          const title=failed?`Unable to access ${source}.`:`Unable to retrieve ${source} records.`;
          return {...item,kind:'Run issue',title,sourceSystems:[source]};
        }),
        ...latest.flatMap(item=>(item.output.findings||[]).map(finding=>({...item,kind:'Finding',title:finding.title,severity:finding.severity,recommendedAction:finding.recommendedAction,sourceSystems:finding.sourceSystems}))),
        ...recommendations.filter(item=>!issueIds.has(item.workflow.id)&&!item.output.findings?.length).map(item=>({...item,kind:'Recommendation',title:item.action.title.replace(/^Review the /,'Check ').replace(/^Review /,'Check ')}))
      ].map(describeReviewItem);
      const reviewItems=allReviewItems.filter(item=>!dismissed.has(reviewKey(item)));
      const visibleReviewItems=reviewItems.slice(0,7);
      const selectedReview=visibleReviewItems.find(item=>reviewKey(item)===selectedReviewKey);
      selectedReviewKey=selectedReview?reviewKey(selectedReview):null;

      const outputs=runs.filter(item=>['Completed','Incomplete'].includes(item.run.status));
      const running=runs.filter(item=>item.run.status==='Running').length;
      const periodName=period===336?'Last 14 days':'Last 7 days';
      const chartData=lineChartData(runs);
      const breakdown=chartData.series.map(item=>({count:item.total}));
      const pendingWorkflows=chartData.workflows;
      const totalItems=chartData.series.reduce((sum,item)=>sum+item.total,0);
      const activity=window.IvyWorkflowActivity.select({reviewItems,runningRuns:latest.filter(item=>item.run.status==='Running')});
      const statuses=[['Completed','Completed'],['Incomplete','Partial'],['Failed','Failed'],['Running','Running']].map(([status,label])=>({label,count:runs.filter(item=>item.run.status===status).length}));
      const outputHistory=chartData.days.map(day=>runs.filter(item=>dayKey(item.run.at)===day.key&&['Completed','Incomplete'].includes(item.run.status)).length);
      const metricCards=`<article class="wo-metric wo-run-summary"><h3 class="text-sm font-semibold">Recent runs</h3><p class="wo-metric-description text-xs">Workflow execution at a glance</p><div class="wo-run-summary-body"><div class="wo-run-summary-total"><strong class="wo-metric-value text-display-sm font-semibold">${runs.length}</strong><span class="text-xs">Runs</span></div><dl class="wo-run-statuses">${statuses.map(status=>`<div><dt class="text-xs">${status.label}</dt><dd class="text-xl font-semibold">${status.count}</dd></div>`).join('')}</dl></div></article>`+[
        ['Outputs available','Completed and partial run outputs',outputs.length,'indigo-400',outputHistory,false,'outputs'],
        ['Recommended next steps','Actions suggested across all runs',chartData.series[2].total,'blue-600',chartData.days.map(day=>day.values[2]),true,'recommendations'],
        ['Runs needing attention','Failed or incomplete runs',chartData.series[0].total,'error-400',chartData.days.map(day=>day.values[0]),false,'run issues']
      ].map(([label,description,value,color,values,bars,key])=>`<article class="wo-metric" style="--wo-metric-color:var(--ivy-color-${color})"><h3 class="text-sm font-semibold">${label}</h3><p class="wo-metric-description text-xs">${description}</p><strong class="wo-metric-value text-display-sm font-semibold">${value}</strong><p class="wo-metric-period text-xs">${periodName}</p>${metricChart(values,bars,key.replace(/ /g,'-'),color,chartData.days,key)}</article>`).join('');

      root.innerHTML=`<header id="workflow-highlights" ${highlightsHidden?'hidden':''} class="wo-intro px-6 pt-6 pb-4 rounded-xl relative border" role="region" aria-roledescription="carousel" aria-label="Workflow highlights"><div class="wo-intro-dots" aria-hidden="true"></div><div class="wo-intro-highlights"><span class="wo-highlights-pill px-2 py-1 text-xs">${icon('sparkleTwo','h-4 w-4')}Workflow highlights</span></div><div class="wo-slider-stage relative grid"><div class="wo-intro-layout wo-overview-slide" id="wo-overview-results" role="group" aria-roledescription="slide" aria-label="1 of 2: Workflow results" aria-hidden="${activeSlide!==0}" ${activeSlide!==0?'inert':''}><div class="wo-intro-copy"><h2 class="text-display-sm font-bold mb-3 text-gray-700">What your workflows have brought back</h2><p class="text-base text-gray-500 mb-10">${totalItems?`${totalItems} ${totalItems===1?'item surfaced':'items surfaced'} across ${pendingWorkflows} ${pendingWorkflows===1?'workflow':'workflows'}. See what was found and where to focus next.`:'No findings or recommendations in this period. New items will appear here after your workflows run.'}</p><div class="wo-intro-stats">${[
        [totalItems,'Items surfaced'],
        [breakdown[0].count+breakdown[1].count,'Issues & findings'],
        [breakdown[2].count,'Recommendations'],
        [pendingWorkflows,'Workflows']
      ].map(([value,label])=>`<div><strong class="text-xl font-semibold">${value}</strong><span class="text-xs">${label}</span></div>`).join('')}</div></div><figure class="wo-pending-chart wo-finding-chart" aria-labelledby="wo-pending-chart-heading"><figcaption><div class="wo-line-heading"><span id="wo-pending-chart-heading" class="text-sm font-medium">Findings over time</span></div><label class="wo-period text-xs"><select id="workflow-overview-period" aria-label="Overview time period"><option value="168" ${period===168?'selected':''}>Last 7 days</option><option value="336" ${period===336?'selected':''}>Last 14 days</option></select></label></figcaption>${lineChartMarkup(chartData)}${lineChartLegend(chartData.series)}</figure></div>
        <div class="wo-metrics wo-overview-slide" id="wo-overview-metrics" role="group" aria-roledescription="slide" aria-label="2 of 2: At a glance" aria-hidden="${activeSlide!==1}" ${activeSlide!==1?'inert':''}>${metricCards}</div></div><div class="wo-slider-controls relative flex items-center justify-center gap-2 mt-3">${['Workflow results','At a glance'].map((label,index)=>`<button type="button" class="w-2 h-2 p-0 rounded-full" data-overview-action="slide" data-wo-slide="${index}" aria-label="Show ${label} slide" aria-controls="${index===0?'wo-overview-results':'wo-overview-metrics'}" aria-pressed="${activeSlide===index}"></button>`).join('')}</div></header>${window.IvyWorkflowActivity.render({...activity,canUndo:lastDismissed!==null})}
        <section class="wo-section wo-review-queue" aria-labelledby="workflow-review-heading">
          <header class="wo-section-heading">
            <div class="wo-review-heading-label">
              <h3 id="workflow-review-heading" class="text-base font-semibold">To Review</h3>
              <span class="wo-review-visible-count text-xs" aria-label="Showing ${visibleReviewItems.length} of ${reviewItems.length} undismissed review items">${visibleReviewItems.length} of ${reviewItems.length}</span>
            </div>
            <div class="wo-review-header-actions">
              ${lastDismissed?`<button type="button" class="wo-review-undo text-xs" data-overview-action="undo-dismiss" aria-label="Undo Last Dismissal">${icon('undo','h-3 w-3')}Undo Dismissal</button>`:''}
            </div>
          </header>
          <div class="wo-columns">
            ${runs.length?`<div class="min-w-0">
              <ul id="workflow-review-items" class="wo-review-list">${visibleReviewItems.length?visibleReviewItems.map(item=>reviewItem(item,true)).join(''):'<li class="wo-review-empty text-sm">All caught up for this period.</li>'}</ul>
              ${reviewItems.length>visibleReviewItems.length?'<button type="button" class="wo-review-undo wo-review-more text-xs" data-overview-action="review-all">View All Review Items</button>':''}
            </div>`:
              `<div class="wo-empty p-4"><h4 class="text-base font-semibold">No recent workflow results</h4><p class="text-sm">${query?'Try a different search or choose a longer time period.':'Choose a longer time period, or run a saved workflow to see its output here.'}</p><button type="button" class="a-secondary" data-overview-action="all">View all workflows</button></div>`}
            <aside id="workflow-run-context" class="wo-run-context" aria-label="Workflow run context" aria-live="polite">${runContext(selectedReview,visibleReviewItems.length>0)}</aside>
          </div>
        </section>`;
      reviewQueue=reviewItems;
      if(reviewDialog.open)drawReviewDialog();
    }
    async function showOverviewSlide(next) {
      if(![0,1].includes(next)||next===activeSlide||slideAnimating)return;
      slideAnimating=true;
      const version=slideVersion;
      const outgoing=root.querySelector(activeSlide===0?'#wo-overview-results':'#wo-overview-metrics');
      const incoming=root.querySelector(next===0?'#wo-overview-results':'#wo-overview-metrics');
      const duration=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:280;
      try {
        if(outgoing.animate)await outgoing.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(24px)'}],{duration,easing:'ease-in',fill:'forwards'}).finished;
        if(version!==slideVersion)return;
        outgoing.setAttribute('aria-hidden','true');outgoing.inert=true;
        outgoing.getAnimations?.().forEach(animation=>animation.cancel());
        incoming.setAttribute('aria-hidden','false');incoming.inert=false;
        activeSlide=next;
        root.querySelectorAll('[data-wo-slide]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.woSlide)===next)));
        if(incoming.animate)await incoming.animate([{opacity:0,transform:'translateX(-24px)'},{opacity:1,transform:'translateX(0)'}],{duration,easing:'ease-out'}).finished;
      } catch {} // A data refresh can replace slides during a transition.
      finally {if(version===slideVersion)slideAnimating=false;}
    }
    function drawReviewDialog() {
      const scrollTop=reviewDialog.querySelector('.wo-review-modal-body')?.scrollTop||0;
      const modalItems=reviewType?reviewQueue.filter(item=>item.findingType===reviewType):reviewQueue;
      const typeLabel=findingTypes.find(([type])=>type===reviewType)?.[1];
      reviewDialog.innerHTML=`<header class="wo-review-modal-header"><h2 id="workflow-review-modal-heading" class="text-base font-semibold">${typeLabel?esc(typeLabel):'To Review'}</h2><div class="wo-review-header-actions">${reviewType?'<button type="button" class="wo-review-undo text-xs" data-overview-action="review-all">View all types</button>':''}${lastDismissed?`<button type="button" class="wo-review-undo text-xs" data-overview-action="undo-dismiss">${icon('undo','h-3 w-3')}Undo dismissal</button>`:''}<button type="button" class="wo-run-action" data-overview-action="review-close" aria-label="Close review list">${icon('close','h-4 w-4')}</button></div></header><div class="wo-review-modal-body"><ul class="wo-review-list">${modalItems.length?modalItems.map(item=>reviewItem(item)).join(''):'<li class="wo-review-empty text-sm">All caught up for this period. Items in this group have been dismissed.</li>'}</ul></div>`;
      reviewDialog.querySelector('.wo-review-modal-body').scrollTop=scrollTop;
    }
    function positionTooltip(event) {
      const point=event.target.closest('.wo-line-dot');
      if(point){
        const tooltip=root.querySelector('#wo-chart-point-tooltip');
        tooltip.textContent=point.dataset.chartTooltip;
        tooltip.hidden=false;
        const rect=point.getBoundingClientRect(),bounds=tooltip.getBoundingClientRect();
        tooltip.style.left=Math.max(8,Math.min(rect.left+rect.width/2-bounds.width/2,window.innerWidth-bounds.width-8))+'px';
        tooltip.style.top=Math.max(8,rect.top-bounds.height-10)+'px';
        return;
      }
      const trigger=event.target.closest('.wo-status-tooltip');
      if(!trigger)return;
      const tooltip=trigger.querySelector('.wo-tooltip');
      const rect=trigger.getBoundingClientRect();
      const width=tooltip.getBoundingClientRect().width;
      tooltip.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-width-8))+'px';
      tooltip.style.top=Math.max(8,rect.top-tooltip.getBoundingClientRect().height-8)+'px';
    }
    function hideChartTooltip() {
      const tooltip=root.querySelector('#wo-chart-point-tooltip');
      if(tooltip)tooltip.hidden=true;
    }
    root.addEventListener('pointerout',event=>{const point=event.target.closest('.wo-line-dot');if(point&&!point.contains(event.relatedTarget))hideChartTooltip();});
    root.addEventListener('focusout',event=>{if(event.target.closest('.wo-line-dot'))hideChartTooltip();});
    root.addEventListener('scroll',hideChartTooltip,true);
    root.addEventListener('pointerover',positionTooltip);
    root.addEventListener('focusin',positionTooltip);
    reviewDialog.addEventListener('pointerover',positionTooltip);
    reviewDialog.addEventListener('focusin',positionTooltip);
    root.addEventListener('change',event=>{if(['workflow-overview-period','workflow-chart-comparison-period'].includes(event.target.id)){period=Number(event.target.value);render();}});
    root.addEventListener('keydown',event=>{
      if(event.key==='Escape')hideChartTooltip();
    });
    async function handleAction(event) {
      const button=event.target.closest('[data-overview-action], [data-workflow-activity-open], [data-workflow-activity-dismiss], [data-workflow-activity-undo]');if(!button)return;
      const action=button.dataset.workflowActivityDismiss!==undefined?'dismiss':button.dataset.workflowActivityUndo!==undefined?'undo-dismiss':button.dataset.overviewAction;
      if(['review-all','review-type'].includes(action)){reviewType=action==='review-type'?button.dataset.findingType:null;drawReviewDialog();reviewDialog.querySelector('.wo-review-modal-body').scrollTop=0;if(!reviewDialog.open)reviewDialog.showModal();return;}
      if(action==='slide'){await showOverviewSlide(Number(button.dataset.woSlide));return;}
      if(action==='review-close'){reviewDialog.close();return;}
      if(action==='select-review'){
        const key=button.closest('.wo-review-item').dataset.reviewItemKey;
        const item=key===selectedReviewKey?null:reviewQueue.find(item=>reviewKey(item)===key);
        root.querySelector('[data-overview-action="select-review"][aria-pressed="true"]')?.setAttribute('aria-pressed','false');
        button.setAttribute('aria-pressed',String(Boolean(item)));
        selectedReviewKey=item?key:null;
        root.querySelector('#workflow-run-context').innerHTML=runContext(item,reviewQueue.length>0);
        return;
      }
      if(['dismiss','undo-dismiss'].includes(action)){
        if(dismissing)return;
        const isDismiss=action==='dismiss';
        const card=button.closest?.('.wo-review-item, .iwa-result-shell');
        const animate=isDismiss&&card?.animate&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if(animate){
          dismissing=true;
          try { await card.animate([{opacity:1},{opacity:0}],{duration:160,easing:'ease-out',fill:'forwards'}).finished; }
          catch {} // A rerender can cancel an animation while the user changes views.
        }
        const hosts=[root,...(reviewDialog.open?[reviewDialog]:[])];
        const animationKey=item=>(item.classList?.contains('iwa-result-shell')?'activity:':'review:')+item.dataset.reviewItemKey;
        const positions=animate?hosts.map(host=>new Map(Array.from(host.querySelectorAll('.wo-review-item, .iwa-result-shell')).map(item=>[animationKey(item),item.getBoundingClientRect().top]))):[];
        if(isDismiss){lastDismissed=button.dataset.reviewKey;dismissed.add(lastDismissed);}
        else {dismissed.delete(lastDismissed);lastDismissed=null;}
        render();
        if(animate)hosts.forEach((host,index)=>host.querySelectorAll('.wo-review-item, .iwa-result-shell').forEach(item=>{
          const previousTop=positions[index].get(animationKey(item));
          const offset=previousTop===undefined?10:previousTop-item.getBoundingClientRect().top;
          item.animate([{transform:`translateY(${offset}px)`,opacity:previousTop===undefined?0:1},{transform:'translateY(0)',opacity:1}],{duration:220,easing:'ease-out'});
        }));
        dismissing=false;
        (reviewDialog.open?reviewDialog:root).querySelector(action==='dismiss'?'[data-workflow-activity-undo], [data-overview-action="undo-dismiss"]':'.wo-review-item button')?.focus();
        return;
      }
      if(action==='all'){showAll();return;}
      const a=workflows.find(a=>a.id===Number(button.dataset.workflowId));
      if(!a)return;
      if(reviewDialog.open)reviewDialog.close();
      actions.results(a,button.dataset.runId);
    }
    root.addEventListener('click',handleAction);
    reviewDialog.addEventListener('click',handleAction);
    return {render,collect};
  }
  return {init};
})();
