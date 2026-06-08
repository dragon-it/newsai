import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // 로컬 개발 환경에서는 상위 폴더의 data.json을 직접 불러옵니다.
      import("../../data.json")
        .then((module) => {
          setData(module.default);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(
            "로컬 데이터를 불러오지 못했습니다. 백엔드 파이프라인을 먼저 실행해주세요.",
          );
          setLoading(false);
        });
      return;
    }

    // 깃허브 배포(운영) 환경에서는 URL 기반으로 fetch 합니다.
    const fetchUrl = import.meta.env.BASE_URL + "data.json";

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-container">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="error-container">에러: {error}</div>;
  }

  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (!Array.isArray(data) && !data.news)
  ) {
    return <div className="error-container">데이터가 없습니다.</div>;
  }

  const dataArray = Array.isArray(data) ? data : [data];
  const todayData = dataArray[0];
  const pastData = dataArray.slice(1);

  return (
    <div className="container">
      <header>
        <div className="logo">NewSai 🤖</div>
        <h1>AI 데일리 리포트</h1>
        <p className="date">
          발행일: <span id="report-date">{todayData.reportDate}</span>
        </p>
        <div className="actions">
          <a
            href={import.meta.env.BASE_URL + "report.pdf"}
            className="btn-download"
            download
          >
            PDF 리포트 다운로드
          </a>
        </div>
      </header>

      <main>
        <div className="section-group today-group">
          <section className="summary-section">
            <h2>오늘의 요약</h2>
            <div className="summary-content">{todayData.summary}</div>
          </section>

          <section className="news-section">
            <h2>주요 뉴스 목록 &amp; 요약</h2>
            <div className="news-list">
              {todayData.news.map((item, index) => (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-card-link"
                  key={index}
                >
                  <div className="news-card">
                    <span className="pub-date">
                      {new Date(item.pubDate).toLocaleDateString()}
                    </span>
                    <h3>{item.title}</h3>
                    {item.summary && (
                      <p className="news-summary">{item.summary}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {pastData.length > 0 && (
          <div className="section-group past-group">
            <h2 className="past-group-title">지난 뉴스 히스토리</h2>
            {pastData.map((past, idx) => (
              <div key={idx} className="past-day-block">
                <h3 className="past-date">{past.reportDate}</h3>

                <section className="summary-section past-summary-section">
                  <h4 className="sub-title">지난 뉴스 요약</h4>
                  <div className="summary-content past-summary-content">
                    {past.summary}
                  </div>
                </section>

                <section className="news-section past-news-section">
                  <h4 className="sub-title">지난 뉴스 목록 &amp; 요약</h4>
                  <div className="news-list">
                    {past.news.map((item, nIdx) => (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-card-link"
                        key={nIdx}
                      >
                        <div className="news-card past-news-card">
                          <span className="pub-date">
                            {new Date(item.pubDate).toLocaleDateString()}
                          </span>
                          <h5>{item.title}</h5>
                          {item.summary && (
                            <p className="news-summary">{item.summary}</p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p>&copy; 2026 NewSai Automation. Generated by LLM.</p>
        <p>
          <a href="https://github.com/dragon-it/newsai">GitHub Repository</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
