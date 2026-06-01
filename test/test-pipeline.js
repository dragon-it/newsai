import path from "path";
import { fetchAINews } from "../src/fetchNews.js";
import { summarizeNews } from "../src/summarizeNews.js";
import { generateMarkdown } from "../src/generateMarkdown.js";
import { saveToFile } from "../src/utils/fileSystem.js";

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

    // [공통 유틸리티를 사용한 파일 저장]
    const date = new Date().toISOString().split("T")[0];
    const reportsDir = path.join(process.cwd(), "reports");
    const fileName = `report-${date}.md`;

    const filePath = saveToFile(reportsDir, fileName, report);

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
