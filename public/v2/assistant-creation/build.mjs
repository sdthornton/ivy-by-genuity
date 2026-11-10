import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { Script } from 'node:vm';
const root = path.dirname(fileURLToPath(import.meta.url));
const localRequire = createRequire(path.join(root, 'package.json'));
// Reuse the already installed toolchain; the original project is only read.
const original = process.env.IVY_BUILDER_TOOLCHAIN || '/Users/samuelthornton/genuity/ivy-by-genuity';
let req;
try { localRequire.resolve('vite'); req=localRequire; } catch { req=createRequire(path.join(original,'package.json')); }
const { build } = await import(req.resolve('vite'));
const { default: vue } = await import(req.resolve('@vitejs/plugin-vue'));
const postcss = req('postcss');
const { parse } = req('@babel/parser');
const colorModule = await import(req.resolve('colorjs.io'));
const Color = colorModule.default?.default || colorModule.default;
const paletteCSS = fs.readFileSync(path.resolve(root,'../../design-tokens/colors.css'),'utf8');
const colors=[...paletteCSS.matchAll(/(--ivy-color-[\w-]+):\s*(#[a-fA-F0-9]{6})/g)].map(m=>({token:m[1],hex:m[2],rgb:new Color(m[2]).to('srgb').coords}));
const used = new Map();
function paletteColor(value, property='') {
  let color;
  try { color = new Color(value).to('srgb'); } catch { return value; }
  let rgb=color.coords.map(x=>Math.max(0,Math.min(1,x)));
  if (color.alpha<1) {
    if (property.includes('shadow')) return 'var(--ivy-color-gray-200)';
    rgb=rgb.map((c,i)=>c*color.alpha+(i===2?253/255:252/255)*(1-color.alpha));
  }
  let closest=colors.find(c=>c.token==='--ivy-color-primary' && c.rgb.every((x,i)=>Math.abs(x-rgb[i])<.001));
  if (!closest) closest=colors.reduce((a,b)=>distance(a.rgb,rgb)<=distance(b.rgb,rgb)?a:b);
  used.set(value,closest.token);
  return `var(${closest.token})`;
}
function distance(a,b){return a.reduce((sum,x,i)=>sum+(x-b[i])**2,0);}
function normalize(value, property) {
  if (value.includes('url(')) return value; // Supplied image artwork stays intact.
  // Resolve the source's variable RGB colors without introducing alpha variants.
  value=value.replace(/rgba?\(var\(--bs-([a-z]+)-rgb\)(?:\s*,\s*([\d.]+))?\)/g, (_,name,alpha)=>{
    if(name==='primary')return `var(--ivy-color-${alpha && Number(alpha)<.5?'indigo-50':'primary'})`;
    if(name==='white')return 'var(--ivy-color-gray-25)';
    if(name==='black')return 'var(--ivy-color-gray-200)';
    return 'var(--ivy-color-gray-500)';
  });
  value=value.replace(/(?:rgba?|hsla?)\([^()]*\)/gi, match=>paletteColor(match,property));
  value=value.replace(/#[\da-f]{3,8}\b/gi,match=>paletteColor(match,property));
  value=value.replace(/(?<![\w-])(?:white|black|gray|grey|red|blue|green|yellow|orange|purple|whitesmoke|lightgray|darkgray)(?![\w-])/gi,match=>paletteColor(match,property));
  return value;
}
const aliases={ '@':path.join(root,'src') };
for (const name of ['vue','vue-router','floating-vue','interactjs']) {
  // Match exact package names so floating-vue/dist/style.css retains its subpath.
  aliases[name]=name==='vue'?req.resolve('vue/dist/vue.runtime.esm-bundler.js'):req.resolve(name);
}
const output = await build({
  configFile:false, root, base:'./', publicDir:false,
  plugins:[vue()],
  resolve:{alias:[{find:'@',replacement:aliases['@']},...['vue','vue-router','floating-vue','interactjs'].map(name=>({find:new RegExp(`^${name}$`),replacement:aliases[name]})),{find:'floating-vue/dist/style.css',replacement:req.resolve('floating-vue/dist/style.css')}]},
  css:{preprocessorOptions:{scss:{additionalData:'@use "@/styles/_variables.scss" as *;'}}},
  build:{write:false,cssCodeSplit:false,cssMinify:false,minify:false,assetsInlineLimit:1000000,
    lib:{entry:path.join(root,'src/entry.js'),name:'IvyAssistantCreation',formats:['iife'],fileName:()=> 'builder.js'},
    rollupOptions:{output:{inlineDynamicImports:true,assetFileNames:'builder.css'}}},
  define:{'process.env.NODE_ENV':JSON.stringify('production')},
  logLevel:'warn',
});
const out=Array.isArray(output)?output[0]:output;
for(const file of out.output){
  if(file.type==='asset' && file.fileName.endsWith('.css')) {
    const ast=postcss.parse(file.source.toString());
    ast.walkDecls(decl=>{
      decl.value=normalize(decl.value,decl.prop);
      if(decl.prop==='font-size' && /^([\d.]+)(px|rem)$/.test(decl.value)) {
        const [,n,unit]=decl.value.match(/^([\d.]+)(px|rem)$/);const px=Number(n)*(unit==='rem'?16:1);
        const approved=[12,14,16,18,20,24,30,36,48];const chosen=approved.reduce((a,b)=>Math.abs(a-px)<=Math.abs(b-px)?a:b);
        decl.value=chosen+'px';
      }
    });
    fs.writeFileSync(path.join(root,'builder.css'),ast.toString());
  } else if(file.type==='chunk') {
    // Parse actual JavaScript literals: quotes inside SVG/data URLs are not JS strings.
    const ast=parse(file.code, {sourceType:'script'});
    const replacements=[], imageLiterals=[];
    function visit(node, inspect) {
      if (!node || typeof node!=='object') return;
      if (node.type==='StringLiteral') inspect(node);
      for (const [key,value] of Object.entries(node)) {
        if (key==='loc' || key==='extra') continue;
        if (Array.isArray(value)) value.forEach(child=>visit(child,inspect));
        else if (value && typeof value==='object') visit(value,inspect);
      }
    }
    visit(ast,node=>{
      if (node.value.startsWith('data:image/')) {imageLiterals.push(node.value);return;}
      if (/^(?:#[a-f\d]{3,8}|(?:rgba?|hsla?)\([^()]*\)|white|black)$/i.test(node.value)) {
        const mapped=paletteColor(node.value);
        if(mapped!==node.value) replacements.push([node.start,node.end,JSON.stringify(mapped)]);
      }
    });
    let code=file.code;
    replacements.sort((a,b)=>b[0]-a[0]).forEach(([start,end,value])=>{
      code=code.slice(0,start)+value+code.slice(end);
    });
    // Validate the emitted bundle, and verify supplied images are byte-for-byte intact.
    new Script(code, {filename:'builder.js'});
    const rebuiltImages=[];
    visit(parse(code,{sourceType:'script'}),node=>{
      if(node.value.startsWith('data:image/')) rebuiltImages.push(node.value);
    });
    if(JSON.stringify(imageLiterals)!==JSON.stringify(rebuiltImages)) {
      throw new Error('Embedded images changed during palette conversion.');
    }
    fs.writeFileSync(path.join(root,'builder.js'),code);
  }
}
fs.writeFileSync(path.join(root,'palette-map.json'),JSON.stringify(Object.fromEntries(used),null,2)+'\n');
console.log('Built the isolated assistant creation bundle using current palette tokens.');
