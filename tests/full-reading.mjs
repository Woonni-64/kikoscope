import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ts from 'typescript';
const compile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const lib={};vm.runInNewContext(compile('src/lib/full-reading.ts'),{exports:lib});
const article=fs.readFileSync('tests/fixtures/long-reading.txt','utf8').split('\n').slice(1).join('\n').trim();
const parser={};vm.runInNewContext(compile('src/lib/analyze-text.ts'),{exports:parser});
const parsed=parser.analyzeDocument('The Hidden Work of a Seed Library\n\n'+article+'\n\nQuestions 1-2\n1. What was the first difficulty?');
assert.equal(parsed.articleText.replace(/\s+/g,' ').trim(),article.replace(/\s+/g,' ').trim());
assert.ok(parsed.articleText.includes('raised questions that a local project'));
assert.equal(parser.analyzeDocument('Questions about the climate remain open. Scientists continue to collect data.').articleText.replace(/\s+/g,' '),'Questions about the climate remain open. Scientists continue to collect data.');
const chunks=lib.readingChunks(article);const total=chunks.flatMap(c=>c.sentences);
assert.ok(article.split(/\s+/).length>800);assert.ok(chunks.length>=3);assert.equal(total.map(s=>s.text).join(' '),article.replace(/\s+/g,' '));assert.equal(total.at(-1).index,total.length);assert.ok(total.at(-1).text.endsWith('grow as well.'));
const overview={summary:'主旨',purpose:'目的',logic:'从问题到制度再到结论',structure:chunks.map(c=>({id:c.id,mainIdea:'本部分内容',role:'与全文的联系',quote:c.sentences[0].text}))};
lib.validateOverview(overview,chunks);assert.throws(()=>lib.validateOverview({...overview,structure:overview.structure.slice(0,1)},chunks));assert.throws(()=>lib.validateOverview({...overview,structure:overview.structure.map((s,i)=>i? s:{...s,quote:'Invented quotation.'})},chunks));
const detail=c=>({id:c.id,explanation:'联系全文解释本部分',sentences:c.sentences.map(s=>({index:s.index,translation:'译文'+s.index,grammar:'结构'+s.index}))});
for(const chunk of chunks)lib.validateDetail(detail(chunk),chunk);
assert.throws(()=>lib.validateDetail({...detail(chunks[0]),sentences:detail(chunks[0]).sentences.slice(0,1)},chunks[0]));
const routeSource=compile('src/app/api/full-reading/route.ts');
async function run(body,fetcher,env={GEMINI_API_KEY:'test'}){const exports={};vm.runInNewContext(routeSource,{exports,require:p=>p==='@/lib/full-reading'?lib:{NextResponse:{json:(b,i)=>Response.json(b,i)}},process:{env},fetch:fetcher,AbortSignal,Error});const r=await exports.POST({json:async()=>body});return {status:r.status,body:await r.json()};}
for(const input of [{article:'tiny',mode:'overview'},{article:'a'.repeat(60001),mode:'overview'},{article,mode:'detail',chunkId:999}])assert.equal((await run(input,()=>{throw Error('not called')})).status,400);
assert.equal((await run({article,mode:'overview'},()=>{},{})).status,503);
for(const chunk of chunks){const result=await run({article,mode:'detail',chunkId:chunk.id},async(url,options)=>{const payload=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);assert.equal(payload.fullArticle.length,chunks.length);assert.equal(payload.fullArticle.at(-1).sentences.at(-1).text,total.at(-1).text);assert.equal(payload.targetChunk.id,chunk.id);return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(detail(chunk))}]}}]});});assert.equal(result.status,200);assert.equal(result.body.result.sentences.length,chunk.sentences.length);}
let calls=0;const recovered=await run({article,mode:'overview'},async()=>{if(++calls===1)return new Response('',{status:429});return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(overview)}]}}]});});assert.equal(recovered.status,200);assert.equal(calls,2);
const truncated=await run({article,mode:'detail',chunkId:1},async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'partial'}]}}]}));assert.equal(truncated.status,502);assert.equal(truncated.body.result,undefined);
console.log(`PASS: ${article.split(/\s+/).length} words, ${total.length} sentences, ${chunks.length} chunks; no source omitted, every detail request receives first through last chunks, missing/duplicate/fabricated evidence and truncated output rejected, bounded model fallback. Provider responses mocked.`);
