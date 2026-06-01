import puppeteer from "puppeteer";
import path from "path";

/**
 * 마크다운 리포트를 시각적인 PDF 또는 이미지로 변환합니다.
 * 왜 하는가? 정보를 한눈에 파악할 수 있는 '프레젠테이션 슬라이드' 스타일은 정보 전달력이 훨씬 높기 때문입니다.
 *
 * @param {string} markdownContent - 생성된 마크다운 리포트 내용
 * @param {string} outputPath - 파일이 저장될 경로 (.pdf 또는 .png)
 * @param {boolean} isImage - 이미지 저장 여부
 */
export async function generatePdf(
  markdownContent,
  outputPath,
  isImage = false,
) {
  // 1. 브라우저 설정 (고해상도 이미지를 위해 스케일 팩터 조절 가능)
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 브라우저를 띄워 HTML을 렌더링한 뒤 PDF로 찍어내는 방식입니다.
  // 왜 Puppeteer인가? 복잡한 CSS를 완벽하게 지원하는 가장 확실한 도구이기 때문입니다.
  const page = await browser.newPage();

  // 이미지 생성 시 해상도를 높이기 위해 뷰포트 설정
  if (isImage) {
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
  }

  // 2. 프레젠테이션 스타일의 HTML/CSS 정의
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
          color: white;
          margin: 0; padding: 40px;
          display: flex; flex-direction: column; justify-content: center;
          min-height: calc(100vh - 80px);
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
        }
        h1 { font-size: 3rem; margin-bottom: 20px; color: #00d2ff; }
        h2 { font-size: 1.8rem; border-left: 5px solid #00d2ff; padding-left: 15px; margin-top: 30px; }
        li { font-size: 1.2rem; margin-bottom: 15px; list-style: none; }
        li::before { content: "⚡"; margin-right: 10px; }
        footer { margin-top: auto; font-size: 0.9rem; opacity: 0.6; text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        ${markdownToSimpleHtml(markdownContent)}
        <footer>NewSai AI Automation Service</footer>
      </div>
    </body>
    </html>
  `;

  try {
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    if (isImage) {
      // 스크린샷 기능을 사용하여 이미지(PNG)로 저장
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`✅ 이미지 리포트 생성 완료: ${outputPath}`);
    } else {
      // PDF로 저장
      await page.pdf({
        path: outputPath,
        format: "A4",
        margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        printBackground: true,
      });
      console.log(`✅ PDF 리포트 생성 완료: ${outputPath}`);
    }

    console.log(`✅ PDF 리포트 생성 완료: ${outputPath}`);
  } catch (error) {
    console.error("❌ 문서 생성 중 에러 발생:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * (유틸리티) 마크다운 헤더와 리스트를 아주 간단한 HTML로 변환합니다.
 */
function markdownToSimpleHtml(md) {
  return md
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/\n/gim, "<br>");
}
