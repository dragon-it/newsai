import fs from "fs";
import path from "path";
import { fetchAINews } from "./src/fetchNews.js";
import { summarizeNews } from "./src/summarizeNews.js";
import { generateMarkdown } from "./src/generateMarkdown.js";

/**
 * 수집, 요약, 마크다운 생성을 하나로 연결하는 통합 테스트 함수입니다.
 * 왜 하는가? 개별 모듈이 잘 작동하더라도 서로 데이터를 주고받을 때 데이터 형식이 맞는지 확인하기 위함입니다.
 */
async function runIntegrationTest() {
  console.log("🔄 [1/3] 뉴스 수집 시작...");
  try {
    const newsList = await fetchAINews();
    console.log(`✅ 뉴스 ${newsList.length}개 수집 완료.`);

    console.log("🔄 [2/3] LLM 요약 진행 중 (Gemini)...");
    const summary = await summarizeNews(newsList);
    console.log("✅ 요약 생성 완료.");

    console.log("🔄 [3/3] 마크다운 리포트 생성 중...");
    const report = generateMarkdown(newsList, summary);

    // [파일 저장 로직]
    // 왜 하는가? 터미널 출력은 일회성이므로, 파일로 저장해야 나중에 과거 리포트를 찾아볼 수 있습니다.
    const date = new Date().toISOString().split("T")[0];
    const reportsDir = path.join(process.cwd(), "reports");

    // reports 폴더가 없으면 자동으로 생성합니다.
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, `report-${date}.md`);
    fs.writeFileSync(filePath, report, "utf8");

    console.log("\n============================================");
    console.log(report);
    console.log("============================================\n");
    console.log(`💾 리포트 저장 완료: ${filePath}`);
    console.log("✨ 통합 파이프라인 테스트가 성공적으로 끝났습니다!");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error.message);
  }
}

runIntegrationTest();
