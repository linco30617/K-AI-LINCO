import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // ⚡ 실제 발급받은 Dify 키를 꼭 확인해 주세요! (예: app-xxxx)
    const DIFY_API_KEY = 'app-ZKgOiWU1HG79NEmFlxUPfwBU'; 
    
    // 만약 일반 챗봇이면 chat-messages, 채팅 플로우면 advanced-chat-messages를 씁니다.
    // 안전하게 연동하기 위해 아래 주소 구조를 사용합니다.
    const DIFY_API_URL = 'http://localhost/v1/chat-messages';

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'blocking', // 실시간 스트리밍이 아닌 한 번에 받는 방식
        user: 'linco-user-default',
      }),
    });

    if (!response.ok) {
      // Dify 내부에서 에러가 났을 때 어떤 에러인지 터미널에 명확히 찍어줍니다.
      const errorText = await response.text();
      console.error('❌ Dify 자체 에러 반환:', response.status, errorText);
      return NextResponse.json({ answer: `⚠️ Dify 엔진 오류 (${response.status})` });
    }

    const data = await response.json();
    return NextResponse.json({ answer: data.answer });

  } catch (error) {
    // VS Code나 Next.js 실행 터미널 창에 에러의 실체를 정확히 출력합니다.
    console.error('❌ Next.js 백엔드 Catch 에러 로그:', error);
    return NextResponse.json({ answer: '⚠️ 링코 서버 통신 중 오류가 발생했습니다.' }, { status: 500 });
  }
}