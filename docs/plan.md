# NewSai Implementation Plan

## Phase 1. 프로젝트 초기화

- [x] package.json 생성
- [x] src 디렉토리 구성
- [x] 환경 변수 세팅

## Phase 2. Discord Webhook

- [x] sendDiscord.js 구현
- [x] 텍스트 메시지 전송 테스트
- [x] 실패 메시지 처리

## Phase 3. 뉴스 수집

- [x] fetchNews.js 구현
- [x] Google News RSS에서 AI 뉴스 5개 수집
- [x] title, link, pubDate 정규화

## Phase 4. LLM 요약

- [x] summarizeNews.js 구현
- [x] 뉴스 목록 기반 프롬프트 생성
- [x] 한국어 요약 결과 반환

## Phase 5. Markdown 생성

- [ ] generateMarkdown.js 구현
- [ ] 날짜, 요약, 뉴스 목록 포함

## Phase 6. PDF 생성

- [ ] generatePdf.js 구현
- [ ] Markdown 또는 HTML 기반 PDF 생성

## Phase 7. 데이터 내보내기 및 웹페이지 게시

- [ ] 뉴스 데이터를 JSON 형식으로 저장 (data.json)
- [x] 웹 리포트 템플릿(Vanilla HTML/CSS) 작성
- [ ] 결과물 웹 호스팅 연동 (GitHub Pages)

## Phase 8. (Optional) 리액트 대시보드 확장

- [ ] React를 사용하여 data.json을 시각화하는 대시보드 구축

## Phase 9. 통합 실행

- [ ] index.js에서 전체 파이프라인 연결

## Phase 9. GitHub Actions

- [ ] 매일 오전 7시 실행
- [ ] 수동 실행 workflow_dispatch 추가

## 테스트 체크리스트

- [ ] Discord 메시지 전송 확인
- [ ] RSS 수집 결과 확인
- [ ] LLM 응답 확인
- [ ] Markdown 파일 생성 확인
- [ ] PDF 파일 생성 확인
- [ ] Actions 실행 확인
