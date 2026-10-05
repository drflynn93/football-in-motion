import { fourthDownSummary } from './model.js';
import { playContext } from './events.js';
const d3=globalThis.d3;
const el=id=>document.getElementById(id);
export const percentage=value=>value===null?'N/A':`${Math.round(value*100)}%`;
export function decisionAppearance(event) {
  const decision=event.fourthDown;
  if(decision.decision==='punt')return {label:'Punt',fill:'#929292'};
  if(decision.decision==='field_goal')return decision.result==='made'?{label:'Made field goal',fill:'#c59a20'}:{label:'Missed field goal',fill:'url(#missed-field-goal)'};
  return decision.converted?{label:'Went for it · made it',fill:'#176844'}:{label:'Went for it · failed',fill:'#b43f3f'};
}
export const distanceLabel=event=>`${event.yardsNeeded}${event.goalToGo?' to goal':''}`;
export function createFourthDowns(model) {
  const defaultTeam=model.game.winner??model.teams[0];
  const scoreLine=scores=>model.teams.map(t=>`${model.game.teams[t].name} ${scores[t]}`).join('–');
  let available=false, expanded=false, pinned=null;
  function refresh() {
    const teams=el('fourth-team').value==='both'?model.teams:[el('fourth-team').value];
    el('fourth-summaries').replaceChildren();
    for(const team of teams) {
      const summary=fourthDownSummary(model.game.events,team);
      const card=document.createElement('div');card.className='fourth-summary';
      const name=document.createElement('h3');name.textContent=model.game.teams[team].name;card.append(name);
      const count=document.createElement('button');count.className='fourth-count';count.dataset.team=team;count.textContent=`${summary.count} fourth-down decisions`;count.setAttribute('aria-label',`Show ${model.game.teams[team].name} fourth-down decisions (${summary.count})`);count.addEventListener('click',()=>{expanded=true;el('fourth-bars').hidden=false;draw(teams);});card.append(count);
      const attempt=document.createElement('p');attempt.textContent=`Went for it: ${summary.attempts} / ${summary.count} (${percentage(summary.goRate)})`;
      const conversions=document.createElement('p');conversions.textContent=`Succeeded: ${summary.conversions} / ${summary.attempts} (${percentage(summary.successRate)})`;
      card.append(attempt,conversions);el('fourth-summaries').append(card);
    }
    if(expanded)draw(teams);
  }
  function details(event) {
    el('fourth-detail').hidden=false;
    el('fourth-detail-title').textContent=`${model.game.teams[event.team].name} · ${decisionAppearance(event).label}`;
    el('fourth-detail-context').textContent=`${playContext(event,model.game)} · ${event.yardsNeeded} ${event.yardsNeeded===1?'yard':'yards'} ${event.goalToGo?'to goal':'needed'} · Score before: ${scoreLine(event.scoreBefore)}; after: ${scoreLine(event.scoreAfter)}`;
    el('fourth-detail-play').textContent=event.description;
  }
  function dismiss() {pinned=null;el('fourth-detail').hidden=true;}
  el('close-fourth').onclick=dismiss;
  function draw(teams) {
    dismiss();
    const events=model.game.events.filter(e=>teams.includes(e.team)&&e.down===4&&!e.nullified&&e.fourthDown);
    const svg=d3.select(el('fourth-chart'));svg.selectAll('*').remove();
    el('fourth-empty').hidden=events.length>0;
    const width=el('fourth-chart').clientWidth<600?640:760;
    svg.attr('viewBox',`0 0 ${width} 390`);
    if(!events.length)return;
    const pattern=svg.append('defs').append('pattern').attr('id','missed-field-goal').attr('patternUnits','userSpaceOnUse').attr('width',8).attr('height',8).attr('patternTransform','rotate(45)');
    pattern.append('rect').attr('width',8).attr('height',8).attr('fill','#929292');pattern.append('rect').attr('width',4).attr('height',8).attr('fill','#b43f3f');
    const x=d3.scaleBand().domain(events.map(e=>e.id)).range([55,width-20]).padding(.28);
    const y=d3.scaleLinear().domain([0,Math.max(5,...events.map(e=>e.yardsNeeded))]).nice().range([285,35]);
    svg.append('g').attr('class','axis').attr('transform','translate(55,0)').call(d3.axisLeft(y).ticks(5));
    svg.append('line').attr('x1',55).attr('x2',width-20).attr('y1',285).attr('y2',285).attr('stroke','#333');
    svg.append('text').attr('class','axis-title').attr('x',55).attr('y',18).text('Yards needed on fourth down');
    svg.append('text').attr('class','axis-title').attr('x',width/2).attr('y',379).attr('text-anchor','middle').text('Decisions in game order');
    const bars=svg.append('g').selectAll('rect').data(events).join('rect').attr('class','decision-bar').attr('data-play-id',e=>e.id).attr('x',e=>x(e.id)).attr('width',x.bandwidth()).attr('y',e=>Math.min(y(e.yardsNeeded),282)).attr('height',e=>Math.max(3,285-y(e.yardsNeeded))).attr('fill',e=>decisionAppearance(e).fill).attr('role','button').attr('tabindex',0).attr('aria-label',e=>`${model.game.teams[e.team].name}, ${playContext(e,model.game)}, ${distanceLabel(e)} yards, ${decisionAppearance(e).label}`);
    bars.append('title').text(e=>`${distanceLabel(e)} yards · ${decisionAppearance(e).label}`);
    bars.on('pointerenter',(_event,e)=>details(pinned??e)).on('pointerleave',()=>{if(!pinned)el('fourth-detail').hidden=true;})
      .on('focus',(_event,e)=>details(pinned??e)).on('blur',()=>{if(!pinned)el('fourth-detail').hidden=true;})
      .on('click',(_event,e)=>{pinned=e;details(e);}).on('keydown',(event,e)=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();pinned=e;details(e);}
        if(event.key==='Escape')dismiss();
      });
    for(const event of events) {
      const centre=x(event.id)+x.bandwidth()/2;
      svg.append('text').attr('x',centre).attr('y',y(event.yardsNeeded)-8).attr('text-anchor','middle').attr('font-size',12).text(distanceLabel(event));
      const label=svg.append('text').attr('x',centre).attr('y',304).attr('text-anchor','middle').attr('font-size',11);
      label.append('tspan').attr('x',centre).text(event.team);
      label.append('tspan').attr('x',centre).attr('dy',15).text(event.quarter>=5?'OT':`Q${event.quarter}`);
      label.append('tspan').attr('x',centre).attr('dy',15).text(event.clock);
    }
  }
  el('fourth-team').onchange=()=>{if(available)refresh();};
  el('compare-fourth').onclick=()=>{el('fourth-team').value='both';refresh();};
  return {
    show() {if(available)return;available=true;el('fourth-analysis').hidden=false;el('fourth-team').value=defaultTeam;refresh();},
    reset() {available=false;expanded=false;dismiss();el('fourth-analysis').hidden=true;el('fourth-bars').hidden=true;el('fourth-team').value=defaultTeam;},
  };
}
