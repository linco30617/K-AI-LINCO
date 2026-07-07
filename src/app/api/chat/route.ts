import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message ?? body?.query ?? '';
    const conversationId = body?.conversationId ?? body?.conversation_id ?? '';

    const difyUrl = process.env.DIFY_API_URL || 'http://localhost/v1';
    const difyKey = process.env.DIFY_API_KEY || 'app-JA4vN5714g2Nd5ftpyFgN49g';

    if (!message?.trim()) {
      return NextResponse.json({ answer: '질문 내용을 입력해 주세요.' });
    }

    if (!difyKey) {
      return NextResponse.json({
        answer: '⚠️ .env.local에 DIFY_API_KEY가 설정되지 않았습니다. 설정을 확인해 주세요.',
      });
    }

    const instruction = '다음 지침을 지켜서 답변해주세요.\n- 한국어와 숫자만 사용합니다.\n- 한자는 사용하지 않습니다.\n- 영어는 사용하지 않습니다.\n\n';
    const query = `${instruction}${message}`;

    const response = await fetch(`${difyUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${difyKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'blocking',
        user: 'linco-web-user',
        conversation_id: conversationId || '',
      }),
    });

    const responseText = await response.text();
    let data: any = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText || 'Dify API 응답을 받지 못했습니다.' };
    }

    if (!response.ok) {
      const detail = data?.message || data?.error || `Dify API 오류 (${response.status})`;
      return NextResponse.json(
        {
          answer: `⚠️ Dify API 오류: ${detail}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dify API 연결 오류:', error);
    return NextResponse.json({ error: 'Dify API 연결에 실패했습니다.' }, { status: 500 });
  }
}