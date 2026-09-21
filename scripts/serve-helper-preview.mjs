import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {serveWebsite} from '../bridge/static.mjs';
await build({entryPoints:['scripts/preview-helpers.mjs'],bundle:true,format:'esm',outfile:'work/helper-preview.js'});
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Helper animation QA</title><link rel="stylesheet" href="/live/style.css"><body><h1>Animation preview — simulated activity</h1><p>Local visual test. No live tasks are running in this preview.</p><button id="work">Work</button><button id="pause">Pause stale feed</button><div id="canvas" style="height:650px"></div><script type="module" src="/helper-preview.js"></script></body></html>`;
http.createServer(async(req,res)=>{
 if(req.url==='/helper-preview'){res.setHeader('Content-Type','text/html');res.end(html);}
 else if(req.url==='/helper-preview.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile('work/helper-preview.js'));}
 else await serveWebsite(req,res,fileURLToPath(new URL('../website/',import.meta.url)));
}).listen(4351,'127.0.0.1',()=>console.log('Local simulated helper preview: http://127.0.0.1:4351/helper-preview'));
