/**
 * 뉴스 데이터와 요약본을 웹에서 사용하기 쉬운 JSON 형식으로 변환합니다.
 * 왜 하는가? 정적인 마크다운이나 PDF와 달리 JSON은 웹 대시보드에서 동적으로 데이터를 다루기에 최적화된 포맷이기 때문입니다.
 *
 * @param {Array} newsList - 수집된 뉴스 배열
 * @param {string} summary - AI 요약 결과
 * @returns {string} JSON 문자열
 */
export function generateJson(newsList, summary) {
  const data = {
    lastUpdated: new Date().toISOString(),
    reportDate: new Date().toLocaleDateString("ko-KR"),
    summary: summary,
    news: newsList,
  };

  // 가독성을 위해 2칸 들여쓰기를 적용하여 반환합니다.
  return JSON.stringify(data, null, 2);
}
