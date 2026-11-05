import test from "node:test";
import assert from "node:assert/strict";
import { buildOccupationTracking, hasRecentOccupationEvidence } from "../shared/occupationTracking.js";

const source = (date, title, link) => ({ id: "article-1", reportDate: date, title, link });
const observation = (occupation, stage, evidence) => ({ occupation, stage, evidence,
  tasks: ["반복 상담"], reason: "기사에서 확인한 근거" });

test("관측 기록 유지, 반복 기사 중복 제외, 새로운 근거 우선 정렬", () => {
  const oldSource = source("2026-09-01", "기술 발표", "https://example.com/1");
  const newSource = source("2026-11-06", "도입 사례", "https://example.com/2");
  const reports = [
    { reportDate: "2026. 11. 7.", occupationRisks: [] },
    { reportDate: "2026. 9. 1.", occupationRisks: [observation("상담원", "기술 시연", [oldSource]),
      observation("번역가", "기술 시연", [oldSource])] },
    { reportDate: "2026. 11. 6.", occupationRisks: [observation("상 담 원", "현장 도입", [oldSource, newSource])] },
  ];
  const result = buildOccupationTracking(reports);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "상담원");
  assert.equal(result[0].evidence.length, 2);
  assert.equal(result[0].firstObserved, "2026-09-01");
  assert.equal(result[0].lastObserved, "2026-11-06");
  assert.equal(result[0].stage, "현장 도입");
  assert.equal(result[0].observations.length, 2);
  assert.equal(hasRecentOccupationEvidence(result[0], "2026-11-07"), true);
  assert.equal(hasRecentOccupationEvidence(result[1], "2026-11-07"), false);
});

test("동일 날짜 갱신과 완화 관측은 최신 상태로 반영", () => {
  const evidence = [source("2026-11-06", "도입 재검토", "https://example.com/a")];
  const result = buildOccupationTracking([
    { reportDate: "2026. 11. 5.", occupationRisks: [observation("상담원", "고용 영향 확인", evidence)] },
    { reportDate: "2026. 11. 6.", occupationRisks: [observation("상담원", "현장 도입", evidence)] },
    { reportDate: "2026. 11. 6.", occupationRisks: [observation("상담원", "기술 시연", evidence)] },
  ]);
  assert.equal(result[0].observations.length, 2);
  assert.equal(result[0].stage, "기술 시연");
  assert.equal(result[0].evidence.length, 1);
  assert.equal(hasRecentOccupationEvidence(result[0], "2026-12-06"), false);
});
