const d3 = globalThis.d3;
export const playContext = (event, game) => `${event.quarter===5?'Overtime':`Quarter ${event.quarter}`} · ${event.clock}${event.team?` · ${game.teams[event.team].name}`:''}${event.down?` · ${event.down}${['st','nd','rd','th'][event.down-1]} & ${event.goalToGo?'goal':event.yardsNeeded}`:''}`;

export function createEventInspector(svgElement, model, schedule, render, clock) {
  const bubble=document.getElementById('event-bubble'), close=document.getElementById('close-event');
  const title=document.getElementById('event-title'), context=document.getElementById('event-context'), description=document.getElementById('event-description');
  const markers=[]; const occupied=new Map();
  for (const [index,snapshot] of model.snapshots.entries()) {
    if (!snapshot.event.tags.length) continue;
    const team=snapshot.event.tags.includes('Interception')?snapshot.event.returnTeam??(snapshot.event.team==='BUF'?'KC':'BUF'):snapshot.event.team;
    if (!team) continue;
    const [x,y]=render.coordinate(team,snapshot.after[team]);
    const key=`${x.toFixed(0)},${y.toFixed(0)}`; const n=occupied.get(key)??0; occupied.set(key,n+1);
    markers.push({index,snapshot,team,x:x+(n===0?0:(n%2?1:-1)*7),y:y-Math.floor(n/3)*7,at:4000+schedule[index].end});
  }
  const layer=d3.select(svgElement).append('g').attr('class','event-markers');
  const dots=layer.selectAll('circle').data(markers).join('circle').attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',5).attr('fill','#f5cf45').attr('stroke','#6d5a14').attr('stroke-width',1).attr('role','button').attr('aria-label',d=>`${d.snapshot.event.tags.join(', ')} · ${playContext(d.snapshot.event,model.game)} · ${d.snapshot.event.players.join(', ') || 'Player unavailable'}`).attr('data-play-id',d=>d.snapshot.event.id);
  let hovered=null, focused=null, pinned=null, lastTime=0, shown=null;
  const dismissed=new Set();
  function show(marker, isPinned=false) {
    if (!marker) { bubble.hidden=true; shown=null; return; }
    if (shown!==marker) {
      const event=marker.snapshot.event;
      title.textContent=event.tags.join(' · ');
      context.textContent=`${playContext(event,model.game)} · Bills ${event.scoreAfter.BUF}–Chiefs ${event.scoreAfter.KC}`;
      description.textContent=event.description;
      shown=marker;
    }
    bubble.hidden=false; bubble.classList.toggle('pinned',isPinned); close.hidden=!isPinned;
    const area=svgElement.getBoundingClientRect();
    const centre=marker.x/render.width*area.width;
    const half=bubble.offsetWidth/2;
    bubble.style.left=`${Math.max(half+4,Math.min(area.width-half-4,centre))}px`;
    bubble.style.top=`${Math.max(bubble.offsetHeight+8,marker.y/610*area.height-14)}px`;
  }
  function refresh() {
    const transient=markers.findLast(m=>m.at<=lastTime&&lastTime-m.at<3000&&!dismissed.has(m.index));
    show(pinned??hovered??focused??transient,Boolean(pinned));
  }
  dots.on('pointerenter',(_event,m)=>{hovered=m;clock.inspect('hover',true);refresh();})
    .on('pointerleave',()=>{hovered=null;clock.inspect('hover',false);refresh();})
    .on('focus',(_event,m)=>{focused=m;clock.inspect('focus',true);refresh();})
    .on('blur',()=>{focused=null;clock.inspect('focus',false);refresh();})
    .on('click',(_event,m)=>{pinned=m;clock.inspect('pinned',true);refresh();})
    .on('keydown',(event,m)=>{
      if (event.key==='Enter'||event.key===' ') {event.preventDefault();pinned=m;clock.inspect('pinned',true);refresh();}
      if (event.key==='Escape') dismiss();
    });
  function dismiss() {
    if(shown)dismissed.add(shown.index);
    pinned=null; hovered=null; focused=null;
    for(const reason of ['pinned','hover','focus'])clock.inspect(reason,false);
    if(document.activeElement?.matches('.event-markers circle'))document.activeElement.blur();
    refresh();
  }
  close.onclick=dismiss;
  return {
    update(time) {
      lastTime=time;
      dots.attr('visibility',m=>time>=m.at?'visible':'hidden').attr('tabindex',m=>time>=m.at?0:-1);
      refresh();
    },
    reset() { pinned=null;hovered=null;focused=null;shown=null;lastTime=0;dismissed.clear();bubble.hidden=true;layer.remove(); },
  };
}

export function updateTicker(event, opening, fraction) {
  const context=document.getElementById('context'), text=document.getElementById('description');
  context.textContent=event.context;
  text.classList.toggle('opening-ticker',opening);
  if(text.textContent!==event.description)text.textContent=event.description;
  // Long plays scroll only as this same play advances; pausing freezes the text too.
  const overflow=Math.max(0,text.scrollWidth-text.clientWidth);
  text.scrollLeft=opening?0:overflow*fraction;
}
