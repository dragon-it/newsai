/* eslint-disable no-unused-vars */
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// .env 파일에 저장된 환경 변수(API Key 등)를 process.env로 불러옵니다.
dotenv.config();

// Google Generative AI 클라이언트를 초기화합니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// LLM 응답의 구조와 필드 타입을 엄격하게 정의하는 JSON 스키마입니다.
// 이를 통해 불완전한 문자열 반환이나 이스케이프 누락으로 인한 JSON 파싱 에러를 예방합니다.
const summarySchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallSummary: {
      type: SchemaType.STRING,
      description: "오늘의 뉴스 트렌드와 주요 소식을 종합하여 작성한 요약문 (글머리 기호 형태 사용, 한국어)."
    },
    overallScore: {
      type: SchemaType.INTEGER,
      description: "AI 뉴스들의 중요도, 영향력, 시급성 등을 종합한 0에서 100 사이의 종합 지수 점수."
    },
    jobRiskScore: {
      type: SchemaType.INTEGER,
      description: "AI 발전이 일자리에 미치는 위험도를 종합 평가한 0에서 100 사이의 점수."
    },
    riskScoreBreakdown: {
      type: SchemaType.ARRAY,
      description: "오늘 일자리 위험도 변동에 영향을 준 결정적인 요인/이벤트 리스트.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          event: {
            type: SchemaType.STRING,
            description: "위험도 변동의 원인이 된 핵심 뉴스나 이벤트 이름."
          },
          sign: {
            type: SchemaType.STRING,
            description: "위험도를 높이면 '+', 낮추면 '-'."
          },
          impact: {
            type: SchemaType.INTEGER,
            description: "영향 강도 (1에서 10 사이의 양의 정수)."
          },
          newsIndex: {
            type: SchemaType.INTEGER,
            description: "원인이 된 뉴스의 번호 (1부터 시작하는 정수, 전반적인 변화라면 null).",
            nullable: true
          }
        },
        required: ["event", "sign", "impact"]
      }
    },
    newsSummaries: {
      type: SchemaType.ARRAY,
      description: "입력된 뉴스 목록과 1:1로 정확하게 순서 매핑되는 요약 목록.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          summary: {
            type: SchemaType.STRING,
            description: "해당 뉴스의 핵심 내용 요약 (2~3문장)."
          },
          importance: {
            type: SchemaType.INTEGER,
            description: "뉴스 자체의 중요도 (1~5 사이의 정수)."
          },
          aiImpact: {
            type: SchemaType.INTEGER,
            description: "AI 업계/기술 영향도 (1~5 사이의 정수)."
          },
          automationPotential: {
            type: SchemaType.INTEGER,
            description: "해당 영역의 자동화 가능성 (1~5 사이의 정수)."
          },
          investmentImpact: {
            type: SchemaType.INTEGER,
            description: "기업 및 시장 투자 영향도 (1~5 사이의 정수)."
          }
        },
        required: ["summary", "importance", "aiImpact", "automationPotential", "investmentImpact"]
      }
    }
  },
  required: ["overallSummary", "overallScore", "jobRiskScore", "riskScoreBreakdown", "newsSummaries"]
};

// 사용할 모델을 선택합니다.
// responseMimeType을 application/json으로 설정하고 responseSchema를 전달하여 스키마 준수를 강제합니다.
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: summarySchema
  }
});

export async function summarizeNews(newsList) {
  // API 키가 로드되었는지 확인 (보안을 위해 앞 4자리만 출력)
  console.log(
    "🔑 사용 중인 API 키 확인: " +
      process.env.GEMINI_API_KEY?.substring(0, 4) +
      "...",
  );

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.");
  }

  // 데이터가 없는데 AI에게 요약을 시키면 에러가 나거나 토큰(비용)만 낭비될 수 있으므로 미리 방어합니다.
  if (!newsList || newsList.length === 0) {
    return {
      overallSummary: "요약할 뉴스 데이터가 없습니다.",
      newsSummaries: [],
    };
  }

  // AI가 이해할 수 있도록 뉴스 객체 배열을 하나의 긴 문자열 텍스트로 합칩니다.
  // 예: "1. 뉴스제목 (링크: ...)" 형태
  // 보안 팁: 무료 티어 API는 학습에 활용될 수 있으므로,
  // 원문 전체가 아닌 제목과 링크 같은 '공개된 정보'만 요약용으로 전달합니다.
  const newsContent = newsList
    .map(
      (news, index) =>
        index + 1 + ". " + news.title + " (링크: " + news.link + ")",
    )
    .join("\n");

  const prompt = [
    "다음은 오늘 수집된 AI 뉴스 목록임.",
    "각 뉴스의 내용을 참고하여 현재 AI 기술 트렌드와 주요 소식을 한국어로 요약하고 분석해줘.",
    "",
    "반드시 아래 JSON 형식으로만 응답할 것 (마크다운 백틱 등 다른 텍스트 절대 포함 금지):",
    "{",
    '  "overallSummary": "- 인프라 및 생태계 확장: 내용...\\n\\n- 반도체 공급망 강화: 내용...\\n\\n- 산업 현장 및 공공 적용: 내용...",',
    '  "overallScore": 85,',
    '  "jobRiskScore": 55,',
    '  "riskScoreBreakdown": [',
    '    { "event": "OpenAI Agent 발표", "sign": "+", "impact": 3, "newsIndex": 1 },',
    '    { "event": "Microsoft 감원", "sign": "+", "impact": 5, "newsIndex": 2 },',
    '    { "event": "AI 규제", "sign": "-", "impact": 2, "newsIndex": null }',
    '  ],',
    '  "newsSummaries": [',
    "    {",
    '      "summary": "해당 뉴스의 핵심 요약 (2~3문장)",',
    '      "importance": 5,',
    '      "aiImpact": 4,',
    '      "automationPotential": 3,',
    '      "investmentImpact": 5',
    "    }",
    "  ]",
    "}",
    "",
    "조건 (가이드라인):",
    "1. 전문적이고 객관적인 말투를 유지할 것.",
    "2. overallSummary는 전체 내용을 아우르는 요약문(불렛 포인트 사용)을 작성할 것.",
    "3. overallScore는 오늘 수집된 AI 뉴스들의 중요도, 영향력, 시급성 등을 종합적으로 평가하여 0에서 100 사이의 정수 점수로 부여해줘.",
    "4. jobRiskScore는 AI 기술 발전이 인간의 '일자리 위험도'에 미치는 영향을 0에서 100 사이의 정수 점수로 평가해줘.",
    "5. riskScoreBreakdown은 오늘 일자리 위험도(jobRiskScore)가 결정되는 데(또는 변동하는 데) 결정적인 영향을 준 핵심 요인/이벤트 2~3가지를 명시해줘. 일자리 위험도를 높이는 요인은 sign을 '+', 낮추는 요인은 sign을 '-'로 지정하고, impact는 1~10 사이의 양의 정수 값으로 설정해줘. 또한, 각 요인이 기인한 기사의 번호를 `newsIndex` 필드에 1부터 시작하는 정수로 적어줘 (예: 제공된 뉴스 목록 중 2번째 뉴스에 기인한 내용이면 2. 특정 뉴스 하나에만 기인하지 않거나 전반적인 시장 변화라면 null로 표시).",
    "6. newsSummaries는 제공된 뉴스 목록의 순서와 1:1로 매칭되는 배열이어야 해 (예: 제공된 뉴스 목록의 첫 번째 뉴스는 newsSummaries의 첫 번째 요소에 대응). 각 객체는 제목(title) 필드를 포함하지 말고, 요약(summary)과 4대 지표(importance: 중요도, aiImpact: AI 영향도, automationPotential: 자동화 가능성, investmentImpact: 투자 영향, 각각 1에서 5 사이의 정수)만 작성해줘. 이로써 제목의 큰따옴표 등으로 인한 JSON 파싱 에러를 원천적으로 방지함.",
    "",
    "뉴스 목록:",
    newsContent,
  ].join("\n");

  try {
    // Gemini 모델을 사용하여 콘텐츠를 생성합니다.
    // OpenAI와 달리 메시지 배열 대신 텍스트 프롬프트를 바로 전달할 수 있습니다.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text
      .replace(/\x60\x60\x60json/g, "")
      .replace(/\x60\x60\x60/g, "")
      .trim();
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.log("=== JSON STR START ===");
      console.log(jsonStr);
      console.log("=== JSON STR END ===");
      throw e;
    }
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

  console.log("🤖 AI 요약 테스트 시작...");
  summarizeNews(dummyNews)
    .then((summary) => {
      console.log("✅ 요약 결과:\n", JSON.stringify(summary, null, 2));
    })
    .catch((err) => console.error("❌ 테스트 실패:", err.message));
}
