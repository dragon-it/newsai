import fs from "fs";
import path from "path";
import { buildOccupationTracking } from "../../shared/occupationTracking.js";

const archiveRoot = path.join(process.cwd(), "data");
const reportsRoot = path.join(archiveRoot, "reports");
const indexPath = path.join(archiveRoot, "index.json");
const legacyDataPath = path.join(process.cwd(), "data.json");

function reportDateToFileName(reportDate) {
  const match = String(reportDate ?? "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!match) throw new Error(`지원하지 않는 리포트 날짜 형식입니다: ${reportDate}`);
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}.json`;
}

function reportDateToId(reportDate) {
  return reportDateToFileName(reportDate).replace(/\.json$/, "");
}

function migrateReportDefaults(item) {
  const report = { ...item };
  if (!report.restoredFromMarkdown) {
    report.cumulativeRiskScore ??= report.jobRiskScore ?? 50;
    report.jobRiskScore ??= report.cumulativeRiskScore;
    report.dailyVelocity ??= 1.0;
  }
  report.velocityReason ??= "지속적인 AI 성능 발전에 따른 완만한 위험 가속 상태입니다.";
  report.summaryScore ??= 80;
  report.riskScoreBreakdown ??= [];
  report.news = Array.isArray(report.news) ? report.news.map((newsItem) => ({
    ...newsItem,
    importance: newsItem.importance ?? 3,
    aiImpact: newsItem.aiImpact ?? 3,
    automationPotential: newsItem.automationPotential ?? 3,
    investmentImpact: newsItem.investmentImpact ?? 3,
  })) : [];
  return report;
}

function readArchiveHistory() {
  if (fs.existsSync(indexPath)) {
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      const entries = Array.isArray(index) ? index : index.reports;
      if (Array.isArray(entries)) {
        return entries.map((entry) => {
          const fileName = entry.fileName ?? reportDateToFileName(entry.reportDate);
          const reportPath = path.join(reportsRoot, fileName);
          return fs.existsSync(reportPath)
            ? migrateReportDefaults(JSON.parse(fs.readFileSync(reportPath, "utf8")))
            : null;
        }).filter(Boolean);
      }
    } catch (error) {
      console.error("기존 JSON 아카이브를 읽을 수 없어 data.json으로 복구합니다:", error.message);
    }
  }

  if (!fs.existsSync(legacyDataPath)) return [];
  const legacy = JSON.parse(fs.readFileSync(legacyDataPath, "utf8"));
  const reports = Array.isArray(legacy) ? legacy : [legacy];
  return reports.filter(Boolean).map(migrateReportDefaults);
}

export function writeJsonArchive(history) {
  fs.mkdirSync(reportsRoot, { recursive: true });

  const indexReports = history.map((report) => {
    const fileName = reportDateToFileName(report.reportDate);
    const storedReport = { ...report, id: report.id ?? reportDateToId(report.reportDate) };
    fs.writeFileSync(
      path.join(reportsRoot, fileName),
      JSON.stringify(storedReport, null, 2),
      "utf8",
    );

    const metadata = { ...storedReport };
    delete metadata.news;
    return { ...metadata, fileName };
  });

  const index = {
    version: 1,
    updatedAt: new Date().toISOString(),
    reports: indexReports,
    occupationTracking: buildOccupationTracking(history),
  };
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf8");
  return index;
}

export function migrateLegacyData() {
  const history = readArchiveHistory();
  writeJsonArchive(history);
  return history.length;
}

export function generateJson(newsList, summary, jobRiskScore, summaryScore, riskScoreBreakdown, dailyVelocity, velocityReason, occupationRisks = [], occupationAnalysis = null) {
  const velocity = typeof dailyVelocity === "number" ? dailyVelocity : 1.2;
  const newData = migrateReportDefaults({
    lastUpdated: new Date().toISOString(),
    reportDate: new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }),
    summary,
    summaryScore: summaryScore ?? 80,
    dailyVelocity: velocity,
    velocityReason: velocityReason || "오늘의 AI 소식을 바탕으로 분석된 가속도입니다.",
    cumulativeRiskScore: 50,
    jobRiskScore: jobRiskScore ?? 50,
    riskScoreBreakdown: riskScoreBreakdown ?? [],
    news: newsList,
    occupationRisks,
    occupationAnalysis,
  });

  const history = readArchiveHistory();
  const previousReport = history.find((item) => item.reportDate !== newData.reportDate);
  const previousCumulative = previousReport?.cumulativeRiskScore ?? 50.0;
  const cumulative = Math.max(
    0,
    Math.min(100, Math.round((previousCumulative + velocity * 0.1) * 10) / 10),
  );
  newData.cumulativeRiskScore = cumulative;
  newData.jobRiskScore = cumulative;

  const existingIndex = history.findIndex((item) => item.reportDate === newData.reportDate);
  if (existingIndex === -1) history.unshift(newData);
  else history[existingIndex] = newData;

  writeJsonArchive(history);

  // 이전 배포 호환용 최근 30일 데이터를 data.json에 유지
  return JSON.stringify(history.slice(0, 30), null, 2);
}
