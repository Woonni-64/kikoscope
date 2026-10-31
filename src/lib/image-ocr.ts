"use client";

export async function recognizeImage(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  let expired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const recognition = (async () => {
    worker = await createWorker("eng");
    if (expired) { await worker.terminate(); throw new Error("识别超时"); }
    const result = await worker.recognize(file);
    const text = result.data.text.trim();
    if (!/[A-Za-z]{3}/.test(text)) throw new Error("没有识别到清晰的英文正文，请换一张清晰截图或粘贴原文。");
    return text;
  })();
  try {
    return await Promise.race([recognition, new Promise<never>((_, reject) => {
      timer = setTimeout(() => { expired = true; reject(new Error("图片识别超时，请换较小的截图，或粘贴原文。")); }, 90000);
    })]);
  } catch (error) {
    if (error instanceof Error && /正文|超时/.test(error.message)) throw error;
    throw new Error("图片识别组件未能加载，请检查网络后重试，或粘贴原文。首次识别需要下载英文识别资源。");
  } finally {
    if (timer) clearTimeout(timer);
    if (worker) await worker.terminate().catch(() => undefined);
  }
}
