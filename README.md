# NewSai

NewSai는 매일 AI 뉴스를 수집하고 LLM으로 요약한 뒤 Markdown/PDF 리포트를 생성하여 웹페이지로 나타내고, 이를 Discord로 전송하는 자동화 파이프라인입니다.

## Pipeline

News Fetching → LLM Summary → Markdown/PDF Generation → Web Display → Discord Webhook

## Tech Stack

- Node.js
- RSS Parser
- OpenAI API
- Puppeteer
- Discord Webhook
- GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- OpenAI API Key
- Discord Webhook URL

### Installation

```bash
# 저장소 클론
git clone https://github.com/username/newsai.git
cd newsai

# 패키지 설치
npm install
```

### Environment Variables

`.env.example` 파일을 참고하여 최상위 디렉토리에 `.env` 파일을 생성하고 필요한 API Key 및 Webhook URL을 입력합니다.
