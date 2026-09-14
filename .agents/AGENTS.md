# NewSai Project Rules

## 📜 AI 개발 원칙 및 문서 관리 제약 조건
에이전트는 이 프로젝트 내에서 코드를 수정하거나 새로운 기능을 개발할 때 다음 규칙을 항상 준수해야 합니다.

1. **문서 동기화 필수**: 새로운 페이즈나 기능을 구현 완료할 때마다, 최종 완료 보고 전 다음 문서들을 반드시 직접 업데이트해야 합니다.
   - [review.md](file:///c:/Users/user/Desktop/newsai/newsai/docs/review.md): 최상단에 코드 리뷰 기록(검토 대상, 구현 내용, 이슈/트러블슈팅, 체크리스트) 누적 추가. (※ '검토 대상'에 나열하는 파일들은 에디터/미리보기에서 클릭 시 즉시 열릴 수 있도록 마크다운 상대 경로 링크 `[`경로`](상대경로)` 형식으로 작성)
   - [plan.md](file:///c:/Users/user/Desktop/newsai/newsai/docs/plan.md): 진행 상황에 맞춰 태스크 체크박스(`[x]`) 갱신 및 신규 단계 추가 시 체크박스 등록.
2. **태스크 목록 구성**: 요구사항 구현 시 [task.md](file:///c:/Users/user/Desktop/newsai/newsai/docs/plan.md)를 구성할 때, 위 문서 업데이트 단계를 마지막 필수 태스크로 할당하여 체크 누락을 예방하십시오.
