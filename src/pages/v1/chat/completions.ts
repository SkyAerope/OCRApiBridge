// src/pages/api/v1/chat/completions.ts
import { Buffer } from 'buffer';
import type { APIRoute } from 'astro';

interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: string;
    content: Array<{
      type: string;
      text?: string;
      image_url?: {
        url: string;
        detail?: string;
      };
    }>;
  }>;
  max_tokens?: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: { message: "Unauthorized" } 
      }), { status: 401 });
    }

    // 获取Bearer token
    const providedKey = authHeader.split(' ')[1];
    
    // 验证API密钥
    const apiKey = import.meta.env.API_KEY || import.meta.env.AZURE_OCR_KEY;
    if (!apiKey || providedKey !== apiKey) {
      return new Response(JSON.stringify({ 
        error: { message: "Invalid API key" } 
      }), { status: 401 });
    }

    const requestBody: OpenAIRequest = await request.json();
    
    // 提取图片数据
    const imageMessage = requestBody.messages
      .flatMap(m => m.content)
      .find(c => c.type === 'image_url');

    if (!imageMessage?.image_url?.url) {
      return new Response(JSON.stringify({
        error: { message: "No image found in request" }
      }), { status: 400 });
    }

    const base64Data = imageMessage.image_url.url.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // 调用Azure OCR
    const azureEndpoint = import.meta.env.AZURE_OCR_ENDPOINT.replace(/\/$/, '');
    const azureResponse = await fetch(
      `${azureEndpoint}/vision/v3.2/ocr?language=unk&detectOrientation=true`,
      {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': import.meta.env.AZURE_OCR_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
      }
    );

    if (!azureResponse.ok) {
      throw new Error(`Azure OCR failed: ${azureResponse.statusText}`);
    }

    const azureData = await azureResponse.json();
    const extractedText = extractTextFromAzureResponse(azureData);

    // 构造OpenAI格式响应
    return new Response(JSON.stringify({
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: requestBody.model,
      choices: [{
        message: {
          role: "assistant",
          content: extractedText,
        },
        finish_reason: "stop",
        index: 0,
      }],
      usage: {
        prompt_tokens: calculateTokenCount(requestBody.messages),
        completion_tokens: calculateTokenCount(extractedText),
        total_tokens: calculateTokenCount(requestBody.messages) + calculateTokenCount(extractedText)
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: { message: error.message } 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// 文本提取函数
function extractTextFromAzureResponse(response: any): string {
  return response.regions?.flatMap((region: any) => 
    region.lines?.flatMap((line: any) => 
      line.words?.map((word: any) => word.text).join(' ')
    ).join('\n')
  ).join('\n') || '';
}

// 简化的token计算
function calculateTokenCount(input: any): number {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  return Math.ceil(text.length / 4); // 近似计算
}