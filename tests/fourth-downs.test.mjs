import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fourthDownSummary,createModel } from '../site/js/model.js';
import { decisionAppearance,percentage,distanceLabel } from '../site/js/fourth-downs.js';
const model=createModel(JSON.parse(await readFile(new URL('../site/data/bills-chiefs.json',import.meta.url),'utf8')));
const fixture=(decision='go',converted=true,result='converted')=>({team:'BUF',down:4,nullified:false,yardsNeeded:2,goalToGo:false,fourthDown:{decision,converted,result}});
test('real rates use all decisions for attempts and attempts for success',()=>{
 for(const [team,count,attempts,rate]of[['BUF',8,4,.5],['KC',5,1,.2]]){
  const s=fourthDownSummary(model.game.events,team);assert.equal(s.count,count);assert.equal(s.attempts,attempts);assert.equal(s.conversions,attempts);assert.equal(s.goRate,rate);assert.equal(s.successRate,1);
 }
});
test('three conversions out of four attempts equals 75 percent',()=>{const s=fourthDownSummary([fixture(),fixture(),fixture(),fixture('go',false,'failed')],'BUF');assert.equal(percentage(s.successRate),'75%');});
test('no attempts or decisions show N/A without a divide-by-zero value',()=>{const s=fourthDownSummary([fixture('punt',false,'punt')],'BUF');assert.equal(s.count,1);assert.equal(percentage(s.successRate),'N/A');assert.equal(percentage(s.goRate),'0%');const empty=fourthDownSummary([],'BUF');assert.equal(empty.count,0);assert.equal(percentage(empty.goRate),'N/A');});
test('earlier-down and nullified fourth-down fixtures are excluded',()=>{const a=fixture();a.down=3;const b=fixture();b.nullified=true;assert.equal(fourthDownSummary([a,b,fixture()],'BUF').count,1);});
test('each outcome maps to the agreed color or missed-kick pattern',()=>{
 assert.equal(decisionAppearance(fixture()).fill,'#176844');assert.equal(decisionAppearance(fixture('go',false,'failed')).fill,'#b43f3f');assert.equal(decisionAppearance(fixture('punt',false,'punt')).fill,'#929292');assert.equal(decisionAppearance(fixture('field_goal',false,'made')).fill,'#c59a20');assert.equal(decisionAppearance(fixture('field_goal',false,'missed')).fill,'url(#missed-field-goal)');
});
test('goal-to-go and zero-distance fixtures keep exact distance labels',()=>{const e=fixture();e.goalToGo=true;assert.equal(distanceLabel(e),'2 to goal');e.yardsNeeded=0;assert.equal(distanceLabel(e),'0 to goal');});
