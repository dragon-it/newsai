import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildOccupationContext, validateOccupationRisks } from "../src/services/occupationRisk.js";
import { generateMarkdown } from "../src/formatters/generateMarkdown.js";

test("최근 30일 자료 선택, 중복 제거 및 위험한 링크 제외", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "newsai-context-"));
  try {
    fs.writeFileSync(path.join(root, "data.json"), JSON.stringify([
      { reportDate: "2026. 11. 4.", news: [
        { title: "오늘과 중복", link: "https://example.com/today" },
        { title: "과거 도입", link: "https://example.com/past", summary: "확인된 도입" },
      ] },
      { reportDate: "2026. 10. 7.", news: [{ title: "기간 시작", link: "https://example.com/start" }] },
      { reportDate: "2026. 10. 6.", news: [{ title: "기간 밖", link: "https://example.com/old" }] },
      { reportDate: "2026. 11. 6.", news: [{ title: "미래", link: "https://example.com/future" }] },
    ]));
    const context = buildOccupationContext([
      { title: "오늘", link: "https://example.com/today" },
      { title: "잘못된 링크", link: "javascript:alert(1)" },
    ], { root, now: new Date("2026-11-05T12:00:00+09:00") });
    assert.equal(context.startDate, "2026-10-07");
    assert.equal(context.articleCount, 3);
    assert.equal(context.sources[0].isToday, true);
    assert.deepEqual(context.sources.map((source) => source.title), ["오늘", "과거 도입", "기간 시작"]);
  } finally {
    fs.rmSync(root, { recursive: true });
  }
});

test("미등록 출처, 과거 기사만 있는 항목, 잘못된 단계 및 중복 직업 제외", () => {
  const context = { sources: [
    { id: "today", title: "오늘 기사", link: "https://example.com/today", reportDate: "2026-11-05", isToday: true },
    { id: "past", title: "과거 기사", link: "https://example.com/past", reportDate: "2026-11-04", isToday: false },
  ] };
  const item = { occupation: "상담원", tasks: ["반복 문의"], reason: "도입 확인", stage: "현장 도입", evidenceIds: ["today", "fake"] };
  const result = validateOccupationRisks([
    item, item,
    { ...item, occupation: "번역가", evidenceIds: ["past"] },
    { ...item, occupation: "개발자", stage: "완전 소멸" },
    { ...item, occupation: "디자이너", evidenceIds: ["fake"] },
  ], context);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].evidence.map((source) => source.id), ["today"]);
  const markdown = generateMarkdown([], "요약", 80, [], result,
    { startDate: "2026-10-07", endDate: "2026-11-05", articleCount: 2 });
  assert.match(markdown, /상담원/);
  assert.match(markdown, /https:\/\/example.com\/today/);
  assert.equal(validateOccupationRisks(null, context).length, 0);
});

test("직업 분석을 날짜별 JSON과 인덱스에 보존하고 기존 호출 형식 지원", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "newsai-archive-test-"));
  const previousDirectory = process.cwd();
  try {
    process.chdir(root);
    const { generateJson } = await import("../src/formatters/generateJson.js");
    const risks = [{ occupation: "상담원", tasks: ["반복 문의"], reason: "도입 확인", stage: "현장 도입", evidence: [] }];
    const analysis = { startDate: "2026-10-08", endDate: "2026-11-06", articleCount: 5 };
    const legacy = JSON.parse(generateJson([], "요약", 50, 80, [], 1, "근거", risks, analysis));
    assert.deepEqual(legacy[0].occupationRisks, risks);
    const index = JSON.parse(fs.readFileSync(path.join(root, "data", "index.json"), "utf8"));
    const report = JSON.parse(fs.readFileSync(path.join(root, "data", "reports", index.reports[0].fileName), "utf8"));
    assert.deepEqual(report.occupationRisks, risks);
    assert.deepEqual(report.occupationAnalysis, analysis);
    assert.deepEqual(index.reports[0].occupationAnalysis, analysis);
    const oldCall = JSON.parse(generateJson([], "요약", 50, 80, [], 1, "근거"));
    assert.deepEqual(oldCall[0].occupationRisks, []);
    assert.equal(oldCall[0].occupationAnalysis, null);
  } finally {
    process.chdir(previousDirectory);
    fs.rmSync(root, { recursive: true });
  }
});
