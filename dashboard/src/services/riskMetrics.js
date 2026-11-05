function dateValue(reportDate) {
  const match = String(reportDate ?? "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : NaN;
}

// 전날 리포트의 누적 지수와 비교, 날짜 누락 시 변화량 추정 제외
export function getRiskChange(report, history) {
  const previousDate = dateValue(report.reportDate) - 86400000;
  const previous = history.find((item) => dateValue(item.reportDate) === previousDate);
  const score = report.cumulativeRiskScore ?? report.jobRiskScore;
  const previousScore = previous?.cumulativeRiskScore ?? previous?.jobRiskScore;
  return Number.isFinite(score) && Number.isFinite(previousScore)
    ? Math.round((score - previousScore) * 10) / 10
    : null;
}

export function formatRiskChange(change) {
  return change === null ? "전날 자료 없음" : `${change > 0 ? "+" : ""}${change.toFixed(1)}점`;
}
