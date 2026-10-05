import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const project=fileURLToPath(new URL('../',import.meta.url));
const catalog=JSON.parse(await readFile(resolve(project,'site/data/catalog.json'),'utf8'));
if(catalog.schemaVersion!==1||!Array.isArray(catalog.games)||!catalog.games.length)throw new Error('Invalid public catalog.');
const ids=new Set();
for(const game of catalog.games){
  if(!/^\d{4}_\d{2}_[A-Z0-9]+_[A-Z0-9]+$/.test(game.id)||game.path!==`data/games/${game.id}.json`||ids.has(game.id))throw new Error('Unsafe or repeated catalog path.');
  ids.add(game.id);
}
export const PUBLIC_FILES=['.nojekyll','index.html','styles.css','vendor/d3-7.9.0.min.js','vendor/d3-LICENSE','data/bills-chiefs.json','data/catalog.json',...['app','model','playback','replay-chart','events','analysis','fourth-downs','picker'].map(name=>`js/${name}.js`),...catalog.games.map(game=>game.path)];
export async function auditPublicDirectory(directory) {
  const result=[];
  async function walk(relative='') {
    const absolute=resolve(directory,relative);
    let items;try{items=await readdir(absolute,{withFileTypes:true});}catch(error){if(error.code==='ENOENT')return;throw error;}
    for(const item of items) {
      const name=relative?`${relative}/${item.name}`:item.name;
      if(item.isSymbolicLink())throw new Error(`Symbolic link is not a public asset: ${name}`);
      if(item.isDirectory())await walk(name);
      else if(!PUBLIC_FILES.includes(name))throw new Error(`Unexpected public file: ${name}`);
      else result.push(name);
    }
  }
  await walk();return result;
}
export async function publish() {
  execFileSync(process.execPath,[resolve(project,'tools/verify-game.mjs')],{stdio:'inherit'});
  const source=resolve(project,'site'),destination=resolve(project,'docs');
  await auditPublicDirectory(source);await auditPublicDirectory(destination);
  const assets=[];
  for(const name of PUBLIC_FILES) {
    const info=await lstat(resolve(source,name));if(!info.isFile()||info.isSymbolicLink())throw new Error(`Invalid public asset: ${name}`);
    const body=await readFile(resolve(source,name));
    if(/-----BEGIN .*PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-proj-[A-Za-z0-9_-]+/.test(body.toString()))throw new Error(`Credential-like content in ${name}`);
    assets.push({name,body});
  }
  for(const {name,body} of assets){await mkdir(dirname(resolve(destination,name)),{recursive:true});await writeFile(resolve(destination,name),body);}
  const copied=await auditPublicDirectory(destination);
  if(copied.length!==PUBLIC_FILES.length)throw new Error('Public file copy is incomplete.');
  console.log(`Prepared ${copied.length} verified public files in docs. Nothing has been uploaded.`);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await publish();
