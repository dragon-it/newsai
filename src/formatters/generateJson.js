import fs from "fs";
import path from "path";

export function generateJson(newsList, summary, jobRiskScore, summaryScore, riskScoreBreakdown, dailyVelocity, velocityReason) {
  const velocity = typeof dailyVelocity === "number" ? dailyVelocity : 1.2;

  const newData = {
    lastUpdated: new Date().toISOString(),
    reportDate: new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
    }),
    summary: summary,
    summaryScore: summaryScore ?? 80,
    dailyVelocity: velocity,
    velocityReason: velocityReason || "오늘의 AI 소식을 바탕으로 분석된 가속도입니다.",
    cumulativeRiskScore: 50,
    jobRiskScore: 50,
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
        if (item.cumulativeRiskScore === undefined) {
          item.cumulativeRiskScore = item.jobRiskScore ?? 50;
        }
        if (item.dailyVelocity === undefined) {
          item.dailyVelocity = 1.0;
        }
        if (item.velocityReason === undefined) {
          item.velocityReason = "지속적인 AI 성능 발전에 따른 완만한 위험 가속 상태입니다.";
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

  // 이전 날짜(오늘 날짜와 다른 가장 최근 리포트)의 누적 위험도 점수 가져오기
  const previousReport = history.find(
    (item) => item.reportDate !== newData.reportDate
  );
  const prevCumulative = previousReport?.cumulativeRiskScore ?? 50;

  // 오늘의 누적 점수 = 이전 누적 점수 + 오늘의 가속도 (0 ~ 100 제한, 소수점 첫째 자리)
  const computedCumulative = Math.max(0, Math.min(100, Math.round((prevCumulative + velocity) * 10) / 10));

  newData.cumulativeRiskScore = computedCumulative;
  newData.jobRiskScore = computedCumulative;

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
