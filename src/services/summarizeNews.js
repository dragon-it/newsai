/* eslint-disable no-unused-vars */
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// .env 파일에 저장된 환경 변수(API Key 등)를 process.env로 불러옵니다.
dotenv.config();

// Google Generative AI 클라이언트를 초기화합니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// 사용할 모델을 선택합니다.
// [중요] '이름'이 아닌 'ID'를 적어야 합니다.
// checkModels.js 결과 리스트 중 무료 할당량이 가장 안정적인 'gemini-3.1-flash-lite'를 선택했습니다.
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

/**
 * 수집된 뉴스 목록을 바탕으로 Google Gemini를 사용하여 한국어 요약을 생성합니다.
 * 왜 하는가? 수많은 뉴스 링크를 직접 다 읽기 힘들기 때문에 핵심만 짚어주는 비서 역할을 합니다.
 * @param {Array<{title: string, link: string, pubDate: string}>} newsList
 * @returns {Promise<string>} 요약된 텍스트
 */
export async function summarizeNews(newsList) {
  // API 키가 로드되었는지 확인 (보안을 위해 앞 4자리만 출력)
  console.log(
    `🔑 사용 중인 API 키 확인: ${process.env.GEMINI_API_KEY?.substring(0, 4)}...`,
  );

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.");
  }

  // 데이터가 없는데 AI에게 요약을 시키면 에러가 나거나 토큰(비용)만 낭비될 수 있으므로 미리 방어합니다.
  if (!newsList || newsList.length === 0) {
    return "요약할 뉴스 데이터가 없습니다.";
  }

  // AI가 이해할 수 있도록 뉴스 객체 배열을 하나의 긴 문자열 텍스트로 합칩니다.
  // 예: "1. 뉴스제목 (링크: ...)" 형태
  // 보안 팁: 무료 티어 API는 학습에 활용될 수 있으므로,
  // 원문 전체가 아닌 제목과 링크 같은 '공개된 정보'만 요약용으로 전달합니다.
  const newsContent = newsList
    .map((news, index) => `${index + 1}. ${news.title} (링크: ${news.link})`)
    .join("\n");

  // 프롬프트(Prompt): AI에게 내리는 "업무 지시서"입니다.
  // 지시가 구체적일수록 원하는 결과값이 잘 나옵니다.
  const prompt = `
다음은 오늘 수집된 AI 관련 뉴스 목록입니다.
각 뉴스의 내용을 참고하여 현재 AI 기술 트렌드와 주요 소식을 한국어로 요약해줘.

조건(가이드라인을 줘야 AI가 횡설수설하지 않습니다):
1. 전체 내용을 아우르는 3줄 이내의 요약문(불렛 포인트 사용)을 작성할 것. (프론트엔드에서 보여주기 좋게)
2. 전문적이고 객관적인 말투를 유지할 것.

뉴스 목록:
${newsContent}
`;

  try {
    // Gemini 모델을 사용하여 콘텐츠를 생성합니다.
    // OpenAI와 달리 메시지 배열 대신 텍스트 프롬프트를 바로 전달할 수 있습니다.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    // API 호출 실패 시(한도 초과, 네트워크 오류 등) 원인을 로그로 남깁니다.
    // 에러를 'throw' 하는 이유는 호출한 쪽(index.js 등)에서도 문제가 생겼음을 알게 하기 위함입니다.
    console.error("❌ LLM 요약 중 에러 발생:", error.message);
    throw error;
  }
}

// [테스트 코드]: 터미널에서 'node src/summarizeNews.js'를 입력하면 직접 실행됩니다.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dummyNews = [
    { title: "OpenAI, 새로운 모델 GPT-4o 발표", link: "https://example.com/1" },
    { title: "AI 반도체 시장의 미래 전망", link: "https://example.com/2" },
  ];

  // .env 파일에 API 키가 잘 들어있는지 확인하세요!
  // 프론트엔드의 config.js 파일을 세팅하는 것과 비슷합니다.

  console.log("🤖 AI 요약 테스트 시작 (약 5~10초 소요)...");
  summarizeNews(dummyNews)
    .then((summary) => {
      console.log("✅ 요약 결과:\n", summary);
    })
    .catch((err) => console.error("❌ 테스트 실패:", err.message));
}
