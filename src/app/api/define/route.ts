import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ translation: '' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`;
      const response = await fetch(myMemoryUrl);
      const data = await response.json();
      
      return NextResponse.json({
        translation: data.responseData?.translatedText || '',
      });
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `请翻译以下英文为中文，只需给出翻译结果，不要其他说明：\n\n${text}`,
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({ translation });
    } catch (apiError) {
      console.error('DeepSeek API error, falling back to MyMemory:', apiError);
      
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`;
      const fallbackResponse = await fetch(myMemoryUrl);
      const fallbackData = await fallbackResponse.json();
      
      return NextResponse.json({
        translation: fallbackData.responseData?.translatedText || '',
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ translation: '' });
  }
}
