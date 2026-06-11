# [NewSai](https://dragon-it.github.io/newsai/)

NewSai는 매일 AI 뉴스를 수집하고 LLM으로 요약한 뒤 Markdown/PDF 리포트를 생성하고, React 기반 대시보드 웹페이지로 나타내며, 최종 리포트를 Discord로 전송하는 자동화 파이프라인 프로젝트입니다.

## Pipeline

News Fetching (RSS) → LLM Summary (gemini-3.1-flash-lite) → Markdown, JSON, PDF Generation → React Web Display → Discord Webhook

## Tech Stack

- **Backend (Pipeline)**
  - Node.js
  - RSS Parser
  - Google Gemini API (`@google/generative-ai`)
  - Puppeteer (PDF Generation)
  - GitHub Actions (Cron Automation)
- **Frontend (Dashboard)**
  - React 18
  - Vite
  - Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Google Gemini API Key
- Discord Webhook URL

### Installation

```bash
# 1. 저장소 클론
git clone https://github.com/username/newsai.git
cd newsai

# 2. 파이프라인(백엔드) 패키지 설치
npm install

# 3. 대시보드(프론트엔드) 패키지 설치
cd dashboard
npm install
```

### Environment Variables

루트 폴더에 `.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 API Key 및 Webhook URL을 입력합니다.

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```

### Running Locally

**1. 데이터 파이프라인 실행 (뉴스 수집 및 요약, 파일 생성)**

```bash
# 프로젝트 루트 디렉토리에서 실행
npm start
# 또는 node src/index.js
```

실행이 완료되면 루트에 `data.json`이 생성되고, `reports/` 폴더에 Markdown 및 PDF 리포트가 저장됩니다.

**2. React 대시보드 실행**

```bash
# dashboard 디렉토리에서 실행
cd dashboard
npm run dev
```

파이프라인이 생성한 `data.json` 기반으로 브라우저에서 대시보드를 확인할 수 있습니다.
