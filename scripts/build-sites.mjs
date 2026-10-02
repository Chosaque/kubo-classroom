import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
// Rebuild the classroom and Windows package before preparing this host's static output.
await import('./build-website.mjs');
const root=process.cwd(),destination=resolve(root,'dist');
if(relative(root,destination)!=='dist'||destination===root)throw Error('Unsafe static output path');
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});
await cp(resolve(root,'website'),destination,{recursive:true,filter:source=>!source.endsWith(sep+'Kubo-Windows.zip')&&!source.endsWith('.test.mjs')});
await writeFile(resolve(destination,'_redirects'),'/downloads/Kubo-Windows.zip https://github.com/Chosaque/kubo-classroom/releases/download/classroom-2026-10-02/Kubo-Windows.zip 302\n');
const hosting=JSON.parse(await readFile('.openai/hosting.json','utf8'));
await mkdir(resolve(destination,'.openai'),{recursive:true});
await writeFile(resolve(destination,'.openai/hosting.json'),JSON.stringify(hosting,null,2)+'\n');
console.log('Prepared static classroom; Windows ZIP is delivered by the matching GitHub release.');

