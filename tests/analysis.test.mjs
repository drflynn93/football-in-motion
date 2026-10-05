import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createModel, statSeries } from '../site/js/model.js';
const model=createModel(JSON.parse(await readFile(new URL('../site/data/bills-chiefs.json',import.meta.url),'utf8')));
test('selected passing uses gross yards rather than the main net passing measure',()=>{
 assert.equal(statSeries(model,'passing','BUF').at(-1).yards,329);
 assert.equal(statSeries(model,'passing','KC').at(-1).yards,378);
 assert.equal(model.totals.BUF.netPassing,313);
});
test('the selected rushing series and all period checkpoints reconcile',()=>{
 const expected={BUF:{passing:[49,113,195,329,329],rushing:[34,74,76,109,109]},KC:{passing:[11,114,183,309,378],rushing:[63,92,166,176,182]}};
 for(const team of ['BUF','KC'])for(const stat of ['passing','rushing']){
  assert.deepEqual(model.quarters.map(q=>q.totals[team][stat]),expected[team][stat]);
  assert.equal(statSeries(model,stat,team).at(-1).yards,expected[team][stat].at(-1));
 }
});
test('partial charts preserve repeated-clock source order and never show future plays',()=>{
 const points=statSeries(model,'passing','KC',2700);
 assert.ok(points.every(p=>p.elapsed<=2700));
 assert.equal(points.at(-1).elapsed,2700);
 const full=statSeries(model,'passing','KC');
 assert.equal(full.length,model.snapshots.length+1);
 assert.ok(full.some((p,i)=>i&&p.elapsed===full[i-1].elapsed));
});
test('calculating a lower chart leaves the completed main game untouched',()=>{
 const before=JSON.stringify(model);statSeries(model,'rushing','BUF',1500);statSeries(model,'passing','KC',3000);assert.equal(JSON.stringify(model),before);
});
