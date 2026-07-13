'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useRef, useState } from 'react'

type ThemeMode = 'dark' | 'light'
type MainTab = 'chat' | 'guide' | 'site' | 'overview' | 'roadmap' | 'settings'
type Sender = 'user' | 'ai'

interface Message {
  id: string
  sender: Sender
  text: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  conversationId: string
  createdAt: number
  updatedAt: number
}

type BootstrapState = {
  conversations: Conversation[]
  activeConversationId: string
  assistantSidebarOpen: boolean
  theme: ThemeMode
}

type CategoryDetail = {
  num: string
  title: string
  subtitle: string
  bullets: string[]
}

let conversationSeed = 0
let messageSeed = 0
let activitySeed = 0
let bootstrapCache: BootstrapState | null = null

const STORAGE_KEYS = {
  conversations: 'linco.chat.conversations.v1',
  activeConversation: 'linco.chat.activeConversation.v1',
  assistantSidebar: 'linco.chat.assistantSidebar.v1',
  theme: 'linco.theme.v1',
} as const

const DEFAULT_GREETING: Message = {
  id: 'welcome-1',
  sender: 'ai',
  text: '안녕하세요. LINCO AI 비서입니다. 새 채팅을 시작하거나 왼쪽 탭에서 주제를 선택해 보세요.',
}

const MAIN_TABS: Array<{ value: MainTab; label: string; description: string }> = [
  { value: 'chat', label: 'AI 비서', description: '대화와 저장' },
  { value: 'guide', label: '사용 안내', description: '기능 사용법' },
  { value: 'site', label: '바로가기', description: '외부 링크' },
  { value: 'overview', label: '서비스 개요', description: '백서 슬라이드' },
]

const SECONDARY_TABS: Array<{ value: MainTab; label: string; description: string }> = [
  { value: 'roadmap', label: '로드맵', description: '향후 계획' },
  { value: 'settings', label: '설정', description: '테마 전환' },
]

const TAG_OPTIONS = [
  { label: '청년정책', query: '청년정책 중 지금 신청할 수 있는 것만 정리해줘.' },
  { label: '전월세보증금', query: '청년 전월세 보증금 지원 조건을 알려줘.' },
  { label: '주거지원금', query: '주거 지원금 신청 방법을 쉽게 설명해줘.' },
  { label: '긴급복지', query: '긴급복지 지원 대상과 신청 절차를 알려줘.' },
  { label: '기초생활', query: '기초생활보장제도 신청 조건을 요약해줘.' },
]

const SITE_LINKS = [
  { label: '복지로', href: 'https://www.bokjiro.go.kr/ssis-tbu/index.do', note: '복지 정책 확인' },
  { label: '근로복지공단', href: 'https://www.kinfa.or.kr/main.do', note: '고용·복지 서비스' },
  { label: '워크24', href: 'https://www.work24.go.kr/cm/main.do', note: '고용 지원 확인' },
  { label: '홈택스', href: 'https://hometax.go.kr/websquare/websquare.html?w2xPath=/ui/pp/index_pp.xml&menuCd=index3', note: '세금 관련 조회' },
  { label: '청년 주거지원', href: 'https://enhuf.molit.go.kr/index.jsp', note: '주거 지원 정보' },
]

const CATEGORY_DATA: Record<string, CategoryDetail> = {
  admin: {
    num: '01',
    title: '행정 절차 안내',
    subtitle: '복잡한 공공 서비스 신청 흐름을 한 번에 정리하는 카드',
    bullets: ['절차를 단계별로 분해해서 보여줍니다.', '필요한 서류와 주의점을 함께 표시합니다.', '초보자도 읽기 쉬운 문장으로 정리합니다.'],
  },
  housing: {
    num: '02',
    title: '주거 지원 가이드',
    subtitle: '임대, 보증, 청년 주거 지원 정보를 묶어서 보여주는 카드',
    bullets: ['지원 유형별로 나눠서 정리합니다.', '대상 조건과 신청 순서를 같이 보여줍니다.', '예상 준비 항목을 먼저 확인할 수 있습니다.'],
  },
  finance: {
    num: '03',
    title: '금융 지원 요약',
    subtitle: '대출, 보증, 생계 지원 같은 금융성 정책을 묶어 소개합니다',
    bullets: ['핵심 혜택을 먼저 보여줍니다.', '신청 가능 조건과 제외 조건을 구분합니다.', '문서 준비 체크리스트를 함께 제안합니다.'],
  },
  eco: {
    num: '04',
    title: '환경/생활 정책',
    subtitle: '생활형 정책과 환경 관련 지원을 한눈에 보는 카드',
    bullets: ['생활 밀착형 서비스로 분류합니다.', '알림이 필요한 항목은 강조 표시합니다.', '실행 순서를 짧게 안내합니다.'],
  },
  travel: {
    num: '05',
    title: '교통/이동 지원',
    subtitle: '교통비, 이동 편의, 지역 기반 지원을 다루는 카드',
    bullets: ['대상자별 지원 조건을 분리합니다.', '온라인 신청과 방문 신청을 나눠 봅니다.', '이동 비용 관련 정보도 함께 묶습니다.'],
  },
  health: {
    num: '06',
    title: '건강/복지 서비스',
    subtitle: '건강 검사, 의료 지원, 복지 연계 서비스 카드',
    bullets: ['건강 관련 정책을 빠르게 찾게 도와줍니다.', '지역·대상·기간 조건을 함께 표시합니다.', '자주 묻는 질문용 요약도 같이 제공합니다.'],
  },
}

function parseSuffix(value: string) {
  const parsed = Number(value.split('-').at(-1))
  return Number.isFinite(parsed) ? parsed : 0
}

function syncCounters(conversations: Conversation[]) {
  for (const conversation of conversations) {
    conversationSeed = Math.max(conversationSeed, parseSuffix(conversation.id))
    activitySeed = Math.max(activitySeed, conversation.updatedAt)
    for (const message of conversation.messages) {
      messageSeed = Math.max(messageSeed, parseSuffix(message.id))
    }
  }
}

function createGreetingMessage() {
  messageSeed += 1
  return { ...DEFAULT_GREETING, id: `welcome-${messageSeed}` }
}

function createConversation(): Conversation {
  conversationSeed += 1
  activitySeed += 1
  return {
    id: `conv-${conversationSeed}`,
    title: '새 채팅',
    messages: [createGreetingMessage()],
    conversationId: '',
    createdAt: activitySeed,
    updatedAt: activitySeed,
  }
}

function createMessageId(prefix: string) {
  messageSeed += 1
  return `${prefix}-${messageSeed}`
}

function nextActivityTick() {
  activitySeed += 1
  return activitySeed
}

function safeParseConversations(raw: string | null) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Conversation[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function getBootstrap(): BootstrapState {
  if (bootstrapCache) return bootstrapCache

  const defaultConversation = createConversation()

  if (typeof window === 'undefined') {
    bootstrapCache = {
      conversations: [defaultConversation],
      activeConversationId: defaultConversation.id,
      assistantSidebarOpen: true,
      theme: 'dark',
    }
    return bootstrapCache
  }

  const storedConversations = safeParseConversations(window.localStorage.getItem(STORAGE_KEYS.conversations))
  const conversations = storedConversations && storedConversations.length > 0 ? storedConversations : [defaultConversation]
  syncCounters(conversations)

  const activeConversationId = window.localStorage.getItem(STORAGE_KEYS.activeConversation)
  const assistantSidebarOpen = window.localStorage.getItem(STORAGE_KEYS.assistantSidebar)
  const theme = window.localStorage.getItem(STORAGE_KEYS.theme)

  bootstrapCache = {
    conversations,
    activeConversationId:
      activeConversationId && conversations.some((item) => item.id === activeConversationId)
        ? activeConversationId
        : conversations[0].id,
    assistantSidebarOpen: assistantSidebarOpen ? assistantSidebarOpen === 'open' : true,
    theme: theme === 'light' ? 'light' : 'dark',
  }

  return bootstrapCache
}

function makeConversationTitle(text: string) {
  const compact = text.trim().replace(/\s+/g, ' ')
  return compact.length > 18 ? `${compact.slice(0, 18)}...` : compact || '새 채팅'
}

export default function LincoPage() {
  const [theme, setTheme] = useState<ThemeMode>(() => getBootstrap().theme)
  const [activeTab, setActiveTab] = useState<MainTab>('chat')
  const [assistantSidebarOpen, setAssistantSidebarOpen] = useState<boolean>(() => getBootstrap().assistantSidebarOpen)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeDetail, setActiveDetail] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>(() => getBootstrap().conversations)
  const [activeConversationId, setActiveConversationId] = useState<string>(() => getBootstrap().activeConversationId)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.assistantSidebar, assistantSidebarOpen ? 'open' : 'closed')
  }, [assistantSidebarOpen])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.activeConversation, activeConversationId)
  }, [activeConversationId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeTab, activeConversationId, conversations, isLoading])

  const isDark = theme === 'dark'
  const currentConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0]
  const currentMessages = currentConversation?.messages ?? [DEFAULT_GREETING]

  const shellClass = isDark
    ? 'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#050816_0%,#0d1324_100%)] text-slate-100'
    : 'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(135deg,#eff6ff_0%,#f8fafc_100%)] text-slate-900'

  const panelClass = isDark ? 'bg-slate-900/80 border-slate-700/80' : 'bg-white/92 border-slate-200'
  const cardClass = isDark ? 'bg-slate-900/70 border-slate-700/80' : 'bg-white border-slate-200'
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-600'
  const inputClass = isDark
    ? 'bg-slate-950 text-slate-100 border-slate-700 placeholder:text-slate-500'
    : 'bg-white text-slate-900 border-slate-300 placeholder:text-slate-500'
  const tabBaseClass = 'w-full text-left border rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-between gap-3'
  const tabInactiveClass = isDark
    ? 'border-slate-700/80 bg-slate-950/30 text-slate-300 hover:bg-slate-800/80 hover:border-sky-400/60'
    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-sky-400/70'
  const tabActiveClass = 'border-sky-400/70 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-[0_10px_25px_rgba(14,165,233,0.28)]'
  const controlButtonClass = isDark
    ? 'border-slate-700 bg-slate-950/40 text-slate-100 hover:border-sky-400/70 hover:bg-slate-900'
    : 'border-slate-300 bg-white text-slate-900 hover:border-sky-400/70 hover:bg-slate-50'

  const updateConversations = (updater: (previous: Conversation[]) => Conversation[]) => {
    setConversations((previous) => updater(previous))
  }

  const deleteConversation = (conversationId: string) => {
    updateConversations((previous) => {
      const remaining = previous.filter((conversation) => conversation.id !== conversationId)
      if (remaining.length === 0) {
        const freshConversation = createConversation()
        setActiveConversationId(freshConversation.id)
        return [freshConversation]
      }

      if (conversationId === activeConversationId) {
        setActiveConversationId(remaining[0].id)
      }

      return remaining
    })
  }

  const createNewConversation = () => {
    const freshConversation = createConversation()
    setConversations((previous) => [freshConversation, ...previous])
    setActiveConversationId(freshConversation.id)
    setActiveTab('chat')
    setAssistantSidebarOpen(true)
  }

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
    setActiveTab('chat')
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || !currentConversation) return

    const assistantPlaceholderId = createMessageId('assistant')
    const userMessage: Message = { id: createMessageId('user'), sender: 'user', text: trimmed }

    updateConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== currentConversation.id) return conversation

        return {
          ...conversation,
          title: conversation.title === '새 채팅' ? makeConversationTitle(trimmed) : conversation.title,
          messages: [
            ...conversation.messages,
            userMessage,
            { id: assistantPlaceholderId, sender: 'ai', text: '응답을 기다리는 중...' },
          ],
          updatedAt: nextActivityTick(),
        }
      })
    )

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: currentConversation.conversationId,
        }),
      })

      const data = (await response.json()) as {
        answer?: string
        message?: string
        error?: string
        conversation_id?: string
        conversationId?: string
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || '응답을 가져오지 못했습니다.')
      }

      const answer = data.answer ?? data.message ?? '응답이 비어 있습니다.'
      const remoteConversationId = data.conversation_id ?? data.conversationId ?? currentConversation.conversationId

      updateConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== currentConversation.id) return conversation

          return {
            ...conversation,
            conversationId: remoteConversationId,
            messages: conversation.messages
              .filter((message) => message.id !== assistantPlaceholderId)
              .concat({
                id: createMessageId('ai'),
                sender: 'ai',
                text: answer,
              }),
            updatedAt: nextActivityTick(),
          }
        })
      )
    } catch (error) {
      const errorText = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      updateConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== currentConversation.id) return conversation

          return {
            ...conversation,
            messages: conversation.messages
              .filter((message) => message.id !== assistantPlaceholderId)
              .concat({
                id: createMessageId('error'),
                sender: 'ai',
                text: `오류: ${errorText}`,
              }),
            updatedAt: nextActivityTick(),
          }
        })
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  return (
    <div className={`min-h-screen w-screen h-screen overflow-hidden ${shellClass}`}>
      <div className="flex h-full w-full">
        <aside
          className={`w-[276px] shrink-0 h-full border-r p-5 flex flex-col gap-5 ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white/75 border-slate-200'
          }`}
        >
          <div className="px-1 py-2">
            <div className="flex flex-col items-start">
              <Image src="/LINCO.png" alt="LINCO 로고" width={104} height={34} className="h-8 w-auto object-contain" />
              <div className={`mt-2 text-sm font-semibold tracking-wide ${mutedTextClass}`}>시작이 가벼워지다</div>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2">
            {MAIN_TABS.map((tab) => {
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.value)
                    setActiveDetail(null)
                  }}
                  className={`${tabBaseClass} ${isActive ? tabActiveClass : tabInactiveClass}`}
                >
                  <span className="flex flex-col items-start">
                    <span className="text-[14px] font-semibold">{tab.label}</span>
                    <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-inherit opacity-70'}`}>{tab.description}</span>
                  </span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'opacity-60'}`}>▸</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            {SECONDARY_TABS.map((tab) => {
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`${tabBaseClass} ${isActive ? tabActiveClass : tabInactiveClass}`}
                >
                  <span className="flex flex-col items-start">
                    <span className="text-[14px] font-semibold">{tab.label}</span>
                    <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-inherit opacity-70'}`}>{tab.description}</span>
                  </span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'opacity-60'}`}>▸</span>
                </button>
              )
            })}
          </div>
        </aside>

        <main className="flex-1 h-full flex overflow-hidden">
          {activeTab === 'chat' && (
            <>
              <aside
                className={`border-r h-full transition-all duration-300 overflow-hidden ${
                  assistantSidebarOpen ? 'w-[320px]' : 'w-0'
                } ${isDark ? 'border-slate-800/80 bg-slate-950/50' : 'border-slate-200 bg-white/65'}`}
              >
                <div className={`w-[320px] h-full p-4 flex flex-col gap-4 ${assistantSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className={`rounded-xl border p-4 ${cardClass}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-bold">대화 목록</div>
                        <div className={`text-xs mt-1 ${mutedTextClass}`}>대화가 자동 저장됩니다</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAssistantSidebarOpen(false)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold ${controlButtonClass}`}
                      >
                        닫기
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                    {conversations.map((conversation) => {
                      const active = conversation.id === activeConversationId
                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => selectConversation(conversation.id)}
                          className={`w-full text-left rounded-xl border p-4 transition-all ${
                            active
                              ? 'border-sky-400 bg-sky-500/10'
                              : isDark
                                ? 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{conversation.title}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={createNewConversation}
                    className="rounded-xl border px-4 py-3 text-sm font-bold border-sky-400 bg-sky-500 text-white"
                  >
                    새 채팅 만들기
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteConversation(activeConversationId)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                      isDark ? 'border-rose-400/60 text-rose-200 hover:bg-rose-500/10' : 'border-rose-300 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    채팅 삭제
                  </button>
                </div>
              </aside>

              <section className="flex-1 h-full flex flex-col overflow-hidden">
                <header
                  className={`shrink-0 border-b px-6 py-4 flex items-center justify-between gap-4 ${
                    isDark ? 'bg-slate-950/55 border-slate-800/80' : 'bg-white/70 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-lg font-bold">AI 비서</div>
                    <div className={`text-sm ${mutedTextClass}`}>
                      {currentConversation?.title ?? '새 채팅'} · 저장된 대화 {conversations.length}개
                    </div>
                  </div>
                </header>

                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex-1 min-h-0 overflow-y-auto p-6">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`max-w-[85%] rounded-xl border px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                            message.sender === 'user'
                              ? 'ml-auto border-sky-400 bg-gradient-to-br from-sky-500 to-cyan-500 text-white'
                              : isDark
                                ? 'mr-auto border-slate-800 bg-slate-900 text-slate-100'
                                : 'mr-auto border-slate-200 bg-white text-slate-900'
                          }`}
                        >
                          {message.text}
                        </div>
                      ))}

                      {isLoading && (
                        <div
                          className={`mr-auto rounded-xl border px-4 py-3 text-sm ${
                            isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          응답을 생성하고 있습니다...
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>
                  </div>

                  <div className={`shrink-0 border-t p-4 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white/85'}`}>
                    <div className="mx-auto max-w-4xl">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {TAG_OPTIONS.map((tag) => (
                          <button
                            key={tag.label}
                            type="button"
                            onClick={() => void sendMessage(tag.query)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                              isDark
                                ? 'border-slate-700 bg-slate-900 text-sky-300 hover:border-sky-400/70'
                                : 'border-slate-200 bg-slate-50 text-sky-700 hover:border-sky-400/70'
                            }`}
                          >
                            # {tag.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const randomTag = TAG_OPTIONS[Math.floor(Math.random() * TAG_OPTIONS.length)]
                          void sendMessage(randomTag.query)
                        }}
                        className="mb-3 w-full rounded-xl border border-sky-400 bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white"
                      >
                        랜덤 질문
                      </button>

                      <form onSubmit={handleFormSubmit} className="flex gap-3">
                        <input
                          value={input}
                          onChange={(event) => setInput(event.target.value)}
                          placeholder="질문을 입력하세요"
                          className={`min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none ${inputClass}`}
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-sky-400 bg-sky-500 px-5 py-3 text-sm font-bold text-white"
                        >
                          전송
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab !== 'chat' && (
            <section className="flex-1 h-full overflow-y-auto p-8 md:p-12">
              {activeTab === 'guide' && (
                <div className="mx-auto max-w-5xl">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">사용 안내</h1>
                  <p className={`mt-3 max-w-3xl text-[15px] leading-relaxed ${mutedTextClass}`}>
                    왼쪽 탭으로 기능을 바꾸고, AI 비서에서는 대화를 저장한 상태로 이어서 사용할 수 있습니다.
                  </p>

                  <div className="mt-8 grid gap-4">
                    <div className={`rounded-xl border p-6 ${panelClass}`}>
                      <h2 className="text-lg font-bold mb-2">AI 비서 사용법</h2>
                      <p className={`${mutedTextClass} leading-relaxed`}>
                        AI 비서 탭을 열면 대화 목록 패널이 함께 나타납니다. 새 채팅을 만들거나 기존 대화를 선택할 수 있고,
                        삭제 버튼으로 현재 채팅을 지울 수 있습니다.
                      </p>
                    </div>
                    <div className={`rounded-xl border p-6 ${panelClass}`}>
                      <h2 className="text-lg font-bold mb-2">해시태그 버튼 사용</h2>
                      <p className={`${mutedTextClass} leading-relaxed`}>
                        아래 해시태그 버튼을 누르면 미리 준비된 질문이 바로 입력됩니다. 자주 묻는 질문을 빠르게 던질 때
                        편하게 사용할 수 있습니다.
                      </p>
                    </div>
                    <div className={`rounded-xl border p-6 ${panelClass}`}>
                      <h2 className="text-lg font-bold mb-2">직접 질문하기</h2>
                      <p className={`${mutedTextClass} leading-relaxed`}>
                        입력창에 궁금한 내용을 직접 적으면 됩니다. 정책명, 대상 조건, 준비 서류처럼 구체적으로 적을수록
                        더 정확한 답을 받기 좋습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'site' && (
                <div className="mx-auto max-w-5xl">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">바로가기</h1>
                  <p className={`mt-3 max-w-3xl text-[15px] leading-relaxed ${mutedTextClass}`}>
                    자주 쓰는 외부 사이트를 카드형 링크로 정리했습니다.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {SITE_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`rounded-xl border p-6 transition-all hover:-translate-y-0.5 ${panelClass}`}
                      >
                        <div className="text-lg font-bold">{link.label}</div>
                        <div className={`mt-2 text-sm ${mutedTextClass}`}>{link.note}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="relative h-full min-h-[60vh] overflow-hidden">
                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      activeDetail ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                    }`}
                    style={{ pointerEvents: activeDetail ? 'none' : 'auto' }}
                  >
                    <div className="mx-auto max-w-5xl">
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">서비스 개요</h1>
                      <p className={`mt-3 max-w-3xl text-[15px] leading-relaxed ${mutedTextClass}`}>
                        서비스 카드들을 통해 필요한 정보를 더 빠르게 찾아갈 수 있게 구성했습니다. 카드를 누르면 백서처럼
                        상세 페이지로 이동합니다.
                      </p>

                      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Object.entries(CATEGORY_DATA).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveDetail(key)}
                            className={`text-left rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 ${cardClass}`}
                          >
                            <div className="text-sm font-mono font-bold text-sky-400">{item.num}</div>
                            <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                            <p className={`mt-2 text-sm ${mutedTextClass}`}>{item.subtitle}</p>
                            <div className="mt-6 text-sm font-bold text-sky-400">백서 슬라이드로 이동 →</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      activeDetail ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                    style={{ pointerEvents: activeDetail ? 'auto' : 'none' }}
                  >
                    <div className="mx-auto max-w-4xl">
                      <button
                        type="button"
                        onClick={() => setActiveDetail(null)}
                        className={`mb-8 rounded-lg border px-3 py-2 text-sm font-semibold ${controlButtonClass}`}
                      >
                        ← 목록으로 돌아가기
                      </button>
                      {activeDetail && (
                        <div className={`rounded-2xl border p-8 ${panelClass}`}>
                          <div className="text-sm font-mono font-bold text-sky-400 mb-3">{CATEGORY_DATA[activeDetail].num}</div>
                          <h2 className="text-3xl font-extrabold tracking-tight">{CATEGORY_DATA[activeDetail].title}</h2>
                          <div
                            className={`mt-3 pb-5 border-b ${
                              isDark ? 'border-slate-700/60 text-slate-400' : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            {CATEGORY_DATA[activeDetail].subtitle}
                          </div>
                          <div className="mt-6 space-y-3">
                            {CATEGORY_DATA[activeDetail].bullets.map((bullet) => (
                              <div
                                key={bullet}
                                className={`rounded-xl border px-4 py-3 ${
                                  isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                {bullet}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="mx-auto max-w-4xl">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">로드맵</h1>
                  <div className="mt-8 grid gap-4">
                    <div className={`rounded-xl border p-6 ${panelClass}`}>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Phase 1</div>
                      <h2 className="mt-2 text-xl font-bold">대화 저장과 빠른 탐색 안정화</h2>
                      <p className={`mt-2 text-sm leading-relaxed ${mutedTextClass}`}>
                        저장된 채팅을 더 잘 찾고, 삭제와 새 채팅 흐름을 더 직관적으로 다듬습니다.
                      </p>
                    </div>
                    <div className={`rounded-xl border p-6 ${panelClass}`}>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Phase 2</div>
                      <h2 className="mt-2 text-xl font-bold">요약과 즐겨찾기 강화</h2>
                      <p className={`mt-2 text-sm leading-relaxed ${mutedTextClass}`}>
                        대화 제목 자동화, 요약 저장, 자주 찾는 질문 고정 기능을 더해 탐색 비용을 줄입니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="mx-auto max-w-3xl">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">설정</h1>
                  <div className={`mt-8 rounded-xl border p-6 ${panelClass}`}>
                    <div className="text-base font-bold mb-4">테마 모드</div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex-1 rounded-lg border px-4 py-3 font-semibold transition-colors ${
                          theme === 'dark' ? 'border-sky-400 bg-sky-500 text-white' : controlButtonClass
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex-1 rounded-lg border px-4 py-3 font-semibold transition-colors ${
                          theme === 'light' ? 'border-sky-400 bg-sky-500 text-white' : controlButtonClass
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {activeTab === 'chat' && !assistantSidebarOpen && (
        <button
          type="button"
          onClick={() => setAssistantSidebarOpen(true)}
          className={`fixed left-[276px] top-1/2 -translate-y-1/2 rounded-r-xl border-y border-r px-3 py-5 text-[11px] font-bold tracking-[0.2em] uppercase shadow-lg ${
            isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          대화목록
        </button>
      )}
    </div>
  )
}
