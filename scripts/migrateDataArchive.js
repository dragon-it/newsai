import fs from "fs";
import path from "path";
import { migrateLegacyData, writeJsonArchive } from "../src/formatters/generateJson.js";

const workspaceRoot = process.cwd();
const reportsDirectory = path.join(workspaceRoot, "reports");
const archiveDirectory = path.join(workspaceRoot, "data", "reports");
const archiveIndexPath = path.join(workspaceRoot, "data", "index.json");
const legacyDataPath = path.join(workspaceRoot, "data.json");
const archiveStartDate = "2026-09-01";

function reportId(report) {
  if (report.id) return report.id;
  const match = String(report.reportDate ?? "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return match
    ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`
    : "";
}

function starCount(stars) {
  return (stars.match(/★/g) ?? []).length;
}

function parseMarkdownReport(fileName) {
  const dateMatch = fileName.match(/report-(\d{4})-(\d{2})-(\d{2})\.md$/);
  if (!dateMatch) return null;

  const markdown = fs.readFileSync(path.join(reportsDirectory, fileName), "utf8");
  const [, year, month, day] = dateMatch;
  const summaryScore = Number(
    markdown.match(/오늘의 요약 종합 점수:\s*(\d+)점/)?.[1] ?? 80,
  );
  const summary = markdown
    .match(/## 📝 오늘의 AI 뉴스 요약[^\n]*\r?\n([\s\S]*?)(?=\r?\n###|\r?\n---)/)?.[1]
    ?.trim() ?? "요약 정보가 없습니다.";

  const riskSection = markdown.match(
    /### ⚠️ 일자리 위험도 변동 요인 분석\r?\n([\s\S]*?)(?=\r?\n---)/,
  )?.[1] ?? "";
  const riskScoreBreakdown = Array.from(
    riskSection.matchAll(/^-\s*([+-])\s*(.+?)\s*\(([+-]?\d+)\)\s*$/gm),
    (match) => ({
      event: match[2].trim(),
      sign: match[1],
      impact: Math.abs(Number(match[3])),
      newsIndex: null,
    }),
  );

  const newsPattern = /\*\*(.+?)\*\*\s*-\s*\[링크\]\((.+?)\)\r?\n>\s*([^\r\n]+)(?:\r?\n>\s*-\s*중요도:\s*([★☆]+)\s*\|\s*AI 영향도:\s*([★☆]+)\s*\|\s*자동화 가능성:\s*([★☆]+)\s*\|\s*투자 영향:\s*([★☆]+))?/g;
  const news = Array.from(markdown.matchAll(newsPattern), (match) => {
    const title = match[1]
      .replace(/^\d{1,2}\/\d{1,2}\/\d{4}\s+/, "")
      .replace(/^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*/, "")
      .trim();
    return {
      pubDate: `${year}-${month}-${day}T00:00:00.000+09:00`,
      title,
      link: match[2].trim(),
      summary: match[3].trim(),
      importance: match[4] ? starCount(match[4]) : 3,
      aiImpact: match[5] ? starCount(match[5]) : 3,
      automationPotential: match[6] ? starCount(match[6]) : 3,
      investmentImpact: match[7] ? starCount(match[7]) : 3,
    };
  });

  return {
    lastUpdated: `${year}-${month}-${day}T00:00:00.000+09:00`,
    reportDate: `${year}. ${Number(month)}. ${Number(day)}.`,
    summary,
    summaryScore,
    dailyVelocity: 1.0,
    velocityReason: "Markdown 보관 리포트에서 복원된 과거 데이터입니다.",
    cumulativeRiskScore: 50,
    jobRiskScore: 50,
    riskScoreBreakdown,
    news,
  };
}

function readCurrentArchive() {
  if (!fs.existsSync(archiveIndexPath)) return [];
  const index = JSON.parse(fs.readFileSync(archiveIndexPath, "utf8"));
  return (index.reports ?? []).map((entry) => JSON.parse(
    fs.readFileSync(path.join(archiveDirectory, entry.fileName), "utf8"),
  ));
}

migrateLegacyData();
const reportsByDate = new Map(
  readCurrentArchive().map((report) => [report.reportDate, report]),
);

if (fs.existsSync(legacyDataPath)) {
  const legacyReports = JSON.parse(fs.readFileSync(legacyDataPath, "utf8"));
  (Array.isArray(legacyReports) ? legacyReports : [legacyReports]).forEach((report) => {
    if (report && !reportsByDate.has(report.reportDate)) {
      reportsByDate.set(report.reportDate, report);
    }
  });
}

const markdownFiles = fs.readdirSync(reportsDirectory)
  .filter((fileName) => /^report-\d{4}-\d{2}-\d{2}\.md$/.test(fileName));

markdownFiles.forEach((fileName) => {
  const report = parseMarkdownReport(fileName);
  const existingReport = report ? reportsByDate.get(report.reportDate) : null;
  if (report && (!existingReport || existingReport.news.length === 0)) {
    reportsByDate.set(report.reportDate, report);
  }
});

const history = Array.from(reportsByDate.values())
  .filter((report) => reportId(report) >= archiveStartDate)
  .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
writeJsonArchive(history);

const expectedFiles = new Set(history.map((report) => `${reportId(report)}.json`));
fs.readdirSync(archiveDirectory)
  .filter((fileName) => fileName.endsWith(".json") && !expectedFiles.has(fileName))
  .forEach((fileName) => fs.unlinkSync(path.join(archiveDirectory, fileName)));

const emptyNewsReports = history.filter((report) => report.news.length === 0).length;
console.log(`✅ ${archiveStartDate} 이후 ${history.length}개의 리포트를 JSON 아카이브로 변환했습니다.`);
if (emptyNewsReports > 0) {
  console.warn(`⚠️ 기사 목록을 복원하지 못한 리포트: ${emptyNewsReports}개`);
}
