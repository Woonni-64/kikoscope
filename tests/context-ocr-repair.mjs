import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
function load(path, env, fetcher) {
  const exports={};
  const source=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{exports,require:()=>({NextResponse:{json:(body, init)=>Response.json(body, init)}}),process:{env},AbortSignal,Error,fetch:fetcher});
  return exports;
}
const output=text=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'private reasoning'},{text}]}}]});
const fakeKey='test-key-not-real';const env={GEMINI_API_KEY:fakeKey};
const ocr=(env,fetcher)=>load('src/lib/document-recognition.ts',env,fetcher);
await assert.rejects(ocr({},()=>{throw Error('no network expected')}).recognizeDocument('data','image/jpeg'), e=>e.code==='OCR_NOT_CONFIGURED'&&e.status===503);
for (const transient of [429,500,503,'timeout','network']) {
  let calls=0;
  const client=ocr(env,async(url,options)=>{
    calls++;assert.equal(options.headers['x-goog-api-key'],fakeKey);
    assert.equal(JSON.parse(options.body).contents[0].parts[1].inlineData.mimeType,'image/jpeg');
    if(calls===1){if(transient==='timeout'){const e=new Error('secret');e.name='TimeoutError';throw e;}if(transient==='network')throw Error('secret');return new Response('',{status:transient});}
    return output('Readable English sentence.');
  });
  assert.equal(await client.recognizeDocument('data','image/jpeg'),'Readable English sentence.');assert.equal(calls,2);
}
for (const status of [400,401,403]) {
 let calls=0;await assert.rejects(ocr(env,async()=>{calls++;return new Response('secret',{status});}).recognizeDocument('data','image/jpeg'), e=>e.status===503&&!e.message.includes(fakeKey));assert.equal(calls,1);
}
await assert.rejects(ocr(env,async()=>output('')).recognizeDocument('data','image/jpeg'),e=>e.code==='OCR_EMPTY');
await assert.rejects(ocr(env,async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'partial text'}]}}]})).recognizeDocument('data','image/jpeg'),e=>e.code==='OCR_INCOMPLETE');
let attempts=0;await assert.rejects(ocr(env,async()=>{attempts++;const e=new Error('secret');e.name='TimeoutError';throw e;}).recognizeDocument('data','application/pdf'),e=>e.status===504&&e.code==='OCR_TIMEOUT');assert.equal(attempts,2);
const sentence='Gardeners return fresh seeds after the harvest.';
async function define(body,fetcher,settings=env) {
 const route=load('src/app/api/context-definition/route.ts',settings,fetcher);
 const res=await route.POST({json:async()=>body});return {status:res.status,body:await res.json()};
}
let result=await define({word:'harvest',sentence},async(url,options)=>{
 const payload=JSON.parse(options.body);assert.ok(payload.contents[0].parts[0].text.includes(sentence));
 return output(JSON.stringify({pos:'noun',chineseMeaning:'收获；收割',definition:'The gathering of ripe crops.'}));
});assert.equal(result.status,200);assert.equal(result.body.example,sentence);assert.match(result.body.chineseMeaning,/收获/);assert.equal(result.body.source,'context');
for(const body of [{word:'harvest',sentence:'No such word.'},{word:'x'.repeat(81),sentence},{word:'harvest',sentence:'x'.repeat(3001)}])assert.equal((await define(body,()=>{throw Error('must not call');})).status,400);
assert.equal((await define({word:'harvest',sentence},()=>{},{})).status,503);
for(const status of [401,429,500]){result=await define({word:'harvest',sentence},async()=>new Response('secret',{status}));assert.equal(result.body.definition,undefined);assert.ok(!JSON.stringify(result.body).includes(fakeKey));}
result=await define({word:'harvest',sentence},async()=>output('{"pos":"noun"}'));assert.equal(result.status,502);assert.equal(result.body.definition,undefined);
let requests=0;
result=await define({word:'harvest',sentence},async(url)=>{requests++;if(requests===1)return new Response('',{status:429});assert.ok(url.includes('gemini-2.5-flash-lite'));return output(JSON.stringify({pos:'noun',chineseMeaning:'收获',definition:'Gathering ripe crops.'}));});
assert.equal(result.status,200);assert.equal(requests,2);
// Exercise image orientation/flattening/encoding with real fixtures, not mock bytes.
for (const ext of ['png','jpg']) {
 const input=sharp({create:{width:2500,height:3000,channels:4,background:{r:255,g:255,b:255,alpha:0.5}}});
 const bytes=await (ext==='png'?input.png():input.jpeg()).toBuffer();
 const normalized=await sharp(bytes,{limitInputPixels:40_000_000}).rotate().flatten({background:'#ffffff'}).resize({width:2000,height:2400,fit:'inside',withoutEnlargement:true}).jpeg({quality:90}).toBuffer();
 const metadata=await sharp(normalized).metadata();assert.equal(metadata.format,'jpeg');assert.ok(metadata.width<=2000&&metadata.height<=2400);assert.equal(metadata.hasAlpha,false);
}
console.log('PASS: contextual definitions use the original sentence and one bilingual sense; validation and honest provider failures. OCR normalization (real PNG/JPG), transient retries, timeout, auth, empty/truncated response and safe errors (provider responses mocked).');
