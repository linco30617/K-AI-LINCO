import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

    // 🚀 로컬 파이썬 서버(FastAPI)로 사용자의 질문을 전달합니다.
    const pythonServerUrl = 'python-delta-drab.vercel.app';
    
    const response = await fetch(pythonServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message, // 파이썬 server.py가 받는 필드명
      }),
    });

    if (!response.ok) {
      throw new Error('파이썬 백엔드 서버 응답 실패');
    }

    const data = await response.json();

    // 파이썬 서버에서 받은 답변(data.answer)을 프론트엔드로 리턴합니다.
    return NextResponse.json({
      answer: data.answer,
      message,
      conversationId,
    });

  } catch (error) {
    console.error('Next.js API Route Error:', error);
    return NextResponse.json(
      { answer: '⚠️ 파이썬 백엔드 서버(server.py)와 통신하는 중 에러가 발생했습니다. 서버가 켜져 있는지 확인하세요.' },
      { status: 500 }
    );
  }
}
