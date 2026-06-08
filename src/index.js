import path from "path";
import { fetchAINews } from "./services/fetchNews.js";
import { summarizeNews } from "./services/summarizeNews.js";
import { generateMarkdown } from "./formatters/generateMarkdown.js";
import { generateJson } from "./formatters/generateJson.js";
import { generatePdf } from "./formatters/generatePdf.js";
import { sendDiscordMessage } from "./notifications/sendDiscord.js";
import { saveToFile } from "./utils/fileSystem.js";

async function main() {
  console.log("🚀 NewSai 자동화 파이프라인 시작...");

  try {
    // 1. 뉴스 수집
    console.log("\n🔄 [1/5] AI 관련 뉴스 수집 중...");
    const newsList = await fetchAINews();
    console.log("✅ " + newsList.length + "개의 뉴스 수집 완료.");

    // 2. 뉴스 요약
    console.log("\n🔄 [2/5] LLM 기반 뉴스 요약 중...");
    const summaryData = await summarizeNews(newsList);
    
    // 개별 요약 결과를 newsList에 병합
    newsList.forEach(news => {
      if (summaryData.newsSummaries) {
        const matched = summaryData.newsSummaries.find(ns => ns.title === news.title);
        news.summary = matched ? matched.summary : "요약 없음";
      } else {
        news.summary = "요약 없음";
      }
    });
    const summary = summaryData.overallSummary || summaryData;

    console.log("✅ 요약 생성 완료.");

    // 3. 마크다운 및 JSON 생성
    console.log("\n🔄 [3/5] 데이터 포맷팅 및 파일 저장 중...");
    const date = new Date().toISOString().split("T")[0];
    const reportsDir = path.join(process.cwd(), "reports");

    const markdownReport = generateMarkdown(newsList, summary);
    const mdPath = saveToFile(reportsDir, "report-" + date + ".md", markdownReport);
    console.log("💾 Markdown 저장 완료: " + mdPath);

    const jsonReport = generateJson(newsList, summary);
    const jsonPath = saveToFile(process.cwd(), "data.json", jsonReport);
    console.log("💾 JSON 저장 완료: " + jsonPath);

    // 4. PDF 생성
    console.log("\n🔄 [4/5] PDF 리포트 생성 중...");
    const pdfPath = path.join(reportsDir, "report-" + date + ".pdf");
    await generatePdf(markdownReport, pdfPath);
    console.log("💾 PDF 저장 완료: " + pdfPath);

    // 5. Discord 알림 전송
    console.log("\n🔄 [5/5] Discord 알림 전송 중...");
    const discordMessage = "🚀 **NewSai 일일 AI 리포트 (" + date + ")** 🚀\n\n" + summary + "\n\n상세 내용은 첨부된 파일을 확인하거나 대시보드에 접속하세요.";
    await sendDiscordMessage(discordMessage);
    
    console.log("\n✨ 모든 파이프라인이 성공적으로 완료되었습니다!");

  } catch (error) {
    console.error("\n❌ 파이프라인 실행 중 치명적 오류 발생:", error.message);
    process.exit(1);
  }
}

main();
