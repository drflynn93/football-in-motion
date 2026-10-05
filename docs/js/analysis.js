import { statSeries } from './model.js';
import { Playback } from './playback.js';
const d3 = globalThis.d3;
const el = id => document.getElementById(id);
export function createAnalysis(model) {
  const [left,right]=model.teams, defaultTeam=model.game.winner??left;
  let animation=null, selected='passing', available=false;
  const rows=[['Passing yards','passing'],['Rushing yards','rushing'],['Total return yards','returns'],['Interceptions made','interceptions'],['Opponent fumbles recovered','recoveries']];
  const body=el('box-rows'); body.replaceChildren();
  for(const [label,key] of rows) {
    const row=document.createElement('tr'), heading=document.createElement('th'); heading.scope='row';
    if (key==='passing'||key==='rushing') {
      const button=document.createElement('button');button.textContent=label;button.className='stat-link';button.dataset.stat=key;
      button.addEventListener('click',()=>open(key));heading.append(button);
    } else heading.textContent=label;
    row.append(heading);
    for(const team of model.teams) {
      const cell=document.createElement('td');cell.dataset.team=team;cell.dataset.stat=key;
      if(key==='passing'||key==='rushing') {
        const button=document.createElement('button');button.className='stat-link';button.textContent=model.totals[team][key];button.setAttribute('aria-label',`${model.game.teams[team].name} ${label.toLowerCase()}, ${model.totals[team][key]}. Open chart`);button.addEventListener('click',()=>open(key));cell.append(button);
      } else cell.textContent=model.totals[team][key];
      row.append(cell);
    }
    body.append(row);
  }
  function open(stat) {
    if (!available) return;
    if(el('stat-analysis').hidden)el('stat-team').value=defaultTeam;
    selected=stat;el('stat-analysis').hidden=false;
    for(const button of body.querySelectorAll('button[data-stat]'))button.setAttribute('aria-pressed',String(button.dataset.stat===stat));
    draw();
  }
  function draw() {
    animation?.stop();
    const teams=el('stat-team').value==='both'?model.teams:[el('stat-team').value];
    const heading=selected==='passing'?'Passing':'Rushing';
    el('stat-title').textContent=`${heading} yards over time`;
    el('stat-summary').textContent=teams.map(t=>`${model.game.teams[t].name}: ${model.totals[t][selected]} yards`).join(' · ');
    const svg=d3.select(el('stat-chart'));svg.selectAll('*').remove();
    const width=el('stat-chart').clientWidth<600?640:760,height=410;
    svg.attr('viewBox',`0 0 ${width} ${height}`).attr('aria-label',`${heading} yards over game time: ${el('stat-summary').textContent}`);
    const end=model.game.events.at(-1).elapsed;
    const all=teams.flatMap(t=>statSeries(model,selected,t));
    const x=d3.scaleLinear().domain([0,end]).range([55,width-85]);
    const y=d3.scaleLinear().domain([Math.min(0,...all.map(p=>p.yards)),Math.max(10,...all.map(p=>p.yards))]).nice().range([330,35]);
    svg.append('g').attr('class','axis').attr('transform','translate(0,330)').call(d3.axisBottom(x).tickValues([0,900,1800,2700,3600]).tickFormat(t=>t/60));
    svg.append('g').attr('class','axis').attr('transform','translate(55,0)').call(d3.axisLeft(y).ticks(5));
    svg.append('text').attr('class','axis-title').attr('x',55).attr('y',17).text(`${heading} yards`);
    svg.append('text').attr('class','axis-title').attr('x',width/2).attr('y',390).attr('text-anchor','middle').text('Elapsed game time (minutes, including overtime)');
    for(const q of model.quarters) {
      svg.append('line').attr('x1',x(q.elapsed)).attr('x2',x(q.elapsed)).attr('y1',35).attr('y2',330).attr('stroke','#ddd').attr('stroke-dasharray','3 4');
      svg.append('text').attr('x',x(q.elapsed)).attr('y',365).attr('text-anchor','middle').attr('font-size',11).attr('fill','#666').text(q.quarter>=5?'OT':`Q${q.quarter}`);
    }
    const paths=Object.fromEntries(teams.map(t=>[t,svg.append('path').attr('class','stat-path').attr('data-team',t).attr('fill','none').attr('stroke',t===right?'#176844':'#202020').attr('stroke-width',2.5).attr('stroke-dasharray',t===left?'5 4':null)]));
    const tips=Object.fromEntries(teams.map(t=>[t,svg.append('text').attr('class','team-name').attr('data-stat-tip',t).text(model.game.teams[t].name)]));
    const totals=[];
    for(const q of model.quarters) for(const t of teams) {
      const group=svg.append('g').attr('class','quarter-total').attr('data-quarter',q.quarter).attr('data-team',t);
      group.append('circle').attr('cx',x(q.elapsed)).attr('cy',y(q.totals[t][selected])).attr('r',4).attr('fill','#fff').attr('stroke',t===right?'#176844':'#202020');
      const placeLeft=q.quarter>=5||t===left&&teams.length===2;
      const offset=q.quarter===5?(t===right?-13:18):(t===right?16:-10);
      group.append('text').attr('x',x(q.elapsed)+(placeLeft?-6:6)).attr('y',y(q.totals[t][selected])+offset).attr('text-anchor',placeLeft?'end':'start').attr('font-size',11).attr('fill','#333').attr('paint-order','stroke').attr('stroke','#fff').attr('stroke-width',3).text(`${teams.length===2?t+' ':''}${q.totals[t][selected]}`);
      totals.push({group,q});
    }
    const line=d3.line().x(p=>x(p.elapsed)).y(p=>y(p.yards)).curve(d3.curveStepAfter);
    animation=new Playback(8000,time=>{
      const elapsed=end*time/8000;
      for(const t of teams) {
        const points=statSeries(model,selected,t,elapsed);
        paths[t].attr('d',line(points));
        const last=points.at(-1);
        tips[t].attr('x',x(last.elapsed)+8).attr('y',y(last.yards)+(teams.length===2?(t===left?-12:30):-9));
      }
      for(const {group,q} of totals)group.attr('visibility',elapsed>=q.elapsed?'visible':'hidden');
    });
    animation.onUpdate(0);animation.start();
  }
  el('stat-team').onchange=()=>{if(available)draw();};
  el('compare-stat').onclick=()=>{el('stat-team').value='both';draw();};
  return {
    show() {available=true;el('box-score').hidden=false;},
    reset() {animation?.stop();available=false;el('box-score').hidden=true;el('stat-analysis').hidden=true;el('stat-team').value=defaultTeam;},
    setInactive(inactive) {animation?.setInactive(inactive);},
  };
}
