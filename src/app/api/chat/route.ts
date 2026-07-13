import { NextResponse } from 'next/server'

type DifyResponseShape = {
  answer?: unknown
  message?: unknown
  text?: unknown
  error?: unknown
  conversation_id?: unknown
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizeDifyEndpoint(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')

  if (!trimmed) {
    return 'http://localhost/v1/chat-messages'
  }

  if (trimmed.endsWith('/chat-messages')) {
    return trimmed
  }

  return `${trimmed}/chat-messages`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = readString(body?.message ?? body?.query)
    const conversationId = readString(body?.conversationId ?? body?.conversation_id)

    const difyEndpoint = normalizeDifyEndpoint(process.env.DIFY_API_URL || 'http://localhost/v1')
    const difyKey = process.env.DIFY_API_KEY || 'app-pvPv6r8cyOf8tN7KS4ylsGhk'
    const difyUserId = process.env.DIFY_API_USER_ID || 'a7c4c63e-32f9-43df-9913-a0e112795052'

    if (!message.trim()) {
      return NextResponse.json({ answer: '질문 내용을 입력해 주세요.' })
    }

    if (!difyKey) {
      return NextResponse.json(
        {
          answer: '.env.local 에 DIFY_API_KEY 를 설정해 주세요.',
        },
        { status: 500 }
      )
    }

    const payload: Record<string, unknown> = {
      inputs: {},
      query: message,
      response_mode: 'blocking',
      user: difyUserId,
    }

    if (conversationId) {
      payload.conversation_id = conversationId
    }

    const response = await fetch(difyEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${difyKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    let data: DifyResponseShape = {}

    try {
      data = responseText ? (JSON.parse(responseText) as DifyResponseShape) : {}
    } catch {
      data = { message: responseText || 'Dify API 응답을 해석하지 못했습니다.' }
    }

    const answer = readString(data.answer) || readString(data.message) || readString(data.text)
    const responseConversationId = readString(data.conversation_id) || conversationId
    const responseError = readString(data.message) || readString(data.error) || `Dify API 오류 (${response.status})`

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Dify API 오류: ${responseError}`,
          message: `Dify API 오류: ${responseError}`,
          answer: `Dify API 오류: ${responseError}`,
          conversation_id: conversationId,
          status: response.status,
          details: responseText,
          raw: data,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      answer,
      conversation_id: responseConversationId,
      raw: data,
    })
  } catch (error) {
    console.error('Dify API 연결 오류:', error)
    return NextResponse.json({ error: 'Dify API 연결에 실패했습니다.' }, { status: 500 })
  }
}
