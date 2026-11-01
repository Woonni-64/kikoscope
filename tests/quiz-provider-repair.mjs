import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const quiz={};vm.runInNewContext(compile('src/lib/quiz.ts'),{exports:quiz});
const source=compile('src/app/api/generate-quiz/route.ts');
const article='The library keeps seeds in a cool, dry room because moisture can damage them.';
const question={type:'fill-in-blank',question:'Moisture can damage the ____.',answer:'seeds',explanation:'原文说明水分会损坏种子。',reference:article};
async function run(fetcher){const exports={};vm.runInNewContext(source,{exports,process:{env:{GEMINI_API_KEY:'test'}},require:name=>name==='@/lib/quiz'?quiz:{NextResponse:{json:(body,init)=>Response.json(body,init)}},fetch:fetcher,AbortSignal,Error});const response=await exports.POST({json:async()=>({article})});return {status:response.status,body:await response.json()};}
let calls=0;let result=await run(async(url)=>{calls++;if(calls===1)return new Response('',{status:429});assert.ok(url.includes('gemini-2.5-flash-lite'));return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({questions:[question]})}]}}]});});
assert.equal(result.status,200);assert.equal(calls,2);assert.equal(result.body.questions[0].answer,'seeds');
result=await run(async()=>new Response('',{status:429}));assert.equal(result.status,502);assert.equal(result.body.questions,undefined);
result=await run(async()=>Response.json({candidates:[{content:{parts:[{text:JSON.stringify({questions:[{...question,reference:'Unrelated invented evidence.'}]})}]}}]}));assert.equal(result.status,502);assert.equal(result.body.questions,undefined);
console.log('PASS: quiz rate-limit fallback uses real validated evidence; persistent failures and invented references never produce questions. Provider responses mocked.');
