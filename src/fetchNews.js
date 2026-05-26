import Parser from "rss-parser";
import { fileURLToPath } from "url";

// RSS 데이터를 자바스크립트 객체로 변환해주는 파서(Parser)를 생성합니다.
const parser = new Parser();

/**
 * Google News RSS를 통해 AI 관련 뉴스 5개를 수집하고 정규화합니다.
 * 왜 하는가? 외부의 복잡한 데이터를 우리 프로그램에서 쓰기 좋은 '예쁜 데이터'로 가공하기 위해서입니다.
 * @returns {Promise<Array<{title: string, link: string, pubDate: string}>>}
 */
export async function fetchAINews() {
  // 검색 키워드는 'AI', 언어는 '한국어', 지역은 '한국'으로 설정된 RSS 주소입니다.
  const RSS_URL =
    "https://news.google.com/rss/search?q=AI&hl=ko&gl=KR&ceid=KR:ko";

  try {
    // 지정된 URL의 RSS(XML 형식)를 가져와서 분석합니다.
    const feed = await parser.parseURL(RSS_URL);

    // 1. slice(0, 5): 너무 많은 뉴스는 AI 요약 비용을 높이므로 최신 5개만 가져옵니다.
    // 2. map(...): RSS 결과에는 쓸모없는 정보가 많습니다. 우리가 필요한 제목, 링크, 날짜만 골라냅니다.
    return feed.items.slice(0, 5).map((item) => ({
      title: item.title, // 뉴스 제목
      link: item.link, // 뉴스 원문 주소
      pubDate: item.pubDate,
    }));
  } catch (error) {
    console.error("❌ Google News RSS 수집 실패:", error.message);
    throw error;
  }
}

// [테스트 코드]: 터미널에서 'node src/fetchNews.js'를 입력하면 직접 실행됩니다.
// import.meta.url을 통해 현재 파일이 메인으로 실행되었는지 확인합니다.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("🚀 뉴스 수집 테스트 시작...");
  fetchAINews()
    .then((news) => {
      console.log("✅ 수집된 뉴스 목록:", news);
    })
    .catch((err) => console.error("❌ 테스트 실패:", err));
}
