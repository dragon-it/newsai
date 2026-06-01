import fs from "fs";
import path from "path";

export function saveToFile(directory, fileName, content) {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const filePath = path.join(directory, fileName);
    fs.writeFileSync(filePath, content, "utf8");
    return filePath;
  } catch (error) {
    console.error(`❌ 파일 저장 중 에러 발생 (${fileName}):`, error.message);
    throw error;
  }
}
