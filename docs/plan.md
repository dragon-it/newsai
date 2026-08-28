# NewSai Implementation Plan

## Phase 1. 프로젝트 초기화

- [x] package.json 생성
- [x] src 디렉토리 구성
- [x] 환경 변수 세팅

## Phase 2. Discord Webhook

- [x] sendDiscord.js 구현
- [x] 텍스트 메시지 전송 테스트
- [x] 실패 메시지 처리
- [x] Discord 알림 텍스트 문구 개선 및 대시보드 마스크드 링크 연동

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
- [x] dashboard/ 빌드 오류 및 중복 상태 정의 구문 수정

## Phase 9. 통합 실행

- [x] index.js에서 전체 파이프라인 연결

## Phase 9. GitHub Actions

- [x] 매일 오전 7시 실행
- [x] 수동 실행 workflow_dispatch 추가
- [x] main 브랜치 push 이벤트 발생 시 자동 빌드 및 배포 트리거 추가
- [x] LLM 요약 JSON 파싱 불안정성 해결 (responseMimeType 및 responseSchema 적용)

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
- [x] 일일 요약의 AI 종합 점수(summaryScore) 및 배지 시각화 적용
- [x] 개별 뉴스 카드의 4대 지표(중요도, AI 영향도, 자동화 가능성, 투자 영향) 별점(★/☆) 분석 및 렌더링
- [x] 일자리 위험도 변동 요인(riskScoreBreakdown) 분석 결과 리스트 시각화
- [x] 대시보드 및 빌드 파이프라인에서 PDF 생성 및 다운로드 기능 제거
- [x] 일자리 위험도와 종합 AI 지수의 역할 구별 설명 추가
- [x] 어제 대비 위험도 변동 흐름(비교 수치 및 배지) 추가
- [x] 꺾은선 차트 클릭 시 해당 날짜 상세 위험 근거 및 변동 원인 연동 구현
- [x] 오늘의 핵심 변화 카드 영역 구현 및 원문 링크 연동(newsIndex 매핑) 추가
- [x] 이원화 지표 모델(Cumulative Level + Daily Velocity) 구축 및 대시보드 시각화 연동
- [x] 꺾은선 차트의 '일일 위험 가속도(Velocity)' 추이 파동 시각화 전환 및 누적 점수 천장 방지 스케일링(0.1pt) 적용

## Future Phase. 예정 개선 사항

- [ ] 일자리 위험도 급변 원인 뉴스 하이라이트 기능 (Key Driver Highlight)
- [ ] 키워드 검색 및 뉴스 카테고리 필터링 (Search & Filter)
- [ ] 주간/월간 일자리 위험도 종합 리포트 자동 발행 (Weekly/Monthly Summary)


