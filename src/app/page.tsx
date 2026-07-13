'use client';

import Image from 'next/image';
import React, { FormEvent, useEffect, useRef, useState } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface CategoryDetail {
  num: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

type TabKey = 'chat' | 'guide' | 'site' | 'overview' | 'roadmap' | 'settings';

const CHAT_STORAGE_KEY = 'linco-chat-state-v2';
const SITE_TAB_STORAGE_KEY = 'linco-site-tab-visible-v2';
const CHAT_PANEL_STORAGE_KEY = 'linco-chat-panel-visible-v2';
const THEME_STORAGE_KEY = 'linco-theme-v2';

let chatSessionSeq = 1;
let messageSeq = 2;

const now = () => Date.now();

const INITIAL_MESSAGE: Message = {
  id: 1,
  sender: 'ai',
  text: '안녕하세요. LINCO AI 비서입니다. 대화는 저장되고, 새 채팅과 삭제도 바로 사용할 수 있어요.',
};

const INITIAL_SESSION: ChatSession = {
  id: 'default-chat',
  title: '새 채팅',
  messages: [INITIAL_MESSAGE],
  updatedAt: 0,
};

const loadSavedBoolean = (key: string, fallback: boolean) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const saved = window.localStorage.getItem(key);
  if (saved === null) {
    return fallback;
  }

  return saved === 'true';
};

const loadSavedChatState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const saved = window.localStorage.getItem(CHAT_STORAGE_KEY);
  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as { sessions?: ChatSession[]; activeChatId?: string };
    if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
      return null;
    }

    const activeChatId =
      parsed.activeChatId && parsed.sessions.some((session) => session.id === parsed.activeChatId)
        ? parsed.activeChatId
        : parsed.sessions[0].id;

    return { sessions: parsed.sessions, activeChatId };
  } catch {
    return null;
  }
};

const createChatSession = (title: string, messages: Message[] = [INITIAL_MESSAGE]): ChatSession => ({
  id: `chat-${chatSessionSeq++}`,
  title,
  messages,
  updatedAt: now(),
});

const buildChatTitle = (messages: Message[]) => {
  const firstUserMessage = messages.find((message) => message.sender === 'user')?.text.trim();
  if (!firstUserMessage) {
    return '새 채팅';
  }

  return firstUserMessage.length > 18 ? `${firstUserMessage.slice(0, 18)}...` : firstUserMessage;
};

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp || Date.now()));

export default function LincoUltimatePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const [showSiteTab, setShowSiteTab] = useState(() => loadSavedBoolean(SITE_TAB_STORAGE_KEY, true));
  const [showChatPanel, setShowChatPanel] = useState(() => loadSavedBoolean(CHAT_PANEL_STORAGE_KEY, true));
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => loadSavedChatState()?.sessions ?? [INITIAL_SESSION]);
  const [activeChatId, setActiveChatId] = useState<string>(() => loadSavedChatState()?.activeChatId ?? INITIAL_SESSION.id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const isDark = theme === 'dark';
  const activeSession = chatSessions.find((session) => session.id === activeChatId) ?? chatSessions[0] ?? INITIAL_SESSION;
  const messages = activeSession.messages;

  const panelClass = isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200';
  const surfaceClass = isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const mutedTextClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputClass = isDark
    ? 'bg-slate-950 text-white border-slate-700 placeholder:text-slate-500'
    : 'bg-white text-slate-900 border-slate-300 placeholder:text-slate-500';
  const actionButtonClass = isDark
    ? 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-white'
    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800';
  const tagButtonClass = isDark
    ? 'bg-slate-950 text-cyan-300 border-slate-800 hover:bg-slate-900'
    : 'bg-white text-cyan-700 border-slate-300 hover:bg-slate-50';

  const tabButtonClass = (active: boolean) =>
    [
      'w-full text-left px-4 py-3 border rounded-lg transition-all flex items-center gap-3 cursor-pointer',
      active
        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-[0_10px_24px_rgba(6,182,212,0.18)]'
        : isDark
          ? 'bg-transparent text-slate-300 border-slate-800 hover:bg-slate-900 hover:text-white'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    ].join(' ');

  const TAB_ITEMS: Array<{ value: TabKey; label: string }> = [
    { value: 'chat', label: 'AI 비서' },
    { value: 'guide', label: '질문 가이드' },
    ...(showSiteTab ? [{ value: 'site' as const, label: '사이트 바로가기' }] : []),
    { value: 'overview', label: '서비스 개요' },
  ];

  const TAG_OPTIONS = [
    { label: '전세보증금', query: '전세보증금 지원과 관련된 핵심 조건을 간단히 알려줘.' },
    { label: '청년월세', query: '청년 월세 지원을 받을 때 확인해야 할 조건을 정리해줘.' },
    { label: '주거지원', query: '주거지원 정책을 신청 순서 중심으로 설명해줘.' },
    { label: '교통/여행', query: '여행이나 이동 관련 지원 정책이 있으면 추천해줘.' },
  ];

  const SITE_LINKS = [
    { label: '정부24 바로가기', href: 'https://www.gov.kr/' },
    { label: '전세보증금 지원', href: 'https://www.gov.kr/portal/service/serviceInfo/P13804' },
    { label: '주거급여 안내', href: 'https://www.gov.kr/portal/service/serviceInfo/P16915' },
    { label: '청년월세 지원', href: 'https://www.gov.kr/portal/service/serviceInfo/P16916' },
  ];

  const CATEGORY_DATA: Record<string, CategoryDetail> = {
    admin: {
      num: '01',
      title: '행정 안내',
      subtitle: '서류 확인, 신청 흐름, 담당 기관을 빠르게 정리하는 영역입니다.',
      content: (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className={mutedTextClass}>공식 절차를 먼저 확인하고, 필요한 서류와 제출 순서를 짧게 요약해드립니다.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>접수 기관과 제출 마감일을 먼저 확인합니다.</li>
            <li>신청서, 신분증, 증빙서류의 누락 여부를 점검합니다.</li>
            <li>이후 보완 요청이 오면 다시 체크할 수 있게 기록을 남깁니다.</li>
          </ul>
        </div>
      ),
    },
    housing: {
      num: '02',
      title: '주거 지원',
      subtitle: '전세, 월세, 이사 지원처럼 생활과 직결된 지원 정보를 다룹니다.',
      content: (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className={mutedTextClass}>지원 대상과 소득 기준, 거주 요건을 먼저 확인한 뒤 신청하면 시행착오를 줄일 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>대상 연령과 거주 지역 조건을 먼저 봅니다.</li>
            <li>소득, 자산, 무주택 여부 같은 핵심 기준을 정리합니다.</li>
            <li>신청 후에는 결과 알림과 보완 서류를 추적합니다.</li>
          </ul>
        </div>
      ),
    },
    finance: {
      num: '03',
      title: '금융 지원',
      subtitle: '대출, 이자 보조, 신용 관련 안내를 한눈에 보는 영역입니다.',
      content: (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className={mutedTextClass}>복잡한 금융 항목은 지원 목적, 한도, 상환 방식 순서로 정리하면 이해가 쉽습니다.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>지원 한도와 금리를 비교합니다.</li>
            <li>중복 신청 가능 여부를 확인합니다.</li>
            <li>만기와 상환 방식까지 함께 안내합니다.</li>
          </ul>
        </div>
      ),
    },
    travel: {
      num: '04',
      title: '이동 및 여행',
      subtitle: '교통, 이동, 여행 관련 정책과 편의 기능을 묶어둔 영역입니다.',
      content: (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className={mutedTextClass}>이동 지원은 시간대, 거리, 대상 조건에 따라 체감이 크게 달라집니다.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>정기권, 환승, 저소득층 지원 여부를 비교합니다.</li>
            <li>신청이 필요한 항목은 미리 체크리스트로 정리합니다.</li>
            <li>이동 동선에 맞춘 추천도 함께 제공할 수 있습니다.</li>
          </ul>
        </div>
      ),
    },
    health: {
      num: '05',
      title: '건강 및 복지',
      subtitle: '건강검진, 복지, 돌봄 서비스처럼 생활 안전망 정보를 담습니다.',
      content: (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className={mutedTextClass}>복지 정책은 대상 조건만 맞으면 체감 효과가 큰 편이라, 먼저 자격부터 보는 것이 좋습니다.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>연령, 소득, 가구 유형 조건을 확인합니다.</li>
            <li>예방형 서비스와 사후지원형 서비스를 구분합니다.</li>
            <li>필요 시 신청서 작성용 요약도 만들 수 있습니다.</li>
          </ul>
        </div>
      ),
    },
    eco: {
      num: '06',
      title: '환경 및 에너지',
      subtitle: '친환경, 절약, 에너지 보조처럼 실생활과 연결된 정보입니다.',
      content: (
        <div className="space-y-4 text-[15px] leading-relaxed">
          <p className={mutedTextClass}>환경 관련 항목은 계절과 생활 패턴에 따라 추천 조건이 달라집니다.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>에너지 절감, 친환경 교체 지원을 비교합니다.</li>
            <li>지역별로 다른 기준이 있는지 확인합니다.</li>
            <li>신청 주기와 준비 서류를 한 번에 정리합니다.</li>
          </ul>
        </div>
      ),
    },
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(SITE_TAB_STORAGE_KEY, String(showSiteTab));
    window.localStorage.setItem(CHAT_PANEL_STORAGE_KEY, String(showChatPanel));
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ sessions: chatSessions, activeChatId }));
  }, [theme, showSiteTab, showChatPanel, chatSessions, activeChatId]);

  const executeSend = async (text: string) => {
    if (!text.trim() || isLoading) {
      return;
    }

    const userMessage: Message = { id: messageSeq++, sender: 'user', text };
    setInput('');
    setIsLoading(true);

    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === activeChatId
          ? {
              ...session,
              title: session.title === '새 채팅' ? buildChatTitle([...session.messages, userMessage]) : session.title,
              messages: [...session.messages, userMessage],
              updatedAt: now(),
            }
          : session,
      ),
    );

    try {
      const response = await fetch('http://localhost/v1', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer app-EbKM7jzjI2o8jo2Q4H0SggIz',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: text,
          user: 'linco-user',
          response_mode: 'blocking',
        }),
      });

      if (!response.ok) {
        throw new Error('API 응답이 좋지 않습니다.');
      }

      const data = await response.json();
      const aiAnswer = String(data.answer || '답변을 생성하지 못했습니다.');

      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === activeChatId
            ? {
                ...session,
                messages: [...session.messages, { id: messageSeq++, sender: 'ai', text: aiAnswer }],
                updatedAt: now(),
              }
            : session,
        ),
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? `오류: ${error.message}` : 'AI 서버 연결 중 오류가 발생했습니다.';

      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === activeChatId
            ? {
                ...session,
                messages: [...session.messages, { id: messageSeq++, sender: 'ai', text: errorMessage }],
                updatedAt: now(),
              }
            : session,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeSend(input);
  };

  const createNewChat = () => {
    const session = createChatSession('새 채팅');
    setChatSessions((prev) => [session, ...prev]);
    setActiveChatId(session.id);
    setActiveTab('chat');
    setShowChatPanel(true);
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions((prev) => {
      const remaining = prev.filter((session) => session.id !== sessionId);
      if (remaining.length === 0) {
        const fallback = createChatSession('새 채팅');
        setActiveChatId(fallback.id);
        return [fallback];
      }

      if (sessionId === activeChatId) {
        setActiveChatId(remaining[0].id);
      }

      return remaining;
    });
  };

  const clearAllChats = () => {
    const fallback = createChatSession('새 채팅');
    setChatSessions([fallback]);
    setActiveChatId(fallback.id);
  };

  return (
    <div
      className={`min-h-screen flex w-screen h-screen overflow-hidden antialiased transition-colors duration-300 tracking-tight ${
        isDark
          ? 'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-50'
          : 'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-900'
      }`}
    >
      <aside
        className={`w-[280px] p-6 flex flex-col justify-between border-r shrink-0 z-50 h-full transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800 shadow-[4px_0_20px_rgba(0,0,0,0.45)]' : 'bg-white/90 border-slate-200 shadow-[4px_0_20px_rgba(15,23,42,0.04)]'
        }`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-start gap-3">
            <Image src="/LINCO.png" alt="LINCO 로고" width={160} height={32} className="h-8 w-auto object-contain" />
            <div className={`text-[11px] uppercase tracking-[0.35em] ${mutedTextClass}`}>LINCO dashboard</div>
          </div>

          <nav className="flex flex-col gap-2">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setActiveDetail(null);
                }}
                className={tabButtonClass(activeTab === tab.value)}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('roadmap');
              setActiveDetail(null);
            }}
            className={tabButtonClass(activeTab === 'roadmap')}
          >
            <span>로드맵</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setActiveDetail(null);
            }}
            className={tabButtonClass(activeTab === 'settings')}
          >
            <span>설정</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full min-w-0 flex overflow-hidden relative">
        {activeTab === 'chat' && showChatPanel && (
          <aside
            className={`w-[300px] h-full border-r flex flex-col p-4 shrink-0 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white/80 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-sm font-semibold">대화 저장함</div>
                <div className={`text-xs ${mutedTextClass}`}>대화가 자동으로 저장됩니다.</div>
              </div>
              <button
                type="button"
                onClick={() => setShowChatPanel(false)}
                className={`px-3 py-2 border rounded-lg text-xs font-semibold ${
                  isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'
                }`}
              >
                숨기기
              </button>
            </div>

            <button
              type="button"
              onClick={createNewChat}
              className="px-4 py-3 rounded-lg font-semibold border border-cyan-500 bg-cyan-500 text-white shadow-[0_10px_24px_rgba(6,182,212,0.18)] hover:bg-cyan-400"
            >
              새 채팅
            </button>

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
              {chatSessions.map((session) => {
                const active = session.id === activeChatId;
                return (
                  <div
                    key={session.id}
                    className={`flex items-stretch gap-2 border rounded-lg p-3 transition-colors ${
                      active ? 'border-cyan-500 bg-cyan-500/10' : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveChatId(session.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="text-sm font-semibold truncate">{session.title}</div>
                      <div className={`text-xs mt-1 ${mutedTextClass}`}>{formatTime(session.updatedAt)}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChatSession(session.id)}
                      className={`px-2 py-1 rounded-md border text-xs font-semibold self-start ${
                        isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-slate-50'
                      }`}
                      aria-label="채팅 삭제"
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={clearAllChats}
              className={`mt-4 px-4 py-3 rounded-lg border text-sm font-semibold ${
                isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'
              }`}
            >
              모든 대화 삭제
            </button>
          </aside>
        )}

        {activeTab === 'chat' && !showChatPanel && (
          <button
            type="button"
            onClick={() => setShowChatPanel(true)}
            className={`absolute left-4 top-4 z-40 px-3 py-2 border rounded-lg text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'
            }`}
          >
            대화 목록 열기
          </button>
        )}

        <section className="flex-1 min-w-0 h-full relative overflow-hidden">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">AI 비서</h1>
                  <p className={`text-sm ${mutedTextClass}`}>{activeSession.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChatPanel((value) => !value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                    isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-300 bg-white'
                  }`}
                >
                  {showChatPanel ? '패널 숨기기' : '패널 열기'}
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[82%] px-4 py-3 border rounded-lg leading-relaxed whitespace-pre-wrap break-words ${
                      message.sender === 'user'
                        ? 'self-end bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent rounded-tr-sm'
                        : `self-start rounded-tl-sm ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
                {isLoading && (
                  <div
                    className={`self-start px-4 py-3 rounded-lg border animate-pulse ${
                      isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    답변을 생성 중입니다...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => executeSend(tag.query)}
                      className={`text-sm font-semibold border rounded-lg px-3 py-2 transition-colors ${tagButtonClass}`}
                    >
                      # {tag.label}
                    </button>
                  ))}
                </div>

                <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      const randomTag = TAG_OPTIONS[Math.floor(Math.random() * TAG_OPTIONS.length)];
                      executeSend(randomTag.query);
                    }}
                    className="w-full mb-3 px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 border border-transparent"
                  >
                    랜덤 질문 보내기
                  </button>
                  <form onSubmit={handleFormSubmit} className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="질문을 입력하고 Enter를 누르세요."
                      className={`flex-1 px-4 py-3 rounded-lg border outline-none ${inputClass}`}
                    />
                    <button type="submit" className={`px-5 py-3 rounded-lg border font-semibold ${actionButtonClass}`}>
                      전송
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="w-full h-full p-8 overflow-y-auto max-w-4xl">
              <h1 className="text-3xl font-extrabold tracking-tight">질문 가이드</h1>
              <p className={`mt-2 mb-8 text-[15px] ${mutedTextClass}`}>아래 버튼이나 직접 입력으로 원하는 주제를 빠르게 물어보세요.</p>

              <div className="space-y-6">
                <div className={`p-6 border rounded-lg ${panelClass}`}>
                  <h3 className="text-xl font-bold mb-3 text-cyan-400">짧게 물어보는 법</h3>
                  <p className={`text-[15px] leading-relaxed ${mutedTextClass}`}>
                    목적, 조건, 기간을 함께 적으면 더 정확한 답변을 받을 수 있습니다.
                  </p>
                </div>

                <div className={`p-6 border rounded-lg ${panelClass}`}>
                  <h3 className="text-xl font-bold mb-3 text-emerald-400">예시</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TAG_OPTIONS.map((tag) => (
                      <div key={tag.label} className={`p-4 border rounded-lg ${surfaceClass}`}>
                        <div className="font-semibold text-cyan-400 mb-2"># {tag.label}</div>
                        <p className={`text-sm ${mutedTextClass}`}>{tag.query}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'site' && showSiteTab && (
            <div className="w-full h-full p-8 overflow-y-auto max-w-4xl">
              <h1 className="text-3xl font-extrabold tracking-tight">사이트 바로가기</h1>
              <p className={`mt-2 mb-8 text-[15px] ${mutedTextClass}`}>자주 쓰는 공식 페이지를 카드로 모아두었습니다.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SITE_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`block border rounded-lg p-5 transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 hover:border-cyan-500' : 'bg-white border-slate-200 hover:border-cyan-500'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-2">{link.label}</div>
                    <div className={`text-sm ${mutedTextClass}`}>클릭하면 공식 사이트로 이동합니다.</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="w-full h-full p-8 overflow-hidden relative">
              <div className={`absolute inset-0 p-8 overflow-y-auto transition-all duration-300 ${activeDetail ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                <h1 className="text-3xl font-bold tracking-tight">서비스 개요</h1>
                <p className={`mt-2 mb-8 text-[15px] ${mutedTextClass}`}>주요 기능을 카드 형태로 정리한 영역입니다.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(CATEGORY_DATA).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveDetail(key)}
                      className={`text-left border rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 ${
                        isDark ? 'bg-slate-950 border-slate-800 hover:border-cyan-500' : 'bg-white border-slate-200 hover:border-cyan-500'
                      }`}
                    >
                      <span className="font-mono text-sm text-cyan-400 block mb-3">{CATEGORY_DATA[key].num}</span>
                      <h3 className="text-xl font-bold mb-2">{CATEGORY_DATA[key].title}</h3>
                      <p className={`text-sm line-clamp-2 ${mutedTextClass}`}>{CATEGORY_DATA[key].subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`absolute inset-0 p-8 overflow-y-auto transition-all duration-300 ${activeDetail ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                <div className="max-w-4xl mx-auto py-2">
                  <button
                    type="button"
                    onClick={() => setActiveDetail(null)}
                    className={`mb-6 text-sm font-semibold ${mutedTextClass}`}
                  >
                    ← 목록으로
                  </button>
                  {activeDetail && (
                    <>
                      <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                        {CATEGORY_DATA[activeDetail].title}
                      </h2>
                      <div className={`mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} ${mutedTextClass}`}>
                        {CATEGORY_DATA[activeDetail].subtitle}
                      </div>
                      <div>{CATEGORY_DATA[activeDetail].content}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="p-8 h-full overflow-y-auto flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tight">로드맵</h1>
              <p className={`mt-2 mb-8 text-[15px] ${mutedTextClass}`}>앞으로 붙일 기능과 개선 방향을 짧게 정리해둔 영역입니다.</p>

              <div className={`flex flex-col gap-4 relative pl-6 border-l-2 max-w-3xl ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                {[
                  { phase: 'Phase 1', title: '대화 저장 안정화', desc: '세션 저장, 새 채팅, 삭제 동작을 먼저 안정화합니다.' },
                  { phase: 'Phase 2', title: '탭 관리 확장', desc: '사이트 탭과 추가 사이드바를 더 세밀하게 끄고 켤 수 있게 만듭니다.' },
                  { phase: 'Phase 3', title: '정보 카드 확장', desc: '카테고리별 요약과 추천 동작을 더 풍부하게 연결합니다.' },
                ].map((node) => (
                  <div key={node.phase} className={`p-5 border rounded-lg ${panelClass}`}>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">{node.phase}</div>
                    <h4 className="text-lg font-bold mb-2">{node.title}</h4>
                    <p className={`text-sm leading-relaxed ${mutedTextClass}`}>{node.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 h-full overflow-y-auto flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tight">설정</h1>
              <p className={`mt-2 mb-8 text-[15px] ${mutedTextClass}`}>사이트 탭과 AI 비서 패널을 필요할 때만 켜고 끌 수 있습니다.</p>

              <div className={`p-6 border rounded-lg max-w-2xl ${panelClass}`}>
                <div className="space-y-5">
                  <div>
                    <div className="text-base font-bold mb-3">테마</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`px-4 py-3 rounded-lg border font-semibold ${theme === 'dark' ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-transparent border-slate-400'}`}
                      >
                        Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`px-4 py-3 rounded-lg border font-semibold ${theme === 'light' ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-transparent border-slate-400'}`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between gap-4 border-t pt-5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div>
                      <div className="font-semibold">사이트 탭 표시</div>
                      <div className={`text-sm ${mutedTextClass}`}>켜면 왼쪽 메뉴에 사이트 탭이 나타납니다.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSiteTab((value) => {
                          const next = !value;
                          if (!next) {
                            setActiveTab('chat');
                          }
                          return next;
                        });
                      }}
                      className={`px-4 py-2 rounded-lg border font-semibold ${showSiteTab ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-transparent border-slate-400'}`}
                    >
                      {showSiteTab ? '켜짐' : '꺼짐'}
                    </button>
                  </div>

                  <div className={`flex items-center justify-between gap-4 border-t pt-5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div>
                      <div className="font-semibold">AI 비서 사이드패널</div>
                      <div className={`text-sm ${mutedTextClass}`}>대화 목록을 따로 보여줄지 제어합니다.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChatPanel((value) => !value)}
                      className={`px-4 py-2 rounded-lg border font-semibold ${showChatPanel ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-transparent border-slate-400'}`}
                    >
                      {showChatPanel ? '켜짐' : '꺼짐'}
                    </button>
                  </div>

                  <div className={`flex items-center justify-between gap-4 border-t pt-5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div>
                      <div className="font-semibold">저장된 대화 초기화</div>
                      <div className={`text-sm ${mutedTextClass}`}>모든 채팅 세션을 새 상태로 되돌립니다.</div>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllChats}
                      className="px-4 py-2 rounded-lg border font-semibold border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
