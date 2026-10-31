export type QuizQuestion = {
  type: "multiple-choice" | "true-false" | "fill-in-blank";
  question: string; options?: string[]; answer: string; explanation: string; reference: string;
};
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
export function validateQuestions(value: unknown, article: string): QuizQuestion[] {
  if (!Array.isArray(value) || !value.length || value.length > 10) throw new Error("题目格式不完整，请重新生成。");
  const seen = new Set<string>();
  return value.map(item => {
    if (!item || !["multiple-choice", "true-false", "fill-in-blank"].includes(item.type) || typeof item.question !== "string" || !item.question.trim() || typeof item.answer !== "string" || !item.answer.trim() || typeof item.explanation !== "string" || !item.explanation.trim() || typeof item.reference !== "string" || normalize(item.reference).length < 12 || !normalize(article).includes(normalize(item.reference))) throw new Error("题目缺少可核对的原文证据，请重新生成。");
    if (seen.has(item.question.trim())) throw new Error("题目重复，请重新生成。");
    seen.add(item.question.trim());
    const question: QuizQuestion = {type:item.type,question:item.question.trim(),answer:item.answer.trim(),explanation:item.explanation.trim(),reference:item.reference.trim()};
    if (item.type === "multiple-choice") {
      if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6 || item.options.some((x: unknown) => typeof x !== "string" || !x.trim())) throw new Error("选择题选项不完整。");
      question.options = item.options.map((x: string) => x.replace(/^[A-F][.)、]\s*/, "").trim());
      question.answer = item.answer.trim().toUpperCase();
      if (!/^[A-F]$/.test(question.answer) || question.answer.charCodeAt(0) - 65 >= question.options!.length) throw new Error("选择题答案无效。");
    } else if (item.type === "true-false") {
      question.options = ["TRUE", "FALSE", "NOT GIVEN"];
      question.answer = item.answer.trim().toUpperCase().replace(/[_-]+/g," ");
      if (!question.options.includes(question.answer)) throw new Error("判断题答案无效。");
    } else {
      if (!normalize(item.reference).includes(normalize(question.answer))) throw new Error("填空答案未能在原文证据中核实。");
    }
    return question;
  });
}
export function isCorrectAnswer(question: QuizQuestion, value: string) {
  return normalize(value) === normalize(question.answer);
}
