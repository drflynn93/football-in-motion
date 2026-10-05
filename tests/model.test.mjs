import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, validateGame, buildSchedule, positionAt, scoreDisplayAt } from '../site/js/model.js';
import { normalizeRows } from '../tools/prepare-game.mjs';
const game=JSON.parse(await readFile(new URL('../site/data/bills-chiefs.json',import.meta.url),'utf8'));
const rows=JSON.parse(await readFile(new URL('../devpost/research/bills-chiefs-source-rows.json',import.meta.url),'utf8')).rows;
test('sacks lower net passing without lowering gross passing; own fumbles add no returns',()=>{
 const sack=game.events.find(e=>e.id==='931');assert.equal(sack.deltas.BUF.netPassing,-11);assert.equal(sack.deltas.BUF.passing,0);
 for(const id of ['931','3124']) for(const t of ['BUF','KC']){const d=game.events.find(e=>e.id===id).deltas[t];assert.equal(d.returns,0);assert.equal(d.recoveries,0);}
});
test('nullified re-punt has no movement or extra decision',()=>{const e=game.events.find(e=>e.id==='3032');assert.equal(e.nullified,true);assert.deepEqual(e.segments,[]);assert.equal(e.fourthDown,null);});
test('two-point conversion scores but contributes no offensive yardage',()=>{const i=rows.findIndex(r=>r.two_point_attempt==='1'&&r.two_point_conv_result==='success');assert.ok(i>=0);const e=game.events[i];assert.equal(e.scoreAfter.BUF-e.scoreBefore.BUF,2);assert.deepEqual(e.segments,[]);});
test('return yardage belongs to receiver, not punting team',()=>{const e=game.events.find(e=>e.segments.some(s=>s.category==='PR'&&s.yards===45));assert.equal(e.deltas.KC.returns,45);assert.equal(e.deltas.BUF.returns,0);});
test('synthetic interception and opponent-fumble returns include yards exactly once',()=>{
 const base={game_id:'2021_20_BUF_KC',qtr:'1',quarter_seconds_remaining:'850',time:'14:10',total_away_score:'0',total_home_score:'0',posteam:'BUF',defteam:'KC',yards_gained:'0',play_id:'fixture',desc:'Synthetic return fixture'};
 const ir=normalizeRows([{...base,play_type:'pass',pass_attempt:'1',interception:'1',return_team:'KC',return_yards:'17'}])[0];
 assert.equal(ir.deltas.KC.interceptions,1);assert.equal(ir.deltas.KC.returns,17);assert.deepEqual(ir.segments.find(s=>s.category==='IR'),{team:'KC',category:'IR',yards:17});
 const fr=normalizeRows([{...base,play_type:'run',rush_attempt:'1',fumble:'1',fumble_recovery_1_team:'KC',fumble_recovery_1_yards:'12'}])[0];
 assert.equal(fr.deltas.KC.recoveries,1);assert.equal(fr.deltas.KC.returns,12);assert.equal(fr.segments.find(s=>s.category==='FR').yards,12);
 const negative=normalizeRows([{...base,play_type:'punt',return_team:'KC',return_yards:'-3'}])[0];assert.equal(negative.deltas.KC.returns,-3);assert.equal(negative.segments[0].yards,-3);
});
test('source chronology survives nonmonotonic play IDs',()=>{assert.equal(game.events.at(-1).description,'END GAME');assert.ok(Number(game.events.at(-1).id)<Number(game.events.at(-2).id));assert.doesNotThrow(()=>createModel(game));});
test('missing required yardage fails preparation',()=>{const row=structuredClone(rows.find(r=>r.rush_attempt==='1'));row.yards_gained='';assert.throws(()=>normalizeRows([row]),/Required yards_gained/);});
test('bad chronology, missing deltas and incorrect final score reject playback',()=>{
 let bad=structuredClone(game);bad.events[1].elapsed=-1;assert.throws(()=>validateGame(bad),/order/);
 bad=structuredClone(game);delete bad.events[3].deltas.BUF.rushing;assert.throws(()=>validateGame(bad),/missing/);
 bad=structuredClone(game);bad.events.at(-1).scoreAfter.KC=41;assert.throws(()=>validateGame(bad),/scoring|final/);
});
test('the replay ends exactly at seven minutes including the reveal',()=>{const s=buildSchedule(game.events);assert.equal(s.at(-1).end+4000,420000);assert.deepEqual(positionAt(s,416000),{index:188,fraction:1});for(let i=1;i<s.length;i++)assert.equal(s[i].start,s[i-1].end);});
test('earlier-down kicks do not enter fourth-down analysis',()=>{const m=createModel(game);assert.equal(m.fourthDowns.KC.decisions.filter(e=>e.fourthDown.decision==='field_goal').length,2);assert.equal(m.fourthDowns.KC.decisions.filter(e=>e.fourthDown.result==='missed').length,0);});
test('exact score labels and scoreboard switch together, briefly highlight, and reset',()=>{
 const m=createModel(game),schedule=buildSchedule(game.events);
 const index=m.snapshots.findIndex(s=>s.after.BUF.score===6);
 const item=schedule[index],at=4000+item.start+(item.end-item.start)*.7;
 assert.deepEqual(scoreDisplayAt(m,schedule,index,.69,at-1).BUF,{score:0,highlight:false});
 assert.deepEqual(scoreDisplayAt(m,schedule,index,.7,at).BUF,{score:6,highlight:true});
 const extraPoint=m.snapshots.findIndex(s=>s.after.BUF.score===7);
 const extra=schedule[extraPoint],settled=4000+extra.start+(extra.end-extra.start)*.7+3001;
 const later=positionAt(schedule,settled-4000);
 assert.equal(scoreDisplayAt(m,schedule,later.index,later.fraction,settled).BUF.highlight,false);
 assert.deepEqual(scoreDisplayAt(m,schedule,0,0,0).BUF,{score:0,highlight:false});
 assert.equal(scoreDisplayAt(m,schedule,188,1,420000).KC.score,42);
});
