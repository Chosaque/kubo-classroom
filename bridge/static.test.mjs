import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {serveWebsite} from './static.mjs';
test('website server serves classroom but never source files outside website',async()=>{
 const root=fileURLToPath(new URL('../website/',import.meta.url));
 const server=http.createServer((req,res)=>serveWebsite(req,res,root));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(home.headers.get('content-type'),/text\/html/);
  const live=await fetch(base+'/live/');assert.equal(live.status,200);assert.match(await live.text(),/Connect my Windows PC/);
  const head=await fetch(base+'/live/workshop.js',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  for(const path of ['/..%2fpackage.json','/%2e%2e%5cpackage.json','/%00','/bridge/server.mjs','/.env'])assert.equal((await fetch(base+path)).status,404,path);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
