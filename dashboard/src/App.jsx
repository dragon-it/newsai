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

// 가속도(dailyVelocity)에 따른 라벨 및 테마 색상 반환
function getVelocityBadge(velocity) {
  const v = typeof velocity === "number" ? velocity : 1.0;
  if (v >= 3.0) return { label: "급가속 🔴", color: "#ef4444", bg: "#fef2f2", sign: `+${v.toFixed(1)}pt/day` };
  if (v >= 0.5) return { label: "상승 가속 🟠", color: "#f97316", bg: "#fff7ed", sign: `+${v.toFixed(1)}pt/day` };
  if (v >= 0.0) return { label: "완만/유지 🟡", color: "#eab308", bg: "#fefce8", sign: `+${v.toFixed(1)}pt/day` };
  return { label: "감속/완화 🟢", color: "#10b981", bg: "#ecfdf5", sign: `${v.toFixed(1)}pt/day` };
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

// 뉴스 별점 별 기호 안전 렌더러 (RangeError 예방)
function renderStars(score) {
  const cleanScore = Math.max(0, Math.min(5, Math.round(score ?? 3)));
  return "★".repeat(cleanScore) + "☆".repeat(5 - cleanScore);
}

// [컴포넌트] 날짜별 위험 가속도(Daily Velocity) 추이 꺾은선 차트 (동적 스케일링 & 콤팩트 패딩 적용)
function TrendChart({ historyData, selectedDate, onSelectPoint }) {
  // 날짜 오름차순 정렬 (오른쪽이 최신이 되도록)
  const chartData = [...historyData].reverse();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (chartData.length < 2) return null;

  const width = 500;
  const height = 180;
  const paddingLeft = 58;
  const paddingRight = 18;
  const paddingTop = 30;
  const paddingBottom = 22;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // 실제 데이터의 가속도 최소/최대 수치 기반 동적 Y축 스케일링
  const velocities = chartData.map((d) => (typeof d.dailyVelocity === "number" ? d.dailyVelocity : 1.0));
  const rawMin = Math.min(...velocities);
  const rawMax = Math.max(...velocities);

  // 상하단여백을 최소화하여 가속도 파동이 차트 전체를 채우도록 설정
  const minVel = Math.min(-0.5, Math.floor((rawMin - 0.5) * 2) / 2);
  const maxVel = Math.max(2.5, Math.ceil((rawMax + 0.5) * 2) / 2);
  const velRange = maxVel - minVel || 1;
  const midVel = Math.round(((maxVel + minVel) / 2) * 10) / 10;

  // 0.0 baseline Y 좌표 연산
  const zeroY = paddingTop + chartHeight - ((0 - minVel) / velRange) * chartHeight;
  const midY = paddingTop + chartHeight - ((midVel - minVel) / velRange) * chartHeight;

  // 데이터 좌표 매핑
  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (chartData.length - 1);
    const vel = typeof d.dailyVelocity === "number" ? d.dailyVelocity : 1.0;
    const clampedVel = Math.max(minVel, Math.min(maxVel, vel));
    const y = paddingTop + chartHeight - ((clampedVel - minVel) / velRange) * chartHeight;
    return {
      x,
      y,
      date: d.reportDate,
      velocity: vel,
      score: d.cumulativeRiskScore ?? d.jobRiskScore ?? 50,
      reason: d.velocityReason
    };
  });

  // Polyline points 문자열 생성
  const linePointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  // 아래 투명 그라디언트 영역 폴리곤 생성 (0.0 Y 기준점 또는 차트 하단 기준)
  const areaBaseY = Math.min(paddingTop + chartHeight, Math.max(paddingTop, zeroY));
  const areaPointsStr = `${points[0].x},${areaBaseY} ` +
    linePointsStr +
    ` ${points[points.length - 1].x},${areaBaseY}`;

  // 가속도별 포인트 색상 추출
  const getVelocityColor = (v) => {
    if (v >= 3.0) return "#dc2626"; // 급가속 (레드)
    if (v >= 1.0) return "#f97316"; // 상승 가속 (오렌지)
    if (v > 0.0) return "#eab308";  // 완만 가속 (옐로우)
    return "#10b981";              // 감속/안정 (그린)
  };

  return (
    <div className="trend-chart-container">
      <div style={{ marginBottom: '0.25rem' }}>
        <h3 className="section-title-sub" style={{ margin: 0, fontSize: '1.05rem' }}>🚀 일자리 위험 가속도(Velocity) 추이</h3>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
        뉴스 충격에 따른 일자별 위험 축적 속도의 동적 파동을 실시간 포착합니다.
      </p>

      <div className="svg-wrapper">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 격자선 가이드라인 (상단, 중간, 0.0 기준선, 하단) */}
          <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#e2e8f0" strokeDasharray="3" />
          {midVel !== 0 && midY > paddingTop + 15 && midY < paddingTop + chartHeight - 15 && (
            <line x1={paddingLeft} y1={midY} x2={width - paddingRight} y2={midY} stroke="#f1f5f9" strokeDasharray="2" />
          )}
          {zeroY >= paddingTop && zeroY <= paddingTop + chartHeight && (
            <line x1={paddingLeft} y1={zeroY} x2={width - paddingRight} y2={zeroY} stroke="#94a3b8" strokeDasharray="4" strokeWidth="1.5" />
          )}
          <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Y축 선명하고 크기가 강조된 라벨 표시 */}
          <text x={paddingLeft - 10} y={paddingTop + 5} textAnchor="end" fontSize="16" fill="#dc2626" fontWeight="800">
            {maxVel > 0 ? `+${maxVel.toFixed(1)}` : maxVel.toFixed(1)}
          </text>
          {zeroY >= paddingTop + 20 && zeroY <= paddingTop + chartHeight - 20 && (
            <text x={paddingLeft - 10} y={zeroY + 5} textAnchor="end" fontSize="16" fill="#334155" fontWeight="800">0.0</text>
          )}
          <text x={paddingLeft - 10} y={paddingTop + chartHeight + 5} textAnchor="end" fontSize="16" fill={minVel < 0 ? "#059669" : "#64748b"} fontWeight="800">
            {minVel > 0 ? `+${minVel.toFixed(1)}` : minVel.toFixed(1)}
          </text>

          {/* 그라디언트 영역 */}
          <polygon points={areaPointsStr} fill="url(#area-gradient)" />

          {/* 꺾은선 메인 패스 */}
          <polyline
            points={linePointsStr}
            fill="none"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 원 & 인터랙티브 영역 */}
          {points.map((p, i) => {
            const isSelected = p.date === selectedDate;
            const isHovered = hoveredIndex === i;
            const nodeColor = getVelocityColor(p.velocity);
            return (
              <g key={i}>
                {/* 마우스 가이드 수직 점선 */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartHeight}
                    stroke="#ea580c"
                    strokeWidth="1.5"
                    strokeDasharray="3"
                  />
                )}
                {/* 포인트 원형 테두리 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? "8.5" : (isHovered ? "7" : "5")}
                  fill={nodeColor}
                  stroke={isSelected ? "#1e293b" : "#ffffff"}
                  strokeWidth={isSelected ? "3" : "2"}
                  style={{ transition: "r 0.15s ease, stroke-width 0.15s ease", cursor: "pointer" }}
                />
                {/* 클릭 및 호버 감지용 큰 투명 원 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="18"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectPoint(p.date)}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML 툴팁 오버레이 */}
        {hoveredIndex !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${Math.min(width - 150, Math.max(10, points[hoveredIndex].x - 60))}px`,
              top: `${Math.max(10, points[hoveredIndex].y - 55)}px`
            }}
          >
            <div className="tooltip-date">{points[hoveredIndex].date}</div>
            <div className="tooltip-score">
              가속도: <strong style={{ color: getVelocityColor(points[hoveredIndex].velocity) }}>
                {points[hoveredIndex].velocity > 0 ? `+${points[hoveredIndex].velocity}` : points[hoveredIndex].velocity} pt/day
              </strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              누적 위험: {points[hoveredIndex].score}점
            </div>
          </div>
        )}
      </div>
      <div className="trend-x-labels" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{chartData[0].date}</span>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>(단위: pt/day)</span>
        <span>{chartData[chartData.length - 1].date}</span>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // 아코디언 상태 관리 (날짜 string을 key로 하고 boolean 값을 value로 지정)
  const [expandedDays, setExpandedDays] = useState({});

  // 무한스크롤 관련 상태
  const [visibleCount, setVisibleCount] = useState(3);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      import("../../data.json")
        .then((module) => {
          const list = module.default;
          setData(list);
          if (list && list.length > 0) {
            setSelectedDate(list[0].reportDate);
          }
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
        if (json && json.length > 0) {
          setSelectedDate(json[0].reportDate);
        }
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

  // 어제 데이터와 위험도 차이 구하기
  const yesterdayData = pastData[0];
  const yesterdayScore = yesterdayData ? yesterdayData.jobRiskScore : null;
  const scoreDiff = yesterdayScore !== null ? (todayData.jobRiskScore - yesterdayScore) : null;
  const scoreDiffSign = scoreDiff !== null ? (scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`) : "";

  // 꺾은선 차트 클릭 연동 날짜 분석
  const selectedReport = dataArray.find((d) => d.reportDate === selectedDate) || todayData;
  const selectedReportIndex = dataArray.findIndex((d) => d.reportDate === selectedDate);
  const selectedYesterday = selectedReportIndex !== -1 && selectedReportIndex < dataArray.length - 1 ? dataArray[selectedReportIndex + 1] : null;
  const selectedDiff = selectedYesterday !== null ? (selectedReport.jobRiskScore - selectedYesterday.jobRiskScore) : null;
  const selectedDiffSign = selectedDiff !== null ? (selectedDiff >= 0 ? `+${selectedDiff}` : `${selectedDiff}`) : "";

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
      </header>

      <main>
        {/* 신규: 일자리 위험도 및 종합 AI 지수 보드 */}
        <div className="dashboard-grid">
          <section className="dashboard-card gauge-card-section">
            <h2 className="section-title-sub">오늘의 AI 일자리 영향 분석 (누적 수치 &amp; 변화 가속도)</h2>
            <div className="gauge-layout">
              <div className="gauge-left-col">
                <GaugeChart score={todayData.cumulativeRiskScore || todayData.jobRiskScore || 75} />

                {/* 오늘의 가속도 하이라이트 배지 */}
                {(() => {
                  const velocityInfo = getVelocityBadge(todayData.dailyVelocity);
                  return (
                    <div className="velocity-badge-card" style={{ backgroundColor: velocityInfo.bg, borderColor: velocityInfo.color }}>
                      <span className="velocity-title">🚀 오늘의 위험 가속도</span>
                      <div className="velocity-val-row">
                        <strong className="velocity-num" style={{ color: velocityInfo.color }}>{velocityInfo.sign}</strong>
                        <span className="velocity-tag" style={{ backgroundColor: velocityInfo.color }}>{velocityInfo.label}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="gauge-description">
                <div className="scores-explanation-box">
                  <div className="score-explain-item">
                    <span className="score-explain-title">📊 누적 일자리 영향 지수: <strong className="risk-score-text">{todayData.cumulativeRiskScore || todayData.jobRiskScore || 75} / 100</strong></span>
                    <p className="score-explain-desc">→ AI 기술 발전에 따라 축적되는 일자리 대체 위험 수준 (지속 상승/유지)</p>
                  </div>
                  <div className="score-explain-item">
                    <span className="score-explain-title">⚡ 오늘의 변화 가속도: <strong className="velocity-score-text">{(todayData.dailyVelocity >= 0 ? "+" : "") + (todayData.dailyVelocity ?? 1.2).toFixed(1)} pt/day</strong></span>
                    <p className="score-explain-desc">→ 오늘 뉴스가 위험 축적 속도를 얼마나 더 가속시켰는지 지표화</p>
                  </div>
                  <div className="score-explain-item">
                    <span className="score-explain-title">📈 종합 AI 지수: <strong className="summary-score-text">{todayData.summaryScore || 50} / 100</strong></span>
                    <p className="score-explain-desc">→ 오늘의 AI 산업·기술·시장 이슈의 전반적 영향력</p>
                  </div>
                </div>

                {todayData.velocityReason && (
                  <div className="velocity-reason-box">
                    💡 <strong>오늘의 가속 원인:</strong> {todayData.velocityReason}
                  </div>
                )}

                <div className="guideline-tip">
                  💡 <strong>이원화 지표 가이드:</strong> AI 기술은 후퇴하지 않으므로 '누적 위험 지수'는 억지로 감점되지 않고 유지되며, 대시보드의 유연성은 '오늘의 가속도'로 실시간 포착합니다.
                </div>
              </div>
            </div>
          </section>

          {pastData.length > 0 && (
            <section className="dashboard-card trend-card-section">
              <TrendChart historyData={dataArray} selectedDate={selectedDate} onSelectPoint={setSelectedDate} />

              {/* 신규: 꺾은선 클릭 연동 날짜 상세 카드 */}
              {selectedReport && (
                <div className="trend-detail-box">
                  <div className="detail-header">
                    <h4>📅 {selectedReport.reportDate} 상세 위험 근거</h4>
                    {selectedReport.dailyVelocity !== undefined && (
                      <span className="detail-velocity-badge">
                        가속도: {(selectedReport.dailyVelocity >= 0 ? "+" : "") + selectedReport.dailyVelocity.toFixed(1)} pt/day
                      </span>
                    )}
                  </div>
                  <div className="detail-scores">
                    <div className="detail-score-item">
                      <span>누적 일자리 위험:</span> <strong>{selectedReport.cumulativeRiskScore || selectedReport.jobRiskScore}점</strong>
                    </div>
                    <div className="detail-score-item">
                      <span>변화 가속도:</span> <strong>{(selectedReport.dailyVelocity >= 0 ? "+" : "") + (selectedReport.dailyVelocity ?? 1.0).toFixed(1)} pt/day</strong>
                    </div>
                    <div className="detail-score-item">
                      <span>종합 AI 지수:</span> <strong>{selectedReport.summaryScore || 50}점</strong>
                    </div>
                  </div>
                  {selectedReport.riskScoreBreakdown && selectedReport.riskScoreBreakdown.length > 0 ? (
                    <div className="detail-causes">
                      <h5>주요 영향 요인 (클릭 시 원문 이동)</h5>
                      <ul className="detail-causes-list">
                        {selectedReport.riskScoreBreakdown.map((item, idx) => {
                          const matchedNews = item.newsIndex && selectedReport.news ? selectedReport.news[item.newsIndex - 1] : null;
                          const factorContent = (
                            <>
                              <span className="factor-sign">{item.sign === "+" ? "▲" : "▼"}</span>
                              <span className="factor-event">{item.event}</span>
                              <span className="factor-impact">({item.sign === "+" ? "+" : "-"}{item.impact})</span>
                            </>
                          );
                          return matchedNews ? (
                            <li key={idx} className={item.sign === "+" ? "risk-up clickable-factor" : "risk-down clickable-factor"}>
                              <a href={matchedNews.link} target="_blank" rel="noopener noreferrer" className="factor-link-wrapper">
                                {factorContent} <span className="link-arrow">🔗</span>
                              </a>
                            </li>
                          ) : (
                            <li key={idx} className={item.sign === "+" ? "risk-up" : "risk-down"}>
                              {factorContent}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-breakdown-text">해당 날짜의 상세 변동 요인 데이터가 없습니다.</p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* 신규: 오늘의 핵심 변화 카드 영역 */}
        <section className="dashboard-card key-changes-section">
          <h2 className="section-title-sub-large">오늘의 핵심 변화</h2>
          {todayData.riskScoreBreakdown && todayData.riskScoreBreakdown.length > 0 ? (
            <div className="key-changes-grid">
              {todayData.riskScoreBreakdown.map((item, idx) => {
                const matchedNews = item.newsIndex ? todayData.news[item.newsIndex - 1] : null;
                const impactText = item.impact >= 7 ? "높음 🔴" : item.impact >= 4 ? "중간 🟡" : "낮음 🟢";
                const impactClass = item.impact >= 7 ? "impact-high" : item.impact >= 4 ? "impact-medium" : "impact-low";

                const cardInner = (
                  <div className={`key-change-card ${matchedNews ? "is-link" : ""}`}>
                    <div className="card-top">
                      <span className="card-num">0{idx + 1}</span>
                      <span className={`card-impact-badge ${item.sign === "+" ? "badge-up" : "badge-down"}`}>
                        위험도 {item.sign === "+" ? "+" : "-"}{item.impact}
                      </span>
                    </div>
                    <h3 className="card-title">{item.event}</h3>
                    <div className="card-footer-info">
                      <div className="card-impact-level">
                        <span>일자리 영향도:</span> <strong className={impactClass}>{impactText}</strong>
                      </div>
                      {matchedNews && <span className="read-news-link">🔗 원문 기사 확인</span>}
                    </div>
                  </div>
                );

                return matchedNews ? (
                  <a href={matchedNews.link} target="_blank" rel="noopener noreferrer" className="key-change-card-wrapper" key={idx}>
                    {cardInner}
                  </a>
                ) : (
                  <div className="key-change-card-wrapper" key={idx}>
                    {cardInner}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-changes-text">오늘의 주요 변동 요인 분석이 제공되지 않았습니다.</p>
          )}
        </section>

        <div className="section-group today-group">
          <section className="summary-section">
            <div className="summary-header">
              <h2>오늘의 요약</h2>
              {todayData.summaryScore !== undefined && (
                <div className="summary-score-badge">
                  종합 점수 <span>{todayData.summaryScore}</span>점
                </div>
              )}
            </div>
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
                    {item.importance !== undefined && (
                      <div className="news-metrics">
                        <div className="metric-row">
                          <span className="metric-label">중요도</span>
                          <span className="metric-stars">{renderStars(item.importance)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">AI 영향도</span>
                          <span className="metric-stars">{renderStars(item.aiImpact)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">자동화 가능성</span>
                          <span className="metric-stars">{renderStars(item.automationPotential)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">투자 영향</span>
                          <span className="metric-stars">{renderStars(item.investmentImpact)}</span>
                        </div>
                      </div>
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
                      {past.summaryScore !== undefined && (
                        <span className="past-summary-score-badge">
                          종합 {past.summaryScore}점
                        </span>
                      )}
                      <span className="job-risk-badge" style={{ backgroundColor: getRiskColor(past.cumulativeRiskScore || past.jobRiskScore || 75) }}>
                        누적위험 {past.cumulativeRiskScore || past.jobRiskScore || 75}점
                      </span>
                      {past.dailyVelocity !== undefined && (
                        <span className="velocity-mini-badge">
                          가속도 {(past.dailyVelocity >= 0 ? "+" : "") + past.dailyVelocity.toFixed(1)}pt
                        </span>
                      )}
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
                                {item.importance !== undefined && (
                                  <div className="news-metrics">
                                    <div className="metric-row">
                                      <span className="metric-label">중요도</span>
                                      <span className="metric-stars">{renderStars(item.importance)}</span>
                                    </div>
                                    <div className="metric-row">
                                      <span className="metric-label">AI 영향도</span>
                                      <span className="metric-stars">{renderStars(item.aiImpact)}</span>
                                    </div>
                                    <div className="metric-row">
                                      <span className="metric-label">자동화 가능성</span>
                                      <span className="metric-stars">{renderStars(item.automationPotential)}</span>
                                    </div>
                                    <div className="metric-row">
                                      <span className="metric-label">투자 영향</span>
                                      <span className="metric-stars">{renderStars(item.investmentImpact)}</span>
                                    </div>
                                  </div>
                                )}
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
