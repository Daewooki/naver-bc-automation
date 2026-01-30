# 브랜드커넥트 자동화 (Brandconnect Automation)

네이버 쇼핑 커넥트(브랜드커넥트) 상품 리뷰를 자동으로 블로그에 포스팅하는 도구입니다.

## ✨ 주요 기능

- 🔗 **상품 URL만 입력하면 끝!** - 브랜드커넥트 링크만 넣으면 자동으로 처리
- 🤖 **GPT 기반 글 작성** - SEO 최적화된 자연스러운 리뷰 글 자동 생성
- 🖼️ **이미지 자동 스크래핑** - 상품 이미지 자동 수집 및 업로드
- 📝 **해시태그 자동 생성** - 검색 노출을 위한 해시태그 자동 추가
- 🌐 **웹 대시보드** - 편리한 웹 UI로 링크 관리 및 발행

---

## 📋 사전 준비물

### 1. Node.js 설치 (v18 이상)

1. [Node.js 공식 사이트](https://nodejs.org/ko) 접속
2. **LTS** 버전 다운로드 (왼쪽 초록색 버튼)
3. 설치 파일 실행 후 "다음" 계속 클릭하여 설치 완료

설치 확인:
```bash
node --version
# v18.x.x 이상이 나오면 성공!
```

### 2. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. 구글/마이크로소프트 계정으로 로그인 (또는 회원가입)
3. 좌측 메뉴에서 **API Keys** 클릭
4. **"Create new secret key"** 버튼 클릭
5. 생성된 키 복사 (sk-xxx... 형태)

> ⚠️ API 키는 한 번만 보여주므로 반드시 복사해서 안전한 곳에 저장하세요!

### 3. 네이버 블로그 ID 확인

내 블로그 주소가 `https://blog.naver.com/abc123` 이라면, 블로그 ID는 `abc123` 입니다.

---

## 🚀 설치 방법

### 1단계: 프로젝트 다운로드

**방법 A: Git 사용 (권장)**
```bash
git clone https://github.com/Daewooki/naver-bc-automation.git
cd naver-bc-automation
```

**방법 B: ZIP 다운로드**
1. GitHub에서 "Code" → "Download ZIP" 클릭
2. 압축 해제 후 폴더로 이동

### 2단계: 패키지 설치

```bash
npm install
```

### 3단계: 브라우저 설치 (자동화용)

```bash
npx playwright install chromium
```

### 4단계: 데이터베이스 설정

```bash
npx prisma generate
npx prisma db push
```

---

## ⚙️ 설정 방법

### 1. 환경 변수 파일 생성

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 2. .env 파일 수정

메모장 또는 VS Code로 `.env` 파일을 열고 아래 내용을 입력:

```env
# OpenAI API 키 (위에서 발급받은 키)
OPENAI_API_KEY=sk-여기에_발급받은_키_붙여넣기

# 네이버 블로그 ID
NAVER_BLOG_ID=내_블로그_아이디

# 데이터베이스 (수정 불필요)
DATABASE_URL="file:./prisma/dev.db"
```

---

## 📖 사용 방법

### Step 1: 네이버 로그인

```bash
npm run login
```

1. 브라우저가 자동으로 열립니다
2. 네이버에 로그인하세요 (2단계 인증 포함)
3. 로그인 완료 후 자동으로 세션이 저장됩니다

> 💡 세션은 보통 7~30일간 유지됩니다. 발행 실패 시 다시 로그인하세요.

### Step 2: 웹 대시보드 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속

### Step 3: 링크 추가 & 발행

1. 브랜드커넥트에서 받은 링크 복사 (https://naver.me/xxx 형태)
2. 웹 대시보드에서 URL 입력 후 "추가" 클릭
3. 🔍 버튼으로 상품 정보 가져오기
4. 🚀 **발행** 버튼 클릭!

발행 버튼을 누르면:
- 브라우저가 자동으로 열림
- 상품 이미지 스크래핑
- GPT가 리뷰 글 작성
- 이미지 업로드 + 글 작성
- 자동 발행 완료!

---

## 🔧 명령어 모음

| 명령어 | 설명 |
|--------|------|
| `npm run login` | 네이버 로그인 (세션 저장) |
| `npm run dev` | 웹 대시보드 실행 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run db:studio` | 데이터베이스 관리 UI |

---

## ❓ FAQ / 문제 해결

### Q: "로그인이 안 돼요"
**A:** Playwright 브라우저를 재설치해보세요:
```bash
npx playwright install chromium --force
```

### Q: "발행이 실패해요"
**A:** 세션이 만료되었을 수 있습니다:
```bash
npm run login
```
다시 로그인 후 발행해보세요.

### Q: "OpenAI API 오류가 나요"
**A:** 
- API 키가 올바른지 확인
- OpenAI 계정에 크레딧이 있는지 확인
- .env 파일에 키가 제대로 입력되었는지 확인

### Q: "이미지가 안 올라가요"
**A:** 네트워크 문제일 수 있습니다. 잠시 후 다시 시도하거나, 상품 페이지의 이미지가 정상인지 확인해보세요.

---

## ⚠️ 주의사항 / 면책조항

1. **네이버 이용약관**: 과도한 자동화 사용은 네이버 이용약관에 위배될 수 있습니다.
2. **계정 제재**: 단시간에 너무 많은 글을 발행하면 계정이 제재될 수 있습니다.
3. **본인 책임**: 이 도구의 사용으로 인한 모든 결과는 사용자 본인의 책임입니다.
4. **적절한 사용**: 하루 1~3개 정도의 적절한 발행을 권장합니다.

---

## 📄 라이선스

MIT License

---

## 🙋 문의

이슈나 문의사항은 GitHub Issues를 이용해주세요.
