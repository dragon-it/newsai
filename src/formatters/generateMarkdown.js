/**
 * 수집한 뉴스와 LLM 요약으로 Markdown 리포트 생성
 *
 * @param {Array} newsList - fetchNews에서 반환된 뉴스 객체 배열
 * @param {string} summary - summarizeNews에서 반환된 한국어 요약문
 * @returns {string} 완성된 Markdown 문자열
 */
export function generateMarkdown(newsList, summary, overallScore, riskScoreBreakdown, occupationRisks = [], occupationAnalysis = null) {
  // 리포트 생성 날짜로 문서 기준 시점 표시
  const date = new Date().toISOString().split("T")[0];

  const scoreText = overallScore !== undefined ? ` (오늘의 요약 종합 점수: ${overallScore}점)` : "";

  // 위험도 변동 요인 텍스트 구성
  let breakdownText = "";
  if (riskScoreBreakdown && riskScoreBreakdown.length > 0) {
    const totalChange = riskScoreBreakdown.reduce(
      (acc, curr) => acc + (curr.sign === "-" ? -curr.impact : curr.impact),
      0
    );
    const totalSign = totalChange >= 0 ? "+" : "";

    breakdownText = [
      "",
      "### ⚠️ 일자리 위험도 변동 요인 분석",
      riskScoreBreakdown.map((item) => `- ${item.sign === "+" ? "+" : "-"} ${item.event} (${item.sign === "+" ? "+" : "-"}${item.impact})`).join("\n"),
      `- **총합: ${totalSign}${totalChange}**`,
      ""
    ].join("\n");
  }

  // 뉴스 아이템 별점 표시기 (RangeError 예방용 수치 제한 적용)
  const makeStars = (num) => {
    const cleanNum = Math.max(0, Math.min(5, Math.round(num ?? 3)));
    return "★".repeat(cleanNum) + "☆".repeat(5 - cleanNum);
  };

  const newsListText = newsList
    .map((news) => {
      const pubDateStr = new Date(news.pubDate).toLocaleDateString();
      const metricsText = news.importance !== undefined ? 
        `\n> - 중요도: ${makeStars(news.importance)} | AI 영향도: ${makeStars(news.aiImpact)} | 자동화 가능성: ${makeStars(news.automationPotential)} | 투자 영향: ${makeStars(news.investmentImpact)}` : "";
      return `**${pubDateStr} ${news.title}** - [링크](${news.link})\n> ${news.summary}${metricsText}\n`;
    })
    .join("\n");

  const occupationText = occupationAnalysis ? [
    "## 💼 최근 대체 위험이 주목되는 직업",
    `분석 기간: ${occupationAnalysis.startDate} ~ ${occupationAnalysis.endDate} · 참고 기사 ${occupationAnalysis.articleCount}개`,
    "뉴스에서 확인된 업무 변화에 대한 분석이며, 직업 전체의 소멸을 뜻하지 않습니다.",
    "",
    occupationRisks.length ? occupationRisks.map((item) => [
      `### ${item.occupation}`,
      `- 영향받는 업무: ${item.tasks.join(", ")}`,
      `- 관측 단계: ${item.stage}`,
      `- 선정 이유: ${item.reason}`,
      ...item.evidence.map((source) => `- 근거 기사: [${source.title}](${source.link}) (${source.reportDate})`),
    ].join("\n")).join("\n\n") : "오늘 기사에서 직업별 대체 위험을 선정할 충분한 근거가 확인되지 않았습니다.",
    "",
  ].join("\n") : "";

  const markdown = [
    "# 🤖 NewSai AI 뉴스 리포트 (" + date + ")",
    "",
    "## 📝 오늘의 AI 뉴스 요약" + scoreText,
    summary,
    breakdownText,
    occupationText,
    "---",
    "",
    "## 📰 주요 뉴스 목록 & 요약",
    newsListText,
    "",
    "---",
    "*본 리포트는 NewSai 자동화 파이프라인에 의해 생성되었습니다.*",
  ].join("\n");

  return markdown.trim();
}
