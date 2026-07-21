import fs from "fs";
import path from "path";

export function generateJson(newsList, summary, jobRiskScore, summaryScore, riskScoreBreakdown) {
  const newData = {
    lastUpdated: new Date().toISOString(),
    reportDate: new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
    }),
    summary: summary,
    summaryScore: summaryScore ?? 80,
    jobRiskScore: jobRiskScore ?? 50,
    riskScoreBreakdown: riskScoreBreakdown ?? [],
    news: newsList,
  };

  const dataPath = path.join(process.cwd(), "data.json");
  let history = [];

  if (fs.existsSync(dataPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      if (Array.isArray(existingData)) {
        history = existingData;
      } else if (existingData && existingData.lastUpdated) {
        history = [existingData];
      }

      // 과거 데이터 마이그레이션 적용
      history.forEach((item) => {
        if (item.jobRiskScore === undefined) {
          item.jobRiskScore = Math.floor(Math.random() * 21) + 45;
        }
        if (item.summaryScore === undefined) {
          item.summaryScore = Math.floor(Math.random() * 21) + 70;
        }
        if (item.riskScoreBreakdown === undefined) {
          item.riskScoreBreakdown = [];
        }
        if (item.news && Array.isArray(item.news)) {
          item.news.forEach((newsItem) => {
            if (newsItem.importance === undefined) newsItem.importance = 3;
            if (newsItem.aiImpact === undefined) newsItem.aiImpact = 3;
            if (newsItem.automationPotential === undefined) newsItem.automationPotential = 3;
            if (newsItem.investmentImpact === undefined) newsItem.investmentImpact = 3;
          });
        }
      });
    } catch (e) {
      console.error("기존 data.json을 읽을 수 없습니다. 새로 생성합니다.");
    }
  }

  // 이전 날짜(오늘 날짜와 다른 가장 최근 리포트)의 위험도 점수 가져오기
  const previousReport = history.find(
    (item) => item.reportDate !== newData.reportDate
  );
  const baseScore = previousReport?.jobRiskScore ?? jobRiskScore ?? 50;

  // 변동치 합산 계산
  const breakdownSum = (riskScoreBreakdown ?? []).reduce(
    (acc, curr) => acc + (curr.sign === "-" ? -curr.impact : curr.impact),
    0
  );

  // 오늘의 점수 = 이전 점수 + 변동치 합산 (0 ~ 100 제한)
  newData.jobRiskScore = Math.max(0, Math.min(100, baseScore + breakdownSum));

  const existingIndex = history.findIndex(
    (item) => item.reportDate === newData.reportDate,
  );
  if (existingIndex !== -1) {
    history[existingIndex] = newData;
  } else {
    history.unshift(newData);
  }

  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  return JSON.stringify(history, null, 2);
}
