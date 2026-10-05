import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterGames,gameLabel,GameLoader } from '../site/js/picker.js';
import { createModel,statSeries } from '../site/js/model.js';
import { csvRows,prepareSelectedGame } from '../tools/prepare-catalog.mjs';
import { normalizeRows } from '../tools/prepare-game.mjs';
const catalog=JSON.parse(await readFile(new URL('../site/data/catalog.json',import.meta.url),'utf8'));
test('season and team filters include home and away games without other seasons',()=>{
 const games=filterGames(catalog.games,'2021','CLE');assert.ok(games.length>10);
 assert.ok(games.every(g=>g.season===2021&&(g.away==='CLE'||g.home==='CLE')));
 assert.ok(games.some(g=>g.away==='CLE'));assert.ok(games.some(g=>g.home==='CLE'));
 assert.deepEqual(filterGames(catalog.games,1900),[]);assert.match(gameLabel(games[0]),/Browns/);
});
test('a stale game response cannot replace a newer selection, even when fetch ignores abort',async()=>{
 const pending=new Map(),loader=new GameLoader((path)=>new Promise(resolve=>pending.set(path,resolve)));
 const first=loader.load('first'),second=loader.load('second');
 pending.get('second')({ok:true,json:async()=>({id:'new'})});assert.deepEqual(await second,{id:'new'});
 pending.get('first')({ok:true,json:async()=>({id:'old'})});assert.equal(await first,null);
 const third=loader.load('third');loader.cancel();pending.get('third')({ok:true,json:async()=>({id:'cancelled'})});assert.equal(await third,null);
});
test('a failed game load is retryable',async()=>{
 let calls=0;const loader=new GameLoader(async()=>++calls===1?{ok:false}:{ok:true,json:async()=>({id:'retry'})});
 await assert.rejects(loader.load('game'),/could not be loaded/);assert.deepEqual(await loader.load('game'),{id:'retry'});
});
test('the default loader calls browser fetch with its global receiver',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=function(){assert.equal(this,globalThis);return Promise.resolve({ok:true,json:async()=>({id:'browser'})});};
  assert.deepEqual(await new GameLoader().load('game'),{id:'browser'});
 }finally{globalThis.fetch=original;}
});
test('CSV parsing preserves quoted descriptions, newlines and doubled quotes',()=>{
 assert.deepEqual([...csvRows('id,desc\r\n1,"Pass, then ""run""\ncontinued"\r\n')],[['id','desc'],['1','Pass, then "run"\ncontinued']]);
 assert.throws(()=>[...csvRows('"unfinished')],/Unclosed/);
});
test('missing final scores cannot silently become zero',()=>{
 assert.throws(()=>prepareSelectedGame([{away_team:'CLE',home_team:'KC',away_score:'',home_score:'7'}],2021),/Missing final score/);
});
test('regular-season overtime uses ten minutes; playoff overtime uses fifteen',()=>{
 const row={game_id:'2025_01_CLE_KC',play_id:'1',qtr:'5',quarter_seconds_remaining:'590',time:'9:50',total_away_score:'0',total_home_score:'0',posteam:'CLE',defteam:'KC',play_type:'run',rush_attempt:'1',yards_gained:'3',desc:'A run'};
 const options={id:row.game_id,teams:['CLE','KC'],season:2025};
 assert.equal(normalizeRows([row],{...options,seasonType:'REG'})[0].elapsed,3610);
 assert.equal(normalizeRows([row],{...options,seasonType:'POST'})[0].elapsed,3910);
});
test('every selectable game validates with its own teams, score and periods',async()=>{
 assert.equal(catalog.games.length,565);assert.equal(catalog.unavailable.length,5);
 let ties=0,overtime=0;
 for(const entry of catalog.games){
  const game=JSON.parse(await readFile(new URL('../site/'+entry.path,import.meta.url),'utf8')),model=createModel(game);
  assert.deepEqual(model.teams,[entry.away,entry.home],entry.id);
  assert.equal(model.totals[entry.away].score,entry.awayScore,entry.id);assert.equal(model.totals[entry.home].score,entry.homeScore,entry.id);
  assert.equal(model.quarters.at(-1).quarter,game.events.at(-1).quarter,entry.id);
  for(const team of model.teams)assert.equal(statSeries(model,'passing',team).at(-1).yards,model.totals[team].passing);
  if(game.winner===null)ties++;if(game.events.at(-1).quarter>=5)overtime++;
 }
 assert.ok(ties>0);assert.ok(overtime>0);
});
