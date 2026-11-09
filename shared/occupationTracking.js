function occupationId(name) {
  return String(name ?? "").normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}

function reportId(report) {
  const match = String(report.reportDate ?? "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}` : null;
}

// 날짜별 분석 원본에서 직업별 이력 구성, 같은 날짜 재실행 결과는 한 번만 반영
export function buildOccupationTracking(reports) {
  const byDate = new Map();
  for (const report of reports) {
    const date = reportId(report);
    if (date) byDate.set(date, report);
  }
  const occupations = new Map();
  for (const [date, report] of [...byDate].sort(([a], [b]) => a.localeCompare(b))) {
    for (const risk of report.occupationRisks ?? []) {
      const id = occupationId(risk.occupation);
      if (!id || !risk.evidence?.length) continue;
      const previous = occupations.get(id);
      const evidence = [...(previous?.evidence ?? [])];
      for (const source of risk.evidence) {
        if (!evidence.some((item) => item.link === source.link
          || item.title.replace(/\s+/g, "") === source.title.replace(/\s+/g, ""))) evidence.push({ ...source });
      }
      const evidenceDates = evidence.map((source) => source.reportDate).filter(Boolean).sort();
      occupations.set(id, {
        id, occupation: risk.occupation,
        tasks: [...new Set([...(previous?.tasks ?? []), ...risk.tasks])],
        reason: risk.reason, stage: risk.stage,
        firstObserved: previous?.firstObserved ?? date, lastObserved: date,
        lastEvidenceDate: evidenceDates.at(-1) ?? date,
        evidence,
        observations: [...(previous?.observations ?? []), {
          date, stage: risk.stage, reason: risk.reason, tasks: risk.tasks, evidence: risk.evidence,
        }],
      });
    }
  }
  return [...occupations.values()].sort((a, b) => b.lastEvidenceDate.localeCompare(a.lastEvidenceDate)
    || b.lastObserved.localeCompare(a.lastObserved) || a.id.localeCompare(b.id));
}

export function hasRecentOccupationEvidence(item, referenceDate) {
  const difference = Date.parse(`${referenceDate}T00:00:00Z`) - Date.parse(`${item.lastEvidenceDate}T00:00:00Z`);
  return difference >= 0 && difference < 30 * 86400000;
}
