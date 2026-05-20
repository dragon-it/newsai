import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Discord로 메시지를 전송합니다.
 * @param {string} content - 전송할 메시지 본문
 * @returns {Promise<void>}
 */
export async function sendDiscordMessage(content) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("❌ DISCORD_WEBHOOK_URL이 .env 파일에 설정되지 않았습니다.");
    return;
  }

  try {
    const response = await axios.post(DISCORD_WEBHOOK_URL, {
      content: content,

      username: "NewSai Bot 🤖",
      avatar_url:
        "https://raw.githubusercontent.com/dragon-it/newsai/main/docs/logo.png", // 예시 로고
    });

    if (response.status === 204) {
      console.log("✅ Discord 메시지 전송 성공!");
    }
  } catch (error) {
    console.error(
      "❌ Discord 전송 실패:",
      error.response?.data || error.message,
    );

    throw error;
  }
}

// TODO: Phase 6 이후에 PDF 파일을 첨부하는 기능을 추가할 예정.
