import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {zipSync,unzipSync} from 'fflate';

const version='24.16.0';
const checksum='edaca9bd58ec8e92037dac4e877d52f6b8f430b81c18b57e264b4e2fb111cd56';
const cache='work/node-windows.zip';
let runtimeZip;
try{runtimeZip=await readFile(cache);}catch{}
if(!runtimeZip||createHash('sha256').update(runtimeZip).digest('hex')!==checksum){
 console.log('Downloading verified Windows runtime from nodejs.org…');
 const response=await fetch(`https://nodejs.org/dist/v${version}/node-v${version}-win-x64.zip`,{signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw Error('Windows runtime download failed');
 runtimeZip=new Uint8Array(await response.arrayBuffer());
 if(createHash('sha256').update(runtimeZip).digest('hex')!==checksum)throw Error('Windows runtime checksum mismatch');
 await mkdir('work',{recursive:true});await writeFile(cache,runtimeZip);
}
const runtime=unzipSync(runtimeZip,{filter:entry=>entry.name.endsWith('/node.exe')||entry.name.endsWith('/LICENSE')});
const files={};
const add=(name,data)=>files[`Kubo Classroom/${name}`]=[data,{mtime:new Date('2026-09-21T00:00:00Z')}];
add('runtime/node.exe',runtime[`node-v${version}-win-x64/node.exe`]);
add('runtime/LICENSE',runtime[`node-v${version}-win-x64/LICENSE`]);
async function collect(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  if(entry.name.startsWith('.')||entry.name==='downloads')continue;
  const name=`${directory}/${entry.name}`;
  if(entry.isDirectory())await collect(name);
  else if(entry.isFile())add(name,await readFile(name));
 }
}
await collect('website');
for(const name of ['server.mjs','static.mjs','live-monitor.mjs','claude-monitor.mjs','progress-store.mjs','report.mjs'])add(`bridge/${name}`,await readFile(`bridge/${name}`));
add('windows/launcher.mjs',await readFile('windows/launcher.mjs'));
for(const name of ['Start Kubo.cmd','READ ME.txt'])add(name,await readFile(`windows/${name}`));
await mkdir('website/downloads',{recursive:true});
const archive=zipSync(files,{level:6});
await writeFile('website/downloads/Kubo-Windows.zip',archive);
await writeFile('website/downloads/Kubo-Windows.sha256',`${createHash('sha256').update(archive).digest('hex')}  Kubo-Windows.zip\n`);
console.log(`Windows package: ${(archive.length/1048576).toFixed(1)} MB, ${Object.keys(files).length} files`);
