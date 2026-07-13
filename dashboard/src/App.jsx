import { useState, useEffect, useRef } from "react";
import "./App.css";

// 위험도 점수에 따른 테마 색상 반환
function getRiskColor(score) {
  if (score <= 35) return "#10b981"; // 초록 (안전)
  if (score <= 60) return "#f59e0b"; // 노랑/주황 (보통)
  if (score <= 80) return "#f97316"; // 주황 (경고)
  return "#ef4444"; // 빨강 (위험)
}

// 위험도 점수에 따른 등급 텍스트 반환
function getRiskLabel(score) {
  if (score <= 35) return "안전 🟢";
  if (score <= 60) return "보통 🟡";
  if (score <= 80) return "경계 🟠";
  return "위험 🔴";
}

// 위험도 점수에 따른 상세 설명 반환
function getRiskDescription(score) {
  if (score <= 35) return "AI 기술이 인간의 일자리를 대체하기보다 보조 도구로 유용하게 활용되고 있으며, 고용 시장이 안정적인 상태입니다.";
  if (score <= 60) return "일부 단순 반복 직무에 대한 AI 도입 시도가 포착되나, 아직은 인간 협업 기반의 생산성 향상 중심 단계입니다.";
  if (score <= 80) return "특정 전문직 및 서비스 직무에서 AI 대체 우려 기사가 증가하고 있으며, 고용 구조의 변화가 가시화되는 경계 단계입니다.";
  return "AI 모델 성능 급증 및 대규모 대체 소식으로 인해 고용 불안과 시장 리스크가 매우 높은 수준에 도달한 극도 위험 상태입니다.";
}

// [컴포넌트] 오늘의 일자리 위험도 반원 게이지 차트 (1번 속도계 모양)
function GaugeChart({ score }) {
  // 0점(수평 왼쪽: -90도) ~ 100점(수평 오른쪽: 90도)
  const angle = -90 + (score / 100) * 180;
  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  return (
    <div className="gauge-chart-container">
      <svg width="220" height="130" viewBox="0 0 220 130">
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* 뒷배경 회색 가이드 원호 */}
        <path
          d="M 25 110 A 85 85 0 0 1 195 110"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* 무지개 그라디언트 채워진 원호 */}
        <path
          d="M 25 110 A 85 85 0 0 1 195 110"
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="267"
          strokeDashoffset="0"
        />

        {/* 침/바늘 (Needle) */}
        <g transform="translate(110, 110)">
          <polygon
            points="-4,0 0,-85 4,0"
            fill="#1e293b"
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0px 0px",
              transition: "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          />
          <circle cx="0" cy="0" r="10" fill="#1e293b" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
        </g>
      </svg>
      <div className="gauge-score-info">
        <span className="gauge-score" style={{ color }}>{score}</span>
        <span className="gauge-score-max">/ 100</span>
        <div className="gauge-label" style={{ borderColor: color }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// [컴포넌트] 날짜별 위험도 추이 꺾은선 차트 (2번 꺾은선 모양)
function TrendChart({ historyData }) {
  // 날짜 오름차순 정렬 (오른쪽이 최신이 되도록)
  const chartData = [...historyData].reverse();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (chartData.length < 2) return null;

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxVal = 100;

  // 데이터 좌표 매핑
  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (chartData.length - 1);
    const y = paddingTop + chartHeight - ((d.jobRiskScore || 50) / maxVal) * chartHeight;
    return { x, y, date: d.reportDate, score: d.jobRiskScore || 50 };
  });

  // Polyline points 문자열 생성
  const linePointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  // 아래 투명 그라디언트 영역 폴리곤 생성
  const areaPointsStr = `${points[0].x},${paddingTop + chartHeight} ` + 
                        linePointsStr + 
                        ` ${points[points.length - 1].x},${paddingTop + chartHeight}`;

  return (
    <div className="trend-chart-container">
      <h3>일자리 위험도 트렌드 추이 (최근 10일)</h3>
      <div className="svg-wrapper">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 격자선 가이드라인 */}
          <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#e2e8f0" strokeDasharray="3" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#e2e8f0" strokeDasharray="3" />
          <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#cbd5e1" strokeWidth="1.5" />

          {/* y축 라벨 */}
          <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" fontSize="11" fill="#64748b">100</text>
          <text x={paddingLeft - 10} y={paddingTop + chartHeight / 2 + 4} textAnchor="end" fontSize="11" fill="#64748b">50</text>
          <text x={paddingLeft - 10} y={paddingTop + chartHeight + 4} textAnchor="end" fontSize="11" fill="#64748b">0</text>

          {/* 그라디언트 영역 */}
          <polygon points={areaPointsStr} fill="url(#area-gradient)" />

          {/* 꺾은선 메인 패스 */}
          <polyline
            points={linePointsStr}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 원 & 인터랙티브 영역 */}
          {points.map((p, i) => (
            <g key={i}>
              {/* 마우스 가이드 수직 점선 */}
              {hoveredIndex === i && (
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={paddingTop + chartHeight}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="2"
                />
              )}
              {/* 포인트 원형 테두리 */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? "6" : "4"}
                fill={getRiskColor(p.score)}
                stroke="#ffffff"
                strokeWidth="2"
                style={{ transition: "r 0.1s ease", cursor: "pointer" }}
              />
              {/* 호버 감지용 큰 투명 원 */}
              <circle
                cx={p.x}
                cy={p.y}
                r="15"
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          ))}
        </svg>

        {/* HTML 툴팁 오버레이 */}
        {hoveredIndex !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${points[hoveredIndex].x + 10}px`,
              top: `${points[hoveredIndex].y - 45}px`
            }}
          >
            <div className="tooltip-date">{points[hoveredIndex].date}</div>
            <div className="tooltip-score">
              위험도: <strong style={{ color: getRiskColor(points[hoveredIndex].score) }}>{points[hoveredIndex].score}점</strong>
            </div>
          </div>
        )}
      </div>
      <div className="trend-x-labels">
        <span>{chartData[0].reportDate}</span>
        <span>{chartData[chartData.length - 1].reportDate}</span>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 아코디언 상태 관리 (날짜 string을 key로 하고 boolean 값을 value로 지정)
  const [expandedDays, setExpandedDays] = useState({});

  // 무한스크롤 관련 상태
  const [visibleCount, setVisibleCount] = useState(3);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      import("../../data.json")
        .then((module) => {
          setData(module.default);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("로컬 데이터를 불러오지 못했습니다. 백엔드 파이프라인을 먼저 실행해주세요.");
          setLoading(false);
        });
      return;
    }

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

  // 무한스크롤 IntersectionObserver 설정
  useEffect(() => {
    if (!data || loading || error) return;
    const dataArray = Array.isArray(data) ? data : [data];
    const pastData = dataArray.slice(1);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 화면에 닿으면 노출될 기사 개수를 3개씩 확장
          setVisibleCount((prev) => Math.min(prev + 3, pastData.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [data, loading, error, visibleCount]);

  if (loading) {
    return <div className="loading-container">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="error-container">에러: {error}</div>;
  }

  if (!data || (Array.isArray(data) && data.length === 0) || (!Array.isArray(data) && !data.news)) {
    return <div className="error-container">데이터가 없습니다.</div>;
  }

  const dataArray = Array.isArray(data) ? data : [data];
  const todayData = dataArray[0];
  const pastData = dataArray.slice(1);

  // 아코디언 토글 핸들러
  const toggleAccordion = (reportDate) => {
    setExpandedDays((prev) => ({
      ...prev,
      [reportDate]: prev[reportDate] !== undefined ? !prev[reportDate] : false
    }));
  };

  return (
    <div className="container">
      <header>
        <div className="logo">NewSai 🤖</div>
        <h1>AI 데일리 리포트</h1>
        <p className="date">
          발행일: <span id="report-date">{todayData.reportDate}</span>
        </p>
        <div className="actions">
          {/* PDF 복사 위치가 public 폴더이므로 /report.pdf 경로로 일치시켜 다운로드 가능하게 함 */}
          <a href={`${import.meta.env.BASE_URL}report.pdf`} className="btn-download" download="report.pdf">
            PDF 리포트 다운로드
          </a>
        </div>
      </header>

      <main>
        {/* 신규: 일자리 위험도 시각화 보드 */}
        <div className="dashboard-grid">
          <section className="dashboard-card gauge-card-section">
            <h2 className="section-title-sub">오늘의 AI 일자리 위험도</h2>
            <div className="gauge-layout">
              <GaugeChart score={todayData.jobRiskScore || 50} />
              <div className="gauge-description">
                <p>{getRiskDescription(todayData.jobRiskScore || 50)}</p>
                <div className="guideline-tip">
                  💡 <strong>위험도 기준:</strong> AI 발전속도, 대규모 고용 영향 뉴스 비중, 직무 자동화 수준 등을 종합 요약하여 Gemini가 매일 산출합니다.
                </div>
              </div>
            </div>
          </section>

          {pastData.length > 0 && (
            <section className="dashboard-card trend-card-section">
              <TrendChart historyData={dataArray} />
            </section>
          )}
        </div>

        <div className="section-group today-group">
          <section className="summary-section">
            <h2>오늘의 요약</h2>
            <div className="summary-content">{todayData.summary}</div>
          </section>

          <section className="news-section">
            <h2>주요 뉴스 목록 &amp; 요약</h2>
            <div className="news-list">
              {todayData.news.map((item, index) => (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-card-link" key={index}>
                  <div className="news-card">
                    <span className="pub-date">{new Date(item.pubDate).toLocaleDateString()}</span>
                    <h3>{item.title}</h3>
                    {item.summary && <p className="news-summary">{item.summary}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {pastData.length > 0 && (
          <div className="section-group past-group">
            <h2 className="past-group-title">지난 뉴스 히스토리</h2>
            {pastData.slice(0, visibleCount).map((past, idx) => {
              // 최근 3일은 펼쳐진 상태로 표시 (당일 제외하고 pastData의 index 0, 1까지가 오늘+과거2일=총3일)
              const isExpanded = expandedDays[past.reportDate] !== undefined 
                ? expandedDays[past.reportDate] 
                : idx < 2;

              return (
                <div key={idx} className={`past-day-block ${isExpanded ? "expanded" : "collapsed"}`}>
                  <div className="past-date-header" onClick={() => toggleAccordion(past.reportDate)}>
                    <span className="past-date">{past.reportDate}</span>
                    <div className="header-meta">
                      <span className="job-risk-badge" style={{ backgroundColor: getRiskColor(past.jobRiskScore || 50) }}>
                        위험도 {past.jobRiskScore || 50}점
                      </span>
                      <span className="accordion-arrow">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="past-day-content">
                      <section className="summary-section past-summary-section">
                        <h4 className="sub-title">지난 뉴스 요약</h4>
                        <div className="summary-content past-summary-content">{past.summary}</div>
                      </section>

                      <section className="news-section past-news-section">
                        <h4 className="sub-title">지난 뉴스 목록 &amp; 요약</h4>
                        <div className="news-list">
                          {past.news.map((item, nIdx) => (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-card-link" key={nIdx}>
                              <div className="news-card past-news-card">
                                <span className="pub-date">{new Date(item.pubDate).toLocaleDateString()}</span>
                                <h5>{item.title}</h5>
                                {item.summary && <p className="news-summary">{item.summary}</p>}
                              </div>
                            </a>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 무한스크롤 트리거 요소 */}
            {visibleCount < pastData.length && (
              <div ref={loaderRef} className="scroll-loader">
                <span className="spinner"></span> 이전 뉴스 데이터를 불러오는 중...
              </div>
            )}
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
