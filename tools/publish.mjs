import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const project=fileURLToPath(new URL('../',import.meta.url));
export const PUBLIC_FILES=['.nojekyll','index.html','styles.css','vendor/d3-7.9.0.min.js','vendor/d3-LICENSE','data/bills-chiefs.json',...['app','model','playback','replay-chart','events','analysis','fourth-downs'].map(name=>`js/${name}.js`)];
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
