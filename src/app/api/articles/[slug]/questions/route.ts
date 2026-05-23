import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  void request;

  try {
    const { slug } = await params;

    if (slug.startsWith("race-")) {
      return NextResponse.json({ questions: [] });
    }

    return NextResponse.json({ questions: [] });
  } catch (error) {
    console.error("Error loading questions:", error);
    return NextResponse.json({ questions: [] });
  }
}
