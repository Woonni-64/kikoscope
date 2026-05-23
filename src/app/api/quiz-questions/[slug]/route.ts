import { NextResponse } from "next/server";
import { quizQuestions, getDefaultQuestions } from "@/lib/quiz-questions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  const questions = quizQuestions[slug];
  
  if (questions) {
    return NextResponse.json(questions);
  }
  
  return NextResponse.json(getDefaultQuestions());
}
