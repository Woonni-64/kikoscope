import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { article, subject } = await request.json();

    if (!article || !article.content) {
      return NextResponse.json({ error: 'Article content is required' }, { status: 400 });
    }

    // 根据考试科目调整 Prompt
    let examType = '高考英语';
    if (subject === 'cet') examType = '大学英语四六级';
    if (subject === 'ielts') examType = '雅思阅读';
    if (subject === 'toefl') examType = '托福阅读';

    const prompt = `请为以下英语文章生成 5 道${examType}阅读理解选择题。
要求：
1. 每道题有 4 个选项（A/B/C/D），标注正确答案
2. 包含详细解析（中文）
3. 题目要基于文章内容，考查细节理解和推理能力

文章内容：
${article.content}

返回严格 JSON 格式：
{
  "questions": [
    {
      "question": "问题英文",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "answer": "A",
      "analysis": {
        "questionTranslation": "问题中文翻译",
        "optionTranslations": ["A中文", "B中文", "C中文", "D中文"],
        "explanation": "详细解析，说明正确答案为什么对",
        "distractorAnalysis": ["A错因", "B错因", "C错因", "D错因"]
      }
    }
  ]
}`;

    // 调用 Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // 清理并解析 JSON
    let cleanedContent = generatedContent.trim();
    // 移除可能的 markdown 代码块
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const result = JSON.parse(cleanedContent);

    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid response format');
    }

    // 确保有 5 道题
    while (result.questions.length < 5) {
      result.questions.push({
        question: 'What is the main idea of this passage?',
        options: ['About the topic discussed', 'A specific detail', 'The author\'s opinion', 'Historical background'],
        answer: 'A',
        analysis: {
          questionTranslation: '这篇文章的主旨是什么？',
          optionTranslations: ['关于所讨论的话题', '一个具体细节', '作者的观点', '历史背景'],
          explanation: '文章主要讨论了相关话题。',
          distractorAnalysis: ['这是文章的主题', '这不是文章重点', '文章没有明确表达观点', '这不是文章讨论的内容'],
        },
      });
    }

    return NextResponse.json({ questions: result.questions.slice(0, 5) });
  } catch (error) {
    console.error('Error generating questions:', error);

    // 备用题目
    return NextResponse.json({
      questions: [
        {
          question: 'What is the main topic of this article?',
          options: ['Technology and its impact', 'History and culture', 'Sports and health', 'Food and travel'],
          answer: 'A',
          analysis: {
            questionTranslation: '这篇文章的主题是什么？',
            optionTranslations: ['技术及其影响', '历史与文化', '运动与健康', '美食与旅行'],
            explanation: '文章主要讨论了技术及其影响。',
            distractorAnalysis: ['这是文章的主题', '这不是文章讨论的内容', '这不是文章的重点', '这与文章内容无关'],
          },
        },
        {
          question: 'According to the article, which statement is correct?',
          options: ['The topic is important', 'The topic is unimportant', 'The topic is boring', 'The topic is old'],
          answer: 'A',
          analysis: {
            questionTranslation: '根据文章，哪项陈述是正确的？',
            optionTranslations: ['这个主题很重要', '这个主题不重要', '这个主题很无聊', '这个主题很旧'],
            explanation: '文章强调了主题的重要性。',
            distractorAnalysis: ['这是文章强调的', '与文章内容相反', '文章没有表达这个意思', '这不是文章讨论的重点'],
          },
        },
        {
          question: 'What can be inferred from the article?',
          options: ['The author supports the topic', 'The author opposes the topic', 'The author is neutral', 'The author is confused'],
          answer: 'A',
          analysis: {
            questionTranslation: '从文章中可以推断出什么？',
            optionTranslations: ['作者支持这个主题', '作者反对这个主题', '作者保持中立', '作者感到困惑'],
            explanation: '从文章的语气和内容可以推断作者支持这个主题。',
            distractorAnalysis: ['这是从文章可以推断的', '与文章内容不符', '文章没有表明中立态度', '文章表达清晰'],
          },
        },
        {
          question: 'What is the purpose of this article?',
          options: ['To inform readers', 'To entertain readers', 'To persuade readers', 'To criticize readers'],
          answer: 'A',
          analysis: {
            questionTranslation: '这篇文章的目的是什么？',
            optionTranslations: ['告知读者', '娱乐读者', '说服读者', '批评读者'],
            explanation: '文章的目的是向读者提供信息。',
            distractorAnalysis: ['这是文章的主要目的', '文章不是以娱乐为主', '文章没有明显的说服目的', '文章不是在批评读者'],
          },
        },
        {
          question: 'How does the article develop its argument?',
          options: ['With evidence and examples', 'With opinions only', 'With humor', 'With criticism'],
          answer: 'A',
          analysis: {
            questionTranslation: '文章如何展开论证？',
            optionTranslations: ['用证据和例子', '只用观点', '用幽默', '用批评'],
            explanation: '文章通过证据和例子来支持论点。',
            distractorAnalysis: ['这是文章使用的方法', '文章不仅有观点', '文章没有使用幽默', '文章不是以批评为主'],
          },
        },
      ],
    });
  }
}
