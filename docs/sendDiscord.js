import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Discord로 메시지를 전송합니다.
 * @param {string} content - 전송할 메시지 본문
 * @returns {Promise<void>}
 */
export async function sendDiscordMessage(content) {
  // Webhook URL이 없으면 전송 자체가 불가능하므로 미리 체크합니다.
  if (!DISCORD_WEBHOOK_URL) {
    console.error("❌ DISCORD_WEBHOOK_URL이 .env 파일에 설정되지 않았습니다.");
    return;
  }

  try {
    // axios.post는 HTTP POST 요청을 보낼 때 사용합니다.
    // 디스코드 서버(Webhook)에 우리가 만든 데이터를 "게시"하는 과정입니다.
    const response = await axios.post(DISCORD_WEBHOOK_URL, {
      content: content, // 실제 전송될 메시지 본문

      username: "NewSai Bot 🤖", // 디스코드 채널에 표시될 봇 이름
      avatar_url:
        "https://raw.githubusercontent.com/dragon-it/newsai/main/docs/logo.png", // 예시 로고
    });

    // HTTP 상태 코드 204는 "성공했지만 돌려줄 데이터는 없다"는 뜻입니다.
    // 디스코드 Webhook은 성공 시 보통 204를 반환합니다.
    if (response.status === 204) {
      console.log("✅ Discord 메시지 전송 성공!");
    }
  } catch (error) {
    console.error(
      "❌ Discord 전송 실패:",
      // 서버 응답이 있으면 응답 데이터를, 없으면 일반 에러 메시지를 보여줍니다.
      error.response?.data || error.message,
    );

    throw error;
  }
}

// [테스트 코드]: 터미널에서 'node docs/sendDiscord.js'를 입력하면 직접 실행됩니다.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("🔔 디스코드 메시지 전송 테스트 시작...");
  sendDiscordMessage("테스트 메시지입니다. 디스코드 채널을 확인하세요!")
    .then(() => console.log("종료되었습니다."))
    .catch((err) => console.error("❌ 테스트 실패:", err.message));
}

// TODO: Phase 6 이후에 PDF 파일을 첨부하는 기능을 추가할 예정.
