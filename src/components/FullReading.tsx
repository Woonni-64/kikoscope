"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cachedAnalysis, saveAnalysis } from "@/lib/analysis-client";
import { readingChunks, validateDetail, validateOverview, type ReadingCache, type ReadingOverview, type ReadingDetail } from "@/lib/full-reading";

type Article = { id: string; extractedText: string };
export default function FullReading({ article }: { article: Article }) {
  const source=article.extractedText;
  const chunks=useMemo(()=>readingChunks(source),[source]);
  const blank=():ReadingCache=>({version:1,source,details:{}});
  const [cache,setCache]=useState<ReadingCache>(blank);
  const cacheRef=useRef<ReadingCache>(cache);
  const [running,setRunning]=useState(false);
  const [status,setStatus]=useState("");
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [storageWarning,setStorageWarning]=useState("");
  const stopped=useRef(false);
  const active=useRef<AbortController|null>(null);
  useEffect(()=>{
    const saved=cachedAnalysis<{readingAnalysis?:ReadingCache}>(article.id)?.readingAnalysis;
    let restored=blank();
    if (saved?.version===1 && saved.source===source) {
      try { if(saved.overview) restored.overview=validateOverview(saved.overview,chunks); } catch { /* retry invalid entry */ }
      for (const chunk of chunks) { try { if(saved.details?.[chunk.id])restored.details[chunk.id]=validateDetail(saved.details[chunk.id],chunk); } catch { /* incomplete entry is retried */ } }
    }
    cacheRef.current=restored;setCache(restored);
    return ()=>{stopped.current=true;active.current?.abort();};
    // The keyed component remounts for another article.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[article.id,source,chunks]);
  const persist=(next:ReadingCache)=>{
    cacheRef.current=next;setCache(next);
    try {
      const latest=cachedAnalysis<Article>(article.id)||article;
      const snapshot={...latest,readingAnalysis:next};saveAnalysis(snapshot);setStorageWarning("");
    } catch(error) { setStorageWarning(error instanceof Error?error.message:"解读结果未能保存，请先备份资料。"); }
  };
  const completed=Object.keys(cache.details).length;
  const done=!!cache.overview && completed===chunks.length && chunks.length>0;
  const covered=chunks.reduce((sum,chunk)=>sum+(cache.details[chunk.id]?chunk.sentences.length:0),0);
  const total=chunks.reduce((sum,chunk)=>sum+chunk.sentences.length,0);
  const start=async()=>{
    if(running)return;
    stopped.current=false;setRunning(true);setErrors({});
    const request=async(mode:"overview"|"detail",chunkId?:number)=>{
      const controller=new AbortController();active.current=controller;
      const response=await fetch("/api/full-reading",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({article:source,mode,chunkId}),signal:controller.signal});
      const data=await response.json().catch(()=>({error:"服务器响应无效，请重试。"}));
      if(!response.ok)throw new Error(data.error||"全文解读失败，请重试。");
      return data.result;
    };
    try {
      if(!cacheRef.current.overview) {
        setStatus("正在通读全文，梳理主旨和结构…");
        try { const overview=validateOverview(await request("overview"),chunks);if(stopped.current)return;persist({...cacheRef.current,overview}); }
        catch(error) { if(!stopped.current)setErrors({overview:error instanceof Error?error.message:"全文概览失败，请重试。"});return; }
      }
      for(const chunk of chunks) {
        if(stopped.current)break;
        if(cacheRef.current.details[chunk.id])continue;
        setStatus(`正在解读第${chunk.id}/${chunks.length}部分（原句${chunk.sentences[0].index}—${chunk.sentences.at(-1)!.index}）…`);
        try {
          const detail=validateDetail(await request("detail",chunk.id),chunk);
          if(stopped.current)break;
          persist({...cacheRef.current,details:{...cacheRef.current.details,[chunk.id]:detail}});
        } catch(error) { if(!stopped.current)setErrors(prev=>({...prev,[chunk.id]:error instanceof Error?error.message:"本部分失败，请重试。"})); }
      }
    } finally { setRunning(false);setStatus(stopped.current?"已暂停，已完成结果保留。":"本轮处理结束；未完成部分可以继续重试。");active.current=null; }
  };
  const allowed=source.length>=40&&source.length<=60000&&chunks.length<=40;
  return <section className="mb-8 rounded-2xl border border-[#EEDDCC] bg-white p-5" aria-label="全文理解与分段解读">
    <h2 className="mb-2 text-xl font-semibold text-[#3E2723]">全文理解与分段解读</h2>
    <p className="mb-3 text-sm leading-6 text-[#8D7B6B]">先梳理全文主旨、作者目的和结构，再结合上下文解读每一句。按长度分为{chunks.length}个部分，共{total}句；每部分都接收完整文章。一次处理一篇，支持暂停后继续。</p>
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={running||done||!allowed} onClick={()=>void start()} className="rounded-full bg-[#8B5E3C] px-5 py-2 text-sm text-white disabled:opacity-50">{done?"全文解读完成":running?"正在解读…":cache.overview||completed?"继续解读／重试未完成":"解读全文"}</button>
      {running&&<button type="button" onClick={()=>{stopped.current=true;active.current?.abort();}} className="rounded-full border border-[#EEDDCC] px-4 py-2 text-sm">暂停</button>}
      <span role="status" className="text-sm text-[#8D7B6B]">{done?`全部完成：${covered}/${total}句`:running?status:`已解读${covered}/${total}句，完成${completed}/${chunks.length}部分`}</span>
    </div>
    {!allowed&&<p role="alert" className="mt-3 text-sm">请按单篇阅读文章导入（40—60000字符，最多40部分）。</p>}
    {!running&&!done&&status&&<p className="mt-2 text-xs text-[#8D7B6B]">{status}</p>}
    {storageWarning&&<p role="alert" className="mt-3 text-sm text-red-700">{storageWarning} 当前结果仍显示，但刷新可能丢失。</p>}
    {Object.entries(errors).map(([key,message])=><p role="alert" key={key} className="mt-2 text-sm text-red-700">{key==="overview"?"全文概览":`第${key}部分`}：{message}</p>)}
    {cache.overview&&<div className="mt-5 space-y-3 text-sm leading-7 text-[#3E2723]">
      <h3 className="font-semibold">全文概览</h3><p><b>主旨：</b>{cache.overview.summary}</p><p><b>作者目的：</b>{cache.overview.purpose}</p><p><b>全文逻辑：</b>{cache.overview.logic}</p>
      {cache.overview.structure.map(item=><div key={item.id} className="rounded-xl bg-[#FDFBF7] p-3"><b>第{item.id}部分：</b>{item.mainIdea}<p>{item.role}</p><blockquote className="mt-1 border-l-2 border-[#D4B896] pl-3 text-[#8D7B6B]">原文证据：{item.quote}</blockquote></div>)}
    </div>}
    {chunks.map(chunk=>{const detail=cache.details[chunk.id];return <details key={chunk.id} className="mt-3 rounded-xl border border-[#EEDDCC] p-3"><summary className="cursor-pointer text-sm font-medium">第{chunk.id}部分 · 原句{chunk.sentences[0].index}—{chunk.sentences.at(-1)!.index} · {detail?"已解读":"未完成"}</summary>{detail?<div className="mt-3 space-y-4 text-sm leading-7"><p>{detail.explanation}</p>{detail.sentences.map(sentence=><div key={sentence.index} className="border-t border-[#EEDDCC] pt-3"><p><b>原句{sentence.index}：</b>{chunk.sentences.find(item=>item.index===sentence.index)!.text}</p><p><b>翻译：</b>{sentence.translation}</p><p className="whitespace-pre-wrap"><b>分析：</b>{sentence.grammar}</p></div>)}</div>:<p className="mt-2 text-sm text-[#8D7B6B]">完成后会显示本部分全部句子的翻译和分析。</p>}</details>;})}
  </section>;
}
