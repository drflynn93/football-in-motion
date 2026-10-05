import { createModel, buildSchedule, positionAt, scoreDisplayAt } from './model.js';
import { Playback } from './playback.js';
import { createReplayChart } from './replay-chart.js';
const el = id => document.getElementById(id);
let model, clock, render, schedule;
async function load() {
  el('error').hidden=true; el('opening').hidden=false; el('play').disabled=true; el('play').textContent='Loading game…';
  try {
    const response = await fetch('./data/bills-chiefs.json',{cache:'no-store'});
    if(!response.ok) throw new Error('Game request failed.');
    model=createModel(await response.json());
    if(!globalThis.d3) throw new Error('The chart library is unavailable.');
    schedule=buildSchedule(model.game.events);
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
  if(time<4000){el('context').textContent='Opening coin toss'; el('description').textContent=model.game.opening;}
  else {
    el('context').textContent=`${s.event.quarter===5?'Overtime':`Quarter ${s.event.quarter}`} · ${s.event.clock}${s.event.team?` · ${model.game.teams[s.event.team].name}`:''}${s.event.down?` · ${s.event.down}${['st','nd','rd','th'][s.event.down-1]} & ${s.event.yardsNeeded}`:''}`;
    el('description').textContent=s.event.description;
  }
  el('score').textContent=`Bills ${scoreDisplay.BUF.score} · Chiefs ${scoreDisplay.KC.score}`;
  if(time>=420000){el('complete').hidden=false;el('pause').disabled=true;el('pause').textContent='Finished';}
}
el('play').addEventListener('click',()=>{
  el('opening').hidden=true;el('replay').hidden=false;
  render=createReplayChart(el('chart'),model);
  clock=new Playback(420000,update);clock.setSpeed(el('speed').value);update(0);clock.start();
});
el('pause').addEventListener('click',()=>{clock.togglePause();el('pause').textContent=clock.paused?'Resume':'Pause';});
el('speed').addEventListener('change',()=>clock?.setSpeed(el('speed').value));
el('retry').addEventListener('click',load);
document.addEventListener('visibilitychange',()=>{if(clock)clock.last=null;});
await load();
