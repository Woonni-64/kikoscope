"use client";
import type { WordEntry } from "./wordbook";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function wordRows(words: WordEntry[]) {
  return words.map(word => [word.word, word.phonetic || "", word.chineseMeaning || word.meaning || "", word.fromArticle || word.source || "手动导入"]);
}
export async function createVocabularyDocx(words: WordEntry[]) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = await import("docx");
  const rows = [["单词", "音标", "释义", "来自"], ...wordRows(words)];
  return Packer.toBlob(new Document({ sections: [{ children: [
    new Paragraph({ text: "Kikoscope 我的词库", heading: "Heading1" }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows.map((cells, index) => new TableRow({ tableHeader: index === 0, children: cells.map(text => new TableCell({ children: [new Paragraph(text)] })) })) }),
  ] }] }));
}
export async function createVocabularyPdf(words: WordEntry[]) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:1000px;background:white;color:#222;font:20px Arial,'PingFang SC','Microsoft YaHei',sans-serif;padding:36px;box-sizing:border-box;";
  document.body.appendChild(host);
  try {
    const rows = wordRows(words);
    for (let offset = 0; offset < rows.length; offset += 12) {
      host.replaceChildren();
      const title = document.createElement("h1"); title.textContent = "Kikoscope 我的词库"; title.style.fontSize = "28px"; host.appendChild(title);
      const table = document.createElement("table"); table.style.cssText = "width:100%;border-collapse:collapse;table-layout:fixed;";
      for (const [index, cells] of [["单词", "音标", "释义", "来自"], ...rows.slice(offset, offset + 12)].entries()) {
        const tr = document.createElement("tr");
        for (const text of cells) {
          const cell = document.createElement(index === 0 ? "th" : "td");
          cell.textContent = text; cell.style.cssText = "padding:12px;border:1px solid #ccc;vertical-align:top;text-align:left;overflow-wrap:anywhere;line-height:1.5;";
          tr.appendChild(cell);
        }
        table.appendChild(tr);
      }
      host.appendChild(table);
      await document.fonts.ready;
      const canvas = await html2canvas(host, { scale: 2, backgroundColor: "#ffffff", logging: false });
      // Slice unusually long rows too; no content is drawn beyond the page bounds.
      const sliceHeight = Math.floor(canvas.width * 277 / 190);
      for (let y = 0; y < canvas.height; y += sliceHeight) {
        if (offset > 0 || y > 0) pdf.addPage();
        const slice = document.createElement("canvas"); slice.width = canvas.width; slice.height = Math.min(sliceHeight, canvas.height - y);
        slice.getContext("2d")!.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
        pdf.addImage(slice.toDataURL("image/png"), "PNG", 10, 10, 190, 190 * slice.height / slice.width);
      }
    }
    return pdf.output("blob");
  } finally { host.remove(); }
}
