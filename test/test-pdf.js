import path from "path";
import { generatePdf } from "../src/formatters/generatePdf.js";

async function runPdfTest() {
  console.log("🚀 PDF 생성 테스트를 시작합니다...");

  const dummyMarkdown = `
# 🤖 NewSai 테스트 리포트

## 📝 오늘의 요약
* 인공지능 기술이 비약적으로 발전하고 있습니다.
* PDF 생성 기능이 성공적으로 구현되었습니다.

---
## 📰 뉴스 목록
- AI PC 시대의 개막 (2026-06-01)
- 엔비디아의 새로운 칩 발표 (2026-06-01)
  `;

  const outputPath = path.join(process.cwd(), "reports", "test-report.pdf");
  await generatePdf(dummyMarkdown, outputPath);
}

runPdfTest();
