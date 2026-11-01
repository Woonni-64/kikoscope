export type AnalyzeDocumentResult = {
  titleText: string;
  articleText: string;
  questionText: string;
  sentences: string[];
};

export const ieltsExtractionPrompt = `你是一个专业的雅思真题内容提取工具。请从以下文本中严格提取两部分：
1. 文章正文：仅保留英文文章的纯正文，过滤掉页码（如'第1页'、'Page 1'）、考试指引（如'Passage 1'、'You should spend...'）、题目部分、页眉页脚。按句子拆分，每句一行。
2. 题目部分：保留所有题目，包括题型说明（如TRUE/FALSE/NOT GIVEN）、题号、问题及选项。
返回格式必须严格遵守，不要任何解释：
---ARTICLE---
[正文内容]
---QUESTIONS---
[题目内容]`;

const nonArticleLinePattern =
  /^\s*(?:Reading\s+Passage\s+\d+\b|Passage\s+\d+\b|You should spend\b|Questions?\s+\d+\b|Questions?\s*[:：]?\s*$|Page\s+\d+(?:\s+of\s+\d+)?\s*$|第\s*\d+\s*页\s*$|TRUE\s*\/\s*FALSE|YES\s*\/\s*NO|NOT\s+GIVEN\s*$|Choose the correct\b|Complete the\b|Do the following statements agree\b)/i;

const questionStartPattern =
  /(^|\n)\s*(Questions?\s+\d+(?:[-–]\d+)?|Questions?\s*[:：]?(?=\n|$)|Do the following statements agree|Choose the correct letter|Complete the summary|Complete the notes|Complete the sentences|TRUE\s*\/\s*FALSE\s*\/\s*NOT\s+GIVEN|YES\s*\/\s*NO\s*\/\s*NOT\s+GIVEN|Summary Completion|Multiple Choice|Matching headings|Matching information|\d+\.\s+)/i;

export function splitSentences(text: string) {
  const continuous = text.replace(/\r\n/g, "\n").replace(/([A-Za-z])-\n(?=[a-z])/g, "$1").replace(/\s*\n\s*/g, " ");
  return (continuous.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? [])
    .map(sentence => sentence.trim()).filter(Boolean);
}

function cleanArticleText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !nonArticleLinePattern.test(line))
    .join("\n")
    .trim();
}

function extractSimpleAnalysis(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const questionStart = normalized.search(questionStartPattern);

  if (questionStart >= 0) {
    return {
      articleText: normalized.slice(0, questionStart).trim(),
      questionText: normalized.slice(questionStart).trim(),
    };
  }

  return {
    articleText: normalized,
    questionText: "",
  };
}

export function analyzeDocument(result: string): AnalyzeDocumentResult {
  const normalized = result.replace(/\r\n/g, "\n").trim();
  let titleText = "";
  const titleMatch = normalized.match(/---TITLE---\n([\s\S]*?)\n---ARTICLE---/);
  const articleMatch = normalized.match(/---ARTICLE---\n([\s\S]*?)\n---QUESTIONS---/);
  const questionsMatch = normalized.match(/---QUESTIONS---\n([\s\S]*)/);

  let articleText = articleMatch?.[1]?.trim() || "";
  let questionText = questionsMatch?.[1]?.trim() || "";

  if (!articleText && !questionText) {
    const simple = extractSimpleAnalysis(normalized);
    articleText = simple.articleText;
    questionText = simple.questionText;
  }

  titleText = titleMatch?.[1]?.trim() || "";
  const lines = articleText.split("\n");
  const first = lines.findIndex(line => line.trim());
  const firstLine = lines[first]?.trim().replace(/^#+\s*/, "") || "";
  // A short standalone heading followed by prose is a title, not a sentence.
  const headingBoundary = lines[first + 1]?.trim() === "" || /^#+\s/.test(lines[first] || "") || firstLine.split(/\s+/).filter(w => /^[A-Z]/.test(w)).length / Math.max(1, firstLine.split(/\s+/).length) > 0.6;
  if (!titleText && headingBoundary && firstLine && firstLine.length <= 120 && !/[.!?:;]$/.test(firstLine) && lines.slice(first + 1).some(line => /[.!?]/.test(line))) {
    titleText = firstLine;
    lines.splice(first, 1);
    articleText = lines.join("\n");
  } else if (titleText && firstLine.toLowerCase() === titleText.toLowerCase()) {
    lines.splice(first, 1);
    articleText = lines.join("\n");
  }
  articleText = splitSentences(cleanArticleText(articleText)).join("\n");

  return {
    titleText,
    articleText,
    questionText,
    sentences: splitSentences(articleText),
  };
}
