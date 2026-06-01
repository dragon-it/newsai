import { sendDiscordMessage } from "../src/sendDiscord.js";

async function runTest() {
  console.log(" Discord Webhook 전송 테스트를 시작합니다...");

  try {
    const testMessage =
      "🤖 **NewSai 테스트 메시지**\n\n현재 Discord Webhook 연동이 정상적으로 설정되었습니다! 이제 뉴스 수집 및 요약 파이프라인을 연결할 준비가 되었습니다.";
    await sendDiscordMessage(testMessage);

    console.log("✨ 테스트 완료: Discord 채널을 확인해 보세요.");
  } catch (error) {
    console.error(
      "❌ 테스트 실패: .env 파일의 DISCORD_WEBHOOK_URL을 확인하거나 네트워크 상태를 점검해 주세요.",
    );
  }
}
runTest();
