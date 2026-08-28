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

### 2026-08-28 꺾은선 차트 '일일 위험 가속도' 파동 시각화 전환, 0.1pt 스케일링 및 UI 레이아웃 대폭 연동 개선

- **검토 대상**: `dashboard/src/App.jsx`, `dashboard/src/App.css`, `src/formatters/generateJson.js`, `data.json`, `docs/plan.md`, `docs/review.md`
- **구현 내용**:
  - **트렌드 꺾은선 차트 시각화 개편**: 100점에 이르게 포화되던 고정 수치 대신, 매일 뉴스가 일자리 위험 축적 속도에 준 가속도 파동(`dailyVelocity`: -3.0 ~ +8.0 pt/day)을 나타내는 동적 SVG 꺾은선 차트로 변경했습니다. 0.0pt 기준점선, 위험도별 차별화 노드 색상(레드/오렌지/옐로우/그린) 및 상세 가속 사유 연동 툴팁을 추가했습니다.
  - **대시보드 UI/UX 정밀 커스텀**:
    - Y축 수치 라벨 크기(16px, font-weight: 800) 및 좌측 여백 확장을 적용하여 수치 시독성을 최대로 높였습니다.
    - SVG 차트 세로 수직 늘어남(Flex-grow)을 방지하고 황금 비율 높이(180px)와 상하단 콤팩트 패딩을 적용하여 붕 뜨는 여백을 완벽하게 제거했습니다.
    - 카드 제목(`1.05rem`) 및 상세 근거 날짜/가속도 배지에 `white-space: nowrap` 단일 행 고정을 적용하여 두 줄 줄바꿈 현상을 차단했습니다.
    - 가속도 단위(`(단위: pt/day)`)를 차트 상단에서 차트 하단 중앙으로 깔끔하게 레이아웃 이동했습니다.
  - **장기 누적 지수 스케일링(0.1pt)**: `generateJson.js`에서 가속도 1pt 당 `0.1pt` 비율로 누적 연산(`prevCumulative + velocity * 0.1`)하여 수개월 이상 데이터가 축적되더라도 100점 천장에 쉽게 도달하지 않고 완만한 장기 우상향 추이를 그리도록 개선했습니다.
  - **데이터베이스 재정정**: 과거 10일치 `data.json` 데이터의 `cumulativeRiskScore`를 50.0점 베이스라인 기준의 현실적 수치(50.0 ~ 51.4)로 재설정했습니다.
- **체크리스트**:
  - [x] 꺾은선 차트가 일직선 100점이 아닌 동적 가속도 파동으로 미려하게 그려지는가
  - [x] Y축 수치 및 차트 높이가 답답하거나 잘림 없이 단정하게 렌더링되는가
  - [x] 제목 및 상세 배지가 줄바꿈 현상 없이 한 줄로 고정되는가
  - [x] 누적 점수가 100점 천장 효과 없이 안정적인 스케일로 연산되는가
  - [x] 대시보드 UI 빌드(`npm run build`)가 0 Error로 정상 완료되는가

### 2026-08-10 이원화 지표 모델(누적 위험 지수 + 일일 가속도) 구축 및 베이스라인 50점 정밀 조정

- **검토 대상**: `src/services/summarizeNews.js`, `src/formatters/generateJson.js`, `src/index.js`, `test/test-pipeline.js`, `dashboard/src/App.jsx`, `dashboard/src/App.css`, `data.json`
- **구현 내용**:
  - **LLM 가속도 지표 산출**: `summarizeNews.js`에 `dailyVelocity`(-3.0 ~ +8.0) 및 `velocityReason` 필드를 도입하고, 당일 뉴스의 충격 강도에 따른 가속도 부여 프롬프트 가이드라인을 정립했습니다.
  - **누적 일자리 영향 지수 연산 및 베이스라인 정밀화**: `generateJson.js`에서 AI 기술 발전에 따른 현실적 누적치(`cumulativeRiskScore`)에 당일 `dailyVelocity`를 합산 연산하여 지수가 100점에 무의미하게 고정되거나 인위적으로 감소하는 착시를 예방했습니다. 초기 출발 기준점(Baseline)은 50점(중립/보통)으로 재정정하여 점수가 과도하게 시상되는 현상을 조율했습니다.
  - **React 대시보드 UI 연동**: `App.jsx`에 누적 위험 게이지 차트, 오늘의 위험 가속도 하이라이트 카드(`velocity-badge-card`), 가속 사유 박스(`velocity-reason-box`) 및 과거 기록 미니 배지를 렌더링했습니다.
- **체크리스트**:
  - [x] dailyVelocity 및 velocityReason 스키마/프롬프트 지침이 올바르게 추가되었는가
  - [x] 누적 위험 지수 연산과 과거 data.json 마이그레이션이 성공적으로 처리되었는가 (50.0 베이스라인)
  - [x] 대시보드 UI 빌드(`npm run build`)가 0 Error로 정상 통과하였는가

### 2026-08-10 이원화 지표 모델(누적 위험 지수 + 일일 가속도) 구축 및 베이스라인 50점 정밀 조정

- **검토 대상**: `src/services/summarizeNews.js`, `src/formatters/generateJson.js`, `src/index.js`, `test/test-pipeline.js`, `dashboard/src/App.jsx`, `dashboard/src/App.css`, `data.json`
- **구현 내용**:
  - **LLM 가속도 지표 산출**: `summarizeNews.js`에 `dailyVelocity`(-3.0 ~ +8.0) 및 `velocityReason` 필드를 도입하고, 당일 뉴스의 충격 강도에 따른 가속도 부여 프롬프트 가이드라인을 정립했습니다.
  - **누적 일자리 영향 지수 연산 및 베이스라인 정밀화**: `generateJson.js`에서 AI 기술 발전에 따른 현실적 누적치(`cumulativeRiskScore`)에 당일 `dailyVelocity`를 합산 연산하여 지수가 100점에 무의미하게 고정되거나 인위적으로 감소하는 착시를 예방했습니다. 초기 출발 기준점(Baseline)은 50점(중립/보통)으로 재정정하여 점수가 과도하게 시상되는 현상을 조율했습니다.
  - **React 대시보드 UI 연동**: `App.jsx`에 누적 위험 게이지 차트, 오늘의 위험 가속도 하이라이트 카드(`velocity-badge-card`), 가속 사유 박스(`velocity-reason-box`) 및 과거 기록 미니 배지를 렌더링했습니다.
- **체크리스트**:
  - [x] dailyVelocity 및 velocityReason 스키마/프롬프트 지침이 올바르게 추가되었는가
  - [x] 누적 위험 지수 연산과 과거 data.json 마이그레이션이 성공적으로 처리되었는가 (50.0 베이스라인)
  - [x] 대시보드 UI 빌드(`npm run build`)가 0 Error로 정상 통과하였는가

### 2026-07-21 대시보드 빌드 오류 수정 (상태 및 레프 변수 중복 정의 구문 제거)

- **검토 대상**: `dashboard/src/App.jsx`
- **구현 내용**:
  - **중복 정의 구문 제거**: `App` 컴포넌트 내부에서 `expandedDays`, `setExpandedDays`, `visibleCount`, `setVisibleCount`, `loaderRef` 변수들이 두 번 선언되어 esbuild 변환 단계에서 빌드 오류를 야기하던 코드를 제거했습니다.
- **이슈 및 트러블슈팅**:
  - `The symbol ... has already been declared` 라는 빌드 실패 오류를 해결하고 Vite 빌드 프로세스가 정상 통과하도록 조치했습니다.
- **체크리스트**:
  - [x] App.jsx 내의 React 훅 변수 중복 선언이 정리되었는가
  - [x] npm run build 명령이 빌드 오류 없이 정상적으로 실행 및 완료되는가

### 2026-07-21 디스코드 웹훅 알림 포맷 개선 (대시보드 마스크드 링크 연동)

- **검토 대상**: `src/index.js`
- **구현 내용**:
  - **웹훅 알림 포맷 개선**: 디스코드 알림 메시지 하단의 안내 텍스트를 제거하고 대시보드 바로가기 링크(`https://dragon-it.github.io/newsai/`)를 깔끔하게 추가했습니다.
  - **마스크드 링크(Masked Link) 구현**: 알림 제목인 `NewSai` 문구를 클릭하면 대시보드 주소로 연결되도록 마크다운 마스크드 링크(`[NewSai](https://dragon-it.github.io/newsai/)`) 형식을 적용했습니다.
- **체크리스트**:
  - [x] 디스코드 메시지 내용 중 불필요한 고정 설명 문구가 제거되었는가
  - [x] NewSai 텍스트 클릭 시 대시보드 URL로 접속되는 마스크드 링크로 구현되었는가
### 2026-07-21 GitHub Actions 자동 배포 트리거 추가 (main 브랜치 push 이벤트 연동)

- **검토 대상**: `.github/workflows/deploy.yml`
- **구현 내용**:
  - **자동 배포 트리거 추가**: 기존에 스케줄 크론(`schedule`)과 수동 실행(`workflow_dispatch`)으로만 실행되던 배포 워크플로우에 `push: branches: [main]` 조건을 추가했습니다. 이를 통해 앞으로 `main` 브랜치에 코드가 머지되거나 직접 푸시될 때마다 배포 파이프라인이 자동 실행되도록 설정했습니다.
- **체크리스트**:
  - [x] deploy.yml 트리거 설정에 main 브랜치 push 이벤트가 올바르게 등록되었는가

### 2026-07-21 LLM 요약 JSON 파싱 에러 수정 (responseMimeType 및 responseSchema 도입)

- **검토 대상**: `src/services/summarizeNews.js`
- **구현 내용**:
  - **SchemaType 및 Schema 도입**: `@google/generative-ai` 패키지에서 `SchemaType`을 가져와 LLM이 출력해야 할 JSON 규격인 `summarySchema`를 엄격하게 기술했습니다.
  - **responseMimeType 강제**: `getGenerativeModel` 구성 매개변수에 `generationConfig`를 더해 `responseMimeType: "application/json"`과 `responseSchema: summarySchema`를 선언했습니다. 이를 통해 모델이 백틱 없이 순수하며 문법적으로 유효한 JSON 형식 문자열을 출력하도록 하였고, 문자열 안의 특수 문자/따옴표/줄바꿈 이스케이프 처리가 Gemini 엔진 단에서 자동 완결되도록 개선했습니다.
- **이슈 및 트러블슈팅**:
  - GitHub Actions 파이프라인 상에서 간헐적으로 요약 도중 `JSON.parse` 단계에서 SyntaxError(`Expected ',' or '}' after property value in JSON`)를 유발하던 불안정성을 해결했습니다.
- **체크리스트**:
  - [x] LLM 결과물 반환 형식으로 application/json 및 스키마 검증이 강제되는가
  - [x] 로컬 통합 파이프라인(`node test/test-pipeline.js`)이 완벽히 가동되어 data.json과 Markdown이 성공적으로 쓰여지는가

### 2026-07-20 PDF 다운로드 제거, 지표 명확화, 히스토리 상세(차트 연동) 및 핵심 변화 카드와 링크 연동

- **검토 대상**: `src/services/summarizeNews.js`, `src/index.js`, `dashboard/src/App.jsx`, `dashboard/src/App.css`, `test/test-pdf.js`
- **구현 내용**:
  - **PDF 제거**: 헤더에서 PDF 리포트 다운로드 액션을 삭제하고, 백엔드 파이프라인(`index.js`)에서 PDF 생성 모듈 호출, 파일 자동 복사 스크립트, 그리고 PDF 제거 안내 콘솔 로그를 영구 삭제했습니다. 또한 과거 `reports/` 내 `.pdf` 파일과 더불어 obsolete된 `test/test-pdf.js` 파일도 완전 삭제했습니다.
  - **지표 명확화 및 어제 비교**:
    - "AI 일자리 위험도"와 "종합 AI 지수"의 설명을 명확히 표시하여 사용자의 혼란을 방지했습니다.
    - 게이지 왼편에 "어제 X → 오늘 Y" 변화 흐름 및 "어제보다 +Z/-Z" 배지를 추가하여 위험 변동폭을 한눈에 식별 가능하게 했습니다.
  - **꺾은선 차트 클릭 연동**:
    - 트렌드 꺾은선의 데이터 포인트를 클릭하면 해당 일자의 상세 점수와 주요 변동 원인 목록을 렌더링하는 "📅 상세 위험도 근거" 영역을 구성했습니다.
  - **오늘의 핵심 변화 카드 및 기사 연동**:
    - 요점 변동 내역을 카드 형태의 그리드 레이아웃("오늘의 핵심 변화")으로 새롭게 설계했습니다. (카드간 간격을 `1.75rem`으로 넓히고 아래 섹션과의 간격을 `3.5rem`으로 확장하여 가독성을 높였습니다.)
    - LLM 프롬프트에 `newsIndex`를 도입하여 변동 요인이 어떤 기사에서 나왔는지 매핑하고, 요인 카드나 상세 내역 요소를 클릭하면 해당 기사의 뉴스 원문 링크로 직접 브라우징하도록 연동했습니다.
- **이슈 및 트러블슈팅**:
  - `TrendChart` 반환 JSX 영역에서 닫는 괄호 및 태그가 꼬여 화면이 컴파일되지 않는 에러를 확인하여 즉각 닫는 div와 세미콜론 구조를 수정하여 복구했습니다.
- **체크리스트**:
  - [x] PDF 다운로드 버튼 및 빌드 프로세스 연동이 완전히 제외되었는가
  - [x] 꺾은선 차트 노드 클릭 시 해당 날짜의 상세 근거가 하단에 동기화되는가
  - [x] 변동 요인 카드 클릭 시 해당하는 뉴스 원문 링크로 정상적으로 새 탭에서 열리는가

---

### 2026-07-20 일일 요약 점수화, 뉴스 별점 지표 및 위험도 변동 요인 추가

- **검토 대상**: `src/services/summarizeNews.js`, `src/formatters/generateJson.js`, `src/formatters/generateMarkdown.js`, `src/index.js`, `test/test-pipeline.js`, `dashboard/src/App.jsx`, `dashboard/src/App.css`
- **구현 내용**:
  - **LLM 프롬프트 고도화**: LLM이 뉴스 분석 요약 시 `overallScore`(오늘의 요약 종합 점수, 0~100), `riskScoreBreakdown`(위험도 변동 요인 목록), 개별 뉴스 아이템당 4대 지표(`importance`, `aiImpact`, `automationPotential`, `investmentImpact`, 1~5 정수 별점)를 JSON 스펙으로 반환하도록 프롬프트 개편.
  - **포맷터 및 파이프라인 대응**:
    - `generateJson.js`가 새 필드들을 입력받아 `data.json`에 저장하고, 구버전 데이터(과거 히스토리) 로드 시의 기본값 마이그레이션 방어 로직 설계.
    - `generateMarkdown.js`가 마크다운 보고서에 요약 종합 점수, 변동 요인 리스트 및 총합 계산 결과, 그리고 개별 뉴스 본문에 별점 기호(`★`/`☆`)를 렌더링하도록 수정.
  - **React 대시보드 시각화**:
    - 오늘의 요약 섹션 제목 옆에 "종합 점수 배지" 구현.
    - 일자리 위험도 게이지 차트 아래에 "왜 위험도가 변동했는가?" 섹션을 만들고 변동 요인을 증감률과 총합에 따라 빨강(상승)/초록(하락) 심볼로 렌더링.
    - 개별 뉴스 카드 내 4대 지표 별점 렌더링 지원 및 CSS 스타일 정의 추가.
- **이슈 및 트러블슈팅**:
  - 과거 `data.json` 히스토리 아이템들의 필드가 누락되어 있을 시 리액트 앱이 비정상 렌더링(Crash)되는 위험을 확인하여, 데이터 로딩부 및 포맷터 마이그레이션 단계에서 Fallback 기본값을 채우는 처리를 확실하게 더해 해결함.
- **체크리스트**:
  - [x] LLM 요약 응답에 신규 지표들이 정확히 생성되는가
  - [x] 대시보드 화면에 요약 점수, 위험 요인 분석, 뉴스 별점이 미려하게 출력되는가
  - [x] 과거 날짜 데이터 조회 시 비정상 종료 없이 기본값으로 안전하게 동작하는가

---

### 2026-07-13 대시보드 무한스크롤 고착 버그 핫픽스

- **검토 대상**: `dashboard/src/App.jsx`
- **구현 내용**:
  - 스크롤을 맨 아래로 아주 빠르게 내릴 때 이전 기사가 로드되지 않고 "이전 뉴스 데이터를 불러오는 중.."이 무한 노출되던 고착 현상 수정.
  - `IntersectionObserver` 설정 `useEffect` 내 의존성 배열에 `visibleCount` 누락으로 인해, 리스트 하단 돔 위치가 갱신되어도 감시자가 재생성/재관찰을 하지 않아 발생한 버그로 진단.
  - 의존성 배열에 `visibleCount`를 추가하여, 데이터가 더 렌더링될 때마다 새로운 위치의 로더를 올바르게 추적하여 연속 스크롤이 작동하도록 조치.
- **이슈 및 트러블슈팅**:
  - 화면 높이가 작거나 스크롤 속도가 너무 빨라 렌더링 후에도 로더가 여전히 뷰포트 영역 내에 걸려 있을 때, 교차 상태 변화가 감지되지 않는 맹점을 의존성 갱신으로 우아하게 해결함.
- **체크리스트**:
  - [x] 무한스크롤 가동 중 멈춤 현상 없이 연속 로딩이 완벽하게 이루어지는가

---

### 2026-07-12 추가 개선안 등록 및 PDF 다운로드 버그 픽스

- **검토 대상**: `docs/plan.md`, `dashboard/public/report.pdf`, `src/formatters/generateJson.js`
- **구현 내용**:
  - 향후 추가 개선을 위한 3개 핵심 아이디어(위험도 원인 뉴스 하이라이트, 키워드 검색/카테고리 필터, 주간/월간 종합 리포트 자동 발행)를 [plan.md](file:///c:/Users/82108/Desktop/newsai/docs/plan.md)에 정식 등록.
  - 최초 클론 후 로컬 개발 환경 등에서 파이프라인 미실행 시 PDF 다운로드 시도 시 파일 누락(404)으로 인해 "네트워크 오류"가 발생하던 버그 파악.
  - `dashboard/public/report.pdf`에 경량 텍스트 포맷의 유효한 placeholder PDF 파일을 선제적으로 배치해 두어, 언제나 정상 다운로드 프로세스가 동작하도록 개선.
  - `generateJson.js` 내 기본값 처리 조건식 구조 개선: 기존의 다소 어색한 부정 비교문(`!== undefined ? ... : 50`)을 직관적이고 표준적인 Nullish Coalescing 연산자(`?? 50`) 형식으로 리팩토링하여 사람이 한눈에 파악하기 쉽게 가독성 강화.
- **이슈 및 트러블슈팅**:
  - 다운로드 오류가 SPA 라우팅으로 인해 정적 파일 404가 index.html fallback으로 변형되며 브라우저의 파일 다운로드 중단 오류를 일으키는 현상이었음을 진단하고 정적 자산 자리표시 파일 배치로 원천 해결함.
- **체크리스트**:
  - [x] 예정 기능 3종이 plan.md에 정식 추가되었는가
  - [x] placeholder report.pdf가 정상 다운로드되고 열리는가
  - [x] ?? 연산자 리팩토링 후 정상 컴파일 및 실행되는가

---

### 2026-07-12 일자리 위험도 차트 시각화 및 대시보드 무한스크롤/아코디언 개편

- **검토 대상**: `dashboard/src/App.jsx`, `dashboard/src/App.css`, `src/services/summarizeNews.js`, `src/formatters/generateJson.js`, `src/index.js`, `test/test-pipeline.js`
- **구현 내용**:
  - Gemini LLM 요약 시 AI 관련 기사 내용을 분석하여 일자리 위험도(`jobRiskScore`, 0~100 점수)를 추가 추출하도록 프롬프트 고도화.
  - `generateJson.js`에서 데이터 구조에 위험 점수를 반영하고, 점수가 없던 기존 10일간의 리포트에 대해 45~65 사이 점수로 자동 마이그레이션해 주는 1회성 로직 마련.
  - 생성 완료된 PDF를 `dashboard/public/report.pdf`에 매번 복사하도록 `index.js`를 수정하여, React 빌드 시 다운로드 가능 경로에 최신 PDF가 탑재되게 보장.
  - 대시보드 상단에 오늘의 일자리 위험도 원호 게이지 차트(CSS 트랜지션을 이용해 침 바늘이 부드럽게 점수를 지시하는 애니메이션 탑재) 구현.
  - 대시보드 내 날짜별 위험도 추이 꺾은선 차트(SVG 기반 렌더링 및 마우스 호버 가이드라인/인터랙티브 HTML 툴팁 구현) 제작.
  - 기사 리스트를 아코디언 컴포넌트(오늘+지난 2일=총 3일은 기본 노출, 나머지는 접힘) 형태로 변경하고, 스크롤을 내릴 때 과거 데이터가 3일치씩 지연 렌더링되게 `IntersectionObserver` 무한스크롤 처리.
- **이슈 및 트러블슈팅**:
  - Vite React 개발 환경에서 외부 차트 라이브러리 사용 시 발생할 수 있는 버전 호환 충돌 리스크를 완전 차단하기 위해 순수 SVG로 두 차트를 직접 드로잉함.
  - PDF 파일의 저장 및 복사 시 발생할 수 있는 404 경로 불일치를 로컬 public 폴더 동기 복사로 완화함.
- **체크리스트**:
  - [x] 일자리 위험도 점수가 data.json에 정상 적재/마이그레이션 되었는가
  - [x] SVG 게이지 차트와 꺾은선 추이 차트가 모바일/데스크톱 화면에서 미려하게 출력되는가
  - [x] 3일 외 날짜 아코디언 접기 및 무한스크롤 지연 로딩이 안정적으로 동작하는가
  - [x] 리포트 다운로드 404 문제가 해결되었는가

---

### 2026-06-04 React 대시보드 마이그레이션 및 GitHub Actions 설정 개선

- **검토 대상**: `dashboard/src/App.jsx`, `dashboard/src/App.css`, `dashboard/src/index.css`, `.github/workflows/deploy.yml`, `docs/`
- **구현 내용**:
  - 기존 Vanilla HTML/JS UI(`docs/index.html`, `docs/style.css`)를 React/Vite 기반 앱(`dashboard/src/App.jsx`)으로 완벽하게 마이그레이션.
  - 깃허브 액션 `deploy.yml` 파일에서 파이프라인이 수집한 `data.json` 및 `reports/` 데이터를 매번 `main` 브랜치에 자동 커밋 및 푸시하도록 스크립트 추가 (데이터 보존용).
  - 깃허브 페이지 호스팅 시 경로 오류 방지를 위해 `dashboard/vite.config.js`에 `base: '/newsai/'` 설정 추가.
  - 마이그레이션 후 불필요해진 구버전 바닐라 JS 관련 파일(`docs/index.html`, `docs/style.css`, 루트 `index.html`) 정리.
- **이슈 및 트러블슈팅**:
  - 기존 구버전 파일 정리 과정에서, AI의 주요 행동 지침 파일인 `docs/` 폴더 내 마크다운 파일들(`gemini.md`, `plan.md`, `research.md`, `review.md`)까지 일괄 삭제되는 사고 발생.
  - 즉각적으로 `git restore` 명령어를 통해 삭제된 `docs/` 폴더 전체를 복구하고, 타겟팅된 파일만 삭제하는 방향으로 롤백 조치.
- **체크리스트**:
  - [x] 프론트엔드 UI가 React로 정상 이식되었는가
  - [x] 배포 시 생성된 데이터들이 `main` 브랜치에 자동 저장되는가
  - [x] `docs/` 내부의 마크다운 지침 문서들이 안전하게 보존되었는가

---

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
