import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(fs.readFileSync('src/app/api/grammar-analysis/route.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function call(env, fetcher, sentence = 'Polar bears live on sea ice across the Arctic.') {
  const exports = {};
  vm.runInNewContext(source, { exports, require: () => ({NextResponse:{json:(body, init)=>Response.json(body, init)}}), process:{env}, URL, AbortSignal, Error, fetch:fetcher });
  const response = await exports.GET({url:'http://localhost/api/grammar-analysis?q='+encodeURIComponent(sentence)});
  return {status:response.status, body:await response.json(), headers:response.headers};
}
let result = await call({},()=>{throw Error('must not call without key')});
assert.equal(result.status,503); assert.equal(result.body.code,'MODEL_NOT_CONFIGURED'); assert.equal(result.body.analysis,undefined);
result = await call({},()=>{},''); assert.equal(result.status,400);
result = await call({},()=>{},'a'.repeat(6001)); assert.equal(result.status,400);
const env = {DEEPSEEK_API_KEY:'test-key-never-real'};
for (const status of [401,402,403,429,500]) {
  result=await call(env,async()=>new Response('',{status}));
  assert.equal(result.status,502); assert.equal(result.body.upstreamStatus,status); assert.equal(result.body.analysis,undefined);
  assert.ok(!JSON.stringify(result.body).includes(env.DEEPSEEK_API_KEY));
}
result=await call(env,async()=>Response.json({choices:[]})); assert.equal(result.body.code,'EMPTY_MODEL_RESPONSE');
result=await call(env,async()=>{const e=new Error('private url');e.name='TimeoutError';throw e;}); assert.equal(result.status,504);
result=await call(env,async()=>{throw Error('private url');}); assert.equal(result.body.code,'MODEL_UNAVAILABLE');
const analysis='主句结构：Polar bears 是主语，live 是谓语。\n从句与修饰：没有从句。\n中文翻译：北极熊生活在北极的海冰上。';
result=await call(env,async(url,options)=>{
  assert.equal(url,'https://api.deepseek.com/chat/completions');
  assert.equal(JSON.parse(options.body).messages[1].content,'Polar bears live on sea ice across the Arctic.');
  return Response.json({choices:[{message:{content:analysis}}]});
});
assert.equal(result.body.analysis,analysis); assert.equal(result.body.source,'deepseek'); assert.equal(result.headers.get('cache-control'),'no-store');
result=await call({GEMINI_API_KEY:'test'},async(url,options)=>{
  assert.ok(url.includes('gemini-2.5-flash:generateContent'));
  assert.equal(options.headers['x-goog-api-key'],'test');
  return Response.json({candidates:[{content:{parts:[{thought:true,text:'private reasoning'},{text:analysis}]}}]});
});
assert.equal(result.body.analysis,analysis);assert.equal(result.body.source,'gemini');
console.log('PASS: grammar route validation, real response passthrough, Gemini, missing key, auth/balance/quota/timeout/empty responses; no fake fallback or secret disclosure. Provider responses mocked.');
