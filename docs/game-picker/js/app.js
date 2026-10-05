import { createModel,buildSchedule,positionAt,scoreDisplayAt } from './model.js';
import { Playback } from './playback.js';
import { createReplayChart } from './replay-chart.js';
import { createEventInspector,playContext,updateTicker } from './events.js';
import { createAnalysis } from './analysis.js';
import { createFourthDowns } from './fourth-downs.js';
import { filterGames,gameLabel,GameLoader } from './picker.js';
const el=id=>document.getElementById(id),loader=new GameLoader();
let catalog,model,clock,render,schedule,inspector,analysis,fourthDowns,lastEntry,generation=0;
const scoreLine=scores=>model.teams.map(t=>`${model.game.teams[t].name} ${scores[t]?.score??scores[t]}`).join(' · ');
function clearReplay(){clock?.stop();clock=null;inspector?.reset();inspector=null;analysis?.reset();fourthDowns?.reset();el('replay').hidden=true;el('complete').hidden=true;}
function options(select,items){select.replaceChildren(...items.map(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;return option;}));}
function populateGames(preferred='2021_20_BUF_KC'){
 loader.cancel();generation++;el('load-game').disabled=false;el('play').disabled=!model;el('play').textContent=model?'Play':'Load a game first';el('error').hidden=true;
 const games=filterGames(catalog.games,el('season-filter').value,el('team-filter').value);
 options(el('game-choice'),games.map(g=>[g.id,gameLabel(g)]));
 if(games.some(g=>g.id===preferred))el('game-choice').value=preferred;
 const unavailable=filterGames(catalog.unavailable,el('season-filter').value,el('team-filter').value);
 el('picker-status').textContent=`${games.length} games available. Choose a game, then select Load game.`;
 el('unavailable-games').hidden=unavailable.length===0;
 el('unavailable-count').textContent=`${unavailable.length} games unavailable because source checks failed`;
 el('unavailable-list').replaceChildren(...unavailable.map(g=>{const item=document.createElement('li');item.textContent=`${gameLabel(g)}: ${g.reason.includes('quarter_seconds')?'Play timing is incomplete.':'Play order could not be validated.'}`;return item;}));
 if(!games.length)el('load-game').disabled=true;
}
function populateTeams(){
 const games=filterGames(catalog.games,el('season-filter').value);
 const teams=new Map();for(const g of games){teams.set(g.away,g.awayName);teams.set(g.home,g.homeName);}
 options(el('team-filter'),[['all','All teams'],...[...teams].sort((a,b)=>a[1].localeCompare(b[1]))]);populateGames();
}
async function loadGame(entry){
 const request=++generation;lastEntry=entry;clearReplay();model=null;
 el('error').hidden=true;el('opening').hidden=false;el('play').disabled=true;el('play').textContent='Loading game…';el('load-game').disabled=true;el('picker-status').textContent=`Loading ${gameLabel(entry)}…`;
 try{
  const game=await loader.load('./'+entry.path);if(!game||request!==generation)return;
  const next=createModel(game);if(!globalThis.d3)throw new Error('Chart library unavailable.');model=next;
  options(el('stat-team'),[...model.teams.map(t=>[t,game.teams[t].name]),['both','Compare both']]);
  options(el('fourth-team'),[...model.teams.map(t=>[t,game.teams[t].name]),['both','Compare both']]);
  el('box-away').textContent=game.teams[model.teams[0]].name;el('box-home').textContent=game.teams[model.teams[1]].name;
  el('matchup').textContent=game.title;
  el('matchup-date').textContent=`${new Date(game.date+'T12:00:00Z').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})} · NFL ${entry.season} season · ${entry.seasonType==='POST'?'Playoffs':`Week ${entry.week}`}`;
  document.title=`${game.title} · Football in Motion`;
  el('verification-note').textContent=entry.verification==='official-example'?'Original example: independently checked against the official gamebook.':'Source checks passed. This game has not been independently reconciled against an official gamebook.';
  el('passing-note').textContent=`Passing here is gross yardage. The main replay subtracts sack losses (${model.teams.map(t=>`${game.teams[t].name}: ${model.totals[t].netPassing}`).join('; ')} net passing yards). Returns include PR, KR, IR and FR; interceptions and recoveries are counts.`;
  el('chart').setAttribute('aria-label',`Actual score: ${game.teams[model.teams[0]].name} left, ${game.teams[model.teams[1]].name} right; cumulative yards upward`);
  schedule=buildSchedule(game.events);analysis=createAnalysis(model);fourthDowns=createFourthDowns(model);
  el('score').textContent=scoreLine(Object.fromEntries(model.teams.map(t=>[t,0])));
  el('complete').textContent=`Final · ${scoreLine(Object.fromEntries(model.teams.map(t=>[t,model.totals[t].score])))}${game.events.at(-1).quarter>=5?' · Overtime':''}${game.winner===null?' · Tie':''}`;
  el('picker-status').textContent=`Loaded ${gameLabel(entry)}. Select Play to begin.`;el('play').disabled=false;el('play').textContent='Play';
 }catch(error){
  console.error('Game loading failed:',error);
  if(request!==generation)return;
  el('error').hidden=false;el('opening').hidden=true;el('picker-status').textContent='The selected game could not be loaded. Use Retry or choose another game.';
 }finally{if(request===generation)el('load-game').disabled=false;}
}
async function loadCatalog(){
 el('catalog-error').hidden=true;
 try{const response=await fetch('./data/catalog.json');if(!response.ok)throw new Error('Catalog unavailable');catalog=await response.json();if(catalog.schemaVersion!==1||!catalog.games?.length)throw new Error('Catalog invalid');
  options(el('season-filter'),catalog.seasons.map(s=>[s,`${s} NFL season`]));el('season-filter').value='2021';populateTeams();
  await loadGame(catalog.games.find(g=>g.id===el('game-choice').value));
 }catch{el('catalog-error').hidden=false;el('load-game').disabled=true;el('play').disabled=true;el('picker-status').textContent='Game list unavailable.';}
}
function update(time){
 const reveal=time<1000?0:time<2000?1:time<3000?2:3;
 const {index,fraction}=positionAt(schedule,Math.max(0,time-4000)),snapshot=model.snapshots[index];
 const scores=scoreDisplayAt(model,schedule,index,fraction,time);render(index,fraction,reveal,scores);
 updateTicker(time<4000?{context:'Game opening',description:model.game.opening}:{context:playContext(snapshot.event,model.game),description:snapshot.event.description},time<4000,fraction);
 inspector?.update(time);el('score').textContent=scoreLine(scores);
 el('pause').textContent=clock?.manualPaused?'Resume':clock?.inspections.size?'Paused for play':'Pause';
 if(time>=420000){el('complete').hidden=false;el('pause').disabled=true;el('pause').textContent='Finished';analysis.show();fourthDowns.show();}
}
function startReplay(){
 if(!model)return;clock?.stop();inspector?.reset();inspector=null;analysis.reset();fourthDowns.reset();
 el('opening').hidden=true;el('replay').hidden=false;el('complete').hidden=true;el('pause').disabled=false;
 render=createReplayChart(el('chart'),model);clock=new Playback(420000,update);clock.setSpeed(el('speed').value);
 inspector=createEventInspector(el('chart'),model,schedule,render,clock);update(0);clock.start();
}
el('season-filter').onchange=populateTeams;
el('team-filter').onchange=()=>populateGames();
el('game-choice').onchange=()=>{loader.cancel();generation++;el('load-game').disabled=false;el('play').disabled=!model;el('play').textContent=model?'Play':'Load a game first';el('error').hidden=true;el('opening').hidden=!!clock&&!!model;el('picker-status').textContent='Selection changed. Select Load game to use it.';};
el('load-game').onclick=()=>loadGame(catalog.games.find(g=>g.id===el('game-choice').value));
el('play').onclick=startReplay;el('restart').onclick=startReplay;
el('pause').onclick=()=>{clock.togglePause();update(clock.time);};el('speed').onchange=()=>clock?.setSpeed(el('speed').value);
el('retry').onclick=()=>loadGame(lastEntry);el('retry-catalog').onclick=loadCatalog;
document.addEventListener('visibilitychange',()=>{clock?.setInactive(document.hidden);analysis?.setInactive(document.hidden);});
await loadCatalog();
