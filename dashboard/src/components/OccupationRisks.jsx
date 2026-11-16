import PropTypes from "prop-types";

export default function OccupationRisks({ risks, analysis }) {
  return (
    <section className="dashboard-card occupation-section" id="occupation-risks">
      <h2 className="section-title-sub-large">직업별 AI 대체 위험 추적</h2>
      {analysis && (
        <div className="occupation-analysis-meta">
          <time className="occupation-date-badge" dateTime={analysis.endDate}>{analysis.endDate}</time>
          <span>분석 기사 {analysis.articleCount}개</span>
        </div>
      )}
      <p className="occupation-note">뉴스 기반 관측 기록 · 직업 전체의 소멸을 의미하지 않음</p>
      {!analysis && !risks.length ? (
        <p className="no-changes-text">이 날짜에는 직업별 분석이 제공되지 않았습니다.</p>
      ) : !risks.length ? (
        <p className="no-changes-text">아직 누적된 직업별 관측 기록이 없습니다.</p>
      ) : (
        <div className="occupation-grid">
          {risks.map((item) => (
            <article className="occupation-card" key={item.id}>
              <div className="occupation-heading">
                <h3>{item.occupation}</h3>
                <span className="occupation-stage">{item.stage}</span>
              </div>
              <p className="occupation-period">
                근거 기사 {item.evidence.length}개 · 최근 근거 {item.lastEvidenceDate}
              </p>
              <ul className="occupation-task-list" aria-label="영향받는 업무">
                {item.tasks.map((task, index) => <li key={`${task}-${index}`}>{task}</li>)}
              </ul>
              <details className="compact-disclosure">
                <summary>선정 이유</summary>
                <p>{item.reason}</p>
              </details>
              <details>
                <summary>근거 기사 보기</summary>
                <ul className="occupation-sources" aria-label="근거 기사">
                {item.evidence.map((source) => (
                  <li key={source.link}>
                    <a href={source.link} target="_blank" rel="noopener noreferrer">{source.title}</a>
                    <span> · {source.reportDate}</span>
                  </li>
                ))}
              </ul>
              </details>
              <details>
                <summary>관측 이력 {item.observations.length}건</summary>
                <ul className="occupation-sources">
                  {[...item.observations].reverse().map((observation) => (
                    <li key={observation.date}>
                      <div className="occupation-observation-meta">
                        <time className="occupation-date-badge" dateTime={observation.date}>{observation.date}</time>
                        <span className="occupation-stage">{observation.stage}</span>
                      </div>
                      <p>{observation.reason}</p>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

OccupationRisks.propTypes = {
  analysis: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    articleCount: PropTypes.number.isRequired,
  }),
  risks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstObserved: PropTypes.string.isRequired,
    lastObserved: PropTypes.string.isRequired,
    lastEvidenceDate: PropTypes.string.isRequired,
    observations: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string.isRequired,
      stage: PropTypes.string.isRequired,
      reason: PropTypes.string.isRequired,
    })).isRequired,
    occupation: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.string).isRequired,
    reason: PropTypes.string.isRequired,
    stage: PropTypes.string.isRequired,
    evidence: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      reportDate: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};
