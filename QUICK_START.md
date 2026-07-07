# 🚀 LINCO Dify 연결 - 빠른 시작 가이드

이 가이드를 따라 LINCO를 Dify와 연결하세요! (5분 소요)

## ⚡ 1단계: Dify 설치 및 실행 (1분)

```bash
# Dify를 Docker로 실행
docker run -d -p 80:5001 --name dify langgenius/dify:latest

# 실행 확인
docker ps | grep dify
```

브라우저에서 `http://localhost` 접속하여 계정 생성

---

## 🔑 2단계: Dify API Key 발급 (1분)

1. Dify 대시보드에 로그인
2. 새 Chat App 생성
   - App 이름: `LINCO Assistant`
   - System Prompt 입력 (선택사항)
3. "API" 탭에서 "Create API Key" 클릭
4. **API Key 복사** (예: `app-EbKM7jzjI2o8jo2Q4H0SggIz`)

---

## ⚙️ 3단계: 환경변수 설정 (1분)

프로젝트 루트의 `.env.local` 파일을 다음과 같이 수정:

```env
NEXT_PUBLIC_DIFY_API_URL=http://localhost/api/v1
DIFY_API_KEY=<복사한-API-Key를-여기에-붙여넣기>
DIFY_USER_ID=linco-user-1
```

**예시:**
```env
NEXT_PUBLIC_DIFY_API_URL=http://localhost/api/v1
DIFY_API_KEY=app-abc123def456ghi789jkl
DIFY_USER_ID=linco-user-1
```

---

## 💻 4단계: 프로젝트 실행 (1분)

```bash
# 프로젝트 폴더로 이동
cd K-AI-LINCO-main

# 의존성 설치 (첫 번째만)
npm install

# 개발 서버 시작
npm run dev
```

---

## ✅ 5단계: 테스트 (1분)

1. 브라우저에서 `http://localhost:3000` 접속
2. "AI 비서" 탭에서 메시지 입력:
   ```
   청년월세지원이란?
   ```
3. Dify 답변이 나오면 성공! 🎉

---

## 🎯 주요 기능 테스트

### 해시태그 버튼 사용
- `#청년월세지원`, `#청년도약계좌` 등 클릭하면 자동 질문 입력

### 원클릭 시뮬레이션
- "가이드북 기반 원클릭 시뮬레이션" 버튼 클릭
- 무작위 정책 질문 자동 전송

---

## 🔧 파일 구조

**생성/수정된 파일:**

```
K-AI-LINCO-main/
├── .env.local                    # ✅ 생성됨 - 환경변수
├── src/
│   ├── app/
│   │   └── api/chat/route.ts    # ✅ 개선됨 - Dify 연결
│   └── lib/
│       └── dify.ts              # ✅ 생성됨 - API 유틸리티
├── DIFY_SETUP_GUIDE.md          # ✅ 생성됨 - 상세 설정 가이드
└── README.md                     # ✅ 개선됨 - 프로젝트 설명
```

---

## 🐛 문제 해결

### ❌ "연결이 거부되었습니다" 오류
```bash
# Dify 실행 확인
docker ps | grep dify

# Dify 재시작
docker start dify
```

### ❌ "401 Unauthorized" 오류
1. Dify 대시보드에서 새 API Key 생성
2. `.env.local`의 `DIFY_API_KEY` 업데이트
3. 개발 서버 재시작: `npm run dev`

### ❌ "메시지를 입력해주세요" 오류
- `.env.local` 파일이 존재하는지 확인
- `NEXT_PUBLIC_DIFY_API_URL`와 `DIFY_API_KEY`가 설정되었는지 확인

더 자세한 해결 방법은 [DIFY_SETUP_GUIDE.md](./DIFY_SETUP_GUIDE.md#7️⃣-트러블슈팅) 참고

---

## 💡 팁

- **Dify 시스템 프롬프트 커스터마이징:**
  - Dify 앱 설정에서 System Prompt 수정하면 답변 스타일 변경 가능
  
- **한국어 LLM 모델 사용 권장:**
  - Dify에서 OpenAI의 `gpt-3.5-turbo` 또는 `gpt-4` 사용
  - 또는 로컬 한글 모델(Ollama + Elyza 등) 사용

---

## 📚 다음 단계

1. **DIFY_SETUP_GUIDE.md** - 더 자세한 설정 방법
2. **README.md** - 프로젝트 전체 구조 이해
3. **src/lib/dify.ts** - API 구현 코드 확인

---

**완료! 이제 LINCO에서 Dify로부터 청년 정책 답변을 받을 수 있습니다! 🎉**

질문이 있으시면 [DIFY_SETUP_GUIDE.md](./DIFY_SETUP_GUIDE.md)를 참고하세요.
