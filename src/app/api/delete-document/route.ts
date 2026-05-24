import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type DeleteDocumentBody = {
  slug?: string;
  analysisId?: string;
};

function normalizeId(value?: string) {
  const id = value?.trim();
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return "";
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeleteDocumentBody;
    const id = normalizeId(body.analysisId || body.slug);

    if (!id) {
      return NextResponse.json({ error: "缺少有效的文件标识" }, { status: 400 });
    }

    const analysisPath = path.join(process.cwd(), "data", "analyses", `${id}.json`);
    const curatedPath = path.join(process.cwd(), "articles", "curated", `${id}.md`);

    fs.rmSync(analysisPath, { force: true });
    fs.rmSync(curatedPath, { force: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document failed:", error);
    return NextResponse.json({ error: "文件删除失败" }, { status: 500 });
  }
}
