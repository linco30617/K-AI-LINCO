import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // ⚡ 내 컴퓨터에서 돌아가는 Dify API 주소와 발급받은 키를 넣습니다.
    const DIFY_API_URL = 'http://localhost/v1';
    const DIFY_API_KEY = 'app-EbKM7jzjI2o8jo2Q4H0SggIz';

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {}, // 필요한 변수가 있다면 여기에 넣습니다.
        query: message, // 사용자가 보낸 질문
        response_mode: 'blocking', // 답변을 한 번에 다 받기
        user: 'linco-user-1', // 유저 구분을 위한 임의의 ID
      }),
    });

    const data = await response.json();
    
    // Dify가 돌려준 답변 알맹이만 쏙 빼서 프론트엔드로 보냅니다.
    const aiAnswer = data.answer; 

    return NextResponse.json({ answer: aiAnswer });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ answer: '⚠️ 링코가 잠시 자리를 비웠어요. 다시 시도해 주세요!' }, { status: 500 });
  }
}
