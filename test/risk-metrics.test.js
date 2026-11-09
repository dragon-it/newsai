import test from "node:test";
import assert from "node:assert/strict";
import { getRiskChange, formatRiskChange } from "../dashboard/src/services/riskMetrics.js";

test("내부 평가 점수와 별개로 전날 누적 지수의 실제 증감 표시", () => {
  const history = [
    { reportDate: "2026. 9. 9.", cumulativeRiskScore: 52.3, dailyVelocity: 1.2 },
    { reportDate: "2026. 9. 8.", cumulativeRiskScore: 52.2, dailyVelocity: 0.3 },
    { reportDate: "2026. 9. 7.", cumulativeRiskScore: 52.2 },
  ];
  assert.equal(getRiskChange(history[0], history), 0.1);
  assert.equal(formatRiskChange(getRiskChange(history[0], history)), "+0.1점");
  assert.equal(formatRiskChange(getRiskChange(history[1], history)), "0.0점");
  assert.equal(getRiskChange(history[2], history), null);
});

test("날짜 누락은 추정하지 않고 월·연도 경계와 0점, 하락 처리", () => {
  const history = [
    { reportDate: "2027. 1. 1.", cumulativeRiskScore: 0 },
    { reportDate: "2026. 12. 31.", cumulativeRiskScore: 0.2 },
    { reportDate: "2026. 12. 29.", cumulativeRiskScore: 0.1 },
  ];
  assert.equal(formatRiskChange(getRiskChange(history[0], history)), "-0.2점");
  assert.equal(formatRiskChange(getRiskChange(history[1], history)), "전날 자료 없음");
});
