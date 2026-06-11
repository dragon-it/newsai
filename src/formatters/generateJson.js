import fs from "fs";
import path from "path";

export function generateJson(newsList, summary) {
  const newData = {
    lastUpdated: new Date().toISOString(),
    reportDate: new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
    }),
    summary: summary,
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
    } catch (e) {
      console.error("기존 data.json을 읽을 수 없습니다. 새로 생성합니다.");
    }
  }

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
