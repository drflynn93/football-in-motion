import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const project=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
export function createPreviewServer({directory='site',prefix='/'}={}) {
const root=resolve(project,directory);
prefix='/'+prefix.split('/').filter(Boolean).join('/')+(prefix==='/'?'':'/');
return createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!pathname.startsWith(prefix)){res.writeHead(404);res.end('Not found');return;}
    const relative=pathname.slice(prefix.length)||'index.html';
    const file=resolve(root,relative);
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const option=(name,fallback)=>{const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1];};
  const port=Number(option('--port',4173));
  const prefix=option('--prefix','/');
  createPreviewServer({directory:process.argv.includes('--docs')?'docs':'site',prefix}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}${prefix}`));
}
