# VocaAid

**영단어 학습을 위한 스마트한 단어장 애플리케이션 with Notion 연동**

> **📌 프로젝트 구조 안내**
> - **voca-aid** (현재 폴더): Next.js 기반 메인 애플리케이션
> - **voca-aid-react**: 기존 Vite+React 버전 (참고용)

## 🌟 주요 기능

### ✨ 새로운 기능 (v2.0)
- **Notion 동기화**: 모든 단어를 Notion 데이터베이스와 실시간 동기화
- **오프라인 지원**: 인터넷 연결 없이도 로컬에서 학습 가능
- **향상된 보안**: XSS 방지 및 입력 검증 강화
- **성능 최적화**: Next.js App Router 기반으로 빠른 로딩
- **반응형 디자인**: 모든 기기에서 완벽한 사용자 경험

### 📚 기존 기능
- **폴더 기반 단어 관리**: 주제별로 단어 분류
- **스마트 학습**: 플래시카드 방식으로 효과적인 암기
- **퀴즈 모드**: 실력 점검을 위한 다양한 퀴즈
- **별표 기능**: 중요한 단어 마킹
- **데이터 내보내기/가져오기**: JSON 형태로 백업

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
# 의존성 설치
npm install
```

### 2. 환경 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

`.env.local` 파일을 열고 Notion 설정을 입력하세요:

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
```

### 3. Notion 설정

#### 3.1 Notion Integration 생성
1. [Notion Developers](https://developers.notion.com/)에 접속
2. "New integration" 클릭
3. Integration 이름을 "VocaAid"로 설정
4. "Submit" 후 **Integration Token** 복사

#### 3.2 Notion 데이터베이스 생성
1. Notion에서 새 페이지 생성
2. 데이터베이스 추가 (`/database`)
3. 다음 속성(Properties) 추가:
   - **English** (Title)
   - **Korean** (Text)
   - **Korean2** (Text) - 선택사항
   - **FolderId** (Text)
   - **IsStarred** (Checkbox)

#### 3.3 데이터베이스 연결
1. 데이터베이스 우상단 "..." → "Add connections"
2. "VocaAid" Integration 선택
3. 데이터베이스 URL에서 ID 복사
   ```
   https://notion.so/[workspace]/DATABASE_ID?v=...
   ```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

## 📖 사용법

### 🔄 동기화 기능
- **자동 동기화**: 온라인 상태에서 변경사항이 자동으로 Notion과 동기화
- **수동 동기화**: 상단의 "동기화" 버튼으로 즉시 동기화
- **오프라인 모드**: 인터넷 연결이 없어도 로컬에서 학습 가능

### 📝 단어 관리
1. **단어 추가**: "단어 관리" 탭에서 영어/한국어 입력
2. **폴더 생성**: 주제별로 폴더를 만들어 단어 분류
3. **단어 편집**: 연필 아이콘으로 기존 단어 수정
4. **일괄 이동**: 여러 단어를 선택하여 다른 폴더로 이동

### 🎯 학습 모드
- **단어 외우기**: 플래시카드로 단어 암기
- **퀴즈 풀기**: 다양한 형태의 퀴즈로 실력 확인
- **전체 보기**: 모든 단어를 한눈에 확인

### ⭐ 팁
- **키보드 단축키**: 학습 모드에서 스페이스바(다음), S키(별표)
- **별표 표시**: 중요한 단어나 어려운 단어에 별표 표시
- **폴더별 학습**: 특정 주제만 선택하여 집중 학습

## 🛠️ 개발

### 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 타입 검사
npm run type-check

# 린팅
npm run lint
```

## 🚀 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
4. 자동 배포 완료

## 🔒 보안

### 구현된 보안 기능
- **XSS 방지**: 모든 사용자 입력 검증 및 정화
- **CSRF 보호**: Next.js 기본 CSRF 토큰 사용
- **입력 검증**: 길이 제한 및 특수문자 필터링
- **환경변수 보호**: 민감한 정보는 서버에서만 접근

---

**VocaAid와 함께 영단어 정복하세요! 🎯**
