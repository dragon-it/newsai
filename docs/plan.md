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
- [x] title, link, 정규화

## Phase 4. LLM 요약

- [x] summarizeNews.js 구현
- [x] 뉴스 목록 기반 프롬프트 생성
- [x] 한국어 요약 결과 반환

## Phase 5. Markdown 생성

- [x] generateMarkdown.js 구현
- [x] 날짜, 요약, 뉴스 목록 포함
- [x] 마크다운 파일 저장 (아카이빙) 로직 추가

## Phase 6. PDF 생성

- [x] generatePdf.js 구현
- [x] Markdown 또는 HTML 기반 PDF 생성

## Phase 7. 데이터 내보내기 및 웹페이지 게시

- [x] 뉴스 데이터를 JSON 형식으로 저장 (data.json)
- [x] 웹 리포트 템플릿(Vanilla HTML/CSS) 작성
- [x] 결과물 웹 호스팅 연동 (GitHub Pages)

## Phase 8. (Optional) 리액트 대시보드 확장

- [x] dashboard/ 폴더에 React 프로젝트 구조 분리 및 대시보드 구축

## Phase 9. 통합 실행

- [x] index.js에서 전체 파이프라인 연결

## Phase 9. GitHub Actions

- [x] 매일 오전 7시 실행
- [x] 수동 실행 workflow_dispatch 추가

## 테스트 체크리스트

- [x] Discord 메시지 전송 확인
- [x] RSS 수집 결과 확인
- [x] LLM 응답 확인
- [x] Markdown 파일 생성 확인
- [x] PDF 파일 생성 확인
- [x] Actions 실행 확인

## Phase 10. 추가 개선 및 시각화 기능 확장

- [x] LLM 기반 일자리 위험도(jobRiskScore) 추출 적용
- [x] 기존 과거 데이터에 대한 위험도 점수 1회성 마이그레이션 구현
- [x] PDF 복사 자동화로 다운로드 404 에러 수정
- [x] 오늘의 위험도 반원 게이지 차트(SVG) 및 트렌드 꺾은선 차트(SVG) 구현
- [x] 지난 뉴스 목록 3일 단위 접기(아코디언) 및 무한스크롤 전환

## Future Phase. 예정 개선 사항

- [ ] 일자리 위험도 급변 원인 뉴스 하이라이트 기능 (Key Driver Highlight)
- [ ] 키워드 검색 및 뉴스 카테고리 필터링 (Search & Filter)
- [ ] 주간/월간 일자리 위험도 종합 리포트 자동 발행 (Weekly/Monthly Summary)


