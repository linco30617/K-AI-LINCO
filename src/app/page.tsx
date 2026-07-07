'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';

interface Message { id: number; sender: 'user' | 'ai'; text: string; }
interface CategoryDetail { num: string; title: string; subtitle: string; content: React.ReactNode; }

export default function LincoUltimatePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'chat' | 'guide' | 'site' | 'overview' | 'roadmap' | 'settings'>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: '반갑습니다! 일상 속 똑똑한 조력자, 링코입니다. 무엇이든 편하게 물어보세요!' }
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isDark = theme === 'dark';
  const panelClass = isDark ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#cbd5e1]';
  const mutedTextClass = isDark ? 'text-[#94a3b8]' : 'text-slate-600';
  const subtlePanelClass = isDark ? 'bg-[#0b0f19]/40 border-[#374151]' : 'bg-slate-50 border-slate-200';
  const inputClass = isDark ? 'bg-[#0b0f19] text-white border-[#374151] placeholder:text-slate-400' : 'bg-white text-slate-900 border-slate-300 placeholder:text-slate-500';
  const tagButtonClass = isDark ? 'bg-[#1f2937] text-[#38bdf8] border-[#374151] hover:text-white' : 'bg-slate-100 text-cyan-700 border-slate-200 hover:text-slate-900';
  const actionButtonClass = isDark ? 'bg-[#1f2937] text-[#38bdf8] border-[#374151]' : 'bg-slate-100 text-cyan-700 border-slate-200';
  const cardTextClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const cardMutedTextClass = isDark ? 'text-slate-400' : 'text-slate-600';

  const TAB_ITEMS = [
    { value: 'chat' as const, label: 'AI 비서' },
    { value: 'guide' as const, label: '질문 가이드 및 설명서' },
    { value: 'site' as const, label: '사이트 바로가기' },
    { value: 'overview' as const, label: '서비스 개요' },
  ];

  // 단일 관리 및 원클릭/태그 버튼용 표준 데이터셋
  const TAG_OPTIONS = [
    { label: '청년월세지원', query: '청년월세지원 정책의 구체적인 지원 내용과 내가 받을 수 있는 혜택이 뭐야? 나이, 소득 기준이랑 신청 서류도 같이 알려줘.' },
    { label: '청년도약계좌', query: '청년도약계좌로 목돈을 마련하고 싶은데, 가입 자격(소득·재산) 조건이 어떻게 돼? 매달 얼마씩 모으면 최종적으로 얼마를 받는지 계산해 줘.' },
    { label: '청년구직활동지원금', query: '청년구직활동지원금은 미취업 청년이면 누구나 받을 수 있어? 구직 단념 청년이나 취업 준비생을 위한 구체적인 지원 금액이랑 고용24 신청 방법을 알려줘.' },
    { label: '청년소득세감면', query: '중소기업에 취업하거나 창업한 청년을 위한 청년 소득세 감면 제도의 혜택 비율이 어떻게 돼? 회사나 홈택스에서 어떻게 신청하는지 주의사항과 함께 알려줘.' },
    { label: '청년버팀목전세자금대출', query: '청년 버팀목 전세자금 대출의 한도와 금리 우대 조건이 궁금해. 주택드림 청약대출 같은 다른 청년 주거 금융 정책과 비교해서 나에게 더 유리한 걸 추천해 줘.' }
  ];

  const SITE_LINKS = [
    { label: '청년월세지원 바로가기', href: 'https://www.bokjiro.go.kr/ssis-tbu/index.do' },
    { label: '청년도약계좌 바로가기', href: 'https://www.kinfa.or.kr/main.do' },
    { label: '청년구직활동지원금 바로가기', href: 'https://www.work24.go.kr/cm/main.do' },
    { label: '청년소득세감면 바로가기', href: 'https://hometax.go.kr/websquare/websquare.html?w2xPath=/ui/pp/index_pp.xml&menuCd=index3' },
    { label: '청년버팀목전세자금대출 바로가기', href: 'https://enhuf.molit.go.kr/index.jsp' }
  ];

  const CATEGORY_DATA: Record<string, CategoryDetail> = {
    admin: { 
      num: "01",
      title: "스마트 행정 및 민원 도큐멘테이션 백서",
      subtitle: "정부24 및 주요 기관 연계 원스톱 서류 발급 체계 및 신고 가이드라인",
      content: (
        <div className={`space-y-6 text-[15px] leading-relaxed ${cardTextClass} font-light`}>
          <p className={`text-lg leading-relaxed ${cardMutedTextClass} font-normal mb-6`}>본 프레임워크는 대국민 행정 기관 방문 없는 무인/비대면 원스톱 민원 처리를 표준화합니다.</p>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>정부24 비대면 발급 고도화</strong>공동인증서 및 간편인증 기반의 동기화를 통해 주민등록등본, 초본, 건축물대장 등 핵심 민원서류를 즉시 PDF로 변환 및 모바일 지갑으로 송출하는 시스템 가이드라인을 정립합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>가족관계증명서 및 법원 연계</strong>대법원 전자의료가족관계등록시스템과의 API 연결을 인터페이스화하여 온디맨드 형태의 무료 증명 공급 인프라를 확충합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>모바일 신분증 및 자격 검증 패스</strong>운전면허증 및 주민등록증의 분실 리스크를 차단하기 위한 DID 블록체인 기반 모바일 증명 모듈을 장착하여 오프라인 신원 확인 절차를 간소화합니다.</li>
          </ul>
        </div>
      )
    },
    housing: { 
      num: "02",
      title: "청년 주거 안심 보호 프로토콜 백서",
      subtitle: "사회초년생 자산 보호를 위한 전세사기 원천 예방 및 안심 특약 매칭",
      content: (
        <div className={`space-y-6 text-[15px] leading-relaxed ${cardTextClass} font-light`}>
          <p className={`text-lg leading-relaxed ${cardMutedTextClass} font-normal mb-6`}>사회초년생 및 청년 가구의 부동산 정보 비대칭성을 해결하고 보증금 유실 위험을 차단하는 자산 보호 규격입니다.</p>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>계약 전 실시간 권리 분석</strong>대법원 인터넷등기소 API 연계를 유도하여 등기부등본의 갑구(소유권 래포) 및 을구(근저당 설정)를 자동 트래킹하고, 매물 가치 대비 부채 비율이 70%를 상회할 시 경고 피드백을 전달합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>HUG 전세보증보험 및 안심특약 빌더</strong>주택도시보증공사의 가입 승인 요건을 시뮬레이션하고, 임대인의 악성 임대인 명부 등록 여부를 사전 대조합니다. 계약서 특약란에 "전세자금대출 미승인 시 계약은 무효로 하고 계약금은 즉시 반환한다" 등의 법적 효력 안심 문구를 자동 생성합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>주택임대차 신고 및 확정일자 원스톱 패스</strong>국토교통부 거래신고 시스템과 네이티브 동기화를 지원하여 이사 당일 주민센터 방문 없이 확정일자 부여 및 전입신고를 모바일로 일괄 접수하여 우선변제권을 실시간으로 확보합니다.</li>
          </ul>
        </div>
      )
    },
    finance: { 
      num: "03", 
      title: "디지털 금융 보안 및 자산 트래킹 엔진 백서", 
      subtitle: "스미싱 차단 체계 구축 및 숨은 국가 환급금 · 카드 포인트 일괄 매칭", 
      content: (
        <div className={`space-y-6 text-[15px] leading-relaxed ${cardTextClass} font-light`}>
          <p className={`text-lg leading-relaxed ${cardMutedTextClass} font-normal mb-6`}>지능화되는 보이스피싱 금융 피해를 원천 차단하고 숨은 미청구 자산을 일괄 복원하는 금융 안전망입니다.</p>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>악성 앱 및 스미싱 링크 원격 디텍팅</strong>출처가 불분명한 APK 파일 설치 및 금융기관 사칭 문자 메시지의 URL 패턴을 실시간으로 분석하여 탐지 시 즉각적인 실행 차단 안내를 전송합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>미청구 국가 환급금 및 과오납금 일괄 조회</strong>삼쩜삼 방식의 세금 환급 가이드를 넘어 국세청 홈택스, 행안부 위택스, 국민건강보험 환급금 API를 다이렉트로 매칭하여 사용자가 인지하지 못한 숨은 과오납 행정 비용을 찾아 정산합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>흩어진 카드 포인트 및 여신금융 자산 통합</strong>여신금융협회 통합조회 모듈을 스크래핑 방식으로 가이드하여 여러 카드사에 분산된 잔여 포인트를 단 하나의 대표 계좌로 일괄 현금화 입금 처리하는 알고리즘을 제안합니다.</li>
          </ul>
        </div>
      )
    },
    eco: { 
      num: "04", 
      title: "친환경 자원 순환 가이드 인프라 백서", 
      subtitle: "혼동하기 쉬운 분리배출 규정 확립 및 대형 폐가전 무상 수거 연계", 
      content: (
        <div className={`space-y-6 text-[15px] leading-relaxed ${cardTextClass} font-light`}>
          <p className={`text-lg leading-relaxed ${cardMutedTextClass} font-normal mb-6`}>복잡하고 혼동하기 쉬운 지자체별 폐기물 배출 규정을 인공지능 기반으로 시각화하여 과태료 부과를 방지합니다.</p>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>애매한 품목 분리배출 AI 가이드라인</strong>씻어도 지워지지 않는 컵라면 용기(일반쓰레기), 거울 및 도자기류(불연성 마대), 깨진 유리 대처법 등 환경부 공식 매뉴얼을 챗봇 형태로 연동하여 즉각적인 배출 카테고리를 지정합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>대형 폐가전 및 가구 무상 배출 솔루션</strong>한국전자제품자원순환공제조합(내수거형) 시스템과 연계하여 냉장고, 세탁기 등 대형 가전을 스티커 구입 비용 없이 기사 방문 수거로 처리하는 루트를 안내합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>지자체 대형 폐기물 스티커 모바일 발행</strong>침대, 책상 등 가구류 배출 시 구청 방문 없이 모바일로 간편 결제 후 바코드가 포함된 신고 필증을 출력하거나 번호를 기재하여 배출하는 행정 편의를 확보합니다.</li>
          </ul>
        </div>
      )
    },
    travel: { 
      num: "05", 
      title: "지능형 교통 및 모빌리티 최적화 백서", 
      subtitle: "K-패스 교통비 환급, 수하물 보안 규정 및 과태료 결제 구조 확립", 
      content: (
        <div className={`space-y-6 text-[15px] leading-relaxed ${cardTextClass} font-light`}>
          <p className={`text-lg leading-relaxed ${cardMutedTextClass} font-normal mb-6`}>전국 단위의 교통 인프라 편의성을 확보하고, 항공 및 도로 네트워크에서 발생하는 행정 비용과 위반 리스크를 관리합니다.</p>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>K-패스 및 광역 교통비 환급 자동화</strong>국토교통부 대중교통비 환급 플랫폼 고도화 가이드에 맞춰 월별 대중교통 이용 횟수 및 청년/저소득층 우대 적립률(20%~53%)의 최적 정산 트래킹 뷰를 구현합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>국제선 항공 보안 수하물 원격 통제</strong>IATA 규격 기준 리튬 보조배터리, 라이터, 전자담배의 위탁 수하물 반입 불허 지침 및 기내 휴대 필수 규정, 액체류 100ml 용기 제한 룰을 탑승 전 체크리스트로 자동 빌드합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>경찰청 이파인(EFINE) 실시간 단속 조회</strong>교통민원24 네트워크와 상시 매칭되어 무인 단속 카메라에 감지된 제한 속도/신호 위반 과태료 및 범칙금을 즉시 고지하고 미납 고속도로 통행료와 함께 디지털로 원스톱 결제 처리합니다.</li>
          </ul>
        </div>
      )
    },
    health: { 
      num: "06", 
      title: "의료 헬스케어 및 라이프 가드 파이프라인 백서", 
      subtitle: "실시간 야간의료 매칭, 종이 없는 실비 청구 및 건강검진 인프라", 
      content: (
        <div className={`space-y-6 text-[15px] leading-relaxed ${cardTextClass} font-light`}>
          <p className={`text-lg leading-relaxed ${cardMutedTextClass} font-normal mb-6`}>야간·휴일 의료 공백을 최소화하고 보건의료 데이터를 개인 주도형으로 안전하게 관리하는 디지털 헬스 파이프라인입니다.</p>
          <ul className="list-disc pl-5 space-y-4">
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>달빛어린이병원 및 응급의료 네트워크 매칭</strong>중앙응급의료센터(E-Gen) API를 가동하여 심야 시간대 운영 중인 인근 소아과 및 야간 약국의 대기 현황과 진료 가능 여부를 실시간 지도로 라우팅합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>실손의료보험 종이 없는 간편 청구</strong>병원에서 복잡한 영수증과 세부내역서를 종이로 발급받을 필요 없이, 마이데이터 체계를 활용해 터치 몇 번으로 보험사에 디지털 청구서를 전송하는 프로토콜을 제시합니다.</li>
            <li><strong className={`${isDark ? 'text-slate-100' : 'text-slate-900'} block text-base font-bold mb-1`}>국민건강보험 공단 검진 결과 데이터 마이닝</strong>과거 10년간 진행된 국가 일반 건강검진 결과를 연동하여 혈압, 혈당, 콜레스테롤 추이를 시각화하고 대사증후군 위험도를 예측하는 맞춤 헬스 피드를 형성합니다.</li>
          </ul>
        </div>
      )
    }
  };

  const normalizeAnswer = (text: string) => text;

  const executeSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageId = Date.now();
    setMessages(prev => [...prev, { id: userMessageId, sender: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationId: '',
        }),
      });

      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다.');
      }
      const data = await response.json();
      const aiAnswer = normalizeAnswer(String(data.answer || data.error || '죄송합니다. 답변을 생성하지 못했습니다.'));

      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiAnswer }]);
    } catch (error) {
      console.error('Dify API 오류:', error);
      const errorMessage = error instanceof Error 
        ? `⚠️ 오류: ${error.message}` 
        : '⚠️ 링코가 잠시 자리를 비웠어요. Dify 연결을 확인해 주세요.';
      
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeSend(input);
  };

  return (
    <div className={`min-h-screen flex w-screen h-screen overflow-hidden antialiased transition-colors duration-300 tracking-tight font-sans ${theme === 'dark' ? 'bg-[#0b0f19] text-[#f8fafc]' : 'bg-[#f1f5f9] text-[#0f172a]'}`}>
      {/* LEFT SIDEBAR DESIGN */}
      <aside className={`w-[280px] p-10 flex flex-col justify-between border-r shrink-0 z-50 h-full transition-all ${theme === 'dark' ? 'bg-[#111827] border-[#374151] shadow-[4px_0_20px_rgba(0,0,0,0.5)]' : 'bg-white border-[#cbd5e1] shadow-[4px_0_15px_rgba(0,0,0,0.03)]'}`}>
        <div className="flex flex-col gap-10">
          <div className="font-bold text-2xl tracking-wide text-current flex flex-col items-start gap-2">
            <img src="/LINCO.png" alt="링코 로고" className="h-8 w-auto object-contain"/>
            <span className="font-normal text-xs text-[#94a3b8] tracking-widest uppercase">시작이 가벼워지다</span>
          </div>
          <nav className="flex flex-col gap-2.5">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => { setActiveTab(tab.value); setActiveDetail(null); }}
                className={`w-full text-left p-3.5 px-4 font-semibold text-[14.5px] border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${activeTab === tab.value ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white border-transparent shadow-[0_4px_14px_rgba(6,182,212,0.3)] scale-[1.02]' : 'bg-transparent text-[#94a3b8] border-transparent hover:bg-slate-500/10 hover:text-current'}`}>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2.5">
          <button type="button" onClick={() => { setActiveTab('roadmap'); setActiveDetail(null); }} className={`w-full text-left p-3.5 px-4 font-semibold text-[14.5px] border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${activeTab === 'roadmap' ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white border-transparent scale-[1.02]' : 'bg-transparent text-[#94a3b8] border-transparent hover:bg-slate-500/10 hover:text-current'}`}><span>앞으로의 로드맵</span></button>
          <button type="button" onClick={() => { setActiveTab('settings'); setActiveDetail(null); }} className={`w-full text-left p-3.5 px-4 font-semibold text-[14.5px] border rounded-xl transition-all flex items-center gap-3 cursor-pointer ${activeTab === 'settings' ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white border-transparent scale-[1.02]' : 'bg-transparent text-[#94a3b8] border-transparent hover:bg-slate-500/10 hover:text-current'}`}><span>설정</span></button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 h-full relative flex flex-col overflow-hidden">
        
        {/* AI CHAT SECTION */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full w-full justify-between">
            <div className="flex-1 p-10 overflow-y-auto flex flex-col gap-5">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex max-w-[80%] p-4.5 px-6 rounded-2xl text-[15.5px] leading-relaxed shadow-sm whitespace-pre-wrap break-words ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] text-white self-end font-medium rounded-tr-none' : `self-start border rounded-tl-none ${isDark ? 'bg-[#1f2937] border-[#374151] text-slate-100' : 'bg-white border-[#cbd5e1] text-[#0f172a]'}`}`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && <div className={`self-start p-3 px-5 text-sm rounded-xl animate-pulse font-medium ${isDark ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>LINCO 분석 엔진 가동 중...</div>}
              <div ref={chatEndRef} />
            </div>

            {/* 교정 부분: 하단 해시태그 버튼 클릭 시 executeSend(tag.query) 원활하게 바인딩 완료 */}
            <div className="flex flex-wrap gap-2.5 px-10 mb-5">
              {TAG_OPTIONS.map(tag => (
                <button key={tag.label} type="button" onClick={() => executeSend(tag.query)} className={`text-[13px] font-semibold border rounded-full px-4 py-2.5 cursor-pointer transition-all ${tagButtonClass}`}># {tag.label}</button>
              ))}
            </div>

            {/* CONTROL PANEL & INPUT ROW */}
            <div className={`p-6 px-10 flex flex-col gap-4 border-t backdrop-blur-md ${theme === 'dark' ? 'bg-[#111827]/90 border-[#374151]' : 'bg-white/90 border-[#cbd5e1]'}`}>
              <button type="button" onClick={() => {
                const randomTag = TAG_OPTIONS[Math.floor(Math.random() * TAG_OPTIONS.length)];
                executeSend(randomTag.query);
              }} className="w-full p-4 font-bold rounded-xl text-white bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] flex items-center justify-center gap-2 cursor-pointer transition-all">
                <i className="fa-solid fa-microphone text-base"></i> 가이드북 기반 해시태그 원클릭 질문
              </button>
              <form onSubmit={handleFormSubmit} className="flex gap-3">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="새 가이드북의 50선 복지 정책을 입력해 보세요..." className={`flex-1 p-4 px-5 rounded-xl border outline-none ${inputClass}`} />
                <button type="submit" className={`p-4 px-8 font-bold border rounded-xl cursor-pointer ${actionButtonClass}`}>전송</button>
              </form>
            </div>
          </div>
        )}

        {/* 질문 가이드 및 사용 설명서 탭 */}
        {activeTab === 'guide' && (
          <div className="w-full h-full p-12 box-border overflow-y-auto max-w-4xl">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-book-open text-[#38bdf8]"></i> LINCO 질문 가이드
            </h1>
            <span className="text-[#94a3b8] text-[15px] font-medium block mt-1.5 mb-10">가이드북 기반 해시태그 질문과 원클릭 시뮬레이션을 가장 효과적으로 사용하는 방법을 알려드립니다.</span>

            <div className="space-y-8">
              <div className={`p-6 border rounded-2xl ${panelClass}`}>
                <h3 className="text-xl font-bold mb-3 text-cyan-400 flex items-center gap-2">
                  <i className="fa-solid fa-hashtag"></i> 해시태그 버튼 활용법
                </h3>
                <p className={`${mutedTextClass} text-[15px] leading-relaxed mb-4`}>
                  화면 아래의 해시태그 버튼을 누르면, 해당 주제에 최적화된 질문이 자동으로 입력됩니다. 이미 준비된 질문은 청년 맞춤 정책을 빠르게 탐색하기 위해 구성되어 있습니다.
                </p>
                <div className={`p-4 rounded-xl border space-y-2 ${subtlePanelClass}`}>
                  <div className={`text-[14.5px] ${cardTextClass}`}><strong className="text-[#38bdf8] font-semibold">#청년월세지원</strong> → 청년월세지원 대상, 지원 금액, 신청 요건, 제출 서류를 알려줍니다.</div>
                  <div className={`text-[14.5px] ${cardTextClass}`}><strong className="text-[#38bdf8] font-semibold">#청년도약계좌</strong> → 가입 자격과 월납입액별 예상 수령액을 계산해 드립니다.</div>
                  <div className={`text-[14.5px] ${cardTextClass}`}><strong className="text-[#38bdf8] font-semibold">#청년구직활동지원금</strong> → 지원 대상, 지원 금액, 신청절차를 한 번에 정리합니다.</div>
                  <div className={`text-[14.5px] ${cardTextClass}`}><strong className="text-[#38bdf8] font-semibold">#청년소득세감면</strong> → 감면 대상과 혜택, 신청 방법을 쉽게 설명합니다.</div>
                  <div className={`text-[14.5px] ${cardTextClass}`}><strong className="text-[#38bdf8] font-semibold">#청년버팀목전세자금대출</strong> → 대출 한도, 금리 우대 조건, 서류 준비 요령을 안내합니다.</div>
                </div>
              </div>

              <div className={`p-6 border rounded-2xl ${panelClass}`}>
                <h3 className="text-xl font-bold mb-3 text-emerald-400 flex items-center gap-2">
                  <i className="fa-solid fa-magic"></i> 원클릭 시뮬레이션 사용법
                </h3>
                <p className={`${mutedTextClass} text-[15px] leading-relaxed mb-4`}>
                  상단의 원클릭 시뮬레이션 버튼을 누르면 해시태그 목록에서 하나를 무작위로 선택하여 질문을 자동으로 보냅니다. 오늘 바로 어떤 정책을 확인할지 모르겠을 때 간편하게 활용하세요.
                </p>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 text-[13.5px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <strong className="block mb-2 text-[#38bdf8]">사용 예</strong>
                    <p>“가장 적합한 청년 지원 정책을 추천해줘.”</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <strong className="block mb-2 text-[#38bdf8]">이런 상황에 좋아요</strong>
                    <p>“무슨 정책이 내 상황에 유리할지 모르겠다”, “청년 정책을 빠르게 테스트해보고 싶다”</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 border rounded-2xl ${panelClass}`}>
                <h3 className="text-xl font-bold mb-3 text-violet-400 flex items-center gap-2">
                  <i className="fa-solid fa-pen-to-square"></i> 직접 질문 작성 팁
                </h3>
                <p className={`${mutedTextClass} text-[15px] leading-relaxed mb-4`}>
                  직접 입력할 때는 정책명과 원하는 정보 범위를 함께 적어주세요. 예: “청년월세지원 신청 자격과 소득 기준, 제출 서류를 알려줘.”
                </p>
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 text-[13.5px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>정책명 명시</div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>필요한 정보 유형 추가</div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>구체적인 상황 포함</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'site' && (
          <div className="w-full h-full p-12 box-border overflow-y-auto max-w-4xl">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-link text-[#38bdf8]"></i> LINCO 사이트 바로가기
            </h1>
            <span className="text-[#94a3b8] text-[15px] font-medium block mt-1.5 mb-10">청년 정책별로 바로 이동할 수 있는 공식 안내 페이지를 한 곳에 모았습니다.</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SITE_LINKS.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={`block rounded-3xl border p-6 transition ${isDark ? 'border-slate-700/60 bg-[#0b1220]/80 hover:border-[#38bdf8] hover:bg-[#111827]' : 'border-slate-200 bg-white hover:border-[#0ea5e9] hover:bg-slate-50'}`}>
                  <div className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{link.label}</div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>공식 안내 페이지에서 바로 혜택 정보를 확인하세요.</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SERVICE OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="w-full h-full p-12 box-border overflow-hidden relative">
            <div className={`transition-all duration-500 ease-out absolute inset-0 p-12 overflow-y-auto ${activeDetail ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`} style={{ pointerEvents: activeDetail ? 'none' : 'auto' }}>
              <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Service Overview</h1>
              <span className={`${mutedTextClass} text-[15px] font-medium block mt-1.5 mb-10`}>일상의 핵심 난제 해결을 위한 6대 프레임워크 백서</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(CATEGORY_DATA).map((key) => (
                  <div key={key} onClick={() => setActiveDetail(key)} className={`border p-8 rounded-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 relative group hover:-translate-y-2 hover:border-[#38bdf8] ${theme === 'dark' ? 'bg-[#1f2937] border-[#374151] shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-[#cbd5e1] shadow-[0_4px_15px_rgba(0,0,0,0.02)]'}`}>
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#3b82f6] rounded-t-2xl"></div>
                    <div>
                      <span className="font-bold text-sm text-[#38bdf8] mb-4 block font-mono tracking-wider">{CATEGORY_DATA[key].num}</span>
                      <h3 className={`text-xl font-bold mb-3.5 leading-snug tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{CATEGORY_DATA[key].title.replace(" 백서", "")}</h3>
                      <p className={`text-sm leading-relaxed mb-6 font-normal line-clamp-2 ${mutedTextClass}`}>{CATEGORY_DATA[key].subtitle}</p>
                    </div>
                    <div className="text-[13px] font-bold text-[#38bdf8] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">전략 백서 보기 &rarr;</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`transition-all duration-500 ease-out absolute inset-0 p-12 overflow-y-auto ${activeDetail ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} style={{ pointerEvents: activeDetail ? 'auto' : 'none' }}>
              <div className="max-w-4xl mx-auto py-4">
                <button onClick={() => setActiveDetail(null)} className={`text-[14.5px] font-semibold flex items-center gap-2 mb-8 bg-transparent border-none cursor-pointer ${mutedTextClass}`}>
                  &larr; 목록 대시보드로 돌아가기
                </button>
                {activeDetail && (
                  <>
                    <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]">{CATEGORY_DATA[activeDetail].title}</h2>
                    <div className={`font-medium mb-8 pb-5 border-b ${isDark ? 'text-slate-400 border-slate-700/60' : 'text-slate-600 border-slate-200'}`}>{CATEGORY_DATA[activeDetail].subtitle}</div>
                    <div>{CATEGORY_DATA[activeDetail].content}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP DESIGN SYSTEM */}
        {activeTab === 'roadmap' && (
          <div className="p-12 box-border h-full overflow-y-auto flex flex-col">
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>링코 향후 비전 및 업데이트 로드맵</h1>
            <span className={`${mutedTextClass} text-[15px] font-medium block mt-1.5 mb-10`}>플랫폼의 지속 가능한 진화 방향성을 기술 타임라인 기반으로 공개합니다.</span>
            
            <div className={`flex flex-col gap-6 relative pl-8 border-l-2 max-w-3xl ml-2 ${isDark ? 'border-slate-700/40' : 'border-slate-200'}`}>
              {[
                { phase: 'Phase 1 (Near-Term Vision)', title: '공공 API 가이드 고도화 및 실시간 동기화', desc: '정부24 및 대법원 등록 시스템의 연계 데이터 범위를 넓혀 가이드라인의 정확도를 실시간 수준으로 끌어올릴 예정입니다.' },
                { phase: 'Phase 2 (Mid-Term Vision)', title: '소외계층 전용 초지능형 AI 보이스 비서 도입', desc: '텍스트 입력이 어려운 고령층이나 다문화 가정을 위해 자연어 대화만으로 복잡한 서류 신청 및 민원 처리를 에스코트하는 음성 대화형 엔진을 결합합니다.' }
              ].map((node) => (
                <div key={node.phase} className={`p-6 border rounded-2xl relative ${panelClass}`}>
                  <span className="text-xs font-bold text-[#38bdf8] uppercase block mb-1.5 font-mono tracking-wider">{node.phase}</span>
                  <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{node.title}</h4>
                  <p className={`text-[15px] leading-relaxed font-normal ${mutedTextClass}`}>{node.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <div className="p-12 box-border h-full overflow-y-auto flex flex-col">
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>시스템 디자인 및 환경 설정</h1>
            <div className={`p-6 border rounded-2xl max-w-xl ${panelClass}`}>
              <div className="text-base font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-palette text-[#38bdf8]"></i> 시각 테마 디자인 모드</div>
              <div className="flex gap-4">
                <button onClick={() => setTheme('dark')} className={`flex-1 p-3.5 font-bold rounded-xl border transition-all ${theme === 'dark' ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white border-transparent' : 'bg-slate-600 text-white border-transparent hover:bg-slate-500'}`}>Dark Premium</button>
                <button onClick={() => setTheme('light')} className={`flex-1 p-3.5 font-bold rounded-xl border transition-all ${theme === 'light' ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white border-transparent' : 'bg-slate-600 text-white border-transparent hover:bg-slate-500'}`}>Light Elegant</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}