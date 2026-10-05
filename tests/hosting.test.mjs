import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewServer } from '../tools/serve.mjs';
import { PUBLIC_FILES,auditPublicDirectory,auditPicker } from '../tools/publish.mjs';
import { fileURLToPath } from 'node:url';
test('repository-subpath preview serves relative app files and keeps planning files private',async()=>{
 const server=createPreviewServer({prefix:'/football-demo/'});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/football-demo/`;
 try {
  for(const file of PUBLIC_FILES.filter(f=>f!=='vendor/d3-LICENSE'))assert.equal((await fetch(base+file)).status,200,file);
  assert.equal((await fetch(base+'devpost/learner-profile.md')).status,404);
  assert.equal((await fetch(base+'%2e%2e%2fdevpost/learner-profile.md')).status,403);
  assert.equal((await fetch(new URL('/',base))).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
test('the public source manifest excludes profile, raw research and credentials',async()=>{
 const files=await auditPublicDirectory(fileURLToPath(new URL('../site/',import.meta.url)));
 assert.deepEqual(files.sort(),[...PUBLIC_FILES].sort());
 assert.ok(files.every(f=>!/(learner-profile|research|\.env|\.agents)/.test(f)));
});
test('separate published picker loads its catalog and selected game beneath the repository path',async()=>{
 const directory=fileURLToPath(new URL('../docs/game-picker/',import.meta.url));
 const files=await auditPicker(directory);assert.equal(files.length,580);
 const server=createPreviewServer({directory:'docs',prefix:'/football-in-motion/'});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/football-in-motion/`;
 try{
  assert.equal((await fetch(base)).status,200);
  assert.equal((await fetch(base+'game-picker/index.html')).status,200);
  const catalog=await (await fetch(base+'game-picker/data/catalog.json')).json();assert.equal(catalog.games.length,565);
  const entry=catalog.games.find(g=>g.id==='2021_01_CLE_KC');
  const game=await (await fetch(base+'game-picker/'+entry.path)).json();assert.equal(game.id,entry.id);
  assert.equal((await fetch(base+'game-picker/js/picker.js')).status,200);
  assert.equal((await fetch(base+'game-picker/devpost/learner-profile.md')).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
