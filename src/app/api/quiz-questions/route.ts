import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const quizDataPath = path.join(process.cwd(), 'quiz_data', 'cet_questions_full.json');
    
    if (!fs.existsSync(quizDataPath)) {
      return NextResponse.json({ error: "Quiz data not found" }, { status: 404 });
    }
    
    const data = fs.readFileSync(quizDataPath, 'utf-8');
    const questions = JSON.parse(data);
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Failed to fetch quiz questions:", error);
    return NextResponse.json({ error: "Failed to fetch quiz questions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { quizKey } = await request.json();
    
    const quizDataPath = path.join(process.cwd(), 'quiz_data', 'cet_questions_full.json');
    
    if (!fs.existsSync(quizDataPath)) {
      return NextResponse.json({ error: "Quiz data not found" }, { status: 404 });
    }
    
    const data = fs.readFileSync(quizDataPath, 'utf-8');
    const allQuestions = JSON.parse(data);
    
    const result = allQuestions[quizKey];
    
    if (!result) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
