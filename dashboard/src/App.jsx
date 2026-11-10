import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./App.css";
import { reportRepository } from "./services/reportRepository";
import OccupationRisks from "./components/OccupationRisks";
import { getRiskChange, formatRiskChange } from "./services/riskMetrics";

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

// 전날 대비 실제 위험 지수 증감에 따른 배지 표시
function getVelocityBadge(change) {
  const sign = formatRiskChange(change);
  if (change === null) return { label: "비교 불가", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", sign };
  if (change > 0) return { label: "상승", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", sign };
  if (change < 0) return { label: "하락", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", sign };
  return { label: "유지", color: "#eab308", bg: "rgba(234, 179, 8, 0.12)", sign };
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

        {/* 뒷배경 가이드 원호 (테마 변수 연동) */}
        <path
          d="M 25 110 A 85 85 0 0 1 195 110"
          fill="none"
          stroke="var(--gauge-track, #e2e8f0)"
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

        {/* 침/바늘 (Needle - 테마 변수 연동) */}
        <g transform="translate(110, 110)">
          <polygon
            points="-4,0 0,-85 4,0"
            fill="var(--needle-color, #1e293b)"
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0px 0px",
              transition: "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          />
          <circle cx="0" cy="0" r="10" fill="var(--needle-color, #1e293b)" />
          <circle cx="0" cy="0" r="4" fill="var(--needle-center, #ffffff)" />
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

GaugeChart.propTypes = {
  score: PropTypes.number.isRequired,
};

// 기존 별 기호 유지 및 채운 별과 빈 별의 대비 강화
function renderStars(score) {
  const cleanScore = Math.max(0, Math.min(5, Math.round(score ?? 3)));
  return Array.from({ length: 5 }, (_, index) => (
    <span
      className={index < cleanScore ? "star-filled" : "star-empty"}
      key={index}
    >
      {index < cleanScore ? "★" : "☆"}
    </span>
  ));
}

function renderSummary(summary) {
  const items = String(summary ?? "")
    .split(/\n+/)
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  return (
    <ul className="summary-list">
      {items.map((item, index) => {
        const separatorIndex = item.indexOf(":");
        const firstSentenceEnd = item.indexOf(".");

        if (separatorIndex > 0) {
          return (
            <li key={index}>
              <strong>{item.slice(0, separatorIndex + 1)}</strong>{" "}
              {item.slice(separatorIndex + 1).trim()}
            </li>
          );
        }

        if (firstSentenceEnd >= 0) {
          return (
            <li key={index}>
              <strong>{item.slice(0, firstSentenceEnd + 1)}</strong>{" "}
              {item.slice(firstSentenceEnd + 1).trim()}
            </li>
          );
        }

        return <li key={index}><strong>{item}</strong></li>;
      })}
    </ul>
  );
}

function formatChartDate(reportDate) {
  const match = String(reportDate ?? "").match(/\d{4}\D+(\d{1,2})\D+(\d{1,2})/);
  return match
    ? `${match[1].padStart(2, "0")}.${match[2].padStart(2, "0")}`
    : reportDate;
}

// 전날 대비 일자리 대체 위험 지수 증감 추이 표시
function TrendChart({ historyData, selectedDate, onSelectPoint }) {
  // 최신 30개 일별 리포트를 날짜 오름차순으로 표시
  const chartData = historyData.slice(0, 30)
    .map((report) => ({ ...report, dailyVelocity: getRiskChange(report, historyData) }))
    .filter((report) => report.dailyVelocity !== null).reverse();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (chartData.length === 0) return <p className="no-changes-text">전날과 비교할 수 있는 위험 변화 자료가 없습니다.</p>;

  const width = 500;
  const height = 145;
  const paddingLeft = 58;
  const paddingRight = 18;
  const paddingTop = 20;
  const paddingBottom = 16;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // 실제 데이터의 가속도 최소/최대 수치 기반 동적 Y축 스케일링
  const velocities = chartData.map((d) => (typeof d.dailyVelocity === "number" ? d.dailyVelocity : 1.0));
  const rawMin = Math.min(...velocities);
  const rawMax = Math.max(...velocities);

  // 상하단여백을 최소화하여 가속도 파동이 차트 전체를 채우도록 설정
  const minVel = Math.min(-0.1, Math.floor((rawMin - 0.1) * 10) / 10);
  const maxVel = Math.max(0.1, Math.ceil((rawMax + 0.1) * 10) / 10);
  const velRange = maxVel - minVel || 1;
  const midVel = Math.round(((maxVel + minVel) / 2) * 10) / 10;

  // 0.0 baseline Y 좌표 연산
  const zeroY = paddingTop + chartHeight - ((0 - minVel) / velRange) * chartHeight;
  const midY = paddingTop + chartHeight - ((midVel - minVel) / velRange) * chartHeight;

  // 데이터 좌표 매핑
  const points = chartData.map((d, i) => {
    const x = paddingLeft + (chartData.length === 1 ? chartWidth / 2 : (i * chartWidth) / (chartData.length - 1));
    const vel = typeof d.dailyVelocity === "number" ? d.dailyVelocity : 1.0;
    const clampedVel = Math.max(minVel, Math.min(maxVel, vel));
    const y = paddingTop + chartHeight - ((clampedVel - minVel) / velRange) * chartHeight;
    return {
      x,
      y,
      date: d.reportDate,
      dateLabel: formatChartDate(d.reportDate),
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

  // 위험 변화 방향별 포인트 색상 추출
  const getVelocityColor = (v) => {
    if (v > 0) return "#f97316"; // 상승
    if (v < 0) return "#10b981"; // 하락
    return "#94a3b8"; // 유지
  };

  return (
    <div className="trend-chart-container">
      <div style={{ marginBottom: '0.2rem' }}>
        <h3 className="section-title-sub" style={{ margin: 0, fontSize: '0.98rem' }}>일자리 대체 위험 변화 추이 · 최근 30개 리포트</h3>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.35rem 0', lineHeight: '1.3' }}>
        전날 대비 일자리 대체 위험 지수의 증감량입니다.
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
          <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="var(--grid-line, #e2e8f0)" strokeDasharray="3" />
          {midVel !== 0 && midY > paddingTop + 15 && midY < paddingTop + chartHeight - 15 && (
            <line x1={paddingLeft} y1={midY} x2={width - paddingRight} y2={midY} stroke="var(--grid-line-sub, #f1f5f9)" strokeDasharray="2" />
          )}
          {zeroY >= paddingTop && zeroY <= paddingTop + chartHeight && (
            <line x1={paddingLeft} y1={zeroY} x2={width - paddingRight} y2={zeroY} stroke="var(--border-alt, #94a3b8)" strokeDasharray="4" strokeWidth="1.5" />
          )}
          <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />

          {/* Y축 선명하고 크기가 강조된 라벨 표시 */}
          <text x={paddingLeft - 10} y={paddingTop + 5} textAnchor="end" fontSize="16" fill="#dc2626" fontWeight="800">
            {maxVel > 0 ? `+${maxVel.toFixed(1)}` : maxVel.toFixed(1)}
          </text>
          {zeroY >= paddingTop + 20 && zeroY <= paddingTop + chartHeight - 20 && (
            <text x={paddingLeft - 10} y={zeroY + 5} textAnchor="end" fontSize="16" fill="var(--axis-text, #334155)" fontWeight="800">0.0</text>
          )}
          <text x={paddingLeft - 10} y={paddingTop + chartHeight + 5} textAnchor="end" fontSize="16" fill={minVel < 0 ? "#059669" : "var(--text-muted, #64748b)"} fontWeight="800">
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
                  stroke={isSelected ? "var(--text-main, #1e293b)" : "var(--card-bg, #ffffff)"}
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
              left: `clamp(8px, calc(${(points[hoveredIndex].x / width) * 100}% - 90px), max(8px, calc(100% - 188px)))`,
              top: "4px"
            }}
          >
            <div className="tooltip-date">{points[hoveredIndex].dateLabel}</div>
            <div className="tooltip-score">
              위험 변화: <strong style={{ color: getVelocityColor(points[hoveredIndex].velocity) }}>
                {formatRiskChange(points[hoveredIndex].velocity)}
              </strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              대체 위험 지수: {points[hoveredIndex].score}점
            </div>
          </div>
        )}
      </div>
      <div className="trend-x-labels" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{formatChartDate(chartData[0].reportDate)}</span>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>(전날 대비 · 점)</span>
        <span>{formatChartDate(chartData[chartData.length - 1].reportDate)}</span>
      </div>
    </div>
  );
}

TrendChart.propTypes = {
  historyData: PropTypes.arrayOf(
    PropTypes.shape({
      reportDate: PropTypes.string.isRequired,
      dailyVelocity: PropTypes.number,
      cumulativeRiskScore: PropTypes.number,
      jobRiskScore: PropTypes.number,
      velocityReason: PropTypes.string,
    }),
  ).isRequired,
  selectedDate: PropTypes.string,
  onSelectPoint: PropTypes.func.isRequired,
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [occupationTracking, setOccupationTracking] = useState([]);

  // 테마 상태 관리 (localStorage 저장값 우선 조회, 없을 시 다크 모드를 기본값으로 적용)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("newsai-theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  // 테마 변경 시 HTML data-theme 속성 및 localStorage 동기화
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("newsai-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // 아코디언 상태 관리 (날짜 string을 key로 하고 boolean 값을 value로 지정)
  const [expandedDays, setExpandedDays] = useState({});

  // 무한스크롤 관련 상태
  const [visibleCount, setVisibleCount] = useState(3);
  const loaderRef = useRef(null);

  useEffect(() => {
    Promise.all([reportRepository.list(), reportRepository.listOccupations()])
      .then(async ([reports, occupations]) => {
        if (reports.length === 0) throw new Error("저장된 리포트가 없습니다.");

        const currentReport = await reportRepository.getById(
          reports[0].id,
          reports[0],
        );
        setData([{ ...reports[0], ...currentReport }, ...reports.slice(1)]);
        setSelectedDate(currentReport.reportDate);
        setOccupationTracking(occupations);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          "리포트 아카이브를 불러오지 못했습니다. 데이터 마이그레이션을 먼저 실행해주세요.",
        );
        setLoading(false);
      });
  }, []);

  // 화면에 노출될 과거 리포트 본문을 날짜별 JSON에서 지연 로드
  useEffect(() => {
    if (!data || loading || error) return;
    const missingReports = data
      .slice(1, visibleCount + 1)
      .filter((report) => !Array.isArray(report.news));
    if (missingReports.length === 0) return;

    let cancelled = false;
    Promise.all(
      missingReports.map(async (metadata) => ({
        id: metadata.id,
        report: await reportRepository.getById(metadata.id, metadata),
      })),
    )
      .then((loadedReports) => {
        if (cancelled) return;
        const loadedById = new Map(
          loadedReports.map(({ id, report }) => [id, report]),
        );
        setData((current) =>
          current.map((report) =>
            loadedById.has(report.id)
              ? { ...report, ...loadedById.get(report.id) }
              : report,
          ),
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [data, error, loading, visibleCount]);

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

  // 꺾은선 차트 클릭 연동 날짜 분석
  const selectedReport = dataArray.find((d) => d.reportDate === selectedDate) || todayData;
  const todayChange = getRiskChange(todayData, dataArray);
  const selectedChange = getRiskChange(selectedReport, dataArray);

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
        <div className="header-top-bar">
          <div className="logo">NewSai 🤖</div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            <span className="theme-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="theme-text">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
        <h1>AI 데일리 리포트</h1>
        <p className="date">
          발행일: <span id="report-date">{todayData.reportDate}</span>
        </p>
      </header>

      <main>
        {/* 신규: 일자리 위험도 및 종합 AI 지수 보드 */}
        <div className="dashboard-grid">
          <section className="dashboard-card gauge-card-section">
            <h2 className="section-title-sub">일자리 대체 위험 지수 · 오늘의 위험 변화</h2>
            <div className="gauge-layout">
              <div className="gauge-left-col">
                <GaugeChart score={todayData.cumulativeRiskScore ?? todayData.jobRiskScore ?? 50} />

                {/* 오늘의 위험 변화 배지 */}
                {(() => {
                  const velocityInfo = getVelocityBadge(todayChange);
                  return (
                    <div className="velocity-badge-card" style={{ backgroundColor: velocityInfo.bg, borderColor: velocityInfo.color }}>
                      <span className="velocity-title">오늘의 위험 변화</span>
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
                    <span className="score-explain-title">📊 일자리 대체 위험 지수: <strong className="risk-score-text">{todayData.cumulativeRiskScore ?? todayData.jobRiskScore ?? 50} / 100</strong></span>
                    <p className="score-explain-desc">→ 뉴스 기반 자체 지수로 추적한 대체 위험 수준이며, 일자리 대체 비율을 의미하지 않습니다.</p>
                  </div>
                  <div className="score-explain-item">
                    <span className="score-explain-title">⚡ 오늘의 위험 변화: <strong className="velocity-score-text">{formatRiskChange(todayChange)}</strong></span>
                    <p className="score-explain-desc">→ 오늘 위험 지수에서 전날 위험 지수를 뺀 실제 증감량</p>
                  </div>
                  <div className="score-explain-item">
                    <span className="score-explain-title">📈 종합 AI 지수: <strong className="summary-score-text">{todayData.summaryScore || 50} / 100</strong></span>
                    <p className="score-explain-desc">→ 오늘의 AI 산업·기술·시장 이슈의 전반적 영향력</p>
                  </div>
                </div>

                {todayData.velocityReason && (
                  <div className="velocity-reason-box">
                    💡 <strong>오늘의 평가 근거:</strong> {todayData.velocityReason}
                  </div>
                )}

                <div className="guideline-tip">
                  💡 <strong>지표 안내:</strong> 일자리 대체 위험 지수는 뉴스 기반 실험용 지수입니다. 오늘의 위험 변화는 전날 대비 증감이며, 상승·유지·하락할 수 있습니다. 100점이 모든 일자리의 소멸을 뜻하지 않습니다.
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
                        위험 변화: {formatRiskChange(selectedChange)}
                      </span>
                    )}
                  </div>
                  <div className="detail-scores">
                    <div className="detail-score-item">
                      <span>일자리 대체 위험 지수:</span> <strong>{selectedReport.cumulativeRiskScore ?? selectedReport.jobRiskScore}점</strong>
                    </div>
                    <div className="detail-score-item">
                      <span>위험 변화:</span> <strong>{formatRiskChange(selectedChange)}</strong>
                    </div>
                    <div className="detail-score-item">
                      <span>종합 AI 지수:</span> <strong>{selectedReport.summaryScore || 50}점</strong>
                    </div>
                  </div>
                  {selectedReport.riskScoreBreakdown && selectedReport.riskScoreBreakdown.length > 0 ? (
                    <div className="detail-causes">
                      <h5>주요 영향 요인 (클릭 시 원문 이동)</h5>
                      <p className="occupation-note">강도는 사건별 LLM 평가(1~10)이며, 위험 변화나 종합 AI 지수의 합산 점수가 아닙니다.</p>
                      <ul className="detail-causes-list">
                        {selectedReport.riskScoreBreakdown.map((item, idx) => {
                          const matchedNews = item.newsIndex && selectedReport.news ? selectedReport.news[item.newsIndex - 1] : null;
                          const factorContent = (
                            <>
                              <span className="factor-sign">{item.sign === "+" ? "▲" : "▼"}</span>
                              <span className="factor-event">{item.event}</span>
                              <span className="factor-impact">{item.sign === "+" ? "상승" : "완화"} · 강도 {item.impact}/10</span>
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
                        {item.sign === "+" ? "상승" : "완화"} 요인 · 강도 {item.impact}/10
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

        <OccupationRisks risks={occupationTracking} analysis={todayData.occupationAnalysis} />

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
            <div className="summary-content">{renderSummary(todayData.summary)}</div>
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
              // 지난 리포트는 기본 접힘 상태로 표시
              const isExpanded = expandedDays[past.reportDate] !== undefined
                ? expandedDays[past.reportDate]
                : false;

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
                      <span className="job-risk-badge" style={{ backgroundColor: (past.cumulativeRiskScore ?? past.jobRiskScore) == null ? "#64748b" : getRiskColor(past.cumulativeRiskScore ?? past.jobRiskScore) }}>
                        대체 위험 {(past.cumulativeRiskScore ?? past.jobRiskScore) == null ? "자료 없음" : `${past.cumulativeRiskScore ?? past.jobRiskScore}점`}
                      </span>
                      {past.dailyVelocity !== undefined && (
                        <span className="velocity-mini-badge">
                          위험 변화 {formatRiskChange(getRiskChange(past, dataArray))}
                        </span>
                      )}
                      <span className="accordion-arrow">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="past-day-content">
                      <section className="summary-section past-summary-section">
                        <h4 className="sub-title">지난 뉴스 요약</h4>
                        <div className="summary-content past-summary-content">{renderSummary(past.summary)}</div>
                      </section>

                      <section className="news-section past-news-section">
                        <h4 className="sub-title">지난 뉴스 목록 &amp; 요약</h4>
                        <div className="news-list">
                          {Array.isArray(past.news) && past.news.length > 0 ? past.news.map((item, nIdx) => (
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
                          )) : Array.isArray(past.news) ? (
                            <p className="no-changes-text">
                              이 날짜의 기사 상세 데이터는 보관되어 있지 않습니다.
                            </p>
                          ) : (
                            <div className="scroll-loader">
                              <span className="spinner"></span> 리포트 내용을 불러오는 중...
                            </div>
                          )}
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
