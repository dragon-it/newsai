import axios from "axios";
import dotenv from "dotenv";

// .env 파일의 환경 변수를 불러옵니다.
dotenv.config();

/**
 * 현재 API Key로 구글 AI 스튜디오에서 사용할 수 있는 모델 목록을 가져옵니다.
 * 왜 하는가? 코드가 틀린 게 아니라, 내 API Key가 특정 모델(1.5-flash 등)을
 * 사용할 권한이 아직 활성화되지 않았는지 확인하기 위함입니다.
 */
async function checkAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY가 .env에 설정되지 않았습니다.");
    return;
  }

  // 구글 API의 모델 목록 조회 엔드포인트입니다.
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    console.log("🔍 구글 서버에서 모델 목록을 조회 중...");
    const response = await axios.get(url);
    const models = response.data.models;

    console.log("\n📂 사용 가능한 모델 ID 리스트:");
    models.forEach((m) => {
      console.log(`- ID: ${m.name} | 이름: ${m.displayName}`);
    });
  } catch (error) {
    console.error("❌ 조회 실패:", error.response?.data || error.message);
  }
}

checkAvailableModels();
