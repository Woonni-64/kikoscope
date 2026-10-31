import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3101';
async function upload(name, text, originalName) {
  const form = new FormData();
  form.set('file', new File([text], name, { type: name.endsWith('.png') ? 'image/png' : 'text/plain' }));
  if (originalName) form.set('originalName', originalName);
  const res = await fetch(base + '/api/analyze-document', { method: 'POST', body: form });
  return { status: res.status, data: await res.json() };
}
const a = await upload('recognized.txt', 'Reading helps students learn new words. A polar bear lives in the Arctic.', 'reading.png');
assert.equal(a.status, 200);
assert.equal(a.data.storageMode, 'browser');
assert.equal(a.data.analysis.fileName, 'reading.png');
assert.match(a.data.analysis.extractedText, /polar bear/);
assert.deepEqual(a.data.analysis.vocabulary, []);
assert.deepEqual(a.data.analysis.questions, []);
assert.equal((await upload('empty.txt', '  ')).status, 422);
const raw = await upload('raw.png', 'not-an-image');
assert.equal(raw.status, 500);
assert.doesNotMatch(raw.data.error, /spawn|ENOENT/);
assert.match(raw.data.error, /图片识别/);
assert.equal((await fetch(base + '/api/analyze-document?id=invalid')).status, 400);
const list = await (await fetch(base + '/api/analyze-document')).json();
assert.ok(list.documents.some(d => d.name.includes('polar-bears')));
const old = await fetch(base + '/api/analyze-document?id=' + list.documents[0].analysisId);
assert.equal(old.status, 200);
console.log('PASS Vercel-mode production HTTP: text/image-OCR-text upload, original filename, no mock data, empty/error paths, old documents remain readable');

const source = fs.readFileSync('src/lib/analysis-client.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const values = new Map([['vocabulary', '[{"word":"old"}]'], ['kikoscope_documents', '[]']]);
const localStorage = { getItem:k => values.get(k) ?? null, setItem:(k,v)=>values.set(k,v), removeItem:k=>values.delete(k) };
const ctx = {exports:{},require:()=>({downloadBlob:()=>{}}),localStorage,fetch:async()=>{throw new Error('server not available')},setTimeout};
vm.runInNewContext(js,ctx);
ctx.exports.saveAnalysis(a.data.analysis);
assert.equal((await ctx.exports.loadAnalysis(a.data.analysisId)).fileName,'reading.png');
const refreshed = { exports:{}, require:ctx.require, localStorage, fetch:ctx.fetch, setTimeout };
vm.runInNewContext(js,refreshed);
assert.match((await refreshed.exports.loadAnalysis(a.data.analysisId)).extractedText, /polar bear/);
assert.equal(values.get('vocabulary'),'[{"word":"old"}]');
ctx.exports.removeCachedAnalysis(a.data.analysisId);
assert.equal(ctx.exports.cachedAnalysis(a.data.analysisId),null);
localStorage.setItem = () => {throw new Error('quota')};
assert.throws(()=>ctx.exports.saveAnalysis(a.data.analysis),/存储空间不足/);
console.log('PASS browser storage simulation: saved result survives reload without server, old vocabulary untouched, deletion, quota error');
