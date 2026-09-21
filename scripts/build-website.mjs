import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('website/live',{recursive:true});
await build({entryPoints:['live/workshop.js'],bundle:true,format:'esm',target:'es2022',outfile:'website/live/workshop.js',minify:true});
for(const name of ['index.html','style.css'])await writeFile(`website/live/${name}`,await readFile(`live/${name}`));
console.log('Built classroom and live workshop in website/');
await import('./package-windows.mjs');
