# NewSai Review Log

## 📜 AI 개발 원칙 (AI Interaction Rules)

> **이 규칙은 AI가 코드를 생성할 때 자동으로 적용됩니다.**

1. **주석**: 모든 코드에는 "무엇"을 하는지보다 **"왜(Why)"** 이렇게 작성했는지 주석을 상세히 단다.
2. **누적 리뷰**: 새로운 페이즈나 기능을 구현할 때마다 `docs/review.md`의 **최상단**에 리뷰 기록을 자동으로 추가한다.
3. **상태 관리**: 기능 구현이 완료되면 `docs/plan.md`의 진행 상황 체크박스(`[x]`)를 자동으로 업데이트한다.
4. **무결성 검사**: 코드를 제안하기 전, 중복 선언이나 문법 오류(Syntax Error)가 없는지 자체 검토한다.

---

## 체크리스트

- [ ] 요구사항과 일치하는가
- [ ] API Key가 노출되지 않는가
- [ ] 실패 시 에러 메시지가 남는가
- [ ] 함수 책임이 분리되어 있는가
- [ ] 실행 명령어가 README와 일치하는가
- [ ] GitHub Actions에서 동작 가능한가

## 코드 리뷰 기록

> **작성 가이드**: 새로운 기능이 구현될 때마다 상단에 새 기록을 추가하여 누적 관리합니다.

### 2026-06-02 Phase 8 & 9: 소스코드 구조 리팩토링 및 대시보드 셋업, 통합 파이프라인 구축

- **검토 대상**: `src/`, `dashboard/`, `src/index.js`, `test/`
- **구현 내용**:
  - `src/` 내 단일 파일들을 도메인별 디렉토리(`services`, `formatters`, `notifications`, `utils`)로 분리하여 코드 응집도 향상
  - 리팩토링에 따른 테스트 코드(`test-*.js`) 내 모듈 참조 경로 일괄 업데이트
  - 전체 파이프라인(수집-요약-포맷팅-전송)을 한 번에 순차적으로 실행하는 `src/index.js` 컨트롤러 추가
  - 누락되어 있던 `dashboard/` 폴더에 Vite(v5) 기반 React 프로젝트 템플릿 부트스트랩 및 의존성 설치 완료
- **이슈 및 트러블슈팅**:
  - React 초기 셋업 중 현재 Node.js(v20.15.1) 버전과 최신 Vite(v6) 간의 Native Binding Error(호환성) 문제가 발생하여, 안정성이 검증된 Vite v5 버전으로 다운그레이드하여 해결함.
- **체크리스트**:
  - [x] 모듈 위치 변경으로 인한 Import(경로) 오류가 발생하지 않는가
  - [x] `index.js` 실행 시 모든 파이프라인이 순차적으로 올바르게 동작하는가
  - [x] React 대시보드 프로젝트가 오류 없이 빌드(`npm run build`) 되는가

---

### 2026-06-02 Phase 8: 리액트 대시보드 확장 구현

- **검토 대상**: `dashboard/src/App.jsx`, `docs/plan.md`
- **구현 내용**:
  - `data.json`을 시각화하기 위한 React 기반 대시보드 핵심 구조 설계
  - `fetch` API를 통해 정적 JSON 데이터를 로드하고 상태(`useState`)로 관리하는 로직 구현
  - 카드 뉴스 스타일의 UI를 React 컴포넌트 단위로 분리
- **이슈 및 트러블슈팅**:
  - 로컬 개발 환경과 배포 환경(GitHub Pages)에서의 JSON 경로 차이를 고려하여 상대 경로 사용
- **체크리스트**:
  - [x] 데이터 로딩 중 로딩 상태 표시 기능 포함
  - [x] 뉴스 목록 렌더링 시 고유 Key값(Link) 부여 확인

---

### 2026-06-02 Phase 7/9: GitHub Actions 및 Pages 연동

- **검토 대상**: `.github/workflows/deploy.yml`, `docs/plan.md`
- **구현 내용**:
  - 매일 오전 7시 자동 실행 및 수동 실행을 위한 GitHub Actions 워크플로우 작성
  - 파이프라인 실행 후 결과물을 `gh-pages` 브랜치에 자동 배포하는 로직 추가
  - GitHub Secrets를 통한 보안 변수(`GEMINI_API_KEY`, `DISCORD_WEBHOOK_URL`) 처리
- **이슈 및 트러블슈팅**:
  - GitHub Pages 배포 시 소스 코드가 섞이지 않도록 `gh-pages` 브랜치를 분리하여 관리하도록 설정
- **체크리스트**:
  - [x] 워크플로우 트리거(Cron, dispatch)가 정상 설정되었는가
  - [x] 배포 대상 디렉토리가 올바르게 지정되었는가

---

### 2026-06-01 Phase 7: 데이터 내보내기 및 웹 대시보드 기초 구현

- **검토 대상**: `src/generateJson.js`, `index.html`, `test/test-pipeline.js`
- **구현 내용**:
  - 뉴스 데이터와 요약본을 JSON 형식으로 추출하는 `generateJson.js` 구현
  - 통합 파이프라인에서 `data.json` 자동 생성 로직 추가
  - 생성된 JSON을 시각화하는 Vanilla JS 기반의 `index.html` 대시보드 작성
- **이슈 및 트러블슈팅**:
  - 브라우저 보안 정책상 로컬 파일 직접 실행 시 CORS 이슈가 발생할 수 있으므로 `fetch` 경로를 상대 경로로 설정
- **체크리스트**:
  - [x] `data.json` 파일이 올바른 스키마로 생성되는가
  - [x] `index.html`에서 데이터를 정상적으로 불러와 표시하는가

---

### 2026-06-01 시각적 리포트(이미지) 생성 기능 추가

- **검토 대상**: `src/generatePdf.js`
- **구현 내용**:
  - 단순 텍스트 나열이 아닌 '카드 뉴스' 스타일의 프레젠테이션 레이아웃 CSS 적용
  - PDF뿐만 아니라 PNG 이미지로도 결과물을 저장할 수 있는 `generateImage` 함수 추가
- **이슈 및 트러블슈팅**:
  - 한눈에 들어오는 레이아웃을 위해 Flexbox를 활용한 카드형 디자인 채택
- **체크리스트**:
  - [x] `page.screenshot`을 통해 이미지 파일이 정상 생성되는가
  - [x] 고해상도 출력을 위해 `deviceScaleFactor` 설정이 적용되었는가

### 2026-06-01 Phase 6: PDF 생성 기능 구현 (generatePdf.js)

- **검토 대상**: `src/generatePdf.js`, `test/test-pdf.js`
- **구현 내용**:
  - `puppeteer`를 활용하여 Markdown/HTML 기반의 PDF 리포트 생성 로직 구현
  - 브라우저 기반 렌더링을 통해 깔끔한 레이아웃 확보
- **이슈 및 트러블슈팅**:
  - Markdown을 직접 PDF로 구울 때 스타일이 깨지는 문제를 방지하기 위해 HTML 래퍼(Wrapper) 사용
- **체크리스트**:
  - [x] PDF 파일이 `reports/` 폴더에 정상 생성되는가
  - [x] 한글 폰트가 깨지지 않고 정상 출력되는가

---

### 2026-06-01 테스트 파일 코드 중복 수정 및 구조 최적화

- **검토 대상**: `test/test-discord.js`, `test/test-pipeline.js`
- **구현 내용**:
  - `test-discord.js`가 `test-pipeline.js`와 동일한 코드를 가지고 있던 오류 수정
  - 개별 모듈 테스트 목적에 맞게 Discord 전송 로직만 남기고 통합 테스트 로직 제거
- **이슈 및 트러블슈팅**:
  - 파일 이동/생성 과정에서 발생한 복사 붙여넣기 실수 확인 및 수정
- **체크리스트**:
  - [x] 각 테스트 파일이 이름에 맞는 기능만 수행하는가

---

### 2026-06-01 프로젝트 구조 리팩토링 및 테스트 폴더 격리

- **검토 대상**: 프로젝트 폴더 구조 전체
- **구현 내용**:
  - `tests/` 디렉토리를 생성하여 모든 `test-*.js` 파일을 이동
  - `sendDiscord.js`를 루트에서 `src/`로 이동하여 관심사 분리
  - 테스트 파일 내의 `import` 상대 경로 업데이트 (../src/...)
- **이슈 및 트러블슈팅**:
  - 파일 이동 후 경로 미수정 시 발생하는 `MODULE_NOT_FOUND` 에러 예방을 위해 모든 참조 경로 전수 조사 및 수정
- **체크리스트**:
  - [x] `tests/` 내의 스크립트가 `src/` 내부 모듈을 정상적으로 불러오는가
  - [x] 루트 디렉토리가 설정 파일과 폴더만 남고 깔끔해졌는가

### 2026-05-27 디렉토리 구조 정규화 (docs 내 JS 제거)

- **검토 대상**: 프로젝트 폴더 전체
- **구현 내용**:
  - `docs/` 내부에 존재하던 `.js` 파일들을 삭제하여 `docs` 폴더의 역할을 문서 관리로 한정
  - `src/utils/fileSystem.js`가 물리적으로 존재하지 않아 발생한 `ERR_MODULE_NOT_FOUND` 해결
- **이슈 및 트러블슈팅**:
  - 파일 이동 과정에서 `test-pipeline.js`가 참조하는 경로와 실제 파일 경로가 불일치했던 문제 수정
- **체크리스트**:
  - [x] `docs/` 폴더에 `.md` 파일만 남았는가

### 2026-05-27 파일 저장 로직 모듈화 (src/utils/fileSystem.js)

- **검토 대상**: `test-pipeline.js`, `src/utils/fileSystem.js`
- **구현 내용**:
  - `test-pipeline.js`에 직접 구현되어 있던 파일 저장 로직을 공통 유틸리티 모듈로 분리
  - 디렉토리 존재 여부 확인 및 자동 생성 로직 포함
- **이슈 및 트러블슈팅**:
  - 동기 방식(`fs.writeFileSync`)을 사용하여 로직의 단순함 유지 (파이프라인의 순차적 실행 보장)
- **체크리스트**:
  - [x] 디렉토리가 없을 때 `recursive: true` 옵션으로 정상 생성되는가
  - [x] 반환된 파일 경로가 올바른 절대 경로인가

---

### 2026-05-27 마크다운 파일 저장 및 아카이빙 로직 구현

- **검토 대상**: `test-pipeline.js`
- **구현 내용**:
  - 생성된 마크다운 리포트를 `reports/report-YYYY-MM-DD.md` 형태로 저장하는 로직 추가
  - `fs` 모듈을 사용하여 폴더 자동 생성 및 파일 쓰기 프로세스 구현
- **이슈 및 트러블슈팅**:
  - 파일 시스템 접근 시 절대 경로를 확보하기 위해 `path.join`과 `process.cwd()` 활용
- **체크리스트**:
  - [x] `reports/` 디렉토리가 없을 경우 정상적으로 자동 생성되는가
  - [x] 파일 내용이 깨지지 않고 UTF-8 형식으로 잘 저장되는가

---

### 2026-05-27 Phase 5 마무리: 파이프라인 통합 테스트 완료

- **검토 대상**: `test-pipeline.js`, `src/generateMarkdown.js`
- **구현 내용**:
  - `fetchAINews` -> `summarizeNews` -> `generateMarkdown`으로 이어지는 데이터 흐름 연결
  - `generateMarkdown.js`를 ESM 모듈로 변경하여 프로젝트 전체의 모듈 시스템 일관성 확보
- **이슈 및 트러블슈팅**:
  - 기존 `module.exports` 방식이 ESM의 `import`와 충돌하는 문제를 발견하여 `export` 방식으로 수정함
- **체크리스트**:
  - [x] 뉴스 데이터가 요약 함수로 정상 전달되는가
  - [x] 요약된 텍스트가 마크다운 템플릿에 올바르게 삽입되는가

---

### 2026-05-27 Phase 5: Markdown 생성 (generateMarkdown.js) 구현

- **검토 대상**: `src/generateMarkdown.js`
- **구현 내용**:
  - 수집된 뉴스 목록(title, link, pubDate)과 LLM 요약본을 결합하여 구조화된 Markdown 문서를 생성하는 로직 구현
  - 리포트 상단에 생성 날짜(YYYY-MM-DD)를 포함하여 문서 식별 용이성 확보
- **이슈 및 트러블슈팅**:
  - 뉴스 목록이 배열이므로 `map`과 `join`을 활용하여 선언적으로 리스트를 구성함
- **체크리스트**:
  - [x] Markdown 문법(Heading, Link, List) 준수 확인
  - [x] 뉴스 링크 및 제목 정상 바인딩 확인

---

### 2026-05-26 최종 모델 확정 및 요약 기능 검증 완료 (gemini-3.1-flash)

- **검토 대상**: `src/summarizeNews.js`
- **구현 내용**:
  - 여러 모델(1.5, 2.0, 3.1 등)의 할당량 및 경로 에러 트러블슈팅 후 `gemini-3.1-flash`로 최종 교체
  - 실제 요약 결과가 정상적으로 반환되는 무결성 확인
- **이슈 및 트러블슈팅**:
  - 429(Quota Exceeded) 및 404 에러를 해결하기 위해 직접 API 정책과 모델 ID 리스트를 대조하여 해결
- **체크리스트**:
  - [x] gemini-3.1-flash 모델 정상 작동 확인

---

### 2026-05-26 Gemini 404 에러 최종 대응 (SDK 기본값 복원)

- **검토 대상**: `src/summarizeNews.js`
- **구현 내용**:
  - `gemini-pro` 및 `v1` 조합에서의 404 에러 확인 후 `gemini-1.5-flash` 기본 설정으로 복구
  - API 키 로드 여부를 확인하기 위한 디버그 로그 추가
- **이슈 및 트러블슈팅**:
  - 모델과 API 버전 간의 불일치로 인한 404 문제 해결 시도. 구글 AI Studio 무료 키는 기본 엔드포인트가 가장 안정적임을 확인.
- **체크리스트**:
  - [x] .env 파일의 변수명(`GEMINI_API_KEY`) 일치 여부 재확인

---

### 2026-05-26 Gemini 1.5 Flash 모델 404 에러 대응 및 트러블슈팅

- **검토 대상**: `src/summarizeNews.js`
- **구현 내용**:
  - `gemini-1.5-flash` 모델 호출 시 발생하는 404 Not Found 에러 확인
  - 모델명 오타 점검 및 SDK 버전 업데이트 가이드 작성
- **이슈 및 트러블슈팅**:
  - 에러 원인: 특정 API 버전(`v1beta`)에서 모델을 찾지 못함 -> SDK 최신화 제안
- **체크리스트**:
  - [x] 모델명 식별자 재확인
  - [x] 라이브러리 최신 버전(`@google/generative-ai@latest`) 설치 권장

---

### 2026-05-26 Gemini API 무료 티어 데이터 보안 가이드라인 수립

- **검토 대상**: `src/summarizeNews.js`, Gemini API 데이터 정책
- **구현 내용**:
  - 무료 티어의 데이터 학습 활용 정책(Data usage for model improvement) 확인
  - 뉴스 요약 시 민감 정보 포함 금지 및 공개 데이터 중심 전송 원칙 수립
- **이슈 및 트러블슈팅**:
  - 무료 티어 사용 시 개인정보(PII)가 프롬프트에 포함되지 않도록 데이터 정규화 과정 점검
- **체크리스트**:
  - [x] 프롬프트 내 민감 정보 포함 여부 확인
  - [x] 학습 활용 정책에 따른 데이터 최소 전송 원칙 준수

---

### 2026-05-25 Gemini API Free Tier 설정 및 검증

- **검토 대상**: `.env`, Google AI Studio 설정
- **구현 내용**:
  - Google AI Studio를 통해 발급받은 Gemini API Key 적용
  - 무료 티어(Gemini 1.5 Flash)의 호출 한도(15 RPM)가 프로젝트 규모에 적합함을 확인
- **이슈 및 트러블슈팅**:
  - 유료 구독(Gemini Advanced)과 API 무료 티어 간의 차이점 이해 및 적용
- **체크리스트**:
  - [x] 무료 티어 한도 내 작동 여부 확인 완료

---

### 2026-05-25 LLM 엔진 변경 (OpenAI -> Google Gemini)

- **검토 대상**: `src/summarizeNews.js`, `.env.example`
- **구현 내용**:
  - OpenAI API 대신 Google Gemini API (`gemini-1.5-flash`) 사용하도록 변경
  - 구독 환경에 따른 비용 최적화를 위해 무료 티어가 제공되는 Gemini 선택
- **이슈 및 트러블슈팅**:
  - OpenAI SDK와 Gemini SDK의 사용 방식 차이점(messages vs prompt) 적용
- **체크리스트**:
  - [x] `@google/generative-ai` 라이브러 연동 확인
  - [x] 환경변수명 변경 (`GEMINI_API_KEY`) 적용 확인

---

### 2026-05-25 API 키 발급 및 빌링(Billing) 가이드 보강

- **검토 대상**: 프로젝트 환경 설정 가이드
- **구현 내용**:
  - OpenAI API 키의 구체적인 발급 경로(Direct URL) 제공
  - API 작동을 위한 선결 조건(Prepaid Credit 충전) 명시
- **이슈 및 트러블슈팅**:
  - 개발자가 단순 키 발급 외에 '잔액 충전' 단계를 놓칠 경우 발생할 수 있는 `insufficient_quota` 에러 예방
- **체크리스트**:
  - [x] 보안 가이드라인 준수 확인
  - [x] 주니어 개발자 눈높이의 설명 제공

---

### 2026-05-25 환경 변수 설정 가이드 제공 및 보안 강화

- **검토 대상**: `.env.example`, `docs/review.md`
- **구현 내용**:
  - API 키 발급 방법 가이드 제공 (OpenAI Platform)
  - 협업 및 보안을 위한 `.env.example` 템플릿 파일 생성
- **이슈 및 트러블슈팅**:
  - 주니어 개발자가 API 키를 실수로 커밋하는 리스크를 방지하기 위해 `.env.example` 사용법 강조
- **체크리스트**:
  - [x] API Key 직접 노출 방지 로직 확인
  - [x] .env.example 파일 생성 확인

---

### 2026-05-25 AI 워크플로우 자동화 및 에러 수정

- **검토 대상**: `docs/review.md`, `src/summarizeNews.js`
- **구현 내용**:
  - AI가 코드를 짤 때 스스로 지켜야 할 **개발 원칙**을 `review.md`에 명시 (자동 주석, 자동 리뷰 누적 등)
  - `summarizeNews.js`에서 발생한 코드 중복 선언 에러 해결
- **이슈 및 트러블슈팅**:
  - `SyntaxError: Identifier 'OpenAI' has already been declared` -> 중복된 import 및 선언부 삭제 완료
- **체크리스트**:
  - [x] 중복 코드 제거 확인
  - [x] AI 가이드라인 명시 확인

---

### 2026-05-25 코드 가독성 개선 및 상세 주석 추가

- **검토 대상**: `src/summarizeNews.js`, `src/fetchNews.js`, `src/sendDiscord.js`
- **구현 내용**:
  - 개발자의 이해를 돕기 위한 "왜(Why)" 중심의 주석 추가
  - 각 함수와 주요 로직(API 호출, 데이터 가공)에 대한 배경 설명 보강
- **이슈 및 트러블슈팅**:
  - 단순 기능 설명보다는 로직의 의도(의사결정 이유)를 설명하는 데 집중함
- **체크리스트**:
  - [x] 모든 주요 함수에 JSDoc 스타일 주석 적용 확인

---

### 2026-05-25 Phase 4: LLM 요약 (summarizeNews.js) 구현

- **검토 대상**: `src/summarizeNews.js`
- **구현 내용**:
  - Gemini `1.5-flash` 모델을 사용한 뉴스 데이터 한국어 요약 로직 구현
  - 뉴스 리스트를 텍스트 프롬프트로 변환하는 유틸리티 작성
- **이슈 및 트러블슈팅**:
  - API Key 누락 시 명확한 에러 메시지를 던지도록 예외 처리 추가
- **체크리스트**:
  - [x] OpenAI API 연동 정상 작동 확인
  - [x] 프롬프트에 뉴스 링크 포함 여부 확인
  - [x] 에러 발생 시 상위 모듈로 전파 확인

---

### 2026-05-25 Phase 3: 뉴스 수집 (fetchNews.js) 구현

- **검토 대상**: `src/fetchNews.js`
- **구현 내용**:
  - Google News RSS를 사용하여 AI 관련 뉴스 5개 수집 및 데이터 정규화 로직 구현
- **이슈 및 트러블슈팅**:
  - RSS 파싱 실패 시 상위 모듈로 에러를 전파하도록 `throw error` 처리
- **체크리스트**:
  - [x] 요구사항(뉴스 5개 제한) 일치 여부 확인
  - [x] `rss-parser` 라이브러리 정상 동작 확인
  - [x] 에러 발생 시 로그 출력 확인

---

### [YYYY-MM-DD] 이전 단계 기능명

_(여기에 이전 기록들이 누적됩니다)_
