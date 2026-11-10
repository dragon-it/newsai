import fs from "node:fs";
import { writeJsonArchive } from "../src/formatters/generateJson.js";

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
  if (process.argv.includes("--save-occupation-analysis")) {
    const index = JSON.parse(fs.readFileSync("data/index.json", "utf8"));
    const history = index.reports.map((entry) => JSON.parse(fs.readFileSync(`data/reports/${entry.fileName}`, "utf8")));
    const target = history.find((item) => item.reportDate === report.reportDate);
    if (!target) throw new Error("분석 대상 리포트가 아카이브에 없음");
    target.occupationRisks = result.occupationRisks;
    target.occupationAnalysis = result.occupationAnalysis;
    writeJsonArchive(history);
    console.log("직업별 분석만 최신 리포트에 저장 완료");
  }
} catch (error) {
  // API 오류에 포함될 수 있는 키와 요청 주소 출력 제외
  console.error("모델 검증 실패:", error.status ?? error.name);
  process.exitCode = 1;
}
