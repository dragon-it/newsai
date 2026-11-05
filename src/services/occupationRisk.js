import fs from "node:fs";
import path from "node:path";

export const occupationStages = ["기술 시연", "현장 도입", "고용 영향 확인"];

function dateId(value) {
  const match = String(value ?? "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : null;
}

function safeLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

// 최근 30일 보관 기사와 오늘 기사로 근거 자료 구성
export function buildOccupationContext(todayNews, { now = new Date(), root = process.cwd() } = {}) {
  const endDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const start = new Date(`${endDate}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 29);
  const startDate = start.toISOString().slice(0, 10);
  const history = new Map();
  const legacyPath = path.join(root, "data.json");
  if (fs.existsSync(legacyPath)) {
    const legacy = JSON.parse(fs.readFileSync(legacyPath, "utf8"));
    (Array.isArray(legacy) ? legacy : [legacy]).forEach((report) => {
      const id = dateId(report.reportDate);
      if (id) history.set(id, report);
    });
  }
  const archivePath = path.join(root, "data", "reports");
  if (fs.existsSync(archivePath)) {
    fs.readdirSync(archivePath).filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
      .filter((file) => file.slice(0, 10) >= startDate && file.slice(0, 10) <= endDate)
      .forEach((file) => history.set(file.slice(0, 10), JSON.parse(
        fs.readFileSync(path.join(archivePath, file), "utf8"),
      )));
  }

  const sources = [];
  const seenLinks = new Set();
  const seenTitles = new Set();
  const add = (news, reportDate, isToday) => {
    const link = safeLink(news.link);
    const title = String(news.title ?? "").trim().slice(0, 250);
    const titleKey = title.replace(/\s+/g, "").toLowerCase();
    if (!link || !title || seenLinks.has(link) || seenTitles.has(titleKey) || sources.length >= 100) return;
    seenLinks.add(link);
    seenTitles.add(titleKey);
    sources.push({ id: `article-${sources.length + 1}`, title, link, reportDate, isToday,
      summary: String(news.summary ?? "").slice(0, 400) });
  };
  todayNews.forEach((news) => add(news, endDate, true));
  [...history.entries()].filter(([id]) => id >= startDate && id < endDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([id, report]) => (report.news ?? []).forEach((news) => add(news, id, false)));

  return { startDate, endDate, articleCount: sources.length, sources };
}

// 미등록 기사 참조 제거 및 출처를 입력 자료에서 확정
export function validateOccupationRisks(items, context) {
  const sourceMap = new Map(context.sources.map((source) => [source.id, source]));
  const occupations = new Set();
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    if (!item || typeof item.occupation !== "string" || typeof item.reason !== "string") return [];
    const occupation = item.occupation.trim().slice(0, 100);
    const reason = item.reason.trim().slice(0, 1000);
    const tasks = Array.isArray(item.tasks) ? item.tasks
      .filter((task) => typeof task === "string" && task.trim())
      .slice(0, 5).map((task) => task.trim().slice(0, 150)) : [];
    const evidence = [...new Set(Array.isArray(item.evidenceIds) ? item.evidenceIds : [])]
      .map((id) => sourceMap.get(id)).filter(Boolean).slice(0, 5);
    if (!occupation || !reason || !tasks.length || !occupationStages.includes(item.stage)
      || !evidence.some((source) => source.isToday) || occupations.has(occupation)) return [];
    occupations.add(occupation);
    return [{ occupation, tasks, reason, stage: item.stage,
      evidence: evidence.map(({ id, title, link, reportDate }) => ({ id, title, link, reportDate })) }];
  }).slice(0, 5);
}
