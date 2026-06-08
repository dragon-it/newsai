/**
 * 수집된 뉴스 데이터와 LLM 요약본을 바탕으로 최종 Markdown 리포트를 생성합니다.
 *
 * @param {Array} newsList - fetchNews에서 반환된 뉴스 객체 배열
 * @param {string} summary - summarizeNews에서 반환된 한국어 요약문
 * @returns {string} 완성된 Markdown 문자열
 */
export function generateMarkdown(newsList, summary) {
  // 리포트 생성 날짜를 명시하여 문서의 시점(Context)을 제공합니다.
  const date = new Date().toISOString().split("T")[0];

  const markdown = [
    "# 🤖 NewSai AI 뉴스 리포트 (" + date + ")",
    "",
    "## 📝 오늘의 AI 뉴스 요약",
    summary,
    "",
    "---",
    "",
    "## 📰 주요 뉴스 목록 & 요약",
    newsList
      .map((news) => {
        const pubDateStr = new Date(news.pubDate).toLocaleDateString();
        return `**${pubDateStr} ${news.title}** - [링크](${news.link})\n> ${news.summary}\n`;
      })
      .join("\n"),
    "",
    "---",
    "*본 리포트는 NewSai 자동화 파이프라인에 의해 생성되었습니다.*",
  ].join("\n");

  return markdown.trim();
}
