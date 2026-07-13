# 🎓 LINCO - 청년 정책 AI 비서

**LINCO**는 한국 청년들을 위한 AI 기반 정책 상담 서비스입니다. Dify와 연동하여 실시간 정책 정보를 제공합니다.

## 🚀 빠른 시작

### 1️⃣ 필수 조건
- Node.js 18+ 설치
- Docker (Dify 실행용)
- npm 또는 yarn

### 2️⃣ Dify 설정
Dify를 로컬에서 실행합니다:

```bash
docker run -d -p 80:5001 --name dify langgenius/dify:latest
```

Dify 설정 가이드는 [DIFY_SETUP_GUIDE.md](./DIFY_SETUP_GUIDE.md)를 참고하세요.

### 3️⃣ 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성:

```env
NEXT_PUBLIC_DIFY_API_URL=http://localhost/api/v1
DIFY_API_KEY=your-dify-api-key-here
DIFY_USER_ID=linco-user-1
```

### 4️⃣ 프로젝트 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📚 프로젝트 구조

```
linco/
├── src/
│   ├── app/
│   │   ├── page.tsx           # 메인 UI 컴포넌트
│   │   ├── globals.css        # 전역 스타일
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts   # Dify API 라우트
│   └── lib/
│       └── dify.ts            # Dify API 유틸리티
├── public/                     # 정적 파일
├── .env.local                  # 환경변수 (개발용)
├── DIFY_SETUP_GUIDE.md        # Dify 설정 상세 가이드
├── package.json
└── tsconfig.json
```

---

## 🤖 Dify 연결 구조

```
┌─────────────────────────┐
│   LINCO Web UI (React)  │
│  - Chat Interface       │
│  - Message Display      │
└────────────┬────────────┘
             │ POST /api/chat
             ▼
┌─────────────────────────┐
│  Next.js API Route      │
│  - Message Validation   │
│  - Error Handling       │
└────────────┬────────────┘
             │ callDifyAPI()
             ▼
┌─────────────────────────┐
│   Dify API Server       │
│  - LLM Processing       │
│  - Policy Answers       │
└─────────────────────────┘
```

---

## 💻 주요 기능

### 1. AI 비서 (AI 챗봇)
- 청년 정책 관련 질문에 즉시 답변
- 해시태그 기반 빠른 질문 입력
- 원클릭 시뮬레이션 (무작위 정책 제안)

### 2. 질문 가이드
- 효과적인 질문 방법 학습
- 정책별 자주 묻는 질문

### 3. 사이트 바로가기
- 청년 정책 공식 페이지 링크
- 신청 및 혜택 확인

### 4. 서비스 개요
- 6대 정책 프레임워크 안내

---

## 📋 지원하는 청년 정책

1. **청년월세지원** - 월세 부담 경감
2. **청년도약계좌** - 목돈 마련 지원
3. **청년구직활동지원금** - 구직 활동 지원
4. **청년소득세감면** - 세금 감면 혜택
5. **청년버팀목전세자금대출** - 전세자금 지원

---

## 🔧 개발 관련 명령어

```bash
# 개발 서버 (HMR 활성화)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# ESLint 검사
npm run lint
```

---

## 🐛 트러블슈팅

### Dify 연결 오류
1. Docker에서 Dify 실행 확인
2. `.env.local` 파일 확인
3. API Key가 올바른지 확인

자세한 해결 방법은 [DIFY_SETUP_GUIDE.md](./DIFY_SETUP_GUIDE.md#7️⃣-트러블슈팅) 참고

---

## 📚 참고 자료

- [Dify 공식 문서](https://docs.dify.ai/)
- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)

---

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

---

## Getting Started (Next.js)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# -" 
