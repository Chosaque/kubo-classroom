import {createReadStream} from 'node:fs';
import {stat,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.ico':'image/x-icon'};
export async function serveWebsite(req,res,root){
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.includes('\\')||pathname.includes('\0'))throw Error('path');
  const base=await realpath(root);let file=resolve(base,'.'+pathname);
  if(file!==base&&!file.startsWith(base+sep))throw Error('path');
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  file=await realpath(file);
  if(!file.startsWith(base+sep))throw Error('path');
  const info=await stat(file);if(!info.isFile())throw Error('file');
  res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
  res.setHeader('Content-Length',info.size);
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch{res.writeHead(404);res.end('Not found');}
}
