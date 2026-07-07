# 🤖 Dify 연결 설정 가이드

이 문서는 Linco 프로젝트를 Dify와 연결하는 방법을 설명합니다.

## 1️⃣ Dify 설치 및 시작

### 설치 방법

**Docker를 이용한 설치 (권장)**
```bash
docker run -d \
  -p 80:5001 \
  --name dify \
  langgenius/dify:latest
```

**로컬 설치**
```bash
git clone https://github.com/langgenius/dify.git
cd dify
docker-compose up -d
```

### 접속
- URL: `http://localhost` (또는 `http://localhost:5001`)
- 브라우저에서 첫 사용자 계정을 생성합니다.

---

## 2️⃣ Dify에서 App 생성

1. **Dify 대시보드 접속**
   - http://localhost에서 로그인

2. **새 App 생성**
   - "Create new app" 클릭
   - App type: **Chat** 선택
   - 이름: `LINCO Assistant` (또는 원하는 이름)

3. **App 설정**
   - **System Prompt 예시**
     ```
     당신은 한국 청년 정책 전문가입니다.
     사용자의 질문에 대해 청년 월세 지원, 청년 도약계좌, 
     청년 구직 활동 지원금 등 정책을 상세히 설명해주세요.
     항상 친절하고 명확하게 답변하세요.
     ```
   
   - **LLM 모델 선택**
     - OpenAI: `gpt-4` 또는 `gpt-3.5-turbo`
     - Ollama (로컬): `llama2` 등의 로컬 모델

4. **App 저장**
   - "Save" 클릭

---

## 3️⃣ API Key 및 Endpoint 확인

1. **API Key 생성**
   - Dify 앱 설정 → "API" 탭
   - "Create API Key" 클릭
   - API Key 복사 (예: `app-EbKM7jzjI2o8jo2Q4H0SggIz`)

2. **API Endpoint**
   - **로컬 Dify**: `http://localhost/api/v1`
   - **클라우드 Dify**: `https://api.dify.ai/v1`

---

## 4️⃣ 프로젝트 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 입력:

```env
# Dify Configuration
NEXT_PUBLIC_DIFY_API_URL=http://localhost/api/v1
DIFY_API_KEY=app-EbKM7jzjI2o8jo2Q4H0SggIz
DIFY_USER_ID=linco-user-1
```

**주의사항:**
- `DIFY_API_KEY`: Dify에서 발급받은 API Key로 교체
- `NEXT_PUBLIC_DIFY_API_URL`: Dify 서버 주소로 교체
  - 로컬: `http://localhost/api/v1`
  - 클라우드: `https://api.dify.ai/v1`

---

## 5️⃣ API 확인 및 테스트

### Dify API Endpoint

**Chat Messages API**
```bash
curl -X POST http://localhost/api/v1/chat-messages \
  -H "Authorization: Bearer app-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {},
    "query": "청년월세지원이란?",
    "response_mode": "blocking",
    "user": "test-user"
  }'
```

### 응답 예시
```json
{
  "message_id": "abc123",
  "mode": "chat",
  "answer": "청년월세지원은 부모와 함께 살지 않는 청년의 월세 부담을 덜어주는 정책입니다...",
  "metadata": {}
}
```

---

## 6️⃣ 프로젝트 실행

### 개발 모드 시작
```bash
npm run dev
```

### 브라우저에서 확인
- URL: http://localhost:3000
- "AI 비서" 탭에서 질문 입력
- Dify 연결 확인

---

## 7️⃣ 트러블슈팅

### ❌ "API 연결 실패" 오류
**해결 방법:**
1. Dify 서버 실행 확인: `docker ps | grep dify`
2. API Key 확인: `.env.local`의 `DIFY_API_KEY` 값 재확인
3. Endpoint URL 확인: `NEXT_PUBLIC_DIFY_API_URL` 올바른지 확인
4. Dify API 상태 확인:
   ```bash
   curl -X GET http://localhost/api/v1/status \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

### ❌ "401 Unauthorized" 오류
- API Key가 잘못되었을 가능성
- Dify에서 새 API Key 생성하고 `.env.local` 업데이트

### ❌ "연결이 거부되었습니다"
- Dify 서버가 실행 중인지 확인
- Docker 실행: `docker start dify`
- Dify 로그 확인: `docker logs dify`

### ❌ 느린 응답
- Dify LLM 모델 확인 (더 가벼운 모델 시도)
- 네트워크 연결 확인
- `response_mode`를 `streaming`으로 변경하면 응답이 실시간으로 표시됨

---

## 8️⃣ 고급 설정

### Conversation ID를 이용한 대화 연속성
```typescript
// route.ts에서 대화 히스토리 유지
const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DIFY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: {},
    query: message,
    response_mode: 'blocking',
    user: DIFY_USER_ID,
    conversation_id: conversationId, // 이전 대화 ID 전달
  }),
});
```

### 스트리밍 응답 (실시간)
```typescript
body: JSON.stringify({
  response_mode: 'streaming', // blocking 대신 streaming 사용
  // ... 다른 필드
})
```

---

## 📚 참고 자료

- [Dify 공식 문서](https://docs.dify.ai/)
- [Dify API 참고](https://docs.dify.ai/guides/application-orchestration/creating-an-application)
- [Dify GitHub](https://github.com/langgenius/dify)

---

## ✅ 체크리스트

- [ ] Dify 서버가 실행 중인가?
- [ ] API Key를 생성했는가?
- [ ] `.env.local` 파일을 작성했는가?
- [ ] API Key와 Endpoint URL을 올바르게 입력했는가?
- [ ] `npm run dev`로 프로젝트를 시작했는가?
- [ ] http://localhost:3000에서 채팅을 테스트했는가?
