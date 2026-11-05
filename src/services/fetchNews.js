import Parser from "rss-parser";
import { fileURLToPath } from "url";

// RSS 데이터를 JavaScript 객체로 변환하는 파서 생성
const parser = new Parser();

/**
 * Google News RSS에서 AI 관련 뉴스 5개 수집 및 정규화
 * 외부 데이터를 제목, 링크, 날짜 중심의 공통 구조로 변환
 * @returns {Promise<Array<{title: string, link: string, pubDate: string}>>}
 */
export async function fetchAINews() {
  // 검색어 AI, 언어 한국어, 지역 한국으로 설정한 RSS 주소 사용
  const RSS_URL =
    "https://news.google.com/rss/search?q=AI&hl=ko&gl=KR&ceid=KR:ko";

  try {
    // 지정한 URL의 RSS(XML) 수집 및 파싱
    const feed = await parser.parseURL(RSS_URL);

    // 1. slice(0, 5): 요약 비용을 고려해 최신 뉴스 5개로 제한
    // 2. map(...): RSS 결과에서 제목, 링크, 날짜 추출
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

// import.meta.url로 직접 실행 여부 확인 후 수집 테스트 수행
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("🚀 뉴스 수집 테스트 시작...");
  fetchAINews()
    .then((news) => {
      console.log("✅ 수집된 뉴스 목록:", news);
    })
    .catch((err) => console.error("❌ 테스트 실패:", err));
}
