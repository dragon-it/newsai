import { fetchAINews } from "../src/fetchNews.js";

async function runTest() {
  console.log("🔍 AI 뉴스 수집 테스트를 시작합니다...\n");

  try {
    const newsItems = await fetchAINews();

    console.log(
      `✅ 총 ${newsItems.length}개의 뉴스를 성공적으로 가져왔습니다.\n`,
    );

    newsItems.forEach((item, index) => {
      console.log(`[${index + 1}] ${item.title}`);
      console.log(`   📅 발행일: ${item.pubDate}`);
      console.log(`   🔗 링크: ${item.link}`);
      console.log("-".repeat(60));
    });
  } catch (error) {
    console.error("❌ 테스트 중 오류가 발생했습니다.");
  }
}

runTest();
