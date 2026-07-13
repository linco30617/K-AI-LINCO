export interface DifyRequestPayload {
  inputs: Record<string, unknown>;
  query: string;
  response_mode: 'blocking' | 'streaming';
  user: string;
  conversation_id?: string;
}

export interface DifyResponseData {
  message_id: string;
  mode: string;
  answer: string;
  metadata?: Record<string, unknown>;
}

export interface DifyErrorResponse {
  code: string;
  message: string;
  status: number;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
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

export const DIFY_CONFIG = {
  apiUrl: normalizeDifyEndpoint(process.env.DIFY_API_URL || process.env.NEXT_PUBLIC_DIFY_API_URL || 'http://localhost/v1'),
  apiKey: process.env.DIFY_API_KEY || 'app-pvPv6r8cyOf8tN7KS4ylsGhk',
  userId: process.env.DIFY_API_USER_ID || process.env.DIFY_USER_ID || 'a7c4c63e-32f9-43df-9913-a0e112795052',
}

export async function callDifyAPI(message: string, conversationId?: string): Promise<string> {
  try {
    const payload: DifyRequestPayload = {
      inputs: {},
      query: message,
      response_mode: 'blocking',
      user: DIFY_CONFIG.userId,
      ...(conversationId && { conversation_id: conversationId }),
    }

    const response = await fetch(DIFY_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Partial<DifyErrorResponse> & {
        message?: string
      }
      throw new Error(`Dify API Error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    const data = (await response.json()) as DifyResponseData
    return data.answer || '응답을 생성하지 못했습니다.'
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Dify API 호출 오류:', errorMessage)
    throw error
  }
}

export function normalizeAnswer(text: string): string {
  if (!text) return ''

  return text.replace(/\\n/g, '\n').replace(/\n\n+/g, '\n\n').trim()
}
