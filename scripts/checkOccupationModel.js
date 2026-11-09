import fs from "node:fs";

process.env.GEMINI_MODEL = "gemini-3.5-flash-lite";
const { summarizeNews, modelName } = await import("../src/services/summarizeNews.js");

// 저장된 공개 기사로 구조화 응답 확인, 보고서 저장과 알림 발송 제외
const reports = JSON.parse(fs.readFileSync("data.json", "utf8"));
const report = Array.isArray(reports) ? reports[0] : reports;
try {
  const result = await summarizeNews(report.news);
  if (!Array.isArray(result.newsSummaries) || result.newsSummaries.length !== report.news.length
    || !Array.isArray(result.occupationRisks) || !Number.isFinite(result.dailyVelocity)) {
    throw new Error("응답 형식 검증 실패");
  }
  console.log(JSON.stringify({ model: modelName, newsCount: result.newsSummaries.length,
    occupationCount: result.occupationRisks.length, analysis: result.occupationAnalysis,
    occupations: result.occupationRisks.map((item) => ({ occupation: item.occupation,
      stage: item.stage, evidenceCount: item.evidence.length })) }, null, 2));
} catch (error) {
  // API 오류에 포함될 수 있는 키와 요청 주소 출력 제외
  console.error("모델 검증 실패:", error.status ?? error.name);
  process.exitCode = 1;
}
