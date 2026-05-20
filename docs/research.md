# NewSai Research

## 프로젝트 목표

NewSai는 매일 AI 뉴스를 수집하고 LLM으로 요약한 뒤 Markdown/PDF 리포트를 생성하여 웹페이지로 시각화하고, 최종적으로 Discord로 전송하는 자동화 파이프라인이다.

## 목표 파이프라인

뉴스 수집 → LLM 요약 → Markdown/PDF 생성 → 웹페이지 게시 → Discord Webhook 전송

## 스택 선정 이유

- Node.js: 비동기 I/O 처리에 강점이 있어 외부 API 통신(OpenAI, Discord) 및 웹 스크래핑 위주의 파이프라인에 매우 적합함.
- axios: Promise 기반의 HTTP 클라이언트로 직관적인 API와 에러 처리 용이성을 위해 선택.
- rss-parser: 복잡한 XML 파싱을 자체 구현하지 않고, 검증된 라이브러리를 통해 안정적으로 RSS 데이터를 추출하기 위함.
- cheerio: 가벼운 HTML 파싱 라이브러리로, 필요 시 기사 본문 일부를 추출할 때 Puppeteer보다 서버 리소스를 적게 소모함.
- OpenAI API: 우수한 자연어 처리 능력을 통해 원문 뉴스의 핵심을 정확하게 한국어로 요약하기 위해 채택.
- puppeteer: 생성된 Markdown/HTML 리포트를 렌더링하여 깔끔한 포맷의 PDF로 출력하기 위한 헤드리스 브라우저 제어 도구.
- Discord Webhook: 별도의 봇 서버 구축이나 복잡한 인증 없이, 단순 REST API 호출만으로 간편하게 알림 및 리포트를 전송할 수 있음.
- GitHub Actions: 서버 유지비 없이 Cron 기반 스케줄링이 가능하며, 코드 관리, 파이프라인 자동화, 웹페이지 배포(GitHub Pages)를 한 곳에서 처리할 수 있음.

## 데이터 수집 전략

MVP에서는 Google News RSS를 사용한다.
HTML 크롤링은 구조 변경과 정책 리스크가 있어 제외한다.

## 보안 고려사항

- API Key는 .env에 저장
- .env는 Git에 올리지 않음
- .env.example만 공유
- Discord Webhook URL 노출 금지

## 리스크

- RSS 구조 변경 가능성
- LLM 비용 발생
- PDF 생성 실패 가능성
- GitHub Actions 환경 차이
- Discord 첨부 용량 제한

## MVP 범위

- AI 뉴스 5개 수집
- 한국어 요약
- Markdown 생성
- PDF 생성
- 웹페이지 표시
- Discord 전송
- 실패 알림
