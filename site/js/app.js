import { createModel, buildSchedule, positionAt, scoreDisplayAt } from './model.js';
import { Playback } from './playback.js';
import { createReplayChart } from './replay-chart.js';
import { createEventInspector, playContext, updateTicker } from './events.js';
import { createAnalysis } from './analysis.js';
const el = id => document.getElementById(id);
let model, clock, render, schedule, inspector, analysis;
async function load() {
  el('error').hidden=true; el('opening').hidden=false; el('play').disabled=true; el('play').textContent='Loading game…';
  try {
    const response = await fetch('./data/bills-chiefs.json',{cache:'no-store'});
    if(!response.ok) throw new Error('Game request failed.');
    model=createModel(await response.json());
    if(!globalThis.d3) throw new Error('The chart library is unavailable.');
    schedule=buildSchedule(model.game.events);
    analysis=createAnalysis(model);
    el('play').disabled=false; el('play').textContent='Play';
  } catch {
    el('opening').hidden=true; el('error').hidden=false;
  }
}
function update(time) {
  const reveal=time<1000?0:time<2000?1:time<3000?2:3;
  const {index,fraction}=positionAt(schedule,Math.max(0,time-4000));
  const s=model.snapshots[index];
  const scoreDisplay=scoreDisplayAt(model,schedule,index,fraction,time);
  render(index,fraction,reveal,scoreDisplay);
  updateTicker(time<4000?{context:'Opening coin toss',description:model.game.opening}:{context:playContext(s.event,model.game),description:s.event.description},time<4000,fraction);
  inspector?.update(time);
  el('score').textContent=`Bills ${scoreDisplay.BUF.score} · Chiefs ${scoreDisplay.KC.score}`;
  el('pause').textContent=clock?.manualPaused?'Resume':clock?.inspections.size?'Paused for play':'Pause';
  if(time>=420000){el('complete').hidden=false;el('pause').disabled=true;el('pause').textContent='Finished';analysis.show();}
}
function startReplay() {
  clock?.stop(); inspector?.reset(); inspector=null;
  analysis.reset();
  el('opening').hidden=true;el('replay').hidden=false;
  el('complete').hidden=true;el('pause').disabled=false;
  render=createReplayChart(el('chart'),model);
  clock=new Playback(420000,update);clock.setSpeed(el('speed').value);
  inspector=createEventInspector(el('chart'),model,schedule,render,clock);
  update(0);clock.start();
}
el('play').addEventListener('click',startReplay);
el('restart').addEventListener('click',startReplay);
el('pause').addEventListener('click',()=>{clock.togglePause();update(clock.time);});
el('speed').addEventListener('change',()=>clock?.setSpeed(el('speed').value));
el('retry').addEventListener('click',load);
document.addEventListener('visibilitychange',()=>{clock?.setInactive(document.hidden);analysis?.setInactive(document.hidden);});
await load();
