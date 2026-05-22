import Parser from "rss-parser";

const parser = new Parser();

/**
 * Google News RSS를 통해 AI 관련 뉴스 5개를 수집하고 정규화합니다.
 * @returns {Promise<Array<{title: string, link: string, pubDate: string}>>}
 */
export async function fetchAINews() {
  const RSS_URL =
    "https://news.google.com/rss/search?q=AI&hl=ko&gl=KR&ceid=KR:ko";

  try {
    const feed = await parser.parseURL(RSS_URL);

    // 상위 5개 항목만 추출 및 필드 정규화
    return feed.items.slice(0, 5).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
    }));
  } catch (error) {
    console.error("❌ Google News RSS 수집 실패:", error.message);
    throw error;
  }
}
